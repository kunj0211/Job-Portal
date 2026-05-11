import { configureStore } from '@reduxjs/toolkit'
import {
	useDispatch,
	useSelector,
	type TypedUseSelectorHook,
} from 'react-redux'
import authReducer from './authSlice'
import { jobApi } from '../api/jobApi'

export * from './authSlice'

// --- Store Configuration ---
export const store = configureStore({
	reducer: {
		auth: authReducer,
		[jobApi.reducerPath]: jobApi.reducer,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: false,
		}).concat(jobApi.middleware),
})

// --- Typed Hooks ---
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
