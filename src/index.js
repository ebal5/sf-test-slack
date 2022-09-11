"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const bolt_1 = require("@slack/bolt");
const awsLambdaReceiver = new bolt_1.AwsLambdaReceiver({
    signingSecret: process.env.SLACK_SIGNING_SECRET,
});
const app = new bolt_1.App({
    token: process.env.SLACK_BOT_TOKEN,
    receiver: awsLambdaReceiver,
    processBeforeResponse: true,
});
app.message('hello', ({ message, say }) => __awaiter(void 0, void 0, void 0, function* () {
    // say() sends a message to the channel where the event was triggered
    yield say({
        blocks: [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": `Hey there`
                },
                "accessory": {
                    "type": "button",
                    "text": {
                        "type": "plain_text",
                        "text": "Click Me"
                    },
                    "action_id": "button_click"
                }
            }
        ],
        text: `Hey there`
    });
}));
app.action('button_click', ({ body, ack, say }) => __awaiter(void 0, void 0, void 0, function* () {
    // Acknowledge the action
    yield ack();
    yield say(`<@${body.user.id}> clicked the button`);
}));
module.exports.handler = (event, context, callback) => __awaiter(void 0, void 0, void 0, function* () {
    const handler = yield awsLambdaReceiver.start();
    return handler(event, context, callback);
});
