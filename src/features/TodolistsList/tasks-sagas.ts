import {call, put, takeEvery, takeLatest} from "redux-saga/effects";
import {GetTasksResponse, ResponseType, TaskType, todolistsAPI, UpdateTaskModelType} from "../../api/todolists-api";
import {addTaskAC, removeTaskAC, setTasksAC, UpdateDomainTaskModelType, updateTaskAC} from "./tasks-reducer";
import {AppRootStateType, store} from "../../app/store";
import {handleServerAppError, handleServerNetworkError} from "../../utils/error-utils";
import {setAppStatusAC} from "../../app/app-reducer";
import {AxiosResponse} from "axios";

export function* fetchTasksWorkerSaga(action: ReturnType<typeof fetchTasksSagaAC>) {
    try {
        yield put(setAppStatusAC('loading'))
        const res: AxiosResponse<GetTasksResponse> = yield call(todolistsAPI.getTasks, action.todolistId)
        yield put(setTasksAC(res.data.items, action.todolistId))
        yield put(setAppStatusAC('succeeded'))
    } catch (e) {
        handleServerNetworkError(e)
    }
}

export function* removeTaskWorkerSaga(action: ReturnType<typeof removeTaskSagaAC>) {
    yield call(todolistsAPI.deleteTask, action.todolistId, action.taskId)
    yield put(removeTaskAC(action.taskId, action.todolistId))
}

export function* addTaskWorkerSaga(action: ReturnType<typeof addTaskSagaAC>) {
    try {
        yield put(setAppStatusAC('loading'))
        const res: AxiosResponse<ResponseType<{ item: TaskType}>> = yield call(todolistsAPI.createTask, action.todolistId, action.title)
        if (res.data.resultCode === 0) {
            const task = res.data.data.item
            yield put(addTaskAC(task))
            yield put(setAppStatusAC('succeeded'))
        } else {
            yield handleServerAppError(res.data);
        }
    } catch (e) {
        yield handleServerNetworkError(e)
    }
}

export function* updateTaskWorkerSaga(action: ReturnType<typeof updateTaskSagaAC>) {
    const state = store.getState()
    const task = state.tasks[action.todolistId].find(t => t.id === action.taskId)
    if (!task) {
        //throw new Error("task not found in the state");
        console.warn('task not found in the state')
        return
    }

    const apiModel: UpdateTaskModelType = {
        deadline: task.deadline,
        description: task.description,
        priority: task.priority,
        startDate: task.startDate,
        title: task.title,
        status: task.status,
        ...action.domainModel
    }

    try {
        const res: AxiosResponse<ResponseType<TaskType>> = yield call(todolistsAPI.updateTask, action.todolistId, action.taskId, apiModel)
        if (res.data.resultCode === 0) {
            yield put(updateTaskAC(action.taskId, action.domainModel, action.todolistId))
        } else {
            handleServerAppError(res.data);
        }
    } catch (e) {
        handleServerNetworkError(e)
    }
}

export const fetchTasksSagaAC = (todolistId: string) => ({
    type: 'TASKS/ACTIVATE-FETCH-TASKS-SAGA',
    todolistId
} as const)
export const removeTaskSagaAC = (taskId: string, todolistId: string) => ({
    type: 'TASKS/ACTIVATE-REMOVE-TASK-SAGA',
    taskId,
    todolistId
} as const)
export const addTaskSagaAC = (title: string, todolistId: string) => ({
    type: 'TASKS/ACTIVATE-ADD-TASK-SAGA',
    title,
    todolistId
} as const)
export const updateTaskSagaAC = (taskId: string, domainModel: UpdateDomainTaskModelType, todolistId: string) =>
    ({type: 'TASKS/ACTIVATE-UPDATE-TASK-SAGA', taskId, domainModel, todolistId} as const)

export function* tasksWatcher() {
    yield takeEvery('TASKS/ACTIVATE-FETCH-TASKS-SAGA', fetchTasksWorkerSaga)
    yield takeEvery('TASKS/ACTIVATE-REMOVE-TASK-SAGA', removeTaskWorkerSaga)
    yield takeEvery('TASKS/ACTIVATE-ADD-TASK-SAGA', addTaskWorkerSaga)
    yield takeEvery('TASKS/ACTIVATE-UPDATE-TASK-SAGA', updateTaskWorkerSaga)
}