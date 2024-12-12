import { VercelRequest, VercelResponse } from '@vercel/node';
import { middleware, MiddlewareConfig, WebhookEvent, TextMessage, MessageAPIResponseBase } from '@line/bot-sdk';
import express, { Application, Request, Response } from 'express';
import { Client, WebhookRequestBody } from '@line/bot-sdk';
import dotenv from 'dotenv';

dotenv.config();

const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN || '',
  channelSecret: process.env.CHANNEL_SECRET || '',
};

const middlewareConfig: MiddlewareConfig = config;
const client = new Client(config);

const app: Application = express();
app.use(express.json());

app.get('/', async (_: Request, res: Response): Promise<void> => {
  // 非同期処理を行う場合は、awaitを使用します
  // 例: const data = await someAsyncFunction();
  res.send('Hello, world!');
});

const textEventHandler = async (event: WebhookEvent): Promise<MessageAPIResponseBase | undefined> => {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return;
  }

  const { replyToken } = event;
  const { text } = event.message;

  const response: TextMessage = {
    type: 'text',
    text: text,
  };

  await client.replyMessage(replyToken, response);
};

app.post('/api/webhook', middleware(middlewareConfig), async (req: Request, res: Response): Promise<void> => {
  res.send("HTTP POST request sent to the webhook URL!");

  const { events } = req.body as WebhookRequestBody;
  events.forEach((event) => {
    switch (event.type) {
      case "message": {
        const { replyToken, message } = event;
        if (message.type === "text") {
          client.replyMessage(replyToken, { type: "text", text: message.text });
        }

        break;
      }
      default:
        break;
    }
  });
});

export default app;