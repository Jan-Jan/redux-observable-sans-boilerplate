import 'whatwg-fetch'
import { EPIC_END, ofType } from 'redux-observable'
import { merge, from, race } from 'rxjs'
import { catchError, mapTo, mergeMap, take, takeUntil } from 'rxjs/operators'


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
const mapResponseToSuccessOrFailureStream = (type, url, httpType) => response => {
  if (response.code >= 200 && response.code < 300) {
    return from([rpcSuccess(type)(response.body)])
  }

  return from(rpcFailure(type, url, httpType)(response))
}


// action creators
export const rpcRequest = type => payload =>
  ({ type: `${type}_REQUEST`, payload })


export const rpcSuccess = type => payload =>
  ({ type: `${type}_SUCCESS`, payload })


export const rpcFailure = (type, url, httpType) => response =>
  ([
    { type: `${type}_FAILURE`, payload: (response && response.xhr) ? response.xhr.response : response.body },
    {
      type: (response && response.code === 401) ? `${httpType}_UNAUTHORIZED` : `${httpType}_ERROR`,
      payload: { url, ...response },
    },
  ])


export const createType = id => `HTTP` + (id ? `_${id}` : ``)


// Race between the AJAX call and an EPIC_END.
// If the EPIC_END, emit a cancel action to
// put the store in the correct state
// This is needed for hot reloading
export const httpEpic = (options = {}) => {
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
          mergeMap(mapResponseToSuccessOrFailureStream(type, url, httpType)),
          takeUntil(action$.ofType(`${type}_CANCELLED`)),
          catchError(err => from(rpcFailure(type, url, httpType)(err))),
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


export const httpAction = (dispatch, id) => (type, url, method = 'GET', settings = {}) => body =>
  dispatch({
    type: createType(id),
    payload: { type, url, method, ...settings, body },
  })
