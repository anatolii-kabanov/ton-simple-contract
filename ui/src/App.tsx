import './app.css';
import { TonConnectButton } from '@tonconnect/ui-react';
import { useMainContract } from './hooks/main-contract';

// EQB7cxKKlTKAWG9Z7E2yRrw75exZcd8Z1H_4nWN1MaHTWL4m

function App() {
  const { contract_address, contract_balance, total_value, recent_address, owner_address } = useMainContract();
  return (
    <div className='app'>
      <div>
        <TonConnectButton />
      </div>
      <div>
        <div>
          <b>Contract Address: </b>
          <div>{contract_address}</div>
          <b>Contract Balance: </b>
          <div>{contract_balance}</div>
        </div>
        <div>
          <b>Recent Address: </b>
          <div>{recent_address?.toString()}</div>
          <b>Owner Address: </b>
          <div>{owner_address?.toString()}</div>
          <b>Total value: </b>
          <div>{total_value ?? 'Loading...'}</div>
        </div>
      </div>
    </div>
  );
}

export default App;

