import { useEffect, useState } from 'react';
import { useTonClient } from './ton-client';
import { Address, OpenedContract } from 'ton-core';
import { useAsyncInit } from './async-init';
import { MainContract } from '../contracts/main-contract';

export function useMainContract() {
  const client = useTonClient();
  const [contractData, setContractData] = useState<null | {
    total_value: number;
    recent_address: Address;
    owner_address: Address;
  }>();

  const [balance, setBalance] = useState<number>(0);

  const mainContract = useAsyncInit(async () => {
    if (!client) return;

    const contract = new MainContract(Address.parse('EQB7cxKKlTKAWG9Z7E2yRrw75exZcd8Z1H_4nWN1MaHTWL4m'));

    return client.open(contract) as OpenedContract<MainContract>;
  }, [client]);

  useEffect(() => {
    const getData = async () => {
      if (!mainContract) return;
      setContractData(null);
      const data = await mainContract.getData();
      setContractData({
        total_value: data.total,
        recent_address: data.recent_sender,
        owner_address: data.owner_address,
      });
      const { balance } = await mainContract.getBalance();
      setBalance(balance);
    };
    getData();
  }, [mainContract]);

  return {
    contract_address: mainContract?.address?.toString(),
    contract_balance: balance,
    ...contractData
  }
}
