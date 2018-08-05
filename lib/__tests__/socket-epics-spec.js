import { ActionsObservable, combineEpics } from 'redux-observable'
import { TestScheduler } from 'rxjs/testing'
import { toArray } from 'rxjs/operators'
import { Subject } from 'rxjs'

import {
    commandEpic,
    queryEpic,
} from '../socket-epics'
import socketEpics from '../socket-epics'


describe('commandEpic', () => {

    it('should return action and emit command event', () => {

        const store = { I: 'am', a: 'store' };
        const subject = new Subject()
        const actions = new ActionsObservable(subject)
        const emittedActions = []
        const socketEvents = []
        const socket = {
            emit: (type, msg) => socketEvents.push([type, msg])
        }

        const result = combineEpics(commandEpic(socket))(actions, store)
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

        subject.next(commandAction)

        expect(emittedActions).toEqual([
            { ...commandAction.payload, type: 'DO_SOMETHING' },
        ])

        expect(socketEvents).toEqual([
            ['command', { type: 'doSomething', data: commandAction.payload.data }],
        ])
    })
})

/*
it('marbles', () => {

    const testScheduler = new TestScheduler((actual, expected) => {
        // somehow assert the two objects are equal
        // e.g. with chai `expect(actual).deep.equal(expected)`
        expect(actual).toEqual(expected)
    })

    testScheduler.run(({ hot, cold, expectObservable }) => {
        const a = {
            type: 'COMMAND',
            payload: {
                type: 'doSomething',
                data: 'whatevs'
            }
        }
    
        const action$ = hot('-a', { a });
        const state$ = null;
    
        let socketEvents = []
    
        const socket = {
            emit: msg => socketEvents.push(msg)
        }
      
        const output$ = commandEpic(socket)(action$, state$);
      
        expectObservable(output$).toBe('--e', {
          e: {
            type: 'DO_SOMETHING',
            payload: a.payload.data,
          }
        })
    })    
})
*/

/*
it('should pass', async () => {

    expect(true).toEqual(true)

    const socketEvents = []

    const socket = {
        emit: msg => socketEvents.push(msg)
    }

    const action = {
        type: 'COMMAND',
        payload: {
            type: 'doSomething',
            data: 'whatevs'
        }
    }

    const action$ = ActionsObservable.of(action)

    const epic$ = commandEpic(socket)(action$)

    //const actual = await epic$.pipe(toArray(), toPromise())

    const actual = await epic$
    console.log(actual)

    expect(actual).toEqual({
        type: 'DO_SOMETHING',
        payload: action.payload.data
    })

    expect(socketEvents).toEqual([
        {
            command: 'doSomething',
            data: action.payload.data
        }
    ])
})
*/