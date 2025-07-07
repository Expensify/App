"use strict";
/* eslint-disable testing-library/no-node-access */
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
var react_native_1 = require("@testing-library/react-native");
var react_1 = require("react");
var react_native_onyx_1 = require("react-native-onyx");
var Localize_1 = require("@libs/Localize");
var App_1 = require("@userActions/App");
var User_1 = require("@userActions/User");
var App_2 = require("@src/App");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var PusherHelper_1 = require("../utils/PusherHelper");
var TestHelper = require("../utils/TestHelper");
var TestHelper_1 = require("../utils/TestHelper");
var waitForBatchedUpdates_1 = require("../utils/waitForBatchedUpdates");
var waitForBatchedUpdatesWithAct_1 = require("../utils/waitForBatchedUpdatesWithAct");
// We need a large timeout here as we are lazy loading React Navigation screens and this test is running against the entire mounted App
jest.setTimeout(50000);
jest.mock('../../src/components/ConfirmedRoute.tsx');
// Needed for: https://stackoverflow.com/questions/76903168/mocking-libraries-in-jest
jest.mock('react-native/Libraries/LogBox/LogBox', function () { return ({
    /* eslint-disable-next-line @typescript-eslint/naming-convention */
    __esModule: true,
    default: {
        ignoreLogs: jest.fn(),
        ignoreAllLogs: jest.fn(),
    },
}); });
/**
 * We need to keep track of the transitionEnd callback so we can trigger it in our tests
 */
var transitionEndCB;
jest.mock('@react-navigation/native');
TestHelper.setupApp();
var REPORT_ID = '1';
var USER_A_ACCOUNT_ID = 1;
var USER_A_EMAIL = 'user_a@test.com';
var USER_B_ACCOUNT_ID = 2;
var USER_B_EMAIL = 'user_b@test.com';
var USER_C_ACCOUNT_ID = 3;
var USER_C_EMAIL = 'user_c@test.com';
var USER_D_ACCOUNT_ID = 4;
var USER_D_EMAIL = 'user_d@test.com';
var USER_E_ACCOUNT_ID = 5;
var USER_E_EMAIL = 'user_e@test.com';
var USER_F_ACCOUNT_ID = 6;
var USER_F_EMAIL = 'user_f@test.com';
var USER_G_ACCOUNT_ID = 7;
var USER_G_EMAIL = 'user_g@test.com';
var USER_H_ACCOUNT_ID = 8;
var USER_H_EMAIL = 'user_h@test.com';
/**
 * Sets up a test with a logged in user. Returns the <App/> test instance.
 */
