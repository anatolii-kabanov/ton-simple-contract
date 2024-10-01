import { TonClient } from 'ton';
import { useAsyncInit } from './async-init';
import { getHttpEndpoint } from '@orbs-network/ton-access';

export function useTonClient() {

  return useAsyncInit(
    async () => new TonClient({
      endpoint: await getHttpEndpoint({ network: 'testnet' }),
    })
  );
};
