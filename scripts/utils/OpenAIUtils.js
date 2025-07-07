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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
var openai_1 = require("openai");
var retryWithBackoff_1 = require("@scripts/utils/retryWithBackoff");
var OpenAIUtils = /** @class */ (function () {
    function OpenAIUtils(apiKey) {
        this.client = new openai_1.default({ apiKey: apiKey });
    }
    /**
     * Prompt the Chat Completions API.
     */
    OpenAIUtils.prototype.promptChatCompletions = function (_a) {
        return __awaiter(this, arguments, void 0, function (_b) {
            var messages, response, result;
            var _this = this;
            var _c, _d, _e;
            var userPrompt = _b.userPrompt, _f = _b.systemPrompt, systemPrompt = _f === void 0 ? '' : _f, _g = _b.model, model = _g === void 0 ? 'gpt-4o' : _g;
            return __generator(this, function (_h) {
                switch (_h.label) {
                    case 0:
                        messages = [{ role: 'user', content: userPrompt }];
                        if (systemPrompt) {
                            messages.unshift({ role: 'system', content: systemPrompt });
                        }
                        return [4 /*yield*/, (0, retryWithBackoff_1.default)(function () {
                                return _this.client.chat.completions.create({
                                    model: model,
                                    messages: messages,
                                    temperature: 0.3,
                                });
                            }, { isRetryable: function (err) { return OpenAIUtils.isRetryableError(err); } })];
                    case 1:
                        response = _h.sent();
                        result = (_e = (_d = (_c = response.choices.at(0)) === null || _c === void 0 ? void 0 : _c.message) === null || _d === void 0 ? void 0 : _d.content) === null || _e === void 0 ? void 0 : _e.trim();
                        if (!result) {
                            throw new Error('Error getting chat completion response from OpenAI');
                        }
                        return [2 /*return*/, result];
                }
            });
        });
    };
    /**
     * Prompt a pre-defined assistant.
     */
    OpenAIUtils.prototype.promptAssistant = function (assistantID, userMessage) {
        return __awaiter(this, void 0, void 0, function () {
            var threadRun, response, count, _a, _b, _c, message, e_1_1;
            var _this = this;
            var _d, e_1, _e, _f;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0: return [4 /*yield*/, (0, retryWithBackoff_1.default)(function () {
                            return _this.client.beta.threads.createAndRun({
                                /* eslint-disable @typescript-eslint/naming-convention */
                                assistant_id: assistantID,
                                thread: {
                                    messages: [{ role: 'user', content: userMessage }],
                                },
                            });
                        }, { isRetryable: function (err) { return OpenAIUtils.isRetryableError(err); } })];
                    case 1:
                        threadRun = _g.sent();
                        response = '';
                        count = 0;
                        _g.label = 2;
                    case 2:
                        if (!(!response && count < OpenAIUtils.MAX_POLL_COUNT)) return [3 /*break*/, 17];
                        return [4 /*yield*/, this.client.beta.threads.runs.retrieve(threadRun.thread_id, { thread_id: threadRun.id })];
                    case 3:
                        // await thread run completion
                        threadRun = _g.sent();
                        if (!(threadRun.status !== 'completed')) return [3 /*break*/, 5];
                        count++;
                        return [4 /*yield*/, new Promise(function (resolve) {
                                setTimeout(resolve, OpenAIUtils.POLL_RATE);
                            })];
                    case 4:
                        _g.sent();
                        return [3 /*break*/, 2];
                    case 5:
                        _g.trys.push([5, 10, 11, 16]);
                        _a = true, _b = (e_1 = void 0, __asyncValues(this.client.beta.threads.messages.list(threadRun.thread_id)));
                        _g.label = 6;
                    case 6: return [4 /*yield*/, _b.next()];
                    case 7:
                        if (!(_c = _g.sent(), _d = _c.done, !_d)) return [3 /*break*/, 9];
                        _f = _c.value;
                        _a = false;
                        message = _f;
                        if (message.role !== 'assistant') {
                            return [3 /*break*/, 8];
                        }
                        response += message.content
                            .map(function (contentBlock) { return OpenAIUtils.isTextContentBlock(contentBlock) && contentBlock.text.value; })
                            .join('\n')
                            .trim();
                        console.log('Parsed assistant response:', response);
                        _g.label = 8;
                    case 8:
                        _a = true;
                        return [3 /*break*/, 6];
                    case 9: return [3 /*break*/, 16];
                    case 10:
                        e_1_1 = _g.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 16];
                    case 11:
                        _g.trys.push([11, , 14, 15]);
                        if (!(!_a && !_d && (_e = _b.return))) return [3 /*break*/, 13];
                        return [4 /*yield*/, _e.call(_b)];
                    case 12:
                        _g.sent();
                        _g.label = 13;
                    case 13: return [3 /*break*/, 15];
                    case 14:
                        if (e_1) throw e_1.error;
                        return [7 /*endfinally*/];
                    case 15: return [7 /*endfinally*/];
                    case 16:
                        if (!response) {
                            throw new Error('Assistant response is empty or had no text content. This is unexpected.');
                        }
                        return [3 /*break*/, 2];
                    case 17: return [2 /*return*/, response];
                }
            });
        });
    };
    OpenAIUtils.isTextContentBlock = function (block) {
        return block.type === 'text';
    };
    OpenAIUtils.isRetryableError = function (error) {
        // Handle known/predictable API errors
        if (error instanceof openai_1.default.APIError) {
            // Only retry 429 (rate limit) or 5xx errors
            var status_1 = error.status;
            return !!status_1 && (status_1 === 429 || status_1 >= 500);
        }
        // Handle random/unpredictable network errors
        if (error instanceof Error) {
            var msg = error.message.toLowerCase();
            return (msg.includes('timeout') ||
                msg.includes('socket hang up') ||
                msg.includes('fetch failed') ||
                msg.includes('network error') ||
                msg.includes('connection reset') ||
                msg.includes('connection aborted') ||
                msg.includes('ecconnrefused') || // Node-fetch errors
                msg.includes('dns') ||
                msg.includes('econn') ||
                msg.includes('request to') // node-fetch errors often include this
            );
        }
        return false;
    };
    /**
     * How frequently to poll a thread to wait for it to be done.
     */
    OpenAIUtils.POLL_RATE = 1500;
    /**
     * The maximum amount of time to wait for a thread to produce a response.
     */
    OpenAIUtils.POLL_TIMEOUT = 90000;
    /**
     * The maximum number of requests to make when polling for thread completion.
     */
    OpenAIUtils.MAX_POLL_COUNT = Math.floor(OpenAIUtils.POLL_TIMEOUT / OpenAIUtils.POLL_RATE);
    return OpenAIUtils;
}());
exports.default = OpenAIUtils;
