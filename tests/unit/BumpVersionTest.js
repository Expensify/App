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
var fs_1 = require("fs");
var memfs_1 = require("memfs");
var path_1 = require("path");
var bumpVersion_1 = require("../../scripts/bumpVersion");
var BUILD_GRADLE_PATH = path_1.default.resolve(__dirname, '../../android/app/build.gradle');
var ANDROID_MANIFEST_PATH = path_1.default.resolve(__dirname, '../../Mobile-Expensify/Android/AndroidManifest.xml');
var mockBuildGradle = "\n    android {\n        defaultConfig {\n            versionCode 1000001479\n            versionName \"1.0.1-47\"\n        }\n    }\n";
var mockAndroidManifest = "\n<?xml version=\"1.0\" encoding=\"utf-8\"?>\n<manifest xmlns:android=\"http://schemas.android.com/apk/res/android\"\n      package=\"org.me.mobiexpensifyg\"\n      android:versionCode=\"1000001479\" android:versionName=\"1.0.1-47\"\n      xmlns:tools=\"http://schemas.android.com/tools\">\n</manifest>";
jest.mock('fs');
jest.mock('fs/promises');
beforeEach(function () {
    var _a;
    // Clear the mocked filesystem
    memfs_1.vol.reset();
    // Set up mocked filesystem
    memfs_1.vol.fromJSON((_a = {},
        _a[BUILD_GRADLE_PATH] = mockBuildGradle,
        _a[ANDROID_MANIFEST_PATH] = mockAndroidManifest,
        _a));
});
describe('BumpVersion', function () {
    describe('generateAndroidVersionCode', function () {
        test.each([
            ['1.0.1-0', '1001000100'],
            ['1.0.1-44', '1001000144'],
            ['10.11.12-35', '1010111235'],
            ['0.0.1-1', '1000000101'],
            ['10.99.66-88', '1010996688'],
        ])('generateAndroidVersionCode(%s) – %s', function (input, expected) {
            expect((0, bumpVersion_1.generateAndroidVersionCode)(input, '10')).toBe(expected);
        });
    });
    describe('updateAndroidVersion', function () {
        test.each([
            [
                '1.0.1-47',
                "\n    android {\n        defaultConfig {\n            versionCode 1001000147\n            versionName \"1.0.1-47\"\n        }\n    }\n",
                "\n<?xml version=\"1.0\" encoding=\"utf-8\"?>\n<manifest xmlns:android=\"http://schemas.android.com/apk/res/android\"\n      package=\"org.me.mobiexpensifyg\"\n      android:versionCode=\"0501000147\" android:versionName=\"1.0.1-47\"\n      xmlns:tools=\"http://schemas.android.com/tools\">\n</manifest>",
            ],
            [
                '1.0.1-0',
                "\n    android {\n        defaultConfig {\n            versionCode 1001000100\n            versionName \"1.0.1-0\"\n        }\n    }\n",
                "\n<?xml version=\"1.0\" encoding=\"utf-8\"?>\n<manifest xmlns:android=\"http://schemas.android.com/apk/res/android\"\n      package=\"org.me.mobiexpensifyg\"\n      android:versionCode=\"0501000100\" android:versionName=\"1.0.1-0\"\n      xmlns:tools=\"http://schemas.android.com/tools\">\n</manifest>",
            ],
            [
                '10.99.66-88',
                "\n    android {\n        defaultConfig {\n            versionCode 1010996688\n            versionName \"10.99.66-88\"\n        }\n    }\n",
                "\n<?xml version=\"1.0\" encoding=\"utf-8\"?>\n<manifest xmlns:android=\"http://schemas.android.com/apk/res/android\"\n      package=\"org.me.mobiexpensifyg\"\n      android:versionCode=\"0510996688\" android:versionName=\"10.99.66-88\"\n      xmlns:tools=\"http://schemas.android.com/tools\">\n</manifest>",
            ],
        ])('updateAndroid("%s")', function (versionName, expectedBuildGradle, expectedAndroidManifest) { return __awaiter(void 0, void 0, void 0, function () {
            var buildGradle, androidManifest;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, bumpVersion_1.updateAndroid)(versionName)];
                    case 1:
                        _a.sent();
                        buildGradle = fs_1.default.readFileSync(BUILD_GRADLE_PATH, { encoding: 'utf8' });
                        expect(buildGradle).toBe(expectedBuildGradle);
                        androidManifest = fs_1.default.readFileSync(ANDROID_MANIFEST_PATH, { encoding: 'utf8' });
                        expect(androidManifest).toBe(expectedAndroidManifest);
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
