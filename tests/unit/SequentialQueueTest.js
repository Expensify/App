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
var NetworkInterceptor_1 = require("@libs/E2E/utils/NetworkInterceptor");
var PersistedRequests_1 = require("@userActions/PersistedRequests");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var SequentialQueue = require("../../src/libs/Network/SequentialQueue");
var TestHelper = require("../utils/TestHelper");
var waitForBatchedUpdates_1 = require("../utils/waitForBatchedUpdates");
var request = {
    command: 'ReconnectApp',
    successData: [{ key: 'userMetadata', onyxMethod: 'set', value: { accountID: 1234 } }],
    failureData: [{ key: 'userMetadata', onyxMethod: 'set', value: {} }],
};
beforeAll(function () {
    react_native_onyx_1.default.init({
        keys: ONYXKEYS_1.default,
    });
});
beforeEach(function () {
    global.fetch = TestHelper.getGlobalFetchMock();
    return react_native_onyx_1.default.clear().then(waitForBatchedUpdates_1.default);
});
describe('SequentialQueue', function () {
    it('should push one request and persist one', function () {
        SequentialQueue.push(request);
        expect((0, PersistedRequests_1.getLength)()).toBe(1);
    });
    it('should push two requests and persist two', function () {
        SequentialQueue.push(request);
        SequentialQueue.push(request);
        expect((0, PersistedRequests_1.getLength)()).toBe(2);
    });
    it('should push two requests with conflict resolution and replace', function () {
        var _a;
        SequentialQueue.push(request);
        var requestWithConflictResolution = {
            command: 'ReconnectApp',
            data: { accountID: 56789 },
            checkAndFixConflictingRequest: function (persistedRequests) {
                // should be one instance of ReconnectApp, get the index to replace it later
                var index = persistedRequests.findIndex(function (r) { return r.command === 'ReconnectApp'; });
                if (index === -1) {
                    return { conflictAction: { type: 'push' } };
                }
                return {
                    conflictAction: { type: 'replace', index: index },
                };
            },
        };
        SequentialQueue.push(requestWithConflictResolution);
        expect((0, PersistedRequests_1.getLength)()).toBe(1);
        // We know there is only one request in the queue, so we can get the first one and verify
        // that the persisted request is the second one.
        var persistedRequest = (0, PersistedRequests_1.getAll)().at(0);
        expect((_a = persistedRequest === null || persistedRequest === void 0 ? void 0 : persistedRequest.data) === null || _a === void 0 ? void 0 : _a.accountID).toBe(56789);
    });
    it('should push two requests with conflict resolution and push', function () {
        SequentialQueue.push(request);
        var requestWithConflictResolution = {
            command: 'ReconnectApp',
            data: { accountID: 56789 },
            checkAndFixConflictingRequest: function () {
                return { conflictAction: { type: 'push' } };
            },
        };
        SequentialQueue.push(requestWithConflictResolution);
        expect((0, PersistedRequests_1.getLength)()).toBe(2);
    });
    it('should push two requests with conflict resolution and noAction', function () {
        SequentialQueue.push(request);
        var requestWithConflictResolution = {
            command: 'ReconnectApp',
            data: { accountID: 56789 },
            checkAndFixConflictingRequest: function () {
                return { conflictAction: { type: 'noAction' } };
            },
        };
        SequentialQueue.push(requestWithConflictResolution);
        expect((0, PersistedRequests_1.getLength)()).toBe(1);
    });
    it('should add a new request even if a similar one is ongoing', function () { return __awaiter(void 0, void 0, void 0, function () {
        var requestWithConflictResolution;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // .push at the end flush the queue
                    SequentialQueue.push(request);
                    // wait for Onyx.connect execute the callback and start processing the queue
                    return [4 /*yield*/, Promise.resolve()];
                case 1:
                    // wait for Onyx.connect execute the callback and start processing the queue
                    _a.sent();
                    requestWithConflictResolution = {
                        command: 'ReconnectApp',
                        data: { accountID: 56789 },
                        checkAndFixConflictingRequest: function (persistedRequests) {
                            // should be one instance of ReconnectApp, get the index to replace it later
                            var index = persistedRequests.findIndex(function (r) { return r.command === 'ReconnectApp'; });
                            if (index === -1) {
                                return { conflictAction: { type: 'push' } };
                            }
                            return {
                                conflictAction: { type: 'replace', index: index },
                            };
                        },
                    };
                    SequentialQueue.push(requestWithConflictResolution);
                    expect((0, PersistedRequests_1.getLength)()).toBe(2);
                    return [2 /*return*/];
            }
        });
    }); });
    it('should replace request request in queue while a similar one is ongoing', function () { return __awaiter(void 0, void 0, void 0, function () {
        var conflictResolver, requestWithConflictResolution, requestWithConflictResolution2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // .push at the end flush the queue
                    SequentialQueue.push(request);
                    // wait for Onyx.connect execute the callback and start processing the queue
                    return [4 /*yield*/, Promise.resolve()];
                case 1:
                    // wait for Onyx.connect execute the callback and start processing the queue
                    _a.sent();
                    conflictResolver = function (persistedRequests) {
                        // should be one instance of ReconnectApp, get the index to replace it later
                        var index = persistedRequests.findIndex(function (r) { return r.command === 'ReconnectApp'; });
                        if (index === -1) {
                            return { conflictAction: { type: 'push' } };
                        }
                        return {
                            conflictAction: { type: 'replace', index: index },
                        };
                    };
                    requestWithConflictResolution = {
                        command: 'ReconnectApp',
                        data: { accountID: 56789 },
                        checkAndFixConflictingRequest: conflictResolver,
                    };
                    requestWithConflictResolution2 = {
                        command: 'ReconnectApp',
                        data: { accountID: 56789 },
                        checkAndFixConflictingRequest: conflictResolver,
                    };
                    SequentialQueue.push(requestWithConflictResolution);
                    SequentialQueue.push(requestWithConflictResolution2);
                    expect((0, PersistedRequests_1.getLength)()).toBe(2);
                    return [2 /*return*/];
            }
        });
    }); });
    it('should replace request request in queue while a similar one is ongoing and keep the same index', function () {
        var _a, _b;
        SequentialQueue.push({ command: 'OpenReport' });
        SequentialQueue.push(request);
        var requestWithConflictResolution = {
            command: 'ReconnectApp',
            data: { accountID: 56789 },
            checkAndFixConflictingRequest: function (persistedRequests) {
                // should be one instance of ReconnectApp, get the index to replace it later
                var index = persistedRequests.findIndex(function (r) { return r.command === 'ReconnectApp'; });
                if (index === -1) {
                    return { conflictAction: { type: 'push' } };
                }
                return {
                    conflictAction: { type: 'replace', index: index },
                };
            },
        };
        SequentialQueue.push(requestWithConflictResolution);
        SequentialQueue.push({ command: 'AddComment' });
        SequentialQueue.push({ command: 'OpenReport' });
        expect((0, PersistedRequests_1.getLength)()).toBe(4);
        var persistedRequests = (0, PersistedRequests_1.getAll)();
        // We know ReconnectApp is at index 1 in the queue, so we can get it to verify
        // that was replaced by the new request.
        expect((_b = (_a = persistedRequests.at(1)) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.accountID).toBe(56789);
    });
    // need to test a rance condition between processing the next request and then pushing a new request with conflict resolver
    it('should resolve the conflict and replace the correct request in the queue while a new request is picked up after unpausing', function () { return __awaiter(void 0, void 0, void 0, function () {
        var i, requestWithConflictResolution, persistedRequests;
        var _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    SequentialQueue.pause();
                    for (i = 0; i < 5; i++) {
                        SequentialQueue.push({ command: "OpenReport".concat(i) });
                        SequentialQueue.push({ command: "AddComment".concat(i) });
                    }
                    SequentialQueue.push(request);
                    SequentialQueue.push({ command: 'AddComment6' });
                    SequentialQueue.push({ command: 'OpenReport6' });
                    // wait for Onyx.connect execute the callback and start processing the queue
                    return [4 /*yield*/, Promise.resolve()];
                case 1:
                    // wait for Onyx.connect execute the callback and start processing the queue
                    _d.sent();
                    requestWithConflictResolution = {
                        command: 'ReconnectApp-replaced',
                        data: { accountID: 56789 },
                        checkAndFixConflictingRequest: function (persistedRequests) {
                            // should be one instance of ReconnectApp, get the index to replace it later
                            var index = persistedRequests.findIndex(function (r) { return r.command === 'ReconnectApp'; });
                            if (index === -1) {
                                return { conflictAction: { type: 'push' } };
                            }
                            return {
                                conflictAction: { type: 'replace', index: index },
                            };
                        },
                    };
                    Promise.resolve().then(function () {
                        SequentialQueue.unpause();
                    });
                    Promise.resolve().then(function () {
                        SequentialQueue.push(requestWithConflictResolution);
                    });
                    return [4 /*yield*/, Promise.resolve()];
                case 2:
                    _d.sent();
                    return [4 /*yield*/, (0, NetworkInterceptor_1.waitForActiveRequestsToBeEmpty)()];
                case 3:
                    _d.sent();
                    persistedRequests = (0, PersistedRequests_1.getAll)();
                    // We know ReconnectApp is at index 9 in the queue, so we can get it to verify
                    // that was replaced by the new request.
                    expect((_a = persistedRequests.at(9)) === null || _a === void 0 ? void 0 : _a.command).toBe('ReconnectApp-replaced');
                    expect((_c = (_b = persistedRequests.at(9)) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.accountID).toBe(56789);
                    return [2 /*return*/];
            }
        });
    }); });
    // I need to test now when moving the request from the queue to the ongoing request the PERSISTED_REQUESTS is decreased and PERSISTED_ONGOING_REQUESTS has the new request
    it('should move the request from the queue to the ongoing request and save it into Onyx', function () {
        var persistedRequest = __assign(__assign({}, request), { persistWhenOngoing: true, initiatedOffline: false });
        SequentialQueue.push(persistedRequest);
        var connectionId = react_native_onyx_1.default.connect({
            key: ONYXKEYS_1.default.PERSISTED_ONGOING_REQUESTS,
            callback: function (ongoingRequest) {
                if (!ongoingRequest) {
                    return;
                }
                react_native_onyx_1.default.disconnect(connectionId);
                expect(ongoingRequest).toEqual(persistedRequest);
                expect(ongoingRequest).toEqual((0, PersistedRequests_1.getOngoingRequest)());
                expect((0, PersistedRequests_1.getAll)().length).toBe(0);
            },
        });
    });
    it('should get the ongoing request from onyx and start processing it', function () { return __awaiter(void 0, void 0, void 0, function () {
        var persistedRequest;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    persistedRequest = __assign(__assign({}, request), { persistWhenOngoing: true, initiatedOffline: false });
                    react_native_onyx_1.default.set(ONYXKEYS_1.default.PERSISTED_ONGOING_REQUESTS, persistedRequest);
                    SequentialQueue.push({ command: 'OpenReport' });
                    return [4 /*yield*/, Promise.resolve()];
                case 1:
                    _a.sent();
                    expect(persistedRequest).toEqual((0, PersistedRequests_1.getOngoingRequest)());
                    expect((0, PersistedRequests_1.getAll)().length).toBe(1);
                    return [2 /*return*/];
            }
        });
    }); });
});
describe('SequentialQueue - QueueFlushedData', function () {
    it('should add to queueFlushedData', function () { return __awaiter(void 0, void 0, void 0, function () {
        var updates;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    updates = [{ key: 'userMetadata', onyxMethod: 'set', value: { accountID: 1234 } }];
                    return [4 /*yield*/, SequentialQueue.saveQueueFlushedData.apply(SequentialQueue, updates)];
                case 1:
                    _a.sent();
                    expect(SequentialQueue.getQueueFlushedData()).toEqual([{ key: 'userMetadata', onyxMethod: 'set', value: { accountID: 1234 } }]);
                    return [2 /*return*/];
            }
        });
    }); });
    it('should clear queueFlushedData', function () { return __awaiter(void 0, void 0, void 0, function () {
        var updates;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    updates = [{ key: 'userMetadata', onyxMethod: 'set', value: { accountID: 1234 } }];
                    return [4 /*yield*/, SequentialQueue.saveQueueFlushedData.apply(SequentialQueue, updates)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, SequentialQueue.clearQueueFlushedData()];
                case 2:
                    _a.sent();
                    expect(SequentialQueue.getQueueFlushedData()).toEqual([]);
                    return [2 /*return*/];
            }
        });
    }); });
});
