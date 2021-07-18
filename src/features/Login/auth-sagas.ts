import {handleServerAppError, handleServerNetworkError} from "../../utils/error-utils";
import {setAppStatusAC} from "../../app/app-reducer";
import {call, put, takeEvery} from "redux-saga/effects";
import {setIsLoggedInAC} from "./auth-reducer";
import {authAPI, LoginParamsType} from "../../api/todolists-api";


export function* loginWorkerSaga(action: any) {
    yield put(setAppStatusAC('loading'))
    try {
        const res = yield call(authAPI.login, action.data)
        if (res.data.resultCode === 0) {
            yield put(setIsLoggedInAC(true))
            yield put(setAppStatusAC('succeeded'))
        } else {
            yield handleServerAppError(res.data)
        }
    } catch (e) {
        yield handleServerNetworkError(e)
    }
}

export function* logoutWorkerSaga() {
    yield put(setAppStatusAC('loading'))
    try {
        const res = yield call(authAPI.logout)
        if (res.data.resultCode === 0) {
            yield put(setIsLoggedInAC(false))
            yield put(setAppStatusAC('succeeded'))
        } else {
            yield handleServerAppError(res.data)
        }
    } catch(e) {
        yield handleServerNetworkError(e)
    }
}

export const loginSagaAC = (data: LoginParamsType) => ({type: 'AUTH/ACTIVATE-LOGIN-SAGA', data} as const)
export const logoutSagaAC = () => ({type: 'AUTH/ACTIVATE-LOGOUT-SAGA'} as const)

export function* authWatcher() {
    yield takeEvery('AUTH/ACTIVATE-LOGIN-SAGA', loginWorkerSaga)
    yield takeEvery('AUTH/ACTIVATE-LOGOUT-SAGA', logoutWorkerSaga)
}