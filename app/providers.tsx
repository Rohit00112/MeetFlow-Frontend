"use client";

import React from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "@/redux/store";
// Redux-based authentication is now used instead of context-based
import ReduxProtectedLayout from "@/components/ReduxProtectedLayout";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ReduxProtectedLayout>{children}</ReduxProtectedLayout>
      </PersistGate>
    </Provider>
  );
}
