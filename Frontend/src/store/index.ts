import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';
import authReducer from './authSlice';
import jobReducer from './jobSlice';

// --- Export All Types & Thunks from Slices ---
// This ensures components can still import directly from '../store' without breaking
export * from './authSlice';
export * from './jobSlice';

// --- Store Configuration ---
export const store = configureStore({
  reducer: {
    auth: authReducer,
    jobs: jobReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// --- Typed Hooks ---
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
