#!/usr/bin/env ts-node
"use strict";
/* eslint-disable @typescript-eslint/naming-convention */
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
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * This script helps to symbolicate a .cpuprofile file that was obtained from a specific (staging) app version (usually provided by a user using the app).
 *
 * @abstract
 *
 * 1. When creating a new deployment in our github actions, we upload the source map for android and iOS as artifacts.
 * 2. The profiles created by the app on the user's device have the app version encoded in the filename.
 * 3. This script takes in a .cpuprofile file, reads the app version from the filename, and downloads the corresponding source map from the artifacts using github's API.
 * 4. It then uses the source map to symbolicate the .cpuprofile file using the `react-native-release-profiler` cli.
 *
 * @note For downloading an artifact a github token is required.
 */
var child_process_1 = require("child_process");
var fs_1 = require("fs");
var https_1 = require("https");
var path_1 = require("path");
var GithubUtils_1 = require("@github/libs/GithubUtils");
var Logger = require("./utils/Logger");
var parseCommandLineArguments_1 = require("./utils/parseCommandLineArguments");
var argsMap = (0, parseCommandLineArguments_1.default)();
/* ============== INPUT VALIDATION ============== */
if (Object.keys(argsMap).length === 0 || argsMap.help !== undefined) {
    Logger.log('Symbolicates a .cpuprofile file obtained from a specific app version by downloading the source map from the github action runs.');
    Logger.log('Usage: npm run symbolicate-profile -- --profile=<filename> --platform=<ios|android>');
    Logger.log('Options:');
    Logger.log('  --profile=<filename>          The .cpuprofile file to symbolicate');
    Logger.log('  --platform=<ios|android>      The platform for which the source map was uploaded');
    Logger.log('  --ghToken                     Token to use for requests send to the GitHub API. By default tries to pick up from the environment variable GITHUB_TOKEN');
    Logger.log('  --help                        Display this help message');
    process.exit(0);
}
if (argsMap.profile === undefined) {
    Logger.error('Please specify the .cpuprofile file to symbolicate using --profile=<filename>');
    process.exit(1);
}
if (!fs_1.default.existsSync(argsMap.profile)) {
    Logger.error("File ".concat(argsMap.profile, " does not exist."));
    process.exit(1);
}
if (argsMap.platform === undefined) {
    Logger.error('Please specify the platform using --platform=ios or --platform=android');
    process.exit(1);
}
var githubToken = (_a = argsMap.ghToken) !== null && _a !== void 0 ? _a : process.env.GITHUB_TOKEN;
if (githubToken === undefined) {
    Logger.error('No GitHub token provided. Either set a GITHUB_TOKEN environment variable or pass it using --ghToken');
    process.exit(1);
}
GithubUtils_1.default.initOctokitWithToken(githubToken);
/* ============= EXTRACT APP VERSION ============= */
// Formatted as "Profile_trace_for_1.4.81-9.cpuprofile"
var appVersionRegex = /\d+\.\d+\.\d+(-\d+)?/;
var appVersion = (_b = argsMap.profile.match(appVersionRegex)) === null || _b === void 0 ? void 0 : _b[0];
if (appVersion === undefined) {
    Logger.error('Could not extract the app version from the profile filename.');
    process.exit(1);
}
Logger.info("Found app version ".concat(appVersion, " in the profile filename"));
/* ============== UTILITY FUNCTIONS ============== */
function getWorkflowRunArtifact() {
    return __awaiter(this, void 0, void 0, function () {
        var artifactName, artifact;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    artifactName = "".concat(argsMap.platform, "-sourcemap-").concat(appVersion);
                    Logger.info("Fetching sourcemap artifact with name \"".concat(artifactName, "\""));
                    return [4 /*yield*/, GithubUtils_1.default.getArtifactByName(artifactName)];
                case 1:
                    artifact = _a.sent();
                    if (artifact === undefined) {
                        throw new Error("Could not find the artifact ".concat(artifactName, "! Are you sure the deploy step succeeded?"));
                    }
                    return [2 /*return*/, artifact.id];
            }
        });
    });
}
var sourcemapDir = path_1.default.resolve(__dirname, '../.sourcemaps');
function downloadFile(url) {
    Logger.log("Downloading file from URL: ".concat(url));
    if (!fs_1.default.existsSync(sourcemapDir)) {
        Logger.info("Creating download directory ".concat(sourcemapDir));
        fs_1.default.mkdirSync(sourcemapDir);
    }
    var destination = path_1.default.join(sourcemapDir, "".concat(argsMap.platform, "-sourcemap-").concat(appVersion, ".zip"));
    var file = fs_1.default.createWriteStream(destination);
    return new Promise(function (resolve, reject) {
        https_1.default
            .get(url, function (response) {
            response.pipe(file);
            file.on('finish', function () {
                file.close();
                Logger.success("Downloaded file to ".concat(destination));
                resolve(destination);
            });
        })
            .on('error', function (error) {
            fs_1.default.unlink(destination, function () {
                reject(error);
            });
        });
    });
}
function unpackZipFile(zipPath) {
    Logger.info("Unpacking file ".concat(zipPath));
    var command = "unzip -o ".concat(zipPath, " -d ").concat(sourcemapDir);
    (0, child_process_1.execSync)(command, { stdio: 'inherit' });
    Logger.info("Deleting zip file ".concat(zipPath));
    return new Promise(function (resolve, reject) {
        fs_1.default.unlink(zipPath, function (error) { return (error ? reject(error) : resolve()); });
    });
}
var localSourceMapPath = path_1.default.join(sourcemapDir, "".concat(appVersion, "-").concat(argsMap.platform, ".map"));
function renameDownloadedSourcemapFile() {
    var androidName = 'index.android.bundle.map';
    var iosName = 'main.jsbundle.map';
    var downloadSourcemapPath = path_1.default.join(sourcemapDir, argsMap.platform === 'ios' ? iosName : androidName);
    if (!fs_1.default.existsSync(downloadSourcemapPath)) {
        Logger.error("Could not find the sourcemap file ".concat(downloadSourcemapPath));
        process.exit(1);
    }
    Logger.info("Renaming sourcemap file to ".concat(localSourceMapPath));
    fs_1.default.renameSync(downloadSourcemapPath, localSourceMapPath);
}
// Symbolicate using the downloaded source map
function symbolicateProfile() {
    var command = "npx react-native-release-profiler --local ".concat(argsMap.profile, " --sourcemap-path ").concat(localSourceMapPath);
    (0, child_process_1.execSync)(command, { stdio: 'inherit' });
}
function fetchAndProcessArtifact() {
    return __awaiter(this, void 0, void 0, function () {
        var artifactId, downloadUrl, zipPath;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getWorkflowRunArtifact()];
                case 1:
                    artifactId = _a.sent();
                    return [4 /*yield*/, GithubUtils_1.default.getArtifactDownloadURL(artifactId)];
                case 2:
                    downloadUrl = _a.sent();
                    return [4 /*yield*/, downloadFile(downloadUrl)];
                case 3:
                    zipPath = _a.sent();
                    return [4 /*yield*/, unpackZipFile(zipPath)];
                case 4:
                    _a.sent();
                    renameDownloadedSourcemapFile();
                    return [2 /*return*/];
            }
        });
    });
}
/* ============== MAIN SCRIPT ============== */
function runAsyncScript() {
    return __awaiter(this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!fs_1.default.existsSync(localSourceMapPath)) return [3 /*break*/, 1];
                    Logger.success("Found local source map at ".concat(localSourceMapPath));
                    Logger.info('Skipping download step');
                    return [3 /*break*/, 4];
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, fetchAndProcessArtifact()];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    Logger.error(error_1);
                    process.exit(1);
                    return [3 /*break*/, 4];
                case 4:
                    // Finally, symbolicate the profile
                    symbolicateProfile();
                    return [2 /*return*/];
            }
        });
    });
}
runAsyncScript();
