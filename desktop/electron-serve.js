"use strict";
/* eslint-disable @typescript-eslint/no-misused-promises */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.default = electronServe;
var electron_1 = require("electron");
var fs_1 = require("fs");
var mime_types_1 = require("mime-types");
var path_1 = require("path");
var FILE_NOT_FOUND = -6;
var getPath = function (filePath) { return __awaiter(void 0, void 0, void 0, function () {
    var result, _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                return [4 /*yield*/, fs_1.default.promises.stat(filePath)];
            case 1:
                result = _b.sent();
                if (result.isFile()) {
                    return [2 /*return*/, filePath];
                }
                if (result.isDirectory()) {
                    // eslint-disable-next-line @typescript-eslint/return-await
                    return [2 /*return*/, getPath(path_1.default.join(filePath, 'index.html'))];
                }
                return [3 /*break*/, 3];
            case 2:
                _a = _b.sent();
                return [2 /*return*/, null];
            case 3: return [2 /*return*/];
        }
    });
}); };
function electronServe(options) {
    var _this = this;
    var mandatoryOptions = __assign({ isCorsEnabled: true, scheme: 'app', hostname: '-', file: 'index' }, options);
    if (!mandatoryOptions.directory) {
        throw new Error('The `directory` option is required');
    }
    mandatoryOptions.directory = path_1.default.resolve(electron_1.app.getAppPath(), mandatoryOptions.directory);
    var handler = function (request, callback) { return __awaiter(_this, void 0, void 0, function () {
        var filePath, resolvedPath, mimeType, data, error_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    filePath = path_1.default.join(mandatoryOptions.directory, decodeURIComponent(new URL(request.url).pathname));
                    return [4 /*yield*/, getPath(filePath)];
                case 1:
                    resolvedPath = (_a = (_b.sent())) !== null && _a !== void 0 ? _a : path_1.default.join(mandatoryOptions.directory, "".concat(mandatoryOptions.file, ".html"));
                    mimeType = mime_types_1.default.lookup(resolvedPath) || 'application/octet-stream';
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, fs_1.default.promises.readFile(resolvedPath)];
                case 3:
                    data = _b.sent();
                    callback({
                        mimeType: mimeType,
                        data: Buffer.from(data),
                        headers: {
                            // eslint-disable-next-line @typescript-eslint/naming-convention
                            'Document-Policy': 'js-profiling',
                        },
                    });
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _b.sent();
                    callback({ error: FILE_NOT_FOUND });
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    electron_1.protocol.registerSchemesAsPrivileged([
        {
            scheme: mandatoryOptions.scheme,
            privileges: {
                standard: true,
                secure: true,
                allowServiceWorkers: true,
                supportFetchAPI: true,
                corsEnabled: mandatoryOptions.isCorsEnabled,
            },
        },
    ]);
    electron_1.app.on('ready', function () {
        var partitionSession = mandatoryOptions.partition ? electron_1.session.fromPartition(mandatoryOptions.partition) : electron_1.session.defaultSession;
        partitionSession.protocol.registerBufferProtocol(mandatoryOptions.scheme, handler);
    });
    // eslint-disable-next-line @typescript-eslint/naming-convention
    return function (window_, searchParameters) { return __awaiter(_this, void 0, void 0, function () {
        var queryString;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    queryString = searchParameters ? "?".concat(new URLSearchParams(searchParameters).toString()) : '';
                    return [4 /*yield*/, window_.loadURL("".concat(mandatoryOptions.scheme, "://").concat(mandatoryOptions.hostname).concat(queryString))];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); };
}
