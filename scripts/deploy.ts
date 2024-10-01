import { Cell, StateInit, beginCell, storeStateInit, contractAddress, toNano, address } from 'ton-core';
import { hex } from '../build/main.compiled.json';
import qs from 'qs';
import qrcode from 'qrcode-terminal';
import { configDotenv } from 'dotenv';
import { compile, NetworkProvider } from '@ton-community/blueprint';
import { MainContract } from '../wrappers/main-contract';

export async function run(provider: NetworkProvider) {
  console.log('Deploying contract...');
  console.log('Compile main contract...');
  const codeCell = await compile('main-contract');

  const myContract =  MainContract.createFromConfig(
    {
      number: 0,
      address: address('kQALX8dqKfDc-Le_qzhfrUrBxLJhW-ri3VLmJZUfLoLcofL9'),
      owner_address: address('kQALX8dqKfDc-Le_qzhfrUrBxLJhW-ri3VLmJZUfLoLcofL9')
    },
    codeCell
  );
  // EQD9QfsH9QUw9ZvhsxGz5SzbLbS1knQB6Dv-duBbYGSKMjzE - contract
  const openedContract = provider.open(myContract);

  console.log('Send deploy...');
  openedContract.sendDeploy(provider.sender(), toNano(0.05));

  await provider.waitForDeploy(myContract.address);
}
