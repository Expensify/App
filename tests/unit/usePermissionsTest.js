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
var react_native_1 = require("@testing-library/react-native");
var react_1 = require("react");
var react_native_onyx_1 = require("react-native-onyx");
var OnyxProvider_1 = require("@components/OnyxProvider");
var CONST_1 = require("@src/CONST");
var usePermissions_1 = require("@src/hooks/usePermissions");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var waitForBatchedUpdatesWithAct_1 = require("../utils/waitForBatchedUpdatesWithAct");
function Wrapper(_a) {
    var children = _a.children;
    return <OnyxProvider_1.default>{children}</OnyxProvider_1.default>;
}
describe('usePermissions', function () {
    beforeAll(function () {
        react_native_onyx_1.default.init({
            keys: ONYXKEYS_1.default,
        });
    });
    beforeEach(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, react_native_onyx_1.default.clear()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it('should handle empty betas gracefully via Onyx', function () { return __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    react_native_onyx_1.default.set(ONYXKEYS_1.default.BETAS, []);
                    return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                case 1:
                    _a.sent();
                    result = (0, react_native_1.renderHook)(function () { return (0, usePermissions_1.default)(); }, { wrapper: Wrapper }).result;
                    return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                case 2:
                    _a.sent();
                    expect(result.current.isBetaEnabled(CONST_1.default.BETAS.ALL)).toBe(false);
                    return [2 /*return*/];
            }
        });
    }); });
    it('should return correct permissions when betas are provided via Onyx', function () { return __awaiter(void 0, void 0, void 0, function () {
        var mockBetas, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mockBetas = [CONST_1.default.BETAS.ALL];
                    react_native_onyx_1.default.set(ONYXKEYS_1.default.BETAS, mockBetas);
                    return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                case 1:
                    _a.sent();
                    result = (0, react_native_1.renderHook)(function () { return (0, usePermissions_1.default)(); }, { wrapper: Wrapper }).result;
                    return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                case 2:
                    _a.sent();
                    // Ensure result.current is not null or undefined before accessing properties
                    expect(result.current.isBetaEnabled(CONST_1.default.BETAS.ALL)).toBe(true);
                    expect(result.current.isBlockedFromSpotnanaTravel).toBe(false);
                    expect(result.current.isBetaEnabled(CONST_1.default.BETAS.DEFAULT_ROOMS)).toBe(true);
                    return [2 /*return*/];
            }
        });
    }); });
    it('should react to updates in Betas context via Onyx and give correct value for isBetaEnabled', function () { return __awaiter(void 0, void 0, void 0, function () {
        var initialBetas, updatedBetas, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    initialBetas = [CONST_1.default.BETAS.DEFAULT_ROOMS, CONST_1.default.BETAS.PER_DIEM, CONST_1.default.BETAS.PREVENT_SPOTNANA_TRAVEL];
                    updatedBetas = [CONST_1.default.BETAS.ALL];
                    react_native_onyx_1.default.set(ONYXKEYS_1.default.BETAS, initialBetas);
                    return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                case 1:
                    _a.sent();
                    result = (0, react_native_1.renderHook)(function () { return (0, usePermissions_1.default)(); }, { wrapper: Wrapper }).result;
                    return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                case 2:
                    _a.sent();
                    // Initially, check the value for the initial betas
                    expect(result.current.isBetaEnabled(CONST_1.default.BETAS.DEFAULT_ROOMS)).toBe(true);
                    expect(result.current.isBlockedFromSpotnanaTravel).toBe(true);
                    expect(result.current.isBetaEnabled(CONST_1.default.BETAS.MULTI_LEVEL_TAGS)).toBe(false);
                    expect(result.current.isBetaEnabled(CONST_1.default.BETAS.ALL)).toBe(false);
                    react_native_onyx_1.default.merge(ONYXKEYS_1.default.BETAS, updatedBetas);
                    return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                case 3:
                    _a.sent();
                    // After update, check the value for the updated betas
                    expect(result.current.isBlockedFromSpotnanaTravel).toBe(false);
                    expect(result.current.isBetaEnabled(CONST_1.default.BETAS.ALL)).toBe(true);
                    expect(result.current.isBetaEnabled(CONST_1.default.BETAS.MULTI_LEVEL_TAGS)).toBe(true);
                    return [2 /*return*/];
            }
        });
    }); });
});
