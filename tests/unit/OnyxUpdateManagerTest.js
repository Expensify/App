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
var AppImport = require("@userActions/App");
var OnyxUpdateManager = require("@userActions/OnyxUpdateManager");
var OnyxUpdateManagerUtilsImport = require("@userActions/OnyxUpdateManager/utils");
var ApplyUpdatesImport = require("@userActions/OnyxUpdateManager/utils/applyUpdates");
var OnyxUpdatesImport = require("@userActions/OnyxUpdates");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var OnyxUpdateMockUtils_1 = require("../utils/OnyxUpdateMockUtils");
jest.mock('@userActions/OnyxUpdates');
jest.mock('@userActions/App');
jest.mock('@userActions/OnyxUpdateManager/utils');
jest.mock('@userActions/OnyxUpdateManager/utils/applyUpdates');
jest.mock('@hooks/useScreenWrapperTransitionStatus', function () { return ({
    default: function () { return ({
        didScreenTransitionEnd: true,
    }); },
}); });
var OnyxUpdates = OnyxUpdatesImport;
var App = AppImport;
var ApplyUpdates = ApplyUpdatesImport;
var OnyxUpdateManagerUtils = OnyxUpdateManagerUtilsImport;
var update2 = OnyxUpdateMockUtils_1.default.createUpdate(2);
var pendingUpdateUpTo2 = OnyxUpdateMockUtils_1.default.createPendingUpdate(2);
var update3 = OnyxUpdateMockUtils_1.default.createUpdate(3);
var pendingUpdateUpTo3 = OnyxUpdateMockUtils_1.default.createPendingUpdate(3);
var offsetUpdate3 = OnyxUpdateMockUtils_1.default.createUpdate(3, undefined, 1);
var update4 = OnyxUpdateMockUtils_1.default.createUpdate(4);
var update5 = OnyxUpdateMockUtils_1.default.createUpdate(5);
var update6 = OnyxUpdateMockUtils_1.default.createUpdate(6);
var update7 = OnyxUpdateMockUtils_1.default.createUpdate(7);
var update8 = OnyxUpdateMockUtils_1.default.createUpdate(8);
describe('OnyxUpdateManager', function () {
    var lastUpdateIDAppliedToClient = 1;
    beforeAll(function () {
        react_native_onyx_1.default.connect({
            key: ONYXKEYS_1.default.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT,
            callback: function (value) { return (lastUpdateIDAppliedToClient = value !== null && value !== void 0 ? value : 1); },
        });
    });
    beforeEach(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    jest.clearAllMocks();
                    return [4 /*yield*/, react_native_onyx_1.default.set(ONYXKEYS_1.default.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT, 1)];
                case 1:
                    _a.sent();
                    OnyxUpdateManagerUtils.mockValues.beforeValidateAndApplyDeferredUpdates = undefined;
                    ApplyUpdates.mockValues.beforeApplyUpdates = undefined;
                    App.mockValues.missingOnyxUpdatesToBeApplied = undefined;
                    OnyxUpdateManager.resetDeferralLogicVariables();
                    return [2 /*return*/];
            }
        });
    }); });
    it('should fetch missing Onyx updates once, defer updates and apply after missing updates', function () {
        OnyxUpdateManager.handleMissingOnyxUpdates(update3);
        OnyxUpdateManager.handleMissingOnyxUpdates(update4);
        OnyxUpdateManager.handleMissingOnyxUpdates(update5);
        return OnyxUpdateManager.queryPromise.then(function () {
            // After all missing and deferred updates have been applied, the lastUpdateIDAppliedToClient should be 6.
            expect(lastUpdateIDAppliedToClient).toBe(5);
            // OnyxUpdates.apply should have been called 4 times,
            //   - once for the fetched missing update (2)
            //   - three times for the deferred updates (3-5)
            expect(OnyxUpdates.apply).toHaveBeenCalledTimes(4);
            // There are no gaps in the deferred updates, therefore only one call to getMissingOnyxUpdates should be triggered
            expect(App.getMissingOnyxUpdates).toHaveBeenCalledTimes(1);
            expect(ApplyUpdates.applyUpdates).toHaveBeenCalledTimes(1);
            // validateAndApplyDeferredUpdates should be called twice, once for the initial deferred updates and once for the remaining deferred updates with gaps.
            // Unfortunately, we cannot easily count the calls of this function with Jest, since it recursively calls itself.
            // The intended assertion would look like this:
            // expect(OnyxUpdateManagerUtils.validateAndApplyDeferredUpdates).toHaveBeenCalledTimes(1);
            // There should be only one call to applyUpdates. The call should contain all the deferred update,
            // since the locally applied updates have changed in the meantime.
            expect(ApplyUpdates.applyUpdates).toHaveBeenCalledTimes(1);
            // eslint-disable-next-line @typescript-eslint/naming-convention
            expect(ApplyUpdates.applyUpdates).toHaveBeenNthCalledWith(1, { 3: update3, 4: update4, 5: update5 });
        });
    });
    it('should only apply deferred updates that are newer than the last locally applied update (pending deferred updates)', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            OnyxUpdateManager.handleMissingOnyxUpdates(update4);
            OnyxUpdateManager.handleMissingOnyxUpdates(update5);
            OnyxUpdateManager.handleMissingOnyxUpdates(update6);
            OnyxUpdateManagerUtils.mockValues.beforeValidateAndApplyDeferredUpdates = function () { return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: 
                        // We manually update the lastUpdateIDAppliedToClient to 5, to simulate local updates being applied,
                        // while we are waiting for the missing updates to be fetched.
                        // Only the deferred updates after the lastUpdateIDAppliedToClient should be applied.
                        return [4 /*yield*/, react_native_onyx_1.default.set(ONYXKEYS_1.default.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT, 5)];
                        case 1:
                            // We manually update the lastUpdateIDAppliedToClient to 5, to simulate local updates being applied,
                            // while we are waiting for the missing updates to be fetched.
                            // Only the deferred updates after the lastUpdateIDAppliedToClient should be applied.
                            _a.sent();
                            OnyxUpdateManagerUtils.mockValues.beforeValidateAndApplyDeferredUpdates = undefined;
                            return [2 /*return*/];
                    }
                });
            }); };
            return [2 /*return*/, OnyxUpdateManager.queryPromise.then(function () {
                    // After all missing and deferred updates have been applied, the lastUpdateIDAppliedToClient should be 6.
                    expect(lastUpdateIDAppliedToClient).toBe(6);
                    // OnyxUpdates.apply should have been called 2 times,
                    //   - twice for the fetched missing updates (2-3)
                    //   - once for the deferred update (6)
                    expect(OnyxUpdates.apply).toHaveBeenCalledTimes(3);
                    // There are no gaps in the deferred updates, therefore only one call to getMissingOnyxUpdates should be triggered
                    expect(App.getMissingOnyxUpdates).toHaveBeenCalledTimes(1);
                    expect(ApplyUpdates.applyUpdates).toHaveBeenCalledTimes(1);
                    // validateAndApplyDeferredUpdates should be called twice, once for the initial deferred updates and once for the remaining deferred updates with gaps.
                    // Unfortunately, we cannot easily count the calls of this function with Jest, since it recursively calls itself.
                    // The intended assertion would look like this:
                    // expect(OnyxUpdateManagerUtils.validateAndApplyDeferredUpdates).toHaveBeenCalledTimes(1);
                    // Missing updates from 1 (last applied to client) to 3 (last "previousUpdateID" from first deferred update) should have been fetched from the server in the first and only call to getMissingOnyxUpdates
                    expect(App.getMissingOnyxUpdates).toHaveBeenNthCalledWith(1, 1, 3);
                    // There should be only one call to applyUpdates. The call should only contain the last deferred update,
                    // since the locally applied updates have changed in the meantime.
                    expect(ApplyUpdates.applyUpdates).toHaveBeenCalledTimes(1);
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    expect(ApplyUpdates.applyUpdates).toHaveBeenNthCalledWith(1, { 6: update6 });
                })];
        });
    }); });
    it('should re-fetch missing updates if the deferred updates have a gap', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            OnyxUpdateManager.handleMissingOnyxUpdates(update3);
            OnyxUpdateManager.handleMissingOnyxUpdates(update5);
            OnyxUpdateManager.handleMissingOnyxUpdates(update6);
            return [2 /*return*/, OnyxUpdateManager.queryPromise.then(function () {
                    // After all missing and deferred updates have been applied, the lastUpdateIDAppliedToClient should be 6.
                    expect(lastUpdateIDAppliedToClient).toBe(6);
                    // OnyxUpdates.apply should have been called 5 times,
                    //   - once for the first fetched missing update (2)
                    //   - once for the second fetched missing update (4)
                    //   - three times for the deferred updates (3, 5, 6)
                    expect(OnyxUpdates.apply).toHaveBeenCalledTimes(5);
                    // Even though there is a gap in the deferred updates, we only want to fetch missing updates once per batch.
                    expect(App.getMissingOnyxUpdates).toHaveBeenCalledTimes(2);
                    expect(ApplyUpdates.applyUpdates).toHaveBeenCalledTimes(2);
                    // validateAndApplyDeferredUpdates should be called twice, once for the initial deferred updates and once for the remaining deferred updates with gaps.
                    // Unfortunately, we cannot easily count the calls of this function with Jest, since it recursively calls itself.
                    // The intended assertion would look like this:
                    // expect(OnyxUpdateManagerUtils.validateAndApplyDeferredUpdates).toHaveBeenCalledTimes(2);
                    // There should be multiple calls getMissingOnyxUpdates and applyUpdates, since we detect a gap in the deferred updates.
                    // The first call to getMissingOnyxUpdates should fetch updates from 1 (last applied to client) to 2 (last "previousUpdateID" from first deferred update) from the server.
                    expect(App.getMissingOnyxUpdates).toHaveBeenNthCalledWith(1, 1, 2);
                    // After the initial missing updates have been applied, the applicable updates (3) should be applied.
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    expect(ApplyUpdates.applyUpdates).toHaveBeenNthCalledWith(1, { 3: update3 });
                    // The second call to getMissingOnyxUpdates should fetch the missing updates from the gap in the deferred updates. 3-4
                    expect(App.getMissingOnyxUpdates).toHaveBeenNthCalledWith(2, 3, 4);
                    // After the gap in the deferred updates has been resolved, the remaining deferred updates (5, 6) should be applied.
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    expect(ApplyUpdates.applyUpdates).toHaveBeenNthCalledWith(2, { 5: update5, 6: update6 });
                })];
        });
    }); });
    it('should re-fetch missing deferred updates only once per batch', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            OnyxUpdateManager.handleMissingOnyxUpdates(update3);
            OnyxUpdateManager.handleMissingOnyxUpdates(update4);
            OnyxUpdateManager.handleMissingOnyxUpdates(update6);
            OnyxUpdateManager.handleMissingOnyxUpdates(update8);
            return [2 /*return*/, OnyxUpdateManager.queryPromise.then(function () {
                    // After all missing and deferred updates have been applied, the lastUpdateIDAppliedToClient should be 6.
                    expect(lastUpdateIDAppliedToClient).toBe(8);
                    // OnyxUpdates.apply should have been called 7 times,
                    //   - once for the first fetched missing update (2)
                    //   - once for the second fetched missing update (5)
                    //   - once for the third fetched missing update (7)
                    //   - four times for the deferred updates (3, 4, 6, 8)
                    expect(OnyxUpdates.apply).toHaveBeenCalledTimes(7);
                    // Even though there are multiple gaps in the deferred updates, we only want to fetch missing updates once per batch.
                    expect(App.getMissingOnyxUpdates).toHaveBeenCalledTimes(2);
                    expect(ApplyUpdates.applyUpdates).toHaveBeenCalledTimes(2);
                    // validateAndApplyDeferredUpdates should be called twice, once for the initial deferred updates and once for the remaining deferred updates with gaps.
                    // Unfortunately, we cannot easily count the calls of this function with Jest, since it recursively calls itself.
                    // The intended assertion would look like this:
                    // expect(OnyxUpdateManagerUtils.validateAndApplyDeferredUpdates).toHaveBeenCalledTimes(2);
                    // After the initial missing updates have been applied, the applicable updates (3-4) should be applied.
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    expect(ApplyUpdates.applyUpdates).toHaveBeenNthCalledWith(1, { 3: update3, 4: update4 });
                    // The second call to getMissingOnyxUpdates should fetch the missing updates from the gap (4-7) in the deferred updates.
                    expect(App.getMissingOnyxUpdates).toHaveBeenNthCalledWith(2, 4, 7);
                    // After the gap in the deferred updates has been resolved, the remaining deferred updates (8) should be applied.
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    expect(ApplyUpdates.applyUpdates).toHaveBeenNthCalledWith(2, { 8: update8 });
                })];
        });
    }); });
    it('should not re-fetch missing updates if the lastUpdateIDFromClient has been updated', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            OnyxUpdateManager.handleMissingOnyxUpdates(update3);
            OnyxUpdateManager.handleMissingOnyxUpdates(update5);
            OnyxUpdateManager.handleMissingOnyxUpdates(update6);
            OnyxUpdateManager.handleMissingOnyxUpdates(update7);
            ApplyUpdates.mockValues.beforeApplyUpdates = function () { return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: 
                        // We manually update the lastUpdateIDAppliedToClient to 5, to simulate local updates being applied,
                        // while the applicable updates have been applied.
                        // When this happens, the OnyxUpdateManager should trigger another validation of the deferred updates,
                        // without triggering another re-fetching of missing updates from the server.
                        return [4 /*yield*/, react_native_onyx_1.default.set(ONYXKEYS_1.default.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT, 5)];
                        case 1:
                            // We manually update the lastUpdateIDAppliedToClient to 5, to simulate local updates being applied,
                            // while the applicable updates have been applied.
                            // When this happens, the OnyxUpdateManager should trigger another validation of the deferred updates,
                            // without triggering another re-fetching of missing updates from the server.
                            _a.sent();
                            ApplyUpdates.mockValues.beforeApplyUpdates = undefined;
                            return [2 /*return*/];
                    }
                });
            }); };
            return [2 /*return*/, OnyxUpdateManager.queryPromise.then(function () {
                    // After all missing and deferred updates have been applied, the lastUpdateIDAppliedToClient should be 6.
                    expect(lastUpdateIDAppliedToClient).toBe(7);
                    // OnyxUpdates.apply should have been called 4 times,
                    //   - once for the first fetched missing update (2)
                    //   - updates 3-5 are not fetched, because they are set externally
                    //   - two times for the remaining deferred updates (6, 7)
                    expect(OnyxUpdates.apply).toHaveBeenCalledTimes(4);
                    // Even though there are multiple gaps in the deferred updates, we only want to fetch missing updates once per batch.
                    expect(App.getMissingOnyxUpdates).toHaveBeenCalledTimes(1);
                    // validateAndApplyDeferredUpdates should be called once for the initial deferred updates
                    // Unfortunately, we cannot easily count the calls of this function with Jest, since it recursively calls itself.
                    // The intended assertion would look like this:
                    // expect(OnyxUpdateManagerUtils.validateAndApplyDeferredUpdates).toHaveBeenCalledTimes(1);
                    // Since there is a gap in the deferred updates, we need to run applyUpdates twice.
                    // Once for the applicable updates (before the gap) and then for the remaining deferred updates.
                    expect(ApplyUpdates.applyUpdates).toHaveBeenCalledTimes(2);
                    // After the initial missing updates have been applied, the applicable updates (3) should be applied.
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    expect(ApplyUpdates.applyUpdates).toHaveBeenNthCalledWith(1, { 3: update3 });
                    // Since the lastUpdateIDAppliedToClient has changed to 5 in the meantime, we only need to apply the remaining deferred updates (6-7).
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    expect(ApplyUpdates.applyUpdates).toHaveBeenNthCalledWith(2, { 6: update6, 7: update7 });
                })];
        });
    }); });
    it('should re-fetch missing updates if the lastUpdateIDFromClient has increased, but there are still gaps after the locally applied update', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            OnyxUpdateManager.handleMissingOnyxUpdates(update3);
            OnyxUpdateManager.handleMissingOnyxUpdates(update7);
            ApplyUpdates.mockValues.beforeApplyUpdates = function () { return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: 
                        // We manually update the lastUpdateIDAppliedToClient to 4, to simulate local updates being applied,
                        // while the applicable updates have been applied.
                        // When this happens, the OnyxUpdateManager should trigger another validation of the deferred updates,
                        // without triggering another re-fetching of missing updates from the server.
                        return [4 /*yield*/, react_native_onyx_1.default.set(ONYXKEYS_1.default.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT, 4)];
                        case 1:
                            // We manually update the lastUpdateIDAppliedToClient to 4, to simulate local updates being applied,
                            // while the applicable updates have been applied.
                            // When this happens, the OnyxUpdateManager should trigger another validation of the deferred updates,
                            // without triggering another re-fetching of missing updates from the server.
                            _a.sent();
                            ApplyUpdates.mockValues.beforeApplyUpdates = undefined;
                            return [2 /*return*/];
                    }
                });
            }); };
            return [2 /*return*/, OnyxUpdateManager.queryPromise.then(function () {
                    // After all missing and deferred updates have been applied, the lastUpdateIDAppliedToClient should be 6.
                    expect(lastUpdateIDAppliedToClient).toBe(7);
                    // OnyxUpdates.apply should have been called 6 times,
                    //   - once for the first fetched missing update (2)
                    //   - updates 3-4 are not fetched, because they are set externally
                    //   - three times for the second fetched missing updates (5-6)
                    //   - once for the remaining deferred update (7)
                    expect(OnyxUpdates.apply).toHaveBeenCalledTimes(5);
                    // Even though there are multiple gaps in the deferred updates, we only want to fetch missing updates once per batch.
                    expect(App.getMissingOnyxUpdates).toHaveBeenCalledTimes(2);
                    // validateAndApplyDeferredUpdates should be called twice, once for the initial deferred updates and once for the remaining deferred updates with gaps.
                    // Unfortunately, we cannot easily count the calls of this function with Jest, since it recursively calls itself.
                    // The intended assertion would look like this:
                    // expect(OnyxUpdateManagerUtils.validateAndApplyDeferredUpdates).toHaveBeenCalledTimes(2);
                    // Since there is a gap in the deferred updates, we need to run applyUpdates twice.
                    // Once for the applicable updates (before the gap) and then for the remaining deferred updates.
                    expect(ApplyUpdates.applyUpdates).toHaveBeenCalledTimes(2);
                    // After the initial missing updates have been applied, the applicable updates (3) should be applied.
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    expect(ApplyUpdates.applyUpdates).toHaveBeenNthCalledWith(1, { 3: update3 });
                    // The second call to getMissingOnyxUpdates should fetch the missing updates from the gap in the deferred updates,
                    // that are later than the locally applied update (4-6). (including the last locally applied update)
                    expect(App.getMissingOnyxUpdates).toHaveBeenNthCalledWith(2, 4, 6);
                    // Since the lastUpdateIDAppliedToClient has changed to 4 in the meantime, and we're fetching updates 5-6 we only need to apply the remaining deferred updates (7).
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    expect(ApplyUpdates.applyUpdates).toHaveBeenNthCalledWith(2, { 7: update7 });
                })];
        });
    }); });
    it('should only fetch missing updates that are not outdated (older than already locally applied update)', function () {
        OnyxUpdateManager.handleMissingOnyxUpdates(offsetUpdate3);
        OnyxUpdateManager.handleMissingOnyxUpdates(update4);
        return OnyxUpdateManager.queryPromise.then(function () {
            // After all missing and deferred updates have been applied, the lastUpdateIDAppliedToClient should be 4.
            expect(lastUpdateIDAppliedToClient).toBe(4);
            // OnyxUpdates.apply should have been called 2 times,
            //   - once for the first fetched missing update (2)
            //   - the offset update is omitted
            //   - three times for the deferred update (4)
            expect(OnyxUpdates.apply).toHaveBeenCalledTimes(2);
            // validateAndApplyDeferredUpdates should be called once for the initial deferred updates
            // Unfortunately, we cannot easily count the calls of this function with Jest, since it recursively calls itself.
            // The intended assertion would look like this:
            // expect(OnyxUpdateManagerUtils.validateAndApplyDeferredUpdates).toHaveBeenCalledTimes(1);
            // There should be only one call to applyUpdates. The call should contain all the deferred update,
            // since the locally applied updates have changed in the meantime.
            expect(ApplyUpdates.applyUpdates).toHaveBeenCalledTimes(1);
            // eslint-disable-next-line @typescript-eslint/naming-convention
            expect(ApplyUpdates.applyUpdates).toHaveBeenNthCalledWith(1, { 3: offsetUpdate3, 4: update4 });
            // There are no gaps in the deferred updates, therefore only one call to getMissingOnyxUpdates should be triggered
            expect(App.getMissingOnyxUpdates).toHaveBeenCalledTimes(1);
        });
    });
    it('should fetch a single pending update if `hasPendingOnyxUpdates flag is true`', function () {
        App.mockValues.missingOnyxUpdatesToBeApplied = [update2];
        OnyxUpdateManager.handleMissingOnyxUpdates(pendingUpdateUpTo2);
        return OnyxUpdateManager.queryPromise.then(function () {
            // After all the pending update has been applied, the lastUpdateIDAppliedToClient should be 2.
            expect(lastUpdateIDAppliedToClient).toBe(2);
            // OnyxUpdates.apply should have been called 1 times,
            //   - once for the pending update (2)
            expect(OnyxUpdates.apply).toHaveBeenCalledTimes(1);
            // validateAndApplyDeferredUpdates should be called once for the initial deferred updates
            // Unfortunately, we cannot easily count the calls of this function with Jest, since it recursively calls itself.
            // The intended assertion would look like this:
            // expect(OnyxUpdateManagerUtils.validateAndApplyDeferredUpdates).toHaveBeenCalledTimes(1);
            // There should be no call to applyUpdates, because there are no deferred updates
            expect(ApplyUpdates.applyUpdates).toHaveBeenCalledTimes(0);
            // There are no deferred updates, so this should only be called once for the pending update.
            expect(App.getMissingOnyxUpdates).toHaveBeenCalledTimes(1);
        });
    });
    it('should fetch multiple pending updates if `hasPendingOnyxUpdates flag is true`', function () {
        App.mockValues.missingOnyxUpdatesToBeApplied = [update2, update3];
        OnyxUpdateManager.handleMissingOnyxUpdates(pendingUpdateUpTo3);
        return OnyxUpdateManager.queryPromise.then(function () {
            // After all the pending update has been applied, the lastUpdateIDAppliedToClient should be 3.
            expect(lastUpdateIDAppliedToClient).toBe(3);
            // OnyxUpdates.apply should have been called 2 times,
            //   - twice for the pending updates (2, 3)
            expect(OnyxUpdates.apply).toHaveBeenCalledTimes(2);
            // validateAndApplyDeferredUpdates should be called once for the initial deferred updates
            // Unfortunately, we cannot easily count the calls of this function with Jest, since it recursively calls itself.
            // The intended assertion would look like this:
            // expect(OnyxUpdateManagerUtils.validateAndApplyDeferredUpdates).toHaveBeenCalledTimes(1);
            // There should be no call to applyUpdates, because there are no deferred updates
            expect(ApplyUpdates.applyUpdates).toHaveBeenCalledTimes(0);
            // There are no deferred updates, so this should only be called once for the pending update.
            expect(App.getMissingOnyxUpdates).toHaveBeenCalledTimes(1);
        });
    });
    it('should apply deferred updates after fetching pending updates', function () {
        App.mockValues.missingOnyxUpdatesToBeApplied = [update2, update3];
        OnyxUpdateManager.handleMissingOnyxUpdates(pendingUpdateUpTo3);
        OnyxUpdateManager.handleMissingOnyxUpdates(update4);
        return OnyxUpdateManager.queryPromise.then(function () {
            // After all missing and deferred updates have been applied, the lastUpdateIDAppliedToClient should be 4.
            expect(lastUpdateIDAppliedToClient).toBe(4);
            // OnyxUpdates.apply should have been called 3 times,
            //   - twice for the pending updates (2, 3)
            //   - once for the deferred update (4)
            expect(OnyxUpdates.apply).toHaveBeenCalledTimes(3);
            // validateAndApplyDeferredUpdates should be called once for the initial deferred updates
            // Unfortunately, we cannot easily count the calls of this function with Jest, since it recursively calls itself.
            // The intended assertion would look like this:
            // expect(OnyxUpdateManagerUtils.validateAndApplyDeferredUpdates).toHaveBeenCalledTimes(1);
            // There should be only one call to applyUpdates. The call should contain the deferred updates.
            expect(ApplyUpdates.applyUpdates).toHaveBeenCalledTimes(1);
            // eslint-disable-next-line @typescript-eslint/naming-convention
            expect(ApplyUpdates.applyUpdates).toHaveBeenNthCalledWith(1, { 4: update4 });
            // There are no gaps in the deferred updates, therefore only one call to getMissingOnyxUpdates should be triggered
            expect(App.getMissingOnyxUpdates).toHaveBeenCalledTimes(1);
        });
    });
});
