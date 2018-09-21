import React from 'react';
import { connect } from 'react-redux'

import logo from './logo.svg';
import './App.css';


const Loading = () => <div>...</div>

const Error = ({error}) => <h1>ERROR: {error}</h1>

const Repos = ({ name }) => <div>{name}</div>


const App = ({ error, fullnames, isLoading, message, onSubmit }) =>
  <div className="App">
    <header className="App-header">
      <img src={logo} className="App-logo" alt="logo" />
      <h1 className="App-title">Welcome to React</h1>
    </header>
    <input
      type="text"
      placeholder="Search for a GH user"
      defaultValue={``}
      onChange={(evt) => { 
        console.error(`evt = `, evt.target.value)
        onSubmit({ user: evt.target.value })}
      }
    />
    <div>
      {isLoading && <Loading />}
      {error && <Error error={message || 'WTF?!'} />}
      {(fullnames || []).map((name, key) => <Repos {...{ name, key }} />)}
    </div>
  </div>


const mapStateToProps = ({ router, ...state }) => {
  console.error(`state =`, state)
  return state
}

const mapDispatchToProps = (dispatch, ownProps) => ({
  onSubmit: ownProps.http('GET_USERS', ({ user }) => `users/${user}/repos`),
})

export default connect(mapStateToProps, mapDispatchToProps)(App);
