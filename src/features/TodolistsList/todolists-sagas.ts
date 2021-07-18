import {call, put, takeEvery, takeLatest} from "redux-saga/effects";
import {setAppStatusAC} from "../../app/app-reducer";
import {ResponseType, todolistsAPI, TodolistType} from "../../api/todolists-api";
import {
    addTodolistAC,
    changeTodolistEntityStatusAC,
    changeTodolistTitleAC,
    removeTodolistAC,
    setTodolistsAC
} from "./todolists-reducer";
import {handleServerNetworkError} from "../../utils/error-utils";
import {AxiosResponse} from "axios";

export function* fetchTodolistsWorkerSaga() {
    try {
        yield put(setAppStatusAC('loading'))
        const res: AxiosResponse<TodolistType[]> = yield call(todolistsAPI.getTodolists)
        yield put(setTodolistsAC(res.data))
        yield put(setAppStatusAC('succeeded'))
    } catch (e) {
        yield handleServerNetworkError(e)
    }
}

export function* removeTodolistWorkerSaga(action: ReturnType<typeof removeTodolistSagaAC>) {
    yield put(setAppStatusAC('loading'))
    yield put(changeTodolistEntityStatusAC(action.todolistId, 'loading'))
    const res: AxiosResponse<ResponseType> = yield call(todolistsAPI.deleteTodolist, action.todolistId)
    yield put(removeTodolistAC(action.todolistId))
    yield put(setAppStatusAC('succeeded'))
}

export function* addTodolistWorkerSaga(action: ReturnType<typeof addTodolistSagaAC>) {
    yield put(setAppStatusAC('loading'))
    const res: AxiosResponse<ResponseType<{ item: TodolistType }>> = yield call(todolistsAPI.createTodolist, action.title)
    yield put(addTodolistAC(res.data.data.item))
    yield put(setAppStatusAC('succeeded'))
}

export function* changeTodolistTitleWorkerSaga(action: ReturnType<typeof changeTodolistTitleSagaAC>) {
    const res: AxiosResponse<ResponseType> = yield call(todolistsAPI.updateTodolist, action.id, action.title)
    yield put(changeTodolistTitleAC(action.id, action.title))
}

export const fetchTodolistsSagaAC = () => ({type: 'TODOLISTS/ACTIVATE-FETCH-TODOLISTS-SAGA'} as const)
export const removeTodolistSagaAC = (todolistId: string) => ({type: 'TODOLISTS/ACTIVATE-REMOVE-TODOLIST-SAGA', todolistId} as const)
export const addTodolistSagaAC = (title: string) => ({type: 'TODOLISTS/ACTIVATE-ADD-TODOLIST-SAGA', title} as const)
export const changeTodolistTitleSagaAC = (id: string, title: string) => ({type: 'TODOLISTS/ACTIVATE-CHANGE-TODOLIST-TITLE-SAGA', id, title} as const)

export function* todolistsWatcher() {
    yield takeEvery('TODOLISTS/ACTIVATE-FETCH-TODOLISTS-SAGA', fetchTodolistsWorkerSaga)
    yield takeEvery('TODOLISTS/ACTIVATE-REMOVE-TODOLIST-SAGA', removeTodolistWorkerSaga)
    yield takeEvery('TODOLISTS/ACTIVATE-ADD-TODOLIST-SAGA', addTodolistWorkerSaga)
    yield takeEvery('TODOLISTS/ACTIVATE-CHANGE-TODOLIST-TITLE-SAGA', changeTodolistTitleWorkerSaga)
}