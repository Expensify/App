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
var OnyxUpdateManager_1 = require("@libs/actions/OnyxUpdateManager");
var Tag_1 = require("@libs/actions/Policy/Tag");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var policies_1 = require("../utils/collections/policies");
var policyTags_1 = require("../utils/collections/policyTags");
var TestHelper = require("../utils/TestHelper");
var waitForBatchedUpdates_1 = require("../utils/waitForBatchedUpdates");
(0, OnyxUpdateManager_1.default)();
describe('actions/Policy', function () {
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
    describe('SetPolicyRequiresTag', function () {
        it('enable require tag', function () {
            var _a;
            var fakePolicy = (0, policies_1.default)(0);
            fakePolicy.requiresTag = false;
            (_a = mockFetch === null || mockFetch === void 0 ? void 0 : mockFetch.pause) === null || _a === void 0 ? void 0 : _a.call(mockFetch);
            return react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(fakePolicy.id), fakePolicy)
                .then(function () {
                (0, Tag_1.setPolicyRequiresTag)(fakePolicy.id, true);
                return (0, waitForBatchedUpdates_1.default)();
            })
                .then(function () {
                return new Promise(function (resolve) {
                    var connection = react_native_onyx_1.default.connect({
                        key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(fakePolicy.id),
                        waitForCollectionCallback: false,
                        callback: function (policy) {
                            var _a;
                            react_native_onyx_1.default.disconnect(connection);
                            // RequiresTag is enabled and pending
                            expect(policy === null || policy === void 0 ? void 0 : policy.requiresTag).toBeTruthy();
                            expect((_a = policy === null || policy === void 0 ? void 0 : policy.pendingFields) === null || _a === void 0 ? void 0 : _a.requiresTag).toBe(CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
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
                            var _a;
                            react_native_onyx_1.default.disconnect(connection);
                            expect((_a = policy === null || policy === void 0 ? void 0 : policy.pendingFields) === null || _a === void 0 ? void 0 : _a.requiresTag).toBeFalsy();
                            resolve();
                        },
                    });
                });
            });
        });
        it('disable require tag', function () {
            var _a;
            var fakePolicy = (0, policies_1.default)(0);
            fakePolicy.requiresTag = true;
            (_a = mockFetch === null || mockFetch === void 0 ? void 0 : mockFetch.pause) === null || _a === void 0 ? void 0 : _a.call(mockFetch);
            return react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(fakePolicy.id), fakePolicy)
                .then(function () {
                (0, Tag_1.setPolicyRequiresTag)(fakePolicy.id, false);
                return (0, waitForBatchedUpdates_1.default)();
            })
                .then(function () {
                return new Promise(function (resolve) {
                    var connection = react_native_onyx_1.default.connect({
                        key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(fakePolicy.id),
                        waitForCollectionCallback: false,
                        callback: function (policy) {
                            var _a;
                            react_native_onyx_1.default.disconnect(connection);
                            // RequiresTag is disabled and pending
                            expect(policy === null || policy === void 0 ? void 0 : policy.requiresTag).toBeFalsy();
                            expect((_a = policy === null || policy === void 0 ? void 0 : policy.pendingFields) === null || _a === void 0 ? void 0 : _a.requiresTag).toBe(CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
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
                            var _a;
                            react_native_onyx_1.default.disconnect(connection);
                            expect((_a = policy === null || policy === void 0 ? void 0 : policy.pendingFields) === null || _a === void 0 ? void 0 : _a.requiresTag).toBeFalsy();
                            resolve();
                        },
                    });
                });
            });
        });
        it('reset require tag when api returns an error', function () {
            var _a;
            var fakePolicy = (0, policies_1.default)(0);
            fakePolicy.requiresTag = true;
            (_a = mockFetch === null || mockFetch === void 0 ? void 0 : mockFetch.pause) === null || _a === void 0 ? void 0 : _a.call(mockFetch);
            return react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(fakePolicy.id), fakePolicy)
                .then(function () {
                var _a;
                (_a = mockFetch === null || mockFetch === void 0 ? void 0 : mockFetch.fail) === null || _a === void 0 ? void 0 : _a.call(mockFetch);
                (0, Tag_1.setPolicyRequiresTag)(fakePolicy.id, false);
                return (0, waitForBatchedUpdates_1.default)();
            })
                .then(mockFetch === null || mockFetch === void 0 ? void 0 : mockFetch.resume)
                .then(waitForBatchedUpdates_1.default)
                .then(function () {
                return new Promise(function (resolve) {
                    var connection = react_native_onyx_1.default.connect({
                        key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(fakePolicy.id),
                        waitForCollectionCallback: false,
                        callback: function (policy) {
                            var _a;
                            react_native_onyx_1.default.disconnect(connection);
                            expect((_a = policy === null || policy === void 0 ? void 0 : policy.pendingFields) === null || _a === void 0 ? void 0 : _a.requiresTag).toBeFalsy();
                            expect(policy === null || policy === void 0 ? void 0 : policy.errors).toBeTruthy();
                            expect(policy === null || policy === void 0 ? void 0 : policy.requiresTag).toBeTruthy();
                            resolve();
                        },
                    });
                });
            });
        });
        it('should update required field in policy tag list', function () { return __awaiter(void 0, void 0, void 0, function () {
            var fakePolicy, tagListName, fakePolicyTags, updatePolicyTags;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        fakePolicy = (0, policies_1.default)(0);
                        tagListName = 'Tag';
                        fakePolicy.requiresTag = false;
                        fakePolicyTags = (0, policyTags_1.default)(tagListName);
                        return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(fakePolicy.id), fakePolicy)];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.POLICY_TAGS).concat(fakePolicy.id), fakePolicyTags)];
                    case 2:
                        _b.sent();
                        (0, Tag_1.setPolicyRequiresTag)(fakePolicy.id, true);
                        return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                    case 3:
                        _b.sent();
                        return [4 /*yield*/, TestHelper.getOnyxData({
                                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY_TAGS).concat(fakePolicy.id),
                                callback: function (val) { return (updatePolicyTags = val); },
                            })];
                    case 4:
                        _b.sent();
                        expect((_a = updatePolicyTags === null || updatePolicyTags === void 0 ? void 0 : updatePolicyTags[tagListName]) === null || _a === void 0 ? void 0 : _a.required).toBeTruthy();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('renamePolicyTagList', function () {
        it('rename policy tag list', function () {
            var _a;
            var fakePolicy = (0, policies_1.default)(0);
            fakePolicy.areTagsEnabled = true;
            var oldTagListName = 'Old tag list name';
            var newTagListName = 'New tag list name';
            var fakePolicyTags = (0, policyTags_1.default)(oldTagListName);
            (_a = mockFetch === null || mockFetch === void 0 ? void 0 : mockFetch.pause) === null || _a === void 0 ? void 0 : _a.call(mockFetch);
            return react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(fakePolicy.id), fakePolicy)
                .then(function () {
                react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.POLICY_TAGS).concat(fakePolicy.id), fakePolicyTags);
            })
                .then(function () {
                var _a, _b;
                (0, Tag_1.renamePolicyTagList)(fakePolicy.id, {
                    oldName: oldTagListName,
                    newName: newTagListName,
                }, fakePolicyTags, (_b = (_a = Object.values(fakePolicyTags).at(0)) === null || _a === void 0 ? void 0 : _a.orderWeight) !== null && _b !== void 0 ? _b : 0);
                return (0, waitForBatchedUpdates_1.default)();
            })
                .then(function () {
                return new Promise(function (resolve) {
                    var connection = react_native_onyx_1.default.connect({
                        key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY_TAGS).concat(fakePolicy.id),
                        waitForCollectionCallback: false,
                        callback: function (policyTags) {
                            var _a, _b, _c;
                            react_native_onyx_1.default.disconnect(connection);
                            // Tag list name is updated and pending
                            expect(Object.keys((_a = policyTags === null || policyTags === void 0 ? void 0 : policyTags[oldTagListName]) !== null && _a !== void 0 ? _a : {}).length).toBe(0);
                            expect((_b = policyTags === null || policyTags === void 0 ? void 0 : policyTags[newTagListName]) === null || _b === void 0 ? void 0 : _b.name).toBe(newTagListName);
                            expect((_c = policyTags === null || policyTags === void 0 ? void 0 : policyTags[newTagListName]) === null || _c === void 0 ? void 0 : _c.pendingAction).toBe(CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD);
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
                        key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY_TAGS).concat(fakePolicy.id),
                        waitForCollectionCallback: false,
                        callback: function (policyTags) {
                            var _a, _b;
                            react_native_onyx_1.default.disconnect(connection);
                            expect((_a = policyTags === null || policyTags === void 0 ? void 0 : policyTags[newTagListName]) === null || _a === void 0 ? void 0 : _a.pendingAction).toBeFalsy();
                            expect(Object.keys((_b = policyTags === null || policyTags === void 0 ? void 0 : policyTags[oldTagListName]) !== null && _b !== void 0 ? _b : {}).length).toBe(0);
                            resolve();
                        },
                    });
                });
            });
        });
        it('reset the policy tag list name when api returns error', function () {
            var _a;
            var fakePolicy = (0, policies_1.default)(0);
            fakePolicy.areTagsEnabled = true;
            var oldTagListName = 'Old tag list name';
            var newTagListName = 'New tag list name';
            var fakePolicyTags = (0, policyTags_1.default)(oldTagListName);
            (_a = mockFetch === null || mockFetch === void 0 ? void 0 : mockFetch.pause) === null || _a === void 0 ? void 0 : _a.call(mockFetch);
            return react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(fakePolicy.id), fakePolicy)
                .then(function () {
                react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.POLICY_TAGS).concat(fakePolicy.id), fakePolicyTags);
            })
                .then(function () {
                var _a, _b, _c;
                (_a = mockFetch === null || mockFetch === void 0 ? void 0 : mockFetch.fail) === null || _a === void 0 ? void 0 : _a.call(mockFetch);
                (0, Tag_1.renamePolicyTagList)(fakePolicy.id, {
                    oldName: oldTagListName,
                    newName: newTagListName,
                }, fakePolicyTags, (_c = (_b = Object.values(fakePolicyTags).at(0)) === null || _b === void 0 ? void 0 : _b.orderWeight) !== null && _c !== void 0 ? _c : 0);
                return (0, waitForBatchedUpdates_1.default)();
            })
                .then(mockFetch === null || mockFetch === void 0 ? void 0 : mockFetch.resume)
                .then(waitForBatchedUpdates_1.default)
                .then(function () {
                return new Promise(function (resolve) {
                    var connection = react_native_onyx_1.default.connect({
                        key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY_TAGS).concat(fakePolicy.id),
                        waitForCollectionCallback: false,
                        callback: function (policyTags) {
                            var _a;
                            react_native_onyx_1.default.disconnect(connection);
                            expect(policyTags === null || policyTags === void 0 ? void 0 : policyTags[newTagListName]).toBeFalsy();
                            expect(policyTags === null || policyTags === void 0 ? void 0 : policyTags[oldTagListName]).toBeTruthy();
                            expect((_a = policyTags === null || policyTags === void 0 ? void 0 : policyTags[oldTagListName]) === null || _a === void 0 ? void 0 : _a.errors).toBeTruthy();
                            resolve();
                        },
                    });
                });
            });
        });
    });
    describe('CreatePolicyTag', function () {
        it('create new policy tag', function () {
            var _a;
            var fakePolicy = (0, policies_1.default)(0);
            fakePolicy.areTagsEnabled = true;
            var tagListName = 'Fake tag';
            var newTagName = 'new tag';
            var fakePolicyTags = (0, policyTags_1.default)(tagListName);
            (_a = mockFetch === null || mockFetch === void 0 ? void 0 : mockFetch.pause) === null || _a === void 0 ? void 0 : _a.call(mockFetch);
            return react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(fakePolicy.id), fakePolicy)
                .then(function () {
                react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.POLICY_TAGS).concat(fakePolicy.id), fakePolicyTags);
            })
                .then(function () {
                (0, Tag_1.createPolicyTag)(fakePolicy.id, newTagName);
                return (0, waitForBatchedUpdates_1.default)();
            })
                .then(function () {
                return new Promise(function (resolve) {
                    var connection = react_native_onyx_1.default.connect({
                        key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY_TAGS).concat(fakePolicy.id),
                        waitForCollectionCallback: false,
                        callback: function (policyTags) {
                            var _a, _b;
                            react_native_onyx_1.default.disconnect(connection);
                            var newTag = (_b = (_a = policyTags === null || policyTags === void 0 ? void 0 : policyTags[tagListName]) === null || _a === void 0 ? void 0 : _a.tags) === null || _b === void 0 ? void 0 : _b[newTagName];
                            expect(newTag === null || newTag === void 0 ? void 0 : newTag.name).toBe(newTagName);
                            expect(newTag === null || newTag === void 0 ? void 0 : newTag.enabled).toBe(true);
                            expect(newTag === null || newTag === void 0 ? void 0 : newTag.errors).toBeFalsy();
                            expect(newTag === null || newTag === void 0 ? void 0 : newTag.pendingAction).toBe(CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD);
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
                        key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY_TAGS).concat(fakePolicy.id),
                        waitForCollectionCallback: false,
                        callback: function (policyTags) {
                            var _a, _b;
                            react_native_onyx_1.default.disconnect(connection);
                            var newTag = (_b = (_a = policyTags === null || policyTags === void 0 ? void 0 : policyTags[tagListName]) === null || _a === void 0 ? void 0 : _a.tags) === null || _b === void 0 ? void 0 : _b[newTagName];
                            expect(newTag === null || newTag === void 0 ? void 0 : newTag.errors).toBeFalsy();
                            expect(newTag === null || newTag === void 0 ? void 0 : newTag.pendingAction).toBeFalsy();
                            resolve();
                        },
                    });
                });
            });
        });
        it('reset new policy tag when api returns error', function () {
            var _a;
            var fakePolicy = (0, policies_1.default)(0);
            fakePolicy.areTagsEnabled = true;
            var tagListName = 'Fake tag';
            var newTagName = 'new tag';
            var fakePolicyTags = (0, policyTags_1.default)(tagListName);
            (_a = mockFetch === null || mockFetch === void 0 ? void 0 : mockFetch.pause) === null || _a === void 0 ? void 0 : _a.call(mockFetch);
            return react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(fakePolicy.id), fakePolicy)
                .then(function () {
                react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.POLICY_TAGS).concat(fakePolicy.id), fakePolicyTags);
            })
                .then(function () {
                var _a;
                (_a = mockFetch === null || mockFetch === void 0 ? void 0 : mockFetch.fail) === null || _a === void 0 ? void 0 : _a.call(mockFetch);
                (0, Tag_1.createPolicyTag)(fakePolicy.id, newTagName);
                return (0, waitForBatchedUpdates_1.default)();
            })
                .then(mockFetch === null || mockFetch === void 0 ? void 0 : mockFetch.resume)
                .then(waitForBatchedUpdates_1.default)
                .then(function () {
                return new Promise(function (resolve) {
                    var connection = react_native_onyx_1.default.connect({
                        key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY_TAGS).concat(fakePolicy.id),
                        waitForCollectionCallback: false,
                        callback: function (policyTags) {
                            var _a, _b;
                            react_native_onyx_1.default.disconnect(connection);
                            var newTag = (_b = (_a = policyTags === null || policyTags === void 0 ? void 0 : policyTags[tagListName]) === null || _a === void 0 ? void 0 : _a.tags) === null || _b === void 0 ? void 0 : _b[newTagName];
                            expect(newTag === null || newTag === void 0 ? void 0 : newTag.errors).toBeTruthy();
                            resolve();
                        },
                    });
                });
            });
        });
    });
    describe('SetPolicyTagsEnabled', function () {
        it('set policy tag enable', function () {
            var _a, _b, _c;
            var fakePolicy = (0, policies_1.default)(0);
            fakePolicy.areTagsEnabled = true;
            var tagListName = 'Fake tag';
            var fakePolicyTags = (0, policyTags_1.default)(tagListName, 2);
            var tagsToUpdate = Object.keys((_b = (_a = fakePolicyTags === null || fakePolicyTags === void 0 ? void 0 : fakePolicyTags[tagListName]) === null || _a === void 0 ? void 0 : _a.tags) !== null && _b !== void 0 ? _b : {}).reduce(function (acc, key) {
                var _a;
                acc[key] = {
                    name: (_a = fakePolicyTags === null || fakePolicyTags === void 0 ? void 0 : fakePolicyTags[tagListName]) === null || _a === void 0 ? void 0 : _a.tags[key].name,
                    enabled: false,
                };
                return acc;
            }, {});
            (_c = mockFetch === null || mockFetch === void 0 ? void 0 : mockFetch.pause) === null || _c === void 0 ? void 0 : _c.call(mockFetch);
            return react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(fakePolicy.id), fakePolicy)
                .then(function () {
                react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.POLICY_TAGS).concat(fakePolicy.id), fakePolicyTags);
            })
                .then(function () {
                (0, Tag_1.setWorkspaceTagEnabled)(fakePolicy.id, tagsToUpdate, 0);
                return (0, waitForBatchedUpdates_1.default)();
            })
                .then(function () {
                return new Promise(function (resolve) {
                    var connection = react_native_onyx_1.default.connect({
                        key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY_TAGS).concat(fakePolicy.id),
                        waitForCollectionCallback: false,
                        callback: function (policyTags) {
                            react_native_onyx_1.default.disconnect(connection);
                            Object.keys(tagsToUpdate).forEach(function (key) {
                                var _a, _b;
                                var updatedTag = (_a = policyTags === null || policyTags === void 0 ? void 0 : policyTags[tagListName]) === null || _a === void 0 ? void 0 : _a.tags[key];
                                expect(updatedTag === null || updatedTag === void 0 ? void 0 : updatedTag.enabled).toBeFalsy();
                                expect(updatedTag === null || updatedTag === void 0 ? void 0 : updatedTag.errors).toBeFalsy();
                                expect(updatedTag === null || updatedTag === void 0 ? void 0 : updatedTag.pendingAction).toBe(CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
                                expect((_b = updatedTag === null || updatedTag === void 0 ? void 0 : updatedTag.pendingFields) === null || _b === void 0 ? void 0 : _b.enabled).toBe(CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
                            });
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
                        key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY_TAGS).concat(fakePolicy.id),
                        waitForCollectionCallback: false,
                        callback: function (policyTags) {
                            react_native_onyx_1.default.disconnect(connection);
                            Object.keys(tagsToUpdate).forEach(function (key) {
                                var _a, _b;
                                var updatedTag = (_a = policyTags === null || policyTags === void 0 ? void 0 : policyTags[tagListName]) === null || _a === void 0 ? void 0 : _a.tags[key];
                                expect(updatedTag === null || updatedTag === void 0 ? void 0 : updatedTag.errors).toBeFalsy();
                                expect(updatedTag === null || updatedTag === void 0 ? void 0 : updatedTag.pendingAction).toBeFalsy();
                                expect((_b = updatedTag === null || updatedTag === void 0 ? void 0 : updatedTag.pendingFields) === null || _b === void 0 ? void 0 : _b.enabled).toBeFalsy();
                            });
                            resolve();
                        },
                    });
                });
            });
        });
        it('reset policy tag enable when api returns error', function () {
            var _a, _b, _c;
            var fakePolicy = (0, policies_1.default)(0);
            fakePolicy.areTagsEnabled = true;
            var tagListName = 'Fake tag';
            var fakePolicyTags = (0, policyTags_1.default)(tagListName, 2);
            var tagsToUpdate = Object.keys((_b = (_a = fakePolicyTags === null || fakePolicyTags === void 0 ? void 0 : fakePolicyTags[tagListName]) === null || _a === void 0 ? void 0 : _a.tags) !== null && _b !== void 0 ? _b : {}).reduce(function (acc, key) {
                var _a;
                acc[key] = {
                    name: (_a = fakePolicyTags === null || fakePolicyTags === void 0 ? void 0 : fakePolicyTags[tagListName]) === null || _a === void 0 ? void 0 : _a.tags[key].name,
                    enabled: false,
                };
                return acc;
            }, {});
            (_c = mockFetch === null || mockFetch === void 0 ? void 0 : mockFetch.pause) === null || _c === void 0 ? void 0 : _c.call(mockFetch);
            return react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(fakePolicy.id), fakePolicy)
                .then(function () {
                react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.POLICY_TAGS).concat(fakePolicy.id), fakePolicyTags);
            })
                .then(function () {
                var _a;
                (_a = mockFetch === null || mockFetch === void 0 ? void 0 : mockFetch.fail) === null || _a === void 0 ? void 0 : _a.call(mockFetch);
                (0, Tag_1.setWorkspaceTagEnabled)(fakePolicy.id, tagsToUpdate, 0);
                return (0, waitForBatchedUpdates_1.default)();
            })
                .then(mockFetch === null || mockFetch === void 0 ? void 0 : mockFetch.resume)
                .then(waitForBatchedUpdates_1.default)
                .then(function () {
                return new Promise(function (resolve) {
                    var connection = react_native_onyx_1.default.connect({
                        key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY_TAGS).concat(fakePolicy.id),
                        waitForCollectionCallback: false,
                        callback: function (policyTags) {
                            react_native_onyx_1.default.disconnect(connection);
                            Object.keys(tagsToUpdate).forEach(function (key) {
                                var _a, _b;
                                var updatedTag = (_a = policyTags === null || policyTags === void 0 ? void 0 : policyTags[tagListName]) === null || _a === void 0 ? void 0 : _a.tags[key];
                                expect(updatedTag === null || updatedTag === void 0 ? void 0 : updatedTag.errors).toBeTruthy();
                                expect(updatedTag === null || updatedTag === void 0 ? void 0 : updatedTag.pendingAction).toBeFalsy();
                                expect((_b = updatedTag === null || updatedTag === void 0 ? void 0 : updatedTag.pendingFields) === null || _b === void 0 ? void 0 : _b.enabled).toBeFalsy();
                            });
                            resolve();
                        },
                    });
                });
            });
        });
    });
    describe('RenamePolicyTag', function () {
        it('rename policy tag', function () {
            var _a, _b;
            var fakePolicy = (0, policies_1.default)(0);
            fakePolicy.areTagsEnabled = true;
            var tagListName = 'Fake tag';
            var fakePolicyTags = (0, policyTags_1.default)(tagListName, 2);
            var oldTagName = Object.keys((_a = fakePolicyTags === null || fakePolicyTags === void 0 ? void 0 : fakePolicyTags[tagListName]) === null || _a === void 0 ? void 0 : _a.tags).at(0);
            var newTagName = 'New tag';
            (_b = mockFetch === null || mockFetch === void 0 ? void 0 : mockFetch.pause) === null || _b === void 0 ? void 0 : _b.call(mockFetch);
            return react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(fakePolicy.id), fakePolicy)
                .then(function () {
                react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.POLICY_TAGS).concat(fakePolicy.id), fakePolicyTags);
            })
                .then(function () {
                (0, Tag_1.renamePolicyTag)(fakePolicy.id, {
                    oldName: oldTagName !== null && oldTagName !== void 0 ? oldTagName : '',
                    newName: newTagName,
                }, 0);
                return (0, waitForBatchedUpdates_1.default)();
            })
                .then(function () {
                return new Promise(function (resolve) {
                    var connection = react_native_onyx_1.default.connect({
                        key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY_TAGS).concat(fakePolicy.id),
                        waitForCollectionCallback: false,
                        callback: function (policyTags) {
                            var _a, _b, _c, _d, _e;
                            react_native_onyx_1.default.disconnect(connection);
                            var tags = (_a = policyTags === null || policyTags === void 0 ? void 0 : policyTags[tagListName]) === null || _a === void 0 ? void 0 : _a.tags;
                            expect(tags === null || tags === void 0 ? void 0 : tags[oldTagName !== null && oldTagName !== void 0 ? oldTagName : '']).toBeFalsy();
                            expect((_b = tags === null || tags === void 0 ? void 0 : tags[newTagName]) === null || _b === void 0 ? void 0 : _b.name).toBe(newTagName);
                            expect((_c = tags === null || tags === void 0 ? void 0 : tags[newTagName]) === null || _c === void 0 ? void 0 : _c.pendingAction).toBe(CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
                            expect((_e = (_d = tags === null || tags === void 0 ? void 0 : tags[newTagName]) === null || _d === void 0 ? void 0 : _d.pendingFields) === null || _e === void 0 ? void 0 : _e.name).toBe(CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
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
                        key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY_TAGS).concat(fakePolicy.id),
                        waitForCollectionCallback: false,
                        callback: function (policyTags) {
                            var _a, _b, _c, _d;
                            react_native_onyx_1.default.disconnect(connection);
                            var tags = (_a = policyTags === null || policyTags === void 0 ? void 0 : policyTags[tagListName]) === null || _a === void 0 ? void 0 : _a.tags;
                            expect((_b = tags === null || tags === void 0 ? void 0 : tags[newTagName]) === null || _b === void 0 ? void 0 : _b.pendingAction).toBeFalsy();
                            expect((_d = (_c = tags === null || tags === void 0 ? void 0 : tags[newTagName]) === null || _c === void 0 ? void 0 : _c.pendingFields) === null || _d === void 0 ? void 0 : _d.name).toBeFalsy();
                            resolve();
                        },
                    });
                });
            });
        });
        it('reset policy tag name when api returns error', function () {
            var _a, _b, _c;
            var fakePolicy = (0, policies_1.default)(0);
            fakePolicy.areTagsEnabled = true;
            var tagListName = 'Fake tag';
            var fakePolicyTags = (0, policyTags_1.default)(tagListName, 2);
            var oldTagName = (_b = Object.keys((_a = fakePolicyTags === null || fakePolicyTags === void 0 ? void 0 : fakePolicyTags[tagListName]) === null || _a === void 0 ? void 0 : _a.tags).at(0)) !== null && _b !== void 0 ? _b : '';
            var newTagName = 'New tag';
            (_c = mockFetch === null || mockFetch === void 0 ? void 0 : mockFetch.pause) === null || _c === void 0 ? void 0 : _c.call(mockFetch);
            return react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(fakePolicy.id), fakePolicy)
                .then(function () {
                react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.POLICY_TAGS).concat(fakePolicy.id), fakePolicyTags);
            })
                .then(function () {
                var _a;
                (_a = mockFetch === null || mockFetch === void 0 ? void 0 : mockFetch.fail) === null || _a === void 0 ? void 0 : _a.call(mockFetch);
                (0, Tag_1.renamePolicyTag)(fakePolicy.id, {
                    oldName: oldTagName,
                    newName: newTagName,
                }, 0);
                return (0, waitForBatchedUpdates_1.default)();
            })
                .then(mockFetch === null || mockFetch === void 0 ? void 0 : mockFetch.resume)
                .then(waitForBatchedUpdates_1.default)
                .then(function () {
                return new Promise(function (resolve) {
                    var connection = react_native_onyx_1.default.connect({
                        key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY_TAGS).concat(fakePolicy.id),
                        waitForCollectionCallback: false,
                        callback: function (policyTags) {
                            var _a, _b;
                            react_native_onyx_1.default.disconnect(connection);
                            var tags = (_a = policyTags === null || policyTags === void 0 ? void 0 : policyTags[tagListName]) === null || _a === void 0 ? void 0 : _a.tags;
                            expect(tags === null || tags === void 0 ? void 0 : tags[newTagName]).toBeFalsy();
                            expect((_b = tags === null || tags === void 0 ? void 0 : tags[oldTagName]) === null || _b === void 0 ? void 0 : _b.errors).toBeTruthy();
                            resolve();
                        },
                    });
                });
            });
        });
    });
    describe('DeletePolicyTags', function () {
        it('delete policy tag', function () {
            var _a, _b, _c;
            var fakePolicy = (0, policies_1.default)(0);
            fakePolicy.areTagsEnabled = true;
            var tagListName = 'Fake tag';
            var fakePolicyTags = (0, policyTags_1.default)(tagListName, 2);
            var tagsToDelete = Object.keys((_b = (_a = fakePolicyTags === null || fakePolicyTags === void 0 ? void 0 : fakePolicyTags[tagListName]) === null || _a === void 0 ? void 0 : _a.tags) !== null && _b !== void 0 ? _b : {});
            (_c = mockFetch === null || mockFetch === void 0 ? void 0 : mockFetch.pause) === null || _c === void 0 ? void 0 : _c.call(mockFetch);
            return react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(fakePolicy.id), fakePolicy)
                .then(function () {
                react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.POLICY_TAGS).concat(fakePolicy.id), fakePolicyTags);
            })
                .then(function () {
                (0, Tag_1.deletePolicyTags)(fakePolicy.id, tagsToDelete);
                return (0, waitForBatchedUpdates_1.default)();
            })
                .then(function () {
                return new Promise(function (resolve) {
                    var connection = react_native_onyx_1.default.connect({
                        key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY_TAGS).concat(fakePolicy.id),
                        waitForCollectionCallback: false,
                        callback: function (policyTags) {
                            react_native_onyx_1.default.disconnect(connection);
                            tagsToDelete.forEach(function (tagName) {
                                var _a, _b;
                                expect((_b = (_a = policyTags === null || policyTags === void 0 ? void 0 : policyTags[tagListName]) === null || _a === void 0 ? void 0 : _a.tags[tagName]) === null || _b === void 0 ? void 0 : _b.pendingAction).toBe(CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
                            });
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
                        key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY_TAGS).concat(fakePolicy.id),
                        waitForCollectionCallback: false,
                        callback: function (policyTags) {
                            react_native_onyx_1.default.disconnect(connection);
                            tagsToDelete.forEach(function (tagName) {
                                var _a;
                                expect((_a = policyTags === null || policyTags === void 0 ? void 0 : policyTags[tagListName]) === null || _a === void 0 ? void 0 : _a.tags[tagName]).toBeFalsy();
                            });
                            resolve();
                        },
                    });
                });
            });
        });
        it('reset the deleted policy tag when api returns error', function () {
            var _a, _b, _c;
            var fakePolicy = (0, policies_1.default)(0);
            fakePolicy.areTagsEnabled = true;
            var tagListName = 'Fake tag';
            var fakePolicyTags = (0, policyTags_1.default)(tagListName, 2);
            var tagsToDelete = Object.keys((_b = (_a = fakePolicyTags === null || fakePolicyTags === void 0 ? void 0 : fakePolicyTags[tagListName]) === null || _a === void 0 ? void 0 : _a.tags) !== null && _b !== void 0 ? _b : {});
            (_c = mockFetch === null || mockFetch === void 0 ? void 0 : mockFetch.pause) === null || _c === void 0 ? void 0 : _c.call(mockFetch);
            return react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(fakePolicy.id), fakePolicy)
                .then(function () {
                react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.POLICY_TAGS).concat(fakePolicy.id), fakePolicyTags);
            })
                .then(function () {
                var _a;
                (_a = mockFetch === null || mockFetch === void 0 ? void 0 : mockFetch.fail) === null || _a === void 0 ? void 0 : _a.call(mockFetch);
                (0, Tag_1.deletePolicyTags)(fakePolicy.id, tagsToDelete);
                return (0, waitForBatchedUpdates_1.default)();
            })
                .then(mockFetch === null || mockFetch === void 0 ? void 0 : mockFetch.resume)
                .then(waitForBatchedUpdates_1.default)
                .then(function () {
                return new Promise(function (resolve) {
                    var connection = react_native_onyx_1.default.connect({
                        key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY_TAGS).concat(fakePolicy.id),
                        waitForCollectionCallback: false,
                        callback: function (policyTags) {
                            react_native_onyx_1.default.disconnect(connection);
                            tagsToDelete.forEach(function (tagName) {
                                var _a, _b;
                                expect((_a = policyTags === null || policyTags === void 0 ? void 0 : policyTags[tagListName]) === null || _a === void 0 ? void 0 : _a.tags[tagName].pendingAction).toBeFalsy();
                                expect((_b = policyTags === null || policyTags === void 0 ? void 0 : policyTags[tagListName]) === null || _b === void 0 ? void 0 : _b.tags[tagName].errors).toBeTruthy();
                            });
                            resolve();
                        },
                    });
                });
            });
        });
    });
});
