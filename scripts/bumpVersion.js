#!/usr/bin/env ts-node
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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAndroid = updateAndroid;
exports.generateAndroidVersionCode = generateAndroidVersionCode;
var child_process_1 = require("child_process");
var fs_1 = require("fs");
var path_1 = require("path");
var major_1 = require("semver/functions/major");
var minor_1 = require("semver/functions/minor");
var patch_1 = require("semver/functions/patch");
var prerelease_1 = require("semver/functions/prerelease");
var util_1 = require("util");
// Disabling lint on the next two imports due to a bug in @dword-design/import-alias/prefer-alias
// eslint-disable-next-line
var versionUpdater = require("@github/libs/versionUpdater");
var exec = (0, util_1.promisify)(child_process_1.exec);
// PlistBuddy executable path
var PLIST_BUDDY = '/usr/libexec/PlistBuddy';
/**
 * This is a utility function to get the repo root.
 * It's a helpful alternative to __dirname, which doesn't work with ncc-compiled scripts.
 * __dirname doesn't work, because:
 *   - if it's evaluated at compile time it will include an absolute path in the computer in which the file was compiled
 *   - if it's evaluated at runtime, it won't refer to the directory of the imported module, because the code will have moved to wherever it's bundled
 */
function getRepoRoot() {
    return (0, child_process_1.execSync)('git rev-parse --show-toplevel', {
        encoding: 'utf8',
    }).trim();
}
// Filepath constants
var ROOT_DIR = getRepoRoot();
var PACKAGE_JSON_PATH = path_1.default.resolve(ROOT_DIR, 'package.json');
var BUILD_GRADLE_PATH = path_1.default.resolve(ROOT_DIR, 'android/app/build.gradle');
var PLIST_PATH = path_1.default.resolve(ROOT_DIR, 'ios/NewExpensify/Info.plist');
var PLIST_PATH_NSE = path_1.default.resolve(ROOT_DIR, 'ios/NotificationServiceExtension/Info.plist');
var PLIST_PATH_SHARE = path_1.default.resolve(ROOT_DIR, 'ios/ShareViewController/Info.plist');
// Filepath constants (submodule)
var MOBILE_EXPENSIFY_DIR = path_1.default.resolve(ROOT_DIR, 'Mobile-Expensify');
var MOBILE_EXPENSIFY_CONFIG_JSON_PATH = path_1.default.resolve(MOBILE_EXPENSIFY_DIR, 'app/config/config.json');
var MOBILE_EXPENSIFY_ANDROID_MANIFEST_PATH = path_1.default.resolve(MOBILE_EXPENSIFY_DIR, 'Android/AndroidManifest.xml');
var MOBILE_EXPENSIFY_PLIST_PATH = path_1.default.resolve(MOBILE_EXPENSIFY_DIR, 'iOS/Expensify/Expensify-Info.plist');
var MOBILE_EXPENSIFY_PLIST_PATH_NSE = path_1.default.resolve(MOBILE_EXPENSIFY_DIR, 'iOS/NotificationServiceExtension/Info.plist');
var MOBILE_EXPENSIFY_PLIST_PATH_SS = path_1.default.resolve(MOBILE_EXPENSIFY_DIR, 'iOS/SmartScanExtension/Info.plist');
/**
 * Pad a number to be two digits (with leading zeros if necessary).
 */
function padToTwoDigits(value) {
    if (value >= 10) {
        return value.toString();
    }
    return "0".concat(value.toString());
}
/**
 * Generate the 10-digit versionCode for android.
 * This version code allocates two digits each for PREFIX, MAJOR, MINOR, PATCH, and BUILD versions.
 * As a result, our max version is 99.99.99-99.
 */
function generateAndroidVersionCode(npmVersion, prefix) {
    var _a, _b, _c, _d;
    return ''.concat(prefix, padToTwoDigits((_a = (0, major_1.default)(npmVersion)) !== null && _a !== void 0 ? _a : 0), padToTwoDigits((_b = (0, minor_1.default)(npmVersion)) !== null && _b !== void 0 ? _b : 0), padToTwoDigits((_c = (0, patch_1.default)(npmVersion)) !== null && _c !== void 0 ? _c : 0), padToTwoDigits((_d = Number((0, prerelease_1.default)(npmVersion))) !== null && _d !== void 0 ? _d : 0));
}
/**
 * Update the Android native versions in E/App and the Mobile-Expensify submodule.
 */
