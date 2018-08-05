import { ActionsObservable } from 'redux-observable'
import { Subject } from 'rxjs'

import { jsonEpic } from '../http-epics'


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

    it('should emit events', () => {

        const url = `localhost:3000`

        const result$ = jsonEpic({ url })(action$, state$)
        result$.subscribe(pushAction)

        const dispatched = {
            type: `HTTP_JSON`,
            payload: {
                method: 'GET',
                payload: { what: 'evs' },
                url: 'undefined',
                type: 'GET_WHAT'
            }
        } 

        subject.next(dispatched)

        expect(emittedActions).toEqual([
            { ...dispatched.payload, type: 'GET_SOMETHING_REQUEST' },
            { payload: { yay: `success` }, type: 'GET_SOMETHONG_FAILURE'},
        ])
       expect(true).toEqual(true)
    })
})
