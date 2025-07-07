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
var falso_1 = require("@ngneat/falso");
var react_native_onyx_1 = require("react-native-onyx");
var reassure_1 = require("reassure");
var OptionsListUtils_1 = require("@libs/OptionsListUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var OptionsListUtils_2 = require("../../src/libs/OptionsListUtils");
var createCollection_1 = require("../utils/collections/createCollection");
var optionData_1 = require("../utils/collections/optionData");
var personalDetails_1 = require("../utils/collections/personalDetails");
var reportActions_1 = require("../utils/collections/reportActions");
var reports_1 = require("../utils/collections/reports");
var waitForBatchedUpdates_1 = require("../utils/waitForBatchedUpdates");
var REPORTS_COUNT = 5000;
var PERSONAL_DETAILS_LIST_COUNT = 1000;
var SEARCH_VALUE = 'TestingValue';
var PERSONAL_DETAILS_COUNT = 1000;
var SELECTED_OPTIONS_COUNT = 1000;
var RECENT_REPORTS_COUNT = 100;
var reports = (0, createCollection_1.default)(function (item) { return "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(item.reportID); }, function (index) { return (__assign(__assign({}, (0, reports_1.createRandomReport)(index)), { type: (0, falso_1.rand)(Object.values(CONST_1.default.REPORT.TYPE)), lastVisibleActionCreated: (0, reportActions_1.getRandomDate)() })); }, REPORTS_COUNT);
var personalDetails = (0, createCollection_1.default)(function (item) { return item.accountID; }, function (index) { return (0, personalDetails_1.default)(index); }, PERSONAL_DETAILS_LIST_COUNT);
var getMockedReports = function (length) {
    if (length === void 0) { length = 500; }
    return (0, createCollection_1.default)(function (item) { return "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(item.reportID); }, function (index) { return (__assign(__assign({}, (0, reports_1.createRandomReport)(index)), { type: (0, falso_1.rand)(Object.values(CONST_1.default.REPORT.TYPE)), lastVisibleActionCreated: (0, reportActions_1.getRandomDate)() })); }, length);
};
var getMockedPersonalDetails = function (length) {
    if (length === void 0) { length = 500; }
    return (0, createCollection_1.default)(function (item) { return item.accountID; }, function (index) { return (0, personalDetails_1.default)(index); }, length);
};
var mockedReportsMap = getMockedReports(REPORTS_COUNT);
var mockedPersonalDetailsMap = getMockedPersonalDetails(PERSONAL_DETAILS_LIST_COUNT);
var mockedBetas = Object.values(CONST_1.default.BETAS);
jest.mock('@react-navigation/native', function () {
    var actualNav = jest.requireActual('@react-navigation/native');
    return __assign(__assign({}, actualNav), { createNavigationContainerRef: function () { return ({
            getState: function () { return jest.fn(); },
        }); } });
});
var options = (0, OptionsListUtils_1.createOptionList)(personalDetails, reports);
var ValidOptionsConfig = {
    betas: mockedBetas,
    includeRecentReports: true,
    includeTasks: true,
    includeThreads: true,
    includeMoneyRequests: true,
    includeMultipleParticipantReports: true,
    includeSelfDM: true,
    includeOwnedWorkspaceChats: true,
};
/* GetOption is the private function and is never called directly, we are testing the functions which call getOption with different params */
describe('OptionsListUtils', function () {
    beforeAll(function () {
        react_native_onyx_1.default.init({
            keys: ONYXKEYS_1.default,
        });
        react_native_onyx_1.default.multiSet(__assign(__assign({}, mockedReportsMap), mockedPersonalDetailsMap));
    });
    afterAll(function () {
        react_native_onyx_1.default.clear();
    });
    /* Testing getSearchOptions */
    test('[OptionsListUtils] getSearchOptions', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, (0, reassure_1.measureFunction)(function () { return (0, OptionsListUtils_1.getSearchOptions)(options, mockedBetas); })];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    /* Testing getShareLogOptions */
    test('[OptionsListUtils] getShareLogOptions', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, (0, reassure_1.measureFunction)(function () { return (0, OptionsListUtils_1.getShareLogOptions)(options, mockedBetas); })];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    /* Testing getFilteredOptions */
    test('[OptionsListUtils] getFilteredOptions with search value', function () { return __awaiter(void 0, void 0, void 0, function () {
        var formattedOptions;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                case 1:
                    _a.sent();
                    formattedOptions = (0, OptionsListUtils_1.getValidOptions)({ reports: options.reports, personalDetails: options.personalDetails }, ValidOptionsConfig);
                    return [4 /*yield*/, (0, reassure_1.measureFunction)(function () {
                            (0, OptionsListUtils_1.filterAndOrderOptions)(formattedOptions, SEARCH_VALUE);
                        })];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test('[OptionsListUtils] getFilteredOptions with empty search value', function () { return __awaiter(void 0, void 0, void 0, function () {
        var formattedOptions;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                case 1:
                    _a.sent();
                    formattedOptions = (0, OptionsListUtils_1.getValidOptions)({ reports: options.reports, personalDetails: options.personalDetails }, ValidOptionsConfig);
                    return [4 /*yield*/, (0, reassure_1.measureFunction)(function () {
                            (0, OptionsListUtils_1.filterAndOrderOptions)(formattedOptions, '');
                        })];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    /* Testing getShareDestinationOptions */
    test('[OptionsListUtils] getShareDestinationOptions', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, (0, reassure_1.measureFunction)(function () { return (0, OptionsListUtils_1.getShareDestinationOptions)(options.reports, options.personalDetails, mockedBetas); })];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    /* Testing getMemberInviteOptions */
    test('[OptionsListUtils] getMemberInviteOptions', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, (0, reassure_1.measureFunction)(function () { return (0, OptionsListUtils_1.getMemberInviteOptions)(options.personalDetails, mockedBetas); })];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test('[OptionsListUtils] worst case scenario with a search term that matches a subset of selectedOptions, filteredRecentReports, and filteredPersonalDetails', function () { return __awaiter(void 0, void 0, void 0, function () {
        var SELECTED_OPTION_TEXT, RECENT_REPORT_TEXT, PERSONAL_DETAIL_TEXT, SELECTED_OPTIONS_MATCH_FREQUENCY, RECENT_REPORTS_MATCH_FREQUENCY, PERSONAL_DETAILS_MATCH_FREQUENCY, selectedOptions, filteredRecentReports, filteredPersonalDetails, mockedPersonalDetails;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    SELECTED_OPTION_TEXT = 'Selected Option';
                    RECENT_REPORT_TEXT = 'Recent Report';
                    PERSONAL_DETAIL_TEXT = 'Personal Detail';
                    SELECTED_OPTIONS_MATCH_FREQUENCY = 2;
                    RECENT_REPORTS_MATCH_FREQUENCY = 3;
                    PERSONAL_DETAILS_MATCH_FREQUENCY = 5;
                    selectedOptions = (0, createCollection_1.default)(function (item) { return item.reportID; }, function (index) { return (__assign(__assign({}, (0, optionData_1.default)(index)), { searchText: index % SELECTED_OPTIONS_MATCH_FREQUENCY === 0 ? SEARCH_VALUE : "".concat(SELECTED_OPTION_TEXT, " ").concat(index) })); }, SELECTED_OPTIONS_COUNT);
                    filteredRecentReports = (0, createCollection_1.default)(function (item) { return item.reportID; }, function (index) { return (__assign(__assign({}, (0, optionData_1.default)(index + SELECTED_OPTIONS_COUNT)), { searchText: index % RECENT_REPORTS_MATCH_FREQUENCY === 0 ? SEARCH_VALUE : "".concat(RECENT_REPORT_TEXT, " ").concat(index) })); }, RECENT_REPORTS_COUNT);
                    filteredPersonalDetails = (0, createCollection_1.default)(function (item) { return item.reportID; }, function (index) { return (__assign(__assign({}, (0, optionData_1.default)(index + SELECTED_OPTIONS_COUNT + RECENT_REPORTS_COUNT)), { searchText: index % PERSONAL_DETAILS_MATCH_FREQUENCY === 0 ? SEARCH_VALUE : "".concat(PERSONAL_DETAIL_TEXT, " ").concat(index) })); }, PERSONAL_DETAILS_COUNT);
                    mockedPersonalDetails = getMockedPersonalDetails(PERSONAL_DETAILS_COUNT);
                    return [4 /*yield*/, (0, reassure_1.measureFunction)(function () {
                            return (0, OptionsListUtils_2.formatSectionsFromSearchTerm)(SEARCH_VALUE, Object.values(selectedOptions), Object.values(filteredRecentReports), Object.values(filteredPersonalDetails), mockedPersonalDetails, true);
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test('[OptionsListUtils] empty search term with selected options and mocked personal details', function () { return __awaiter(void 0, void 0, void 0, function () {
        var selectedOptions, mockedPersonalDetails;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    selectedOptions = (0, createCollection_1.default)(function (item) { return item.reportID; }, optionData_1.default, SELECTED_OPTIONS_COUNT);
                    mockedPersonalDetails = getMockedPersonalDetails(PERSONAL_DETAILS_COUNT);
                    return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, (0, reassure_1.measureFunction)(function () { return (0, OptionsListUtils_2.formatSectionsFromSearchTerm)('', Object.values(selectedOptions), [], [], mockedPersonalDetails, true); })];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
});
