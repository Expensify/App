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
var react_native_onyx_1 = require("react-native-onyx");
var types_1 = require("@libs/API/types");
var CONST_1 = require("@src/CONST");
var OnyxUpdates = require("@src/libs/actions/OnyxUpdates");
var DateUtils_1 = require("@src/libs/DateUtils");
var NumberUtils = require("@src/libs/NumberUtils");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var getOnyxValue_1 = require("../utils/getOnyxValue");
var waitForBatchedUpdates_1 = require("../utils/waitForBatchedUpdates");
describe('OnyxUpdatesTest', function () {
    beforeAll(function () {
        react_native_onyx_1.default.init({
            keys: ONYXKEYS_1.default,
        });
    });
    beforeEach(function () { return react_native_onyx_1.default.clear().then(waitForBatchedUpdates_1.default); });
    it('applies Airship Onyx updates correctly', function () {
        var _a;
        var reportID = NumberUtils.rand64();
        var reportActionID = NumberUtils.rand64();
        var created = DateUtils_1.default.getDBTime();
        var reportValue = { reportID: reportID };
        var reportActionValue = (_a = {},
            _a[reportActionID] = {
                reportActionID: reportActionID,
                created: created,
            },
            _a);
        // Given an onyx update from an Airship push notification
        var airshipUpdates = {
            type: CONST_1.default.ONYX_UPDATE_TYPES.AIRSHIP,
            previousUpdateID: 0,
            lastUpdateID: 1,
            updates: [
                {
                    eventType: '',
                    data: [
                        {
                            onyxMethod: 'merge',
                            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID),
                            value: reportValue,
                        },
                        {
                            onyxMethod: 'merge',
                            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(reportID),
                            value: reportActionValue,
                            shouldShowPushNotification: true,
                        },
                    ],
                },
            ],
        };
        // When we apply the updates, then their values are updated correctly
        return OnyxUpdates.apply(airshipUpdates)
            .then(function () { return getOnyxValues("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID), "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(reportID)); })
            .then(function (_a) {
            var report = _a[0], reportAction = _a[1];
            expect(report).toStrictEqual(reportValue);
            expect(reportAction).toStrictEqual(reportActionValue);
        });
    });
    it('applies full ReconnectApp Onyx updates even if they appear old', function () { return __awaiter(void 0, void 0, void 0, function () {
        var currentUpdateID, reportID, reportValue, fullReconnectUpdates, report;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    currentUpdateID = 100;
                    return [4 /*yield*/, react_native_onyx_1.default.merge(ONYXKEYS_1.default.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT, currentUpdateID)];
                case 1:
                    _a.sent();
                    reportID = NumberUtils.rand64();
                    reportValue = { reportID: reportID };
                    fullReconnectUpdates = {
                        type: CONST_1.default.ONYX_UPDATE_TYPES.HTTPS,
                        request: {
                            command: types_1.SIDE_EFFECT_REQUEST_COMMANDS.RECONNECT_APP,
                            data: {
                                updateIDFrom: null,
                            },
                        },
                        response: {
                            onyxData: [
                                {
                                    onyxMethod: 'merge',
                                    key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID),
                                    value: reportValue,
                                },
                            ],
                        },
                        previousUpdateID: currentUpdateID - 2,
                        lastUpdateID: currentUpdateID - 1,
                    };
                    // When we apply the updates, then they are still applied even if the lastUpdateID is old
                    return [4 /*yield*/, OnyxUpdates.apply(fullReconnectUpdates)];
                case 2:
                    // When we apply the updates, then they are still applied even if the lastUpdateID is old
                    _a.sent();
                    return [4 /*yield*/, (0, getOnyxValue_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID))];
                case 3:
                    report = _a.sent();
                    expect(report).toStrictEqual(reportValue);
                    return [2 /*return*/];
            }
        });
    }); });
});
function getOnyxValues() {
    var keys = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        keys[_i] = arguments[_i];
    }
    return Promise.all(keys.map(function (key) { return (0, getOnyxValue_1.default)(key); }));
}
