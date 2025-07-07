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
var github = require("@actions/github");
var ActionUtils_1 = require("@github/libs/ActionUtils");
var GithubUtils_1 = require("@github/libs/GithubUtils");
var GitUtils_1 = require("@github/libs/GitUtils");
function run() {
    return __awaiter(this, void 0, void 0, function () {
        var inputTag_1, isProductionDeploy_1, deployEnv, priorTag_1, foundCurrentRelease_1, prList, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    inputTag_1 = core.getInput('TAG', { required: true });
                    isProductionDeploy_1 = !!(0, ActionUtils_1.getJSONInput)('IS_PRODUCTION_DEPLOY', { required: false }, false);
                    deployEnv = isProductionDeploy_1 ? 'production' : 'staging';
                    console.log("Looking for PRs deployed to ".concat(deployEnv, " in ").concat(inputTag_1, "..."));
                    foundCurrentRelease_1 = false;
                    return [4 /*yield*/, GithubUtils_1.default.paginate(GithubUtils_1.default.octokit.repos.listReleases, {
                            owner: github.context.repo.owner,
                            repo: github.context.repo.repo,
                            // eslint-disable-next-line @typescript-eslint/naming-convention
                            per_page: 100,
                        }, function (_a, done) {
                            var _b, _c;
                            var data = _a.data;
                            // For production deploys, look only at other production deploys.
                            // staging deploys can be compared with other staging deploys or production deploys.
                            var filteredData = isProductionDeploy_1 ? data.filter(function (release) { return !release.prerelease; }) : data;
                            // Release was in the last page, meaning the previous release is the first item in this page
                            if (foundCurrentRelease_1) {
                                priorTag_1 = (_b = data.at(0)) === null || _b === void 0 ? void 0 : _b.tag_name;
                                done();
                                return filteredData;
                            }
                            // Search for the index of input tag
                            var indexOfCurrentRelease = filteredData.findIndex(function (release) { return release.tag_name === inputTag_1; });
                            // If it happens to be at the end of this page, then the previous tag will be in the next page.
                            // Set a flag showing we found it so we grab the first release of the next page
                            if (indexOfCurrentRelease === filteredData.length - 1) {
                                foundCurrentRelease_1 = true;
                                return filteredData;
                            }
                            // If it's anywhere else in this page, the the prior release is the next item in the page
                            if (indexOfCurrentRelease >= 0) {
                                priorTag_1 = (_c = filteredData.at(indexOfCurrentRelease + 1)) === null || _c === void 0 ? void 0 : _c.tag_name;
                                done();
                            }
                            // Release not in this page (or we're done)
                            return filteredData;
                        })];
                case 1:
                    _a.sent();
                    if (!priorTag_1) {
                        throw new Error('Something went wrong and the prior tag could not be found.');
                    }
                    console.log("Looking for PRs deployed to ".concat(deployEnv, " between ").concat(priorTag_1, " and ").concat(inputTag_1));
                    return [4 /*yield*/, GitUtils_1.default.getPullRequestsDeployedBetween(priorTag_1, inputTag_1)];
                case 2:
                    prList = _a.sent();
                    console.log('Found the pull request list: ', prList);
                    core.setOutput('PR_LIST', prList);
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    console.error(error_1.message);
                    core.setFailed(error_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
if (require.main === module) {
    run();
}
exports.default = run;
