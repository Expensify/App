"use strict";
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
var fs_1 = require("fs");
var path_1 = require("path");
var prettier_1 = require("prettier");
/**
 * Utility class to programmatically format files with prettier.
 */
var Prettier = /** @class */ (function () {
    function Prettier() {
        /**
         * Config loaded from .prettierrc.js
         */
        this.config = null;
    }
    /**
     * Format a single file with prettier.
     */
    Prettier.format = function (filePath) {
        return __awaiter(this, void 0, void 0, function () {
            var fileContent, formatted;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!Prettier.instance) return [3 /*break*/, 2];
                        Prettier.instance = new Prettier();
                        return [4 /*yield*/, Prettier.instance.loadConfig(filePath)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        if (!Prettier.instance.config) {
                            throw new Error('Failed to load Prettier configuration.');
                        }
                        fileContent = fs_1.default.readFileSync(filePath, 'utf8');
                        return [4 /*yield*/, prettier_1.default.format(fileContent, __assign(__assign({}, Prettier.instance.config), { filepath: filePath }))];
                    case 3:
                        formatted = _a.sent();
                        fs_1.default.writeFileSync(filePath, formatted, 'utf8');
                        console.log("\u2705 Formatted: ".concat(filePath));
                        return [2 /*return*/];
                }
            });
        });
    };
    Prettier.prototype.loadConfig = function (filePath) {
        return __awaiter(this, void 0, void 0, function () {
            var configPath, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        configPath = path_1.default.resolve(__dirname, '../../.prettierrc.js');
                        _a = this;
                        return [4 /*yield*/, prettier_1.default.resolveConfig(filePath, {
                                config: configPath,
                            })];
                    case 1:
                        _a.config = _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return Prettier;
}());
exports.default = Prettier;
