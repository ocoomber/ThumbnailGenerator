import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Self-hosted fonts — the app runs fully offline.
import '@fontsource/inter-tight/500.css';
import '@fontsource/inter-tight/600.css';
import '@fontsource/inter-tight/700.css';
import '@fontsource/inter-tight/800.css';
import '@fontsource/inter-tight/900.css';
import '@fontsource/inter-tight/600-italic.css';
import '@fontsource/archivo-black/400.css';
import '@fontsource/bebas-neue/400.css';
import '@fontsource/oswald/700.css';

import './styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
