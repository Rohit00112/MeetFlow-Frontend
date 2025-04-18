import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiRequest, authenticatedRequest } from '@/lib/api';

// Define User type
interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

// Define Auth State
interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

// Initial state
const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null,
  isAuthenticated: false,
};

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: { email, password },
      });
      return data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Login failed');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (
    { name, email, password, profileImage }: { name: string; email: string; password: string; profileImage?: string | null },
    { rejectWithValue }
  ) => {
    try {
      // Determine avatar - use uploaded image or generate from initials
      let avatar = profileImage;

      // If no profile image was uploaded, use UI Avatars API to generate one based on initials
      if (!avatar) {
        avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4285F4&color=fff&size=200`;
      }

      const data = await apiRequest('/auth/register', {
        method: 'POST',
        body: { name, email, password, avatar },
      });
      return data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Registration failed');
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    // No need to call an API endpoint for logout, just clear the state
    return null;
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : 'Logout failed');
  }
});

export const fetchUserProfile = createAsyncThunk('auth/fetchUserProfile', async (_, { getState, rejectWithValue }) => {
  try {
    const data = await authenticatedRequest('/auth/me');
    return data.user;
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch user profile');
  }
});

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (
    { name, email, profileImage }: { name: string; email: string; profileImage?: string | null },
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as { auth: AuthState };
      
      if (!state.auth.user) {
        throw new Error('You must be logged in to update your profile');
      }

      // Determine avatar - use uploaded image, current avatar, or generate from initials
      let avatar = profileImage || state.auth.user.avatar;

      // If no profile image was uploaded and no current avatar, use UI Avatars API
      if (!avatar) {
        avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4285F4&color=fff&size=200`;
      }

      const data = await authenticatedRequest('/auth/update-profile', {
        method: 'PUT',
        body: { name, email, avatar },
      });
      
      return data.user;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update profile');
    }
  }
);

// Create the auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<{ token: string; user: User }>) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        // Save token to localStorage for API requests
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', action.payload.token);
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });

    // Register
    builder
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action: PayloadAction<{ token: string; user: User }>) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        // Save token to localStorage for API requests
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', action.payload.token);
        }
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });

    // Logout
    builder
      .addCase(logout.pending, (state) => {
        state.loading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        // Remove token from localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
        }
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch User Profile
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        // Remove token from localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
        }
      });

    // Update Profile
    builder
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = authSlice.actions;

export default authSlice.reducer;
