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

        fetchMock.get('*', { what: 'evs'})

        subject.next(dispatched)

        expect(emittedActions).toEqual([
            { type: 'GET_WHAT_REQUEST', payload: { body: undefined, method: "GET", url: "localhost:3000/whats"} },
            { type: 'GET_WHAT_SUCCESS', payload: { what: 'evs' } },
        ])

        fetchMock.restore()
    })

    /*
    it('should emit actions', () => {

        const url = `localhost:3000`

        const result$ = jsonEpic({ url })(action$, state$)
        result$.subscribe(pushAction)

        const dispatched = {
            type: `HTTP_JSON`,
            payload: {
                type: 'SET_WHAT',
                url: 'whats',
                method: 'POST',
                body: { what: 'evs' },
            }
        } 

        subject.next(dispatched)

        expect(emittedActions).toEqual([
            { ...dispatched.payload, type: 'SET_SOMETHING_REQUEST' },
            { payload: { yay: `success` }, type: 'SET_SOMETHING_SUCCESS'},
        ])
       expect(true).toEqual(true)
    })
    */
})
