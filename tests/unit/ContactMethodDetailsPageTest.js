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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_1 = require("@testing-library/react-native");
var react_native_onyx_1 = require("react-native-onyx");
// eslint-disable-next-line no-restricted-syntax
var UserActions = require("@libs/actions/User");
var ContactMethodDetailsPage_1 = require("@pages/settings/Profile/Contacts/ContactMethodDetailsPage");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var TestHelper_1 = require("../utils/TestHelper");
var waitForBatchedUpdates_1 = require("../utils/waitForBatchedUpdates");
var waitForBatchedUpdatesWithAct_1 = require("../utils/waitForBatchedUpdatesWithAct");
jest.mock('@libs/Navigation/Navigation', function () { return ({
    goBack: jest.fn(),
}); });
jest.mock('@components/DelegateNoAccessModalProvider');
jest.mock('@libs/actions/User', function () {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    var originalModule = jest.requireActual('@libs/actions/User');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return __assign(__assign({}, originalModule), { resetContactMethodValidateCodeSentState: jest.fn() });
});
var fakeEmail = 'fake@gmail.com';
var mockRoute = {
    params: {
        backTo: '',
        contactMethod: fakeEmail,
    },
};
var mockLoginList = (_a = {},
    _a[fakeEmail] = {
        partnerName: 'expensify.com',
        partnerUserID: fakeEmail,
        validatedDate: 'fake-validatedDate',
    },
    _a);
describe('ContactMethodDetailsPage', function () {
    var mockFetch;
    beforeAll(function () {
        react_native_onyx_1.default.init({
            keys: ONYXKEYS_1.default,
        });
    });
    beforeEach(function () {
        global.fetch = (0, TestHelper_1.getGlobalFetchMock)();
        mockFetch = fetch;
        return react_native_onyx_1.default.clear().then(waitForBatchedUpdates_1.default);
    });
    function ContactMethodDetailsPageRenderer() {
        return (<ContactMethodDetailsPage_1.default 
        // @ts-expect-error - Ignoring type errors for testing purposes
        route={mockRoute}/>);
    }
    it('should not call resetContactMethodValidateCodeSentState when we got a delete pending field', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Given a login list with a validated contact method
                    react_native_onyx_1.default.merge(ONYXKEYS_1.default.LOGIN_LIST, mockLoginList);
                    return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                case 1:
                    _a.sent();
                    // Given the page is rendered
                    (0, react_native_1.render)(<ContactMethodDetailsPageRenderer />);
                    // When a deleteContactMethod called
                    UserActions.deleteContactMethod(fakeEmail, mockLoginList);
                    return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                case 2:
                    _a.sent();
                    // When the deletion is successful
                    mockFetch === null || mockFetch === void 0 ? void 0 : mockFetch.succeed();
                    return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                case 3:
                    _a.sent();
                    mockFetch === null || mockFetch === void 0 ? void 0 : mockFetch.resume();
                    return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                case 4:
                    _a.sent();
                    // Then resetContactMethodValidateCodeSentState should not be called
                    expect(UserActions.resetContactMethodValidateCodeSentState).not.toHaveBeenCalled();
                    return [2 /*return*/];
            }
        });
    }); });
});
