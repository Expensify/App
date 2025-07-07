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
/**
 * @jest-environment node
 */
var OpenAIUtils_1 = require("@scripts/utils/OpenAIUtils");
var ChatGPTTranslator_1 = require("@scripts/utils/Translator/ChatGPTTranslator");
jest.mock('@scripts/utils/OpenAIUtils');
var MockedOpenAIUtils = OpenAIUtils_1.default;
describe('ChatGPTTranslator.performTranslation', function () {
    var apiKey = 'test-api-key';
    var targetLang = 'it';
    // eslint-disable-next-line no-template-curly-in-string
    var original = 'Hello ${name}!';
    // eslint-disable-next-line no-template-curly-in-string
    var validTranslation = '[it] Hello ${name}!';
    var invalidTranslation = '[it] Hello name!'; // missing ${...}
    var translator;
    beforeEach(function () {
        jest.clearAllMocks();
        MockedOpenAIUtils.prototype.promptChatCompletions = jest.fn();
        translator = new ChatGPTTranslator_1.default(apiKey);
    });
    it('retries if translated template has incorrect placeholders, then succeeds', function () { return __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // First attempt returns invalid placeholder format, second returns valid
                    MockedOpenAIUtils.prototype.promptChatCompletions.mockResolvedValueOnce(invalidTranslation).mockResolvedValueOnce(validTranslation);
                    return [4 /*yield*/, translator.performTranslation(targetLang, original)];
                case 1:
                    result = _a.sent();
                    // eslint-disable-next-line @typescript-eslint/unbound-method
                    expect(MockedOpenAIUtils.prototype.promptChatCompletions).toHaveBeenCalledTimes(2);
                    expect(result).toBe(validTranslation);
                    return [2 /*return*/];
            }
        });
    }); });
    it('returns original string after exceeding retry attempts', function () { return __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Always returns invalid
                    MockedOpenAIUtils.prototype.promptChatCompletions.mockResolvedValue(invalidTranslation);
                    return [4 /*yield*/, translator.performTranslation(targetLang, original)];
                case 1:
                    result = _a.sent();
                    // @ts-expect-error TS2341
                    // eslint-disable-next-line @typescript-eslint/unbound-method
                    expect(MockedOpenAIUtils.prototype.promptChatCompletions).toHaveBeenCalledTimes(ChatGPTTranslator_1.default.MAX_RETRIES + 1);
                    expect(result).toBe(original);
                    return [2 /*return*/];
            }
        });
    }); });
});
