import React from 'react'
import ReactDOM from 'react-dom'
import { connect, Provider } from 'react-redux'
import { httpAction } from 'redux-observable-sans'

import App from './App'
import configureStore from './configureStore'
import './index.css'
import registerServiceWorker from './registerServiceWorker'

const store = configureStore()

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
