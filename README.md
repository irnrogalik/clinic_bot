After cloning the project, you need to configure the application's access to AWS.
To connect a application to AWS, you need to create a new IAM user, create access keys for third-party service, 
and then run the following in the CLI:

`npm i`

`serverless config credentials --profile bot-profile --provider aws --key your_access_key_id --secret your_secret_access_key`

And then run:

`serverless deploy`

After that, you need to give the necessary permissions to created lambda role.
You need to give access to the following services:

- **DynamoDB**
- **SSM**
- **Logs**

You also need to generate a function URL for the lambda expression and use this URL to set a webhook for the Telegram bot.
To do this you need to send a GET request:

`https://api.telegram.org/bot`**{bot_token}**`/setWebhook?url=`**{generated_url}**

Then you need to create the BOT_TOKEN parameter in the Parameter Store and set your bot_token.

***Notice:***

1. Telegram bot must have at least the following commands: 
    - **start** - _start_
    - **make** - _Make appointment_
    - **show** - _Show current appointments_
    - **cancel** - _Cancel appointment_

2. In Dynamo you should have the following tables:
    - Appointment
        - id
        - currentState
        - doctorId
        - freeTimeSlotId
        - userId
    - Doctor
        - id
        - currentState
        - name
    - FreeTimeSlot
        - id
        - currentState
        - doctorId
        - timestamp
