import { Address, Cell, Contract, beginCell, contractAddress, ContractProvider, Sender, SendMode } from 'ton-core';
import { Maybe } from 'ton-core/dist/utils/maybe';

export class MainContract implements Contract {
  /**
   *
   */
  constructor(
    readonly address: Address,
    readonly init?: { code: Cell; data: Cell }
  ) {}

  static createFromConfig(config: any, code: Cell, workchain = 0) {
    const data = beginCell().storeAddress(Address.parse("EQBPABJHLy9WThhpL5UIiDIrUHWzz6Mjhq96hPP4TuMkGPsk")).storeUint(0, 32).endCell();
    const init = { code, data };
    const address = contractAddress(workchain, init);
    return new MainContract(address, init);
  }

  async sendInternalMsg(
    provider: ContractProvider,
    sender: Sender,
    value: bigint,
    body: Maybe<string | Cell> = beginCell().storeUint(1, 32).endCell(),
  ) {
    await provider.internal(sender, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: body,
    });
  }

  async getData(provider: ContractProvider) {
    const { stack } = await provider.get('get_the_latest_sender', []);
    return {
      recent_sender: stack.readAddress(),
    }
  }

  async getSum(provider: ContractProvider) {
    const { stack } = await provider.get('get_sum', []);
    return {
      sum: stack.readBigNumber(),
    }
  }
}