const http = require('http');
const https = require('https');
const lodashGet = require('lodash/get');
require('dotenv').config();

if (process.env.USE_WEB_PROXY === 'false') {
    process.stdout.write('Skipping proxy as USE_WEB_PROXY was set to false.\n');
    process.exit();
}

const host = new URL(lodashGet(process.env.EXPENSIFY_URL, 'EXPENSIFY_URL', 'https://www.expensify.com')).hostname;
const stagingHost = new URL(lodashGet(process.env.STAGING_EXPENSIFY_URL, 'STAGING_EXPENSIFY_URL', 'https://staging.expensify.com')).hostname;
const stagingSecureHost = new URL(lodashGet(process.env.STAGING_SECURE_EXPENSIFY_URL, 'STAGING_SECURE_EXPENSIFY_URL', 'https://staging-secure.expensify.com')).hostname;
const HOST_MAP = {
    'staging-api': stagingHost,
    'staging-secure-api': stagingSecureHost,
};

// eslint-disable-next-line no-console
console.log(`Creating proxy with host: ${host} for production API and ${stagingHost} for staging API`);

/**
 * Local proxy server that hits the production endpoint
 * to get around CORS issues. We use this so that it's
 * possible to work on the app within a limited development
 * environment that has no local API.
 */
const server = http.createServer((request, response) => {
    const apiRegex = /\/(.*api)/g;
    const apiRoot = apiRegex.exec(request.url)[1];
    const hostname = HOST_MAP[apiRoot] || host;
    const proxyRequest = https.request({
        hostname,
        method: 'POST',
        path: request.url.replace(apiRoot, 'api'),
        headers: {
            ...request.headers,
            host: hostname,
            'user-agent': request.headers['user-agent'].concat(' Development-NewDot/1.0'),
        },
        port: 443,
    });

    request.pipe(proxyRequest);
    proxyRequest.on('response', (proxyResponse) => {
        response.writeHead(proxyResponse.statusCode, proxyResponse.headers);
        proxyResponse.pipe(response);
    });

    proxyRequest.on('error', (error) => {
        /* eslint-disable-next-line no-console */
        console.log(error);
    });
});

server.listen(9000, () => {
    /* eslint-disable-next-line no-console */
    console.log('Proxy server listening at http://localhost:9000');
});
