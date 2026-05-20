import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Toaster } from "react-hot-toast";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 3000,
        style: {
          background: '#1f2937',
          color: '#fff',
          borderRadius: '12px',
          padding: '14px',
          fontSize: '14px',
        },
      }}
    />
    <App />
  </StrictMode>,
)
