import { useEffect, useState } from 'react';
import { useTonClient } from './ton-client';
import { Address, OpenedContract, toNano } from 'ton-core';
import { useAsyncInit } from './async-init';
import { MainContract } from '../contracts/main-contract';
import { useTonConnect } from './ton-connect';

export function useMainContract() {
  const client = useTonClient();
  const { sender } = useTonConnect();

  const sleep = (time: number) => new Promise((resolve) => setTimeout(resolve, time));

  const [contractData, setContractData] = useState<null | {
    total_value: number;
    recent_address: Address;
    owner_address: Address;
  }>();

  const [balance, setBalance] = useState<number>(0);

  const mainContract = useAsyncInit(async () => {
    if (!client) return;

    const contract = new MainContract(Address.parse('EQBOYhMUBrclAHU0rDQsUhDDQz9PRsu6bnMHFHrMwEUb1w_E'));

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
      await sleep(5 * 1000); // 5 seconds sleep
      getData();
    };
    getData();
  }, [mainContract]);

  return {
    contract_address: mainContract?.address?.toString(),
    contract_balance: balance,
    ...contractData,
    sendValue: async () => {
      return mainContract?.sendBodyValue(sender, toNano(0.05), 10);
    },
    sendDeposit: async () => {
      return mainContract?.sendDeposit(sender, toNano(0.06));
    },
    sendWithdraw: async () => {
      return mainContract?.sendWithdrawRequest(sender, toNano(0.05), toNano(0.05));
    }
  }
}
