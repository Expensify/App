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
var NativeNavigation = require("@react-navigation/native");
var react_native_1 = require("@testing-library/react-native");
var react_1 = require("react");
var react_native_2 = require("react-native");
var react_native_onyx_1 = require("react-native-onyx");
var LocaleContextProvider_1 = require("@components/LocaleContextProvider");
var OnyxProvider_1 = require("@components/OnyxProvider");
var OptionListContextProvider_1 = require("@components/OptionListContextProvider");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var Localize_1 = require("@libs/Localize");
var NewChatPage_1 = require("@pages/NewChatPage");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var LHNTestUtils_1 = require("../utils/LHNTestUtils");
var waitForBatchedUpdates_1 = require("../utils/waitForBatchedUpdates");
var waitForBatchedUpdatesWithAct_1 = require("../utils/waitForBatchedUpdatesWithAct");
jest.mock('@react-navigation/native');
jest.mock('@src/libs/Navigation/navigationRef');
var wrapper = function (_a) {
    var children = _a.children;
    return (<OnyxProvider_1.default>
        <LocaleContextProvider_1.LocaleContextProvider>
            <OptionListContextProvider_1.default>
                <ScreenWrapper_1.default testID="test">{children}</ScreenWrapper_1.default>
            </OptionListContextProvider_1.default>
        </LocaleContextProvider_1.LocaleContextProvider>
    </OnyxProvider_1.default>);
};
describe('NewChatPage', function () {
    beforeAll(function () {
        react_native_onyx_1.default.init({
            keys: ONYXKEYS_1.default,
        });
        jest.spyOn(NativeNavigation, 'useRoute').mockReturnValue({ key: '', name: '' });
    });
    afterEach(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    jest.clearAllMocks();
                    return [4 /*yield*/, react_native_onyx_1.default.clear()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it('should scroll to top when adding a user to the group selection', function () { return __awaiter(void 0, void 0, void 0, function () {
        var spy, addButton;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, react_native_onyx_1.default.merge(ONYXKEYS_1.default.PERSONAL_DETAILS_LIST, LHNTestUtils_1.fakePersonalDetails)];
                case 1:
                    _a.sent();
                    (0, react_native_1.render)(<NewChatPage_1.default />, { wrapper: wrapper });
                    return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                case 2:
                    _a.sent();
                    (0, react_native_1.act)(function () {
                        NativeNavigation.triggerTransitionEnd();
                    });
                    spy = jest.spyOn(react_native_2.SectionList.prototype, 'scrollToLocation');
                    addButton = react_native_1.screen.getAllByText((0, Localize_1.translateLocal)('newChatPage.addToGroup')).at(0);
                    if (addButton) {
                        react_native_1.fireEvent.press(addButton);
                        expect(spy).toHaveBeenCalledWith(expect.objectContaining({ itemIndex: 0 }));
                    }
                    return [2 /*return*/];
            }
        });
    }); });
    describe('should not display "Add to group" button on expensify emails', function () {
        var excludedGroupEmails = CONST_1.default.EXPENSIFY_EMAILS.filter(function (value) { return value !== CONST_1.default.EMAIL.CONCIERGE && value !== CONST_1.default.EMAIL.NOTIFICATIONS; }).map(function (email) { return [email]; });
        it.each(excludedGroupEmails)('%s', function (email) { return __awaiter(void 0, void 0, void 0, function () {
            var input, userOption, addButton;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: 
                    // Given that a personal details list is initialized in Onyx
                    return [4 /*yield*/, react_native_onyx_1.default.merge(ONYXKEYS_1.default.PERSONAL_DETAILS_LIST, {
                            // eslint-disable-next-line @typescript-eslint/naming-convention
                            '1': { accountID: 1, login: email },
                        })];
                    case 1:
                        // Given that a personal details list is initialized in Onyx
                        _a.sent();
                        // And NewChatPage is opened
                        (0, react_native_1.render)(<NewChatPage_1.default />, { wrapper: wrapper });
                        return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                    case 2:
                        _a.sent();
                        (0, react_native_1.act)(function () {
                            NativeNavigation.triggerTransitionEnd();
                        });
                        input = react_native_1.screen.getByTestId('selection-list-text-input');
                        react_native_1.fireEvent.changeText(input, email);
                        // And waited for the user option to appear
                        return [4 /*yield*/, (0, react_native_1.waitFor)(function () {
                                expect(react_native_1.screen.getByLabelText(email)).toBeOnTheScreen();
                            })];
                    case 3:
                        // And waited for the user option to appear
                        _a.sent();
                        userOption = react_native_1.screen.getByLabelText(email);
                        addButton = (0, react_native_1.within)(userOption).queryByText((0, Localize_1.translateLocal)('newChatPage.addToGroup'));
                        expect(addButton).not.toBeOnTheScreen();
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