function updateAndroid(version) {
    return __awaiter(this, void 0, void 0, function () {
        var versionNamePattern_1, versionCodePattern_1, updateBuildGradle, updateAndroidManifest, err_1;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("Updating Android versions to ".concat(version));
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    versionNamePattern_1 = '([0-9.-]*)';
                    versionCodePattern_1 = '([0-9]*)';
                    updateBuildGradle = function () { return __awaiter(_this, void 0, void 0, function () {
                        var versionCode, fileContent, updatedContent;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    versionCode = generateAndroidVersionCode(version, '10');
                                    console.log("Updating ".concat(BUILD_GRADLE_PATH, ":"), { version: version, versionCode: versionCode });
                                    return [4 /*yield*/, fs_1.promises.readFile(BUILD_GRADLE_PATH, { encoding: 'utf8' })];
                                case 1:
                                    fileContent = _a.sent();
                                    updatedContent = fileContent
                                        .replace(new RegExp("versionName \"".concat(versionNamePattern_1, "\"")), "versionName \"".concat(version, "\""))
                                        .replace(new RegExp("versionCode ".concat(versionCodePattern_1)), "versionCode ".concat(versionCode));
                                    return [4 /*yield*/, fs_1.promises.writeFile(BUILD_GRADLE_PATH, updatedContent, { encoding: 'utf8' })];
                                case 2:
                                    _a.sent();
                                    console.log("Updated ".concat(BUILD_GRADLE_PATH));
                                    return [2 /*return*/];
                            }
                        });
                    }); };
                    updateAndroidManifest = function () { return __awaiter(_this, void 0, void 0, function () {
                        var versionCode, fileContent, updatedContent;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    versionCode = generateAndroidVersionCode(version, '05');
                                    console.log("Updating ".concat(MOBILE_EXPENSIFY_ANDROID_MANIFEST_PATH, ":"), { version: version, versionCode: versionCode });
                                    return [4 /*yield*/, fs_1.promises.readFile(MOBILE_EXPENSIFY_ANDROID_MANIFEST_PATH, { encoding: 'utf8' })];
                                case 1:
                                    fileContent = _a.sent();
                                    updatedContent = fileContent
                                        .replace(new RegExp("android:versionName=\"".concat(versionNamePattern_1, "\"")), "android:versionName=\"".concat(version, "\""))
                                        .replace(new RegExp("android:versionCode=\"".concat(versionCodePattern_1, "\"")), "android:versionCode=\"".concat(versionCode, "\""));
                                    return [4 /*yield*/, fs_1.promises.writeFile(MOBILE_EXPENSIFY_ANDROID_MANIFEST_PATH, updatedContent, { encoding: 'utf8' })];
                                case 2:
                                    _a.sent();
                                    console.log("Updated ".concat(MOBILE_EXPENSIFY_ANDROID_MANIFEST_PATH));
                                    return [2 /*return*/];
                            }
                        });
                    }); };
                    return [4 /*yield*/, Promise.all([updateBuildGradle(), updateAndroidManifest()])];
                case 2:
                    _a.sent();
                    console.log('Successfully updated Android');
                    return [3 /*break*/, 4];
                case 3:
                    err_1 = _a.sent();
                    console.error('Error updating Android');
                    throw new Error('Error updating Android');
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Update the iOS native versions in E/App and the Mobile-Expensify submodule.
 */
function updateIOS(version) {
    return __awaiter(this, void 0, void 0, function () {
        var PLIST_KEYS_1, shortVersion_1, cfVersion_1, err_2;
        var _a;
        var _this = this;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    console.log("Updating native versions to ".concat(version));
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    PLIST_KEYS_1 = {
                        CF_BUNDLE_SHORT_VERSION: 'CFBundleShortVersionString',
                        CF_BUNDLE_VERSION: 'CFBundleVersion',
                    };
                    shortVersion_1 = version.split('-').at(0);
                    cfVersion_1 = version.includes('-') ? version.replace('-', '.') : "".concat(version, ".0");
                    console.log('Updating iOS', (_a = {},
                        _a[PLIST_KEYS_1.CF_BUNDLE_SHORT_VERSION] = shortVersion_1,
                        _a[PLIST_KEYS_1.CF_BUNDLE_VERSION] = cfVersion_1,
                        _a));
                    // Update plist
                    return [4 /*yield*/, Promise.all([PLIST_PATH, PLIST_PATH_NSE, PLIST_PATH_SHARE, MOBILE_EXPENSIFY_PLIST_PATH, MOBILE_EXPENSIFY_PLIST_PATH_NSE, MOBILE_EXPENSIFY_PLIST_PATH_SS].map(function (file) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        console.log("Updating ".concat(file));
                                        return [4 /*yield*/, exec("".concat(PLIST_BUDDY, " -c \"Set :").concat(PLIST_KEYS_1.CF_BUNDLE_SHORT_VERSION, " ").concat(shortVersion_1, "\" ").concat(file))];
                                    case 1:
                                        _a.sent();
                                        return [4 /*yield*/, exec("".concat(PLIST_BUDDY, " -c \"Set :").concat(PLIST_KEYS_1.CF_BUNDLE_VERSION, " ").concat(cfVersion_1, "\" ").concat(file))];
                                    case 2:
                                        _a.sent();
                                        console.log("Updated ".concat(file));
                                        return [2 /*return*/];
                                }
                            });
                        }); }))];
                case 2:
                    // Update plist
                    _b.sent();
                    console.log('Successfully updated iOS');
                    return [3 /*break*/, 4];
                case 3:
                    err_2 = _b.sent();
                    console.error('Error updating iOS');
                    throw new Error('Error updating iOS');
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Update package.json and package-lock.json
 */
