'use strict'

import { ofType } from 'redux-observable'
import { map } from 'rxjs/operators'
import { camelCase, constantCase } from 'change-case'


export const baseEpic = (type) => {
  const typeUc = constantCase(type)
  const typeLc = camelCase(type)

  return (socket, tokenFn) => {
    const addToken = typeof tokenFn !== 'function'
      ? payload => payload
      : (payload, state$, deps) => Object.assign(payload, tokenFn(state$, deps))

    return (action$, state$, deps) => action$.pipe(
      ofType(typeUc),
      map(({ payload }) => {
        const all = addToken(payload, state$, deps)
        socket.emit(typeLc, all)
        return {
          ...payload,
          type: constantCase(payload.type),
        }
      })
    )
  }
}


/**
 * commandEpic
 * Listens for `COMMAND` actions,
 * then emits a `command` event via socket (with token if tokenFn defined)
 * then emits a "CONVERTED_COMMAND" redux action
 *
 * eg, { type: `COMMAND`, payload: { type: `doSomething`, data: `whatevs` }}
 * causes socket.emit(`command`, { type: doSomething, data: `whatevs`, token: { ... } })
 * and returns { type: `DO_SOMETHING`, payload: `whatevs` }
 */
export const commandEpic = baseEpic(`command`)


export const commandAction = dispatch => type => payload =>
  dispatch({ type: 'COMMAND', payload: { type, payload } })


/**
 * queryEpic
 * Listens for `QUERY` actions,
 * then emits a `query` event via socket (with token if tokenFn defined)
 * then emits a "CONVERTED_COMMAND" redux action
 *
 * eg, see commandEpic example
 */
export const queryEpic = baseEpic(`query`)


export const queryAction = dispatch => type => payload =>
  dispatch({ type: 'QUERY', payload: { type, payload } })


export const socketEpics = (socket, tokenFn) =>
  [commandEpic(socket, tokenFn), queryEpic(socket, tokenFn)]


// handle events sent form backend
export const toAction = dispatch => data => {
  const type = constantCase(data.type)
  const reduxAction = { ...data, type }
  dispatch(reduxAction)
  if (data.type === 'CommandRejected'
    || data.type === 'QueryRejected'
  ) {
    const reduxActionFailure = {
      ...data.payload,
      type: `${constantCase(data.payload.type)}_FAILURE`,
    }
    dispatch(reduxActionFailure)
  }
}
