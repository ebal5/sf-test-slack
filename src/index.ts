import { App, AwsLambdaReceiver } from "@slack/bolt";
import { InstallProvider } from "@slack/oauth";

const installer = new InstallProvider({
  clientId: process.env.SLACK_CLIENT_ID!,
  clientSecret: process.env.SLACK_CLIENT_SECRET!,
  stateSecret: "TEST_STATE_SECRET",
});

const awsLambdaReceiver = new AwsLambdaReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET!,
});

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  receiver: awsLambdaReceiver,
  processBeforeResponse: true,
  customRoutes: [
    {
      path: "/slack/install",
      method: ["GET"],
      handler: async (req, res) => {
        await installer.handleInstallPath(req, res, {}, {
          scopes: [
            "app_mentions:read",
            "channels:history",
            "chat:write",
            "channels:read",
            "groups:history",
            "groups:write",
            "users.profile:read",
          ],
          userScopes: [],
        });
      },
    },
    {
      path: "/slack/oauth_redirect",
      method: ["GET"],
      handler: async (req, res) => {
        await installer.handleCallback(req, res)
      },
    }
  ],
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
