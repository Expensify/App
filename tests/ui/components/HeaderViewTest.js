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
var HeaderView_1 = require("@pages/home/HeaderView");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var reports_1 = require("../../utils/collections/reports");
var waitForBatchedUpdates_1 = require("../../utils/waitForBatchedUpdates");
jest.mock('@react-navigation/native', function () {
    var actualNav = jest.requireActual('@react-navigation/native');
    return __assign(__assign({}, actualNav), { useRoute: function () { return jest.fn(); } });
});
jest.mock('@hooks/useCurrentUserPersonalDetails');
describe('HeaderView', function () {
    afterEach(function () {
        jest.clearAllMocks();
    });
    beforeAll(function () {
        react_native_onyx_1.default.init({ keys: ONYXKEYS_1.default });
    });
    it('should update invoice room title when the invoice receiver detail is updated', function () { return __awaiter(void 0, void 0, void 0, function () {
        var chatReportID, accountID, displayName, report;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    chatReportID = '1';
                    accountID = 2;
                    displayName = 'test';
                    report = __assign(__assign({}, (0, reports_1.createRandomReport)(Number(chatReportID))), { chatType: CONST_1.default.REPORT.CHAT_TYPE.INVOICE, invoiceReceiver: {
                            accountID: accountID,
                            type: CONST_1.default.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL,
                        } });
                    return [4 /*yield*/, react_native_onyx_1.default.merge(ONYXKEYS_1.default.PERSONAL_DETAILS_LIST, (_a = {},
                            _a[accountID] = {
                                displayName: displayName,
                            },
                            _a))];
                case 1:
                    _c.sent();
                    (0, react_native_1.render)(<HeaderView_1.default report={report} onNavigationMenuButtonClicked={function () { }} parentReportAction={null} reportID={report.reportID}/>);
                    return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                case 2:
                    _c.sent();
                    expect(react_native_1.screen.getByTestId('DisplayNames')).toHaveTextContent(displayName);
                    // When the invoice receiver display name is updated
                    displayName = 'test edit';
                    return [4 /*yield*/, react_native_onyx_1.default.merge(ONYXKEYS_1.default.PERSONAL_DETAILS_LIST, (_b = {},
                            _b[accountID] = {
                                displayName: displayName,
                            },
                            _b))];
                case 3:
                    _c.sent();
                    // Then the header title should be updated using the new display name
                    expect(react_native_1.screen.getByTestId('DisplayNames')).toHaveTextContent(displayName);
                    return [2 /*return*/];
            }
        });
    }); });
});
