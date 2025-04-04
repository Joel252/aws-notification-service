# Notification Service - SNS/SES

This AWS-based notification service allows sending messages to multiple channels (email, SMS, push notifications) based on user configuration. It is designed to be flexible and easy to integrate with any application requiring a notification system.

![architecture](/images/architecture.png)

## Requeriments

1. The Lambda function must have an **IAM role with the following policies**:
    - **AmazonSNSFullAccess** or `sns:Publish` for sending SMS notifications.
    - **AmazonSESFullAccess** or `ses:SendEmail` for sending email notifications.
    - **AmazonS3ReadOnlyAccess** or `s3:GetObject` for accessing templates in S3.
    - **AWSLambdaBasicExecutionRole** for writing logs to CloudWatch.
2. **Node.js 20+** runtime for Lambda funcitons.
3. **SNS Topic** for sending mass notifications.
4. An **IAM credentials** with `AmazonAPIGatewayInvokeFullAccess` for API Gateway integration.

## Setup AWS services

Follow the steps in [Setup Services Manually](/docs/setup%20services%20manually.md) to configure the required AWS services.

## Environment variables

Ensure the following environment variables are configured in your Lambda functions:

| Variable              | Description                                           |
|-----------------------|-------------------------------------------------------|
| `S3_BUCKET`           | Name of the S3 bucket where templates are stored.     |
| `SES_SENDER_EMAIL`    | Verified email address in SES for sending emails.     |
| `BASE_ARN`            | ARN of the SNS topic for notifications.               |

## Message Templates

Message templates are stored in the `templates` directory and uploaded to S3. Examples include:

- **English Template**: [medical_appointment.json](/templates/medical_appointment.json)
- **Spanish Template**: [medical_appointment-es.json](/templates/medical_appointment-es.json)

To add or modify a template:

1. Edit or create a new JSON file in the `templates` directory.
2. Ensure placeholders (e.g., `{name}`, `{date}`) match the data sent in the request.
3. Upload the template to S3 manually or using the AWS CLI:

    ```bash
    aws s3 cp templates/medical_appointment.json s3://<your-bucket-name>/templates/
    ```

## Endpoints

**`POST /notifications/topics`**  
Send mass notifications to a topic (SMS, email, push, Lambda, SQS).

**Request Body Example:**

```json
{
    "topic": "medical-reminders",
    "message": "This is a test message for all subscribers."
}
```

**`POST /notifications`**  
Send a notification to specific user via SMS, email, or both using a template.

**Request Body Example:**

```json
{
    "to": {
        "sms": "+1234567890",
        "email": "user@example.com"
    },
    "template": "medical_appointment",
    "data": {
        "name": "John Doe",
        "date": "2023-10-15",
        "time": "10:00 AM"
    }
}
```
