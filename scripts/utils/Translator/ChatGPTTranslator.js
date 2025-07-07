"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var dedent_1 = require("@libs/StringUtils/dedent");
var base_1 = require("@prompts/translation/base");
var context_1 = require("@prompts/translation/context");
var OpenAIUtils_1 = require("../OpenAIUtils");
var Translator_1 = require("./Translator");
var ChatGPTTranslator = /** @class */ (function (_super) {
    __extends(ChatGPTTranslator, _super);
    function ChatGPTTranslator(apiKey) {
        var _this = _super.call(this) || this;
        _this.openai = new OpenAIUtils_1.default(apiKey);
        return _this;
    }
    ChatGPTTranslator.prototype.performTranslation = function (targetLang, text, context) {
        return __awaiter(this, void 0, void 0, function () {
            var systemPrompt, attempt, result, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        systemPrompt = (0, dedent_1.default)("\n            ".concat((0, base_1.default)(targetLang), "\n            ").concat((0, context_1.default)(context), "\n        "));
                        attempt = 0;
                        _a.label = 1;
                    case 1:
                        if (!(attempt <= ChatGPTTranslator.MAX_RETRIES)) return [3 /*break*/, 6];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.openai.promptChatCompletions({
                                systemPrompt: systemPrompt,
                                userPrompt: text,
                            })];
                    case 3:
                        result = _a.sent();
                        if (this.validateTemplatePlaceholders(text, result)) {
                            if (attempt > 0) {
                                console.log("\uD83D\uDE43 Translation succeeded after ".concat(attempt + 1, " attempts"));
                            }
                            console.log("\uD83E\uDDE0 Translated \"".concat(text, "\" to ").concat(targetLang, ": \"").concat(result, "\""));
                            return [2 /*return*/, result];
                        }
                        console.warn("\u26A0\uFE0F Translation for \"".concat(text, "\" failed placeholder validation (attempt ").concat(attempt + 1, "/").concat(ChatGPTTranslator.MAX_RETRIES + 1, ")"));
                        if (attempt === ChatGPTTranslator.MAX_RETRIES) {
                            console.error("\u274C Final attempt failed placeholder validation. Falling back to original.");
                            return [2 /*return*/, text];
                        }
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _a.sent();
                        console.error("Error translating \"".concat(text, "\" to ").concat(targetLang, " (attempt ").concat(attempt + 1, "):"), error_1);
                        if (attempt === ChatGPTTranslator.MAX_RETRIES) {
                            return [2 /*return*/, text]; // Final fallback
                        }
                        return [3 /*break*/, 5];
                    case 5:
                        attempt++;
                        return [3 /*break*/, 1];
                    case 6: 
                    // Should never hit this, but fallback just in case
                    return [2 /*return*/, text];
                }
            });
        });
    };
    /**
     * Validate that placeholders are all present and unchanged before and after translation.
     */
    ChatGPTTranslator.prototype.validateTemplatePlaceholders = function (original, translated) {
        var extractPlaceholders = function (s) {
            return Array.from(s.matchAll(/\$\{[^}]*}/g))
                .map(function (m) { return m[0]; })
                .sort();
        };
        var originalSpans = extractPlaceholders(original);
        var translatedSpans = extractPlaceholders(translated);
        return JSON.stringify(originalSpans) === JSON.stringify(translatedSpans);
    };
    /**
     * The maximum number of times we'll retry a successful translation request in the event of hallucinations.
     */
    ChatGPTTranslator.MAX_RETRIES = 4;
    return ChatGPTTranslator;
}(Translator_1.default));
exports.default = ChatGPTTranslator;
