import { ActionsObservable, combineEpics } from 'redux-observable'
import { TestScheduler } from 'rxjs/testing'
import { toArray } from 'rxjs/operators'
import { Subject } from 'rxjs'

import socketEpics from '../socket-epics'


describe('socketEpic', () => {

    it('should return action and emit command event', () => {

        const state$ = { I: 'am', a: 'store' };
        const subject = new Subject()
        const action$ = new ActionsObservable(subject)
        const emittedActions = []
        const socketEvents = []
        const socket = {
            emit: (type, msg) => socketEvents.push([type, msg])
        }

        const result = combineEpics(...socketEpics(socket))(action$, state$)
        result.subscribe(
            emittedAction => {
                emittedActions.push(emittedAction)
            }
        )

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
})
