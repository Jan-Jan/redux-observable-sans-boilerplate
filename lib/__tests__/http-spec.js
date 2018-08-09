import { ActionsObservable } from 'redux-observable'
import { Subject } from 'rxjs'

import { httpAction, httpEpic } from '../index'
import fetchMock from 'fetch-mock/es5/client'


describe('httpEpic', () => {
  const url = `localhost:3000`
  const me = { token: 'key', name: 'AB Normal', userId: '3f43f' }
  const state$ = { value: { me } }
  let subject
  let action$

  const testOutput = (done, testFetch, expectedActions, count = 0) => action => {
    expect(action).toEqual(expectedActions[count])
    count++

    if (count === expectedActions.length) {

      testFetch()
      done()
    }
  }

  beforeEach(() => {
    subject = new Subject()
    action$ = new ActionsObservable(subject)
  })

  afterEach(() => {
    fetchMock.restore()
  })

  it('basic GET', done => {
    // setup
    const httpAct = httpAction()('GET_WHAT', 'whats', { method: 'GET' })()
    const expectedActions = [
      { type: 'GET_WHAT_REQUEST', payload: { body: undefined, method: 'GET', url: 'localhost:3000/whats' } },
      { type: 'GET_WHAT_SUCCESS', payload: { what: 'evs' } },
    ]
    const testFetch = () => expect(fetchMock.calls('*', `GET`)).toEqual([[
      'localhost:3000/whats',
      {
        'headers': {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        'method': 'GET',
      },
    ],
    ])

    fetchMock.get('*', { what: 'evs' })

    // run tests

    const result$ = httpEpic({ url })(action$, state$)

    result$.subscribe(testOutput(done, testFetch, expectedActions), console.error, console.error)

    subject.next(httpAct)
  })

  it('basic POST', done => {
    // setup

    const httpAct = httpAction()('SET_WHAT', 'whats', { method: 'POST' })({ what: 'evs' })
    const expectedActions = [
      { payload: { body: httpAct.payload.body, method: httpAct.payload.method, url: 'localhost:3000/whats' }, type: 'SET_WHAT_REQUEST' },
      { payload: { yay: `success` }, type: 'SET_WHAT_SUCCESS' },
    ]
    const testFetch = () => expect(fetchMock.calls('*', `POST`)).toEqual([[
      'localhost:3000/whats',
      {
        'headers': {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        'method': 'POST',
        'body': '{"what":"evs"}',
      },
    ]])

    fetchMock.post('*', { yay: `success` })

    // run tests

    const result$ = httpEpic({ url })(action$, state$)

    result$.subscribe(testOutput(done, testFetch, expectedActions), console.error, console.error)

    subject.next(httpAct)
  })
})
