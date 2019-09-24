const { createServer } = require('http');
const express = require('express');
require('dotenv/config')
const { createEventAdapter } = require('@slack/events-api');
const { WebClient } = require('@slack/web-api');

const slackSigningSecret = process.env.SECRET;
const token = process.env.TOKEN;
const channel = process.env.CHANNEL;
const port = process.env.PORT || 3000;

const slackEvents = createEventAdapter(slackSigningSecret);

const app = express();
const web = new WebClient(token);

app.use('/slack/events', slackEvents.expressMiddleware());

app.get('/question', async function (req, res) {
    const result = await web.chat.postMessage({
        text: req.query.text,
        channel: channel,
        thread_ts: req.query.thread_ts
    });
    res.send(result);
});

slackEvents.on('message', (event) => {
    console.log(`Received a message event: user ${event.user} in channel ${event.channel} says ${event.text} thread ${event.thread_ts || event.event_ts}`);
});

const server = createServer(app);
server.listen(port, () => {
    console.log(`Listening for events on ${server.address().port}`);
});