import axiosInstance, { TokenStorage } from "@/api/axios";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const login = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/auth/login", credentials);
      const { accessToken, refreshToken, user } = response.data;

      TokenStorage.setAccessToken(accessToken);
      TokenStorage.setRefreshToken(refreshToken);
      TokenStorage.setUser(user);

      return { accessToken, refreshToken, user };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Login failed. Please try again."
      );
    }
  }
);

export const refreshTokens = createAsyncThunk(
  "auth/refreshTokens",
  async (_, { rejectWithValue }) => {
    try {
      const refreshToken = TokenStorage.getRefreshToken();
      const response = await axiosInstance.post("/auth/refresh-token", {
        refreshToken,
      });
      
      const { accessToken, refreshToken: newRefreshToken, user } = response.data;

      TokenStorage.setAccessToken(accessToken);
      TokenStorage.setRefreshToken(newRefreshToken);
      TokenStorage.setUser(user);

      return { accessToken, refreshToken: newRefreshToken, user };
    } catch (error) {
      TokenStorage.clearTokens();
      return rejectWithValue(
        error.response?.data?.message || "Session expired. Please log in again."
      );
    }
  }
);

export const logout = createAsyncThunk("auth/logout", async () => {
  TokenStorage.clearTokens();
  return true;
});

const initialState = {
  user: TokenStorage.getUser() || null,
  accessToken: TokenStorage.getAccessToken() || null,
  refreshToken: TokenStorage.getRefreshToken() || null,
  isAuthenticated: !!TokenStorage.getAccessToken(),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    resetError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Login failed";
      })

      .addCase(refreshTokens.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
      })
      .addCase(refreshTokens.rejected, (state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
      })
      
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
      });
  },
});

export const { resetError } = authSlice.actions;
export default authSlice.reducer;
