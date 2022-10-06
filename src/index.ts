import { App, AwsLambdaReceiver, Installation } from "@slack/bolt";
import { DynamoDB } from "aws-sdk";

const awsLambdaReceiver = new AwsLambdaReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET!,
});

// TODO: DynamoDBに秘密情報保存

const dynamoClient = new DynamoDB.DocumentClient();

const authorizeFn = async ({teamId, enterpriseId}) => {
  return dynamoClient.get({
    TableName: 'slackTable',
    Key: {
      teamId: teamId
    }
  }).promise()
  .then((result) => {
    const installation:Installation = result.Item.installation as Installation;
    return {
      botToken: installation.bot.token,
      botId: installation.bot.id,
      botUserId: installation.bot.userId,
    };
  }).catch((err) => {
    throw new Error(err);
  });
}

const staticAuth = async ({teamId, enterpriseId}) => {
  return {
    botToken: process.env.SLACK_BOT_TOKEN,
    botId: 'xxxx',
    botUserId: 'xxxx',
  }
}

const app = new App({
  authorize: staticAuth,
  receiver: awsLambdaReceiver,
  processBeforeResponse: true,
});

app.message("hello", async ({ message, say }) => {
  // say() sends a message to the channel where the event was triggered
  await say({
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `Hey there`,
        },
        accessory: {
          type: "button",
          text: {
            type: "plain_text",
            text: "Click Me",
          },
          action_id: "button_click",
        },
      },
    ],
    text: `Hey there`,
  });
});

app.action("button_click", async ({ body, ack, say }) => {
  // Acknowledge the action
  await ack();
  await say(`<@${body.user.id}> clicked the button`);
});

module.exports.handler = async (event: any, context: any, callback: any) => {
  const handler = await awsLambdaReceiver.start();
  return handler(event, context, callback);
};
