import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import authService from './authService'


interface UserData {
  name: string;
  email: string;
  password: string;
}

interface User {
  email: string;
  password: string;
}

interface AuthState {
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  user: string | null;
  message: string;
}

const initialState: AuthState = {
  isLoading: false,
  isError: false,
  isSuccess: false,
  user: null,
  message: '',
};


// Get user from localStorage
// const initialState.user = JSON.parse(localStorage.getItem('user'))

// Register user
export const register = createAsyncThunk(
  'auth/register',
  async (userData: UserData, thunkAPI: any) => {
    try {
      return await authService.register(userData)
    } catch (error: any) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString()
      return thunkAPI.rejectWithValue(message)
    }
  }
)

// Login user
export const login = createAsyncThunk('auth/login', async (userData: User, thunkAPI: any) => {
  try {
    return await authService.login(userData)
  } catch (error: any) {
    const message =
      (error.response && error.response.data && error.response.data.message) ||
      error.message ||
      error.toString()
    return thunkAPI.rejectWithValue(message)
  }
})

export const logout = createAsyncThunk('auth/logout', async () => {
  await authService.logout()
})

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false
      state.isSuccess = false
      state.isError = false
      state.message = ''
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => {
        state.isLoading = true
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        state.user = action.payload
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        // state.message = action.payload
        state.user = null
      })
      .addCase(login.pending, (state) => {
        state.isLoading = true
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        state.user = action.payload
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        // state.message = action.payload
        state.user = null
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null
      })
  },
})

export const { reset } = authSlice.actions
export default authSlice.reducer
