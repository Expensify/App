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
var LocaleContextProvider_1 = require("@components/LocaleContextProvider");
var OnyxProvider_1 = require("@components/OnyxProvider");
var IOURequestStepConfirmation_1 = require("@pages/iou/request/step/IOURequestStepConfirmation");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var IOU = require("../../../src/libs/actions/IOU");
var waitForBatchedUpdates_1 = require("../../utils/waitForBatchedUpdates");
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
jest.mock('@libs/actions/IOU', function () {
    var actualNav = jest.requireActual('@libs/actions/IOU');
    return __assign(__assign({}, actualNav), { startMoneyRequest: jest.fn() });
});
jest.mock('@libs/Fullstory');
jest.mock('@components/ProductTrainingContext', function () { return ({
    useProductTrainingContext: function () { return [false]; },
}); });
jest.mock('@components/Tooltip/EducationalTooltip');
jest.mock('@src/hooks/useResponsiveLayout');
jest.mock('@react-navigation/native', function () { return ({
    createNavigationContainerRef: jest.fn(),
    useIsFocused: function () { return true; },
    useNavigation: function () { return ({ navigate: jest.fn(), addListener: jest.fn() }); },
    useFocusEffect: jest.fn(),
    usePreventRemove: jest.fn(),
}); });
describe('IOURequestStepConfirmationPageTest', function () {
    beforeAll(function () {
        react_native_onyx_1.default.init({ keys: ONYXKEYS_1.default });
    });
    it('should not restart the money request creation flow when sending invoice from global FAB', function () { return __awaiter(void 0, void 0, void 0, function () {
        var TRANSACTION_ID, routeReportID, participantReportID;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    TRANSACTION_ID = '1';
                    routeReportID = '1';
                    participantReportID = '2';
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_DRAFT).concat(TRANSACTION_ID), {
                            transactionID: TRANSACTION_ID,
                            isFromGlobalCreate: true,
                            participants: [
                                {
                                    accountID: 1,
                                    reportID: participantReportID,
                                    iouType: 'invoice',
                                },
                            ],
                        })];
                case 1:
                    _a.sent();
                    (0, react_native_1.render)(<OnyxProvider_1.default>
                <LocaleContextProvider_1.LocaleContextProvider>
                    <IOURequestStepConfirmation_1.default route={{
                            key: 'Money_Request_Step_Confirmation--30aPPAdjWan56sE5OpcG',
                            name: 'Money_Request_Step_Confirmation',
                            params: {
                                action: 'create',
                                iouType: 'invoice',
                                transactionID: TRANSACTION_ID,
                                reportID: routeReportID,
                            },
                        }} 
                    // @ts-expect-error we don't need navigation param here.
                    navigation={undefined}/>
                </LocaleContextProvider_1.LocaleContextProvider>
            </OnyxProvider_1.default>);
                    return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                case 2:
                    _a.sent();
                    // Then startMoneyRequest should not be called from IOURequestConfirmationPage.
                    expect(IOU.startMoneyRequest).not.toBeCalled();
                    return [2 /*return*/];
            }
        });
    }); });
});
