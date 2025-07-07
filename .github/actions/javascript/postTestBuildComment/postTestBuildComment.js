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
var core = require("@actions/core");
var github_1 = require("@actions/github");
var CONST_1 = require("@github/libs/CONST");
var GithubUtils_1 = require("@github/libs/GithubUtils");
function getTestBuildMessage(appPr, mobileExpensifyPr) {
    var _a;
    var inputs = ['ANDROID', 'DESKTOP', 'IOS', 'WEB'];
    var names = (_a = {},
        _a[inputs[0]] = 'Android',
        _a[inputs[1]] = 'Desktop',
        _a[inputs[2]] = 'iOS',
        _a[inputs[3]] = 'Web',
        _a);
    var result = inputs.reduce(function (acc, platform) {
        var input = core.getInput(platform, { required: false });
        if (!input) {
            acc[platform] = { link: 'N/A', qrCode: 'N/A' };
            return acc;
        }
        var link = '';
        var qrCode = '';
        switch (input) {
            case 'success':
                link = core.getInput("".concat(platform, "_LINK"));
                qrCode = "![".concat(names[platform], "](https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=").concat(link, ")");
                break;
            case 'skipped':
                link = '⏩ SKIPPED ⏩';
                qrCode = "The build for ".concat(names[platform], " was skipped");
                break;
            default:
                link = '❌ FAILED ❌';
                qrCode = "The QR code can't be generated, because the ".concat(names[platform], " build failed");
        }
        acc[platform] = {
            link: link,
            qrCode: qrCode,
        };
        return acc;
    }, {});
    var message = ":test_tube::test_tube: Use the links below to test this adhoc build on Android, iOS".concat(appPr ? ', Desktop, and Web' : '', ". Happy testing! :test_tube::test_tube:\nBuilt from").concat(appPr ? " App PR Expensify/App#".concat(appPr) : '').concat(mobileExpensifyPr ? " Mobile-Expensify PR Expensify/Mobile-Expensify#".concat(mobileExpensifyPr) : '', ".\n| Android :robot:  | iOS :apple: |\n| ------------- | ------------- |\n| ").concat(result.ANDROID.link, "  | ").concat(result.IOS.link, "  |\n| ").concat(result.ANDROID.qrCode, "  | ").concat(result.IOS.qrCode, "  |\n\n| Desktop :computer: | Web :spider_web: |\n| ------------- | ------------- |\n| ").concat(result.DESKTOP.link, "  | ").concat(result.WEB.link, "  |\n| ").concat(result.DESKTOP.qrCode, "  | ").concat(result.WEB.qrCode, "  |\n\n---\n\n:eyes: [View the workflow run that generated this build](https://github.com/").concat(github_1.context.repo.owner, "/").concat(github_1.context.repo.repo, "/actions/runs/").concat(github_1.context.runId, ") :eyes:\n");
    return message;
}
/** Comment on a single PR */
function commentPR(REPO, PR, message) {
    return __awaiter(this, void 0, void 0, function () {
        var err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("Posting test build comment on #".concat(PR));
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, GithubUtils_1.default.createComment(REPO, PR, message)];
                case 2:
                    _a.sent();
                    console.log("Comment created on #".concat(PR, " (").concat(REPO, ") successfully \uD83C\uDF89"));
                    return [3 /*break*/, 4];
                case 3:
                    err_1 = _a.sent();
                    console.log("Unable to write comment on #".concat(PR, " \uD83D\uDE1E"));
                    if (err_1 instanceof Error) {
                        core.setFailed(err_1.message);
                    }
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function run() {
    return __awaiter(this, void 0, void 0, function () {
        var APP_PR_NUMBER, MOBILE_EXPENSIFY_PR_NUMBER, REPO, destinationPRNumber, comments, testBuildComment;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    APP_PR_NUMBER = Number(core.getInput('APP_PR_NUMBER', { required: false }));
                    MOBILE_EXPENSIFY_PR_NUMBER = Number(core.getInput('MOBILE_EXPENSIFY_PR_NUMBER', { required: false }));
                    REPO = String(core.getInput('REPO', { required: true }));
                    if (REPO !== CONST_1.default.APP_REPO && REPO !== CONST_1.default.MOBILE_EXPENSIFY_REPO) {
                        core.setFailed("Invalid repository used to place output comment: ".concat(REPO));
                        return [2 /*return*/];
                    }
                    if ((REPO === CONST_1.default.APP_REPO && !APP_PR_NUMBER) || (REPO === CONST_1.default.MOBILE_EXPENSIFY_REPO && !MOBILE_EXPENSIFY_PR_NUMBER)) {
                        core.setFailed("Please provide ".concat(REPO, " pull request number"));
                        return [2 /*return*/];
                    }
                    destinationPRNumber = REPO === CONST_1.default.APP_REPO ? APP_PR_NUMBER : MOBILE_EXPENSIFY_PR_NUMBER;
                    return [4 /*yield*/, GithubUtils_1.default.paginate(GithubUtils_1.default.octokit.issues.listComments, {
                            owner: CONST_1.default.GITHUB_OWNER,
                            repo: REPO,
                            // eslint-disable-next-line @typescript-eslint/naming-convention
                            issue_number: destinationPRNumber,
                            // eslint-disable-next-line @typescript-eslint/naming-convention
                            per_page: 100,
                        }, function (response) { return response.data; })];
                case 1:
                    comments = _a.sent();
                    testBuildComment = comments.find(function (comment) { var _a; return (_a = comment.body) === null || _a === void 0 ? void 0 : _a.startsWith(':test_tube::test_tube: Use the links below to test this adhoc build'); });
                    if (!testBuildComment) return [3 /*break*/, 3];
                    console.log('Found previous build comment, hiding it', testBuildComment);
                    return [4 /*yield*/, GithubUtils_1.default.graphql("\n            mutation {\n              minimizeComment(input: {classifier: OUTDATED, subjectId: \"".concat(testBuildComment.node_id, "\"}) {\n                minimizedComment {\n                  minimizedReason\n                }\n              }\n            }\n        "))];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3: return [4 /*yield*/, commentPR(REPO, destinationPRNumber, getTestBuildMessage(APP_PR_NUMBER, MOBILE_EXPENSIFY_PR_NUMBER))];
                case 4:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
if (require.main === module) {
    run();
}
exports.default = run;
