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
var react_native_1 = require("@testing-library/react-native");
var react_native_onyx_1 = require("react-native-onyx");
var CONST_1 = require("@src/CONST");
var CollectionDataSet_1 = require("@src/types/utils/CollectionDataSet");
var LHNTestUtils = require("../utils/LHNTestUtils");
var waitForBatchedUpdates_1 = require("../utils/waitForBatchedUpdates");
var wrapOnyxWithWaitForBatchedUpdates_1 = require("../utils/wrapOnyxWithWaitForBatchedUpdates");
var ONYXKEYS = {
    PERSONAL_DETAILS_LIST: 'personalDetailsList',
    IS_LOADING_REPORT_DATA: 'isLoadingReportData',
    COLLECTION: {
        REPORT_ACTIONS: 'reportActions_',
        POLICY: 'policy_',
    },
    NETWORK: 'network',
};
describe('ReportActionItemSingle', function () {
    beforeAll(function () {
        return react_native_onyx_1.default.init({
            keys: ONYXKEYS,
            evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
        });
    });
    beforeEach(function () {
        // Wrap Onyx each onyx action with waitForBatchedUpdates
        (0, wrapOnyxWithWaitForBatchedUpdates_1.default)(react_native_onyx_1.default);
        // Initialize the network key for OfflineWithFeedback
        return react_native_onyx_1.default.merge(ONYXKEYS.NETWORK, { isOffline: false });
    });
    // Clear out Onyx after each test so that each test starts with a clean slate
    afterEach(function () {
        react_native_onyx_1.default.clear();
    });
    describe('when the Report is a policy expense chat', function () {
        describe('and the property "shouldShowSubscriptAvatar" is true', function () {
            var _a;
            var _b;
            var shouldShowSubscriptAvatar = true;
            var fakeReport = LHNTestUtils.getFakeReportWithPolicy([1, 2]);
            var fakeReportAction = LHNTestUtils.getFakeAdvancedReportAction();
            var fakePolicy = LHNTestUtils.getFakePolicy(fakeReport.policyID);
            var faceAccountId = (_b = fakeReportAction.actorAccountID) !== null && _b !== void 0 ? _b : CONST_1.default.DEFAULT_NUMBER_ID;
            var fakePersonalDetails = (_a = {},
                _a[faceAccountId] = {
                    accountID: faceAccountId,
                    login: 'email1@test.com',
                    displayName: 'Email One',
                    avatar: 'https://example.com/avatar.png',
                    firstName: 'One',
                },
                _a);
            function setup() {
                var policyCollectionDataSet = (0, CollectionDataSet_1.toCollectionDataSet)(ONYXKEYS.COLLECTION.POLICY, [fakePolicy], function (item) { return item.id; });
                return (0, waitForBatchedUpdates_1.default)()
                    .then(function () {
                    var _a;
                    return react_native_onyx_1.default.multiSet(__assign((_a = {}, _a[ONYXKEYS.PERSONAL_DETAILS_LIST] = fakePersonalDetails, _a[ONYXKEYS.IS_LOADING_REPORT_DATA] = false, _a), policyCollectionDataSet));
                })
                    .then(function () {
                    LHNTestUtils.getDefaultRenderedReportActionItemSingle(shouldShowSubscriptAvatar, fakeReport, fakeReportAction);
                });
            }
            it('renders secondary Avatar properly', function () { return __awaiter(void 0, void 0, void 0, function () {
                var expectedSecondaryIconTestId;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            expectedSecondaryIconTestId = 'SvgDefaultAvatar_w Icon';
                            return [4 /*yield*/, setup()];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, (0, react_native_1.waitFor)(function () {
                                    expect(react_native_1.screen.getByTestId(expectedSecondaryIconTestId)).toBeOnTheScreen();
                                })];
                        case 2:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
            it('renders Person information', function () { return __awaiter(void 0, void 0, void 0, function () {
                var expectedPerson;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            expectedPerson = ((_a = fakeReportAction.person) !== null && _a !== void 0 ? _a : [])[0];
                            return [4 /*yield*/, setup()];
                        case 1:
                            _b.sent();
                            return [4 /*yield*/, (0, react_native_1.waitFor)(function () {
                                    var _a;
                                    expect(react_native_1.screen.getByText((_a = expectedPerson.text) !== null && _a !== void 0 ? _a : '')).toBeOnTheScreen();
                                })];
                        case 2:
                            _b.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
        });
    });
});
