export interface Message {
  message_id: number;
  chat: Chat;
  date: number;
  text?: string;
  id: number;
  message: Message;
  reply_markup?: {
    inline_keyboard: CallbackData[];
  };
  data: string | '';
}

export interface CallbackData {
  text: string;
  callback_data: string;
}

export interface Chat {
  id: number;
  first_name: string;
  last_name: string;
  username: string;
  type: string;
}

export interface QueryParams {
  TableName: string;
  FilterExpression: string;
  ExpressionAttributeValues: {}
}

export interface QueryGetParams {
  TableName: string;
  Key: { id: string; }
}

export interface QueryUpdateParams {
  TableName: string;
  Key: { id: string; }
  UpdateExpression: string;
  ExpressionAttributeValues: {};
}

export interface QueryPutParams {
  TableName: string;
  Item: {
    id: string;
    doctorId: string;
    freeTimeSlotId: string;
    userId: number;
    currentState: string;
  }
}

export interface Button {
  text: string;
  callback_data: string;
}

export interface InlineKeyboard {
  inline_keyboard: [ Button[] ];
  resize_keyboard: boolean;
}

export interface ObjectToSend {
  message: string;
  inlineKeyboard: InlineKeyboard[]
}
