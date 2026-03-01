import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient, DashboardOutlook, Topic } from '@/lib/api';

export const fetchDashboardOutlooks = createAsyncThunk(
  'dashboard/fetchDashboardOutlooks',
  async () => {
    const response = await apiClient.getDashboardOutlooks();
    return response.data.latest_outlooks;
  }
);

export const fetchAvailableTopics = createAsyncThunk(
  'dashboard/fetchAvailableTopics',
  async () => {
    const response = await apiClient.getAvailableTopics();
    return response.available_topics;
  }
);

interface DashboardState {
  latestOutlooks: DashboardOutlook[];
  topics: Topic[];
  loading: { outlooks: boolean; topics: boolean };
  error: { outlooks: string | null; topics: string | null };
}

const initialState: DashboardState = {
  latestOutlooks: [],
  topics: [],
  loading: { outlooks: false, topics: false },
  error: { outlooks: null, topics: null },
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.error.outlooks = null;
      state.error.topics = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardOutlooks.pending, (state) => { state.loading.outlooks = true; state.error.outlooks = null; })
      .addCase(fetchDashboardOutlooks.fulfilled, (state, action) => { state.loading.outlooks = false; state.latestOutlooks = action.payload; })
      .addCase(fetchDashboardOutlooks.rejected, (state, action) => { state.loading.outlooks = false; state.error.outlooks = action.error.message || 'Failed'; });
    builder
      .addCase(fetchAvailableTopics.pending, (state) => { state.loading.topics = true; state.error.topics = null; })
      .addCase(fetchAvailableTopics.fulfilled, (state, action) => { state.loading.topics = false; state.topics = action.payload; })
      .addCase(fetchAvailableTopics.rejected, (state, action) => { state.loading.topics = false; state.error.topics = action.error.message || 'Failed'; });
  },
});

export const { clearErrors } = dashboardSlice.actions;
export default dashboardSlice.reducer;
