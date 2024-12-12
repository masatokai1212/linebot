import { VercelRequest, VercelResponse } from '@vercel/node';
import { Client, WebhookRequestBody } from '@line/bot-sdk';
import dotenv from 'dotenv';

dotenv.config();

// 実行時に必要なパラメータを環境変数から取得
const config = {
  channelSecret: process.env.CHANNEL_SECRET as string,
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN as string,
};

// LINE Messaging API Clientの初期化
const lineClient = new Client({
  channelSecret: config.channelSecret,
  channelAccessToken: config.channelAccessToken,
});

export default (req: VercelRequest, res: VercelResponse) => {
  if (req.method === 'GET') {
    res.status(200).send('Success');
    return;
  }

  // ユーザーがbotに送ったメッセージをそのまま返す
  const { events } = req.body as WebhookRequestBody;
  events.forEach((event) => {
    switch (event.type) {
      case "message": {
        const { replyToken, message } = event;
        if (message.type === "text") {
          lineClient.replyMessage(replyToken, { type: "text", text: message.text });
        }

        break;
      }
      default:
        break;
    }
  });

  res.status(200).send("HTTP POST request sent to the webhook URL!");
};