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
var AttachmentModalContext_1 = require("@pages/media/AttachmentModalScreen/AttachmentModalContext");
var ComposeProviders_1 = require("@src/components/ComposeProviders");
var LocaleContextProvider_1 = require("@src/components/LocaleContextProvider");
var OnyxProvider_1 = require("@src/components/OnyxProvider");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ReportActionsList_1 = require("@src/pages/home/report/ReportActionsList");
var ReportScreenContext_1 = require("@src/pages/home/ReportScreenContext");
var reportActions_1 = require("../utils/collections/reportActions");
var reports_1 = require("../utils/collections/reports");
var ReportTestUtils = require("../utils/ReportTestUtils");
var TestHelper = require("../utils/TestHelper");
var waitForBatchedUpdates_1 = require("../utils/waitForBatchedUpdates");
var wrapOnyxWithWaitForBatchedUpdates_1 = require("../utils/wrapOnyxWithWaitForBatchedUpdates");
var mockedNavigate = jest.fn();
// Mock Fullstory library dependency
jest.mock('@libs/Fullstory', function () { return ({
    default: {
        consentAndIdentify: jest.fn(),
    },
    getFSAttributes: jest.fn(),
    getChatFSAttributes: jest.fn().mockReturnValue(['mockTestID', 'mockFSClass']),
    parseFSAttributes: jest.fn(),
}); });
jest.mock('@components/withCurrentUserPersonalDetails', function () {
    // Lazy loading of LHNTestUtils
    var lazyLoadLHNTestUtils = function () { return require('../utils/LHNTestUtils'); };
    return function (Component) {
        function WrappedComponent(props) {
            var currentUserAccountID = 5;
            var LHNTestUtils = lazyLoadLHNTestUtils(); // Load LHNTestUtils here
            return (<Component 
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props} currentUserPersonalDetails={LHNTestUtils.fakePersonalDetails[currentUserAccountID]}/>);
        }
        WrappedComponent.displayName = 'WrappedComponent';
        return WrappedComponent;
    };
});
jest.mock('@react-navigation/native', function () {
    var actualNav = jest.requireActual('@react-navigation/native');
    return __assign(__assign({}, actualNav), { useRoute: function () { return mockedNavigate; }, useIsFocused: function () { return true; } });
});
jest.mock('@src/components/ConfirmedRoute.tsx');
beforeAll(function () {
    return react_native_onyx_1.default.init({
        keys: ONYXKEYS_1.default,
        evictableKeys: [ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS],
    });
});
var mockOnLayout = jest.fn();
var mockOnScroll = jest.fn();
var mockLoadChats = jest.fn();
var mockRef = { current: null, flatListRef: null, scrollPosition: null, setScrollPosition: function () { } };
var TEST_USER_ACCOUNT_ID = 1;
var TEST_USER_LOGIN = 'test@test.com';
var signUpWithTestUser = function () {
    TestHelper.signInWithTestUser(TEST_USER_ACCOUNT_ID, TEST_USER_LOGIN);
};
var report = (0, reports_1.createRandomReport)(1);
var parentReportAction = (0, reportActions_1.default)(1);
beforeEach(function () {
    // Initialize the network key for OfflineWithFeedback
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.NETWORK, { isOffline: false });
    (0, wrapOnyxWithWaitForBatchedUpdates_1.default)(react_native_onyx_1.default);
    signUpWithTestUser();
});
afterEach(function () {
    react_native_onyx_1.default.clear();
});
function ReportActionsListWrapper() {
    var reportActions = ReportTestUtils.getMockedSortedReportActions(500);
    return (<ComposeProviders_1.default components={[OnyxProvider_1.default, LocaleContextProvider_1.LocaleContextProvider, AttachmentModalContext_1.AttachmentModalContextProvider]}>
            <ReportScreenContext_1.ReactionListContext.Provider value={mockRef}>
                <ReportScreenContext_1.ActionListContext.Provider value={mockRef}>
                    <ReportActionsList_1.default parentReportAction={parentReportAction} parentReportActionForTransactionThread={undefined} sortedReportActions={reportActions} sortedVisibleReportActions={reportActions} report={report} onLayout={mockOnLayout} onScroll={mockOnScroll} listID={1} loadOlderChats={mockLoadChats} loadNewerChats={mockLoadChats} transactionThreadReport={report}/>
                </ReportScreenContext_1.ActionListContext.Provider>
            </ReportScreenContext_1.ReactionListContext.Provider>
        </ComposeProviders_1.default>);
}
test('[ReportActionsList] should render ReportActionsList with 500 reportActions stored', function () { return __awaiter(void 0, void 0, void 0, function () {
    var scenario;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                scenario = function () { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, react_native_1.screen.findByTestId('report-actions-list')];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); };
                return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
            case 1:
                _a.sent();
                return [4 /*yield*/, (0, reassure_1.measureRenders)(<ReportActionsListWrapper />, { scenario: scenario })];
            case 2:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
