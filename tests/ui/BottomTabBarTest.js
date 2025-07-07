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
var native_1 = require("@react-navigation/native");
var react_native_1 = require("@testing-library/react-native");
var react_native_onyx_1 = require("react-native-onyx");
var ComposeProviders_1 = require("@components/ComposeProviders");
var LocaleContextProvider_1 = require("@components/LocaleContextProvider");
var DebugTabView_1 = require("@components/Navigation/DebugTabView");
var NavigationTabBar_1 = require("@components/Navigation/NavigationTabBar");
var NAVIGATION_TABS_1 = require("@components/Navigation/NavigationTabBar/NAVIGATION_TABS");
var OnyxProvider_1 = require("@components/OnyxProvider");
var useSidebarOrderedReports_1 = require("@hooks/useSidebarOrderedReports");
var OnyxDerived_1 = require("@userActions/OnyxDerived");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
jest.mock('@src/hooks/useRootNavigationState');
describe('NavigationTabBar', function () {
    beforeAll(function () {
        react_native_onyx_1.default.init({ keys: ONYXKEYS_1.default });
        (0, OnyxDerived_1.default)();
        react_native_onyx_1.default.set(ONYXKEYS_1.default.NVP_PREFERRED_LOCALE, CONST_1.default.LOCALES.EN);
    });
    beforeEach(function () {
        react_native_onyx_1.default.clear([ONYXKEYS_1.default.NVP_PREFERRED_LOCALE]);
    });
    describe('Home tab', function () {
        describe('Debug mode enabled', function () {
            beforeEach(function () {
                react_native_onyx_1.default.set(ONYXKEYS_1.default.ACCOUNT, { isDebugModeEnabled: true });
            });
            describe('Has GBR', function () {
                it('renders DebugTabView', function () { return __awaiter(void 0, void 0, void 0, function () {
                    var _a;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0: return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT, "1"), {
                                    reportID: '1',
                                    reportName: 'My first report',
                                    chatType: CONST_1.default.REPORT.CHAT_TYPE.SELF_DM,
                                    type: CONST_1.default.REPORT.TYPE.CHAT,
                                    hasOutstandingChildTask: true,
                                    lastMessageText: 'Hello world!',
                                })];
                            case 1:
                                _b.sent();
                                (0, react_native_1.render)(<ComposeProviders_1.default components={[OnyxProvider_1.default, LocaleContextProvider_1.LocaleContextProvider, useSidebarOrderedReports_1.SidebarOrderedReportsContextProvider]}>
                            <native_1.NavigationContainer>
                                <NavigationTabBar_1.default selectedTab={NAVIGATION_TABS_1.default.HOME}/>
                            </native_1.NavigationContainer>
                        </ComposeProviders_1.default>);
                                _a = expect;
                                return [4 /*yield*/, react_native_1.screen.findByTestId(DebugTabView_1.default.displayName)];
                            case 2:
                                _a.apply(void 0, [_b.sent()]).toBeOnTheScreen();
                                return [2 /*return*/];
                        }
                    });
                }); });
            });
            describe('Has RBR', function () {
                it('renders DebugTabView', function () { return __awaiter(void 0, void 0, void 0, function () {
                    var _a;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0: return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT, "1"), {
                                    reportID: '1',
                                    reportName: 'My first report',
                                    chatType: CONST_1.default.REPORT.CHAT_TYPE.SELF_DM,
                                    type: CONST_1.default.REPORT.TYPE.CHAT,
                                    errorFields: {
                                        error: {
                                            message: 'Some error occurred!',
                                        },
                                    },
                                    lastMessageText: 'Hello world!',
                                })];
                            case 1:
                                _b.sent();
                                (0, react_native_1.render)(<ComposeProviders_1.default components={[OnyxProvider_1.default, LocaleContextProvider_1.LocaleContextProvider, useSidebarOrderedReports_1.SidebarOrderedReportsContextProvider]}>
                            <native_1.NavigationContainer>
                                <NavigationTabBar_1.default selectedTab={NAVIGATION_TABS_1.default.HOME}/>
                            </native_1.NavigationContainer>
                        </ComposeProviders_1.default>);
                                _a = expect;
                                return [4 /*yield*/, react_native_1.screen.findByTestId(DebugTabView_1.default.displayName)];
                            case 2:
                                _a.apply(void 0, [_b.sent()]).toBeOnTheScreen();
                                return [2 /*return*/];
                        }
                    });
                }); });
            });
        });
    });
    describe('Settings tab', function () {
        describe('Debug mode enabled', function () {
            beforeEach(function () {
                react_native_onyx_1.default.set(ONYXKEYS_1.default.ACCOUNT, { isDebugModeEnabled: true });
            });
            describe('Has GBR', function () {
                it('renders DebugTabView', function () { return __awaiter(void 0, void 0, void 0, function () {
                    var _a;
                    var _b;
                    return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0: return [4 /*yield*/, react_native_onyx_1.default.multiSet((_b = {},
                                    _b[ONYXKEYS_1.default.SESSION] = {
                                        email: 'foo@bar.com',
                                    },
                                    _b[ONYXKEYS_1.default.LOGIN_LIST] = {
                                        // eslint-disable-next-line @typescript-eslint/naming-convention
                                        'foo@bar.com': {
                                            partnerUserID: 'john.doe@mail.com',
                                            validatedDate: undefined,
                                        },
                                    },
                                    _b))];
                            case 1:
                                _c.sent();
                                (0, react_native_1.render)(<ComposeProviders_1.default components={[OnyxProvider_1.default, LocaleContextProvider_1.LocaleContextProvider, useSidebarOrderedReports_1.SidebarOrderedReportsContextProvider]}>
                            <native_1.NavigationContainer>
                                <NavigationTabBar_1.default selectedTab={NAVIGATION_TABS_1.default.SETTINGS}/>
                            </native_1.NavigationContainer>{' '}
                        </ComposeProviders_1.default>);
                                _a = expect;
                                return [4 /*yield*/, react_native_1.screen.findByTestId(DebugTabView_1.default.displayName)];
                            case 2:
                                _a.apply(void 0, [_c.sent()]).toBeOnTheScreen();
                                return [2 /*return*/];
                        }
                    });
                }); });
            });
            describe('Has RBR', function () {
                it('renders DebugTabView', function () { return __awaiter(void 0, void 0, void 0, function () {
                    var _a;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0: return [4 /*yield*/, react_native_onyx_1.default.set(ONYXKEYS_1.default.LOGIN_LIST, {
                                    // eslint-disable-next-line @typescript-eslint/naming-convention
                                    'foo@bar.com': {
                                        partnerUserID: 'john.doe@mail.com',
                                        errorFields: {
                                            partnerName: {
                                                message: 'Partner name is missing!',
                                            },
                                        },
                                    },
                                })];
                            case 1:
                                _b.sent();
                                (0, react_native_1.render)(<ComposeProviders_1.default components={[OnyxProvider_1.default, LocaleContextProvider_1.LocaleContextProvider, useSidebarOrderedReports_1.SidebarOrderedReportsContextProvider]}>
                            <native_1.NavigationContainer>
                                <NavigationTabBar_1.default selectedTab={NAVIGATION_TABS_1.default.SETTINGS}/>
                            </native_1.NavigationContainer>{' '}
                        </ComposeProviders_1.default>);
                                _a = expect;
                                return [4 /*yield*/, react_native_1.screen.findByTestId(DebugTabView_1.default.displayName)];
                            case 2:
                                _a.apply(void 0, [_b.sent()]).toBeOnTheScreen();
                                return [2 /*return*/];
                        }
                    });
                }); });
            });
        });
    });
});
