import declassify from 'declassify';
import express from 'express';
import juice from 'juice';
import path from 'path';
import ReactDOMServer from 'react-dom/server';
import Onyx from 'react-native-onyx';
import {AppRegistry} from 'react-native-web';
import 'source-map-support/register';
import CONST from '../src/CONST';
import initOnyxDerivedValues from '../src/libs/actions/OnyxDerived';
import ONYXKEYS from '../src/ONYXKEYS';
import waitForBatchedUpdates from '../tests/utils/waitForBatchedUpdates';
import SampleEmail from './components/SampleEmail';
import CONFIG from './CONFIG';
import LiveReloadServer from './LiveReloadServer';

const app = express();
const url = `http://localhost:${CONFIG.EXPRESS_PORT}`;

console.log('Serving static files from:', path.join(__dirname, 'static'));
app.use(express.static(path.join(__dirname, 'static')));

// TODO: only send live reload connection snippet for dev bundle. For production bundle don't include it
app.get('/', async (req, res) => {
    Onyx.init({
        keys: ONYXKEYS,

        // Increase the cached key count so that the app works more consistently for accounts with large numbers of reports
        maxCachedKeysCount: 100000,
        safeEvictionKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
        initialKeyStates: {
            // Clear any loading and error messages so they do not appear on app startup
            [ONYXKEYS.SESSION]: {loading: false},
            [ONYXKEYS.ACCOUNT]: CONST.DEFAULT_ACCOUNT_DATA,
            [ONYXKEYS.NETWORK]: CONST.DEFAULT_NETWORK_DATA,
            [ONYXKEYS.IS_SIDEBAR_LOADED]: false,
            [ONYXKEYS.SHOULD_SHOW_COMPOSE_INPUT]: true,
            [ONYXKEYS.MODAL]: {
                isVisible: false,
                willAlertModalBecomeVisible: false,
            },
            [ONYXKEYS.NVP_PREFERRED_LOCALE]: CONST.LOCALES.EN,
            [ONYXKEYS.PREFERRED_THEME]: CONST.THEME.LIGHT,
            [ONYXKEYS.NVP_BLOCKED_FROM_CONCIERGE]: {},
        },
        skippableCollectionMemberIDs: CONST.SKIPPABLE_COLLECTION_MEMBER_IDS,
    });
    initOnyxDerivedValues();
    await waitForBatchedUpdates();

    AppRegistry.registerComponent('SampleEmail', () => SampleEmail);
    const {element, getStyleElement} = AppRegistry.getApplication('SampleEmail');
    const renderedHTML = ReactDOMServer.renderToString(element);
    const css = ReactDOMServer.renderToStaticMarkup(getStyleElement());

    const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Email Preview</title>
    <link rel="icon" href="favicon.png">
    ${css}
    ${LiveReloadServer.clientConnectionScript}
  </head>
  <body>
    ${renderedHTML}
  </body>
</html>`;

    const htmlWithInlinedStyles = juice(html);
    const htmlWithUnusedClassesRemoved = declassify.process(htmlWithInlinedStyles);

    res.send(htmlWithUnusedClassesRemoved);
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
