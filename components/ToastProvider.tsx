'use client';

import { Toaster } from 'react-hot-toast';

export default function ToastProvider() {
  return (
    <Toaster
      position="top-center"
      reverseOrder={false}
      gutter={8}
      toastOptions={{
        duration: 5000,
        style: {
          background: '#fff',
          color: '#333',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          borderRadius: '8px',
          padding: '12px 16px',
        },
        success: {
          style: {
            background: '#f0fff4',
            border: '1px solid #c6f6d5',
          },
          iconTheme: {
            primary: '#38a169',
            secondary: '#fff',
          },
        },
        error: {
          style: {
            background: '#fff5f5',
            border: '1px solid #fed7d7',
          },
          iconTheme: {
            primary: '#e53e3e',
            secondary: '#fff',
          },
        },
      }}
    />
  );
}
