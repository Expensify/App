import express from 'express';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import SampleEmail from './components/SampleEmail';

const app = express();
const port = 3000;

app.get('/', (req, res) => {
    const emailContent = ReactDOMServer.renderToStaticMarkup(React.createElement(SampleEmail));
    res.send(`<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Email Preview</title>
  </head>
  <body>
    ${emailContent}
  </body>
</html>`);
});

app.listen(port, () => {
    console.log(`Email server is running at http://localhost:${port}`);
});
