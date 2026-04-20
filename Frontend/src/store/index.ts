import { configureStore, createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';
import { authService } from '../api/authService';

// --- Auth Types ---
export interface User {
  uid: string;
  email: string;
  displayName: string | null;
  role: 'candidate' | 'recruiter';
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

const initialAuthState: AuthState = {
  user: null,
  loading: true,
  error: null,
};

// --- Async Thunks ---
export const checkAuth = createAsyncThunk('auth/checkAuth', async (_, { rejectWithValue }) => {
  try {
    const data = await authService.checkAuth();
    return data.user as User;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.error || 'Session expired');
  }
});

export const login = createAsyncThunk('auth/login', async (credentials: any, { rejectWithValue }) => {
  try {
    const data = await authService.login(credentials);
    return data.user as User;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.error || 'Login failed');
  }
});

export const googleLogin = createAsyncThunk('auth/googleLogin', async ({ idToken, refreshToken }: { idToken: string, refreshToken: string }, { rejectWithValue }) => {
  try {
    const data = await authService.verifyGoogleAuth(idToken, refreshToken);
    return data.user as User;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.error || 'Google Login failed');
  }
});

export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await authService.logout();
    return null;
  } catch (error) {
    return rejectWithValue('Logout failed');
  }
});

// --- Auth Slice ---
const authSlice = createSlice({
  name: 'auth',
  initialState: initialAuthState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.user = action.payload;
        state.loading = false;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.user = null;
        state.loading = false;
      })
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload;
        state.loading = false;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(googleLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.user = action.payload;
        state.loading = false;
      })
      .addCase(googleLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.loading = false;
      });
  },
});

export const { setUser } = authSlice.actions;

// --- Store Configuration ---
export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// --- Types & Hooks ---
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