function signInAndGetApp(reportName, participantAccountIDs) {
    var _this = this;
    if (reportName === void 0) { reportName = ''; }
    // Render the App and sign in as a test user.
    (0, react_native_1.render)(<App_2.default />);
    var participants = {};
    participantAccountIDs === null || participantAccountIDs === void 0 ? void 0 : participantAccountIDs.forEach(function (id) {
        participants[id] = {
            notificationPreference: 'always',
            hidden: false,
            role: id === 1 ? CONST_1.default.REPORT.ROLE.ADMIN : CONST_1.default.REPORT.ROLE.MEMBER,
        };
    });
    return (0, waitForBatchedUpdatesWithAct_1.default)()
        .then(function () { return __awaiter(_this, void 0, void 0, function () {
        var hintText, loginForm;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                case 1:
                    _a.sent();
                    hintText = (0, Localize_1.translateLocal)('loginForm.loginForm');
                    loginForm = react_native_1.screen.queryAllByLabelText(hintText);
                    expect(loginForm).toHaveLength(1);
                    return [2 /*return*/];
            }
        });
    }); })
        .then(function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
        return [2 /*return*/, TestHelper.signInWithTestUser(USER_A_ACCOUNT_ID, USER_A_EMAIL, undefined, undefined, 'A')];
    }); }); })
        .then(function () {
        (0, User_1.subscribeToUserEvents)();
        return (0, waitForBatchedUpdates_1.default)();
    })
        .then(function () { return __awaiter(_this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: 
                // Simulate setting an unread report and personal details
                return [4 /*yield*/, Promise.all([
                        react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(REPORT_ID), {
                            reportID: REPORT_ID,
                            reportName: reportName,
                            lastMessageText: 'Test',
                            participants: participants,
                            lastActorAccountID: USER_B_ACCOUNT_ID,
                            type: CONST_1.default.REPORT.TYPE.CHAT,
                            chatType: CONST_1.default.REPORT.CHAT_TYPE.GROUP,
                        }),
                        react_native_onyx_1.default.merge(ONYXKEYS_1.default.PERSONAL_DETAILS_LIST, (_a = {},
                            _a[USER_A_ACCOUNT_ID] = TestHelper.buildPersonalDetails(USER_A_EMAIL, USER_A_ACCOUNT_ID, 'A'),
                            _a[USER_B_ACCOUNT_ID] = TestHelper.buildPersonalDetails(USER_B_EMAIL, USER_B_ACCOUNT_ID, 'B'),
                            _a[USER_C_ACCOUNT_ID] = TestHelper.buildPersonalDetails(USER_C_EMAIL, USER_C_ACCOUNT_ID, 'C'),
                            _a[USER_D_ACCOUNT_ID] = TestHelper.buildPersonalDetails(USER_D_EMAIL, USER_D_ACCOUNT_ID, 'D'),
                            _a[USER_E_ACCOUNT_ID] = TestHelper.buildPersonalDetails(USER_E_EMAIL, USER_E_ACCOUNT_ID, 'E'),
                            _a[USER_F_ACCOUNT_ID] = TestHelper.buildPersonalDetails(USER_F_EMAIL, USER_F_ACCOUNT_ID, 'F'),
                            _a[USER_G_ACCOUNT_ID] = TestHelper.buildPersonalDetails(USER_G_EMAIL, USER_G_ACCOUNT_ID, 'G'),
                            _a[USER_H_ACCOUNT_ID] = TestHelper.buildPersonalDetails(USER_H_EMAIL, USER_H_ACCOUNT_ID, 'H'),
                            _a)),
                    ])];
                case 1:
                    // Simulate setting an unread report and personal details
                    _b.sent();
                    // We manually setting the sidebar as loaded since the onLayout event does not fire in tests
                    (0, App_1.setSidebarLoaded)();
                    return [2 /*return*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
            }
        });
    }); });
}
/**
 * Tests for checking the group chat names at places like LHN, chat header, details page etc.
 * Note that limit of 5 names is only for the header.
 */
describe('Tests for group chat name', function () {
    beforeEach(function () {
        jest.clearAllMocks();
        // Unsubscribe to pusher channels
        PusherHelper_1.default.teardown();
        return react_native_onyx_1.default.clear().then(waitForBatchedUpdates_1.default);
    });
    var participantAccountIDs4 = [USER_A_ACCOUNT_ID, USER_B_ACCOUNT_ID, USER_C_ACCOUNT_ID, USER_D_ACCOUNT_ID];
    var participantAccountIDs8 = __spreadArray(__spreadArray([], participantAccountIDs4, true), [USER_E_ACCOUNT_ID, USER_F_ACCOUNT_ID, USER_G_ACCOUNT_ID, USER_H_ACCOUNT_ID], false);
    it('Should show correctly in LHN', function () {
        return signInAndGetApp('A, B, C, D', participantAccountIDs4).then(function () {
            // Verify the sidebar links are rendered
            var sidebarLinksHintText = (0, Localize_1.translateLocal)('sidebarScreen.listOfChats');
            var sidebarLinks = react_native_1.screen.queryAllByLabelText(sidebarLinksHintText);
            expect(sidebarLinks).toHaveLength(1);
            // Verify there is only one option in the sidebar
            var optionRows = react_native_1.screen.queryAllByAccessibilityHint(TestHelper.getNavigateToChatHintRegex());
            expect(optionRows).toHaveLength(1);
            var displayNameHintText = (0, Localize_1.translateLocal)('accessibilityHints.chatUserDisplayNames');
            var displayNameText = react_native_1.screen.queryByLabelText(displayNameHintText);
            return (0, react_native_1.waitFor)(function () { var _a, _b; return expect((_b = (_a = displayNameText === null || displayNameText === void 0 ? void 0 : displayNameText.props) === null || _a === void 0 ? void 0 : _a.children) === null || _b === void 0 ? void 0 : _b[0]).toBe('A, B, C, D'); });
        });
    });
    it('Should show correctly in LHN when report name is not present', function () {
        return signInAndGetApp('', participantAccountIDs4).then(function () {
            // Verify the sidebar links are rendered
            var sidebarLinksHintText = (0, Localize_1.translateLocal)('sidebarScreen.listOfChats');
            var sidebarLinks = react_native_1.screen.queryAllByLabelText(sidebarLinksHintText);
            expect(sidebarLinks).toHaveLength(1);
            // Verify there is only one option in the sidebar
            var optionRows = react_native_1.screen.queryAllByAccessibilityHint(TestHelper.getNavigateToChatHintRegex());
            expect(optionRows).toHaveLength(1);
            var displayNameHintText = (0, Localize_1.translateLocal)('accessibilityHints.chatUserDisplayNames');
            var displayNameText = react_native_1.screen.queryByLabelText(displayNameHintText);
            return (0, react_native_1.waitFor)(function () { var _a, _b; return expect((_b = (_a = displayNameText === null || displayNameText === void 0 ? void 0 : displayNameText.props) === null || _a === void 0 ? void 0 : _a.children) === null || _b === void 0 ? void 0 : _b[0]).toBe('A, B, C, D'); });
        });
    });
    it('Should show limited names with ellipsis in LHN when 8 participants are present', function () {
        return signInAndGetApp('', participantAccountIDs8).then(function () {
            // Verify the sidebar links are rendered
            var sidebarLinksHintText = (0, Localize_1.translateLocal)('sidebarScreen.listOfChats');
            var sidebarLinks = react_native_1.screen.queryAllByLabelText(sidebarLinksHintText);
            expect(sidebarLinks).toHaveLength(1);
            // Verify there is only one option in the sidebar
            var optionRows = react_native_1.screen.queryAllByAccessibilityHint(TestHelper.getNavigateToChatHintRegex());
            expect(optionRows).toHaveLength(1);
            var displayNameHintText = (0, Localize_1.translateLocal)('accessibilityHints.chatUserDisplayNames');
            var displayNameText = react_native_1.screen.queryByLabelText(displayNameHintText);
            return (0, react_native_1.waitFor)(function () { var _a, _b; return expect((_b = (_a = displayNameText === null || displayNameText === void 0 ? void 0 : displayNameText.props) === null || _a === void 0 ? void 0 : _a.children) === null || _b === void 0 ? void 0 : _b[0]).toBe('A, B, C, D, E...'); });
        });
    });
    it('Check if group name shows fine for report header', function () {
        return signInAndGetApp('', participantAccountIDs4)
            .then(function () {
            var _a, _b;
            // Verify the sidebar links are rendered
            var sidebarLinksHintText = (0, Localize_1.translateLocal)('sidebarScreen.listOfChats');
            var sidebarLinks = react_native_1.screen.queryAllByLabelText(sidebarLinksHintText);
            expect(sidebarLinks).toHaveLength(1);
            // Verify there is only one option in the sidebar
            var optionRows = react_native_1.screen.queryAllByAccessibilityHint(TestHelper.getNavigateToChatHintRegex());
            expect(optionRows).toHaveLength(1);
            var displayNameHintText = (0, Localize_1.translateLocal)('accessibilityHints.chatUserDisplayNames');
            var displayNameText = react_native_1.screen.queryByLabelText(displayNameHintText);
            expect((_b = (_a = displayNameText === null || displayNameText === void 0 ? void 0 : displayNameText.props) === null || _a === void 0 ? void 0 : _a.children) === null || _b === void 0 ? void 0 : _b[0]).toBe('A, B, C, D');
            return (0, TestHelper_1.navigateToSidebarOption)(0);
        })
            .then(waitForBatchedUpdates_1.default)
            .then(function () { return __awaiter(void 0, void 0, void 0, function () {
            var name, displayNameTexts;
            return __generator(this, function (_a) {
                (0, react_native_1.act)(function () { return transitionEndCB === null || transitionEndCB === void 0 ? void 0 : transitionEndCB(); });
                name = 'A, B, C, D';
                displayNameTexts = react_native_1.screen.queryAllByLabelText(name);
                return [2 /*return*/, (0, react_native_1.waitFor)(function () { return expect(displayNameTexts).toHaveLength(1); })];
            });
        }); });
    });
    it('Should show only 5 names with ellipsis when there are 8 participants in the report header', function () {
        return signInAndGetApp('', participantAccountIDs8)
            .then(function () { return __awaiter(void 0, void 0, void 0, function () {
            var sidebarLinksHintText, displayNameHintText;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: 
                    // Wait for sidebar to be rendered
                    return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                    case 1:
                        // Wait for sidebar to be rendered
                        _a.sent();
                        sidebarLinksHintText = (0, Localize_1.translateLocal)('sidebarScreen.listOfChats');
                        displayNameHintText = (0, Localize_1.translateLocal)('accessibilityHints.chatUserDisplayNames');
                        // Check sidebar links
                        return [4 /*yield*/, (0, react_native_1.waitFor)(function () {
                                var sidebarLinks = react_native_1.screen.queryAllByLabelText(sidebarLinksHintText);
                                expect(sidebarLinks).toHaveLength(1);
                            })];
                    case 2:
                        // Check sidebar links
                        _a.sent();
                        // Check option rows
                        return [4 /*yield*/, (0, react_native_1.waitFor)(function () {
                                var optionRows = react_native_1.screen.queryAllByAccessibilityHint(TestHelper.getNavigateToChatHintRegex());
                                expect(optionRows).toHaveLength(1);
                            })];
                    case 3:
                        // Check option rows
                        _a.sent();
                        // Check display name
                        return [4 /*yield*/, (0, react_native_1.waitFor)(function () {
                                var _a, _b;
                                var displayNameText = react_native_1.screen.queryByLabelText(displayNameHintText);
                                expect((_b = (_a = displayNameText === null || displayNameText === void 0 ? void 0 : displayNameText.props) === null || _a === void 0 ? void 0 : _a.children) === null || _b === void 0 ? void 0 : _b[0]).toBe('A, B, C, D, E...');
                            })];
                    case 4:
                        // Check display name
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); })
            .then(function () { return (0, TestHelper_1.navigateToSidebarOption)(0); })
            .then(waitForBatchedUpdates_1.default)
            .then(function () { return __awaiter(void 0, void 0, void 0, function () {
            var name, displayNameTexts;
            return __generator(this, function (_a) {
                (0, react_native_1.act)(function () { return transitionEndCB === null || transitionEndCB === void 0 ? void 0 : transitionEndCB(); });
                name = 'A, B, C, D, E...';
                displayNameTexts = react_native_1.screen.queryAllByLabelText(name);
                return [2 /*return*/, (0, react_native_1.waitFor)(function () { return expect(displayNameTexts).toHaveLength(1); })];
            });
        }); });
    });
    it('Should show exact name in header when report name is available with 4 participants', function () {
        return signInAndGetApp('Test chat', participantAccountIDs4)
            .then(function () {
            var _a, _b;
            // Verify the sidebar links are rendered
            var sidebarLinksHintText = (0, Localize_1.translateLocal)('sidebarScreen.listOfChats');
            var sidebarLinks = react_native_1.screen.queryAllByLabelText(sidebarLinksHintText);
            expect(sidebarLinks).toHaveLength(1);
            // Verify there is only one option in the sidebar
            var optionRows = react_native_1.screen.queryAllByAccessibilityHint(TestHelper.getNavigateToChatHintRegex());
            expect(optionRows).toHaveLength(1);
            var displayNameHintText = (0, Localize_1.translateLocal)('accessibilityHints.chatUserDisplayNames');
            var displayNameText = react_native_1.screen.queryByLabelText(displayNameHintText);
            expect((_b = (_a = displayNameText === null || displayNameText === void 0 ? void 0 : displayNameText.props) === null || _a === void 0 ? void 0 : _a.children) === null || _b === void 0 ? void 0 : _b[0]).toBe('Test chat');
            return (0, TestHelper_1.navigateToSidebarOption)(0);
        })
            .then(waitForBatchedUpdates_1.default)
            .then(function () { return __awaiter(void 0, void 0, void 0, function () {
            var name, displayNameTexts;
            return __generator(this, function (_a) {
                (0, react_native_1.act)(function () { return transitionEndCB === null || transitionEndCB === void 0 ? void 0 : transitionEndCB(); });
                name = 'Test chat';
                displayNameTexts = react_native_1.screen.queryAllByLabelText(name);
                return [2 /*return*/, (0, react_native_1.waitFor)(function () { return expect(displayNameTexts).toHaveLength(1); })];
            });
        }); });
    });
    it('Should show exact name in header when report name is available with 8 participants', function () {
        return signInAndGetApp("Let's talk", participantAccountIDs8)
            .then(function () {
            var _a, _b;
            // Verify the sidebar links are rendered
            var sidebarLinksHintText = (0, Localize_1.translateLocal)('sidebarScreen.listOfChats');
            var sidebarLinks = react_native_1.screen.queryAllByLabelText(sidebarLinksHintText);
            expect(sidebarLinks).toHaveLength(1);
            // Verify there is only one option in the sidebar
            var optionRows = react_native_1.screen.queryAllByAccessibilityHint(TestHelper.getNavigateToChatHintRegex());
            expect(optionRows).toHaveLength(1);
            var displayNameHintText = (0, Localize_1.translateLocal)('accessibilityHints.chatUserDisplayNames');
            var displayNameText = react_native_1.screen.queryByLabelText(displayNameHintText);
            expect((_b = (_a = displayNameText === null || displayNameText === void 0 ? void 0 : displayNameText.props) === null || _a === void 0 ? void 0 : _a.children) === null || _b === void 0 ? void 0 : _b[0]).toBe("Let's talk");
            return (0, TestHelper_1.navigateToSidebarOption)(0);
        })
            .then(waitForBatchedUpdates_1.default)
            .then(function () { return __awaiter(void 0, void 0, void 0, function () {
            var name, displayNameTexts;
            return __generator(this, function (_a) {
                (0, react_native_1.act)(function () { return transitionEndCB === null || transitionEndCB === void 0 ? void 0 : transitionEndCB(); });
                name = "Let's talk";
                displayNameTexts = react_native_1.screen.queryAllByLabelText(name);
                return [2 /*return*/, (0, react_native_1.waitFor)(function () { return expect(displayNameTexts).toHaveLength(1); })];
            });
        }); });
    });
    it('Should show last message preview in LHN', function () {
        return signInAndGetApp('A, B, C, D', participantAccountIDs4).then(function () {
            // Verify the sidebar links are rendered
            var sidebarLinksHintText = (0, Localize_1.translateLocal)('sidebarScreen.listOfChats');
            var sidebarLinks = react_native_1.screen.queryAllByLabelText(sidebarLinksHintText);
            expect(sidebarLinks).toHaveLength(1);
            // Verify there is only one option in the sidebar
            var optionRows = react_native_1.screen.queryAllByAccessibilityHint(TestHelper.getNavigateToChatHintRegex());
            expect(optionRows).toHaveLength(1);
            var lastChatHintText = (0, Localize_1.translateLocal)('accessibilityHints.lastChatMessagePreview');
            var lastChatText = react_native_1.screen.queryByLabelText(lastChatHintText);
            return (0, react_native_1.waitFor)(function () { var _a; return expect((_a = lastChatText === null || lastChatText === void 0 ? void 0 : lastChatText.props) === null || _a === void 0 ? void 0 : _a.children).toBe('B: Test'); });
        });
    });
    it('Should sort the names before displaying', function () {
        return signInAndGetApp('', __spreadArray([USER_E_ACCOUNT_ID], participantAccountIDs4, true)).then(function () {
            // Verify the sidebar links are rendered
            var sidebarLinksHintText = (0, Localize_1.translateLocal)('sidebarScreen.listOfChats');
            var sidebarLinks = react_native_1.screen.queryAllByLabelText(sidebarLinksHintText);
            expect(sidebarLinks).toHaveLength(1);
            // Verify there is only one option in the sidebar
            var optionRows = react_native_1.screen.queryAllByAccessibilityHint(TestHelper.getNavigateToChatHintRegex());
            expect(optionRows).toHaveLength(1);
            var displayNameHintText = (0, Localize_1.translateLocal)('accessibilityHints.chatUserDisplayNames');
            var displayNameText = react_native_1.screen.queryByLabelText(displayNameHintText);
            return (0, react_native_1.waitFor)(function () { var _a, _b; return expect((_b = (_a = displayNameText === null || displayNameText === void 0 ? void 0 : displayNameText.props) === null || _a === void 0 ? void 0 : _a.children) === null || _b === void 0 ? void 0 : _b[0]).toBe('A, B, C, D, E'); });
        });
    });
});
