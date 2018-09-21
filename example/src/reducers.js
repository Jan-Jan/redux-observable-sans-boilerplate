import { combineReducers } from 'redux'

const reducers = {
    'GET_USERS_REQUEST': (state) => ({ ...state, isLoading: true }),
    'GET_USERS_SUCCESS': (state, payload) => ({ fullnames: payload.map(e => e.full_name) }),
    'GET_USERS_FAILURE': (state, payload) => ({ error: true, ...payload }),
}

export default (state = { what: 'evs' }, action) => {
    const reducer = reducers[action.type]
    return typeof reducer === 'function' ? reducer(state, action.payload) : state
}