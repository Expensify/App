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
var core = require("@actions/core");
var jest_when_1 = require("jest-when");
var postTestBuildComment_1 = require("@github/actions/javascript/postTestBuildComment/postTestBuildComment");
var CONST_1 = require("@github/libs/CONST");
var GithubUtils_1 = require("@github/libs/GithubUtils");
var asMutable_1 = require("@src/types/utils/asMutable");
var mockGetInput = jest.fn();
var createCommentMock = jest.spyOn(GithubUtils_1.default, 'createComment');
var mockListComments = jest.fn();
var mockGraphql = jest.fn();
jest.spyOn(GithubUtils_1.default, 'octokit', 'get').mockReturnValue({
    issues: {
        listComments: mockListComments,
    },
});
function mockImplementation(endpoint, params) {
    return endpoint(params).then(function (response) { return response.data; });
}
Object.defineProperty(GithubUtils_1.default, 'paginate', {
    get: function () { return mockImplementation; },
});
Object.defineProperty(GithubUtils_1.default, 'graphql', {
    get: function () { return mockGraphql; },
});
jest.mock('@actions/github', function () { return ({
    context: {
        repo: {
            owner: process.env.GITHUB_REPOSITORY_OWNER,
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            repo: process.env.GITHUB_REPOSITORY.split('/').at(1),
        },
        runId: 1234,
    },
}); });
var androidLink = 'https://expensify.app/ANDROID_LINK';
var iOSLink = 'https://expensify.app/IOS_LINK';
var webLink = 'https://expensify.app/WEB_LINK';
var desktopLink = 'https://expensify.app/DESKTOP_LINK';
var androidQRCode = "![Android](https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=".concat(androidLink, ")");
var desktopQRCode = "![Desktop](https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=".concat(desktopLink, ")");
var iOSQRCode = "![iOS](https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=".concat(iOSLink, ")");
var webQRCode = "![Web](https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=".concat(webLink, ")");
var message = ":test_tube::test_tube: Use the links below to test this adhoc build on Android, iOS, Desktop, and Web. Happy testing! :test_tube::test_tube:\nBuilt from App PR Expensify/App#12 Mobile-Expensify PR Expensify/Mobile-Expensify#13.\n| Android :robot:  | iOS :apple: |\n| ------------- | ------------- |\n| ".concat(androidLink, "  | ").concat(iOSLink, "  |\n| ").concat(androidQRCode, "  | ").concat(iOSQRCode, "  |\n\n| Desktop :computer: | Web :spider_web: |\n| ------------- | ------------- |\n| ").concat(desktopLink, "  | ").concat(webLink, "  |\n| ").concat(desktopQRCode, "  | ").concat(webQRCode, "  |\n\n---\n\n:eyes: [View the workflow run that generated this build](https://github.com/").concat(process.env.GITHUB_REPOSITORY, "/actions/runs/1234) :eyes:\n");
var onlyAppMessage = ":test_tube::test_tube: Use the links below to test this adhoc build on Android, iOS, Desktop, and Web. Happy testing! :test_tube::test_tube:\nBuilt from App PR Expensify/App#12.\n| Android :robot:  | iOS :apple: |\n| ------------- | ------------- |\n| ".concat(androidLink, "  | \u23E9 SKIPPED \u23E9  |\n| ").concat(androidQRCode, "  | The build for iOS was skipped  |\n\n| Desktop :computer: | Web :spider_web: |\n| ------------- | ------------- |\n| \u274C FAILED \u274C  | \u23E9 SKIPPED \u23E9  |\n| The QR code can't be generated, because the Desktop build failed  | The build for Web was skipped  |\n\n---\n\n:eyes: [View the workflow run that generated this build](https://github.com/").concat(process.env.GITHUB_REPOSITORY, "/actions/runs/1234) :eyes:\n");
var onlyMobileExpensifyMessage = ":test_tube::test_tube: Use the links below to test this adhoc build on Android, iOS. Happy testing! :test_tube::test_tube:\nBuilt from Mobile-Expensify PR Expensify/Mobile-Expensify#13.\n| Android :robot:  | iOS :apple: |\n| ------------- | ------------- |\n| ".concat(androidLink, "  | ").concat(iOSLink, "  |\n| ").concat(androidQRCode, "  | ").concat(iOSQRCode, "  |\n\n| Desktop :computer: | Web :spider_web: |\n| ------------- | ------------- |\n| \u23E9 SKIPPED \u23E9  | \u23E9 SKIPPED \u23E9  |\n| The build for Desktop was skipped  | The build for Web was skipped  |\n\n---\n\n:eyes: [View the workflow run that generated this build](https://github.com/").concat(process.env.GITHUB_REPOSITORY, "/actions/runs/1234) :eyes:\n");
describe('Post test build comments action tests', function () {
    beforeAll(function () {
        // Mock core module
        (0, asMutable_1.default)(core).getInput = mockGetInput;
    });
    beforeEach(function () { return jest.clearAllMocks(); });
    test('Test GH action', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    (0, jest_when_1.when)(core.getInput).calledWith('REPO', { required: true }).mockReturnValue(CONST_1.default.APP_REPO);
                    (0, jest_when_1.when)(core.getInput).calledWith('APP_PR_NUMBER', { required: false }).mockReturnValue('12');
                    (0, jest_when_1.when)(core.getInput).calledWith('MOBILE_EXPENSIFY_PR_NUMBER', { required: false }).mockReturnValue('13');
                    (0, jest_when_1.when)(core.getInput).calledWith('ANDROID', { required: false }).mockReturnValue('success');
                    (0, jest_when_1.when)(core.getInput).calledWith('IOS', { required: false }).mockReturnValue('success');
                    (0, jest_when_1.when)(core.getInput).calledWith('WEB', { required: false }).mockReturnValue('success');
                    (0, jest_when_1.when)(core.getInput).calledWith('DESKTOP', { required: false }).mockReturnValue('success');
                    (0, jest_when_1.when)(core.getInput).calledWith('ANDROID_LINK').mockReturnValue(androidLink);
                    (0, jest_when_1.when)(core.getInput).calledWith('IOS_LINK').mockReturnValue(iOSLink);
                    (0, jest_when_1.when)(core.getInput).calledWith('WEB_LINK').mockReturnValue('https://expensify.app/WEB_LINK');
                    (0, jest_when_1.when)(core.getInput).calledWith('DESKTOP_LINK').mockReturnValue('https://expensify.app/DESKTOP_LINK');
                    createCommentMock.mockResolvedValue({});
                    mockListComments.mockResolvedValue({
                        data: [
                            {
                                body: ':test_tube::test_tube: Use the links below to test this adhoc build on Android, iOS, Desktop, and Web. Happy testing!',
                                // eslint-disable-next-line @typescript-eslint/naming-convention
                                node_id: 'IC_abcd',
                            },
                        ],
                    });
                    return [4 /*yield*/, (0, postTestBuildComment_1.default)()];
                case 1:
                    _a.sent();
                    expect(mockGraphql).toBeCalledTimes(1);
                    expect(mockGraphql).toBeCalledWith("\n            mutation {\n              minimizeComment(input: {classifier: OUTDATED, subjectId: \"IC_abcd\"}) {\n                minimizedComment {\n                  minimizedReason\n                }\n              }\n            }\n        ");
                    expect(createCommentMock).toBeCalledTimes(1);
                    expect(createCommentMock).toBeCalledWith(CONST_1.default.APP_REPO, 12, message);
                    return [2 /*return*/];
            }
        });
    }); });
    test('Test GH action when only App PR number is provided', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    (0, jest_when_1.when)(core.getInput).calledWith('REPO', { required: true }).mockReturnValue(CONST_1.default.APP_REPO);
                    (0, jest_when_1.when)(core.getInput).calledWith('APP_PR_NUMBER', { required: false }).mockReturnValue('12');
                    (0, jest_when_1.when)(core.getInput).calledWith('MOBILE_EXPENSIFY_PR_NUMBER', { required: false }).mockReturnValue('');
                    (0, jest_when_1.when)(core.getInput).calledWith('ANDROID', { required: false }).mockReturnValue('success');
                    (0, jest_when_1.when)(core.getInput).calledWith('IOS', { required: false }).mockReturnValue('skipped');
                    (0, jest_when_1.when)(core.getInput).calledWith('WEB', { required: false }).mockReturnValue('skipped');
                    (0, jest_when_1.when)(core.getInput).calledWith('DESKTOP', { required: false }).mockReturnValue('failure');
                    (0, jest_when_1.when)(core.getInput).calledWith('ANDROID_LINK').mockReturnValue('https://expensify.app/ANDROID_LINK');
                    createCommentMock.mockResolvedValue({});
                    mockListComments.mockResolvedValue({
                        data: [
                            {
                                body: ':test_tube::test_tube: Use the links below to test this adhoc build on Android, iOS, Desktop, and Web. Happy testing!',
                                // eslint-disable-next-line @typescript-eslint/naming-convention
                                node_id: 'IC_abcd',
                            },
                        ],
                    });
                    return [4 /*yield*/, (0, postTestBuildComment_1.default)()];
                case 1:
                    _a.sent();
                    expect(mockGraphql).toBeCalledTimes(1);
                    expect(mockGraphql).toBeCalledWith("\n            mutation {\n              minimizeComment(input: {classifier: OUTDATED, subjectId: \"IC_abcd\"}) {\n                minimizedComment {\n                  minimizedReason\n                }\n              }\n            }\n        ");
                    expect(createCommentMock).toBeCalledTimes(1);
                    expect(createCommentMock).toBeCalledWith(CONST_1.default.APP_REPO, 12, onlyAppMessage);
                    return [2 /*return*/];
            }
        });
    }); });
    test('Test GH action when only Mobile-Expensify PR number is provided', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    (0, jest_when_1.when)(core.getInput).calledWith('REPO', { required: true }).mockReturnValue(CONST_1.default.MOBILE_EXPENSIFY_REPO);
                    (0, jest_when_1.when)(core.getInput).calledWith('APP_PR_NUMBER', { required: false }).mockReturnValue('');
                    (0, jest_when_1.when)(core.getInput).calledWith('MOBILE_EXPENSIFY_PR_NUMBER', { required: false }).mockReturnValue('13');
                    (0, jest_when_1.when)(core.getInput).calledWith('ANDROID', { required: false }).mockReturnValue('success');
                    (0, jest_when_1.when)(core.getInput).calledWith('IOS', { required: false }).mockReturnValue('success');
                    (0, jest_when_1.when)(core.getInput).calledWith('ANDROID_LINK').mockReturnValue(androidLink);
                    (0, jest_when_1.when)(core.getInput).calledWith('IOS_LINK').mockReturnValue(iOSLink);
                    (0, jest_when_1.when)(core.getInput).calledWith('WEB', { required: false }).mockReturnValue('skipped');
                    (0, jest_when_1.when)(core.getInput).calledWith('DESKTOP', { required: false }).mockReturnValue('skipped');
                    createCommentMock.mockResolvedValue({});
                    mockListComments.mockResolvedValue({
                        data: [
                            {
                                body: ':test_tube::test_tube: Use the links below to test this adhoc build on Android, iOS. Happy testing!',
                                // eslint-disable-next-line @typescript-eslint/naming-convention
                                node_id: 'IC_abcd',
                            },
                        ],
                    });
                    return [4 /*yield*/, (0, postTestBuildComment_1.default)()];
                case 1:
                    _a.sent();
                    expect(mockGraphql).toBeCalledTimes(1);
                    expect(mockGraphql).toBeCalledWith("\n            mutation {\n              minimizeComment(input: {classifier: OUTDATED, subjectId: \"IC_abcd\"}) {\n                minimizedComment {\n                  minimizedReason\n                }\n              }\n            }\n        ");
                    expect(createCommentMock).toBeCalledTimes(1);
                    expect(createCommentMock).toBeCalledWith(CONST_1.default.MOBILE_EXPENSIFY_REPO, 13, onlyMobileExpensifyMessage);
                    return [2 /*return*/];
            }
        });
    }); });
});
