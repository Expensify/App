// import Config from 'react-native-config';
// import lodashGet from 'lodash/get';

const {OAuth2Client} = require('google-auth-library');
const http = require('http');
const url = require('url');
const open = require('open');

const options = {
    callbackPath: '/callback',
    loopbackRedirectPort: '3000',
    loopbackRedirectHost: 'http://localhost',
};
let server = null;

// Download your OAuth2 configuration from the Google
// const keys = require('./oauth2.keys.json');

function createServer(callback) {
    if (server) {
        // if a server is already running, we close it so that we free the port
        // and restart the process
        // TODO: handle and close the server connections
        server.close();
    }
    server = http.createServer(callback);
    return server;
}

/**
* Create a new OAuth2Client, and go through the OAuth2 content
* workflow.  Return the full client to the callback.
* @returns {Promise<any>}
*/
function getAuthenticatedClient() {
    return new Promise((resolve, reject) => {
        // create an oAuth client to authorize the API call.  Secrets are kept in a `keys.json` file,
        // which should be downloaded from the Google Developers Console.
        const oAuth2Client = new OAuth2Client({
            clientId: '921154746561-s3uqn2oe4m85tufi6mqflbfbuajrm2i3.apps.googleusercontent.com',
            redirectUri: `${options.loopbackRedirectHost}:${options.loopbackRedirectPort}${options.callbackPath}`,

        });

        // Generate the url that will be used for the consent dialog.
        const authorizeUrl = oAuth2Client.generateAuthUrl({
            scope: 'email',
        });

        // Open an http server to accept the oauth callback. In this simple example, the
        // only request to our webserver is to /oauth2callback?code=<code>
        createServer((req, res) => {
            try {
                if (req.url && url.parse(req.url).pathname === options.callbackPath) {
                    // acquire the code from the querystring, and close the web server.
                    const qs = new url.URL(req.url, options.loopbackRedirectHost)
                        .searchParams;
                    const code = qs.get('code');
                    console.log(`Code is ${code}`);
                    res.end('Authentication successful! Please return to New Expensify.');

                    // Now that we have the code, use that to acquire tokens.
                    oAuth2Client.getToken(code).then((r) => {
                        // Make sure to set the credentials on the OAuth2 client.
                        oAuth2Client.setCredentials(r.tokens);
                        console.info('Tokens acquired.');
                        resolve(oAuth2Client);
                        server.close();
                    }).catch(reject);
                } else {
                    res.end();
                }
            } catch (e) {
                reject(e);
            }
        }).listen(options.loopbackRedirectPort, () => {
            // open the browser to the authorize url to start the workflow
            open(authorizeUrl, {wait: false}).then(cp => cp.unref());
        }).on('error', e => reject(e));

        // destroyer(server);
    });
}

/**
 * Function to signIn the user with their Google account
 *
 * @returns {Promise<{ token: string, email: string }>}
 */
export default function signInWithGoogle() {
    return getAuthenticatedClient().then((oAuth2Client) => {
        console.log(oAuth2Client);

        // Make a simple request to the People API using our pre-authenticated client. The `request()` method
        // takes an GaxiosOptions object.  Visit https://github.com/JustinBeckwith/gaxios.
        return oAuth2Client.request({
            url: 'https://www.googleapis.com/oauth2/v2/userinfo',
        }).then((res) => {
            console.log(res.data);
            return {
                email: res.data.email,
                token: oAuth2Client.credentials.id_token,
            };

            // // After acquiring an access_token, you may want to check on the audience, expiration,
            // // or original scopes requested.  You can do that with the `getTokenInfo` method.
            // return oAuth2Client.getTokenInfo(
            //     oAuth2Client.credentials.access_token,
            // ).then((tokenInfo) => {
            //     console.log(tokenInfo);

            // });
        }).catch((err) => {
            debugger;
            console.log(err);
        });
    });
}
