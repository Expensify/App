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
var react_1 = require("react");
var react_native_onyx_1 = require("react-native-onyx");
var reassure_1 = require("reassure");
var ComposeProviders_1 = require("@src/components/ComposeProviders");
var LocaleContextProvider_1 = require("@src/components/LocaleContextProvider");
var OnyxProvider_1 = require("@src/components/OnyxProvider");
var withKeyboardState_1 = require("@src/components/withKeyboardState");
var Localize = require("@src/libs/Localize");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ReportActionCompose_1 = require("@src/pages/home/report/ReportActionCompose/ReportActionCompose");
var LHNTestUtils = require("../utils/LHNTestUtils");
var waitForBatchedUpdates_1 = require("../utils/waitForBatchedUpdates");
// mock PortalStateContext
jest.mock('@gorhom/portal');
jest.mock('react-native-reanimated', function () { return (__assign(__assign({}, jest.requireActual('react-native-reanimated/mock')), { useAnimatedRef: jest.fn(), LayoutAnimationConfig: function () {
        return function (_a) {
            var children = _a.children;
            return children;
        };
    } })); });
jest.mock('../../src/libs/Navigation/Navigation', function () { return ({
    navigate: jest.fn(),
    getReportRHPActiveRoute: jest.fn(),
}); });
jest.mock('@react-navigation/native', function () {
    var actualNav = jest.requireActual('@react-navigation/native');
    return __assign(__assign({}, actualNav), { useNavigation: function () { return ({
            navigate: jest.fn(),
            addListener: function () { return jest.fn(); },
        }); }, useIsFocused: function () { return true; }, useNavigationState: function () { }, useFocusEffect: jest.fn() });
});
jest.mock('@src/libs/actions/EmojiPickerAction', function () {
    var actualEmojiPickerAction = jest.requireActual('@src/libs/actions/EmojiPickerAction');
    return __assign(__assign({}, actualEmojiPickerAction), { emojiPickerRef: {
            current: {
                isEmojiPickerVisible: false,
            },
        }, showEmojiPicker: jest.fn(), hideEmojiPicker: jest.fn(), isActive: function () { return true; } });
});
beforeAll(function () {
    return react_native_onyx_1.default.init({
        keys: ONYXKEYS_1.default,
        evictableKeys: [ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS],
    });
});
// Initialize the network key for OfflineWithFeedback
beforeEach(function () {
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.NETWORK, { isOffline: false });
});
function ReportActionComposeWrapper() {
    return (<ComposeProviders_1.default components={[OnyxProvider_1.default, LocaleContextProvider_1.LocaleContextProvider, withKeyboardState_1.KeyboardStateProvider]}>
            <ReportActionCompose_1.default onSubmit={function () { return jest.fn(); }} reportID="1" disabled={false} report={LHNTestUtils.getFakeReport()} isComposerFullSize/>
        </ComposeProviders_1.default>);
}
var mockEvent = { preventDefault: jest.fn() };
test('[ReportActionCompose] should render Composer with text input interactions', function () { return __awaiter(void 0, void 0, void 0, function () {
    var scenario;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                scenario = function () { return __awaiter(void 0, void 0, void 0, function () {
                    var composer;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, react_native_1.screen.findByTestId('composer')];
                            case 1:
                                composer = _a.sent();
                                react_native_1.fireEvent.changeText(composer, '@test');
                                return [2 /*return*/];
                        }
                    });
                }); };
                return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
            case 1:
                _a.sent();
                return [4 /*yield*/, (0, reassure_1.measureRenders)(<ReportActionComposeWrapper />, { scenario: scenario })];
            case 2:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
test('[ReportActionCompose] should press create button', function () { return __awaiter(void 0, void 0, void 0, function () {
    var scenario;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                scenario = function () { return __awaiter(void 0, void 0, void 0, function () {
                    var hintAttachmentButtonText, createButton;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                hintAttachmentButtonText = Localize.translateLocal('common.create');
                                return [4 /*yield*/, react_native_1.screen.findByLabelText(hintAttachmentButtonText)];
                            case 1:
                                createButton = _a.sent();
                                react_native_1.fireEvent.press(createButton, mockEvent);
                                return [2 /*return*/];
                        }
                    });
                }); };
                return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
            case 1:
                _a.sent();
                return [4 /*yield*/, (0, reassure_1.measureRenders)(<ReportActionComposeWrapper />, { scenario: scenario })];
            case 2:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
test('[ReportActionCompose] should press send message button', function () { return __awaiter(void 0, void 0, void 0, function () {
    var scenario;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                scenario = function () { return __awaiter(void 0, void 0, void 0, function () {
                    var hintSendButtonText, sendButton;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                hintSendButtonText = Localize.translateLocal('common.send');
                                return [4 /*yield*/, react_native_1.screen.findByLabelText(hintSendButtonText)];
                            case 1:
                                sendButton = _a.sent();
                                react_native_1.fireEvent.press(sendButton);
                                return [2 /*return*/];
                        }
                    });
                }); };
                return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
            case 1:
                _a.sent();
                return [4 /*yield*/, (0, reassure_1.measureRenders)(<ReportActionComposeWrapper />, { scenario: scenario })];
            case 2:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
