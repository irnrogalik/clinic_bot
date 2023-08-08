import {
  Button, InlineKeyboard, ObjectToSend,
  QueryGetParams, QueryUpdateParams, QueryPutParams, QueryParams
} from './interfaces';
import { Dynamo } from './dynamoDB';
import { getInlineKeyboard } from './helpers';

export class Appointment {
  private db = new Dynamo();
  message: string = '';
  inlineKeyboard: InlineKeyboard[] = [];

  start(): ObjectToSend {
    this.message = 'Hello. Please choose one option from the menu';
    return { message: this.message, inlineKeyboard: this.inlineKeyboard };
  }
  
  async make(): Promise<ObjectToSend> {
    try {
      this.message = 'Choose a doctor';
      const params: QueryParams = {
        TableName: 'Doctor',
        FilterExpression: 'currentState = :currentState',
        ExpressionAttributeValues: {
          ':currentState': 'Active'
        }
      };
      const doctors = await this.db.getAll(params);
      const buttons: Button[] = [];
      if (doctors.Items && doctors.Items.length) {
        for (const doctor of doctors.Items) {
          buttons.push(
            { text: doctor.name, callback_data: `make_doctor_${doctor.id}` }
          );
        }
      }
      this.inlineKeyboard = getInlineKeyboard(buttons);
    } catch (err) {
      console.log(err, 'errors')
    }
    return { message: this.message, inlineKeyboard: this.inlineKeyboard };
  }

  async show(chatId: number): Promise<ObjectToSend> {
    try {
      const params: QueryParams = {
        TableName : 'Appointment',
        FilterExpression: 'userId = :userId AND currentState = :currentState',
        ExpressionAttributeValues: {
          ':userId': chatId,
          ':currentState': 'Active',
        },
      };
      const appointments = await this.db.getAll(params);
      if (appointments.Items && appointments.Items.length) {
        const doctorIds = [...new Set(appointments.Items.map(a => a.doctorId))];
        const slotIds = [...new Set(appointments.Items.map(a => a.freeTimeSlotId))];
        const doctorExpressionAttributeValues = {};

        const doctorIdParams = doctorIds.map((doc, i) => {
          const param = `:id${i}`;
          doctorExpressionAttributeValues[param] = doc;
          return param;
        }).join(',');
        const doctorParams: QueryParams = {
          TableName: 'Doctor',
          FilterExpression: `id IN (${doctorIdParams})`,
          ExpressionAttributeValues: doctorExpressionAttributeValues
        };
        const doctors = await this.db.getAll(doctorParams);

        const slotExpressionAttributeValues = {};
        const slotIdParams = slotIds.map((slot, i) => {
          const param = `:id${i}`;
          slotExpressionAttributeValues[param] = slot;
          return param;
        }).join(',');
        const slotParams: QueryParams = {
          TableName: 'FreeTimeSlot',
          FilterExpression: `id IN (${slotIdParams})`,
          ExpressionAttributeValues: slotExpressionAttributeValues
        };
        const slots = await this.db.getAll(slotParams);
        
        for (let i = 0; i < appointments.Items.length; i++) {
          const appointment = appointments.Items[i];
          const doctor = doctors.Items.find(doc => doc.id === appointment.doctorId);
          const timeSlot = slots.Items.find(slot => slot.id === appointment.freeTimeSlotId);
          this.message =
            this.message.concat(`${ i + 1 }. Doctor: ${ doctor.name }, time: ${ new Date(timeSlot.timestamp).toLocaleString() } \n`);
        }
      } else {
        this.message = 'No current appointments';
      }
    } catch (err) {
        console.log(err, 'errors')
    }
    return { message: this.message, inlineKeyboard: this.inlineKeyboard };
  }

  async cancel(chatId: number): Promise<ObjectToSend> {
    try {
      const params: QueryParams = {
        TableName : 'Appointment',
        FilterExpression: 'userId = :userId AND currentState = :currentState',
        ExpressionAttributeValues: {
          ':userId': chatId,
          ':currentState': 'Active',
        },
      };
      const appointments = await this.db.getAll(params);
      if (appointments.Items && appointments.Items.length) {
        const doctorIds = [...new Set(appointments.Items.map(a => a.doctorId))];
        const slotIds = [...new Set(appointments.Items.map(a => a.freeTimeSlotId))];
    
        const doctorExpressionAttributeValues = {};
        const doctorIdParams = doctorIds.map((doc, i) => {
          const param = `:id${i}`;
          doctorExpressionAttributeValues[param] = doc;
          return param;
        }).join(',');
        const doctorParams: QueryParams = {
          TableName: 'Doctor',
          FilterExpression: `id IN (${doctorIdParams})`,
          ExpressionAttributeValues: doctorExpressionAttributeValues
        };
        const doctors = await this.db.getAll(doctorParams);
    
        const slotExpressionAttributeValues = {};
        const slotIdParams = slotIds.map((slot, i) => {
          const param = `:id${i}`;
          slotExpressionAttributeValues[param] = slot;
          return param;
        }).join(',');
        const slotParams: QueryParams = {
          TableName: 'FreeTimeSlot',
          FilterExpression: `id IN (${slotIdParams})`,
          ExpressionAttributeValues: slotExpressionAttributeValues
        };
        const slots = await this.db.getAll(slotParams);
        const buttons: Button[] = [];
        for (let i = 0; i < appointments.Items.length; i++) {
          const appointment = appointments.Items[i];
          const doctor = doctors.Items.find(doc => doc.id === appointment.doctorId);
          const timeSlot = slots.Items.find(slot => slot.id === appointment.freeTimeSlotId);
          const text = `${ doctor.name }, ${ new Date(timeSlot.timestamp).toLocaleString() }`;
          buttons.push(
            { text, callback_data: `cancel_appointment_${appointment.id}` }
          );
        }
        this.message = 'Choose an appointment to cancel';
        this.inlineKeyboard = getInlineKeyboard(buttons);
      } else {
        this.message = 'No current appointments';
      }
    } catch (err) {
      console.log(err, 'errors')
    }
    return { message: this.message, inlineKeyboard: this.inlineKeyboard };
  }

