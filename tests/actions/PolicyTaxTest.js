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
var react_native_onyx_1 = require("react-native-onyx");
var TaxRate_1 = require("@libs/actions/TaxRate");
var CONST_1 = require("@src/CONST");
var OnyxUpdateManager_1 = require("@src/libs/actions/OnyxUpdateManager");
var Policy = require("@src/libs/actions/Policy/Policy");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var policies_1 = require("../utils/collections/policies");
var TestHelper = require("../utils/TestHelper");
var waitForBatchedUpdates_1 = require("../utils/waitForBatchedUpdates");
(0, OnyxUpdateManager_1.default)();
describe('actions/PolicyTax', function () {
    var fakePolicy = __assign(__assign({}, (0, policies_1.default)(0)), { taxRates: CONST_1.default.DEFAULT_TAX });
    beforeAll(function () {
        react_native_onyx_1.default.init({
            keys: ONYXKEYS_1.default,
        });
    });
    var mockFetch;
    beforeEach(function () {
        global.fetch = TestHelper.getGlobalFetchMock();
        mockFetch = fetch;
        return react_native_onyx_1.default.clear()
            .then(function () { return react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(fakePolicy.id), fakePolicy); })
            .then(waitForBatchedUpdates_1.default);
    });
    describe('SetPolicyCustomTaxName', function () {
        it('Set policy`s custom tax name', function () {
            var _a;
            var customTaxName = 'Custom tag name';
            (_a = mockFetch === null || mockFetch === void 0 ? void 0 : mockFetch.pause) === null || _a === void 0 ? void 0 : _a.call(mockFetch);
            Policy.setPolicyCustomTaxName(fakePolicy.id, customTaxName);
            return (0, waitForBatchedUpdates_1.default)()
                .then(function () {
                return new Promise(function (resolve) {
                    var connection = react_native_onyx_1.default.connect({
                        key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(fakePolicy.id),
                        waitForCollectionCallback: false,
                        callback: function (policy) {
                            var _a, _b, _c, _d;
                            react_native_onyx_1.default.disconnect(connection);
                            expect((_a = policy === null || policy === void 0 ? void 0 : policy.taxRates) === null || _a === void 0 ? void 0 : _a.name).toBe(customTaxName);
                            expect((_c = (_b = policy === null || policy === void 0 ? void 0 : policy.taxRates) === null || _b === void 0 ? void 0 : _b.pendingFields) === null || _c === void 0 ? void 0 : _c.name).toBe(CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
                            expect((_d = policy === null || policy === void 0 ? void 0 : policy.taxRates) === null || _d === void 0 ? void 0 : _d.errorFields).toBeFalsy();
                            resolve();
                        },
                    });
                });
            })
                .then(mockFetch === null || mockFetch === void 0 ? void 0 : mockFetch.resume)
                .then(waitForBatchedUpdates_1.default)
                .then(function () {
                return new Promise(function (resolve) {
                    var connection = react_native_onyx_1.default.connect({
                        key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(fakePolicy.id),
                        waitForCollectionCallback: false,
                        callback: function (policy) {
                            var _a, _b, _c;
                            react_native_onyx_1.default.disconnect(connection);
                            expect((_b = (_a = policy === null || policy === void 0 ? void 0 : policy.taxRates) === null || _a === void 0 ? void 0 : _a.pendingFields) === null || _b === void 0 ? void 0 : _b.name).toBeFalsy();
                            expect((_c = policy === null || policy === void 0 ? void 0 : policy.taxRates) === null || _c === void 0 ? void 0 : _c.errorFields).toBeFalsy();
                            resolve();
                        },
                    });
                });
            });
        });
        it('Reset policy`s custom tax name when API returns an error', function () {
            var _a, _b;
            var customTaxName = 'Custom tag name';
            var originalCustomTaxName = (_a = fakePolicy === null || fakePolicy === void 0 ? void 0 : fakePolicy.taxRates) === null || _a === void 0 ? void 0 : _a.name;
            (_b = mockFetch === null || mockFetch === void 0 ? void 0 : mockFetch.pause) === null || _b === void 0 ? void 0 : _b.call(mockFetch);
            Policy.setPolicyCustomTaxName(fakePolicy.id, customTaxName);
            return (0, waitForBatchedUpdates_1.default)()
                .then(function () {
                return new Promise(function (resolve) {
                    var connection = react_native_onyx_1.default.connect({
                        key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(fakePolicy.id),
                        waitForCollectionCallback: false,
                        callback: function (policy) {
                            var _a, _b, _c, _d;
                            react_native_onyx_1.default.disconnect(connection);
                            expect((_a = policy === null || policy === void 0 ? void 0 : policy.taxRates) === null || _a === void 0 ? void 0 : _a.name).toBe(customTaxName);
                            expect((_c = (_b = policy === null || policy === void 0 ? void 0 : policy.taxRates) === null || _b === void 0 ? void 0 : _b.pendingFields) === null || _c === void 0 ? void 0 : _c.name).toBe(CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
                            expect((_d = policy === null || policy === void 0 ? void 0 : policy.taxRates) === null || _d === void 0 ? void 0 : _d.errorFields).toBeFalsy();
                            resolve();
                        },
                    });
                });
            })
                .then(function () {
                var _a, _b;
                (_a = mockFetch === null || mockFetch === void 0 ? void 0 : mockFetch.fail) === null || _a === void 0 ? void 0 : _a.call(mockFetch);
                return (_b = mockFetch === null || mockFetch === void 0 ? void 0 : mockFetch.resume) === null || _b === void 0 ? void 0 : _b.call(mockFetch);
            })
                .then(waitForBatchedUpdates_1.default)
                .then(function () {
                return new Promise(function (resolve) {
                    var connection = react_native_onyx_1.default.connect({
                        key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(fakePolicy.id),
                        waitForCollectionCallback: false,
                        callback: function (policy) {
                            var _a, _b, _c, _d, _e;
                            react_native_onyx_1.default.disconnect(connection);
                            expect((_a = policy === null || policy === void 0 ? void 0 : policy.taxRates) === null || _a === void 0 ? void 0 : _a.name).toBe(originalCustomTaxName);
                            expect((_c = (_b = policy === null || policy === void 0 ? void 0 : policy.taxRates) === null || _b === void 0 ? void 0 : _b.pendingFields) === null || _c === void 0 ? void 0 : _c.name).toBeFalsy();
                            expect((_e = (_d = policy === null || policy === void 0 ? void 0 : policy.taxRates) === null || _d === void 0 ? void 0 : _d.errorFields) === null || _e === void 0 ? void 0 : _e.name).toBeTruthy();
                            resolve();
                        },
                    });
                });
            });
        });
    });
    describe('SetPolicyCurrencyDefaultTax', function () {
        it('Set policy`s currency default tax', function () {
            var _a;
            var taxCode = 'id_TAX_RATE_1';
            (_a = mockFetch === null || mockFetch === void 0 ? void 0 : mockFetch.pause) === null || _a === void 0 ? void 0 : _a.call(mockFetch);
            Policy.setWorkspaceCurrencyDefault(fakePolicy.id, taxCode);
            return (0, waitForBatchedUpdates_1.default)()
                .then(function () {
                return new Promise(function (resolve) {
                    var connection = react_native_onyx_1.default.connect({
                        key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(fakePolicy.id),
                        waitForCollectionCallback: false,
                        callback: function (policy) {
                            var _a, _b, _c, _d;
                            react_native_onyx_1.default.disconnect(connection);
                            expect((_a = policy === null || policy === void 0 ? void 0 : policy.taxRates) === null || _a === void 0 ? void 0 : _a.defaultExternalID).toBe(taxCode);
                            expect((_c = (_b = policy === null || policy === void 0 ? void 0 : policy.taxRates) === null || _b === void 0 ? void 0 : _b.pendingFields) === null || _c === void 0 ? void 0 : _c.defaultExternalID).toBe(CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
                            expect((_d = policy === null || policy === void 0 ? void 0 : policy.taxRates) === null || _d === void 0 ? void 0 : _d.errorFields).toBeFalsy();
                            resolve();
                        },
                    });
                });
            })
                .then(mockFetch === null || mockFetch === void 0 ? void 0 : mockFetch.resume)
                .then(waitForBatchedUpdates_1.default)
                .then(function () {
                return new Promise(function (resolve) {
                    var connection = react_native_onyx_1.default.connect({
                        key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(fakePolicy.id),
                        waitForCollectionCallback: false,
                        callback: function (policy) {
                            var _a, _b, _c;
                            react_native_onyx_1.default.disconnect(connection);
                            expect((_b = (_a = policy === null || policy === void 0 ? void 0 : policy.taxRates) === null || _a === void 0 ? void 0 : _a.pendingFields) === null || _b === void 0 ? void 0 : _b.defaultExternalID).toBeFalsy();
                            expect((_c = policy === null || policy === void 0 ? void 0 : policy.taxRates) === null || _c === void 0 ? void 0 : _c.errorFields).toBeFalsy();
                            resolve();
                        },
                    });
                });
            });
        });
        it('Reset policy`s currency default tax when API returns an error', function () {
            var _a, _b;
            var taxCode = 'id_TAX_RATE_1';
            var originalDefaultExternalID = (_a = fakePolicy === null || fakePolicy === void 0 ? void 0 : fakePolicy.taxRates) === null || _a === void 0 ? void 0 : _a.defaultExternalID;
            (_b = mockFetch === null || mockFetch === void 0 ? void 0 : mockFetch.pause) === null || _b === void 0 ? void 0 : _b.call(mockFetch);
            Policy.setWorkspaceCurrencyDefault(fakePolicy.id, taxCode);
            return (0, waitForBatchedUpdates_1.default)()
                .then(function () {
                return new Promise(function (resolve) {
                    var connection = react_native_onyx_1.default.connect({
                        key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(fakePolicy.id),
                        waitForCollectionCallback: false,
                        callback: function (policy) {
                            var _a, _b, _c, _d;
                            react_native_onyx_1.default.disconnect(connection);
                            expect((_a = policy === null || policy === void 0 ? void 0 : policy.taxRates) === null || _a === void 0 ? void 0 : _a.defaultExternalID).toBe(taxCode);
                            expect((_c = (_b = policy === null || policy === void 0 ? void 0 : policy.taxRates) === null || _b === void 0 ? void 0 : _b.pendingFields) === null || _c === void 0 ? void 0 : _c.defaultExternalID).toBe(CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
                            expect((_d = policy === null || policy === void 0 ? void 0 : policy.taxRates) === null || _d === void 0 ? void 0 : _d.errorFields).toBeFalsy();
                            resolve();
                        },
                    });
                });
            })
                .then(function () {
                var _a, _b;
                (_a = mockFetch === null || mockFetch === void 0 ? void 0 : mockFetch.fail) === null || _a === void 0 ? void 0 : _a.call(mockFetch);
                return (_b = mockFetch === null || mockFetch === void 0 ? void 0 : mockFetch.resume) === null || _b === void 0 ? void 0 : _b.call(mockFetch);
            })
                .then(waitForBatchedUpdates_1.default)
                .then(function () {
                return new Promise(function (resolve) {
                    var connection = react_native_onyx_1.default.connect({
                        key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(fakePolicy.id),
                        waitForCollectionCallback: false,
                        callback: function (policy) {
                            var _a, _b, _c, _d, _e;
                            react_native_onyx_1.default.disconnect(connection);
                            expect((_a = policy === null || policy === void 0 ? void 0 : policy.taxRates) === null || _a === void 0 ? void 0 : _a.defaultExternalID).toBe(originalDefaultExternalID);
                            expect((_c = (_b = policy === null || policy === void 0 ? void 0 : policy.taxRates) === null || _b === void 0 ? void 0 : _b.pendingFields) === null || _c === void 0 ? void 0 : _c.defaultExternalID).toBeFalsy();
                            expect((_e = (_d = policy === null || policy === void 0 ? void 0 : policy.taxRates) === null || _d === void 0 ? void 0 : _d.errorFields) === null || _e === void 0 ? void 0 : _e.defaultExternalID).toBeTruthy();
                            resolve();
                        },
                    });
                });
            });
        });
    });
    describe('SetPolicyForeignCurrencyDefaultTax', function () {
        it('Set policy`s foreign currency default', function () {
            var _a;
            var taxCode = 'id_TAX_RATE_1';
            (_a = mockFetch === null || mockFetch === void 0 ? void 0 : mockFetch.pause) === null || _a === void 0 ? void 0 : _a.call(mockFetch);
            Policy.setForeignCurrencyDefault(fakePolicy.id, taxCode);
            return (0, waitForBatchedUpdates_1.default)()
                .then(function () {
                return new Promise(function (resolve) {
                    var connection = react_native_onyx_1.default.connect({
                        key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(fakePolicy.id),
                        waitForCollectionCallback: false,
                        callback: function (policy) {
                            var _a, _b, _c, _d;
                            react_native_onyx_1.default.disconnect(connection);
                            expect((_a = policy === null || policy === void 0 ? void 0 : policy.taxRates) === null || _a === void 0 ? void 0 : _a.foreignTaxDefault).toBe(taxCode);
                            expect((_c = (_b = policy === null || policy === void 0 ? void 0 : policy.taxRates) === null || _b === void 0 ? void 0 : _b.pendingFields) === null || _c === void 0 ? void 0 : _c.foreignTaxDefault).toBe(CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
                            expect((_d = policy === null || policy === void 0 ? void 0 : policy.taxRates) === null || _d === void 0 ? void 0 : _d.errorFields).toBeFalsy();
                            resolve();
                        },
                    });
                });
            })
                .then(mockFetch === null || mockFetch === void 0 ? void 0 : mockFetch.resume)
                .then(waitForBatchedUpdates_1.default)
                .then(function () {
                return new Promise(function (resolve) {
                    var connection = react_native_onyx_1.default.connect({
                        key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(fakePolicy.id),
                        waitForCollectionCallback: false,
                        callback: function (policy) {
                            var _a, _b, _c;
                            react_native_onyx_1.default.disconnect(connection);
                            // Check if the policy pendingFields was cleared
                            expect((_b = (_a = policy === null || policy === void 0 ? void 0 : policy.taxRates) === null || _a === void 0 ? void 0 : _a.pendingFields) === null || _b === void 0 ? void 0 : _b.foreignTaxDefault).toBeFalsy();
                            expect((_c = policy === null || policy === void 0 ? void 0 : policy.taxRates) === null || _c === void 0 ? void 0 : _c.errorFields).toBeFalsy();
                            resolve();
                        },
                    });
                });
            });
        });
        it('Reset policy`s foreign currency default when API returns an error', function () {
            var _a, _b;
            var taxCode = 'id_TAX_RATE_1';
            var originalDefaultForeignCurrencyID = (_a = fakePolicy === null || fakePolicy === void 0 ? void 0 : fakePolicy.taxRates) === null || _a === void 0 ? void 0 : _a.foreignTaxDefault;
            (_b = mockFetch === null || mockFetch === void 0 ? void 0 : mockFetch.pause) === null || _b === void 0 ? void 0 : _b.call(mockFetch);
            Policy.setForeignCurrencyDefault(fakePolicy.id, taxCode);
            return (0, waitForBatchedUpdates_1.default)()
                .then(function () {
                return new Promise(function (resolve) {
                    var connection = react_native_onyx_1.default.connect({
                        key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(fakePolicy.id),
                        waitForCollectionCallback: false,
                        callback: function (policy) {
                            var _a, _b, _c, _d;
                            react_native_onyx_1.default.disconnect(connection);
                            expect((_a = policy === null || policy === void 0 ? void 0 : policy.taxRates) === null || _a === void 0 ? void 0 : _a.foreignTaxDefault).toBe(taxCode);
                            expect((_c = (_b = policy === null || policy === void 0 ? void 0 : policy.taxRates) === null || _b === void 0 ? void 0 : _b.pendingFields) === null || _c === void 0 ? void 0 : _c.foreignTaxDefault).toBe(CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
                            expect((_d = policy === null || policy === void 0 ? void 0 : policy.taxRates) === null || _d === void 0 ? void 0 : _d.errorFields).toBeFalsy();
                            resolve();
                        },
                    });
                });
            })
                .then(function () {
                var _a, _b;
                (_a = mockFetch === null || mockFetch === void 0 ? void 0 : mockFetch.fail) === null || _a === void 0 ? void 0 : _a.call(mockFetch);
                return (_b = mockFetch === null || mockFetch === void 0 ? void 0 : mockFetch.resume) === null || _b === void 0 ? void 0 : _b.call(mockFetch);
            })
                .then(waitForBatchedUpdates_1.default)
                .then(function () {
                return new Promise(function (resolve) {
                    var connection = react_native_onyx_1.default.connect({
                        key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(fakePolicy.id),
                        waitForCollectionCallback: false,
                        callback: function (policy) {
                            var _a, _b, _c, _d, _e;
                            react_native_onyx_1.default.disconnect(connection);
                            // Check if the policy pendingFields was cleared
                            expect((_a = policy === null || policy === void 0 ? void 0 : policy.taxRates) === null || _a === void 0 ? void 0 : _a.foreignTaxDefault).toBe(originalDefaultForeignCurrencyID);
                            expect((_c = (_b = policy === null || policy === void 0 ? void 0 : policy.taxRates) === null || _b === void 0 ? void 0 : _b.pendingFields) === null || _c === void 0 ? void 0 : _c.foreignTaxDefault).toBeFalsy();
                            expect((_e = (_d = policy === null || policy === void 0 ? void 0 : policy.taxRates) === null || _d === void 0 ? void 0 : _d.errorFields) === null || _e === void 0 ? void 0 : _e.foreignTaxDefault).toBeTruthy();
                            resolve();
                        },
                    });
                });
            });
        });
    });
    describe('CreatePolicyTax', function () {
        it('Create a new tax', function () {
            var _a;
            var newTaxRate = {
                name: 'Tax rate 2',
                value: '2%',
                code: 'id_TAX_RATE_2',
            };
            (_a = mockFetch === null || mockFetch === void 0 ? void 0 : mockFetch.pause) === null || _a === void 0 ? void 0 : _a.call(mockFetch);
            (0, TaxRate_1.createPolicyTax)(fakePolicy.id, newTaxRate);
            return (0, waitForBatchedUpdates_1.default)()
                .then(function () {
                return new Promise(function (resolve) {
                    var connection = react_native_onyx_1.default.connect({
                        key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(fakePolicy.id),
                        waitForCollectionCallback: false,
                        callback: function (policy) {
                            var _a, _b, _c;
                            react_native_onyx_1.default.disconnect(connection);
                            var createdTax = (_b = (_a = policy === null || policy === void 0 ? void 0 : policy.taxRates) === null || _a === void 0 ? void 0 : _a.taxes) === null || _b === void 0 ? void 0 : _b[(_c = newTaxRate.code) !== null && _c !== void 0 ? _c : ''];
                            expect(createdTax === null || createdTax === void 0 ? void 0 : createdTax.code).toBe(newTaxRate.code);
                            expect(createdTax === null || createdTax === void 0 ? void 0 : createdTax.name).toBe(newTaxRate.name);
                            expect(createdTax === null || createdTax === void 0 ? void 0 : createdTax.value).toBe(newTaxRate.value);
                            expect(createdTax === null || createdTax === void 0 ? void 0 : createdTax.pendingAction).toBe(CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD);
                            resolve();
                        },
                    });
                });
            })
                .then(mockFetch === null || mockFetch === void 0 ? void 0 : mockFetch.resume)
                .then(waitForBatchedUpdates_1.default)
                .then(function () {
                return new Promise(function (resolve) {
                    var connection = react_native_onyx_1.default.connect({
                        key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(fakePolicy.id),
                        waitForCollectionCallback: false,
                        callback: function (policy) {
                            var _a, _b, _c;
                            react_native_onyx_1.default.disconnect(connection);
                            var createdTax = (_b = (_a = policy === null || policy === void 0 ? void 0 : policy.taxRates) === null || _a === void 0 ? void 0 : _a.taxes) === null || _b === void 0 ? void 0 : _b[(_c = newTaxRate.code) !== null && _c !== void 0 ? _c : ''];
                            expect(createdTax === null || createdTax === void 0 ? void 0 : createdTax.errors).toBeFalsy();
                            expect(createdTax === null || createdTax === void 0 ? void 0 : createdTax.pendingFields).toBeFalsy();
                            resolve();
                        },
                    });
                });
            });
        });
        it('Remove the optimistic tax if the API returns an error', function () {
            var _a;
            var newTaxRate = {
                name: 'Tax rate 2',
                value: '2%',
                code: 'id_TAX_RATE_2',
            };
            (_a = mockFetch === null || mockFetch === void 0 ? void 0 : mockFetch.pause) === null || _a === void 0 ? void 0 : _a.call(mockFetch);
            (0, TaxRate_1.createPolicyTax)(fakePolicy.id, newTaxRate);
            return (0, waitForBatchedUpdates_1.default)()
                .then(function () {
                return new Promise(function (resolve) {
                    var connection = react_native_onyx_1.default.connect({
                        key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(fakePolicy.id),
                        waitForCollectionCallback: false,
                        callback: function (policy) {
                            var _a, _b, _c;
                            react_native_onyx_1.default.disconnect(connection);
                            var createdTax = (_b = (_a = policy === null || policy === void 0 ? void 0 : policy.taxRates) === null || _a === void 0 ? void 0 : _a.taxes) === null || _b === void 0 ? void 0 : _b[(_c = newTaxRate.code) !== null && _c !== void 0 ? _c : ''];
                            expect(createdTax === null || createdTax === void 0 ? void 0 : createdTax.code).toBe(newTaxRate.code);
                            expect(createdTax === null || createdTax === void 0 ? void 0 : createdTax.name).toBe(newTaxRate.name);
                            expect(createdTax === null || createdTax === void 0 ? void 0 : createdTax.value).toBe(newTaxRate.value);
                            expect(createdTax === null || createdTax === void 0 ? void 0 : createdTax.pendingAction).toBe(CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD);
                            resolve();
                        },
                    });
                });
            })
                .then(function () {
                var _a, _b;
                (_a = mockFetch === null || mockFetch === void 0 ? void 0 : mockFetch.fail) === null || _a === void 0 ? void 0 : _a.call(mockFetch);
                return (_b = mockFetch === null || mockFetch === void 0 ? void 0 : mockFetch.resume) === null || _b === void 0 ? void 0 : _b.call(mockFetch);
            })
                .then(waitForBatchedUpdates_1.default)
                .then(function () {
                return new Promise(function (resolve) {
                    var connection = react_native_onyx_1.default.connect({
                        key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(fakePolicy.id),
                        waitForCollectionCallback: false,
                        callback: function (policy) {
                            var _a, _b, _c;
                            react_native_onyx_1.default.disconnect(connection);
                            var createdTax = (_b = (_a = policy === null || policy === void 0 ? void 0 : policy.taxRates) === null || _a === void 0 ? void 0 : _a.taxes) === null || _b === void 0 ? void 0 : _b[(_c = newTaxRate.code) !== null && _c !== void 0 ? _c : ''];
                            expect(createdTax === null || createdTax === void 0 ? void 0 : createdTax.errors).toBeTruthy();
                            resolve();
                        },
                    });
                });
            });
        });
    });
    describe('SetPolicyTaxesEnabled', function () {
        it('Disable policy`s taxes', function () {
            var _a;
            var disableTaxID = 'id_TAX_RATE_1';
            (_a = mockFetch === null || mockFetch === void 0 ? void 0 : mockFetch.pause) === null || _a === void 0 ? void 0 : _a.call(mockFetch);
            (0, TaxRate_1.setPolicyTaxesEnabled)(fakePolicy, [disableTaxID], false);
            return (0, waitForBatchedUpdates_1.default)()
                .then(function () {
                return new Promise(function (resolve) {
                    var connection = react_native_onyx_1.default.connect({
                        key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(fakePolicy.id),
                        waitForCollectionCallback: false,
                        callback: function (policy) {
                            var _a, _b, _c, _d;
                            react_native_onyx_1.default.disconnect(connection);
                            var disabledTax = (_b = (_a = policy === null || policy === void 0 ? void 0 : policy.taxRates) === null || _a === void 0 ? void 0 : _a.taxes) === null || _b === void 0 ? void 0 : _b[disableTaxID];
                            expect(disabledTax === null || disabledTax === void 0 ? void 0 : disabledTax.isDisabled).toBeTruthy();
                            expect((_c = disabledTax === null || disabledTax === void 0 ? void 0 : disabledTax.pendingFields) === null || _c === void 0 ? void 0 : _c.isDisabled).toBe(CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
                            expect((_d = disabledTax === null || disabledTax === void 0 ? void 0 : disabledTax.errorFields) === null || _d === void 0 ? void 0 : _d.isDisabled).toBeFalsy();
                            resolve();
                        },
                    });
                });
            })
                .then(mockFetch === null || mockFetch === void 0 ? void 0 : mockFetch.resume)
                .then(waitForBatchedUpdates_1.default)
                .then(function () {
                return new Promise(function (resolve) {
                    var connection = react_native_onyx_1.default.connect({
                        key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(fakePolicy.id),
                        waitForCollectionCallback: false,
                        callback: function (policy) {
                            var _a, _b, _c, _d;
                            react_native_onyx_1.default.disconnect(connection);
                            var disabledTax = (_b = (_a = policy === null || policy === void 0 ? void 0 : policy.taxRates) === null || _a === void 0 ? void 0 : _a.taxes) === null || _b === void 0 ? void 0 : _b[disableTaxID];
                            expect((_c = disabledTax === null || disabledTax === void 0 ? void 0 : disabledTax.errorFields) === null || _c === void 0 ? void 0 : _c.isDisabled).toBeFalsy();
                            expect((_d = disabledTax === null || disabledTax === void 0 ? void 0 : disabledTax.pendingFields) === null || _d === void 0 ? void 0 : _d.isDisabled).toBeFalsy();
                            resolve();
                        },
                    });
                });
            });
        });
        it('Disable policy`s taxes but API returns an error, then enable policy`s taxes again', function () {
            var _a, _b;
            var disableTaxID = 'id_TAX_RATE_1';
            (_a = mockFetch === null || mockFetch === void 0 ? void 0 : mockFetch.pause) === null || _a === void 0 ? void 0 : _a.call(mockFetch);
            (0, TaxRate_1.setPolicyTaxesEnabled)(fakePolicy, [disableTaxID], false);
            var originalTaxes = __assign({}, (_b = fakePolicy === null || fakePolicy === void 0 ? void 0 : fakePolicy.taxRates) === null || _b === void 0 ? void 0 : _b.taxes);
            return (0, waitForBatchedUpdates_1.default)()
                .then(function () {
                return new Promise(function (resolve) {
                    var connection = react_native_onyx_1.default.connect({
                        key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(fakePolicy.id),
                        waitForCollectionCallback: false,
                        callback: function (policy) {
                            var _a, _b, _c, _d;
                            react_native_onyx_1.default.disconnect(connection);
                            var disabledTax = (_b = (_a = policy === null || policy === void 0 ? void 0 : policy.taxRates) === null || _a === void 0 ? void 0 : _a.taxes) === null || _b === void 0 ? void 0 : _b[disableTaxID];
                            expect(disabledTax === null || disabledTax === void 0 ? void 0 : disabledTax.isDisabled).toBeTruthy();
                            expect((_c = disabledTax === null || disabledTax === void 0 ? void 0 : disabledTax.pendingFields) === null || _c === void 0 ? void 0 : _c.isDisabled).toBe(CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
                            expect((_d = disabledTax === null || disabledTax === void 0 ? void 0 : disabledTax.errorFields) === null || _d === void 0 ? void 0 : _d.isDisabled).toBeFalsy();
                            resolve();
                        },
                    });
                });
            })
                .then(function () {
                var _a, _b;
                (_a = mockFetch === null || mockFetch === void 0 ? void 0 : mockFetch.fail) === null || _a === void 0 ? void 0 : _a.call(mockFetch);
                return (_b = mockFetch === null || mockFetch === void 0 ? void 0 : mockFetch.resume) === null || _b === void 0 ? void 0 : _b.call(mockFetch);
            })
                .then(waitForBatchedUpdates_1.default)
                .then(function () {
                return new Promise(function (resolve) {
                    var connection = react_native_onyx_1.default.connect({
                        key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(fakePolicy.id),
                        waitForCollectionCallback: false,
                        callback: function (policy) {
                            var _a, _b, _c, _d;
                            react_native_onyx_1.default.disconnect(connection);
                            var disabledTax = (_b = (_a = policy === null || policy === void 0 ? void 0 : policy.taxRates) === null || _a === void 0 ? void 0 : _a.taxes) === null || _b === void 0 ? void 0 : _b[disableTaxID];
                            expect(disabledTax === null || disabledTax === void 0 ? void 0 : disabledTax.isDisabled).toBe(!!originalTaxes[disableTaxID].isDisabled);
                            expect((_c = disabledTax === null || disabledTax === void 0 ? void 0 : disabledTax.errorFields) === null || _c === void 0 ? void 0 : _c.isDisabled).toBeTruthy();
                            expect((_d = disabledTax === null || disabledTax === void 0 ? void 0 : disabledTax.pendingFields) === null || _d === void 0 ? void 0 : _d.isDisabled).toBeFalsy();
                            resolve();
                        },
                    });
                });
            });
        });
    });
    describe('RenamePolicyTax', function () {
        it('Rename tax', function () {
            var _a;
            var taxID = 'id_TAX_RATE_1';
            var newTaxName = 'Tax rate 1 updated';
            (_a = mockFetch === null || mockFetch === void 0 ? void 0 : mockFetch.pause) === null || _a === void 0 ? void 0 : _a.call(mockFetch);
            (0, TaxRate_1.renamePolicyTax)(fakePolicy.id, taxID, newTaxName);
            return (0, waitForBatchedUpdates_1.default)()
                .then(function () {
                return new Promise(function (resolve) {
                    var connection = react_native_onyx_1.default.connect({
                        key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(fakePolicy.id),
                        waitForCollectionCallback: false,
                        callback: function (policy) {
                            var _a, _b, _c, _d;
                            react_native_onyx_1.default.disconnect(connection);
                            var updatedTax = (_b = (_a = policy === null || policy === void 0 ? void 0 : policy.taxRates) === null || _a === void 0 ? void 0 : _a.taxes) === null || _b === void 0 ? void 0 : _b[taxID];
                            expect(updatedTax === null || updatedTax === void 0 ? void 0 : updatedTax.name).toBe(newTaxName);
                            expect((_c = updatedTax === null || updatedTax === void 0 ? void 0 : updatedTax.pendingFields) === null || _c === void 0 ? void 0 : _c.name).toBe(CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
                            expect((_d = updatedTax === null || updatedTax === void 0 ? void 0 : updatedTax.errorFields) === null || _d === void 0 ? void 0 : _d.name).toBeFalsy();
                            resolve();
                        },
                    });
                });
            })
                .then(mockFetch === null || mockFetch === void 0 ? void 0 : mockFetch.resume)
                .then(waitForBatchedUpdates_1.default)
                .then(function () {
                return new Promise(function (resolve) {
                    var connection = react_native_onyx_1.default.connect({
                        key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(fakePolicy.id),
                        waitForCollectionCallback: false,
                        callback: function (policy) {
                            var _a, _b, _c, _d;
                            react_native_onyx_1.default.disconnect(connection);
                            var updatedTax = (_b = (_a = policy === null || policy === void 0 ? void 0 : policy.taxRates) === null || _a === void 0 ? void 0 : _a.taxes) === null || _b === void 0 ? void 0 : _b[taxID];
                            expect((_c = updatedTax === null || updatedTax === void 0 ? void 0 : updatedTax.errorFields) === null || _c === void 0 ? void 0 : _c.name).toBeFalsy();
                            expect((_d = updatedTax === null || updatedTax === void 0 ? void 0 : updatedTax.pendingFields) === null || _d === void 0 ? void 0 : _d.name).toBeFalsy();
                            resolve();
                        },
                    });
                });
            });
        });
        it('Rename tax but API returns an error, then recover the original tax`s name', function () {
            var _a, _b;
            var taxID = 'id_TAX_RATE_1';
            var newTaxName = 'Tax rate 1 updated';
            var originalTaxRate = __assign({}, (_a = fakePolicy === null || fakePolicy === void 0 ? void 0 : fakePolicy.taxRates) === null || _a === void 0 ? void 0 : _a.taxes[taxID]);
            (_b = mockFetch === null || mockFetch === void 0 ? void 0 : mockFetch.pause) === null || _b === void 0 ? void 0 : _b.call(mockFetch);
            (0, TaxRate_1.renamePolicyTax)(fakePolicy.id, taxID, newTaxName);
            return (0, waitForBatchedUpdates_1.default)()
                .then(function () {
                return new Promise(function (resolve) {
                    var connection = react_native_onyx_1.default.connect({
                        key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(fakePolicy.id),
                        waitForCollectionCallback: false,
                        callback: function (policy) {
                            var _a, _b, _c, _d;
                            react_native_onyx_1.default.disconnect(connection);
                            var updatedTax = (_b = (_a = policy === null || policy === void 0 ? void 0 : policy.taxRates) === null || _a === void 0 ? void 0 : _a.taxes) === null || _b === void 0 ? void 0 : _b[taxID];
                            expect(updatedTax === null || updatedTax === void 0 ? void 0 : updatedTax.name).toBe(newTaxName);
                            expect((_c = updatedTax === null || updatedTax === void 0 ? void 0 : updatedTax.pendingFields) === null || _c === void 0 ? void 0 : _c.name).toBe(CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
                            expect((_d = updatedTax === null || updatedTax === void 0 ? void 0 : updatedTax.errorFields) === null || _d === void 0 ? void 0 : _d.name).toBeFalsy();
                            resolve();
                        },
                    });
                });
            })
                .then(function () {
                var _a, _b;
                (_a = mockFetch === null || mockFetch === void 0 ? void 0 : mockFetch.fail) === null || _a === void 0 ? void 0 : _a.call(mockFetch);
                return (_b = mockFetch === null || mockFetch === void 0 ? void 0 : mockFetch.resume) === null || _b === void 0 ? void 0 : _b.call(mockFetch);
            })
                .then(waitForBatchedUpdates_1.default)
                .then(function () {
                return new Promise(function (resolve) {
                    var connection = react_native_onyx_1.default.connect({
                        key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(fakePolicy.id),
                        waitForCollectionCallback: false,
                        callback: function (policy) {
                            var _a, _b, _c, _d;
                            react_native_onyx_1.default.disconnect(connection);
                            var updatedTax = (_b = (_a = policy === null || policy === void 0 ? void 0 : policy.taxRates) === null || _a === void 0 ? void 0 : _a.taxes) === null || _b === void 0 ? void 0 : _b[taxID];
                            expect(updatedTax === null || updatedTax === void 0 ? void 0 : updatedTax.name).toBe(originalTaxRate.name);
                            expect((_c = updatedTax === null || updatedTax === void 0 ? void 0 : updatedTax.errorFields) === null || _c === void 0 ? void 0 : _c.name).toBeTruthy();
                            expect((_d = updatedTax === null || updatedTax === void 0 ? void 0 : updatedTax.pendingFields) === null || _d === void 0 ? void 0 : _d.name).toBeFalsy();
                            resolve();
                        },
                    });
                });
            });
        });
    });
    describe('UpdatePolicyTaxValue', function () {
        it('Update tax`s value', function () {
            var _a;
            var taxID = 'id_TAX_RATE_1';
            var newTaxValue = 10;
            var stringTaxValue = "".concat(newTaxValue, "%");
            (_a = mockFetch === null || mockFetch === void 0 ? void 0 : mockFetch.pause) === null || _a === void 0 ? void 0 : _a.call(mockFetch);
            (0, TaxRate_1.updatePolicyTaxValue)(fakePolicy.id, taxID, newTaxValue);
            return (0, waitForBatchedUpdates_1.default)()
                .then(function () {
                return new Promise(function (resolve) {
                    var connection = react_native_onyx_1.default.connect({
                        key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(fakePolicy.id),
                        waitForCollectionCallback: false,
                        callback: function (policy) {
                            var _a, _b, _c, _d;
                            react_native_onyx_1.default.disconnect(connection);
                            var updatedTax = (_b = (_a = policy === null || policy === void 0 ? void 0 : policy.taxRates) === null || _a === void 0 ? void 0 : _a.taxes) === null || _b === void 0 ? void 0 : _b[taxID];
                            expect(updatedTax === null || updatedTax === void 0 ? void 0 : updatedTax.value).toBe(stringTaxValue);
                            expect((_c = updatedTax === null || updatedTax === void 0 ? void 0 : updatedTax.pendingFields) === null || _c === void 0 ? void 0 : _c.value).toBe(CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
                            expect((_d = updatedTax === null || updatedTax === void 0 ? void 0 : updatedTax.errorFields) === null || _d === void 0 ? void 0 : _d.value).toBeFalsy();
                            resolve();
                        },
                    });
                });
            })
                .then(mockFetch === null || mockFetch === void 0 ? void 0 : mockFetch.resume)
                .then(waitForBatchedUpdates_1.default)
                .then(function () {
                return new Promise(function (resolve) {
                    var connection = react_native_onyx_1.default.connect({
                        key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(fakePolicy.id),
                        waitForCollectionCallback: false,
                        callback: function (policy) {
                            var _a, _b, _c, _d;
                            react_native_onyx_1.default.disconnect(connection);
                            var updatedTax = (_b = (_a = policy === null || policy === void 0 ? void 0 : policy.taxRates) === null || _a === void 0 ? void 0 : _a.taxes) === null || _b === void 0 ? void 0 : _b[taxID];
                            expect((_c = updatedTax === null || updatedTax === void 0 ? void 0 : updatedTax.errorFields) === null || _c === void 0 ? void 0 : _c.value).toBeFalsy();
                            expect((_d = updatedTax === null || updatedTax === void 0 ? void 0 : updatedTax.pendingFields) === null || _d === void 0 ? void 0 : _d.value).toBeFalsy();
                            resolve();
                        },
                    });
                });
            });
        });
        it('Update tax`s value but API returns an error, then recover the original tax`s value', function () {
            var _a, _b;
            var taxID = 'id_TAX_RATE_1';
            var newTaxValue = 10;
            var originalTaxRate = __assign({}, (_a = fakePolicy === null || fakePolicy === void 0 ? void 0 : fakePolicy.taxRates) === null || _a === void 0 ? void 0 : _a.taxes[taxID]);
            var stringTaxValue = "".concat(newTaxValue, "%");
            (_b = mockFetch === null || mockFetch === void 0 ? void 0 : mockFetch.pause) === null || _b === void 0 ? void 0 : _b.call(mockFetch);
            (0, TaxRate_1.updatePolicyTaxValue)(fakePolicy.id, taxID, newTaxValue);
            return (0, waitForBatchedUpdates_1.default)()
                .then(function () {
                return new Promise(function (resolve) {
                    var connection = react_native_onyx_1.default.connect({
                        key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(fakePolicy.id),
                        waitForCollectionCallback: false,
                        callback: function (policy) {
                            var _a, _b, _c, _d;
                            react_native_onyx_1.default.disconnect(connection);
                            var updatedTax = (_b = (_a = policy === null || policy === void 0 ? void 0 : policy.taxRates) === null || _a === void 0 ? void 0 : _a.taxes) === null || _b === void 0 ? void 0 : _b[taxID];
                            expect(updatedTax === null || updatedTax === void 0 ? void 0 : updatedTax.value).toBe(stringTaxValue);
                            expect((_c = updatedTax === null || updatedTax === void 0 ? void 0 : updatedTax.pendingFields) === null || _c === void 0 ? void 0 : _c.value).toBe(CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
                            expect((_d = updatedTax === null || updatedTax === void 0 ? void 0 : updatedTax.errorFields) === null || _d === void 0 ? void 0 : _d.value).toBeFalsy();
                            resolve();
                        },
                    });
                });
            })
                .then(function () {
                var _a, _b;
                (_a = mockFetch === null || mockFetch === void 0 ? void 0 : mockFetch.fail) === null || _a === void 0 ? void 0 : _a.call(mockFetch);
                return (_b = mockFetch === null || mockFetch === void 0 ? void 0 : mockFetch.resume) === null || _b === void 0 ? void 0 : _b.call(mockFetch);
            })
                .then(waitForBatchedUpdates_1.default)
                .then(function () {
                return new Promise(function (resolve) {
                    var connection = react_native_onyx_1.default.connect({
                        key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(fakePolicy.id),
                        waitForCollectionCallback: false,
                        callback: function (policy) {
                            var _a, _b, _c, _d;
                            react_native_onyx_1.default.disconnect(connection);
                            var updatedTax = (_b = (_a = policy === null || policy === void 0 ? void 0 : policy.taxRates) === null || _a === void 0 ? void 0 : _a.taxes) === null || _b === void 0 ? void 0 : _b[taxID];
                            expect(updatedTax === null || updatedTax === void 0 ? void 0 : updatedTax.value).toBe(originalTaxRate.value);
                            expect((_c = updatedTax === null || updatedTax === void 0 ? void 0 : updatedTax.errorFields) === null || _c === void 0 ? void 0 : _c.value).toBeTruthy();
                            expect((_d = updatedTax === null || updatedTax === void 0 ? void 0 : updatedTax.pendingFields) === null || _d === void 0 ? void 0 : _d.value).toBeFalsy();
                            resolve();
                        },
                    });
                });
            });
        });
    });
    describe('DeletePolicyTaxes', function () {
        it('Delete tax that is not foreignTaxDefault', function () {
            var _a, _b;
            var foreignTaxDefault = (_a = fakePolicy === null || fakePolicy === void 0 ? void 0 : fakePolicy.taxRates) === null || _a === void 0 ? void 0 : _a.foreignTaxDefault;
            var taxID = 'id_TAX_RATE_1';
            (_b = mockFetch === null || mockFetch === void 0 ? void 0 : mockFetch.pause) === null || _b === void 0 ? void 0 : _b.call(mockFetch);
            (0, TaxRate_1.deletePolicyTaxes)(fakePolicy, [taxID]);
            return (0, waitForBatchedUpdates_1.default)()
                .then(function () {
                return new Promise(function (resolve) {
                    var connection = react_native_onyx_1.default.connect({
                        key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(fakePolicy.id),
                        waitForCollectionCallback: false,
                        callback: function (policy) {
                            var _a, _b;
                            react_native_onyx_1.default.disconnect(connection);
                            var taxRates = policy === null || policy === void 0 ? void 0 : policy.taxRates;
                            var deletedTax = (_a = taxRates === null || taxRates === void 0 ? void 0 : taxRates.taxes) === null || _a === void 0 ? void 0 : _a[taxID];
                            expect((_b = taxRates === null || taxRates === void 0 ? void 0 : taxRates.pendingFields) === null || _b === void 0 ? void 0 : _b.foreignTaxDefault).toBeFalsy();
                            expect(taxRates === null || taxRates === void 0 ? void 0 : taxRates.foreignTaxDefault).toBe(foreignTaxDefault);
                            expect(deletedTax === null || deletedTax === void 0 ? void 0 : deletedTax.pendingAction).toBe(CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
                            expect(deletedTax === null || deletedTax === void 0 ? void 0 : deletedTax.errors).toBeFalsy();
                            resolve();
                        },
                    });
                });
            })
                .then(mockFetch === null || mockFetch === void 0 ? void 0 : mockFetch.resume)
                .then(waitForBatchedUpdates_1.default)
                .then(function () {
                return new Promise(function (resolve) {
                    var connection = react_native_onyx_1.default.connect({
                        key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(fakePolicy.id),
                        waitForCollectionCallback: false,
                        callback: function (policy) {
                            var _a, _b;
                            react_native_onyx_1.default.disconnect(connection);
                            var taxRates = policy === null || policy === void 0 ? void 0 : policy.taxRates;
                            var deletedTax = (_a = taxRates === null || taxRates === void 0 ? void 0 : taxRates.taxes) === null || _a === void 0 ? void 0 : _a[taxID];
                            expect((_b = taxRates === null || taxRates === void 0 ? void 0 : taxRates.pendingFields) === null || _b === void 0 ? void 0 : _b.foreignTaxDefault).toBeFalsy();
                            expect(deletedTax).toBeFalsy();
                            resolve();
                        },
                    });
                });
            });
        });
        it('Delete tax that is foreignTaxDefault', function () {
            var _a;
            var taxID = 'id_TAX_RATE_1';
            var firstTaxID = 'id_TAX_EXEMPT';
            var fakePolicyWithForeignTaxDefault = __assign(__assign({}, fakePolicy), { taxRates: __assign(__assign({}, CONST_1.default.DEFAULT_TAX), { foreignTaxDefault: 'id_TAX_RATE_1' }) });
            (_a = mockFetch === null || mockFetch === void 0 ? void 0 : mockFetch.pause) === null || _a === void 0 ? void 0 : _a.call(mockFetch);
            (0, TaxRate_1.deletePolicyTaxes)(fakePolicyWithForeignTaxDefault, [taxID]);
            return (0, waitForBatchedUpdates_1.default)()
                .then(function () {
                return new Promise(function (resolve) {
                    var connection = react_native_onyx_1.default.connect({
                        key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(fakePolicyWithForeignTaxDefault.id),
                        waitForCollectionCallback: false,
                        callback: function (policy) {
                            var _a, _b;
                            react_native_onyx_1.default.disconnect(connection);
                            var taxRates = policy === null || policy === void 0 ? void 0 : policy.taxRates;
                            var deletedTax = (_a = taxRates === null || taxRates === void 0 ? void 0 : taxRates.taxes) === null || _a === void 0 ? void 0 : _a[taxID];
                            expect((_b = taxRates === null || taxRates === void 0 ? void 0 : taxRates.pendingFields) === null || _b === void 0 ? void 0 : _b.foreignTaxDefault).toBe(CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
                            expect(taxRates === null || taxRates === void 0 ? void 0 : taxRates.foreignTaxDefault).toBe(firstTaxID);
                            expect(deletedTax === null || deletedTax === void 0 ? void 0 : deletedTax.pendingAction).toBe(CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
                            expect(deletedTax === null || deletedTax === void 0 ? void 0 : deletedTax.errors).toBeFalsy();
                            resolve();
                        },
                    });
                });
            })
                .then(mockFetch === null || mockFetch === void 0 ? void 0 : mockFetch.resume)
                .then(waitForBatchedUpdates_1.default)
                .then(function () {
                return new Promise(function (resolve) {
                    var connection = react_native_onyx_1.default.connect({
                        key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(fakePolicyWithForeignTaxDefault.id),
                        waitForCollectionCallback: false,
                        callback: function (policy) {
                            var _a, _b;
                            react_native_onyx_1.default.disconnect(connection);
                            var taxRates = policy === null || policy === void 0 ? void 0 : policy.taxRates;
                            var deletedTax = (_a = taxRates === null || taxRates === void 0 ? void 0 : taxRates.taxes) === null || _a === void 0 ? void 0 : _a[taxID];
                            expect((_b = taxRates === null || taxRates === void 0 ? void 0 : taxRates.pendingFields) === null || _b === void 0 ? void 0 : _b.foreignTaxDefault).toBeFalsy();
                            expect(deletedTax).toBeFalsy();
                            resolve();
                        },
                    });
                });
            });
        });
        it('Delete tax that is not foreignTaxDefault but API return an error, then recover the deleted tax', function () {
            var _a, _b;
            var foreignTaxDefault = (_a = fakePolicy === null || fakePolicy === void 0 ? void 0 : fakePolicy.taxRates) === null || _a === void 0 ? void 0 : _a.foreignTaxDefault;
            var taxID = 'id_TAX_RATE_1';
            (_b = mockFetch === null || mockFetch === void 0 ? void 0 : mockFetch.pause) === null || _b === void 0 ? void 0 : _b.call(mockFetch);
            (0, TaxRate_1.deletePolicyTaxes)(fakePolicy, [taxID]);
            return (0, waitForBatchedUpdates_1.default)()
                .then(function () {
                return new Promise(function (resolve) {
                    var connection = react_native_onyx_1.default.connect({
                        key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(fakePolicy.id),
                        waitForCollectionCallback: false,
                        callback: function (policy) {
                            var _a, _b;
                            react_native_onyx_1.default.disconnect(connection);
                            var taxRates = policy === null || policy === void 0 ? void 0 : policy.taxRates;
                            var deletedTax = (_a = taxRates === null || taxRates === void 0 ? void 0 : taxRates.taxes) === null || _a === void 0 ? void 0 : _a[taxID];
                            expect((_b = taxRates === null || taxRates === void 0 ? void 0 : taxRates.pendingFields) === null || _b === void 0 ? void 0 : _b.foreignTaxDefault).toBeFalsy();
                            expect(taxRates === null || taxRates === void 0 ? void 0 : taxRates.foreignTaxDefault).toBe(foreignTaxDefault);
                            expect(deletedTax === null || deletedTax === void 0 ? void 0 : deletedTax.pendingAction).toBe(CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
                            expect(deletedTax === null || deletedTax === void 0 ? void 0 : deletedTax.errors).toBeFalsy();
                            resolve();
                        },
                    });
                });
            })
                .then(function () {
                var _a, _b;
                (_a = mockFetch === null || mockFetch === void 0 ? void 0 : mockFetch.fail) === null || _a === void 0 ? void 0 : _a.call(mockFetch);
                return (_b = mockFetch === null || mockFetch === void 0 ? void 0 : mockFetch.resume) === null || _b === void 0 ? void 0 : _b.call(mockFetch);
            })
                .then(waitForBatchedUpdates_1.default)
                .then(function () {
                return new Promise(function (resolve) {
                    var connection = react_native_onyx_1.default.connect({
                        key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(fakePolicy.id),
                        waitForCollectionCallback: false,
                        callback: function (policy) {
                            var _a, _b;
                            react_native_onyx_1.default.disconnect(connection);
                            var taxRates = policy === null || policy === void 0 ? void 0 : policy.taxRates;
                            var deletedTax = (_a = taxRates === null || taxRates === void 0 ? void 0 : taxRates.taxes) === null || _a === void 0 ? void 0 : _a[taxID];
                            expect((_b = taxRates === null || taxRates === void 0 ? void 0 : taxRates.pendingFields) === null || _b === void 0 ? void 0 : _b.foreignTaxDefault).toBeFalsy();
                            expect(deletedTax === null || deletedTax === void 0 ? void 0 : deletedTax.pendingAction).toBeFalsy();
                            expect(deletedTax === null || deletedTax === void 0 ? void 0 : deletedTax.errors).toBeTruthy();
                            resolve();
                        },
                    });
                });
            });
        });
    });
});
