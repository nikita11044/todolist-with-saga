import {AxiosResponse} from "axios";
import {call, put, takeEvery} from "redux-saga/effects";
import {GetTasksResponse, todolistsAPI} from "../../api/todolists-api";
import {setAppStatusAC} from "../../app/app-reducer";
import {removeTaskAC, setTasksAC} from "./tasks-reducer";

export function* fetchTasksWorkerSaga(action: ReturnType<typeof fetchTasksSagaAC>) {
    debugger
    yield put(setAppStatusAC('loading'))
    const res: AxiosResponse<GetTasksResponse> = yield call(todolistsAPI.getTasks, action.todolistId)
    const tasks = res.data.items
    yield put(setTasksAC(tasks, action.todolistId))
    yield put(setAppStatusAC('succeeded'))
}

export function* removeTaskWorkerSaga(action: ReturnType<typeof removeTaskSagaAC>) {
    const res: AxiosResponse<ResponseType> = yield call(todolistsAPI.deleteTask, action.todolistId, action.taskId)
    yield put(removeTaskAC(action.taskId, action.todolistId))
}

export const fetchTasksSagaAC = (todolistId: string) => ({type: 'TASKS/ACTIVATE-FETCH-TASKS-SAGA', todolistId})
export const removeTaskSagaAC = (todolistId: string, taskId: string) => ({type: 'TASKS/ACTIVATE-REMOVE-TASK-SAGA', todolistId, taskId})

export function* tasksWatcher() {
    debugger
    yield takeEvery('TASKS/ACTIVATE-FETCH-TASKS-SAGA', fetchTasksWorkerSaga)
    yield takeEvery('TASKS/ACTIVATE-REMOVE-TASK-SAGA', removeTaskWorkerSaga)
}