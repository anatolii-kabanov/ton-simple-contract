import { Cell, Address, toNano } from 'ton-core';
import { hex } from '../build/main.compiled.json';
import { Blockchain } from '@ton-community/sandbox';
import { MainContract } from '../wrappers/main-contract';
import '@ton-community/test-utils';

describe('main.fc contract tests', () => {
  it("Should get right most recent address", async () => {
    const codeCell  = Cell.fromBoc(Buffer.from(hex, 'hex'))[0];

    const blockchain = await Blockchain.create();

    const mainContract = blockchain.openContract(
      await MainContract.createFromConfig({}, codeCell)
    );

    const senderWallet = await blockchain.treasury('sender');

    // 1 ton = 50_000_000 grams
    const msgResult = await mainContract.sendInternalMsg(senderWallet.getSender(), toNano('0.05'));

    expect(msgResult.transactions).toHaveTransaction({
      from: senderWallet.address,
      to: mainContract.address,
      success: true,
    });

    const data = await mainContract.getData();

    expect(data.recent_sender.toString()).toBe(senderWallet.address.toString());

  });

});
