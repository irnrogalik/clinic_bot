To connect a project to AWS, you need to create a new user, get access keys, and then run it in the CLI:

`serverless config credentials --provider aws --key your_access_key_id --secret your_secret_access_key`

Next, you need to give the necessary permissions to this user. And then run:

`serverless deploy`

After that, you need to give the necessary permissions to lambda:

- dynamodb
- Logs
- SSM