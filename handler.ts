import * as telegramApi from 'node-telegram-bot-api';
import { Chat, Message } from './src/interfaces';
import { getObjectToSend } from './src/getObjectToSend';

const token = process.env.BOT_TOKEN;
const botT = new telegramApi(token);

export async function bot(event) {
  if (token) {
    const body = JSON.parse(event.body);
    console.log(event, 'event');

    const dataMessage: Message = body.message || body.callback_query;
    const isCallback = !!body.callback_query;

    const chat: Chat = isCallback ? dataMessage.message.chat : dataMessage.chat;
    const chatId: number = chat.id;
    const { message, inlineKeyboard } = await getObjectToSend(chatId, dataMessage, isCallback);

    if (inlineKeyboard.length) {
      for(let i = 0; i < inlineKeyboard.length; i++){
        await botT.sendMessage(
          chatId, 
          message.concat(`. Part ${ i+1 }:`), 
          { reply_markup: JSON.stringify(inlineKeyboard[i])}
        );
      }
    } else {
      await botT.sendMessage(chatId, message);
    }
  } else {
    console.log('Set the BOT_TOKEN environment variable to the lambda');
  }
};