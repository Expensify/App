import express from 'express';
import open from 'open';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import SampleEmail from './components/SampleEmail';
import CONFIG from './CONFIG';
import LiveReloadServer from './LiveReloadServer';

const app = express();
const url = `http://localhost:${CONFIG.EXPRESS_PORT}`;

app.get('/', (req, res) => {
    const emailContent = ReactDOMServer.renderToStaticMarkup(React.createElement(SampleEmail));
    res.send(`<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Email Preview</title>
    ${LiveReloadServer.clientConnectionScript}
  </head>
  <body>
    ${emailContent}
  </body>
</html>`);
});

app.listen(CONFIG.EXPRESS_PORT, () => {
    console.log(`💌 Email preview server is running at ${url}`);
    LiveReloadServer.trigger(url);
});
