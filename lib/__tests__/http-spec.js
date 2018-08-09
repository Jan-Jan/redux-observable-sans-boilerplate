import { ActionsObservable } from 'redux-observable'
import { Subject } from 'rxjs'

import { httpCommand, httpEpic } from '../index'
import fetchMock from 'fetch-mock/es5/client'


describe('httpEpic', () => {
  const me = { token: 'key', name: 'AB Normal', userId: '3f43f' }
  const state$ = { value: { me } }
  let subject
  let action$
  let emittedActions
  const pushAction = emittedAction => emittedActions.push(emittedAction)

  beforeEach(() => {
    subject = new Subject()
    action$ = new ActionsObservable(subject)
    emittedActions = []
  })

  it('basic GET', async () => {
    const url = `localhost:3000`

    const result$ = httpEpic({ url })(action$, state$)
    result$.subscribe(pushAction, console.error, console.error)

    const hA = httpCommand()('GET_WHAT', 'whats', { method: 'GET' })()

    fetchMock.get('*', { what: 'evs' })

    subject.next(hA)
    await new Promise(resolve => setTimeout(resolve, 100))

    expect(emittedActions).toEqual([
      { type: 'GET_WHAT_REQUEST', payload: { body: undefined, method: 'GET', url: 'localhost:3000/whats' } },
      { type: 'GET_WHAT_SUCCESS', payload: { what: 'evs' } },
    ])

    expect(fetchMock.calls('*', `GET`)).toEqual([[
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

    fetchMock.restore()
  })

  it('basic POST', async () => {
    const url = `localhost:3000`

    const result$ = httpEpic({ url })(action$, state$)
    result$.subscribe(pushAction, console.error, console.error)

    fetchMock.post('*', { yay: `success` })

    const hA = httpCommand()('SET_WHAT', 'whats', { method: 'POST' })({ what: 'evs' })
    subject.next(hA)
    await new Promise(resolve => setTimeout(resolve, 100))

    expect(fetchMock.calls('*', `POST`)).toEqual([[
      'localhost:3000/whats',
      {
        'headers': {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        'method': 'POST',
        'body': '{"what":"evs"}',
      },
    ],
    ])

    expect(emittedActions).toEqual([
      { payload: { body: hA.payload.body, method: hA.payload.method, url: 'localhost:3000/whats' }, type: 'SET_WHAT_REQUEST' },
      { payload: { yay: `success` }, type: 'SET_WHAT_SUCCESS' },
    ])

    fetchMock.restore()
  })
})
