import { InstallProvider } from "@slack/oauth";
import express from "express";
import serverless from 'serverless-http';

const app = express();

const scopes = [
  "app_mentions:read",
  "channels:history",
  "chat:write",
  "channels:read",
  "groups:history",
  "groups:write",
  "users.profile:read",
];
const userScopes = [];

const installer = new InstallProvider({
  clientId: process.env.SLACK_CLIENT_ID!,
  clientSecret: process.env.SLACK_CLIENT_SECRET!,
  authVersion: 'v2',
  stateSecret: "TEST_STATE_SECRET",
});

app.get('/slack/oauth_redirect', async (req, res) => {
  await installer.handleCallback(req, res);
});

app.get('/slack/install', async (req, res) => {
  await installer.handleInstallPath(req, res, {}, {
    scopes,
    userScopes,
  });
});

app.get('/health', async (_, res) => {
  res.json({"state": "healthy"});
});

module.exports.handler = serverless(app);
