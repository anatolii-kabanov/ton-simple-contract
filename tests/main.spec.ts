import { Cell, Address, toNano, beginCell } from 'ton-core';
import { hex } from '../build/main.compiled.json';
import { Blockchain, SandboxContract, TreasuryContract } from '@ton-community/sandbox';
import { MainContract } from '../wrappers/main-contract';
import { compile } from '@ton-community/blueprint';
import '@ton-community/test-utils';

describe('main.fc contract tests', () => {
  let blockchain: Blockchain;
  let myContract: SandboxContract<MainContract>;
  let initWallet: SandboxContract<TreasuryContract>;
  let ownerWallet: SandboxContract<TreasuryContract>;
  let codeCell: Cell;

  beforeAll(async () => {
    codeCell = await compile('main-contract');
  })

  beforeEach(async () => {
    blockchain = await Blockchain.create();
    initWallet = await blockchain.treasury('initAddress');
    ownerWallet = await blockchain.treasury('ownerAddress');

    myContract = blockchain.openContract(
      await MainContract.createFromConfig({
        number: 0,
        address: initWallet.address,
        owner_address: ownerWallet.address
      }, codeCell)
    );
  });

  it("Should get right most recent address", async () => {
    const senderWallet = await blockchain.treasury('sender');
    const bvalue = 5;
    // 1 ton = 50_000_000 grams
    const msgResult = await myContract.sendBodyValue(senderWallet.getSender(), toNano('0.05'), bvalue);
    
    expect(msgResult.transactions).toHaveTransaction({
      from: senderWallet.address,
      to: myContract.address,
      success: true,
    });

    const data = await myContract.getData();

    expect(data.recent_sender.toString()).toBe(senderWallet.address.toString());
    expect(data.total).toEqual(bvalue);
  });

  it("Should get sum", async () => {
    const senderWallet = await blockchain.treasury('sender');
    const value = toNano('0.05');
    const bValue = 10;
    // 1 ton = 50_000_000 grams
    let msgResult = await myContract.sendBodyValue(senderWallet.getSender(), value, bValue);

    expect(msgResult.transactions).toHaveTransaction({
      from: senderWallet.address,
      to: myContract.address,
      success: true,
    });

    let data = await myContract.getSum();

    expect(data.sum).toBe(bValue);

    msgResult = await myContract.sendBodyValue(senderWallet.getSender(), value, bValue);

    data = await myContract.getSum();

    expect(data.sum).toBe(bValue * 2);
  });

  it("Should deposit funds", async () => {
    const senderWallet = await blockchain.treasury('sender');
    const value = toNano('5');
    // 1 ton = 50_000_000 grams
    const msgResult = await myContract.sendDeposit(senderWallet.getSender(), value);

    expect(msgResult.transactions).toHaveTransaction({
      from: senderWallet.address,
      to: myContract.address,
      success: true,
    });

    const data = await myContract.getBalance();
    expect(data.balance).toBeGreaterThan(toNano(4.99));
  });

  it("Should return deposit funds as no op command is sent", async () => {
    const senderWallet = await blockchain.treasury('sender');
    const value = toNano('5');
    // 1 ton = 50_000_000 grams
    const msgResult = await myContract.sendNoOpCodeDeposit(senderWallet.getSender(), value);

    expect(msgResult.transactions).toHaveTransaction({
      from: senderWallet.address,
      to: myContract.address,
      success: false,
    });

    const data = await myContract.getBalance();
    expect(data.balance).toEqual(0);
  });

  it("Should withdraw from balance on behalf of owner", async () => {
    const senderWallet = await blockchain.treasury('sender');
    const value = toNano('5');
    // 1 ton = 50_000_000 grams
    const msgResult = await myContract.sendDeposit(senderWallet.getSender(), value);
    const withdrawRequest = await myContract.sendWithdrawRequest(ownerWallet.getSender(), toNano(0.05), toNano(1));

    expect(withdrawRequest.transactions).toHaveTransaction({
      from: myContract.address,
      to: ownerWallet.address,
      success: true,
      value: toNano(1)
    });
  });

  it("Should fail withdraw from balance on behalf of non-owner", async () => {
    const senderWallet = await blockchain.treasury('sender');
    const value = toNano('5');
    // 1 ton = 50_000_000 grams
    await myContract.sendDeposit(senderWallet.getSender(), value);
    const withdrawRequest = await myContract.sendWithdrawRequest(senderWallet.getSender(), toNano(0.05), toNano(1));

    expect(withdrawRequest.transactions).toHaveTransaction({
      from: senderWallet.address,
      to: myContract.address,
      success: false,
      exitCode: 103,
    });
  });

  it("Should fail withdraw from balance because lack of balance", async () => {
    const withdrawRequest = await myContract.sendWithdrawRequest(ownerWallet.getSender(), toNano(0.05), toNano(1));

    expect(withdrawRequest.transactions).toHaveTransaction({
      from: ownerWallet.address,
      to: myContract.address,
      success: false,
      exitCode: 104,
    });
  });

  it("Should withdraw all from balance on behalf of owner and destory contract", async () => {
    const senderWallet = await blockchain.treasury('sender');
    const value = toNano('5');
    // 1 ton = 50_000_000 grams
    const msgResult = await myContract.sendDeposit(senderWallet.getSender(), value);
    const withdrawDestoryRequest = await myContract.sendWithdrawDestroyRequest(ownerWallet.getSender(), toNano(0.05), toNano(0.5));

    expect(withdrawDestoryRequest.transactions).toHaveTransaction({
      from: myContract.address,
      to: ownerWallet.address,
      success: true,
      value(x) {
          // We sent toNano(0.05) and it should be returned back 
          return x !== undefined && x >= toNano(0.04);
      },
    });
  });
});
