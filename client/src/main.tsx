import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    // <React.StrictMode> // StrictMode causes double renders which messes up socket connection sometimes if not handled
    <App />
    // </React.StrictMode>,
);
