import { Cell, StateInit, beginCell, storeStateInit, contractAddress, toNano } from 'ton-core';
import { hex } from '../build/main.compiled.json';
import qs from 'qs';
import qrcode from 'qrcode-terminal';
import { configDotenv } from 'dotenv';

configDotenv();

const TESTNET = process.env.TESTNET === 'true';

async function deployScript() {
  console.log(`Deploy script running on ${TESTNET ? 'testnet' : 'mainnet'}...`);

  const codeCell = Cell.fromBoc(Buffer.from(hex, "hex"))[0];
  const dataCell = new Cell();

  const stateInit: StateInit = {
    code: codeCell,
    data: dataCell,
  };

  const stateInitBuilder = beginCell();
  storeStateInit(stateInit)(stateInitBuilder);
  const stateInitCell = stateInitBuilder.endCell();

  const address = contractAddress(0, {
    code: codeCell,
    data: dataCell,
  });

  console.log('Address created: ', address.toString());

  const link = `https://${TESTNET ? 'test.' : ''}tonhub.com/transfer/` +
    address.toString({
      testOnly: TESTNET,
    }) +
    '?' +
    qs.stringify({
      text: 'Deploy contract',
      amount: toNano(1).toString(10),
      init: stateInitCell.toBoc({ idx: false }).toString('base64'),
    });
  
  qrcode.generate(link, { small: true, }, (qrc) => {
    console.log(`QR code: `, qrc);
  });
}

deployScript();
