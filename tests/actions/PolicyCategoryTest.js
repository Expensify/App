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
var Category = require("@src/libs/actions/Policy/Category");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var policies_1 = require("../utils/collections/policies");
var policyCategory_1 = require("../utils/collections/policyCategory");
var TestHelper = require("../utils/TestHelper");
var waitForBatchedUpdates_1 = require("../utils/waitForBatchedUpdates");
(0, OnyxUpdateManager_1.default)();
describe('actions/PolicyCategory', function () {
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
    describe('setWorkspaceRequiresCategory', function () {
        it('Enable require category', function () { return __awaiter(void 0, void 0, void 0, function () {
            var fakePolicy;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        fakePolicy = (0, policies_1.default)(0);
                        fakePolicy.requiresCategory = false;
                        (_a = mockFetch === null || mockFetch === void 0 ? void 0 : mockFetch.pause) === null || _a === void 0 ? void 0 : _a.call(mockFetch);
                        react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(fakePolicy.id), fakePolicy);
                        Category.setWorkspaceRequiresCategory(fakePolicy.id, true);
                        return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                    case 1:
                        _c.sent();
                        return [4 /*yield*/, new Promise(function (resolve) {
                                var connection = react_native_onyx_1.default.connect({
                                    key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(fakePolicy.id),
                                    waitForCollectionCallback: false,
                                    callback: function (policy) {
                                        var _a, _b;
                                        react_native_onyx_1.default.disconnect(connection);
                                        // Check if policy requiresCategory was updated with correct values
                                        expect(policy === null || policy === void 0 ? void 0 : policy.requiresCategory).toBeTruthy();
                                        expect((_a = policy === null || policy === void 0 ? void 0 : policy.pendingFields) === null || _a === void 0 ? void 0 : _a.requiresCategory).toBe(CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
                                        expect((_b = policy === null || policy === void 0 ? void 0 : policy.errors) === null || _b === void 0 ? void 0 : _b.requiresCategory).toBeFalsy();
                                        resolve();
                                    },
                                });
                            })];
                    case 2:
                        _c.sent();
                        return [4 /*yield*/, ((_b = mockFetch === null || mockFetch === void 0 ? void 0 : mockFetch.resume) === null || _b === void 0 ? void 0 : _b.call(mockFetch))];
                    case 3:
                        _c.sent();
                        return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                    case 4:
                        _c.sent();
                        return [4 /*yield*/, new Promise(function (resolve) {
                                var connection = react_native_onyx_1.default.connect({
                                    key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(fakePolicy.id),
                                    waitForCollectionCallback: false,
                                    callback: function (policy) {
                                        var _a;
                                        react_native_onyx_1.default.disconnect(connection);
                                        // Check if the policy pendingFields was cleared
                                        expect((_a = policy === null || policy === void 0 ? void 0 : policy.pendingFields) === null || _a === void 0 ? void 0 : _a.requiresCategory).toBeFalsy();
                                        resolve();
                                    },
                                });
                            })];
                    case 5:
                        _c.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('createWorkspaceCategories', function () {
        it('Create a new policy category', function () { return __awaiter(void 0, void 0, void 0, function () {
            var fakePolicy, fakeCategories, newCategoryName;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        fakePolicy = (0, policies_1.default)(0);
                        fakeCategories = (0, policyCategory_1.default)(3);
                        newCategoryName = 'New category';
                        (_a = mockFetch === null || mockFetch === void 0 ? void 0 : mockFetch.pause) === null || _a === void 0 ? void 0 : _a.call(mockFetch);
                        react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(fakePolicy.id), fakePolicy);
                        react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.POLICY_CATEGORIES).concat(fakePolicy.id), fakeCategories);
                        Category.createPolicyCategory(fakePolicy.id, newCategoryName);
                        return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                    case 1:
                        _c.sent();
                        return [4 /*yield*/, new Promise(function (resolve) {
                                var connection = react_native_onyx_1.default.connect({
                                    key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY_CATEGORIES).concat(fakePolicy.id),
                                    waitForCollectionCallback: false,
                                    callback: function (policyCategories) {
                                        react_native_onyx_1.default.disconnect(connection);
                                        var newCategory = policyCategories === null || policyCategories === void 0 ? void 0 : policyCategories[newCategoryName];
                                        expect(newCategory === null || newCategory === void 0 ? void 0 : newCategory.name).toBe(newCategoryName);
                                        expect(newCategory === null || newCategory === void 0 ? void 0 : newCategory.errors).toBeFalsy();
                                        resolve();
                                    },
                                });
                            })];
                    case 2:
                        _c.sent();
                        return [4 /*yield*/, ((_b = mockFetch === null || mockFetch === void 0 ? void 0 : mockFetch.resume) === null || _b === void 0 ? void 0 : _b.call(mockFetch))];
                    case 3:
                        _c.sent();
                        return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                    case 4:
                        _c.sent();
                        return [4 /*yield*/, new Promise(function (resolve) {
                                var connection = react_native_onyx_1.default.connect({
                                    key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY_CATEGORIES).concat(fakePolicy.id),
                                    waitForCollectionCallback: false,
                                    callback: function (policyCategories) {
                                        react_native_onyx_1.default.disconnect(connection);
                                        var newCategory = policyCategories === null || policyCategories === void 0 ? void 0 : policyCategories[newCategoryName];
                                        expect(newCategory === null || newCategory === void 0 ? void 0 : newCategory.errors).toBeFalsy();
                                        expect(newCategory === null || newCategory === void 0 ? void 0 : newCategory.pendingAction).toBeFalsy();
                                        resolve();
                                    },
                                });
                            })];
                    case 5:
                        _c.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('renameWorkspaceCategory', function () {
        it('Rename category', function () { return __awaiter(void 0, void 0, void 0, function () {
            var fakePolicy, fakeCategories, oldCategoryName, newCategoryName;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        fakePolicy = (0, policies_1.default)(0);
                        fakeCategories = (0, policyCategory_1.default)(3);
                        oldCategoryName = Object.keys(fakeCategories).at(0);
                        newCategoryName = 'Updated category';
                        (_a = mockFetch === null || mockFetch === void 0 ? void 0 : mockFetch.pause) === null || _a === void 0 ? void 0 : _a.call(mockFetch);
                        react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(fakePolicy.id), fakePolicy);
                        react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.POLICY_CATEGORIES).concat(fakePolicy.id), fakeCategories);
                        Category.renamePolicyCategory(fakePolicy.id, {
                            oldName: oldCategoryName !== null && oldCategoryName !== void 0 ? oldCategoryName : '',
                            newName: newCategoryName,
                        });
                        return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                    case 1:
                        _c.sent();
                        return [4 /*yield*/, new Promise(function (resolve) {
                                var connection = react_native_onyx_1.default.connect({
                                    key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY_CATEGORIES).concat(fakePolicy.id),
                                    waitForCollectionCallback: false,
                                    callback: function (policyCategories) {
                                        var _a, _b, _c, _d;
                                        react_native_onyx_1.default.disconnect(connection);
                                        expect(policyCategories === null || policyCategories === void 0 ? void 0 : policyCategories[oldCategoryName !== null && oldCategoryName !== void 0 ? oldCategoryName : '']).toBeFalsy();
                                        expect((_a = policyCategories === null || policyCategories === void 0 ? void 0 : policyCategories[newCategoryName]) === null || _a === void 0 ? void 0 : _a.name).toBe(newCategoryName);
                                        expect((_b = policyCategories === null || policyCategories === void 0 ? void 0 : policyCategories[newCategoryName]) === null || _b === void 0 ? void 0 : _b.pendingAction).toBe(CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
                                        expect((_d = (_c = policyCategories === null || policyCategories === void 0 ? void 0 : policyCategories[newCategoryName]) === null || _c === void 0 ? void 0 : _c.pendingFields) === null || _d === void 0 ? void 0 : _d.name).toBe(CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
                                        resolve();
                                    },
                                });
                            })];
                    case 2:
                        _c.sent();
                        return [4 /*yield*/, ((_b = mockFetch === null || mockFetch === void 0 ? void 0 : mockFetch.resume) === null || _b === void 0 ? void 0 : _b.call(mockFetch))];
                    case 3:
                        _c.sent();
                        return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                    case 4:
                        _c.sent();
                        return [4 /*yield*/, new Promise(function (resolve) {
                                var connection = react_native_onyx_1.default.connect({
                                    key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY_CATEGORIES).concat(fakePolicy.id),
                                    waitForCollectionCallback: false,
                                    callback: function (policyCategories) {
                                        var _a, _b, _c;
                                        react_native_onyx_1.default.disconnect(connection);
                                        expect((_a = policyCategories === null || policyCategories === void 0 ? void 0 : policyCategories[newCategoryName]) === null || _a === void 0 ? void 0 : _a.pendingAction).toBeFalsy();
                                        expect((_c = (_b = policyCategories === null || policyCategories === void 0 ? void 0 : policyCategories[newCategoryName]) === null || _b === void 0 ? void 0 : _b.pendingFields) === null || _c === void 0 ? void 0 : _c.name).toBeFalsy();
                                        resolve();
                                    },
                                });
                            })];
                    case 5:
                        _c.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('setWorkspaceCategoriesEnabled', function () {
        it('Enable category', function () { return __awaiter(void 0, void 0, void 0, function () {
            var fakePolicy, fakeCategories, categoryNameToUpdate, categoriesToUpdate;
            var _a;
            var _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        fakePolicy = (0, policies_1.default)(0);
                        fakeCategories = (0, policyCategory_1.default)(3);
                        categoryNameToUpdate = (_b = Object.keys(fakeCategories).at(0)) !== null && _b !== void 0 ? _b : '';
                        categoriesToUpdate = (_a = {},
                            _a[categoryNameToUpdate] = {
                                name: categoryNameToUpdate,
                                enabled: true,
                            },
                            _a);
                        (_c = mockFetch === null || mockFetch === void 0 ? void 0 : mockFetch.pause) === null || _c === void 0 ? void 0 : _c.call(mockFetch);
                        react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(fakePolicy.id), fakePolicy);
                        react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.POLICY_CATEGORIES).concat(fakePolicy.id), fakeCategories);
                        Category.setWorkspaceCategoryEnabled(fakePolicy.id, categoriesToUpdate);
                        return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                    case 1:
                        _e.sent();
                        return [4 /*yield*/, new Promise(function (resolve) {
                                var connection = react_native_onyx_1.default.connect({
                                    key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY_CATEGORIES).concat(fakePolicy.id),
                                    waitForCollectionCallback: false,
                                    callback: function (policyCategories) {
                                        var _a, _b, _c, _d, _e;
                                        react_native_onyx_1.default.disconnect(connection);
                                        expect((_a = policyCategories === null || policyCategories === void 0 ? void 0 : policyCategories[categoryNameToUpdate]) === null || _a === void 0 ? void 0 : _a.enabled).toBeTruthy();
                                        expect((_b = policyCategories === null || policyCategories === void 0 ? void 0 : policyCategories[categoryNameToUpdate]) === null || _b === void 0 ? void 0 : _b.pendingAction).toBe(CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
                                        expect((_d = (_c = policyCategories === null || policyCategories === void 0 ? void 0 : policyCategories[categoryNameToUpdate]) === null || _c === void 0 ? void 0 : _c.pendingFields) === null || _d === void 0 ? void 0 : _d.enabled).toBe(CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
                                        expect((_e = policyCategories === null || policyCategories === void 0 ? void 0 : policyCategories[categoryNameToUpdate]) === null || _e === void 0 ? void 0 : _e.errors).toBeFalsy();
                                        resolve();
                                    },
                                });
                            })];
                    case 2:
                        _e.sent();
                        return [4 /*yield*/, ((_d = mockFetch === null || mockFetch === void 0 ? void 0 : mockFetch.resume) === null || _d === void 0 ? void 0 : _d.call(mockFetch))];
                    case 3:
                        _e.sent();
                        return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                    case 4:
                        _e.sent();
                        return [4 /*yield*/, new Promise(function (resolve) {
                                var connection = react_native_onyx_1.default.connect({
                                    key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY_CATEGORIES).concat(fakePolicy.id),
                                    waitForCollectionCallback: false,
                                    callback: function (policyCategories) {
                                        var _a, _b, _c;
                                        react_native_onyx_1.default.disconnect(connection);
                                        expect((_a = policyCategories === null || policyCategories === void 0 ? void 0 : policyCategories[categoryNameToUpdate]) === null || _a === void 0 ? void 0 : _a.pendingAction).toBeFalsy();
                                        expect((_c = (_b = policyCategories === null || policyCategories === void 0 ? void 0 : policyCategories[categoryNameToUpdate]) === null || _b === void 0 ? void 0 : _b.pendingFields) === null || _c === void 0 ? void 0 : _c.enabled).toBeFalsy();
                                        resolve();
                                    },
                                });
                            })];
                    case 5:
                        _e.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('deleteWorkspaceCategories', function () {
        it('Delete category', function () { return __awaiter(void 0, void 0, void 0, function () {
            var fakePolicy, fakeCategories, categoryNameToDelete, categoriesToDelete;
            var _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        fakePolicy = (0, policies_1.default)(0);
                        fakeCategories = (0, policyCategory_1.default)(3);
                        categoryNameToDelete = (_a = Object.keys(fakeCategories).at(0)) !== null && _a !== void 0 ? _a : '';
                        categoriesToDelete = [categoryNameToDelete];
                        (_b = mockFetch === null || mockFetch === void 0 ? void 0 : mockFetch.pause) === null || _b === void 0 ? void 0 : _b.call(mockFetch);
                        react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(fakePolicy.id), fakePolicy);
                        react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.POLICY_CATEGORIES).concat(fakePolicy.id), fakeCategories);
                        Category.deleteWorkspaceCategories(fakePolicy.id, categoriesToDelete);
                        return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                    case 1:
                        _d.sent();
                        return [4 /*yield*/, new Promise(function (resolve) {
                                var connection = react_native_onyx_1.default.connect({
                                    key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY_CATEGORIES).concat(fakePolicy.id),
                                    waitForCollectionCallback: false,
                                    callback: function (policyCategories) {
                                        var _a;
                                        react_native_onyx_1.default.disconnect(connection);
                                        expect((_a = policyCategories === null || policyCategories === void 0 ? void 0 : policyCategories[categoryNameToDelete]) === null || _a === void 0 ? void 0 : _a.pendingAction).toBe(CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
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
                                    key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY_CATEGORIES).concat(fakePolicy.id),
                                    waitForCollectionCallback: false,
                                    callback: function (policyCategories) {
                                        react_native_onyx_1.default.disconnect(connection);
                                        expect(policyCategories === null || policyCategories === void 0 ? void 0 : policyCategories[categoryNameToDelete]).toBeFalsy();
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
