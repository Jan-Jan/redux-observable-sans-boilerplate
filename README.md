
# redux-observable-sans-boilerplate

Redux is awesome. But, boilerplate is a code smell.
This library allows you to use redux with zero boilerplate:

* ZERO action definitions
* ONLY 1 dispatch (per http API targeted)
* ONLY 1 epic (per http API targeted)

(and similar for websockets).
Instead of boilerplate, you should **just be coding business logic**.


# install

```
npm i --save redux-observable-sans-boilerplate
```

# use

## http (json)

```javascript
import { httpEpic, httpAction } from 'redux-observable-sans-boilerplate'
```

Setting up the middleware as per https://redux-observboilerplateable.js.org/docs/basics/SettingUpTheMiddleware.html 

For our example we will be doing http request to two different backends.

```javascript
const optionsGH = {
    url: 'https://api.github.com', // site that will be 
    id = 'GH', // optional value used to differentiate http action types
}

const optionsCustom = {
    url: 'https://mysite.url',
    // optionally use setHeaders to do authentication
    setHeaders: (state$, deps) => ({  Authorization: `Bearer ${action$.value.me.token}` }),
}

const rootEpic = combineReducers(httpEpic(optionsGH),httpEpic(optionsCustom))
```

The action creators have the signature `httpAction(dispatch, id)(type, url, method = 'GET', settings = {})(body)` where:

* `dispatch` as provided by `reaca-redux`
* `id` is optional and should be the same value as used to create the `httpEpic`
* `type` is the front part of the type of action you will be dispatching, eg, `'GET_USERS'`: 
    * `httpEpic` will turn the dispacted action into `GET_USERS_REQUEST`, `GET_USERS_SUCCESS` and `GET_USERS_FAILURE` type actions
    * the `_FAILURE` will be followed by either a `HTTP_ERROR` or `HTTP_UNAUTHORIZED` type action
        * if `id` is defined, eg, `GH`, then the following types would be changed to `HTTP_GH_ERROR` or `HTTP_GH_UNAUTHORIZED`
    * a `GET_USERS_CANCELLED` type action can be used to cancel the ongoing request
* `url` is the latter part of the url path; it will be appended to front piece defined in the corresponding `httpEpic`
* `method` can be `GET`, `POST`, `PATCH`, etc.
* `settings` is the standard options that can be passed to `fetch`
* `body` is optional; it is the JSON object, eg, from you form


To use you all you need to do is use `connect(mapStateToProps, mapDispatchToProps)` from `react-redux` where 

```javascript
const mapDispatchToProps = dispatch => ({
    http: httpAction(dispatch, id), // same id as in corresponding httpEpic
})
```

which you can call from anywhere in you app, eg,

```javascript
const mapDispatchToProps = (dispatch, ownProps) => ({
    onSubmit: ownProps.http('GET_USERS', 'users'),
})
```

where your data is then passed into `onSubmit(data)`.

## websocket: command and query (and "event")

I created a `command` and `query` for websockets for convention sake, but it works perfectly fine if you just use `command`.

```javascript
import { socketEpics, commandAction, toAction } from 'redux-observable-sans-boilerplate'
```

Setting up the middleware as per https://redux-observboilerplateable.js.org/docs/basics/SettingUpTheMiddleware.html 

You need to have defined a `socket` object 

```javascript
const auth = (state$, deps) =>
    ({ token: state$.value.me.token, userId: state$.value.me.userId })

const rootEpic = combineReducers(...socketEpics(socket))
```

Note: The `auth` function is completely optional.

To use you all you need to do is use `connect(mapStateToProps, mapDispatchToProps)` from `react-redux` where 

```javascript
const mapDispatchToProps = dispatch => ({
    command: commandAction(dispatch),
})
```

which you can call from anywhere in you app, eg,

```javascript
const mapDispatchToProps = (dispatch, ownProps) => ({
    onSubmit: ownProps.command('updateUser'),
})
```

where your data is then passed into `onSubmit(data)`.

Bonus: to handle events from backend you can use

```javascript
socket.on(`event`, toAction(dispatch))
```

it expects the data object received  to include a `type` which will then be converted constant-case, and then dispatched as an action.

If a `CommandRejected` or `QueryRejected` type is received a further action of `_FAILURE` type will also be emitted (based on the constant-case of the `payload.type` -- idealy that would be the type of the corresponding command or query).
