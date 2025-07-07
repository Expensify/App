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
/* eslint-disable @typescript-eslint/await-thenable */
var fs_1 = require("fs");
var path_1 = require("path");
var source_map_1 = require("source-map");
var parseCommandLineArguments_1 = require("./utils/parseCommandLineArguments");
var argsMap = (0, parseCommandLineArguments_1.default)();
var distDir = path_1.default.resolve(__dirname, '..', (_a = argsMap.path) !== null && _a !== void 0 ? _a : 'dist');
var outputFile = path_1.default.join(distDir, 'merged-source-map.js.map');
function mergeSourceMaps() {
    return __awaiter(this, void 0, void 0, function () {
        var sourceMapFiles, mergedGenerator, _loop_1, _i, sourceMapFiles_1, file;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    sourceMapFiles = fs_1.default
                        .readdirSync(distDir)
                        .filter(function (file) { return file.endsWith('.map'); })
                        .map(function (file) { return path_1.default.join(distDir, file); });
                    mergedGenerator = new source_map_1.SourceMapGenerator();
                    _loop_1 = function (file) {
                        var sourceMapContent, consumer;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    sourceMapContent = JSON.parse(fs_1.default.readFileSync(file, 'utf8'));
                                    return [4 /*yield*/, new source_map_1.SourceMapConsumer(sourceMapContent)];
                                case 1:
                                    consumer = _b.sent();
                                    consumer.eachMapping(function (mapping) {
                                        if (!mapping.source) {
                                            return;
                                        }
                                        mergedGenerator.addMapping({
                                            generated: {
                                                line: mapping.generatedLine,
                                                column: mapping.generatedColumn,
                                            },
                                            original: {
                                                line: mapping.originalLine,
                                                column: mapping.originalColumn,
                                            },
                                            source: mapping.source,
                                            name: mapping.name,
                                        });
                                    });
                                    // Add the sources content
                                    consumer.sources.forEach(function (sourceFile) {
                                        var content = consumer.sourceContentFor(sourceFile);
                                        if (content) {
                                            mergedGenerator.setSourceContent(sourceFile, content);
                                        }
                                    });
                                    consumer.destroy();
                                    return [2 /*return*/];
                            }
                        });
                    };
                    _i = 0, sourceMapFiles_1 = sourceMapFiles;
                    _a.label = 1;
                case 1:
                    if (!(_i < sourceMapFiles_1.length)) return [3 /*break*/, 4];
                    file = sourceMapFiles_1[_i];
                    return [5 /*yield**/, _loop_1(file)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4:
                    // Write the merged source map to a file
                    fs_1.default.writeFileSync(outputFile, mergedGenerator.toString());
                    console.log("Merged source map written to ".concat(outputFile));
                    return [2 /*return*/];
            }
        });
    });
}
mergeSourceMaps().catch(console.error);
