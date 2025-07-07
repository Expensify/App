"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Set up manual mocks for any Logging methods that are supposed hit the 'server',
// this is needed because before, the Logging queue would get flushed while tests were running,
// causing unexpected calls to HttpUtils.xhr() which would cause mock mismatches and flaky tests.
exports.default = {
    info: function (message) { return console.debug("[info] ".concat(message, " (mocked)")); },
    alert: function (message) { return console.debug("[alert] ".concat(message, " (mocked)")); },
    warn: function (message) { return console.debug("[warn] ".concat(message, " (mocked)")); },
    hmmm: function (message) { return console.debug("[hmmm] ".concat(message, " (mocked)")); },
};
