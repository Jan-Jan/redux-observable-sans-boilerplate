import { ActionsObservable, combineEpics } from 'redux-observable'
import { TestScheduler } from 'rxjs/testing'
import { toArray } from 'rxjs/operators'
import { Subject } from 'rxjs'

import socketEpics from '../socket-epics'


describe('socketEpic', () => {

    const me = { token: 'key', name: 'AB Normal', userId: '3f43f' }
    const state$ = { value: { me } };
    let subject
    let action$
    let emittedActions
    let socketEvents
    const socket = {
        emit: (type, msg) => socketEvents.push([type, msg])
    }

    const commandAction = {
        type: 'COMMAND',
        payload: {
            type: 'doSomething',
            data: 'whatevs'
        }
    }

    const queryAction = {
        type: 'QUERY',
        payload: {
            type: 'getSomething',
            payload: 'whatevs'
        }
    }

    beforeEach(() => {
        subject = new Subject()
        action$ = new ActionsObservable(subject)
        emittedActions = []
        socketEvents = []
    })

    it('should return action and emit command event', () => {

        const result$ = combineEpics(...socketEpics(socket))(action$, state$)
        const pushAction = emittedAction => emittedActions.push(emittedAction)
        result$.subscribe(pushAction)

        subject.next(commandAction)
        subject.next(queryAction)

        expect(emittedActions).toEqual([
            { ...commandAction.payload, type: 'DO_SOMETHING' },
            { ...queryAction.payload, type: 'GET_SOMETHING' },
        ])

        expect(socketEvents).toEqual([
            ['command', { ...commandAction.payload, type: 'doSomething' }],
            ['query', { ...queryAction.payload, type: 'getSomething' }],
        ])
    })

    it('should add token only to socket msg', () => {

        const auth = state$ => ({ token: state$.value.me.token, userId: state$.value.me.userId })

        const result$ = combineEpics(...socketEpics(socket, auth))(action$, state$)
        const pushAction = emittedAction => emittedActions.push(emittedAction)
        result$.subscribe(pushAction)

        subject.next(commandAction)
        subject.next(queryAction)

        expect(emittedActions).toEqual([
            { ...commandAction.payload, type: 'DO_SOMETHING' },
            { ...queryAction.payload, type: 'GET_SOMETHING' },
        ])

        expect(socketEvents).toEqual([
            ['command', { ...commandAction.payload, type: 'doSomething', token: me.token, userId: me.userId }],
            ['query', { ...queryAction.payload, type: 'getSomething', token: me.token, userId: me.userId }],
        ])
    })
})
