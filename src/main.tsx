import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import { ThemeProvider } from './contexts/ThemeContext.tsx';
import { StudyDataProvider } from './contexts/StudyDataContext.tsx';
import { PomodoroProvider } from './contexts/PomodoroContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <StudyDataProvider>
          <PomodoroProvider>
            <App />
          </PomodoroProvider>
        </StudyDataProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
);