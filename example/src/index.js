import { createBrowserHistory } from 'history'
import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
//import { Router, Route, browserHistory, IndexRoute } from 'react-router'
import { Route, Switch, Link } from 'react-router-dom'
import { ConnectedRouter } from 'connected-react-router'

import App from './App'
import configureStore from './configureStore'
import './index.css'
import registerServiceWorker from './registerServiceWorker'

const history = createBrowserHistory()
const store = configureStore(history)

ReactDOM.render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <Switch>
        <Route exact path="/" component={App} />
      </Switch>
    </ConnectedRouter>
  </Provider>,
  document.getElementById('root')
)
registerServiceWorker()
