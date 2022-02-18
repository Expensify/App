import _ from 'underscore';
import * as Localize from '../Localize';

const {OAuth2Client} = require('google-auth-library');
const http = require('http');
const url = require('url');
const open = require('open');

const options = {
    callbackPath: '/callback',
    loopbackRedirectPort: '3000',
    loopbackRedirectHost: 'http://localhost',
};

const connections = {};
let server = null;

function destroyServer() {
    if (server) {
        server.close();
        server = null;
    }
    _.forEach(connections, c => c.destroy());
}

function creteServer(callback) {
    destroyServer();
    server = http.createServer(callback);
    return server;
}

/**
 * Create a new OAuth2Client, and go through the OAuth2 content workflow.
 *
 * @returns {Promise<OAuth2Client>}
 */
function getAuthenticatedClient() {
    return new Promise((resolve, reject) => {
        // Create an oAuth client to authorize the API call.
        const oAuth2Client = new OAuth2Client({
            clientId: '921154746561-s3uqn2oe4m85tufi6mqflbfbuajrm2i3.apps.googleusercontent.com',
            redirectUri: `${options.loopbackRedirectHost}:${options.loopbackRedirectPort}${options.callbackPath}`,
        });

        // Generate the url that will be used for the consent dialog.
        const authorizeUrl = oAuth2Client.generateAuthUrl({
            scope: 'email',
        });

        // Wait 60 secs until the user authenticate with their Google account in the consent dialog,
        // otherwise the loading spinner will never stop
        const timeoutSignIn = setTimeout(() => {
            reject();
            destroyServer();
        }, 60000);

        // Open an http server to accept the oauth callback
        try {
            creteServer((req, res) => {
                if (req.url && url.parse(req.url).pathname === options.callbackPath) {
                    // acquire the code from the querystring
                    const qs = new url.URL(req.url, options.loopbackRedirectHost).searchParams;
                    const code = qs.get('code');

                    // Now that we have the code, use that to acquire tokens.
                    oAuth2Client.getToken(code).then((r) => {
                        // Make sure to set the credentials on the OAuth2 client and close the web server.
                        oAuth2Client.setCredentials(r.tokens);
                        resolve(oAuth2Client);
                        clearTimeout(timeoutSignIn);
                        res.end(Localize.translateLocal('signInPage.google.authSuccessful'));
                        destroyServer();
                    }).catch(reject);
                } else {
                    res.end();
                }
            }).listen(options.loopbackRedirectPort, () => {
                // open the browser to the authorize url to start the workflow
                open(authorizeUrl, {wait: true}).then(cp => cp.unref());
            }).on('error', e => reject(e)).on('connection', (conn) => {
                const key = `${conn.remoteAddress}:${conn.remotePort}`;
                connections[key] = conn;
                conn.on('close', () => {
                    delete connections[key];
                });
            });
        } catch (e) {
            reject(e);
        }
    });
}

/**
 * Function to signIn the user with their Google account
 *
 * @returns {Promise<{ token: string, email: string }>}
 */
export default function signInWithGoogle() {
    return getAuthenticatedClient().then(oAuth2Client => oAuth2Client.request({
        url: 'https://www.googleapis.com/oauth2/v2/userinfo',
    }).then(res => ({
        email: res.data.email,
        token: oAuth2Client.credentials.id_token,
    })));
}
