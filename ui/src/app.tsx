import './app.css';
import { TonConnectButton } from '@tonconnect/ui-react';
import { useMainContract } from './hooks/main-contract';
import { useTonConnect } from './hooks/ton-connect';
import { fromNano } from 'ton-core';

// EQB7cxKKlTKAWG9Z7E2yRrw75exZcd8Z1H_4nWN1MaHTWL4m

function App() {
  const { 
    contract_address, contract_balance, total_value, recent_address, owner_address, sendValue, sendDeposit, sendWithdraw 
  } = useMainContract();

  const { connected } = useTonConnect();

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
          <div>{fromNano(contract_balance)}</div>
        </div>
        <div>
          <b>Recent Address: </b>
          <div>{recent_address?.toString()}</div>
          <b>Owner Address: </b>
          <div>{owner_address?.toString()}</div>
          <b>Total value: </b>
          <div>{total_value ?? 'Loading...'}</div>
        </div>
        {connected && <button onClick={sendValue}>Send 10</button>}
        {connected && <button onClick={sendDeposit}>Deposit 0.06 TON</button>}
        {connected && <button onClick={sendWithdraw}>Withdraw 0.05 TON</button>}
      </div>
    </div>
  );
}

export default App;

