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
var CONST_1 = require("@src/CONST");
var OnyxUpdateManager_1 = require("@src/libs/actions/OnyxUpdateManager");
var Policy = require("@src/libs/actions/Policy/Policy");
var ReportUtils = require("@src/libs/ReportUtils");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var policies_1 = require("../utils/collections/policies");
var TestHelper = require("../utils/TestHelper");
var waitForBatchedUpdates_1 = require("../utils/waitForBatchedUpdates");
(0, OnyxUpdateManager_1.default)();
describe('actions/PolicyProfile', function () {
    beforeAll(function () {
        react_native_onyx_1.default.init({
            keys: ONYXKEYS_1.default,
        });
    });
    var mockFetch;
    beforeEach(function () {
        global.fetch = TestHelper.getGlobalFetchMock();
        mockFetch = fetch;
        return react_native_onyx_1.default.clear().then(waitForBatchedUpdates_1.default);
    });
    describe('updateWorkspaceDescription', function () {
        it('Update workspace`s description', function () { return __awaiter(void 0, void 0, void 0, function () {
            var fakePolicy, oldDescription, newDescription, parsedDescription;
            var _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        fakePolicy = (0, policies_1.default)(0);
                        oldDescription = (_a = fakePolicy.description) !== null && _a !== void 0 ? _a : '';
                        newDescription = 'Updated description';
                        parsedDescription = ReportUtils.getParsedComment(newDescription);
                        (_b = mockFetch === null || mockFetch === void 0 ? void 0 : mockFetch.pause) === null || _b === void 0 ? void 0 : _b.call(mockFetch);
                        react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(fakePolicy.id), fakePolicy);
                        Policy.updateWorkspaceDescription(fakePolicy.id, newDescription, oldDescription);
                        return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                    case 1:
                        _d.sent();
                        return [4 /*yield*/, new Promise(function (resolve) {
                                var connection = react_native_onyx_1.default.connect({
                                    key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(fakePolicy.id),
                                    waitForCollectionCallback: false,
                                    callback: function (policy) {
                                        var _a, _b;
                                        react_native_onyx_1.default.disconnect(connection);
                                        expect(policy === null || policy === void 0 ? void 0 : policy.description).toBe(parsedDescription);
                                        expect((_a = policy === null || policy === void 0 ? void 0 : policy.pendingFields) === null || _a === void 0 ? void 0 : _a.description).toBe(CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
                                        expect((_b = policy === null || policy === void 0 ? void 0 : policy.errorFields) === null || _b === void 0 ? void 0 : _b.description).toBeFalsy();
                                        resolve();
                                    },
                                });
                            })];
                    case 2:
                        _d.sent();
                        return [4 /*yield*/, ((_c = mockFetch === null || mockFetch === void 0 ? void 0 : mockFetch.resume) === null || _c === void 0 ? void 0 : _c.call(mockFetch))];
                    case 3:
                        _d.sent();
                        return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                    case 4:
                        _d.sent();
                        return [4 /*yield*/, new Promise(function (resolve) {
                                var connection = react_native_onyx_1.default.connect({
                                    key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(fakePolicy.id),
                                    waitForCollectionCallback: false,
                                    callback: function (policy) {
                                        var _a;
                                        react_native_onyx_1.default.disconnect(connection);
                                        expect((_a = policy === null || policy === void 0 ? void 0 : policy.pendingFields) === null || _a === void 0 ? void 0 : _a.description).toBeFalsy();
                                        resolve();
                                    },
                                });
                            })];
                    case 5:
                        _d.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
