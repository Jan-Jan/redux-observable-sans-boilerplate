import { ActionsObservable, EPIC_END } from 'redux-observable'
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
    fetchMock.restore()
    subject = new Subject()
    action$ = new ActionsObservable(subject)
  })

  afterEach(() => {
  })


  it('basic GET', done => {
    // setup
    const httpAct = httpAction()('GET_WHAT', 'whats', 'GET')()
    const expectedActions = [
      { type: 'GET_WHAT_REQUEST', payload: { body: undefined, method: 'GET', url: 'localhost:3000/whats' } },
      { type: 'GET_WHAT_SUCCESS', payload: { what: 'evs' } },
    ]
    fetchMock.get('*', { what: 'evs' }, { overwriteRoutes: true })
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

    // run tests

    const result$ = httpEpic({ url })(action$, state$)

    result$.subscribe(testOutput(done, testFetch, expectedActions), console.error, console.error)

    subject.next(httpAct)
  })

  it('POST with auth headers and id', done => {
    // values
    const id = 'GH' // test addition of id
    const setHeaders = (action$, deps) => ({
      Authorization: `Bearer ${action$.value.me.token}`,
    })
    const path = 'whats'

    const type = `SET_WHAT`
    const method = `POST`
    const body = { what: 'evs' }
    const response = { yay: `success` }
    // setup
    const httpAct = httpAction(id)(type, path, method)(body)
    const expectedActions = [
      { type: `${type}_REQUEST`, payload: { body, method, url: `${url}/${path}` } },
      { type: `${type}_SUCCESS`, payload: response },
    ]
    fetchMock.post({
      matcher: `${url}/${path}`,
      method,
      response,
    })
    const testFetch = () => expect(fetchMock.calls(`${url}/${path}`, method)).toEqual([[
      `${url}/${path}`,
      {
        'headers': {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer key`,
        },
        method,
        body: JSON.stringify(body),
      },
    ]])
    // run
    const options = { id, url, setHeaders }
    const result$ = httpEpic(options)(action$, state$)
    result$.subscribe(testOutput(done, testFetch, expectedActions), console.error, console.error)
    subject.next(httpAct)
  })


  it('handles throw', done => {
    // values
    const type = `SET_WHAT`
    const path = `unauth`
    const method = `POST`
    const body = { what: 'evs' }
    const response = { status: 401, body: { error: 'no entry' } }
    // setup
    const httpAct = httpAction()(type, path, method)(body)
    const expectedActions = [
      { type: `${type}_REQUEST`, payload: { body, method, url: `${url}/${path}` } },
      { type: `${type}_FAILURE`, payload: response.body },
      { type: 'UNAUTHORIZED' },
    ]
    fetchMock.post({
      matcher: `${url}/${path}`,
      method,
      response,
    })
    const testFetch = () => expect(fetchMock.calls(`${url}/${path}`, method)).toEqual([[
      `${url}/${path}`,
      {
        'headers': {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        method,
        body: JSON.stringify(body),
      },
    ]])
    // run
    const result$ = httpEpic({ url })(action$, state$)
    result$.subscribe(testOutput(done, testFetch, expectedActions), console.error, console.error)
    subject.next(httpAct)
  })
})
