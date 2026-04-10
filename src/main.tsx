import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import Notiflix from 'notiflix';

// Configure Notiflix
Notiflix.Notify.init({
  width: '300px',
  position: 'right-top',
  distance: '15px',
  opacity: 1,
  borderRadius: '10px',
  timeout: 4000,
  clickToClose: true,
  pauseOnHover: true,
});

Notiflix.Loading.init({
  backgroundColor: 'rgba(0,0,0,0.5)',
  svgColor: '#800000', // PNB Maroon
});

Notiflix.Report.init({
  width: '360px',
  backgroundColor: '#f8f8f8',
  borderRadius: '10px',
  backOverlay: true,
  backOverlayColor: 'rgba(0,0,0,0.5)',
  success: {
    titleColor: '#800000',
    buttonBackground: '#800000',
    svgColor: '#800000',
  },
  failure: {
    titleColor: '#800000',
    buttonBackground: '#800000',
    svgColor: '#800000',
  },
  warning: {
    titleColor: '#800000',
    buttonBackground: '#800000',
    svgColor: '#800000',
  },
  info: {
    titleColor: '#800000',
    buttonBackground: '#800000',
    svgColor: '#800000',
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