function updateNPM(version) {
    return __awaiter(this, void 0, void 0, function () {
        var stdout, err_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("Setting npm version to ".concat(version));
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, exec("npm --no-git-tag-version version ".concat(version, " -m \"Update version to ").concat(version, "\""))];
                case 2:
                    stdout = (_a.sent()).stdout;
                    // NPM and native versions successfully updated, output new version
                    console.log(stdout);
                    return [3 /*break*/, 4];
                case 3:
                    err_3 = _a.sent();
                    // Log errors and fail gracefully
                    if (err_3 instanceof Error) {
                        console.error('Error:', err_3.message);
                    }
                    throw new Error('Error updating npm version');
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Update Mobile-Expensify config.json.
 */
function updateConfigJSON(version) {
    return __awaiter(this, void 0, void 0, function () {
        var fileContent, _a, _b, err_4;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 3, , 4]);
                    console.log("Updating ".concat(MOBILE_EXPENSIFY_CONFIG_JSON_PATH, " to ").concat(version));
                    _b = (_a = JSON).parse;
                    return [4 /*yield*/, fs_1.promises.readFile(MOBILE_EXPENSIFY_CONFIG_JSON_PATH, { encoding: 'utf8' })];
                case 1:
                    fileContent = _b.apply(_a, [_c.sent()]);
                    fileContent.meta.version = version;
                    return [4 /*yield*/, fs_1.promises.writeFile(MOBILE_EXPENSIFY_CONFIG_JSON_PATH, JSON.stringify(fileContent, null, 4), { encoding: 'utf8' })];
                case 2:
                    _c.sent();
                    console.log("Updated ".concat(MOBILE_EXPENSIFY_CONFIG_JSON_PATH));
                    return [3 /*break*/, 4];
                case 3:
                    err_4 = _c.sent();
                    // Log errors and fail gracefully
                    if (err_4 instanceof Error) {
                        console.error('Error:', err_4.message);
                    }
                    throw new Error('Error updating Mobile-Expensify config.json');
                case 4: return [2 /*return*/];
            }
        });
    });
}
function run(semanticVersionLevel) {
    return __awaiter(this, void 0, void 0, function () {
        var previousVersion, _a, _b, newVersion;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _b = (_a = JSON).parse;
                    return [4 /*yield*/, fs_1.promises.readFile(PACKAGE_JSON_PATH, { encoding: 'utf8' })];
                case 1:
                    previousVersion = _b.apply(_a, [_c.sent()]).version;
                    if (!previousVersion) {
                        throw new Error('Could not read package.json');
                    }
                    newVersion = versionUpdater.incrementVersion(previousVersion !== null && previousVersion !== void 0 ? previousVersion : '', semanticVersionLevel);
                    console.log("Previous version: ".concat(previousVersion), "New version: ".concat(newVersion));
                    // Apply the version changes in Android, iOS, and JS config files (E/App and Mobile-Expensify)
                    return [4 /*yield*/, Promise.all([updateAndroid(newVersion), updateIOS(newVersion), updateNPM(newVersion), updateConfigJSON(newVersion)])];
                case 2:
                    // Apply the version changes in Android, iOS, and JS config files (E/App and Mobile-Expensify)
                    _c.sent();
                    return [2 /*return*/, newVersion];
            }
        });
    });
}
if (require.main === module) {
    // Get and validate SEMVER_LEVEL input
    var semanticVersionLevel = (_a = process.argv.at(2)) !== null && _a !== void 0 ? _a : 'BUILD';
    if (!versionUpdater.isValidSemverLevel(semanticVersionLevel)) {
        throw new Error("Invalid semver level ".concat(semanticVersionLevel, ". Must be one of: ").concat(Object.values(versionUpdater.SEMANTIC_VERSION_LEVELS).join(', ')));
    }
    run(semanticVersionLevel);
}
exports.default = run;
