import { combineEpics } from 'redux-observable';
import { httpEpic } from 'redux-observable-sans'

const options = {
  url: 'https://api.github.com',
}

export default combineEpics(
  httpEpic(options),
)
