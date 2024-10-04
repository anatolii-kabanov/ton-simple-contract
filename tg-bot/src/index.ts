import { Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';
import dotenv from 'dotenv';
import { Address, beginCell, toNano } from 'ton-core';
import qs from 'qs';
import { MainContract } from './main-contract';
import { getHttpEndpoint } from '@orbs-network/ton-access';
import { TonClient } from 'ton';

dotenv.config();

const bot = new Telegraf(process.env.TG_BOT_TOKEN!);

const MENU = Object.freeze({
  ADD: "Add 10",
  DEPOSIT: "Deposit 0.05",
  WITHDRAW: "Withdraw 0.06",
  GET_DATA: "Get contract data"
});

bot.start((ctx) => {
  ctx.reply('Welvome to TON simple contract!', {
    reply_markup: {
      keyboard: [
        [MENU.ADD],
        [MENU.DEPOSIT],
        [MENU.WITHDRAW],
        [MENU.GET_DATA],
      ]
    }
  })
});

bot.on(message("web_app_data"), (ctx) => ctx.reply("ok!"));

bot.hears(MENU.ADD, (ctx) => {
  const msg_body = beginCell()
    .storeUint(1, 32)
    .storeUint(10, 32)
    .endCell();
  const link = `https://test.tonhub.com/transfer/${
    Address.parse('EQBOYhMUBrclAHU0rDQsUhDDQz9PRsu6bnMHFHrMwEUb1w_E').toString({
      testOnly: true,
    })
  }?${
    qs.stringify({
      text: 'Test bot sending required amount',
      amount: toNano(0.05),
      bin: msg_body.toBoc({ idx: false }).toString('base64'),
    })
  }`;
  ctx.reply('To add 10, please sign transaction:', { 
    reply_markup: {
      inline_keyboard: [
        [{
          text: 'Sign transaction',
          url: link,
        }]
      ]
    }
  });
});

bot.hears(MENU.DEPOSIT, (ctx) => {
  const msg_body = beginCell()
    .storeUint(2, 32)
    .endCell();
  const link = `https://test.tonhub.com/transfer/${
    Address.parse('EQBOYhMUBrclAHU0rDQsUhDDQz9PRsu6bnMHFHrMwEUb1w_E').toString({
      testOnly: true,
    })
  }?${
    qs.stringify({
      text: 'Test bot sending required deposit',
      amount: toNano(0.05),
      bin: msg_body.toBoc({ idx: false }).toString('base64'),
    })
  }`;
  ctx.reply('To deposit funds, please sign transaction:', { 
    reply_markup: {
      inline_keyboard: [
        [{
          text: 'Sign transaction',
          url: link,
        }]
      ]
    }
  });
});

bot.hears(MENU.WITHDRAW, (ctx) => {
  const msg_body = beginCell()
    .storeUint(3, 32)
    .storeCoins(toNano(0.06))
    .endCell();
  const link = `https://test.tonhub.com/transfer/${
    Address.parse('EQBOYhMUBrclAHU0rDQsUhDDQz9PRsu6bnMHFHrMwEUb1w_E').toString({
      testOnly: true,
    })
  }?${
    qs.stringify({
      text: 'Test bot getting required withdraw',
      amount: toNano(0.05),
      bin: msg_body.toBoc({ idx: false }).toString('base64'),
    })
  }`;
  ctx.reply('To withdraw funds, please sign transaction:', { 
    reply_markup: {
      inline_keyboard: [
        [{
          text: 'Sign transaction',
          url: link,
        }]
      ]
    }
  });
});

bot.hears(MENU.GET_DATA, async (ctx) => {
  const tonClient = new TonClient({
    endpoint: await getHttpEndpoint({ network: 'testnet' }),
  })
  const contract = new MainContract(Address.parse('EQBOYhMUBrclAHU0rDQsUhDDQz9PRsu6bnMHFHrMwEUb1w_E'));
  const openedContract = tonClient.open(contract);
  const data = await openedContract.getData();
  
  ctx.reply(`Contract owner address: ${data.owner_address}\n recent address: ${data.recent_sender}\n total: ${data.total}`);
});

bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
