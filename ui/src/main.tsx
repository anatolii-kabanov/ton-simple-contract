import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import App from './App';

const manifestUrl = 'https://github.com/anatolii-kabanov/ton-simple-contract/blob/main/ui/tonconnect-manifest.json';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      <App />
    </TonConnectUIProvider>
  </StrictMode>,
);

