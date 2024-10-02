import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import App from './app';

const manifestUrl = 'https://anatolii-kabanov.github.io/ton-simple-contract/tonconnect-manifest.json';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      <App />
    </TonConnectUIProvider>
  </StrictMode>,
);

