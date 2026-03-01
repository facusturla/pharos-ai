import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiClient, OutlookListItem, OutlookDetail, OutlookListParams } from '@/lib/api';

export const fetchOutlooks = createAsyncThunk(
  'outlook/fetchOutlooks',
  async (params?: OutlookListParams) => {
    const response = await apiClient.getOutlooks(params);
    return response.data;
  }
);

export const fetchOutlookDetail = createAsyncThunk(
  'outlook/fetchOutlookDetail',
  async (outlookId: string) => {
    const response = await apiClient.getOutlookDetail(outlookId);
    return response.data;
  }
);

interface OutlookState {
  outlooks: OutlookListItem[];
  pagination: {
    total: number; limit: number; offset: number;
    hasNext: boolean; hasPrevious: boolean;
    nextOffset: number | null; previousOffset: number | null;
  } | null;
  filters: { topic: string | null; dateFrom: string | null; dateTo: string | null };
  currentOutlook: OutlookDetail | null;
  loading: { list: boolean; detail: boolean };
  error: { list: string | null; detail: string | null };
}

const initialState: OutlookState = {
  outlooks: [],
  pagination: null,
  filters: { topic: null, dateFrom: null, dateTo: null },
  currentOutlook: null,
  loading: { list: false, detail: false },
  error: { list: null, detail: null },
};

const outlookSlice = createSlice({
  name: 'outlook',
  initialState,
  reducers: {
    clearCurrentOutlook: (state) => { state.currentOutlook = null; state.error.detail = null; },
    clearErrors: (state) => { state.error.list = null; state.error.detail = null; },
    setFilters: (state, action: PayloadAction<Partial<OutlookState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOutlooks.pending, (state) => { state.loading.list = true; state.error.list = null; })
      .addCase(fetchOutlooks.fulfilled, (state, action) => {
        state.loading.list = false;
        state.outlooks = action.payload.outlooks;
        state.pagination = action.payload.pagination;
        state.filters = action.payload.filters;
      })
      .addCase(fetchOutlooks.rejected, (state, action) => { state.loading.list = false; state.error.list = action.error.message || 'Failed'; });
    builder
      .addCase(fetchOutlookDetail.pending, (state) => { state.loading.detail = true; state.error.detail = null; })
      .addCase(fetchOutlookDetail.fulfilled, (state, action) => { state.loading.detail = false; state.currentOutlook = action.payload; })
      .addCase(fetchOutlookDetail.rejected, (state, action) => { state.loading.detail = false; state.error.detail = action.error.message || 'Failed'; });
  },
});

export const { clearCurrentOutlook, clearErrors, setFilters } = outlookSlice.actions;
export default outlookSlice.reducer;
