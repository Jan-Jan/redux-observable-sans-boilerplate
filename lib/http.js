import 'whatwg-fetch'
import { EPIC_END, ofType } from 'redux-observable'
// FIXME: Don't load full Observable,
import { merge, from, race } from 'rxjs'
import { catchError, mapTo, mergeMap, switchMap, take, takeUntil } from 'rxjs/operators'

// fetch does not throw on anything but network errors
// thus status needs to be passed down along with body
const responseToJson = response =>
  response.json()
    .then(cleanJson => ({
      code: response.status,
      body: cleanJson,
    }))

// check kind of response by code
// then return stream of success actions or stream of failure actions
// in case of 401, then failure stream includes action.type === `UNAUTHORIZED`
const mapResponseToSuccessOrFailureStream = type => response => {
  if (response.code >= 200 && response.code < 300) {
    return from([rpcSuccess(type)(response.body)])
  }
  // handle error
  const failure = rpcFailure(type)(response)
  const unauthorized = { type: `UNAUTHORIZED` }
  const actions = response.code !== 401
    ? [failure]
    : [failure, unauthorized]
  return from(actions)
}

// action creators
export const rpcRequest = type => payload =>
  ({ type: `${type}_REQUEST`, payload })

export const rpcSuccess = type => payload =>
  ({ type: `${type}_SUCCESS`, payload })

export const rpcFailure = type => ({ xhr, body }) =>
  ({ type: `${type}_FAILURE`, payload: xhr ? xhr.response : body })

export const createType = id => `HTTP_JSON` + (id ? `_${id}` : ``)

// Race between the AJAX call and an EPIC_END.
// If the EPIC_END, emit a cancel action to
// put the store in the correct state
// This is needed for hot reloading
/**
 * [httpEpic description]
 * @param  {String} type          [eg, 'create user']
 * @param  {function} createUrl   [eg, ({ id }) => `/users/{id}`]
 * @param  {Object} [settings={}] [eg, { method: 'POST' }]
 * @return {Observable}           [description]
 */
export const httpEpic = options => {
  const preUrl = !options.url
    ? '/'
    : options.url[options.url.length] === '/'
      ? options.url
      : options.url + '/'

  const setHeaders = typeof options.setHeaders === 'function'
    ? options.setHeaders
    : () => ({})

  const httpType = createType(options.id)

  return (action$, state$, deps) =>
    action$.pipe(
      ofType(httpType),
      mergeMap(({ payload }) => {
        const {
          body: rawBody,
          url: postUrl,
          type,
          ...settings
        } = payload

        const headers = {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          ...setHeaders(state$, deps),
        }

        const options = {
          headers,
          ...settings,
        }

        const body = rawBody && typeof rawBody.toJS === 'function'
          ? rawBody.toJS() // handle immutable
          : rawBody

        if (body) options.body = JSON.stringify(body)

        const url = preUrl + (postUrl || '')

        const reqAction$ = from([rpcRequest(type)({ url, ...settings, body })])

        const sideEffect$ = from(fetch(url, options).then(responseToJson)).pipe(
          switchMap(mapResponseToSuccessOrFailureStream(type)),
          takeUntil(action$.ofType(`${type}_CANCELLED`)),
          catchError(rpcFailure(type)),
        )

        const hotReloading$ = action$.pipe(
          ofType(EPIC_END),
          mapTo({ type: `${type}_CANCELLED` }),
          take(1),
        )

        return merge(reqAction$, race(sideEffect$, hotReloading$))
      })
    )
}

export const httpAction = id => (type, url, settings = {}) => body =>
  ({
    type: createType(id),
    payload: { type, url, ...settings, body },
  })
