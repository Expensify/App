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
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
var portal_1 = require("@gorhom/portal");
var native_1 = require("@react-navigation/native");
var react_native_1 = require("@testing-library/react-native");
var react_1 = require("react");
var react_native_onyx_1 = require("react-native-onyx");
var ComposeProviders_1 = require("@components/ComposeProviders");
var LocaleContextProvider_1 = require("@components/LocaleContextProvider");
var OnyxProvider_1 = require("@components/OnyxProvider");
var PlaybackContext_1 = require("@components/VideoPlayerContexts/PlaybackContext");
var useCurrentReportID_1 = require("@hooks/useCurrentReportID");
var types_1 = require("@libs/API/types");
var Localize_1 = require("@libs/Localize");
var createPlatformStackNavigator_1 = require("@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator");
var SequentialQueue_1 = require("@libs/Network/SequentialQueue");
var AttachmentModalScreen_1 = require("@pages/media/AttachmentModalScreen");
var AttachmentModalContext_1 = require("@pages/media/AttachmentModalScreen/AttachmentModalContext");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var SCREENS_1 = require("@src/SCREENS");
var TestHelper_1 = require("../utils/TestHelper");
var waitForBatchedUpdates_1 = require("../utils/waitForBatchedUpdates");
var waitForBatchedUpdatesWithAct_1 = require("../utils/waitForBatchedUpdatesWithAct");
var wrapOnyxWithWaitForBatchedUpdates_1 = require("../utils/wrapOnyxWithWaitForBatchedUpdates");
var Stack = (0, createPlatformStackNavigator_1.default)();
(0, TestHelper_1.setupGlobalFetchMock)();
jest.mock('@rnmapbox/maps', function () {
    return {
        default: jest.fn(),
        MarkerView: jest.fn(),
        setAccessToken: jest.fn(),
    };
});
jest.mock('@react-native-community/geolocation', function () { return ({
    setRNConfiguration: jest.fn(),
}); });
jest.mock('@src/components/Attachments/AttachmentCarousel/Pager/usePageScrollHandler', function () { return jest.fn(); });
var renderPage = function (initialRouteName, initialParams) {
    return (0, react_native_1.render)(<ComposeProviders_1.default components={[OnyxProvider_1.default, LocaleContextProvider_1.LocaleContextProvider, AttachmentModalContext_1.AttachmentModalContextProvider, useCurrentReportID_1.CurrentReportIDContextProvider, portal_1.PortalProvider, PlaybackContext_1.PlaybackContextProvider]}>
            <native_1.NavigationContainer>
                <Stack.Navigator initialRouteName={initialRouteName}>
                    <Stack.Screen name={SCREENS_1.default.ATTACHMENTS} component={AttachmentModalScreen_1.default} initialParams={initialParams}/>
                </Stack.Navigator>
            </native_1.NavigationContainer>
        </ComposeProviders_1.default>);
};
// // Given report attachment data results consisting of involved user login, user account id, report & report action and attachment id
var TEST_USER_LOGIN = 'test@test.com';
var TEST_USER_ACCOUNT_ID = 1;
var reportAttachmentID = '7487537791562875';
var reportActionAttachmentID = '7006877151048865417';
var reportAttachmentOnyx = {
    reportName: 'Chat Report',
    currency: 'USD',
    description: '',
    errorFields: {},
    hasOutstandingChildRequest: false,
    hasOutstandingChildTask: false,
    isCancelledIOU: false,
    isOwnPolicyExpenseChat: false,
    isPinned: false,
    isWaitingOnBankAccount: false,
    lastActionType: 'ADDCOMMENT',
    lastActorAccountID: TEST_USER_ACCOUNT_ID,
    lastMessageHtml: '<img src="https://staging.expensify.com/chat-attachments/7006877151048865417/w_d060af4fb7ac4a815e6ed99df9ef8dd216fdd8c7.png.1024.jpg" data-expensify-source="https://staging.expensify.com/chat-attachments/7006877151048865417/w_d060af4fb7ac4a815e6ed99df9ef8dd216fdd8c7.png" data-name="Screenshot_2025-02-05_at_13.03.32.png" data-expensify-height="408" data-expensify-width="980" />',
    lastMessageText: '[Attachment]',
    lastReadSequenceNumber: 0,
    lastReadTime: '2025-02-05 07:32:45.788',
    lastVisibleActionCreated: '2025-02-05 07:29:21.593',
    lastVisibleActionLastModified: '2025-02-05 07:29:21.593',
    managerID: 0,
    nonReimbursableTotal: 0,
    oldPolicyName: '',
    ownerAccountID: 0,
    participants: (_a = {},
        _a[TEST_USER_ACCOUNT_ID] = {
            notificationPreference: 'always',
        },
        _a),
    permissions: ['read', 'write'],
    policyID: '_FAKE_',
    reportID: '7487537791562875',
    stateNum: 0,
    statusNum: 0,
    total: 0,
    type: 'chat',
    unheldNonReimbursableTotal: 0,
    unheldTotal: 0,
    welcomeMessage: '',
    writeCapability: 'all',
};
var reportActionsAttachmentOnyx = (_b = {},
    _b[reportActionAttachmentID] = {
        person: [
            {
                type: 'TEXT',
                style: 'strong',
                text: TEST_USER_LOGIN,
            },
        ],
        actorAccountID: TEST_USER_ACCOUNT_ID,
        message: [
            {
                type: 'COMMENT',
                html: '<img src="https://staging.expensify.com/chat-attachments/7006877151048865417/w_d060af4fb7ac4a815e6ed99df9ef8dd216fdd8c7.png.1024.jpg" data-expensify-source="https://staging.expensify.com/chat-attachments/7006877151048865417/w_d060af4fb7ac4a815e6ed99df9ef8dd216fdd8c7.png" data-name="Screenshot_2025-02-05_at_13.03.32.png" data-expensify-height="408" data-expensify-width="980" />',
                text: '[Attachment]',
                isEdited: false,
                whisperedTo: [],
                isDeletedParentAction: false,
                deleted: '',
            },
        ],
        originalMessage: {
            html: '<img src="https://staging.expensify.com/chat-attachments/7006877151048865417/w_d060af4fb7ac4a815e6ed99df9ef8dd216fdd8c7.png.1024.jpg" data-expensify-source="https://staging.expensify.com/chat-attachments/7006877151048865417/w_d060af4fb7ac4a815e6ed99df9ef8dd216fdd8c7.png" data-name="Screenshot_2025-02-05_at_13.03.32.png" data-expensify-height="408" data-expensify-width="980" />',
            lastModified: '2025-02-05 07:29:21.593',
        },
        avatar: 'https://d1wpcgnaa73g0y.cloudfront.net/c751290e0b771edfe5a0f1eeaf6aea98baf7c70c.png',
        created: '2025-02-05 07:29:21.593',
        timestamp: 1738740561,
        reportActionTimestamp: 1738740561593,
        automatic: false,
        actionName: 'ADDCOMMENT',
        shouldShow: true,
        reportActionID: '7006877151048865417',
        lastModified: '2025-02-05 07:29:21.593',
        whisperedToAccountIDs: [],
    },
    _b);
