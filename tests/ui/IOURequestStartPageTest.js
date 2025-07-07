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
var react_1 = require("react");
var react_native_onyx_1 = require("react-native-onyx");
var LocaleContextProvider_1 = require("@components/LocaleContextProvider");
var OnyxProvider_1 = require("@components/OnyxProvider");
var IOURequestStartPage_1 = require("@pages/iou/request/IOURequestStartPage");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var waitForBatchedUpdates_1 = require("../utils/waitForBatchedUpdates");
jest.mock('@userActions/Tab');
jest.mock('@rnmapbox/maps', function () { return ({
    default: jest.fn(),
    MarkerView: jest.fn(),
    setAccessToken: jest.fn(),
}); });
jest.mock('react-native-tab-view', function () { return ({
    TabView: 'TabView',
    SceneMap: jest.fn(),
    TabBar: 'TabBar',
}); });
jest.mock('@react-native-community/geolocation', function () { return ({
    setRNConfiguration: jest.fn(),
}); });
jest.mock('react-native-vision-camera', function () { return ({
    useCameraDevice: jest.fn(),
}); });
describe('IOURequestStartPage', function () {
    beforeAll(function () {
        react_native_onyx_1.default.init({
            keys: ONYXKEYS_1.default,
        });
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
    it('self DM track options should disappear when report moved to workspace', function () { return __awaiter(void 0, void 0, void 0, function () {
        var iouRequestType;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: 
                // Given no selected tab data in Onyx
                return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.SELECTED_TAB).concat(CONST_1.default.TAB.IOU_REQUEST_TYPE), null)];
                case 1:
                    // Given no selected tab data in Onyx
                    _a.sent();
                    // When the page is mounted with MANUAL tab
                    (0, react_native_1.render)(<OnyxProvider_1.default>
                <LocaleContextProvider_1.LocaleContextProvider>
                    <native_1.NavigationContainer>
                        <IOURequestStartPage_1.default route={{ params: { iouType: CONST_1.default.IOU.TYPE.SUBMIT, reportID: '1', transactionID: '' } }} report={undefined} reportDraft={undefined} navigation={{}} defaultSelectedTab={CONST_1.default.TAB_REQUEST.MANUAL}/>
                    </native_1.NavigationContainer>
                </LocaleContextProvider_1.LocaleContextProvider>
            </OnyxProvider_1.default>);
                    return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, new Promise(function (resolve) {
                            var connection = react_native_onyx_1.default.connect({
                                key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_DRAFT).concat(CONST_1.default.IOU.OPTIMISTIC_TRANSACTION_ID),
                                callback: function (val) {
                                    resolve(val === null || val === void 0 ? void 0 : val.iouRequestType);
                                    react_native_onyx_1.default.disconnect(connection);
                                },
                            });
                        })];
                case 3:
                    iouRequestType = _a.sent();
                    expect(iouRequestType).toBe(CONST_1.default.IOU.REQUEST_TYPE.MANUAL);
                    return [2 /*return*/];
            }
        });
    }); });
});
