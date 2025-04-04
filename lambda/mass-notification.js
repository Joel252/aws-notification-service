import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

const snsClient = new SNSClient();

export const handler = async (event) => {
    try {
        const body = JSON.parse(event.body);
        const { topic, message } = body;

        // Validate request data
        if (!topic || !message) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Missing parameters (topic, message)." })
            };
        }

        // Send Notification
        const command = new PublishCommand({
            TopicArn: `${process.env.BASE_ARN}:${topic}`,
            Message: message
        });
        const response = await snsClient.send(command);

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Mass notification sent successfully.",
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