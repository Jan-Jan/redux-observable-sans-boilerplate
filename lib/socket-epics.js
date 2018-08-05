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
            : (payload, state) => Object.assign({ token: tokenFn(state) }, payload)

        return (action$, state) => action$.pipe(
            ofType(typeUc),
            map(({ payload }) => {
                const all = addToken(payload, state)
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


/**
 * queryEpic
 * Listens for `QUERY` actions,
 * then emits a `query` event via socket (with token if tokenFn defined)
 * then emits a "CONVERTED_COMMAND" redux action
 * 
 * eg, see commandEpic example
 */
export const queryEpic = baseEpic(`query`)


export default (socket, tokenFn) =>
    [commandEpic(socket, tokenFn), queryEpic(socket, tokenFn)]
