import { connectRouter, routerMiddleware } from 'connected-react-router'
import { createStore, applyMiddleware, compose } from 'redux'
import { createEpicMiddleware } from 'redux-observable'

import rootReducer from './reducers'
import rootEpic from './epics'

const epicMiddleware = createEpicMiddleware()

export default function configureStore(history) {
  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
  const store = createStore(
    connectRouter(history)(rootReducer), // new root reducer with router state
    //initialState,
    applyMiddleware(
        epicMiddleware,
        routerMiddleware(history)
    )
    /*
    composeEnhancers(
      applyMiddleware(
        epicMiddleware,
        routerMiddleware(history)
      )
    )
    */
  )

  epicMiddleware.run(rootEpic)

  return store
}
