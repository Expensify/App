"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockValues = exports.applyUpdates = void 0;
var OnyxUpdates = require("@userActions/OnyxUpdates");
var createProxyForObject_1 = require("@src/utils/createProxyForObject");
jest.mock('@userActions/OnyxUpdates');
var mockValues = {
    beforeApplyUpdates: undefined,
};
var mockValuesProxy = (0, createProxyForObject_1.default)(mockValues);
exports.mockValues = mockValuesProxy;
var applyUpdates = jest.fn(function (updates) {
    var createChain = function () {
        var chain = Promise.resolve();
        Object.values(updates).forEach(function (update) {
            chain = chain.then(function () {
                return OnyxUpdates.apply(update).then(function () { return undefined; });
            });
        });
        return chain;
    };
    if (mockValuesProxy.beforeApplyUpdates === undefined) {
        return createChain();
    }
    return mockValuesProxy.beforeApplyUpdates(updates).then(function () { return createChain(); });
});
exports.applyUpdates = applyUpdates;
