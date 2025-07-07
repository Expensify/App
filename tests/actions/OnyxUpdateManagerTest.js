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
var OnyxUtils_1 = require("react-native-onyx/dist/OnyxUtils");
var AppImport = require("@libs/actions/App");
var applyOnyxUpdatesReliably_1 = require("@libs/actions/applyOnyxUpdatesReliably");
var OnyxUpdateManagerExports = require("@libs/actions/OnyxUpdateManager");
var OnyxUpdateManagerUtilsImport = require("@libs/actions/OnyxUpdateManager/utils");
var ApplyUpdatesImport = require("@libs/actions/OnyxUpdateManager/utils/applyUpdates");
var SequentialQueue = require("@libs/Network/SequentialQueue");
var CONST_1 = require("@src/CONST");
var OnyxUpdateManager_1 = require("@src/libs/actions/OnyxUpdateManager");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var OnyxUpdateMockUtils_1 = require("../utils/OnyxUpdateMockUtils");
jest.mock('@userActions/OnyxUpdates');
jest.mock('@userActions/App');
jest.mock('@userActions/OnyxUpdateManager/utils');
jest.mock('@userActions/OnyxUpdateManager/utils/applyUpdates', function () {
    var ApplyUpdatesImplementation = jest.requireActual('@userActions/OnyxUpdateManager/utils/applyUpdates');
    return {
        applyUpdates: jest.fn(function (updates) { return ApplyUpdatesImplementation.applyUpdates(updates); }),
    };
});
jest.mock('@hooks/useScreenWrapperTransitionStatus', function () { return ({
    default: function () { return ({
        didScreenTransitionEnd: true,
    }); },
}); });
var App = AppImport;
var ApplyUpdates = ApplyUpdatesImport;
var OnyxUpdateManagerUtils = OnyxUpdateManagerUtilsImport;
var TEST_USER_ACCOUNT_ID = 1;
var REPORT_ID = 'testReport1';
var ONYX_KEY = "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(REPORT_ID);
var exampleReportAction = {
    actionName: CONST_1.default.REPORT.ACTIONS.TYPE.ADD_COMMENT,
    actorAccountID: TEST_USER_ACCOUNT_ID,
    automatic: false,
    avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/avatar_3.png',
    message: [{ type: 'COMMENT', html: 'Testing a comment', text: 'Testing a comment', translationKey: '' }],
    person: [{ type: 'TEXT', style: 'strong', text: 'Test User' }],
    shouldShow: true,
};
var initialData = { report1: exampleReportAction, report2: exampleReportAction, report3: exampleReportAction };
var mockUpdate1 = OnyxUpdateMockUtils_1.default.createUpdate(1, [
    {
        onyxMethod: OnyxUtils_1.default.METHOD.SET,
        key: ONYX_KEY,
        value: initialData,
    },
]);
var mockUpdate2 = OnyxUpdateMockUtils_1.default.createUpdate(2, [
    {
        onyxMethod: OnyxUtils_1.default.METHOD.MERGE,
        key: ONYX_KEY,
        value: {
            report1: null,
        },
    },
]);
var report2PersonDiff = {
    person: [
        { type: 'TEXT', style: 'light', text: 'Other Test User' },
        { type: 'TEXT', style: 'light', text: 'Other Test User 2' },
    ],
};
var report3AvatarDiff = {
    avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/avatar_5.png',
};
var mockUpdate3 = OnyxUpdateMockUtils_1.default.createUpdate(3, [
    {
        onyxMethod: OnyxUtils_1.default.METHOD.MERGE,
        key: ONYX_KEY,
        value: {
            report2: report2PersonDiff,
            report3: report3AvatarDiff,
        },
    },
]);
var mockUpdate4 = OnyxUpdateMockUtils_1.default.createUpdate(4, [
    {
        onyxMethod: OnyxUtils_1.default.METHOD.MERGE,
        key: ONYX_KEY,
        value: {
            report3: null,
        },
    },
]);
var report2AvatarDiff = {
    avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/avatar_6.png',
};
var report4 = __assign(__assign({}, exampleReportAction), { automatic: true });
var mockUpdate5 = OnyxUpdateMockUtils_1.default.createUpdate(5, [
    {
        onyxMethod: OnyxUtils_1.default.METHOD.MERGE,
        key: ONYX_KEY,
        value: {
            report2: report2AvatarDiff,
            report4: report4,
        },
    },
]);
(0, OnyxUpdateManager_1.default)();
describe('actions/OnyxUpdateManager', function () {
    var reportActions;
    beforeAll(function () {
        react_native_onyx_1.default.init({ keys: ONYXKEYS_1.default });
        react_native_onyx_1.default.connect({
            key: ONYX_KEY,
            callback: function (val) { return (reportActions = val); },
        });
    });
    beforeEach(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    jest.clearAllMocks();
                    return [4 /*yield*/, react_native_onyx_1.default.clear()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, react_native_onyx_1.default.set(ONYXKEYS_1.default.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT, 1)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, react_native_onyx_1.default.set(ONYX_KEY, initialData)];
                case 3:
                    _a.sent();
                    OnyxUpdateManagerUtils.mockValues.beforeValidateAndApplyDeferredUpdates = undefined;
                    App.mockValues.missingOnyxUpdatesToBeApplied = undefined;
                    OnyxUpdateManagerExports.resetDeferralLogicVariables();
                    return [2 /*return*/];
            }
        });
    }); });
    it('should trigger Onyx update gap handling', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Since we don't want to trigger actual GetMissingOnyxUpdates calls to the server/backend,
                    // we have to mock the results of these calls. By setting the missingOnyxUpdatesToBeApplied
                    // property on the mock, we can simulate the results of the GetMissingOnyxUpdates calls.
                    App.mockValues.missingOnyxUpdatesToBeApplied = [mockUpdate2, mockUpdate3];
                    (0, applyOnyxUpdatesReliably_1.default)(mockUpdate2);
                    // Delay all later updates, so that the update 2 has time to be written to storage and for the
                    // ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT to be updated.
                    return [4 /*yield*/, new Promise(function (resolve) {
                            setTimeout(resolve, 0);
                        })];
                case 1:
                    // Delay all later updates, so that the update 2 has time to be written to storage and for the
                    // ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT to be updated.
                    _a.sent();
                    (0, applyOnyxUpdatesReliably_1.default)(mockUpdate4);
                    (0, applyOnyxUpdatesReliably_1.default)(mockUpdate3);
                    return [2 /*return*/, OnyxUpdateManagerExports.queryPromise.then(function () {
                            var expectedResult = {
                                report2: __assign(__assign({}, exampleReportAction), report2PersonDiff),
                            };
                            expect(reportActions).toEqual(expectedResult);
                            // GetMissingOnyxUpdates should have been called for the gap between update 2 and 4.
                            // Since we queued update 4 before update 3, there's a gap to resolve, before we apply the deferred updates.
                            expect(App.getMissingOnyxUpdates).toHaveBeenCalledTimes(1);
                            expect(App.getMissingOnyxUpdates).toHaveBeenNthCalledWith(1, 2, 3);
                            // After the missing updates have been applied, the applicable updates after
                            // all locally applied updates should be applied. (4)
                            expect(ApplyUpdates.applyUpdates).toHaveBeenCalledTimes(1);
                            // eslint-disable-next-line @typescript-eslint/naming-convention
                            expect(ApplyUpdates.applyUpdates).toHaveBeenNthCalledWith(1, { 4: mockUpdate4 });
                        })];
            }
        });
    }); });
    it('should trigger 2 GetMissingOnyxUpdates calls, because the deferred updates have gaps', function () { return __awaiter(void 0, void 0, void 0, function () {
        var finishFirstCall, firstGetMissingOnyxUpdatesCallFinished;
        return __generator(this, function (_a) {
            // Since we don't want to trigger actual GetMissingOnyxUpdates calls to the server/backend,
            // we have to mock the results of these calls. By setting the missingOnyxUpdatesToBeApplied
            // property on the mock, we can simulate the results of the GetMissingOnyxUpdates calls.
            App.mockValues.missingOnyxUpdatesToBeApplied = [mockUpdate1, mockUpdate2];
            (0, applyOnyxUpdatesReliably_1.default)(mockUpdate3);
            (0, applyOnyxUpdatesReliably_1.default)(mockUpdate5);
            firstGetMissingOnyxUpdatesCallFinished = new Promise(function (resolve) {
                finishFirstCall = resolve;
            });
            OnyxUpdateManagerUtils.mockValues.beforeValidateAndApplyDeferredUpdates = function () {
                // After the first GetMissingOnyxUpdates call has been resolved,
                // we have to set the mocked results of for the second call.
                App.mockValues.missingOnyxUpdatesToBeApplied = [mockUpdate3, mockUpdate4];
                finishFirstCall();
                return Promise.resolve();
            };
            return [2 /*return*/, firstGetMissingOnyxUpdatesCallFinished
                    .then(function () { return OnyxUpdateManagerExports.queryPromise; })
                    .then(function () {
                    var expectedResult = {
                        report2: __assign(__assign(__assign({}, exampleReportAction), report2PersonDiff), report2AvatarDiff),
                        report4: report4,
                    };
                    expect(reportActions).toEqual(expectedResult);
                    // GetMissingOnyxUpdates should have been called twice, once for the gap between update 1 and 3,
                    // and once for the gap between update 3 and 5.
                    // We always fetch missing updates from the lastUpdateIDAppliedToClient
                    // to previousUpdateID of the first deferred update. First 1-2, second 3-4
                    expect(App.getMissingOnyxUpdates).toHaveBeenCalledTimes(2);
                    expect(App.getMissingOnyxUpdates).toHaveBeenNthCalledWith(1, 1, 2);
                    expect(App.getMissingOnyxUpdates).toHaveBeenNthCalledWith(2, 3, 4);
                    // Since we have two GetMissingOnyxUpdates calls, there will be two sets of applicable updates.
                    // The first applicable update will be 3, after missing updates 1-2 have been applied.
                    // The second applicable update will be 5, after missing updates 3-4 have been applied.
                    expect(ApplyUpdates.applyUpdates).toHaveBeenCalledTimes(2);
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    expect(ApplyUpdates.applyUpdates).toHaveBeenNthCalledWith(1, { 3: mockUpdate3 });
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    expect(ApplyUpdates.applyUpdates).toHaveBeenNthCalledWith(2, { 5: mockUpdate5 });
                })];
        });
    }); });
    it('should pause SequentialQueue while missing updates are being fetched', function () { return __awaiter(void 0, void 0, void 0, function () {
        var assertAfterFirstGetMissingOnyxUpdates, assertAfterSecondGetMissingOnyxUpdates, firstCallFinished;
        return __generator(this, function (_a) {
            // Since we don't want to trigger actual GetMissingOnyxUpdates calls to the server/backend,
            // we have to mock the results of these calls. By setting the missingOnyxUpdatesToBeApplied
            // property on the mock, we can simulate the results of the GetMissingOnyxUpdates calls.
            App.mockValues.missingOnyxUpdatesToBeApplied = [mockUpdate1, mockUpdate2];
            (0, applyOnyxUpdatesReliably_1.default)(mockUpdate3);
            (0, applyOnyxUpdatesReliably_1.default)(mockUpdate5);
            assertAfterFirstGetMissingOnyxUpdates = function () {
                // While the fetching of missing updates and the validation and application of the deferred updates is running,
                // the SequentialQueue should be paused.
                expect(SequentialQueue.isPaused()).toBeTruthy();
                expect(App.getMissingOnyxUpdates).toHaveBeenCalledTimes(1);
                expect(App.getMissingOnyxUpdates).toHaveBeenNthCalledWith(1, 1, 2);
            };
            assertAfterSecondGetMissingOnyxUpdates = function () {
                // The SequentialQueue should still be paused.
                expect(SequentialQueue.isPaused()).toBeTruthy();
                expect(SequentialQueue.isRunning()).toBeFalsy();
                expect(App.getMissingOnyxUpdates).toHaveBeenCalledTimes(2);
                expect(App.getMissingOnyxUpdates).toHaveBeenNthCalledWith(2, 3, 4);
            };
            firstCallFinished = false;
            OnyxUpdateManagerUtils.mockValues.beforeValidateAndApplyDeferredUpdates = function () {
                if (firstCallFinished) {
                    assertAfterSecondGetMissingOnyxUpdates();
                    return Promise.resolve();
                }
                assertAfterFirstGetMissingOnyxUpdates();
                // After the first GetMissingOnyxUpdates call has been resolved,
                // we have to set the mocked results of for the second call.
                App.mockValues.missingOnyxUpdatesToBeApplied = [mockUpdate3, mockUpdate4];
                firstCallFinished = true;
                return Promise.resolve();
            };
            return [2 /*return*/, OnyxUpdateManagerExports.queryPromise.then(function () {
                    // Once the OnyxUpdateManager has finished filling the gaps, the SequentialQueue should be unpaused again.
                    // It must not necessarily be running, because it might not have been flushed yet.
                    expect(SequentialQueue.isPaused()).toBeFalsy();
                    expect(App.getMissingOnyxUpdates).toHaveBeenCalledTimes(2);
                })];
        });
    }); });
});
