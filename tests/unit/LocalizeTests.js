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
var IntlStore_1 = require("@src/languages/IntlStore");
var CONST_1 = require("../../src/CONST");
var Localize = require("../../src/libs/Localize");
var ONYXKEYS_1 = require("../../src/ONYXKEYS");
var waitForBatchedUpdates_1 = require("../utils/waitForBatchedUpdates");
describe('localize', function () {
    beforeAll(function () {
        react_native_onyx_1.default.init({
            keys: {
                NVP_PREFERRED_LOCALE: ONYXKEYS_1.default.NVP_PREFERRED_LOCALE,
                ARE_TRANSLATIONS_LOADING: ONYXKEYS_1.default.ARE_TRANSLATIONS_LOADING,
            },
        });
        return (0, waitForBatchedUpdates_1.default)();
    });
    afterEach(function () { return react_native_onyx_1.default.clear(); });
    describe('formatList', function () {
        var _a, _b, _c, _d, _e;
        test.each([
            [
                [],
                (_a = {},
                    _a[CONST_1.default.LOCALES.DEFAULT] = '',
                    _a[CONST_1.default.LOCALES.ES] = '',
                    _a),
            ],
            [
                ['rory'],
                (_b = {},
                    _b[CONST_1.default.LOCALES.DEFAULT] = 'rory',
                    _b[CONST_1.default.LOCALES.ES] = 'rory',
                    _b),
            ],
            [
                ['rory', 'vit'],
                (_c = {},
                    _c[CONST_1.default.LOCALES.DEFAULT] = 'rory and vit',
                    _c[CONST_1.default.LOCALES.ES] = 'rory y vit',
                    _c),
            ],
            [
                ['rory', 'vit', 'jules'],
                (_d = {},
                    _d[CONST_1.default.LOCALES.DEFAULT] = 'rory, vit, and jules',
                    _d[CONST_1.default.LOCALES.ES] = 'rory, vit y jules',
                    _d),
            ],
            [
                ['rory', 'vit', 'ionatan'],
                (_e = {},
                    _e[CONST_1.default.LOCALES.DEFAULT] = 'rory, vit, and ionatan',
                    _e[CONST_1.default.LOCALES.ES] = 'rory, vit e ionatan',
                    _e),
            ],
        ])('formatList(%s)', function (input_1, _a) { return __awaiter(void 0, [input_1, _a], void 0, function (input, _b) {
            var _c = CONST_1.default.LOCALES.DEFAULT, expectedOutput = _b[_c], _d = CONST_1.default.LOCALES.ES, expectedOutputES = _b[_d];
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0: return [4 /*yield*/, IntlStore_1.default.load(CONST_1.default.LOCALES.EN)];
                    case 1:
                        _e.sent();
                        expect(Localize.formatList(input)).toBe(expectedOutput);
                        return [4 /*yield*/, IntlStore_1.default.load(CONST_1.default.LOCALES.ES)];
                    case 2:
                        _e.sent();
                        expect(Localize.formatList(input)).toBe(expectedOutputES);
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
