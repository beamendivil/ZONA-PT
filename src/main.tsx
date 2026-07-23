import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ClerkProvider } from '@clerk/react'
import { AuthProvider, ClerkAuthProvider } from './contexts/AuthContext.tsx'
import { env } from './config/env.ts'

const app = env.clerkPublishableKey ? (
  <ClerkProvider publishableKey={env.clerkPublishableKey} afterSignOutUrl="/">
    <ClerkAuthProvider><App /></ClerkAuthProvider>
  </ClerkProvider>
) : (
  <AuthProvider><App /></AuthProvider>
)

createRoot(document.getElementById('root')!).render(<StrictMode>{app}</StrictMode>)
