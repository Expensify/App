import express from 'express';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import SampleEmail from './components/SampleEmail';
import CONFIG from './CONFIG';
import LiveReloadServer from './LiveReloadServer';

const app = express();
const url = `http://localhost:${CONFIG.EXPRESS_PORT}`;

// TODO: only send live reload connection snippet for dev bundle. For production bundle don't include it
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

// Custom error handler works with live reload server
app.use((err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    res.status(err.status || 500);

    // Check if the request accepts HTML
    if (req.accepts('html')) {
        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <title>Error</title>
            </head>
            <body>
                <h1>Something went wrong :(</h1>
                <pre>${err.stack}</pre>
                ${LiveReloadServer.clientConnectionScript}
            </body>
            </html>
        `);
    } else if (req.accepts('json')) {
        res.json({error: 'Something went wrong!', details: err.message});
    } else {
        res.type('txt').send('Something went wrong!');
    }
});

app.listen(CONFIG.EXPRESS_PORT, () => {
    console.log(`💌 Email preview server is running at ${url}`);
    LiveReloadServer.trigger(url);
});