  async callbackMake(callbackData: string[], chatId: number): Promise<ObjectToSend> {
    try {
      if (callbackData[1] === 'doctor') {
        const params: QueryParams = {
          TableName : 'FreeTimeSlot',
          FilterExpression: 'doctorId = :doctorId AND currentState = :currentState',
          ExpressionAttributeValues: {
            ':doctorId': callbackData[2],
            ':currentState': 'Active',
          },
        };
        const freeTimeSlots = await this.db.getAll(params);
        const buttons: Button[] = [];
        if (freeTimeSlots.Items && freeTimeSlots.Items.length){
          for (const freeSlot of freeTimeSlots.Items) {
            const date = new Date(freeSlot.timestamp);
            buttons.push(
              { text: date.toLocaleString(), callback_data: `make_time_${freeSlot.id}`}
            );
          }
        }
        this.message = 'Choose a time';
        this.inlineKeyboard = getInlineKeyboard(buttons);
      } else if (callbackData[1] === 'time') {
        const paramFreeTime: QueryGetParams = {
          TableName : 'FreeTimeSlot',
          Key: { id: callbackData[2] }
        };
        const timeSlot = await this.db.getById(paramFreeTime);
        if (!timeSlot.Item) this.message = 'Something wrong. Try again';
        const paramDoctor: QueryGetParams = {
          TableName : 'Doctor',
          Key: { id: timeSlot.Item.doctorId }
        };
        const doctor = await this.db.getById(paramDoctor);
        if (doctor.Item && doctor.Item.currentState === 'Active' && timeSlot.Item.currentState === 'Active') {
          const putAppointmentParams: QueryPutParams = {
            TableName : 'Appointment',
            Item: {
              id: new Date().getTime().toString(),
              doctorId: timeSlot.Item.doctorId,
              freeTimeSlotId: timeSlot.Item.id,
              userId: chatId,
              currentState: 'Active'
            }
          };
          await this.db.put(putAppointmentParams);
          const updateFreeTimeSlotParams: QueryUpdateParams = {
            TableName : 'FreeTimeSlot',
            Key: { id: timeSlot.Item.id },
            UpdateExpression: 'set currentState = :state',
            ExpressionAttributeValues: { ':state': 'Busy' },
          };
          await this.db.update(updateFreeTimeSlotParams);
          this.message = `
            You have successfully made appointment with 
            the ${ doctor.Item.name } on ${ new Date(timeSlot.Item.timestamp).toLocaleString() }`;
        } else {
          this.message = 'Something wrong. Try again';
        }
      }
    } catch (err) {
      console.log(err, 'errors')
    }
    return { message: this.message, inlineKeyboard: this.inlineKeyboard };
  }

  async callbackCancel(callbackData): Promise<ObjectToSend> {
    try {
      const appointmentParam: QueryGetParams = {
        TableName : 'Appointment',
        Key: { id: callbackData[2] }
      };
      const appointment = await this.db.getById(appointmentParam);
      const updateAppoitmentParams: QueryUpdateParams = {
        TableName : 'Appointment',
        Key: { id: appointment.Item.id },
        UpdateExpression: 'set currentState = :state',
        ExpressionAttributeValues: { ':state': 'Canceled' },
      }
      await this.db.update(updateAppoitmentParams);

      const timeSlotParam: QueryGetParams = {
        TableName : 'FreeTimeSlot',
        Key: { id: appointment.Item.freeTimeSlotId }
      };
      const timeSlot = await this.db.getById(timeSlotParam);
      const updateFreeTimeSlotParams: QueryUpdateParams = {
        TableName : 'FreeTimeSlot',
        Key: { id: timeSlot.Item.id },
        UpdateExpression: 'set currentState = :state',
        ExpressionAttributeValues: { ':state': 'Active' },
      }
      await this.db.update(updateFreeTimeSlotParams);

      this.message = 'You have successfully canceled an appointment';
    } catch (err) {
      console.log(err, 'errors')
    }
    return { message: this.message, inlineKeyboard: this.inlineKeyboard };
  }

}