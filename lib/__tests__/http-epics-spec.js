import { ActionsObservable } from 'redux-observable'
import { Subject } from 'rxjs'

import { jsonEpic } from '../http-epics'
import fetchMock from 'fetch-mock/es5/client'


describe('jsonEpic', () => {

    const me = { token: 'key', name: 'AB Normal', userId: '3f43f' }
    const state$ = { value: { me } };
    let subject
    let action$
    let emittedActions
    const pushAction = emittedAction => emittedActions.push(emittedAction)

    beforeEach(() => {
        subject = new Subject()
        action$ = new ActionsObservable(subject)
        emittedActions = []
    })

    it('should emit actions', () => {

        const url = `localhost:3000`

        const result$ = jsonEpic({ url })(action$, state$)
        result$.subscribe(pushAction, console.error, console.error)

        const dispatched = {
            type: `HTTP_JSON`,
            payload: {
                type: 'GET_WHAT',
                url: 'whats',
                method: 'GET',
            }
        } 

        fetchMock.get('*', { what: 'evs' })

        subject.next(dispatched)

        expect(emittedActions).toEqual([
            { type: 'GET_WHAT_REQUEST', payload: { body: undefined, method: "GET", url: "localhost:3000/whats"} },
            { type: 'GET_WHAT_SUCCESS', payload: { what: 'evs' } },
        ])

        expect(fetchMock.calls('*', `GET`)).toEqual([[
            "localhost:3000/whats",
              {
              "headers": {
                "Accept": "application/json",
                "Content-Type": "application/json",
              },
              "method": "GET",
            },
          ]
        ])

        fetchMock.restore()
    })

    /*    
    it('should emit actions', () => {

        const url = `localhost:3000`

        const result$ = jsonEpic({ url })(action$, state$)
        result$.subscribe(pushAction, console.error, console.error)

        const dispatched = {
            type: `HTTP_JSON`,
            payload: {
                type: 'SET_WHAT',
                url: 'whats',
                method: 'POST',
                body: { what: 'evs' },
            }
        } 

        fetchMock.post('*', { yay: `success` })

        subject.next(dispatched)

        expect(fetchMock.calls('*', `POST`)).toEqual([[
            "localhost:3000/whats",
              {
              "headers": {
                "Accept": "application/json",
                "Content-Type": "application/json",
              },
              "method": "POST",
              "body": "{\"what\":\"evs\"}",
            },
          ]
      ])

        expect(emittedActions).toEqual([
            { payload: { body: dispatched.payload.body, method: dispatched.payload.method, url: "localhost:3000/whats" }, type: 'SET_WHAT_REQUEST' },
            { payload: { yay: `success` }, type: 'SET_WHAT_SUCCESS'},
        ])

        fetchMock.restore()
    })
    */
})
