import { createRoot } from 'react-dom/client'
import App from './app/App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { AudioProvider } from './context/AudioContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { ToastProvider } from './components/ui/Toast'
import './styles/index.css'

createRoot(document.getElementById('root')).render(
  <ThemeProvider>
    <ToastProvider>
      <AuthProvider>
        <AudioProvider>
          <App />
        </AudioProvider>
      </AuthProvider>
    </ToastProvider>
  </ThemeProvider>
);
