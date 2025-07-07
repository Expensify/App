"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/naming-convention */
var react_native_onyx_1 = require("react-native-onyx");
var package_json_1 = require("../../package.json");
var CONFIG_1 = require("../../src/CONFIG");
var enhanceParameters_1 = require("../../src/libs/Network/enhanceParameters");
var ONYXKEYS_1 = require("../../src/ONYXKEYS");
var waitForBatchedUpdates_1 = require("../utils/waitForBatchedUpdates");
beforeEach(function () { return react_native_onyx_1.default.clear(); });
test('Enhance parameters adds correct parameters for Log command with no authToken', function () {
    var command = 'Log';
    var parameters = { testParameter: 'test' };
    var email = 'test-user@test.com';
    var authToken = 'test-token';
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.SESSION, { email: email, authToken: authToken });
    return (0, waitForBatchedUpdates_1.default)().then(function () {
        var finalParameters = (0, enhanceParameters_1.default)(command, parameters);
        expect(finalParameters).toEqual({
            testParameter: 'test',
            api_setCookie: false,
            appversion: package_json_1.default.version,
            email: email,
            isFromDevEnv: true,
            platform: 'ios',
            referer: CONFIG_1.default.EXPENSIFY.EXPENSIFY_CASH_REFERER,
            clientUpdateID: -1,
        });
    });
});
test('Enhance parameters adds correct parameters for a command that requires authToken', function () {
    var command = 'Report_AddComment';
    var parameters = { testParameter: 'test' };
    var email = 'test-user@test.com';
    var authToken = 'test-token';
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.SESSION, { email: email, authToken: authToken });
    return (0, waitForBatchedUpdates_1.default)().then(function () {
        var finalParameters = (0, enhanceParameters_1.default)(command, parameters);
        expect(finalParameters).toEqual({
            testParameter: 'test',
            api_setCookie: false,
            appversion: package_json_1.default.version,
            email: email,
            isFromDevEnv: true,
            platform: 'ios',
            authToken: authToken,
            clientUpdateID: -1,
            referer: CONFIG_1.default.EXPENSIFY.EXPENSIFY_CASH_REFERER,
        });
    });
});
