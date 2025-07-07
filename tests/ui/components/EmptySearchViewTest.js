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
var react_native_1 = require("@testing-library/react-native");
var react_1 = require("react");
var react_native_onyx_1 = require("react-native-onyx");
var LocaleContextProvider_1 = require("@components/LocaleContextProvider");
var OnyxProvider_1 = require("@components/OnyxProvider");
var Localize_1 = require("@libs/Localize");
var EmptySearchView_1 = require("@pages/Search/EmptySearchView");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
// Wrapper component with OnyxProvider
function Wrapper(_a) {
    var children = _a.children;
    return (<OnyxProvider_1.default>
            <LocaleContextProvider_1.LocaleContextProvider>{children}</LocaleContextProvider_1.LocaleContextProvider>
        </OnyxProvider_1.default>);
}
describe('EmptySearchView', function () {
    afterEach(function () {
        jest.clearAllMocks();
    });
    beforeAll(function () {
        react_native_onyx_1.default.init({ keys: ONYXKEYS_1.default });
    });
    describe('type is Expense', function () {
        var dataType = CONST_1.default.SEARCH.DATA_TYPES.EXPENSE;
        it('should display correct buttons and subtitle when user has not clicked on "Take a test drive"', function () { return __awaiter(void 0, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: 
                    // Given user hasn't clicked on "Take a test drive" yet
                    return [4 /*yield*/, react_native_onyx_1.default.merge(ONYXKEYS_1.default.NVP_ONBOARDING, { selfTourViewed: false })];
                    case 1:
                        // Given user hasn't clicked on "Take a test drive" yet
                        _c.sent();
                        // Render component
                        (0, react_native_1.render)(<Wrapper>
                    <EmptySearchView_1.default hash={1} type={dataType} hasResults={false}/>
                </Wrapper>);
                        // Then it should display create expenses and take a test drive buttons
                        _a = expect;
                        return [4 /*yield*/, react_native_1.screen.findByText((0, Localize_1.translateLocal)('iou.createExpense'))];
                    case 2:
                        // Then it should display create expenses and take a test drive buttons
                        _a.apply(void 0, [_c.sent()]).toBeVisible();
                        _b = expect;
                        return [4 /*yield*/, react_native_1.screen.findByText((0, Localize_1.translateLocal)('emptySearchView.takeATestDrive'))];
                    case 3:
                        _b.apply(void 0, [_c.sent()]).toBeVisible();
                        // And correct modal subtitle
                        expect(react_native_1.screen.getByText((0, Localize_1.translateLocal)('search.searchResults.emptyExpenseResults.subtitle'))).toBeVisible();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should display correct buttons and subtitle when user already did "Take a test drive"', function () { return __awaiter(void 0, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: 
                    // Given user clicked on "Take a test drive"
                    return [4 /*yield*/, react_native_onyx_1.default.merge(ONYXKEYS_1.default.NVP_ONBOARDING, { selfTourViewed: true })];
                    case 1:
                        // Given user clicked on "Take a test drive"
                        _b.sent();
                        // Render component
                        (0, react_native_1.render)(<Wrapper>
                    <EmptySearchView_1.default hash={1} type={dataType} hasResults={false}/>
                </Wrapper>);
                        // Then it should display create expenses button
                        _a = expect;
                        return [4 /*yield*/, react_native_1.screen.findByText((0, Localize_1.translateLocal)('iou.createExpense'))];
                    case 2:
                        // Then it should display create expenses button
                        _a.apply(void 0, [_b.sent()]).toBeVisible();
                        expect(react_native_1.screen.queryByText((0, Localize_1.translateLocal)('emptySearchView.takeATestDrive'))).not.toBeOnTheScreen();
                        // And correct modal subtitle
                        expect(react_native_1.screen.getByText((0, Localize_1.translateLocal)('search.searchResults.emptyExpenseResults.subtitleWithOnlyCreateButton'))).toBeVisible();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('type is Invoice', function () {
        var dataType = CONST_1.default.SEARCH.DATA_TYPES.INVOICE;
        it('should display correct buttons and subtitle when user has not clicked on "Take a test drive"', function () { return __awaiter(void 0, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: 
                    // Given user hasn't clicked on "Take a test drive" yet
                    return [4 /*yield*/, react_native_onyx_1.default.merge(ONYXKEYS_1.default.NVP_ONBOARDING, { selfTourViewed: false })];
                    case 1:
                        // Given user hasn't clicked on "Take a test drive" yet
                        _c.sent();
                        // Render component
                        (0, react_native_1.render)(<Wrapper>
                    <EmptySearchView_1.default hash={1} type={dataType} hasResults={false}/>
                </Wrapper>);
                        // Then it should display send invoice and take a test drive buttons
                        _a = expect;
                        return [4 /*yield*/, react_native_1.screen.findByText((0, Localize_1.translateLocal)('workspace.invoices.sendInvoice'))];
                    case 2:
                        // Then it should display send invoice and take a test drive buttons
                        _a.apply(void 0, [_c.sent()]).toBeVisible();
                        _b = expect;
                        return [4 /*yield*/, react_native_1.screen.findByText((0, Localize_1.translateLocal)('emptySearchView.takeATestDrive'))];
                    case 3:
                        _b.apply(void 0, [_c.sent()]).toBeVisible();
                        // And correct modal subtitle
                        expect(react_native_1.screen.getByText((0, Localize_1.translateLocal)('search.searchResults.emptyInvoiceResults.subtitle'))).toBeVisible();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should display correct buttons and subtitle when user already did "Take a test drive"', function () { return __awaiter(void 0, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: 
                    // Given user clicked on "Take a test drive"
                    return [4 /*yield*/, react_native_onyx_1.default.merge(ONYXKEYS_1.default.NVP_ONBOARDING, { selfTourViewed: true })];
                    case 1:
                        // Given user clicked on "Take a test drive"
                        _b.sent();
                        // Render component
                        (0, react_native_1.render)(<Wrapper>
                    <EmptySearchView_1.default hash={1} type={dataType} hasResults={false}/>
                </Wrapper>);
                        // Then it should display Send invoice button
                        _a = expect;
                        return [4 /*yield*/, react_native_1.screen.findByText((0, Localize_1.translateLocal)('workspace.invoices.sendInvoice'))];
                    case 2:
                        // Then it should display Send invoice button
                        _a.apply(void 0, [_b.sent()]).toBeVisible();
                        expect(react_native_1.screen.queryByText((0, Localize_1.translateLocal)('emptySearchView.takeATestDrive'))).not.toBeOnTheScreen();
                        // And correct modal subtitle
                        expect(react_native_1.screen.getByText((0, Localize_1.translateLocal)('search.searchResults.emptyInvoiceResults.subtitleWithOnlyCreateButton'))).toBeVisible();
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
