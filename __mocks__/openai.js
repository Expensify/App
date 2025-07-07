"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mockCreate = jest.fn(function (_a) {
    var _b, _c;
    var messages = _a.messages;
    var text = (_c = (_b = messages === null || messages === void 0 ? void 0 : messages.find(function (m) { return m.role === 'user'; })) === null || _b === void 0 ? void 0 : _b.content) !== null && _c !== void 0 ? _c : '';
    return Promise.resolve({
        choices: [
            {
                message: {
                    content: "[ChatGPT] ".concat(text),
                },
            },
        ],
    });
});
var MockOpenAI = /** @class */ (function () {
    function MockOpenAI() {
        this.chat = {
            completions: {
                create: mockCreate,
            },
        };
    }
    return MockOpenAI;
}());
exports.default = MockOpenAI;
