# Setup AWS Services Manually

This section describes the steps required to manually configure the AWS services needed for the notification system.

## Configure an S3 Bucket for Templates

Follow these steps to create an S3 bucket to make message templates (SMS and email) easily accessible from Lambda functions:

1. From the S3 console, create a new bucket and give it a name (e.g.:`notification.templates.1234` or any unique name).

2. Upload your JSON templates to a folder named `templates/` inside the bucket.

   ![upload templates](/images/templates-bucket.png)

> Ensure the region is the same as the one where your lambda function will run. Also, ensure the visibility is private to avoid unauthorized access.

## Configure Amazon SNS

To send mass notifications to multiple users via topics, you must first configure the SNS service:

1. Go to the SNS console and create a new topic:
   - **Topic type**: Standard.
   - **Topic name**: `notification-topic` (or a descriptive name).

   ![create topic](/images/notification-topic.png)

2. **_Optional:_** Configure subscriptions for the topic (for SMS, email, or any other endpoint (such as SQS or Lambda)).

> [!note]
> If you are in Sandbox mode, you need to register a phone number for testing.

## Configure Amazon SES

You need to verify a source in SES to be able to send emails to end users:

1. Verify the email address that will be used as the sender.

2. Alternatively, verify a domain to send emails from multiple addresses.

3. **_Optional:_** Configure sending limits.

> If you are in the sandbox environment, request to move your account to production to send emails to any address.

## Configure Lambda Functions

Lambda function configuration is the core of the system. These functions are responsible for processing requests and sending notifications.

1. Go to the Lambda console and create two Lambda functions:
   - **massNotification**:
     - File: `lambda/mass-notification.js`.
     - Purpose: Send mass notifications via an SNS topic.
   - **userNotification**:
     - File: `lambda/user-notification.js`.
     - Purpose: Send personalized notifications to specific users.

2. Ensure the following environment variables are configured in your Lambda functions:

   | Variable           | Description                                       |
   |--------------------|---------------------------------------------------|
   | `S3_BUCKET`        | Name of the S3 bucket where templates are stored. |
   | `SES_SENDER_EMAIL` | Verified email address in SES for sending emails. |
   | `BASE_ARN`         | ARN of the SNS topic for notifications.           |

3. Assign an IAM policy to each function with the respective permissions:

   | Permission                                                         | Usage                        |
   |--------------------------------------------------------------------|------------------------------|
   | `sns:Publish`                                                      | To send notifications.       |
   | `ses:SendEmail`                                                    | To send emails.              |
   | `s3:GetObject`                                                     | To access templates.         |
   | `logs:CreateLogGroup`, `logs:CreateLogStream`, `logs:PutLogEvents` | To write logs to CloudWatch. |

### IAM Policy Summary

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

> Ensure that the Lambda functions have an IAM policy with these minimum permissions.

## Configure API Gateway

API Gateway exposes Lambda functions as HTTP endpoints so they can be invoked by external applications. Additionally, IAM is used to authorize requests to the API Gateway, ensuring that only authenticated users or services can access the endpoints.

1. From the API Gateway console, create a new REST API:
   - **Name**: `notification-api`.
   - Integrates previously created Lambda functions.

   ![configure api](/images/configure-api.png)

2. Configure the endpoints:
   - **POST /notifications/topics**: Link this endpoint to the `massNotification` Lambda function.
   - **POST /notifications**: Link this endpoint to the `userNotification` Lambda function.

3. Configure authorization with IAM:
   - In the configuration of each endpoint, select **IAM Authorization** as the authorization method.

   ![authorization](/images/authorization.png)

   > This will require clients to sign their requests with valid IAM credentials.

4. Deploy the API to an environment (e.g., `dev` or `prod`).

5. Obtain the base URL of the API and use it in your client application.

---

### Client Configuration for IAM Authorization

To invoke endpoints protected by IAM, clients must sign their requests using AWS credentials. This can be done using libraries like [AWS SDK](https://aws.amazon.com/sdk/) or tools like [Postman](https://www.postman.com/).

![iam authorization](/images/request.png)

> [!note]
> By following these steps, the API Gateway will be configured to use IAM as the authorization method, providing an additional layer of security for the endpoints.
