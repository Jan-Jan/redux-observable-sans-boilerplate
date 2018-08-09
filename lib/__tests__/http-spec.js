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
    subject = new Subject()
    action$ = new ActionsObservable(subject)
  })


  afterEach(() => {
    fetchMock.restore()
  })


  it('basic GET', done => {
    // values
    const type = `GET_WHAT`
    const path = `whats`
    const method = 'GET'
    const response = { what: 'evs' }
    // setup
    const httpAct = httpAction()(type, path, method)()
    const expectedActions = [
      { type: `${type}_REQUEST`, payload: { body: undefined, method, url: `${url}/${path}` } },
      { type: `${type}_SUCCESS`, payload: response },
    ]
    fetchMock.mock({
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
      },
    ]])
    // run
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
    const type = `SET_WHAT`
    const path = 'whats'
    const method = `POST`
    const body = { what: 'evs' }
    const response = { yay: `success` }
    // setup
    const httpAct = httpAction(id)(type, path, method)(body)
    const expectedActions = [
      { type: `${type}_REQUEST`, payload: { body, method, url: `${url}/${path}` } },
      { type: `${type}_SUCCESS`, payload: response },
    ]
    fetchMock.mock({
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


  it('401 with extra action', done => {
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
      { type: 'UNAUTHORIZED', payload: { url: `${url}/${path}`, code: 401, body: response.body  } },
    ]
    fetchMock.mock({
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


  it('EPIC_END causes _CANCELLED', done => {
    // values
    const type = `GET_WHAT`
    const path = `whats`
    const method = 'GET'
    const response = { what: 'evs' }
    // setup
    const httpAct = httpAction()(type, path, method)()
    const expectedActions = [
      { type: `${type}_REQUEST`, payload: { body: undefined, method, url: `${url}/${path}` } },
      { type: `${type}_CANCELLED` },
    ]
    fetchMock.mock({
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
      },
    ]])
    // run
    const result$ = httpEpic({ url })(action$, state$)
    result$.subscribe(testOutput(done, testFetch, expectedActions), console.error, console.error)
    subject.next(httpAct)
    subject.next({ type: EPIC_END })
  })


  it('_CANCELLED', done => {
    // values
    const type = `GET_WHAT`
    const path = `whats`
    const method = 'GET'
    const response = { what: 'evs' }
    // setup
    const httpAct = httpAction()(type, path, method)()
    const expectedActions = [
      { type: `${type}_REQUEST`, payload: { body: undefined, method, url: `${url}/${path}` } },
    ]
    fetchMock.mock({
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
      },
    ]])
    // run
    const result$ = httpEpic({ url })(action$, state$)
    result$.subscribe(testOutput(done, testFetch, expectedActions), console.error, console.error)
    subject.next(httpAct)
    subject.next({ type: `${type}_CANLCELLED` })
  })
})
