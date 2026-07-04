var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
    for (var name in all) __defProp(target, name, {get: all[name], enumerable: true});
};
var __copyProps = (to, from, except, desc) => {
    if ((from && typeof from === 'object') || typeof from === 'function') {
        for (let key of __getOwnPropNames(from))
            if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable});
    }
    return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, '__esModule', {value: true}), mod);

// node_modules/@octokit/request-error/dist-src/index.js
var dist_src_exports = {};
__export(dist_src_exports, {
    RequestError: () => RequestError,
});
module.exports = __toCommonJS(dist_src_exports);
var RequestError = class extends Error {
    name;
    /**
     * http status code
     */
    status;
    /**
     * Request options that lead to the error.
     */
    request;
    /**
     * Response object if a response was received
     */
    response;
    constructor(message, statusCode, options) {
        super(message, {cause: options.cause});
        this.name = 'HttpError';
        this.status = Number.parseInt(statusCode);
        if (Number.isNaN(this.status)) {
            this.status = 0;
        }
        if ('response' in options) {
            this.response = options.response;
        }
        const requestCopy = Object.assign({}, options.request);
        if (options.request.headers.authorization) {
            requestCopy.headers = Object.assign({}, options.request.headers, {
                authorization: options.request.headers.authorization.replace(/(?<! ) .*$/, ' [REDACTED]'),
            });
        }
        requestCopy.url = requestCopy.url.replace(/\bclient_secret=\w+/g, 'client_secret=[REDACTED]').replace(/\baccess_token=\w+/g, 'access_token=[REDACTED]');
        this.request = requestCopy;
    }
};
// Annotate the CommonJS export names for ESM import in node:
0 &&
    (module.exports = {
        RequestError,
    });
/*! Bundled license information:

@octokit/request-error/dist-src/index.js:
  (* v8 ignore else -- @preserve -- Bug with vitest coverage where it sees an else branch that doesn't exist *)
*/
module.exports = {...module.exports};
Object.defineProperty(module.exports, '__esModule', {value: true});
