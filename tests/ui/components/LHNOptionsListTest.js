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
var native_1 = require("@react-navigation/native");
var react_native_1 = require("@testing-library/react-native");
var react_1 = require("react");
var react_native_onyx_1 = require("react-native-onyx");
var ComposeProviders_1 = require("@components/ComposeProviders");
var LHNOptionsList_1 = require("@components/LHNOptionsList/LHNOptionsList");
var LocaleContextProvider_1 = require("@components/LocaleContextProvider");
var OnyxProvider_1 = require("@components/OnyxProvider");
var ReportActionContextMenu_1 = require("@pages/home/report/ContextMenu/ReportActionContextMenu");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var LHNTestUtils_1 = require("../../utils/LHNTestUtils");
// Mock the context menu
jest.mock('@pages/home/report/ContextMenu/ReportActionContextMenu', function () { return ({
    showContextMenu: jest.fn(),
}); });
// Mock the useRootNavigationState hook
jest.mock('@src/hooks/useRootNavigationState');
// Mock navigation hooks
var mockUseIsFocused = jest.fn().mockReturnValue(false);
jest.mock('@react-navigation/native', function () {
    var actualNav = jest.requireActual('@react-navigation/native');
    return __assign(__assign({}, actualNav), { 
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        useIsFocused: function () { return mockUseIsFocused(); }, useRoute: jest.fn(), useNavigationState: jest.fn(), createNavigationContainerRef: function () { return ({
            getState: function () { return jest.fn(); },
        }); } });
});
var getReportItem = function (reportID) {
    return react_native_1.screen.findByTestId(reportID);
};
var getReportItemButton = function () {
    return react_native_1.userEvent.setup();
};
describe('LHNOptionsList', function () {
    var mockReport = (0, LHNTestUtils_1.getFakeReport)([1, 2], 0, false);
    var defaultProps = {
        data: [mockReport],
        onSelectRow: jest.fn(),
        optionMode: CONST_1.default.OPTION_MODE.DEFAULT,
        onFirstItemRendered: jest.fn(),
    };
    var getLHNOptionsListElement = function (props) {
        var _a, _b, _c, _d;
        if (props === void 0) { props = {}; }
        var mergedProps = {
            data: (_a = props.data) !== null && _a !== void 0 ? _a : defaultProps.data,
            onSelectRow: (_b = props.onSelectRow) !== null && _b !== void 0 ? _b : defaultProps.onSelectRow,
            optionMode: (_c = props.optionMode) !== null && _c !== void 0 ? _c : defaultProps.optionMode,
            onFirstItemRendered: (_d = props.onFirstItemRendered) !== null && _d !== void 0 ? _d : defaultProps.onFirstItemRendered,
        };
        return (<native_1.NavigationContainer>
                <ComposeProviders_1.default components={[OnyxProvider_1.default, LocaleContextProvider_1.LocaleContextProvider]}>
                    <LHNOptionsList_1.default data={mergedProps.data} onSelectRow={mergedProps.onSelectRow} optionMode={mergedProps.optionMode} onFirstItemRendered={mergedProps.onFirstItemRendered}/>
                </ComposeProviders_1.default>
            </native_1.NavigationContainer>);
    };
    beforeEach(function () {
        react_native_onyx_1.default.init({
            keys: ONYXKEYS_1.default,
        });
        jest.clearAllMocks();
    });
    afterEach(function () {
        return react_native_onyx_1.default.clear();
    });
    it('shows context menu on long press', function () { return __awaiter(void 0, void 0, void 0, function () {
        var reportItem, user;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Given the screen is focused.
                    mockUseIsFocused.mockReturnValue(true);
                    // Given the LHNOptionsList is rendered with a report.
                    (0, react_native_1.render)(getLHNOptionsListElement());
                    return [4 /*yield*/, (0, react_native_1.waitFor)(function () { return getReportItem(mockReport.reportID); })];
                case 1:
                    reportItem = _a.sent();
                    expect(reportItem).toBeTruthy();
                    user = getReportItemButton();
                    return [4 /*yield*/, user.longPress(reportItem)];
                case 2:
                    _a.sent();
                    // Then wait for all state updates to complete and verify the context menu is shown
                    return [4 /*yield*/, (0, react_native_1.waitFor)(function () {
                            expect(ReportActionContextMenu_1.showContextMenu).toHaveBeenCalledWith(expect.objectContaining({
                                type: CONST_1.default.CONTEXT_MENU_TYPES.REPORT,
                                report: expect.objectContaining({
                                    reportID: mockReport.reportID,
                                }),
                            }));
                        })];
                case 3:
                    // Then wait for all state updates to complete and verify the context menu is shown
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it('does not show context menu when screen is not focused', function () { return __awaiter(void 0, void 0, void 0, function () {
        var reportItem, user;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Given the screen is not focused.
                    mockUseIsFocused.mockReturnValue(false);
                    // When the LHNOptionsList is rendered.
                    (0, react_native_1.render)(getLHNOptionsListElement());
                    return [4 /*yield*/, (0, react_native_1.waitFor)(function () { return getReportItem(mockReport.reportID); })];
                case 1:
                    reportItem = _a.sent();
                    expect(reportItem).toBeTruthy();
                    user = getReportItemButton();
                    return [4 /*yield*/, user.longPress(reportItem)];
                case 2:
                    _a.sent();
                    // Then wait for all state updates to complete and verify the context menu is not shown
                    return [4 /*yield*/, (0, react_native_1.waitFor)(function () {
                            expect(ReportActionContextMenu_1.showContextMenu).not.toHaveBeenCalled();
                        })];
                case 3:
                    // Then wait for all state updates to complete and verify the context menu is not shown
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it('shows context menu after returning from chat', function () { return __awaiter(void 0, void 0, void 0, function () {
        var rerender, reportItem, user;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Given the screen is focused.
                    mockUseIsFocused.mockReturnValue(true);
                    rerender = (0, react_native_1.render)(getLHNOptionsListElement()).rerender;
                    return [4 /*yield*/, (0, react_native_1.waitFor)(function () { return getReportItem(mockReport.reportID); })];
                case 1:
                    reportItem = _a.sent();
                    expect(reportItem).toBeTruthy();
                    // When the user navigates to chat and back by re-rendering with different focus state
                    rerender(getLHNOptionsListElement());
                    // When the user re-renders again to simulate returning to the screen
                    rerender(getLHNOptionsListElement());
                    user = getReportItemButton();
                    return [4 /*yield*/, user.longPress(reportItem)];
                case 2:
                    _a.sent();
                    // Then wait for all state updates to complete and verify the context menu is shown
                    return [4 /*yield*/, (0, react_native_1.waitFor)(function () {
                            expect(ReportActionContextMenu_1.showContextMenu).toHaveBeenCalledWith(expect.objectContaining({
                                type: CONST_1.default.CONTEXT_MENU_TYPES.REPORT,
                                report: expect.objectContaining({
                                    reportID: mockReport.reportID,
                                }),
                            }));
                        })];
                case 3:
                    // Then wait for all state updates to complete and verify the context menu is shown
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
});
