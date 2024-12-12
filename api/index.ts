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

app.post('/webhook', middleware(middlewareConfig), async (req: Request, res: Response): Promise<void> => {
  const events: WebhookEvent[] = req.body.events;
  try {
    await Promise.all(
      events.map(async (event: WebhookEvent) => {
        await textEventHandler(event);
      })
    );
    res.status(200).send('Success');
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error('Error handling event:', err);
    }
    res.status(500).send('Error');
  }
});

export default app;