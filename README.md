# Notificación Service – SMS, Email y Push

This notification service in AWS allows messages to be sent to different channels (email, SMS, push notifications) depending on the user's configuration.

![overview]()

> [!note]
> This system is designed to be flexible, and easy to integrate with any application that requires a notification service.

## Requeriments

1. AWS Account with **permissions for Lambda, API Gateway and SNS**.
2. **Node.js 18+** installed in your development environment.
3. **ARN of an SNS Topic for sending emails**.

## Setup AWS services

See [setup services manually](/docs/setup%20services%20manually.md) for steps to configure the necessary services in AWS.

## Usage

### Endpoints

`POST /notification`:  
Send a message via SMS or email in the format corresponding to the selected template.

### How to change/add a template?

Message templates are located in the `lambda/templates.js` file. If you want to add or modify a template, edit the template dictionary.

> [!note]
> Just make sure the placeholders ({name}, {date}, etc.) match the data sent in the request.

### Example requests

**Send a SMS:**

```bash
curl -X POST https://your-api.execute-api.us-east-1.amazonaws.com/prod/notification \
   -H "Content-Type: application/json" \
   -d '{
         "type": "sms",
         "to": "+1234567890",
         "template": "medical_appointment",
         "data": {
            "name": "Carlos",
            "date": "2025-04-10",
            "time": "10:00 AM"
         }
      }'
```

![sms response]()

**Send a Email:**

```bash
curl -X POST https://your-api.execute-api.us-east-1.amazonaws.com/prod/notification \
   -H "Content-Type: application/json" \
   -d '{
         "type": "email",
         "to": "sample@example.com",
         "template": "order_sent",
         "data": {
            "name": "Ana",
            "order_id": "98765"
         }
      }'
```

![email response]()
