import {call, put, takeEvery} from "redux-saga/effects";
import {authAPI} from "../api/todolists-api";
import {setIsLoggedInAC} from "../features/Login/auth-reducer";
import {setAppInitializedAC} from "./app-reducer";

export function* initializeAppWorkerSaga() {
    const res = yield call(authAPI.me)
    if (res.data.resultCode === 0) {
        yield put(setIsLoggedInAC(true));
    } else {

    }
    yield put(setAppInitializedAC(true));
}

export const initializeAppSagaAC = () => ({type: 'APP/ACTIVATE-INITIALIZE-APP-SAGA'})

export function* appWatcher() {
    yield takeEvery('APP/ACTIVATE-INITIALIZE-APP-SAGA', initializeAppWorkerSaga)
}