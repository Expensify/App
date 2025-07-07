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
var reassure_1 = require("reassure");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var LHNTestUtils = require("../utils/LHNTestUtils");
var TestHelper = require("../utils/TestHelper");
var waitForBatchedUpdates_1 = require("../utils/waitForBatchedUpdates");
var wrapInActHelper_1 = require("../utils/wrapInActHelper");
var wrapOnyxWithWaitForBatchedUpdates_1 = require("../utils/wrapOnyxWithWaitForBatchedUpdates");
jest.mock('@libs/Permissions');
jest.mock('../../src/libs/Navigation/Navigation', function () { return ({
    navigate: jest.fn(),
    isActiveRoute: jest.fn(),
    getTopmostReportId: jest.fn(),
    getActiveRoute: jest.fn(),
    getTopmostReportActionId: jest.fn(),
    isNavigationReady: jest.fn(function () { return Promise.resolve(); }),
    isDisplayedInModal: jest.fn(function () { return false; }),
}); });
jest.mock('../../src/libs/Navigation/navigationRef', function () { return ({
    getState: function () { return ({
        routes: [{ name: 'Report' }],
    }); },
    getRootState: function () { return ({
        routes: [],
    }); },
    addListener: function () { return function () { }; },
}); });
jest.mock('@components/Icon/Expensicons');
jest.mock('@react-navigation/native');
jest.mock('@src/hooks/useLHNEstimatedListSize/index.native.ts');
var getMockedReportsMap = function (length) {
    if (length === void 0) { length = 100; }
    var mockReports = Object.fromEntries(Array.from({ length: length }, function (value, index) {
        var reportID = index + 1;
        var participants = [1, 2];
        var reportKey = "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID);
        var report = __assign(__assign({}, LHNTestUtils.getFakeReport(participants, 1, true)), { lastMessageText: 'hey' });
        return [reportKey, report];
    }));
    return mockReports;
};
var mockedResponseMap = getMockedReportsMap(500);
describe('SidebarLinks', function () {
    beforeAll(function () {
        react_native_onyx_1.default.init({
            keys: ONYXKEYS_1.default,
            evictableKeys: [ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS],
        });
    });
    beforeEach(function () {
        global.fetch = TestHelper.getGlobalFetchMock();
        (0, wrapOnyxWithWaitForBatchedUpdates_1.default)(react_native_onyx_1.default);
        // Initialize the network key for OfflineWithFeedback
        react_native_onyx_1.default.merge(ONYXKEYS_1.default.NETWORK, { isOffline: false });
        TestHelper.signInWithTestUser(1, 'email1@test.com', undefined, undefined, 'One').then(waitForBatchedUpdates_1.default);
    });
    afterEach(function () {
        react_native_onyx_1.default.clear();
    });
    test('[SidebarLinks] should render Sidebar with 500 reports stored', function () { return __awaiter(void 0, void 0, void 0, function () {
        var scenario;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    scenario = function () { return __awaiter(void 0, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, (0, react_native_1.waitFor)(function () { return __awaiter(void 0, void 0, void 0, function () {
                                        return __generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0: 
                                                // Query for the sidebar
                                                return [4 /*yield*/, react_native_1.screen.findByTestId('lhn-options-list')];
                                                case 1:
                                                    // Query for the sidebar
                                                    _a.sent();
                                                    return [2 /*return*/];
                                            }
                                        });
                                    }); })];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); };
                    return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                case 1:
                    _b.sent();
                    react_native_onyx_1.default.multiSet(__assign((_a = {}, _a[ONYXKEYS_1.default.PERSONAL_DETAILS_LIST] = LHNTestUtils.fakePersonalDetails, _a[ONYXKEYS_1.default.BETAS] = [CONST_1.default.BETAS.DEFAULT_ROOMS], _a[ONYXKEYS_1.default.NVP_PRIORITY_MODE] = CONST_1.default.PRIORITY_MODE.GSD, _a[ONYXKEYS_1.default.IS_LOADING_REPORT_DATA] = false, _a), mockedResponseMap));
                    return [4 /*yield*/, (0, reassure_1.measureRenders)(<LHNTestUtils.MockedSidebarLinks />, { scenario: scenario })];
                case 2:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test('[SidebarLinks] should click on list item', function () { return __awaiter(void 0, void 0, void 0, function () {
        var scenario;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    scenario = function () { return __awaiter(void 0, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, (0, react_native_1.waitFor)(function () { return __awaiter(void 0, void 0, void 0, function () {
                                        var button;
                                        return __generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0: return [4 /*yield*/, react_native_1.screen.findByTestId('1')];
                                                case 1:
                                                    button = _a.sent();
                                                    return [4 /*yield*/, (0, wrapInActHelper_1.default)(function () {
                                                            react_native_1.fireEvent.press(button);
                                                        })];
                                                case 2:
                                                    _a.sent();
                                                    return [2 /*return*/];
                                            }
                                        });
                                    }); })];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); };
                    return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                case 1:
                    _b.sent();
                    react_native_onyx_1.default.multiSet(__assign((_a = {}, _a[ONYXKEYS_1.default.PERSONAL_DETAILS_LIST] = LHNTestUtils.fakePersonalDetails, _a[ONYXKEYS_1.default.BETAS] = [CONST_1.default.BETAS.DEFAULT_ROOMS], _a[ONYXKEYS_1.default.NVP_PRIORITY_MODE] = CONST_1.default.PRIORITY_MODE.GSD, _a[ONYXKEYS_1.default.IS_LOADING_REPORT_DATA] = false, _a), mockedResponseMap));
                    return [4 /*yield*/, (0, reassure_1.measureRenders)(<LHNTestUtils.MockedSidebarLinks />, { scenario: scenario })];
                case 2:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    }); });
});
