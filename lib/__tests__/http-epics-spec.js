/*
const auth = () => {

    const xxx = { token: 'secure', userId: '007' }
    //set headers
}

httpEpic('LOCAL', 'localhost:3000', auth)

{
    type: 'HTTP_LOCAL',
    subType: 'check health',
    method: 'PUT',
    url: 'check',
    payload: 'whatevs'
}
*/

import { ActionsObservable, combineEpics } from 'redux-observable'
// import { toArray } from 'rxjs/operators'
import { Subject } from 'rxjs'

import { httpJson } from '../http-epics'


describe('httpJson epic', () => {

    const me = { token: 'key', name: 'AB Normal', userId: '3f43f' }
    const state$ = { value: { me } };
    let subject
    let action$
    let emittedActions

    beforeEach(() => {
        subject = new Subject()
        action$ = new ActionsObservable(subject)
        emittedActions = []
    })

    if('should emit events', () => {

        const result = httpJson()(action$, state$)

        result.subscribe(
            emittedAction => {
                emittedActions.push(emittedAction)
            }
        )

        const dispatched = {
            type: `HTTP_JSON`,
            payload: {
                method: 'GET',
                payload: { what: 'evs' },
                url: 'bar',
                type: 'GET_WHAT'
            }
        } 

        subject.next(dispatched)

        expect(emittedActions).toEqual([
            { ...dispatched.payload, type: 'GET_SOMETHING_REQUEST' },
        ])
    })
})
