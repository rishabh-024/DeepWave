import { createRoot } from 'react-dom/client'
import App from './app/App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { AudioProvider } from './context/AudioContext.jsx'
import './styles/index.css'

createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <AudioProvider>
      <App/>
    </AudioProvider>
  </AuthProvider>
);
