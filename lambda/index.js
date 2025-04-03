import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import { TEMPLATES } from "./templates.js";

const snsClient = new SNSClient();

export const handler = async (event) => {
    try {
        const body = JSON.parse(event.body);
        const { type, to, template, data } = body;

        // Validate request data
        if (!type || !to || !template || !TEMPLATES[template]?.[type]) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Missing parameters or invalid template." })
            };
        }

        // Format message using template
        let message = TEMPLATES[template][type];
        Object.keys(data).forEach(key => {
            message = message.replace(`{${key}}`, data[key]);
        });

        // Configure SNS command
        const params = type === "sms"
            ? { PhoneNumber: to, Message: message }
            : { TopicArn: process.env.SNS_TOPIC_EMAIL, Message: message, Subject: "Important Alert!" };

        // Send notification
        const response = await snsClient.send(new PublishCommand(params));

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: `Notification sent via ${type.toUpperCase()}`,
                content: message,
                response
            })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
