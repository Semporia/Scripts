import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';
import SocksProxyAgent from 'socks-proxy-agent';

const envFound = dotenv.config();
if (envFound.error) {
  throw new Error("⚠️  Couldn't find .env file  ⚠️");
}
if (!process.env.BOT_TOKEN) {
  throw new Error("⚠️  Couldn't find env BOT_TOKEN  ⚠️");
}

const token = process.env.BOT_TOKEN;
const agent = new SocksProxyAgent(process.env.PROXY);
const bot = new Telegraf(token, {
  telegram: {
    agent
  }
})

bot.start((ctx) => ctx.reply('Welcome'))
bot.help((ctx) => ctx.reply('Send me a sticker'))
bot.on('sticker', (ctx) => ctx.reply('👍'))
bot.hears('hi', (ctx) => ctx.reply('Hey there'))
bot.launch()

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
