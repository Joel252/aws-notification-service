import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const s3Client = new S3Client();
const snsClient = new SNSClient();
const sesClient = new SESClient();

// Function to get templates from S3
async function getTemplateFromS3(templateName) {
    try {
        const params = { Bucket: process.env.S3_BUCKET, Key: `templates/${templateName}.json` };
        const { Body } = await s3Client.send(new GetObjectCommand(params));
        const template = await Body.transformToString();

        return JSON.parse(template);
    } catch (error) {
        throw new Error(`Template ${templateName} not found.`);
    }
}

// Function to format messages
function formatMessage(message, data) {
    Object.keys(data).forEach(key => {
        message = message.replace(`{${key}}`, data[key]);
    });

    return message;
}

export const handler = async (event) => {
    try {
        const body = JSON.parse(event.body);
        const { to, template, data } = body;

        // Validate request data
        if (!to || !template || !data) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Missing parameters (to, template, data)." })
            };
        }

        // Obtain template from S3
        const templateJson = await getTemplateFromS3(template);

        const responses = [];
        // Send SMS notification
        if (to.sms) {
            // Format message using a template
            const message = formatMessage(templateJson.sms, data);

            const command = new PublishCommand({ PhoneNumber: to.sms, Message: message });
            const response = await snsClient.send(command);

            // Record response
            responses.push({ channel: "sms", phone: to.sms, response });
        }

        // Send email notification
        if (to.email) {
            // Format message using a template
            const message = formatMessage(templateJson.email.body, data);

            const command = new SendEmailCommand({
                Destination: { ToAddresses: [to.email] },
                Message: {
                    Body: { Text: { Data: message } },
                    Subject: { Data: templateJson.email.subject }
                },
                Source: process.env.SES_SENDER_EMAIL
            });
            const response = await sesClient.send(command);

            // Record response
            responses.push({ channel: "email", email: to.email, response });
        }

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: `Notification sent successfully.`,
                responses
            })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
