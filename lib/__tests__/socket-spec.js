import { ActionsObservable, combineEpics } from 'redux-observable'
import { Subject } from 'rxjs'

import { socketEpics, commandAction, queryAction } from '../index'

describe('socketEpic', () => {
  const me = { token: 'key', name: 'AB Normal', userId: '3f43f' }
  const state$ = { value: { me } }
  let subject
  let action$
  let emittedActions
  let socketEvents
  const socket = {
    emit: (type, msg) => socketEvents.push([type, msg]),
  }
  const pushAction = emittedAction => emittedActions.push(emittedAction)

  const cA = commandAction('doSomething')({ data: 'whatevs' })

  const qA = queryAction('getSomething')({ payload: 'whatevs' })

  beforeEach(() => {
    subject = new Subject()
    action$ = new ActionsObservable(subject)
    emittedActions = []
    socketEvents = []
  })

  it('should return action and emit command event', () => {
    const result$ = combineEpics(...socketEpics(socket))(action$, state$)
    result$.subscribe(pushAction, console.error, console.error)

    subject.next(cA)
    subject.next(qA)

    expect(emittedActions).toEqual([
      { ...cA.payload, type: 'DO_SOMETHING' },
      { ...qA.payload, type: 'GET_SOMETHING' },
    ])

    expect(socketEvents).toEqual([
      ['command', { ...cA.payload, type: 'doSomething' }],
      ['query', { ...qA.payload, type: 'getSomething' }],
    ])
  })

  it('should add token only to socket msg', () => {
    const auth = state$ => ({ token: state$.value.me.token, userId: state$.value.me.userId })

    const result$ = combineEpics(...socketEpics(socket, auth))(action$, state$)
    result$.subscribe(pushAction, console.error, console.error)

    subject.next(cA)
    subject.next(qA)

    expect(emittedActions).toEqual([
      { ...cA.payload, type: 'DO_SOMETHING' },
      { ...qA.payload, type: 'GET_SOMETHING' },
    ])

    expect(socketEvents).toEqual([
      ['command', { ...cA.payload, type: 'doSomething', token: me.token, userId: me.userId }],
      ['query', { ...qA.payload, type: 'getSomething', token: me.token, userId: me.userId }],
    ])
  })
})
