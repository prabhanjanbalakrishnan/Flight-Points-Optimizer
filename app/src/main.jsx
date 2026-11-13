import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { savedTheme } from './utils/theme.js'

// Set the theme before the first paint so a light-mode visitor never sees a dark flash.
document.documentElement.dataset.theme = savedTheme()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
