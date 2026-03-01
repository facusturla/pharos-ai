import { configureStore } from '@reduxjs/toolkit';
import outlookReducer from './slices/outlookSlice';
import dashboardReducer from './slices/dashboardSlice';
import chatReducer from './slices/chatSlice';

export const store = configureStore({
  reducer: {
    outlook: outlookReducer,
    dashboard: dashboardReducer,
    chat: chatReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: { ignoredActions: ['persist/PERSIST'] } }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
