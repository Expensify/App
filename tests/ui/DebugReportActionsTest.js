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
var LocaleContextProvider_1 = require("@components/LocaleContextProvider");
var OnyxProvider_1 = require("@components/OnyxProvider");
var DebugReportActions_1 = require("@pages/Debug/Report/DebugReportActions");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var policies_1 = require("../utils/collections/policies");
var reportActions_1 = require("../utils/collections/reportActions");
var reports_1 = require("../utils/collections/reports");
var waitForBatchedUpdatesWithAct_1 = require("../utils/waitForBatchedUpdatesWithAct");
jest.mock('@react-navigation/native', function () {
    var actualNav = jest.requireActual('@react-navigation/native');
    return __assign(__assign({}, actualNav), { useIsFocused: function () { return true; }, useFocusEffect: jest.fn() });
});
jest.mock('@src/libs/Navigation/Navigation', function () { return ({
    navigate: jest.fn(),
}); });
describe('DebugReportActions', function () {
    beforeAll(function () {
        react_native_onyx_1.default.init({
            keys: ONYXKEYS_1.default,
            evictableKeys: [ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS],
        });
        react_native_onyx_1.default.set(ONYXKEYS_1.default.NVP_PREFERRED_LOCALE, CONST_1.default.LOCALES.EN);
    });
    afterEach(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, react_native_onyx_1.default.clear()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it('should show no results message when search is empty', function () { return __awaiter(void 0, void 0, void 0, function () {
        var policyID, reportID, reportActionID, policy, report, reportActionL, input, _a;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    policyID = '12';
                    reportID = '1';
                    reportActionID = '123';
                    policy = (0, policies_1.default)(Number(policyID));
                    report = __assign(__assign({}, (0, reports_1.createRandomReport)(Number(reportID))), { chatType: CONST_1.default.REPORT.CHAT_TYPE.POLICY_ROOM, policyID: policyID });
                    reportActionL = __assign(__assign({}, (0, reportActions_1.default)(Number(reportActionID))), { reportID: reportID, message: {
                            html: '',
                            text: '',
                            type: '',
                        } });
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.NVP_PREFERRED_LOCALE), 'en')];
                case 1:
                    _c.sent();
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID), policy)];
                case 2:
                    _c.sent();
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID), report)];
                case 3:
                    _c.sent();
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(reportID), (_b = {},
                            _b[reportActionID] = reportActionL,
                            _b))];
                case 4:
                    _c.sent();
                    (0, react_native_1.render)(<OnyxProvider_1.default>
                <LocaleContextProvider_1.LocaleContextProvider>
                    <DebugReportActions_1.default reportID={reportID}/>
                </LocaleContextProvider_1.LocaleContextProvider>
            </OnyxProvider_1.default>);
                    return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                case 5:
                    _c.sent();
                    input = react_native_1.screen.getByTestId('selection-list-text-input');
                    react_native_1.fireEvent.changeText(input, 'Should show no results found');
                    _a = expect;
                    return [4 /*yield*/, react_native_1.screen.findByText('No results found')];
                case 6:
                    _a.apply(void 0, [_c.sent()]).toBeOnTheScreen();
                    return [2 /*return*/];
            }
        });
    }); });
});
