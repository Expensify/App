const http = require('http');
const https = require('https');
require('dotenv').config();

if (process.env.USE_WEB_PROXY !== 'true') {
    process.stdout.write('Skipping proxy as USE_WEB_PROXY was set to false.');
    process.exit();
}

/**
 * Local proxy server that hits the production endpoint
 * to get around CORS issues. We use this so that it's
 * possible to work on the app within a limited development
 * environment that has no local API.
 */
const server = http.createServer((request, response) => {
    const proxyRequest = https.request({
        hostname: 'www.expensify.com',
        method: 'POST',
        path: request.url,
        headers: {
            ...request.headers,
            host: 'www.expensify.com',
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
