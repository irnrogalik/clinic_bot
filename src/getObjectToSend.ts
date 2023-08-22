import { Appointment } from './appointment';
import { ObjectToSend, Message } from './interfaces';

export async function getObjectToSend(chatId: number, dataMessage: Message, isCallback: boolean): Promise<ObjectToSend> {
  const appointment = new Appointment();
  let result: ObjectToSend = {
    message: '',
    inlineKeyboard: []
  };
  const command: string = dataMessage.text || '';
  if (isCallback) {
    const callbackData = dataMessage.data.split('_');
    switch (callbackData[0]) {
      case 'make':
        result = await appointment.callbackMake(callbackData, chatId);
        break;
      case 'cancel':
        result = await appointment.callbackCancel(callbackData);
        break;
      default:
        result.message = 'Unexpected command';
    }
  } else {
    switch (command) {
      case '/start':
        result = appointment.start();
        break; 
      case '/make':
        result = await appointment.make();
        break; 
      case '/show':
        result = await appointment.show(chatId);
        break; 
      case '/cancel': 
        result = await appointment.cancel(chatId);
        break; 
      default:
        result.message = 'Unexpected command';
    }
  }
  return result;
}