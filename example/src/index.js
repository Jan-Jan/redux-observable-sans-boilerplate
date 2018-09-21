import { createBrowserHistory } from 'history'
import React from 'react'
import ReactDOM from 'react-dom'
import { connect, Provider } from 'react-redux'
//import { Router, Route, browserHistory, IndexRoute } from 'react-router'
import { Route, Switch, Link } from 'react-router-dom'
import { ConnectedRouter } from 'connected-react-router'
import { httpAction } from './sans'

import App from './App'
import configureStore from './configureStore'
import './index.css'
import registerServiceWorker from './registerServiceWorker'

const history = createBrowserHistory()
const store = configureStore(history)

const mapDispatchToProps = dispatch => ({
    http: httpAction(dispatch),
})

const Root = connect(null, mapDispatchToProps)(App)

ReactDOM.render(
    <Provider store={store}>
        <Root />
    </Provider>,
    document.getElementById('root')
)  
registerServiceWorker()