describe('ReportAttachments', function () {
    beforeAll(function () {
        var _a, _b;
        react_native_onyx_1.default.init({
            keys: ONYXKEYS_1.default,
            initialKeyStates: (_a = {},
                _a[ONYXKEYS_1.default.SESSION] = { accountID: TEST_USER_ACCOUNT_ID, email: TEST_USER_LOGIN },
                _a[ONYXKEYS_1.default.PERSONAL_DETAILS_LIST] = (_b = {}, _b[TEST_USER_ACCOUNT_ID] = { accountID: TEST_USER_ACCOUNT_ID, login: TEST_USER_LOGIN }, _b),
                _a),
            evictableKeys: [ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS],
        });
    });
    beforeEach(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    global.fetch = (0, TestHelper_1.getGlobalFetchMock)();
                    (0, wrapOnyxWithWaitForBatchedUpdates_1.default)(react_native_onyx_1.default);
                    react_native_onyx_1.default.merge(ONYXKEYS_1.default.IS_LOADING_APP, false);
                    // Given a test user is signed in with Onyx setup and some initial data
                    return [4 /*yield*/, (0, TestHelper_1.signInWithTestUser)(TEST_USER_ACCOUNT_ID, TEST_USER_LOGIN)];
                case 1:
                    // Given a test user is signed in with Onyx setup and some initial data
                    _a.sent();
                    return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    afterEach(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, SequentialQueue_1.waitForIdle)()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, (0, react_native_1.act)(function () { return __awaiter(void 0, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, react_native_onyx_1.default.clear()];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                case 2:
                    _a.sent();
                    jest.clearAllMocks();
                    return [2 /*return*/];
            }
        });
    }); });
    it('should display the attachment if the source link is origin url', function () { return __awaiter(void 0, void 0, void 0, function () {
        var params;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportAttachmentID), reportAttachmentOnyx)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(reportAttachmentID), reportActionsAttachmentOnyx)];
                case 2:
                    _a.sent();
                    params = {
                        source: 'https://staging.expensify.com/chat-attachments/7006877151048865417/w_d060af4fb7ac4a815e6ed99df9ef8dd216fdd8c7.png',
                        type: 'r',
                        reportID: '7487537791562875',
                        isAuthTokenRequired: true,
                        originalFileName: 'Screenshot_2025-02-05_at_13.03.32.png',
                        accountID: TEST_USER_ACCOUNT_ID,
                    };
                    // And ReportAttachments is opened
                    renderPage(SCREENS_1.default.ATTACHMENTS, params);
                    return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                case 3:
                    _a.sent();
                    // Then the not here page and the loading spinner should not appear.
                    expect(react_native_1.screen.queryByText((0, Localize_1.translateLocal)('notFound.notHere'))).toBeNull();
                    expect(react_native_1.screen.queryByTestId('attachment-loading-spinner')).toBeNull();
                    return [2 /*return*/];
            }
        });
    }); });
    it('should fetch the report id, if the report has not yet been opened by the user', function () { return __awaiter(void 0, void 0, void 0, function () {
        var params, openReportRequest;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    params = {
                        source: 'https://staging.expensify.com/chat-attachments/7006877151048865417/w_d060af4fb7ac4a815e6ed99df9ef8dd216fdd8c7.png',
                        type: 'r',
                        reportID: '7487537791562875',
                        isAuthTokenRequired: true,
                        originalFileName: 'Screenshot_2025-02-05_at_13.03.32.png',
                        accountID: TEST_USER_ACCOUNT_ID,
                    };
                    // And ReportAttachments is opened
                    renderPage(SCREENS_1.default.ATTACHMENTS, params);
                    return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                case 1:
                    _a.sent();
                    openReportRequest = (0, TestHelper_1.getFetchMockCalls)(types_1.WRITE_COMMANDS.OPEN_REPORT).find(function (request) {
                        var _a;
                        var body = (_a = request[1]) === null || _a === void 0 ? void 0 : _a.body;
                        var requestParams = body instanceof FormData ? Object.fromEntries(body) : {};
                        return (requestParams === null || requestParams === void 0 ? void 0 : requestParams.reportID) === params.reportID;
                    });
                    // Then the report should fetched by OpenReport API command
                    expect(openReportRequest).toBeDefined();
                    return [2 /*return*/];
            }
        });
    }); });
});
