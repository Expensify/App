import express from 'express';
import path from 'path';
import 'source-map-support/register';
import CONFIG from './CONFIG';
import SSR_CONST from './core/CONST';
import renderEmail from './core/renderEmail';
import LiveReloadServer from './LiveReloadServer';

const app = express();
const url = `http://localhost:${CONFIG.EXPRESS_PORT}`;

console.log('Serving static files from:', path.join(__dirname, 'static'));
app.use(express.static(path.join(__dirname, 'static')));

app.get('/', async (req, res) => {
    const html = await renderEmail({env: SSR_CONST.ENV.SERVER, notificationName: 'SampleEmail'});
    res.send(html);
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
