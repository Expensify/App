const http = require('http');
const https = require('https');
const proxyConfig = require('../config/proxyConfig');
require('dotenv').config();

if (process.env.USE_WEB_PROXY === 'false') {
    process.stdout.write('Skipping proxy as USE_WEB_PROXY was set to false.\n');
    process.exit();
}
const host = new URL(process.env.EXPENSIFY_URL || 'https://www.expensify.com').hostname;
const stagingHost = new URL(process.env.STAGING_EXPENSIFY_URL || 'https://staging.expensify.com').hostname;
const stagingSecureHost = new URL(process.env.STAGING_SECURE_EXPENSIFY_URL || 'https://staging-secure.expensify.com').hostname;

// eslint-disable-next-line no-console
console.log(`Creating proxy with host: ${host} for production API and ${stagingHost} for staging API`);

/**
 * Local proxy server that hits the production endpoint
 * to get around CORS issues. We use this so that it's
 * possible to work on the app within a limited development
 * environment that has no local API.
 */
const server = http.createServer((request, response) => {
    let hostname = host;
    let requestPath = request.url;

    // Regex not declared globally to avoid internal regex pointer reset for each request.
    const apiRegex = /(\/staging.*)api/g;

    /**
     * We only match staging api root to redirect requests to the staging server if the request
     * is an API call, except chat attachments. By default, requests are sent to the prod server.
     * For example,
     * /api?command=OpenReport => request sent to production server
     * /staging-api?command=OpenReport => request sent to staging server
     * /staging-secure-api?command=OpenReport => request sent to secure staging server
     * /chat-attachments/46545... => request sent to production server
     */
    const apiRootMatch = apiRegex.exec(requestPath);

    // Switch host only if API call, not on chat attachments.
    if (apiRootMatch) {
        const apiRoot = apiRootMatch[1];

        // apiRoot can only be staging or secure staging
        hostname = apiRoot === proxyConfig.STAGING_SECURE ? stagingSecureHost : stagingHost;

        /**
         * Replace the mapping url with the actual path.
         * This is done because the staging api root is only intended for the proxy,
         * the actual server request must use the /api path.
         */
        requestPath = request.url.replace(apiRoot, '/');
    }
    const proxyRequest = https.request({
        hostname,
        method: 'POST',
        path: requestPath,
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
