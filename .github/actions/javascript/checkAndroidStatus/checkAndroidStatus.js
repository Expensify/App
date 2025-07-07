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
var googleapis_1 = require("googleapis");
var CONST_1 = require("@github/libs/CONST");
var GithubUtils_1 = require("@github/libs/GithubUtils");
var PACKAGE_NAME = core.getInput('PACKAGE_NAME', { required: true });
var GOOGLE_KEY_FILE = core.getInput('GOOGLE_KEY_FILE', { required: true });
var HALTED_STATUS = 'halted';
var COMPLETED_STATUS = 'completed';
function checkAndroidStatus() {
    return __awaiter(this, void 0, void 0, function () {
        var auth, androidApi, editResponse, editId, trackResponse, status_1, HALTED, COMPLETED, error_1;
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    auth = new googleapis_1.google.auth.GoogleAuth({
                        keyFile: GOOGLE_KEY_FILE,
                        scopes: ['https://www.googleapis.com/auth/androidpublisher'],
                    });
                    androidApi = googleapis_1.google.androidpublisher({
                        version: 'v3',
                        auth: auth,
                    });
                    _e.label = 1;
                case 1:
                    _e.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, androidApi.edits.insert({
                            packageName: PACKAGE_NAME,
                        })];
                case 2:
                    editResponse = _e.sent();
                    editId = (_a = editResponse.data.id) !== null && _a !== void 0 ? _a : 'undefined';
                    return [4 /*yield*/, androidApi.edits.tracks.get({
                            packageName: PACKAGE_NAME,
                            editId: editId,
                            track: 'production',
                        })];
                case 3:
                    trackResponse = _e.sent();
                    status_1 = (_d = (_c = (_b = trackResponse.data.releases) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.status) !== null && _d !== void 0 ? _d : 'undefined';
                    console.log('Track status:', status_1);
                    HALTED = status_1 === HALTED_STATUS;
                    core.setOutput('HALTED', HALTED);
                    COMPLETED = status_1 === COMPLETED_STATUS;
                    core.setOutput('COMPLETED', COMPLETED);
                    return [2 /*return*/, status_1];
                case 4:
                    error_1 = _e.sent();
                    console.error('Error checking track status:', error_1);
                    throw error_1;
                case 5: return [2 /*return*/];
            }
        });
    });
}
function getLatestReleaseDate() {
    return __awaiter(this, void 0, void 0, function () {
        var data, releaseDate;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, GithubUtils_1.default.octokit.repos.getLatestRelease({
                        owner: CONST_1.default.GITHUB_OWNER,
                        repo: CONST_1.default.APP_REPO,
                    })];
                case 1:
                    data = (_b.sent()).data;
                    releaseDate = (_a = data.published_at) === null || _a === void 0 ? void 0 : _a.split('T')[0];
                    if (!releaseDate) {
                        throw new Error('Unable to retrieve the latest release date from GitHub');
                    }
                    console.log('Latest release date:', releaseDate);
                    return [2 /*return*/, releaseDate];
            }
        });
    });
}
function calculateRolloutPercentage(releaseDate) {
    var release = new Date(releaseDate);
    var current = new Date();
    var daysSinceRelease = Math.floor((current.getTime() - release.getTime()) / (1000 * 60 * 60 * 24));
    console.log('Days since release:', daysSinceRelease);
    if (daysSinceRelease === 1) {
        return 0.01;
    }
    if (daysSinceRelease === 2) {
        return 0.02;
    }
    if (daysSinceRelease === 3) {
        return 0.05;
    }
    if (daysSinceRelease === 4) {
        return 0.1;
    }
    if (daysSinceRelease === 5) {
        return 0.2;
    }
    if (daysSinceRelease === 6) {
        return 0.5;
    }
    if (daysSinceRelease === 7) {
        return 1;
    }
    // If we did not get a valid number of days since release (1-7), return -1
    return -1;
}
checkAndroidStatus()
    .then(getLatestReleaseDate)
    .then(function (releaseDate) {
    var rolloutPercentage = calculateRolloutPercentage(releaseDate);
    console.log('Rollout percentage:', rolloutPercentage);
    core.setOutput('ROLLOUT_PERCENTAGE', rolloutPercentage);
});
