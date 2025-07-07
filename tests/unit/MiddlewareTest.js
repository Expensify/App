"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_onyx_1 = require("react-native-onyx");
var HttpUtils_1 = require("@src/libs/HttpUtils");
var HandleUnusedOptimisticID_1 = require("@src/libs/Middleware/HandleUnusedOptimisticID");
var MainQueue = require("@src/libs/Network/MainQueue");
var NetworkStore = require("@src/libs/Network/NetworkStore");
var SequentialQueue = require("@src/libs/Network/SequentialQueue");
var Request = require("@src/libs/Request");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var TestHelper = require("../utils/TestHelper");
var waitForNetworkPromises_1 = require("../utils/waitForNetworkPromises");
react_native_onyx_1.default.init({
    keys: ONYXKEYS_1.default,
});
beforeAll(function () {
    global.fetch = TestHelper.getGlobalFetchMock();
});
beforeEach(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                SequentialQueue.pause();
                MainQueue.clear();
                HttpUtils_1.default.cancelPendingRequests();
                NetworkStore.checkRequiredData();
                return [4 /*yield*/, (0, waitForNetworkPromises_1.default)()];
            case 1:
                _a.sent();
                jest.clearAllMocks();
                Request.clearMiddlewares();
                return [2 /*return*/];
        }
    });
}); });
describe('Middleware', function () {
    describe('HandleUnusedOptimisticID', function () {
        test('Normal request', function () { return __awaiter(void 0, void 0, void 0, function () {
            var requests, _i, requests_1, request;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        Request.use(HandleUnusedOptimisticID_1.default);
                        requests = [
                            {
                                command: 'OpenReport',
                                data: { authToken: 'testToken', reportID: '1234' },
                            },
                            {
                                command: 'AddComment',
                                data: { authToken: 'testToken', reportID: '1234', reportActionID: '5678' },
                            },
                        ];
                        for (_i = 0, requests_1 = requests; _i < requests_1.length; _i++) {
                            request = requests_1[_i];
                            SequentialQueue.push(request);
                        }
                        SequentialQueue.unpause();
                        return [4 /*yield*/, (0, waitForNetworkPromises_1.default)()];
                    case 1:
                        _c.sent();
                        expect(global.fetch).toHaveBeenCalledTimes(2);
                        expect(global.fetch).toHaveBeenLastCalledWith('https://www.expensify.com.dev/api/AddComment?', expect.anything());
                        TestHelper.assertFormDataMatchesObject({
                            reportID: '1234',
                        }, (_a = global.fetch.mock.calls.at(1).at(1)) === null || _a === void 0 ? void 0 : _a.body);
                        expect(global.fetch).toHaveBeenNthCalledWith(1, 'https://www.expensify.com.dev/api/OpenReport?', expect.anything());
                        TestHelper.assertFormDataMatchesObject({
                            reportID: '1234',
                        }, (_b = global.fetch.mock.calls.at(0).at(1)) === null || _b === void 0 ? void 0 : _b.body);
                        return [2 /*return*/];
                }
            });
        }); });
        test('Request with preexistingReportID', function () { return __awaiter(void 0, void 0, void 0, function () {
            var requests, _i, requests_2, request;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        Request.use(HandleUnusedOptimisticID_1.default);
                        requests = [
                            {
                                command: 'OpenReport',
                                data: { authToken: 'testToken', reportID: '1234' },
                            },
                            {
                                command: 'AddComment',
                                data: { authToken: 'testToken', reportID: '1234', reportActionID: '5678' },
                            },
                        ];
                        for (_i = 0, requests_2 = requests; _i < requests_2.length; _i++) {
                            request = requests_2[_i];
                            SequentialQueue.push(request);
                        }
                        // eslint-disable-next-line @typescript-eslint/require-await
                        global.fetch.mockImplementationOnce(function () { return __awaiter(void 0, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                return [2 /*return*/, ({
                                        ok: true,
                                        // eslint-disable-next-line @typescript-eslint/require-await
                                        json: function () { return __awaiter(void 0, void 0, void 0, function () {
                                            return __generator(this, function (_a) {
                                                return [2 /*return*/, ({
                                                        jsonCode: 200,
                                                        onyxData: [
                                                            {
                                                                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                                                                key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT, "1234"),
                                                                value: {
                                                                    preexistingReportID: '5555',
                                                                },
                                                            },
                                                        ],
                                                    })];
                                            });
                                        }); },
                                    })];
                            });
                        }); });
                        SequentialQueue.unpause();
                        return [4 /*yield*/, (0, waitForNetworkPromises_1.default)()];
                    case 1:
                        _c.sent();
                        expect(global.fetch).toHaveBeenCalledTimes(2);
                        expect(global.fetch).toHaveBeenLastCalledWith('https://www.expensify.com.dev/api/AddComment?', expect.anything());
                        TestHelper.assertFormDataMatchesObject({
                            reportID: '5555',
                        }, (_a = global.fetch.mock.calls.at(1).at(1)) === null || _a === void 0 ? void 0 : _a.body);
                        expect(global.fetch).toHaveBeenNthCalledWith(1, 'https://www.expensify.com.dev/api/OpenReport?', expect.anything());
                        TestHelper.assertFormDataMatchesObject({ reportID: '1234' }, (_b = global.fetch.mock.calls.at(0).at(1)) === null || _b === void 0 ? void 0 : _b.body);
                        return [2 /*return*/];
                }
            });
        }); });
        test('Request with preexistingReportID and no reportID in params', function () { return __awaiter(void 0, void 0, void 0, function () {
            var requests, _i, requests_3, request, formData, formDataObject;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        Request.use(HandleUnusedOptimisticID_1.default);
                        requests = [
                            {
                                command: 'RequestMoney',
                                data: { authToken: 'testToken' },
                            },
                            {
                                command: 'AddComment',
                                data: { authToken: 'testToken', reportID: '1234', reportActionID: '5678' },
                            },
                            {
                                command: 'OpenReport',
                                data: { authToken: 'testToken', reportID: '2345', reportActionID: undefined, parentReportActionID: undefined },
                            },
                        ];
                        for (_i = 0, requests_3 = requests; _i < requests_3.length; _i++) {
                            request = requests_3[_i];
                            SequentialQueue.push(request);
                        }
                        // eslint-disable-next-line @typescript-eslint/require-await
                        global.fetch.mockImplementationOnce(function () { return __awaiter(void 0, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                return [2 /*return*/, ({
                                        ok: true,
                                        // eslint-disable-next-line @typescript-eslint/require-await
                                        json: function () { return __awaiter(void 0, void 0, void 0, function () {
                                            return __generator(this, function (_a) {
                                                return [2 /*return*/, ({
                                                        jsonCode: 200,
                                                        onyxData: [
                                                            {
                                                                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                                                                key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT, "1234"),
                                                                value: {
                                                                    preexistingReportID: '5555',
                                                                },
                                                            },
                                                        ],
                                                    })];
                                            });
                                        }); },
                                    })];
                            });
                        }); });
                        SequentialQueue.unpause();
                        return [4 /*yield*/, (0, waitForNetworkPromises_1.default)()];
                    case 1:
                        _c.sent();
                        expect(global.fetch).toHaveBeenCalledTimes(3);
                        expect(global.fetch).toHaveBeenLastCalledWith('https://www.expensify.com.dev/api/OpenReport?', expect.anything());
                        TestHelper.assertFormDataMatchesObject({
                            reportID: '5555',
                        }, (_a = global.fetch.mock.calls.at(1).at(1)) === null || _a === void 0 ? void 0 : _a.body);
                        formData = (_b = global.fetch.mock.calls.at(2).at(1)) === null || _b === void 0 ? void 0 : _b.body;
                        expect(formData).not.toBeUndefined();
                        if (formData) {
                            formDataObject = Array.from(formData.entries()).reduce(function (acc, _a) {
                                var key = _a[0], val = _a[1];
                                acc[key] = val;
                                return acc;
                            }, {});
                            expect(formDataObject.reportActionID).toBeUndefined();
                            expect(formDataObject.parentReportActionID).toBeUndefined();
                        }
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
