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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @jest-environment node
 */
var core = require("@actions/core");
var checkDeployBlockers_1 = require("@github/actions/javascript/checkDeployBlockers/checkDeployBlockers");
var GithubUtils_1 = require("@github/libs/GithubUtils");
var asMutable_1 = require("@src/types/utils/asMutable");
// Static mock function for core.getInput
var mockGetInput = jest.fn().mockImplementation(function (arg) {
    if (arg === 'GITHUB_TOKEN') {
        return 'fake_token';
    }
    if (arg === 'ISSUE_NUMBER') {
        return 1;
    }
});
var mockSetOutput = jest.fn();
var mockGetIssue = jest.fn();
var mockListComments = jest.fn();
beforeAll(function () {
    // Mock core module
    (0, asMutable_1.default)(core).getInput = mockGetInput;
    (0, asMutable_1.default)(core).setOutput = mockSetOutput;
    // Mock octokit module
    var mockOctokit = {
        rest: {
            issues: {
                get: mockGetIssue,
                listComments: mockListComments,
            },
        },
    };
    GithubUtils_1.default.internalOctokit = mockOctokit;
});
var baseComments = {};
beforeEach(function () {
    baseComments = {
        data: [
            {
                body: 'foo',
            },
            {
                body: 'bar',
            },
            {
                body: ':shipit:',
            },
        ],
    };
});
afterEach(function () {
    mockSetOutput.mockClear();
    mockGetIssue.mockClear();
    mockListComments.mockClear();
});
afterAll(function () {
    jest.clearAllMocks();
});
function checkbox(isClosed) {
    return isClosed ? '[x]' : '[ ]';
}
function mockIssue(prList, deployBlockerList) {
    return {
        data: {
            number: 1,
            title: "Scott's QA Checklist",
            body: "\n**Release Version:** `1.1.31-2`\n**Compare Changes:** https://github.com/".concat(process.env.GITHUB_REPOSITORY, "/compare/production...staging\n\n**This release contains changes from the following pull requests:**\n").concat(prList
                .map(function (_a) {
                var url = _a.url, isQASuccess = _a.isQASuccess;
                return "\n- ".concat(checkbox(isQASuccess), " ").concat(url, "\n");
            })
                .join('\n'), "\n").concat(!deployBlockerList || deployBlockerList.length < 0
                ? "\n\n**Deploy Blockers:**"
                : '', "\n").concat(deployBlockerList === null || deployBlockerList === void 0 ? void 0 : deployBlockerList.map(function (_a) {
                var url = _a.url, isQASuccess = _a.isQASuccess;
                return "\n- ".concat(checkbox(isQASuccess), " ").concat(url, "\n");
            }).join('\n'), "\ncc @Expensify/applauseleads\n"),
        },
    };
}
describe('checkDeployBlockers', function () {
    var allClearIssue = mockIssue([{ url: "https://github.com/".concat(process.env.GITHUB_REPOSITORY, "/pull/6882"), isQASuccess: true }]);
    describe('checkDeployBlockers', function () {
        test('Test an issue with all checked items and :shipit:', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockGetIssue.mockResolvedValue(allClearIssue);
                        mockListComments.mockResolvedValue(baseComments);
                        return [4 /*yield*/, expect((0, checkDeployBlockers_1.default)()).resolves.toBeUndefined()];
                    case 1:
                        _a.sent();
                        expect(mockSetOutput).toHaveBeenCalledWith('HAS_DEPLOY_BLOCKERS', false);
                        return [2 /*return*/];
                }
            });
        }); });
        test('Test an issue with all boxes checked but no :shipit:', function () { return __awaiter(void 0, void 0, void 0, function () {
            var extraComments;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        mockGetIssue.mockResolvedValue(allClearIssue);
                        extraComments = {
                            data: __spreadArray(__spreadArray([], ((_a = baseComments === null || baseComments === void 0 ? void 0 : baseComments.data) !== null && _a !== void 0 ? _a : []), true), [{ body: 'This issue either has unchecked QA steps or has not yet been stamped with a :shipit: comment. Reopening!' }], false),
                        };
                        mockListComments.mockResolvedValue(extraComments);
                        return [4 /*yield*/, expect((0, checkDeployBlockers_1.default)()).resolves.toBeUndefined()];
                    case 1:
                        _b.sent();
                        expect(mockSetOutput).toHaveBeenCalledWith('HAS_DEPLOY_BLOCKERS', true);
                        return [2 /*return*/];
                }
            });
        }); });
        test('Test an issue with all boxes checked but no comments', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockGetIssue.mockResolvedValue(allClearIssue);
                        mockListComments.mockResolvedValue({ data: [] });
                        return [4 /*yield*/, expect((0, checkDeployBlockers_1.default)()).resolves.toBeUndefined()];
                    case 1:
                        _a.sent();
                        expect(mockSetOutput).toHaveBeenCalledWith('HAS_DEPLOY_BLOCKERS', true);
                        return [2 /*return*/];
                }
            });
        }); });
        test('Test an issue with all QA checked but not all deploy blockers', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockGetIssue.mockResolvedValue(mockIssue([{ url: "https://github.com/".concat(process.env.GITHUB_REPOSITORY, "/pull/6882"), isQASuccess: true }], [{ url: "https://github.com/".concat(process.env.GITHUB_REPOSITORY, "/pull/6883"), isQASuccess: false }]));
                        mockListComments.mockResolvedValue(baseComments);
                        return [4 /*yield*/, expect((0, checkDeployBlockers_1.default)()).resolves.toBeUndefined()];
                    case 1:
                        _a.sent();
                        expect(mockSetOutput).toHaveBeenCalledWith('HAS_DEPLOY_BLOCKERS', true);
                        return [2 /*return*/];
                }
            });
        }); });
        test('Test an issue with all QA checked and all deploy blockers resolved', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockGetIssue.mockResolvedValue(mockIssue([{ url: "https://github.com/".concat(process.env.GITHUB_REPOSITORY, "/pull/6882"), isQASuccess: true }], [{ url: "https://github.com/".concat(process.env.GITHUB_REPOSITORY, "/pull/6883"), isQASuccess: true }]));
                        mockListComments.mockResolvedValue(baseComments);
                        return [4 /*yield*/, expect((0, checkDeployBlockers_1.default)()).resolves.toBeUndefined()];
                    case 1:
                        _a.sent();
                        expect(mockSetOutput).toHaveBeenCalledWith('HAS_DEPLOY_BLOCKERS', false);
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
