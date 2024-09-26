import { Cell, contractAddress, toNano, Address, beginCell } from 'ton-core';
import { getHttpV4Endpoint } from '@orbs-network/ton-access';
import { hex } from '../build/main.compiled.json';
import { TonClient4 } from 'ton';
import qs from 'qs';
import qrcode from 'qrcode-terminal';
import { configDotenv } from 'dotenv';

configDotenv();

const TESTNET = process.env.TESTNET === 'true';

async function onChainTestScript() {
  console.log(`Onchain test running on ${TESTNET ? 'testnet' : 'mainnet'}...`);

  const codeCell = Cell.fromBoc(Buffer.from(hex, "hex"))[0];
  const dataCell = new Cell();

  const address = contractAddress(0, {
    code: codeCell,
    data: dataCell,
  });

  console.log('Contract address: ', address.toString());

  const endpoint = await getHttpV4Endpoint({
    network: TESTNET ? 'testnet' : 'mainnet',
  });

  const testClient = new TonClient4({ endpoint });
  const latestBlock = await testClient.getLastBlock();
  const status = await testClient.getAccount(latestBlock.last.seqno, address);

  if (status.account.state.type !== 'active') {
    console.error('Contract is not active');
    return;
  }

  console.log('Contract is active: ', status.account.state.type);

  const body = beginCell()
    .storeUint(1, 32)
    .endCell();

  const link = `https://${TESTNET ? 'test.' : ''}tonhub.com/transfer/` +
    address.toString({
      testOnly: TESTNET,
    }) +
    '?' +
    qs.stringify({
      text: 'Test simple message',
      amount: toNano("0.005").toString(10),
      bin: body.toBoc().toString('base64'),
    });
  
  qrcode.generate(link, { small: true, }, (qrc) => {
    console.log(`QR code: `, qrc);
  });

  let recent_sender_archive: Address;

  setInterval(async () => {
    const latestBlock = await testClient.getLastBlock();
    const { exitCode, result } = await testClient.runMethod(
      latestBlock.last.seqno,
      address,
      'get_the_latest_sender'
    );

    if (exitCode !== 0) {
      console.log('Run method failed: ', exitCode);
      return;
    }
    if (result[0].type !== 'slice') {
      console.log('Unknown result type: ', result[0].type);
      return;
    }

    const cs = result[0].cell.beginParse();
    const most_recent_sender = cs.loadAddress();

    if (most_recent_sender && most_recent_sender.toString() !== recent_sender_archive?.toString()) {
      console.log('New recent sender address found: ', most_recent_sender.toString({ testOnly: true }));
      recent_sender_archive = most_recent_sender;
    }
  }, 2000);

  let total_sum: bigint;

  setInterval(async () => {
    const latestBlock = await testClient.getLastBlock();
    const { exitCode, result } = await testClient.runMethod(
      latestBlock.last.seqno,
      address,
      'get_sum'
    );

    if (exitCode !== 0) {
      console.log('Run method failed: ', exitCode);
      return;
    }
    if (result[0].type !== 'int') {
      console.log('Unknown result type: ', result[0].type);
      return;
    }

    
    const sum = result[0].value;

    if (sum !== undefined && total_sum !== sum) {
      console.log('New total sum found: ', sum);
      total_sum = sum;
    }
  }, 2000);
}

onChainTestScript();
