"use strict";
/**
 * Multifaceted script, its main function is running the e2e tests.
 *
 * When running in a local environment it can take care of building the APKs required for e2e testing
 * When running on the CI (depending on the flags passed to it) it will skip building and just package/re-sign
 * the correct e2e JS bundle into an existing APK
 *
 * It will run only one set of tests per branch, for you to compare results to get a performance analysis
 * You need to run it twice, once with the base branch (--branch main) and another time with another branch
 * and a label to (--branch my_branch --label delta)
 *
 * This two runs will generate a main.json and a delta.json with the performance data, which then you can merge via
 * node tests/e2e/merge.js
 */
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
/* eslint-disable @lwc/lwc/no-async-await,no-restricted-syntax,no-await-in-loop */
var child_process_1 = require("child_process");
var fs_1 = require("fs");
var compare_1 = require("./compare/compare");
var config_1 = require("./config");
var server_1 = require("./server");
var androidReversePort_1 = require("./utils/androidReversePort");
var closeANRPopup_1 = require("./utils/closeANRPopup");
var installApp_1 = require("./utils/installApp");
var killApp_1 = require("./utils/killApp");
var launchApp_1 = require("./utils/launchApp");
var Logger = require("./utils/logger");
var MeasureUtils = require("./utils/measure");
var sleep_1 = require("./utils/sleep");
var withFailTimeout_1 = require("./utils/withFailTimeout");
// VARIABLE CONFIGURATION
var args = process.argv.slice(2);
var getArg = function (argName) {
    var argIndex = args.indexOf(argName);
    if (argIndex === -1) {
        return undefined;
    }
    return args.at(argIndex + 1);
};
var config = config_1.default;
var setConfigPath = function (configPathParam) {
    var configPath = configPathParam;
    if (!(configPath === null || configPath === void 0 ? void 0 : configPath.startsWith('.'))) {
        configPath = "./".concat(configPath);
    }
    var customConfig = require(configPath).default;
    config = Object.assign(config_1.default, customConfig);
};
if (args.includes('--config')) {
    var configPath = getArg('--config');
    setConfigPath(configPath);
}
// Important: set app path only after correct config file has been loaded
var mainAppPath = (_a = getArg('--mainAppPath')) !== null && _a !== void 0 ? _a : config.MAIN_APP_PATH;
var deltaAppPath = (_b = getArg('--deltaAppPath')) !== null && _b !== void 0 ? _b : config.DELTA_APP_PATH;
// Check if files exists:
if (!fs_1.default.existsSync(mainAppPath)) {
    throw new Error("Main app path does not exist: ".concat(mainAppPath));
}
if (!fs_1.default.existsSync(deltaAppPath)) {
    throw new Error("Delta app path does not exist: ".concat(deltaAppPath));
}
// On CI it is important to re-create the output dir, it has a different owner
// therefore this process cannot write to it
try {
    fs_1.default.rmSync(config.OUTPUT_DIR, { recursive: true, force: true });
    fs_1.default.mkdirSync(config.OUTPUT_DIR);
}
catch (error) {
    // Do nothing
    console.error(error);
}
// START OF TEST CODE
var runTests = function () { return __awaiter(void 0, void 0, void 0, function () {
    // Function to run a single test iteration
    function runTestIteration(appPackage_1, iterationText_1, branch_1) {
        return __awaiter(this, arguments, void 0, function (appPackage, iterationText, branch, launchArgs) {
            var _a, promise, resetTimeout;
            var _this = this;
            if (launchArgs === void 0) { launchArgs = {}; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        Logger.info(iterationText);
                        // Making sure the app is really killed (e.g. if a prior test run crashed)
                        Logger.log('Killing', appPackage);
                        return [4 /*yield*/, (0, killApp_1.default)('android', appPackage)];
                    case 1:
                        _b.sent();
                        Logger.log('Launching', appPackage);
                        return [4 /*yield*/, (0, launchApp_1.default)('android', appPackage, config.ACTIVITY_PATH, launchArgs)];
                    case 2:
                        _b.sent();
                        _a = (0, withFailTimeout_1.default)(new Promise(function (resolve, reject) {
                            var removeListener = server.addTestDoneListener(function () {
                                Logger.success(iterationText);
                                var metrics = MeasureUtils.stop('done');
                                var test = server.getTestConfig();
                                if (server.isReadyToAcceptTestResults) {
                                    attachTestResult({
                                        name: "".concat(test.name, " (CPU)"),
                                        branch: branch,
                                        metric: metrics.cpu,
                                        unit: '%',
                                    });
                                    attachTestResult({
                                        name: "".concat(test.name, " (FPS)"),
                                        branch: branch,
                                        metric: metrics.fps,
                                        unit: 'FPS',
                                    });
                                    attachTestResult({
                                        name: "".concat(test.name, " (RAM)"),
                                        branch: branch,
                                        metric: metrics.ram,
                                        unit: 'MB',
                                    });
                                    attachTestResult({
                                        name: "".concat(test.name, " (CPU/JS)"),
                                        branch: branch,
                                        metric: metrics.jsThread,
                                        unit: '%',
                                    });
                                    attachTestResult({
                                        name: "".concat(test.name, " (CPU/UI)"),
                                        branch: branch,
                                        metric: metrics.uiThread,
                                        unit: '%',
                                    });
                                }
                                removeListener();
                                resolve();
                            });
                            MeasureUtils.start(appPackage, {
                                onAttachFailed: function () { return __awaiter(_this, void 0, void 0, function () {
                                    var e_1;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                Logger.warn('The PID has changed, trying to restart the test...');
                                                MeasureUtils.stop('retry');
                                                resetTimeout();
                                                removeListener();
                                                // something went wrong, let's wait a little bit and try again
                                                return [4 /*yield*/, (0, sleep_1.default)(5000)];
                                            case 1:
                                                // something went wrong, let's wait a little bit and try again
                                                _a.sent();
                                                _a.label = 2;
                                            case 2:
                                                _a.trys.push([2, 4, , 5]);
                                                // simply restart the test
                                                return [4 /*yield*/, runTestIteration(appPackage, iterationText, branch, launchArgs)];
                                            case 3:
                                                // simply restart the test
                                                _a.sent();
                                                resolve();
                                                return [3 /*break*/, 5];
                                            case 4:
                                                e_1 = _a.sent();
                                                // okay, give up and throw the exception further
                                                reject(e_1);
                                                return [3 /*break*/, 5];
                                            case 5: return [2 /*return*/];
                                        }
                                    });
                                }); },
                            });
                        }), iterationText), promise = _a.promise, resetTimeout = _a.resetTimeout;
                        return [4 /*yield*/, promise];
                    case 3:
                        _b.sent();
                        Logger.log('Killing', appPackage);
                        return [4 /*yield*/, (0, killApp_1.default)('android', appPackage)];
                    case 4:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    }
    var server, results, metricForTest, attachTestResult, skippedTests, clearTestResults, tests, _loop_1, testIndex;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                Logger.info('Installing apps and reversing port');
                return [4 /*yield*/, (0, installApp_1.default)(config.MAIN_APP_PACKAGE, mainAppPath, undefined, config_1.default.FLAG)];
            case 1:
                _b.sent();
                return [4 /*yield*/, (0, installApp_1.default)(config.DELTA_APP_PACKAGE, deltaAppPath, undefined, config_1.default.FLAG)];
            case 2:
                _b.sent();
                return [4 /*yield*/, (0, androidReversePort_1.default)()];
            case 3:
                _b.sent();
                server = (0, server_1.default)();
                return [4 /*yield*/, server.start()];
            case 4:
                _b.sent();
                results = {};
                metricForTest = {};
                attachTestResult = function (testResult) {
                    var _a;
                    var result = 0;
                    if ((testResult === null || testResult === void 0 ? void 0 : testResult.metric) !== undefined) {
                        if (testResult.metric < 0) {
                            return;
                        }
                        result = testResult.metric;
                    }
                    Logger.log("[LISTENER] Test '".concat(testResult === null || testResult === void 0 ? void 0 : testResult.name, "' on '").concat(testResult === null || testResult === void 0 ? void 0 : testResult.branch, "' measured ").concat(result).concat(testResult.unit));
                    if ((testResult === null || testResult === void 0 ? void 0 : testResult.branch) && !results[testResult.branch]) {
                        results[testResult.branch] = {};
                    }
                    if ((testResult === null || testResult === void 0 ? void 0 : testResult.branch) && (testResult === null || testResult === void 0 ? void 0 : testResult.name)) {
                        results[testResult.branch][testResult.name] = ((_a = results[testResult.branch][testResult.name]) !== null && _a !== void 0 ? _a : []).concat(result);
                    }
                    if (!metricForTest[testResult.name] && testResult.unit) {
                        metricForTest[testResult.name] = testResult.unit;
                    }
                };
                skippedTests = [];
                clearTestResults = function (test) {
                    skippedTests.push(test.name);
                    Object.keys(results).forEach(function (branch) {
                        Object.keys(results[branch]).forEach(function (metric) {
                            if (!metric.startsWith(test.name)) {
                                return;
                            }
                            delete results[branch][metric];
                        });
                    });
                };
                // Collect results while tests are being executed
                server.addTestResultListener(function (testResult) {
                    var _a = testResult.isCritical, isCritical = _a === void 0 ? true : _a;
                    if ((testResult === null || testResult === void 0 ? void 0 : testResult.error) != null && isCritical) {
                        throw new Error("Test '".concat(testResult.name, "' failed with error: ").concat(testResult.error));
                    }
                    if ((testResult === null || testResult === void 0 ? void 0 : testResult.error) != null && !isCritical) {
                        // force test completion, since we don't want to have timeout error for non being execute test
                        server.forceTestCompletion();
                        Logger.warn("Test '".concat(testResult.name, "' failed with error: ").concat(testResult.error));
                    }
                    attachTestResult(testResult);
                });
                tests = Object.keys(config.TESTS_CONFIG);
                _loop_1 = function (testIndex) {
                    var test, includes, warmupText, errorCountWarmupRef, iterations, i, e_2, errorCountRef_1, _loop_2, testIteration, exception_1;
                    return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0:
                                test = Object.values(config.TESTS_CONFIG).at(testIndex);
                                // re-instal app for each new test suite
                                return [4 /*yield*/, (0, installApp_1.default)(config.MAIN_APP_PACKAGE, mainAppPath, undefined, config_1.default.FLAG)];
                            case 1:
                                // re-instal app for each new test suite
                                _c.sent();
                                return [4 /*yield*/, (0, installApp_1.default)(config.DELTA_APP_PACKAGE, deltaAppPath, undefined, config_1.default.FLAG)];
                            case 2:
                                _c.sent();
                                // check if we want to skip the test
                                if (args.includes('--includes')) {
                                    includes = args[args.indexOf('--includes') + 1];
                                    // assume that "includes" is a regexp
                                    if (!((_a = test === null || test === void 0 ? void 0 : test.name) === null || _a === void 0 ? void 0 : _a.match(includes))) {
                                        return [2 /*return*/, "continue"];
                                    }
                                }
                                // Having the cool-down right at the beginning lowers the chances of heat
                                // throttling from the previous run (which we have no control over and will be a
                                // completely different AWS DF customer/app). It also gives the time to cool down between tests.
                                Logger.info("Cooling down for ".concat(config.BOOT_COOL_DOWN / 1000, "s"));
                                return [4 /*yield*/, (0, sleep_1.default)(config.BOOT_COOL_DOWN)];
                            case 3:
                                _c.sent();
                                server.setTestConfig(test);
                                server.setReadyToAcceptTestResults(false);
                                _c.label = 4;
                            case 4:
                                _c.trys.push([4, 17, , 18]);
                                warmupText = "Warmup for test '".concat(test === null || test === void 0 ? void 0 : test.name, "' [").concat(testIndex + 1, "/").concat(tests.length, "]");
                                errorCountWarmupRef = {
                                    errorCount: 0,
                                    allowedExceptions: 3,
                                };
                                iterations = 2;
                                i = 0;
                                _c.label = 5;
                            case 5:
                                if (!(i < iterations)) return [3 /*break*/, 12];
                                _c.label = 6;
                            case 6:
                                _c.trys.push([6, 9, , 11]);
                                // Warmup the main app:
                                return [4 /*yield*/, runTestIteration(config.MAIN_APP_PACKAGE, "[MAIN] ".concat(warmupText, ". Iteration ").concat(i + 1, "/").concat(iterations), config.BRANCH_MAIN)];
                            case 7:
                                // Warmup the main app:
                                _c.sent();
                                // Warmup the delta app:
                                return [4 /*yield*/, runTestIteration(config.DELTA_APP_PACKAGE, "[DELTA] ".concat(warmupText, ". Iteration ").concat(i + 1, "/").concat(iterations), config.BRANCH_DELTA)];
                            case 8:
                                // Warmup the delta app:
                                _c.sent();
                                return [3 /*break*/, 11];
                            case 9:
                                e_2 = _c.sent();
                                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                                Logger.error("Warmup failed with error: ".concat(e_2));
                                return [4 /*yield*/, (0, closeANRPopup_1.default)()];
                            case 10:
                                _c.sent();
                                MeasureUtils.stop('error-warmup');
                                server.clearAllTestDoneListeners();
                                errorCountWarmupRef.errorCount++;
                                i--; // repeat warmup again
                                if (errorCountWarmupRef.errorCount === errorCountWarmupRef.allowedExceptions) {
                                    Logger.error("There was an error running the warmup and we've reached the maximum number of allowed exceptions. Stopping the test run.");
                                    throw e_2;
                                }
                                return [3 /*break*/, 11];
                            case 11:
                                i++;
                                return [3 /*break*/, 5];
                            case 12:
                                server.setReadyToAcceptTestResults(true);
                                errorCountRef_1 = {
                                    errorCount: 0,
                                    allowedExceptions: 3,
                                };
                                _loop_2 = function (testIteration) {
                                    var onError, launchArgs, iterationText, mainIterationText, deltaIterationText, e_3;
                                    return __generator(this, function (_d) {
                                        switch (_d.label) {
                                            case 0:
                                                onError = function (e) { return __awaiter(void 0, void 0, void 0, function () {
                                                    return __generator(this, function (_a) {
                                                        switch (_a.label) {
                                                            case 0:
                                                                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                                                                Logger.error("Unexpected error during test execution: ".concat(e, ". "));
                                                                MeasureUtils.stop('error');
                                                                return [4 /*yield*/, (0, closeANRPopup_1.default)()];
                                                            case 1:
                                                                _a.sent();
                                                                server.clearAllTestDoneListeners();
                                                                errorCountRef_1.errorCount += 1;
                                                                if (testIteration === 0 || errorCountRef_1.errorCount === errorCountRef_1.allowedExceptions) {
                                                                    Logger.error("There was an error running the test and we've reached the maximum number of allowed exceptions. Stopping the test run.");
                                                                    // If the error happened on the first test run, the test is broken
                                                                    // and we should not continue running it. Or if we have reached the
                                                                    // maximum number of allowed exceptions, we should stop the test run.
                                                                    throw e;
                                                                }
                                                                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                                                                Logger.warn("There was an error running the test. Continuing the test run. Error: ".concat(e));
                                                                return [2 /*return*/];
                                                        }
                                                    });
                                                }); };
                                                launchArgs = {
                                                    mockNetwork: true,
                                                };
                                                iterationText = "Test '".concat(test === null || test === void 0 ? void 0 : test.name, "' [").concat(testIndex + 1, "/").concat(tests.length, "], iteration [").concat(testIteration + 1, "/").concat(config.RUNS, "]");
                                                mainIterationText = "[MAIN] ".concat(iterationText);
                                                deltaIterationText = "[DELTA] ".concat(iterationText);
                                                _d.label = 1;
                                            case 1:
                                                _d.trys.push([1, 4, , 6]);
                                                // Run the test on the main app:
                                                return [4 /*yield*/, runTestIteration(config.MAIN_APP_PACKAGE, mainIterationText, config.BRANCH_MAIN, launchArgs)];
                                            case 2:
                                                // Run the test on the main app:
                                                _d.sent();
                                                // Run the test on the delta app:
                                                return [4 /*yield*/, runTestIteration(config.DELTA_APP_PACKAGE, deltaIterationText, config.BRANCH_DELTA, launchArgs)];
                                            case 3:
                                                // Run the test on the delta app:
                                                _d.sent();
                                                return [3 /*break*/, 6];
                                            case 4:
                                                e_3 = _d.sent();
                                                return [4 /*yield*/, onError(e_3)];
                                            case 5:
                                                _d.sent();
                                                return [3 /*break*/, 6];
                                            case 6: return [2 /*return*/];
                                        }
                                    });
                                };
                                testIteration = 0;
                                _c.label = 13;
                            case 13:
                                if (!(testIteration < config.RUNS)) return [3 /*break*/, 16];
                                return [5 /*yield**/, _loop_2(testIteration)];
                            case 14:
                                _c.sent();
                                _c.label = 15;
                            case 15:
                                testIteration++;
                                return [3 /*break*/, 13];
                            case 16: return [3 /*break*/, 18];
                            case 17:
                                exception_1 = _c.sent();
                                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                                Logger.warn("Test ".concat(test === null || test === void 0 ? void 0 : test.name, " can not be finished due to error: ").concat(exception_1));
                                clearTestResults(test);
                                return [3 /*break*/, 18];
                            case 18: return [2 /*return*/];
                        }
                    });
                };
                testIndex = 0;
                _b.label = 5;
            case 5:
                if (!(testIndex < tests.length)) return [3 /*break*/, 8];
                return [5 /*yield**/, _loop_1(testIndex)];
            case 6:
                _b.sent();
                _b.label = 7;
            case 7:
                testIndex++;
                return [3 /*break*/, 5];
            case 8:
                // Calculate statistics and write them to our work file
                Logger.info('Calculating statics and writing results');
                return [4 /*yield*/, (0, compare_1.default)(results.main, results.delta, {
                        outputDir: config.OUTPUT_DIR,
                        outputFormat: 'all',
                        metricForTest: metricForTest,
                        skippedTests: skippedTests,
                    })];
            case 9:
                _b.sent();
                Logger.info('Finished calculating statics and writing results, stopping the test server');
                return [4 /*yield*/, server.stop()];
            case 10:
                _b.sent();
                return [2 /*return*/];
        }
    });
}); };
var run = function () { return __awaiter(void 0, void 0, void 0, function () {
    var e_4;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                Logger.info('Running e2e tests');
                _b.label = 1;
            case 1:
                _b.trys.push([1, 3, , 4]);
                return [4 /*yield*/, runTests()];
            case 2:
                _b.sent();
                process.exit(0);
                return [3 /*break*/, 4];
            case 3:
                e_4 = _b.sent();
                Logger.info('\n\nE2E test suite failed due to error:', e_4, '\nPrinting full logs:\n\n');
                // Write logcat, meminfo, emulator info to file as well:
                (0, child_process_1.execSync)("adb logcat -d > ".concat(config.OUTPUT_DIR, "/logcat.txt"));
                (0, child_process_1.execSync)("adb shell \"cat /proc/meminfo\" > ".concat(config.OUTPUT_DIR, "/meminfo.txt"));
                (0, child_process_1.execSync)("adb shell \"getprop\" > ".concat(config.OUTPUT_DIR, "/emulator-properties.txt"));
                (0, child_process_1.execSync)("cat ".concat(config.LOG_FILE));
                try {
                    (0, child_process_1.execSync)("cat ~/.android/avd/".concat((_a = process.env.AVD_NAME) !== null && _a !== void 0 ? _a : 'test', ".avd/config.ini > ").concat(config.OUTPUT_DIR, "/emulator-config.ini"));
                }
                catch (ignoredError) {
                    // the error is ignored, as the file might not exist if the test
                    // run wasn't started with an emulator
                }
                process.exit(1);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
run();
