# Setup Services Manually

This document describes the steps required to manually configure the AWS services needed for the notification system. Each service has a specific purpose in the system's workflow.

## Configure an S3 Bucket for Templates

**Reason**: Message templates (SMS and email) are stored in an S3 bucket to facilitate access from Lambda functions.

**Steps:**

1. Go to the S3 console in AWS.
2. Create a bucket:
   - **Bucket name**: `notification.templates.1234` (or a unique name).
   - Ensure the bucket is private.
3. Upload your JSON templates to a folder named `templates/` inside the bucket.

![upload templates](/images/templates-bucket.png)

> [!note]
> Make sure you are in the **region** where your Lambda functions will run.

## Configure Amazon SNS

**Reason**: SNS is used to send mass notifications to multiple users via topics.

**Steps:**

1. Go to the SNS console in AWS.
2. Create a new topic:
   - **Topic type**: Standard.
   - **Topic name**: `notification-topic` (or a descriptive name).
3. Optional: Configure subscriptions for the topic:
   - Add subscriptions for SMS, email, or any other endpoint (such as SQS or Lambda).

![create topic](/images/notification-topic.png)

> [!note]
> If you are in Sandbox mode, remember to register a phone number for testing.

## Configure Amazon SES

**Reason**: SES is used to send emails to users.

**Steps:**

1. Go to the SES console in AWS.
2. Verify an email address or domain:
   - Verify the email address that will be used as the sender (`SES_SENDER_EMAIL`).
   - Alternatively, verify a domain to send emails from multiple addresses.
3. Configure sending limits:
   - If you are in the sandbox environment, request to move your account to production to send emails to any address.

> [!note]
> Only move your account from sandbox to production when you have completed your tests and are ready to integrate it into your system.

## Configure Lambda Functions

**Reason**: Lambda functions are the core of the system, responsible for processing requests and sending notifications.

**Steps:**

1. Go to the Lambda console in AWS.
2. Create two Lambda functions:
   - **massNotification**:
     - File: `lambda/mass-notification.js`.
     - Purpose: Send mass notifications via an SNS topic.
   - **userNotification**:
     - File: `lambda/user-notification.js`.
     - Purpose: Send personalized notifications to specific users.
3. Configure environment variables:
   - `S3_BUCKET`: Name of the S3 bucket where templates are stored.
   - `SES_SENDER_EMAIL`: Email address verified in SES.
   - `BASE_ARN`: Base ARN of the SNS topic.
4. Assign an IAM policy to each function:
   - **Required permissions**:
     - `sns:Publish` to send notifications.
     - `ses:SendEmail` to send emails.
     - `s3:GetObject` to access templates.
     - `logs:CreateLogGroup`, `logs:CreateLogStream`, `logs:PutLogEvents` to write logs to CloudWatch.

### IAM Policy Summary

Ensure that the Lambda functions have an IAM policy with the following minimum permissions:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "sns:Publish",
                "ses:SendEmail",
                "s3:GetObject",
                "logs:CreateLogGroup",
                "logs:CreateLogStream",
                "logs:PutLogEvents"
            ],
            "Resource": "*"
        }
    ]
}
```

## Configure API Gateway

**Reason**: API Gateway exposes Lambda functions as HTTP endpoints so they can be invoked by external applications. Additionally, IAM is used to authorize requests to the API Gateway, ensuring that only authenticated users or services can access the endpoints.

**Steps:**

1. Go to the API Gateway console in AWS.
2. Create a new REST API:
   - **Name**: `notification-api`.
   - Integrate the previously created Lambdas.
   ![configure api](/images/configure-api.png)
3. Configure the endpoints:
   - **POST /notifications/topics**: Link this endpoint to the `massNotification` Lambda function.
   - **POST /notifications**: Link this endpoint to the `userNotification` Lambda function.
4. Configure authorization with IAM:
   - In the configuration of each endpoint, select **IAM Authorization** as the authorization method.
   - This will require clients to sign their requests with valid IAM credentials.
   ![authorization](/images/authorization.png)
5. Deploy the API to an environment (e.g., `dev` or `prod`).
6. Obtain the base URL of the API and use it in your client application.

### Client Configuration for IAM Authorization

To invoke endpoints protected by IAM, clients must sign their requests using AWS credentials. This can be done using libraries like [AWS SDK](https://aws.amazon.com/sdk/) or tools like [Postman](https://www.postman.com/).

![iam authorization](/images/request.png)

> [!note]
> By following these steps, the API Gateway will be configured to use IAM as the authorization method, providing an additional layer of security for the endpoints.
