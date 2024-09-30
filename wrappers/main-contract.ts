import { Address, Cell, Contract, beginCell, contractAddress, ContractProvider, Sender, SendMode } from 'ton-core';
import { Maybe } from 'ton-core/dist/utils/maybe';

export type MainContractConfig = {
  number: number;
  address: Address;
  owner_address: Address;
};

export function mainContractConfigToCell(config: MainContractConfig): Cell {
  return beginCell()
    .storeUint(config.number, 32)
    .storeAddress(config.address)
    .storeAddress(config.owner_address)
    .endCell();
}

export class MainContract implements Contract {
  /**
   *
   */
  constructor(
    readonly address: Address,
    readonly init?: { code: Cell; data: Cell }
  ) {}

  static createFromConfig(config: MainContractConfig, code: Cell, workchain = 0) { 
    const data = mainContractConfigToCell(config);
    const init = { code, data };
    const address = contractAddress(workchain, init);
    return new MainContract(address, init);
  }

  async sendInternalMsg(
    provider: ContractProvider,
    sender: Sender,
    value: bigint,
    body: Maybe<string | Cell> = beginCell().storeUint(1, 32).storeUint(10, 32).endCell(),
  ) {
    await provider.internal(sender, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: body,
    });
  }

  async sendBodyValue(
    provider: ContractProvider,
    sender: Sender,
    value: bigint,
    bvalue: number
  ) {
    const body = beginCell()
      .storeUint(1, 32)
      .storeUint(bvalue, 32)
      .endCell();

    await provider.internal(sender, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: body,
    });
  }

  async sendDeposit(
    provider: ContractProvider,
    sender: Sender,
    value: bigint
  ) {
    const body = beginCell()
      .storeUint(2, 32)
      .endCell();

    await provider.internal(sender, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: body,
    });
  }

  async sendNoOpCodeDeposit(
    provider: ContractProvider,
    sender: Sender,
    value: bigint
  ) {
    const body = beginCell()
      .endCell();

    await provider.internal(sender, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: body,
    });
  }

  async sendWithdrawRequest(
    provider: ContractProvider,
    sender: Sender,
    value: bigint,
    amount: bigint,
  ) {
    const body = beginCell()
      .storeUint(3, 32)
      .storeCoins(amount)
      .endCell();

    await provider.internal(sender, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: body,
    });
  }

  async getData(provider: ContractProvider) {
    const { stack } = await provider.get('get_contract_storage_data', []);
    return {
      total: stack.readNumber(),
      recent_sender: stack.readAddress(),
      owner_address: stack.readAddress(),
    }
  }

  async getSum(provider: ContractProvider) {
    const { stack } = await provider.get('get_sum', []);
    return {
      sum: stack.readNumber(),
    }
  }

  async getBalance(provider: ContractProvider) {
    const { stack } = await provider.get('balance', []);
    return {
      balance: stack.readNumber(),
    }
  }
}