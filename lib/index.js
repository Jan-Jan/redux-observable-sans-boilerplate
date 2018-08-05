import socketEpics from './socket-epics'
import {
    baseEpic as socketBaseEpic,
    commandEpic as socketCommandEpic,
} from './socket-epics'

export default {
    socketBaseEpic,
    socketCommandEpic,
    socketEpics,
}