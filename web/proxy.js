"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var dotenv_1 = require("dotenv");
var http_1 = require("http");
var https_1 = require("https");
var proxyConfig_1 = require("../config/proxyConfig");
dotenv_1.default.config();
if (process.env.USE_WEB_PROXY === 'false') {
    process.stdout.write('Skipping proxy as USE_WEB_PROXY was set to false.\n');
    process.exit();
}
var host = 'www.expensify.com';
var stagingHost = 'staging.expensify.com';
var stagingSecureHost = 'staging-secure.expensify.com';
// eslint-disable-next-line no-console
console.log("Creating proxy with host: ".concat(host, " for production API and ").concat(stagingHost, " for staging API"));
/**
 * Local proxy server that hits the production endpoint
 * to get around CORS issues. We use this so that it's
 * possible to work on the app within a limited development
 * environment that has no local API.
 */
var server = http_1.default.createServer(function (request, response) {
    var _a, _b, _c;
    var hostname = host;
    var requestPath = request.url;
    // Add CORS headers
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
        response.writeHead(200);
        response.end();
        return;
    }
    /**
     * When a request is matching a proxy config path we might direct it to a different host (e.g. staging)
     * For requests matching proxy config patterns we replace the mapping url (prefix) with the actual path.
     * This is done because the staging api root is only intended for the proxy,
     * the actual server request must use the /api path.
     * For example,
     * /api/OpenReport => request sent to production server
     * /staging/api/OpenReport => request sent to staging server
     * /staging-secure/api/OpenReport => request sent to secure staging server
     * /chat-attachments/46545... => request sent to production server
     * /receipts/w_... => request sent to production server
     * /staging/chat-attachments/46545... => request sent to staging server
     */
    if ((_a = request.url) === null || _a === void 0 ? void 0 : _a.startsWith(proxyConfig_1.default.STAGING_SECURE)) {
        hostname = stagingSecureHost;
        requestPath = request.url.replace(proxyConfig_1.default.STAGING_SECURE, '/');
    }
    else if ((_b = request.url) === null || _b === void 0 ? void 0 : _b.startsWith(proxyConfig_1.default.STAGING)) {
        hostname = stagingHost;
        requestPath = request.url.replace(proxyConfig_1.default.STAGING, '/');
    }
    var proxyRequest = https_1.default.request({
        hostname: hostname,
        method: request.method,
        path: requestPath,
        headers: __assign(__assign({}, request.headers), { host: hostname, 
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'user-agent': (_c = request.headers['user-agent']) === null || _c === void 0 ? void 0 : _c.concat(' Development-NewDot/1.0') }),
        port: 443,
    });
    request.pipe(proxyRequest);
    proxyRequest.on('response', function (proxyResponse) {
        var _a;
        response.writeHead((_a = proxyResponse.statusCode) !== null && _a !== void 0 ? _a : 0, proxyResponse.headers);
        proxyResponse.pipe(response);
    });
    proxyRequest.on('error', function (error) {
        /* eslint-disable-next-line no-console */
        console.log(error);
    });
});
server.listen(9000, function () {
    /* eslint-disable-next-line no-console */
    console.log('Proxy server listening at http://localhost:9000');
});
