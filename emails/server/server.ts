import express from 'express';
import path from 'path';
import 'source-map-support/register';
import SSR_CONST from '../core/CONST';
import renderEmail from '../core/renderEmail';
import CONFIG from './CONFIG';
import LiveReloadServer from './LiveReloadServer';
import handleError from './utils/handleError';

const app = express();
const url = `http://localhost:${CONFIG.EXPRESS_PORT}`;

console.log('🌐 Serving static files from:', path.join(__dirname, 'static'));
app.use(express.static(path.join(__dirname, 'static')));

app.get('/', (req, res) => {
    res.redirect('/ExpenseSubmitted');
});

app.get('/:notification', async (req, res, next) => {
    try {
        const {notification} = req.params;
        let onyxData = req.query.onyxData ? JSON.parse(req.query.onyxData) : [];
        const html = await renderEmail({env: SSR_CONST.ENV.SERVER, notificationName: notification, onyxData});
        res.send(html);
    } catch (error) {
        next(error);
    }
});

// Custom error handler works with live reload server
app.use(handleError);

app.listen(CONFIG.EXPRESS_PORT, () => {
    console.log(`💌 Email preview server is running at ${url}`);
    LiveReloadServer.trigger(url);
});
