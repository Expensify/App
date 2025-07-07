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
var react_native_onyx_1 = require("react-native-onyx");
var DateUtils_1 = require("@libs/DateUtils");
var OptionsListUtils_1 = require("@libs/OptionsListUtils");
var ReportUtils_1 = require("@libs/ReportUtils");
var CONST_1 = require("@src/CONST");
var IntlStore_1 = require("@src/languages/IntlStore");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var LHNTestUtils_1 = require("../utils/LHNTestUtils");
var waitForBatchedUpdates_1 = require("../utils/waitForBatchedUpdates");
jest.mock('@rnmapbox/maps', function () {
    return {
        default: jest.fn(),
        MarkerView: jest.fn(),
        setAccessToken: jest.fn(),
    };
});
jest.mock('@react-native-community/geolocation', function () { return ({
    setRNConfiguration: jest.fn(),
}); });
describe('OptionsListUtils', function () {
    beforeAll(function () {
        IntlStore_1.default.load(CONST_1.default.LOCALES.EN);
        return (0, waitForBatchedUpdates_1.default)();
    });
    var policyID = 'ABC123';
    var POLICY = {
        id: policyID,
        name: 'Hero Policy',
        role: 'user',
        type: CONST_1.default.POLICY.TYPE.TEAM,
        owner: 'reedrichards@expensify.com',
        outputCurrency: '',
        isPolicyExpenseChatEnabled: false,
        approvalMode: CONST_1.default.POLICY.APPROVAL_MODE.OPTIONAL,
    };
    // Given a set of reports with both single participants and multiple participants some pinned and some not
    var REPORTS = {
        '1': {
            lastReadTime: '2021-01-14 11:25:39.295',
            lastVisibleActionCreated: '2022-11-22 03:26:02.015',
            isPinned: false,
            reportID: '1',
            participants: {
                2: { notificationPreference: CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.ALWAYS },
                1: { notificationPreference: CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.ALWAYS },
                5: { notificationPreference: CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.ALWAYS },
            },
            reportName: 'Iron Man, Mister Fantastic, Invisible Woman',
            type: CONST_1.default.REPORT.TYPE.CHAT,
        },
        '2': {
            lastReadTime: '2021-01-14 11:25:39.296',
            lastVisibleActionCreated: '2022-11-22 03:26:02.016',
            isPinned: false,
            reportID: '2',
            participants: {
                2: { notificationPreference: CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.ALWAYS },
                3: { notificationPreference: CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.ALWAYS },
            },
            reportName: 'Spider-Man',
            type: CONST_1.default.REPORT.TYPE.CHAT,
        },
        // This is the only report we are pinning in this test
        '3': {
            lastReadTime: '2021-01-14 11:25:39.297',
            lastVisibleActionCreated: '2022-11-22 03:26:02.170',
            isPinned: true,
            reportID: '3',
            participants: {
                2: { notificationPreference: CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.ALWAYS },
                1: { notificationPreference: CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.ALWAYS },
            },
            reportName: 'Mister Fantastic',
            type: CONST_1.default.REPORT.TYPE.CHAT,
        },
        '4': {
            lastReadTime: '2021-01-14 11:25:39.298',
            lastVisibleActionCreated: '2022-11-22 03:26:02.180',
            isPinned: false,
            reportID: '4',
            participants: {
                2: { notificationPreference: CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.ALWAYS },
                4: { notificationPreference: CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.ALWAYS },
            },
            reportName: 'Black Panther',
            type: CONST_1.default.REPORT.TYPE.CHAT,
        },
        '5': {
            lastReadTime: '2021-01-14 11:25:39.299',
            lastVisibleActionCreated: '2022-11-22 03:26:02.019',
            isPinned: false,
            reportID: '5',
            participants: {
                2: { notificationPreference: CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.ALWAYS },
                5: { notificationPreference: CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.ALWAYS },
            },
            reportName: 'Invisible Woman',
            type: CONST_1.default.REPORT.TYPE.CHAT,
        },
        '6': {
            lastReadTime: '2021-01-14 11:25:39.300',
            lastVisibleActionCreated: '2022-11-22 03:26:02.020',
            isPinned: false,
            reportID: '6',
            participants: {
                2: { notificationPreference: CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.ALWAYS },
                6: { notificationPreference: CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.ALWAYS },
            },
            reportName: 'Thor',
            type: CONST_1.default.REPORT.TYPE.CHAT,
        },
        // Note: This report has the largest lastVisibleActionCreated
        '7': {
            lastReadTime: '2021-01-14 11:25:39.301',
            lastVisibleActionCreated: '2022-11-22 03:26:03.999',
            isPinned: false,
            reportID: '7',
            participants: {
                2: { notificationPreference: CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.ALWAYS },
                7: { notificationPreference: CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.ALWAYS },
            },
            reportName: 'Captain America',
            type: CONST_1.default.REPORT.TYPE.CHAT,
        },
        // Note: This report has no lastVisibleActionCreated
        '8': {
            lastReadTime: '2021-01-14 11:25:39.301',
            lastVisibleActionCreated: '2022-11-22 03:26:02.000',
            isPinned: false,
            reportID: '8',
            participants: {
                2: { notificationPreference: CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.ALWAYS },
                12: { notificationPreference: CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.ALWAYS },
            },
            reportName: 'Silver Surfer',
            type: CONST_1.default.REPORT.TYPE.CHAT,
        },
        // Note: This report has an IOU
        '9': {
            lastReadTime: '2021-01-14 11:25:39.302',
            lastVisibleActionCreated: '2022-11-22 03:26:02.998',
            isPinned: false,
            reportID: '9',
            participants: {
                2: { notificationPreference: CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.ALWAYS },
                8: { notificationPreference: CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.ALWAYS },
            },
            reportName: 'Mister Sinister',
            iouReportID: '100',
            type: CONST_1.default.REPORT.TYPE.CHAT,
        },
        // This report is an archived room – it does not have a name and instead falls back on oldPolicyName
        '10': {
            lastReadTime: '2021-01-14 11:25:39.200',
            lastVisibleActionCreated: '2022-11-22 03:26:02.001',
            reportID: '10',
            isPinned: false,
            participants: {
                2: { notificationPreference: CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.ALWAYS },
                7: { notificationPreference: CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.ALWAYS },
            },
            reportName: '',
            oldPolicyName: "SHIELD's workspace",
            chatType: CONST_1.default.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
            isOwnPolicyExpenseChat: true,
            type: CONST_1.default.REPORT.TYPE.CHAT,
            lastActorAccountID: 2,
        },
        '11': {
            lastReadTime: '2021-01-14 11:25:39.200',
            lastVisibleActionCreated: '2022-11-22 03:26:02.001',
            reportID: '11',
            isPinned: false,
            participants: {
                10: { notificationPreference: CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.HIDDEN },
            },
            reportName: '',
            chatType: CONST_1.default.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
            isOwnPolicyExpenseChat: true,
            type: CONST_1.default.REPORT.TYPE.CHAT,
            policyID: policyID,
            policyName: POLICY.name,
        },
        // Thread report with notification preference = hidden
        '12': {
            lastReadTime: '2021-01-14 11:25:39.200',
            lastVisibleActionCreated: '2022-11-22 03:26:02.001',
            reportID: '11',
            isPinned: false,
            participants: {
                10: { notificationPreference: CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.HIDDEN },
            },
            reportName: '',
            chatType: CONST_1.default.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
            isOwnPolicyExpenseChat: true,
            type: CONST_1.default.REPORT.TYPE.CHAT,
            policyID: policyID,
            policyName: POLICY.name,
            parentReportActionID: '123',
            parentReportID: '123',
        },
    };
    var REPORTS_WITH_CONCIERGE = __assign(__assign({}, REPORTS), { '11': {
            lastReadTime: '2021-01-14 11:25:39.302',
            lastVisibleActionCreated: '2022-11-22 03:26:02.022',
            isPinned: false,
            reportID: '11',
            participants: {
                2: { notificationPreference: CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.ALWAYS },
                999: { notificationPreference: CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.ALWAYS },
            },
            reportName: 'Concierge',
            type: CONST_1.default.REPORT.TYPE.CHAT,
        } });
    var REPORTS_WITH_CHRONOS = __assign(__assign({}, REPORTS), { '12': {
            lastReadTime: '2021-01-14 11:25:39.302',
            lastVisibleActionCreated: '2022-11-22 03:26:02.022',
            isPinned: false,
            reportID: '12',
            participants: {
                2: { notificationPreference: CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.ALWAYS },
                1000: { notificationPreference: CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.ALWAYS },
            },
            reportName: 'Chronos',
            type: CONST_1.default.REPORT.TYPE.CHAT,
        } });
    var REPORTS_WITH_RECEIPTS = __assign(__assign({}, REPORTS), { '13': {
            lastReadTime: '2021-01-14 11:25:39.302',
            lastVisibleActionCreated: '2022-11-22 03:26:02.022',
            isPinned: false,
            reportID: '13',
            participants: {
                2: { notificationPreference: CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.ALWAYS },
                1001: { notificationPreference: CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.ALWAYS },
            },
            reportName: 'Receipts',
            type: CONST_1.default.REPORT.TYPE.CHAT,
        } });
    var REPORTS_WITH_WORKSPACE_ROOMS = __assign(__assign({}, REPORTS), { '14': {
            lastReadTime: '2021-01-14 11:25:39.302',
            lastVisibleActionCreated: '2022-11-22 03:26:02.022',
            isPinned: false,
            reportID: '14',
            participants: {
                2: { notificationPreference: CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.ALWAYS },
                1: { notificationPreference: CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.ALWAYS },
                10: { notificationPreference: CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.ALWAYS },
                3: { notificationPreference: CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.ALWAYS },
            },
            reportName: '',
            oldPolicyName: 'Avengers Room',
            chatType: CONST_1.default.REPORT.CHAT_TYPE.POLICY_ADMINS,
            isOwnPolicyExpenseChat: true,
            type: CONST_1.default.REPORT.TYPE.CHAT,
        } });
    var REPORTS_WITH_CHAT_ROOM = __assign(__assign({}, REPORTS), { 15: {
            lastReadTime: '2021-01-14 11:25:39.301',
            lastVisibleActionCreated: '2022-11-22 03:26:02.000',
            isPinned: false,
            reportID: '15',
            participants: {
                2: { notificationPreference: CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.ALWAYS },
                3: { notificationPreference: CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.ALWAYS },
                4: { notificationPreference: CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.ALWAYS },
            },
            reportName: 'Spider-Man, Black Panther',
            type: CONST_1.default.REPORT.TYPE.CHAT,
            chatType: CONST_1.default.REPORT.CHAT_TYPE.DOMAIN_ALL,
        } });
    var REPORTS_WITH_SELF_DM = {
        16: {
            lastReadTime: '2021-01-14 11:25:39.302',
            lastVisibleActionCreated: '2022-11-22 03:26:02.022',
            isPinned: false,
            reportID: '16',
            participants: {
                2: { notificationPreference: CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.ALWAYS },
            },
            reportName: 'Expense Report',
            type: CONST_1.default.REPORT.TYPE.EXPENSE,
        },
        17: {
            lastReadTime: '2021-01-14 11:25:39.302',
            lastVisibleActionCreated: '2022-11-22 03:26:02.022',
            isPinned: false,
            reportID: '17',
            participants: {
                2: { notificationPreference: CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.ALWAYS },
            },
            reportName: '',
            type: CONST_1.default.REPORT.TYPE.CHAT,
            chatType: CONST_1.default.REPORT.CHAT_TYPE.SELF_DM,
        },
    };
    var activePolicyID = 'DEF456';
    // And a set of personalDetails some with existing reports and some without
    var PERSONAL_DETAILS = {
        // These exist in our reports
        '1': {
            accountID: 1,
            displayName: 'Mister Fantastic',
            login: 'reedrichards@expensify.com',
            isSelected: true,
            reportID: '1',
        },
        '2': {
            accountID: 2,
            displayName: 'Iron Man',
            login: 'tonystark@expensify.com',
            reportID: '1',
        },
        '3': {
            accountID: 3,
            displayName: 'Spider-Man',
            login: 'peterparker@expensify.com',
            reportID: '1',
        },
        '4': {
            accountID: 4,
            displayName: 'Black Panther',
            login: 'tchalla@expensify.com',
            reportID: '1',
        },
        '5': {
            accountID: 5,
            displayName: 'Invisible Woman',
            login: 'suestorm@expensify.com',
            reportID: '1',
        },
        '6': {
            accountID: 6,
            displayName: 'Thor',
            login: 'thor@expensify.com',
            reportID: '1',
        },
        '7': {
            accountID: 7,
            displayName: 'Captain America',
            login: 'steverogers@expensify.com',
            reportID: '1',
        },
        '8': {
            accountID: 8,
            displayName: 'Mr Sinister',
            login: 'mistersinister@marauders.com',
            reportID: '1',
        },
        // These do not exist in reports at all
        '9': {
            accountID: 9,
            displayName: 'Black Widow',
            login: 'natasharomanoff@expensify.com',
            reportID: '',
        },
        '10': {
            accountID: 10,
            displayName: 'The Incredible Hulk',
            login: 'brucebanner@expensify.com',
            reportID: '',
        },
    };
    var PERSONAL_DETAILS_WITH_CONCIERGE = __assign(__assign({}, PERSONAL_DETAILS), { '999': {
            accountID: 999,
            displayName: 'Concierge',
            login: 'concierge@expensify.com',
            reportID: '',
        } });
    var PERSONAL_DETAILS_WITH_CHRONOS = __assign(__assign({}, PERSONAL_DETAILS), { '1000': {
            accountID: 1000,
            displayName: 'Chronos',
            login: 'chronos@expensify.com',
            reportID: '',
        } });
    var PERSONAL_DETAILS_WITH_RECEIPTS = __assign(__assign({}, PERSONAL_DETAILS), { '1001': {
            accountID: 1001,
            displayName: 'Receipts',
            login: 'receipts@expensify.com',
            reportID: '',
        } });
    var PERSONAL_DETAILS_WITH_MANAGER_MCTEST = __assign(__assign({}, PERSONAL_DETAILS), { '1003': {
            accountID: 1003,
            displayName: 'Manager McTest',
            login: CONST_1.default.EMAIL.MANAGER_MCTEST,
            reportID: '',
        } });
    var PERSONAL_DETAILS_WITH_PERIODS = __assign(__assign({}, PERSONAL_DETAILS), { '1002': {
            accountID: 1002,
            displayName: 'The Flash',
            login: 'barry.allen@expensify.com',
            reportID: '',
        } });
    var WORKSPACE_CHATS = [
        {
            reportID: '1',
            text: 'Google Workspace',
            policyID: '11',
            isPolicyExpenseChat: true,
        },
        {
            reportID: '2',
            text: 'Google Drive Workspace',
            policyID: '22',
            isPolicyExpenseChat: false,
        },
        {
            reportID: '3',
            text: 'Slack Team Workspace',
            policyID: '33',
            isPolicyExpenseChat: false,
        },
        {
            reportID: '4',
            text: 'Slack Development Workspace',
            policyID: '44',
            isPolicyExpenseChat: true,
        },
        {
            reportID: '5',
            text: 'Microsoft Teams Workspace',
            policyID: '55',
            isPolicyExpenseChat: false,
        },
        {
            reportID: '6',
            text: 'Microsoft Project Workspace',
            policyID: '66',
            isPolicyExpenseChat: false,
        },
        {
            reportID: '7',
            text: 'Notion Design Workspace',
            policyID: '77',
            isPolicyExpenseChat: false,
        },
        {
            reportID: '8',
            text: 'Notion Workspace for Marketing',
            policyID: activePolicyID,
            isPolicyExpenseChat: true,
        },
        {
            reportID: '9',
            text: 'Adana Task Workspace',
            policyID: '99',
            isPolicyExpenseChat: false,
        },
        {
            reportID: '10',
            text: 'Adana Project Management',
            policyID: '1010',
            isPolicyExpenseChat: true,
        },
    ];
    var reportNameValuePairs = {
        private_isArchived: DateUtils_1.default.getDBTime(),
    };
    // Set the currently logged in user, report data, and personal details
    beforeAll(function () {
        var _a;
        react_native_onyx_1.default.init({
            keys: ONYXKEYS_1.default,
            initialKeyStates: (_a = {},
                _a[ONYXKEYS_1.default.SESSION] = { accountID: 2, email: 'tonystark@expensify.com' },
                _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT, "100")] = {
                    reportID: '',
                    ownerAccountID: 8,
                    total: 1000,
                },
                _a["".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID)] = POLICY,
                _a[ONYXKEYS_1.default.NVP_ACTIVE_POLICY_ID] = activePolicyID,
                _a[ONYXKEYS_1.default.NVP_DISMISSED_PRODUCT_TRAINING] = {},
                _a),
        });
        react_native_onyx_1.default.registerLogger(function () { });
        return (0, waitForBatchedUpdates_1.default)().then(function () { return react_native_onyx_1.default.set(ONYXKEYS_1.default.PERSONAL_DETAILS_LIST, PERSONAL_DETAILS); });
    });
    var OPTIONS;
    var OPTIONS_WITH_CONCIERGE;
    var OPTIONS_WITH_CHRONOS;
    var OPTIONS_WITH_RECEIPTS;
    var OPTIONS_WITH_WORKSPACE_ROOM;
    var OPTIONS_WITH_MANAGER_MCTEST;
    beforeEach(function () {
        react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_NAME_VALUE_PAIRS, "10"), reportNameValuePairs);
        OPTIONS = (0, OptionsListUtils_1.createOptionList)(PERSONAL_DETAILS, REPORTS);
        OPTIONS_WITH_CONCIERGE = (0, OptionsListUtils_1.createOptionList)(PERSONAL_DETAILS_WITH_CONCIERGE, REPORTS_WITH_CONCIERGE);
        OPTIONS_WITH_CHRONOS = (0, OptionsListUtils_1.createOptionList)(PERSONAL_DETAILS_WITH_CHRONOS, REPORTS_WITH_CHRONOS);
        OPTIONS_WITH_RECEIPTS = (0, OptionsListUtils_1.createOptionList)(PERSONAL_DETAILS_WITH_RECEIPTS, REPORTS_WITH_RECEIPTS);
        OPTIONS_WITH_WORKSPACE_ROOM = (0, OptionsListUtils_1.createOptionList)(PERSONAL_DETAILS, REPORTS_WITH_WORKSPACE_ROOMS);
        OPTIONS_WITH_MANAGER_MCTEST = (0, OptionsListUtils_1.createOptionList)(PERSONAL_DETAILS_WITH_MANAGER_MCTEST);
    });
    describe('getSearchOptions()', function () {
        it('should return all options when no search value is provided', function () {
            // Given a set of options
            // When we call getSearchOptions with all betas
            var results = (0, OptionsListUtils_1.getSearchOptions)(OPTIONS, [CONST_1.default.BETAS.ALL]);
            // Then all personal details (including those that have reports) should be returned
            expect(results.personalDetails.length).toBe(9);
            // Then all of the reports should be shown including the archived rooms, except for the thread report with notificationPreferences hidden.
            expect(results.recentReports.length).toBe(Object.values(OPTIONS.reports).length - 1);
        });
    });
    describe('orderOptions()', function () {
        it('should sort options alphabetically and preserves reportID for personal details with existing reports', function () {
            var _a;
            // Given a set of reports and personalDetails
            // When we call getValidOptions()
            var results = (0, OptionsListUtils_1.getValidOptions)({
                reports: OPTIONS.reports,
                personalDetails: OPTIONS.personalDetails,
            });
            // When we call orderOptions()
            results = (0, OptionsListUtils_1.orderOptions)(results);
            // Then all personalDetails except the currently logged in user should be returned
            expect(results.personalDetails.length).toBe(Object.values(OPTIONS.personalDetails).length - 1);
            var expected = ['Black Panther', 'Black Widow', 'Captain America', 'Invisible Woman', 'Mister Fantastic', 'Mr Sinister', 'Spider-Man', 'The Incredible Hulk', 'Thor'];
            var actual = (_a = results.personalDetails) === null || _a === void 0 ? void 0 : _a.map(function (item) { return item.text; });
            // Then the results should be sorted alphabetically
            expect(actual).toEqual(expected);
            var personalDetailWithExistingReport = results.personalDetails.find(function (personalDetail) { return personalDetail.login === 'peterparker@expensify.com'; });
            // Then the result which has an existing report should also have the reportID attached
            expect(personalDetailWithExistingReport === null || personalDetailWithExistingReport === void 0 ? void 0 : personalDetailWithExistingReport.reportID).toBe('2');
        });
        it('should sort personal details options alphabetically when only personal details are provided', function () {
            var _a;
            // Given a set of personalDetails and an empty reports array
            var results = (0, OptionsListUtils_1.getValidOptions)({ personalDetails: OPTIONS.personalDetails, reports: [] });
            // When we call orderOptions()
            results = (0, OptionsListUtils_1.orderOptions)(results);
            var expected = ['Black Panther', 'Black Widow', 'Captain America', 'Invisible Woman', 'Mister Fantastic', 'Mr Sinister', 'Spider-Man', 'The Incredible Hulk', 'Thor'];
            var actual = (_a = results.personalDetails) === null || _a === void 0 ? void 0 : _a.map(function (item) { return item.text; });
            // Then the results should be sorted alphabetically
            expect(actual).toEqual(expected);
        });
    });
    describe('getValidOptions()', function () {
        it('should return empty options when no reports or personal details are provided', function () {
            // Given empty arrays of reports and personalDetails
            // When we call getValidOptions()
            var results = (0, OptionsListUtils_1.getValidOptions)({ reports: [], personalDetails: [] });
            // Then the result should be empty
            expect(results.personalDetails).toEqual([]);
            expect(results.recentReports).toEqual([]);
            expect(results.currentUserOption).toBeUndefined();
            expect(results.userToInvite).toEqual(null);
            expect(results.workspaceChats).toEqual([]);
            expect(results.selfDMChat).toEqual(undefined);
        });
        it('should include Concierge by default in results', function () {
            // Given a set of reports and personalDetails that includes Concierge
            // When we call getValidOptions()
            var results = (0, OptionsListUtils_1.getValidOptions)({ reports: OPTIONS_WITH_CONCIERGE.reports, personalDetails: OPTIONS_WITH_CONCIERGE.personalDetails });
            // Then the result should include all personalDetails except the currently logged in user
            expect(results.personalDetails.length).toBe(Object.values(OPTIONS_WITH_CONCIERGE.personalDetails).length - 1);
            // Then the result should include Concierge
            expect(results.recentReports).toEqual(expect.arrayContaining([expect.objectContaining({ login: 'concierge@expensify.com' })]));
        });
        it('should exclude Concierge when excludedLogins is specified', function () {
            var _a;
            // Given a set of reports and personalDetails that includes Concierge and a config object that excludes Concierge
            // When we call getValidOptions()
            var results = (0, OptionsListUtils_1.getValidOptions)({
                reports: OPTIONS_WITH_CONCIERGE.reports,
                personalDetails: OPTIONS_WITH_CONCIERGE.personalDetails,
            }, {
                excludeLogins: (_a = {}, _a[CONST_1.default.EMAIL.CONCIERGE] = true, _a),
            });
            // Then the result should include all personalDetails except the currently logged in user and Concierge
            expect(results.personalDetails.length).toBe(Object.values(OPTIONS_WITH_CONCIERGE.personalDetails).length - 2);
            // Then the result should not include Concierge
            expect(results.personalDetails).not.toEqual(expect.arrayContaining([expect.objectContaining({ login: 'concierge@expensify.com' })]));
        });
        it('should exclude Chronos when excludedLogins is specified', function () {
            var _a;
            // Given a set of reports and personalDetails that includes Chronos and a config object that excludes Chronos
            // When we call getValidOptions()
            var results = (0, OptionsListUtils_1.getValidOptions)({ reports: OPTIONS_WITH_CHRONOS.reports, personalDetails: OPTIONS_WITH_CHRONOS.personalDetails }, { excludeLogins: (_a = {}, _a[CONST_1.default.EMAIL.CHRONOS] = true, _a) });
            // Then the result should include all personalDetails except the currently logged in user and Chronos
            expect(results.personalDetails.length).toBe(Object.values(OPTIONS_WITH_CHRONOS.personalDetails).length - 2);
            // Then the result should not include Chronos
            expect(results.personalDetails).not.toEqual(expect.arrayContaining([expect.objectContaining({ login: 'chronos@expensify.com' })]));
        });
        it('should exclude Receipts option from results when excludedLogins is specified', function () {
            var _a;
            // Given a set of reports and personalDetails that includes receipts and a config object that excludes receipts
            // When we call getValidOptions()
            var results = (0, OptionsListUtils_1.getValidOptions)({
                reports: OPTIONS_WITH_RECEIPTS.reports,
                personalDetails: OPTIONS_WITH_RECEIPTS.personalDetails,
            }, {
                excludeLogins: (_a = {}, _a[CONST_1.default.EMAIL.RECEIPTS] = true, _a),
            });
            // Then the result should include all personalDetails except the currently logged in user and receipts
            expect(results.personalDetails.length).toBe(Object.values(OPTIONS_WITH_RECEIPTS.personalDetails).length - 2);
            // Then the result should not include receipts
            expect(results.personalDetails).not.toEqual(expect.arrayContaining([expect.objectContaining({ login: 'receipts@expensify.com' })]));
        });
        it('should include Manager McTest in results by default', function () {
            // Given a set of reports and personalDetails that includes Manager McTest
            // When we call getValidOptions()
            var result = (0, OptionsListUtils_1.getValidOptions)({ reports: OPTIONS_WITH_MANAGER_MCTEST.reports, personalDetails: OPTIONS_WITH_MANAGER_MCTEST.personalDetails }, { includeP2P: true, canShowManagerMcTest: true, betas: [CONST_1.default.BETAS.NEWDOT_MANAGER_MCTEST] });
            // Then the result should include all personalDetails except the currently logged in user
            expect(result.personalDetails.length).toBe(Object.values(OPTIONS_WITH_MANAGER_MCTEST.personalDetails).length - 1);
            // Then the result should include Manager McTest
            expect(result.personalDetails).toEqual(expect.arrayContaining([expect.objectContaining({ login: CONST_1.default.EMAIL.MANAGER_MCTEST })]));
        });
        it('should exclude Manager McTest from results if flag is set to false', function () {
            // Given a set of reports and personalDetails that includes Manager McTest and a config object that excludes Manager McTest
            // When we call getValidOptions()
            var result = (0, OptionsListUtils_1.getValidOptions)({ reports: OPTIONS_WITH_MANAGER_MCTEST.reports, personalDetails: OPTIONS_WITH_MANAGER_MCTEST.personalDetails }, { includeP2P: true, canShowManagerMcTest: false, betas: [CONST_1.default.BETAS.NEWDOT_MANAGER_MCTEST] });
            // Then the result should include all personalDetails except the currently logged in user and Manager McTest
            expect(result.personalDetails.length).toBe(Object.values(OPTIONS_WITH_MANAGER_MCTEST.personalDetails).length - 2);
            // Then the result should not include Manager McTest
            expect(result.personalDetails).not.toEqual(expect.arrayContaining([expect.objectContaining({ login: CONST_1.default.EMAIL.MANAGER_MCTEST })]));
        });
        it('should exclude Manager McTest from results if user dismissed the tooltip', function () {
            return (0, waitForBatchedUpdates_1.default)()
                .then(function () {
                var _a;
                // Given that the user has dismissed the tooltip
                return react_native_onyx_1.default.set(ONYXKEYS_1.default.NVP_DISMISSED_PRODUCT_TRAINING, (_a = {},
                    _a[CONST_1.default.PRODUCT_TRAINING_TOOLTIP_NAMES.SCAN_TEST_TOOLTIP] = {
                        timestamp: DateUtils_1.default.getDBTime(new Date().valueOf()),
                    },
                    _a));
            })
                .then(function () {
                // When we call getValidOptions()
                var optionsWhenUserAlreadySubmittedExpense = (0, OptionsListUtils_1.getValidOptions)({ reports: OPTIONS_WITH_MANAGER_MCTEST.reports, personalDetails: OPTIONS_WITH_MANAGER_MCTEST.personalDetails }, { includeP2P: true, canShowManagerMcTest: true, betas: [CONST_1.default.BETAS.NEWDOT_MANAGER_MCTEST] });
                // Then the result should include all personalDetails except the currently logged in user and Manager McTest
                expect(optionsWhenUserAlreadySubmittedExpense.personalDetails.length).toBe(Object.values(OPTIONS_WITH_MANAGER_MCTEST.personalDetails).length - 2);
                // Then the result should not include Manager McTest
                expect(optionsWhenUserAlreadySubmittedExpense.personalDetails).not.toEqual(expect.arrayContaining([expect.objectContaining({ login: CONST_1.default.EMAIL.MANAGER_MCTEST })]));
            });
        });
        it('should keep admin rooms if specified', function () {
            // Given an admin room report search option
            var adminRoom = {
                item: {
                    chatType: 'policyAdmins',
                    currency: 'USD',
                    errorFields: {},
                    lastActionType: 'CREATED',
                    lastReadTime: '2025-03-21 07:25:46.279',
                    lastVisibleActionCreated: '2024-12-15 21:13:24.317',
                    lastVisibleActionLastModified: '2024-12-15 21:13:24.317',
                    ownerAccountID: 0,
                    permissions: ['read', 'write'],
                    policyID: '52A5ABD88FBBD18F',
                    policyName: "David's Playground",
                    reportID: '1455140530846319',
                    reportName: '#admins',
                    type: 'chat',
                    writeCapability: 'all',
                },
                text: '#admins',
                alternateText: "David's Playground",
                allReportErrors: {},
                subtitle: "David's Playground",
                participantsList: [],
                reportID: '1455140530846319',
                keyForList: '1455140530846319',
                isDefaultRoom: true,
                isChatRoom: true,
                policyID: '52A5ABD88FBBD18F',
                lastMessageText: '',
                lastVisibleActionCreated: '2024-12-15 21:13:24.317',
                notificationPreference: 'hidden',
            };
            // When we call getValidOptions with includeMultipleParticipantReports set to true
            var results = (0, OptionsListUtils_1.getValidOptions)({ reports: [adminRoom], personalDetails: OPTIONS.personalDetails }, {
                includeMultipleParticipantReports: true,
            });
            var adminRoomOption = results.recentReports.find(function (report) { return report.reportID === '1455140530846319'; });
            // Then the result should include the admin room
            expect(adminRoomOption).toBeDefined();
        });
        it('should include brickRoadIndicator if showRBR is true', function () {
            var _a;
            var reportID = '1455140530846319';
            var workspaceChat = {
                item: {
                    chatType: CONST_1.default.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                    currency: 'USD',
                    errorFields: {},
                    lastActionType: 'CREATED',
                    lastReadTime: '2025-03-21 07:25:46.279',
                    lastVisibleActionCreated: '2024-12-15 21:13:24.317',
                    lastVisibleActionLastModified: '2024-12-15 21:13:24.317',
                    ownerAccountID: 0,
                    permissions: ['read', 'write'],
                    participants: { 1: { notificationPreference: 'always' } },
                    policyID: '52A5ABD88FBBD18F',
                    policyName: "A's Workspace",
                    reportID: reportID,
                    reportName: "A's Workspace chat",
                    type: 'chat',
                    writeCapability: 'all',
                },
                text: "A's Workspace chat",
                alternateText: "A's Workspace",
                allReportErrors: {},
                subtitle: "A's Workspace",
                participantsList: [],
                reportID: reportID,
                keyForList: '1455140530846319',
                isDefaultRoom: true,
                isChatRoom: true,
                policyID: '52A5ABD88FBBD18F',
                lastMessageText: '',
                lastVisibleActionCreated: '2024-12-15 21:13:24.317',
                notificationPreference: 'hidden',
                brickRoadIndicator: CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR,
            };
            var results = (0, OptionsListUtils_1.getValidOptions)({ reports: [workspaceChat], personalDetails: [] }, {
                includeMultipleParticipantReports: true,
                showRBR: true,
            });
            expect((_a = results.recentReports.at(0)) === null || _a === void 0 ? void 0 : _a.brickRoadIndicator).toBe(CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR);
        });
        it('should not include brickRoadIndicator if showRBR is false', function () {
            var _a;
            var reportID = '1455140530846319';
            var workspaceChat = {
                item: {
                    chatType: CONST_1.default.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                    currency: 'USD',
                    errorFields: {},
                    lastActionType: 'CREATED',
                    lastReadTime: '2025-03-21 07:25:46.279',
                    lastVisibleActionCreated: '2024-12-15 21:13:24.317',
                    lastVisibleActionLastModified: '2024-12-15 21:13:24.317',
                    ownerAccountID: 0,
                    permissions: ['read', 'write'],
                    participants: { 1: { notificationPreference: 'always' } },
                    policyID: '52A5ABD88FBBD18F',
                    policyName: "A's Workspace",
                    reportID: reportID,
                    reportName: "A's Workspace chat",
                    type: 'chat',
                    writeCapability: 'all',
                },
                text: "A's Workspace chat",
                alternateText: "A's Workspace",
                allReportErrors: {},
                subtitle: "A's Workspace",
                participantsList: [],
                reportID: reportID,
                keyForList: '1455140530846319',
                isDefaultRoom: true,
                isChatRoom: true,
                policyID: '52A5ABD88FBBD18F',
                lastMessageText: '',
                lastVisibleActionCreated: '2024-12-15 21:13:24.317',
                notificationPreference: 'hidden',
                brickRoadIndicator: CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR,
            };
            var results = (0, OptionsListUtils_1.getValidOptions)({ reports: [workspaceChat], personalDetails: [] }, {
                includeMultipleParticipantReports: true,
                showRBR: false,
            });
            expect((_a = results.recentReports.at(0)) === null || _a === void 0 ? void 0 : _a.brickRoadIndicator).toBe(null);
        });
    });
    describe('getValidOptions() for chat room', function () {
        it('should include all reports by default', function () {
            // Given a set of reports and personalDetails that includes workspace rooms
            // When we call getValidOptions()
            var results = (0, OptionsListUtils_1.getValidOptions)(OPTIONS_WITH_WORKSPACE_ROOM, {
                includeRecentReports: true,
                includeMultipleParticipantReports: true,
                includeP2P: true,
                includeOwnedWorkspaceChats: true,
            });
            // Then the result should include all reports except the currently logged in user
            expect(results.recentReports.length).toBe(OPTIONS_WITH_WORKSPACE_ROOM.reports.length - 1);
            expect(results.recentReports).toEqual(expect.arrayContaining([expect.objectContaining({ reportID: '14' })]));
        });
    });
    describe('getValidOptions() for group Chat', function () {
        it('should exclude users with recent reports from personalDetails', function () {
            // Given a set of reports and personalDetails
            // When we call getValidOptions with no search value
            var results = (0, OptionsListUtils_1.getValidOptions)({ reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails });
            var reportLogins = results.recentReports.map(function (reportOption) { return reportOption.login; });
            var personalDetailsOverlapWithReports = results.personalDetails.every(function (personalDetailOption) { return reportLogins.includes(personalDetailOption.login); });
            // Then we should expect all the personalDetails to show except the currently logged in user
            expect(results.personalDetails.length).toBe(Object.values(OPTIONS.personalDetails).length - 1);
            // Then none of our personalDetails should include any of the users with recent reports
            expect(personalDetailsOverlapWithReports).toBe(false);
        });
        it('should exclude selected options', function () {
            // Given a set of reports and personalDetails
            // When we call getValidOptions with excludeLogins param
            var results = (0, OptionsListUtils_1.getValidOptions)({ reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails }, { excludeLogins: { 'peterparker@expensify.com': true } });
            // Then the option should not appear anywhere in either list
            expect(results.recentReports.every(function (option) { return option.login !== 'peterparker@expensify.com'; })).toBe(true);
            expect(results.personalDetails.every(function (option) { return option.login !== 'peterparker@expensify.com'; })).toBe(true);
        });
        it('should include Concierge in the results by default', function () {
            // Given a set of report and personalDetails that include Concierge
            // When we call getValidOptions()
            var results = (0, OptionsListUtils_1.getValidOptions)({ reports: OPTIONS_WITH_CONCIERGE.reports, personalDetails: OPTIONS_WITH_CONCIERGE.personalDetails });
            // Then the result should include all personalDetails except the currently logged in user
            expect(results.personalDetails.length).toBe(Object.values(OPTIONS_WITH_CONCIERGE.personalDetails).length - 1);
            // Then Concierge should be included in the results
            expect(results.recentReports).toEqual(expect.arrayContaining([expect.objectContaining({ login: 'concierge@expensify.com' })]));
        });
        it('should exclude Concierge from the results when it is specified in excludedLogins', function () {
            var _a;
            // Given a set of reports and personalDetails that includes Concierge
            // When we call getValidOptions with excludeLogins param
            var results = (0, OptionsListUtils_1.getValidOptions)({
                reports: OPTIONS_WITH_CONCIERGE.reports,
                personalDetails: OPTIONS_WITH_CONCIERGE.personalDetails,
            }, {
                excludeLogins: (_a = {}, _a[CONST_1.default.EMAIL.CONCIERGE] = true, _a),
            });
            // Then the result should include all personalDetails except the currently logged in user and Concierge
            expect(results.personalDetails.length).toBe(Object.values(OPTIONS_WITH_CONCIERGE.personalDetails).length - 2);
            // Then none of the results should include Concierge
            expect(results.personalDetails).not.toEqual(expect.arrayContaining([expect.objectContaining({ login: 'concierge@expensify.com' })]));
            expect(results.recentReports).not.toEqual(expect.arrayContaining([expect.objectContaining({ login: 'concierge@expensify.com' })]));
        });
        it('should exclude Chronos from the results when it is specified in excludedLogins', function () {
            var _a;
            // given a set of reports and personalDetails that includes Chronos
            // When we call getValidOptions() with excludeLogins param
            var results = (0, OptionsListUtils_1.getValidOptions)({ reports: OPTIONS_WITH_CHRONOS.reports, personalDetails: OPTIONS_WITH_CHRONOS.personalDetails }, { excludeLogins: (_a = {}, _a[CONST_1.default.EMAIL.CHRONOS] = true, _a) });
            // Then the result should include all personalDetails except the currently logged in user and Chronos
            expect(results.personalDetails.length).toBe(Object.values(OPTIONS_WITH_CHRONOS.personalDetails).length - 2);
            // Then none of the results should include Chronos
            expect(results.personalDetails).not.toEqual(expect.arrayContaining([expect.objectContaining({ login: 'chronos@expensify.com' })]));
            expect(results.recentReports).not.toEqual(expect.arrayContaining([expect.objectContaining({ login: 'chronos@expensify.com' })]));
        });
        it('should exclude Receipts from the results when it is specified in excludedLogins', function () {
            var _a;
            // Given a set of reports and personalDetails that includes receipts
            // When we call getValidOptions() with excludeLogins param
            var results = (0, OptionsListUtils_1.getValidOptions)({
                reports: OPTIONS_WITH_RECEIPTS.reports,
                personalDetails: OPTIONS_WITH_RECEIPTS.personalDetails,
            }, {
                excludeLogins: (_a = {}, _a[CONST_1.default.EMAIL.RECEIPTS] = true, _a),
            });
            // Then the result should include all personalDetails except the currently logged in user and receipts
            expect(results.personalDetails.length).toBe(Object.values(OPTIONS_WITH_RECEIPTS.personalDetails).length - 2);
            // Then none of the results should include receipts
            expect(results.personalDetails).not.toEqual(expect.arrayContaining([expect.objectContaining({ login: 'receipts@expensify.com' })]));
            expect(results.recentReports).not.toEqual(expect.arrayContaining([expect.objectContaining({ login: 'receipts@expensify.com' })]));
        });
    });
    describe('getShareDestinationsOptions()', function () {
        it('should exclude archived rooms and hidden threads from share destinations', function () {
            // Given a set of filtered current Reports (as we do in the component) before getting share destination options
            var filteredReports = Object.values(OPTIONS.reports).reduce(function (filtered, option) {
                var report = option.item;
                if ((0, ReportUtils_1.canUserPerformWriteAction)(report) && (0, ReportUtils_1.canCreateTaskInReport)(report) && !(0, ReportUtils_1.isCanceledTaskReport)(report)) {
                    filtered.push(option);
                }
                return filtered;
            }, []);
            // When we call getShareDestinationOptions with an empty search value
            var results = (0, OptionsListUtils_1.getShareDestinationOptions)(filteredReports, OPTIONS.personalDetails, []);
            // Then all the recent reports should be returned except the archived rooms and the hidden thread
            expect(results.recentReports.length).toBe(Object.values(OPTIONS.reports).length - 2);
        });
        it('should include DMS, group chats, and workspace rooms in share destinations', function () {
            // Given a set of filtered current Reports (as we do in the component) with workspace rooms before getting share destination options
            var filteredReportsWithWorkspaceRooms = Object.values(OPTIONS_WITH_WORKSPACE_ROOM.reports).reduce(function (filtered, option) {
                var report = option.item;
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                if ((0, ReportUtils_1.canUserPerformWriteAction)(report) || (0, ReportUtils_1.isExpensifyOnlyParticipantInReport)(report)) {
                    filtered.push(option);
                }
                return filtered;
            }, []);
            // When we call getShareDestinationOptions with an empty search value
            var results = (0, OptionsListUtils_1.getShareDestinationOptions)(filteredReportsWithWorkspaceRooms, OPTIONS.personalDetails, []);
            // Then all recent reports should be returned except the archived rooms and the hidden thread
            expect(results.recentReports.length).toBe(Object.values(OPTIONS_WITH_WORKSPACE_ROOM.reports).length - 2);
        });
    });
    describe('getShareLogOptions()', function () {
        it('should not include read-only report', function () {
            // Given a list of 11 report options with reportID of 10 is archived
            // When we call getShareLogOptions
            var results = (0, OptionsListUtils_1.getShareLogOptions)(OPTIONS, []);
            // Then the report with reportID of 10 should not be included on the list
            expect(results.recentReports.length).toBe(10);
            expect(results.recentReports.find(function (report) { return report.reportID === '10'; })).toBeUndefined();
        });
    });
    describe('getMemberInviteOptions()', function () {
        it('should sort personal details alphabetically', function () {
            var _a, _b, _c, _d;
            // Given a set of personalDetails
            // When we call getMemberInviteOptions
            var results = (0, OptionsListUtils_1.getMemberInviteOptions)(OPTIONS.personalDetails, []);
            // Then personal details should be sorted alphabetically
            expect((_a = results.personalDetails.at(0)) === null || _a === void 0 ? void 0 : _a.text).toBe('Black Panther');
            expect((_b = results.personalDetails.at(1)) === null || _b === void 0 ? void 0 : _b.text).toBe('Black Widow');
            expect((_c = results.personalDetails.at(2)) === null || _c === void 0 ? void 0 : _c.text).toBe('Captain America');
            expect((_d = results.personalDetails.at(3)) === null || _d === void 0 ? void 0 : _d.text).toBe('Invisible Woman');
        });
    });
    describe('getLastActorDisplayName()', function () {
        it('should return correct display name', function () {
            // Given two different personal details
            // When we call getLastActorDisplayName
            var result1 = (0, OptionsListUtils_1.getLastActorDisplayName)(PERSONAL_DETAILS['2']);
            var result2 = (0, OptionsListUtils_1.getLastActorDisplayName)(PERSONAL_DETAILS['3']);
            // We should expect the display names to be the same as the personal details
            expect(result1).toBe('You');
            expect(result2).toBe('Spider-Man');
        });
    });
    describe('formatMemberForList()', function () {
        it('should format members correctly', function () {
            var _a, _b, _c, _d;
            // Given a set of personal details
            // When we call formatMemberForList
            var formattedMembers = Object.values(PERSONAL_DETAILS).map(function (personalDetail) { return (0, OptionsListUtils_1.formatMemberForList)(personalDetail); });
            // Then the formatted members' order should be the same as the original PERSONAL_DETAILS array
            expect((_a = formattedMembers.at(0)) === null || _a === void 0 ? void 0 : _a.text).toBe('Mister Fantastic');
            expect((_b = formattedMembers.at(1)) === null || _b === void 0 ? void 0 : _b.text).toBe('Iron Man');
            expect((_c = formattedMembers.at(2)) === null || _c === void 0 ? void 0 : _c.text).toBe('Spider-Man');
            // Then only the first item should be selected
            expect((_d = formattedMembers.at(0)) === null || _d === void 0 ? void 0 : _d.isSelected).toBe(true);
            // Then all remaining items should be unselected
            expect(formattedMembers.slice(1).every(function (personalDetail) { return !personalDetail.isSelected; })).toBe(true);
            // Then all items should be enabled
            expect(formattedMembers.every(function (personalDetail) { return !personalDetail.isDisabled; })).toBe(true);
        });
    });
    describe('filterAndOrderOptions()', function () {
        it('should return all options when search is empty', function () {
            // Given a set of options
            // When we call getSearchOptions with all betas
            var options = (0, OptionsListUtils_1.getSearchOptions)(OPTIONS, [CONST_1.default.BETAS.ALL]);
            // When we pass the returned options to filterAndOrderOptions with an empty search value
            var filteredOptions = (0, OptionsListUtils_1.filterAndOrderOptions)(options, '');
            // Then all options should be returned
            expect(filteredOptions.recentReports.length + filteredOptions.personalDetails.length).toBe(13);
        });
        it('should return filtered options in correct order', function () {
            var _a, _b, _c, _d;
            var searchText = 'man';
            // Given a set of options
            // When we call getSearchOptions with all betas
            var options = (0, OptionsListUtils_1.getSearchOptions)(OPTIONS, [CONST_1.default.BETAS.ALL]);
            // When we pass the returned options to filterAndOrderOptions with a search value and sortByReportTypeInSearch param
            var filteredOptions = (0, OptionsListUtils_1.filterAndOrderOptions)(options, searchText, { sortByReportTypeInSearch: true });
            // Then we expect all options to be part of the recentReports list and reports should be first:
            expect(filteredOptions.personalDetails.length).toBe(0);
            // Then returned reports should match the search text
            expect(filteredOptions.recentReports.length).toBe(4);
            // Then the returned reports should be ordered by most recent action (and other criteria such as whether they are archived)
            expect((_a = filteredOptions.recentReports.at(0)) === null || _a === void 0 ? void 0 : _a.text).toBe('Invisible Woman'); // '2022-11-22 03:26:02.019'
            expect((_b = filteredOptions.recentReports.at(1)) === null || _b === void 0 ? void 0 : _b.text).toBe('Spider-Man'); // '2022-11-22 03:26:02.016'
            expect((_c = filteredOptions.recentReports.at(2)) === null || _c === void 0 ? void 0 : _c.text).toBe('Black Widow'); // This is a personal detail, which has no lastVisibleActionCreated, but matches the login
            expect((_d = filteredOptions.recentReports.at(3)) === null || _d === void 0 ? void 0 : _d.text).toBe('Mister Fantastic, Invisible Woman'); // This again is a report with '2022-11-22 03:26:02.015'
        });
        it('should filter users by email', function () {
            var _a;
            var searchText = 'mistersinister@marauders.com';
            // Given a set of options
            // When we call getSearchOptions with all betas
            var options = (0, OptionsListUtils_1.getSearchOptions)(OPTIONS, [CONST_1.default.BETAS.ALL]);
            // When we pass the returned options to filterAndOrderOptions with a search value
            var filteredOptions = (0, OptionsListUtils_1.filterAndOrderOptions)(options, searchText);
            // Then only one report should be returned
            expect(filteredOptions.recentReports.length).toBe(1);
            // Then the returned report should match the search text
            expect((_a = filteredOptions.recentReports.at(0)) === null || _a === void 0 ? void 0 : _a.text).toBe('Mr Sinister');
        });
        it('should find archived chats', function () {
            var _a;
            var searchText = 'Archived';
            // Given a set of options
            // When we call getSearchOptions with all betas
            var options = (0, OptionsListUtils_1.getSearchOptions)(OPTIONS, [CONST_1.default.BETAS.ALL]);
            // When we pass the returned options to filterAndOrderOptions with a search value
            var filteredOptions = (0, OptionsListUtils_1.filterAndOrderOptions)(options, searchText);
            // Then only one report should be returned
            expect(filteredOptions.recentReports.length).toBe(1);
            // Then the returned report should match the search text
            expect(!!((_a = filteredOptions.recentReports.at(0)) === null || _a === void 0 ? void 0 : _a.private_isArchived)).toBe(true);
        });
        it('should filter options by email if dot is skipped in the email', function () {
            var _a;
            // cspell:disable-next-line
            var searchText = 'barryallen';
            // Given a set of options created from PERSONAL_DETAILS_WITH_PERIODS
            var OPTIONS_WITH_PERIODS = (0, OptionsListUtils_1.createOptionList)(PERSONAL_DETAILS_WITH_PERIODS, REPORTS);
            // When we call getSearchOptions with all betas
            var options = (0, OptionsListUtils_1.getSearchOptions)(OPTIONS_WITH_PERIODS, [CONST_1.default.BETAS.ALL]);
            // When we pass the returned options to filterAndOrderOptions with a search value and sortByReportTypeInSearch param
            var filteredOptions = (0, OptionsListUtils_1.filterAndOrderOptions)(options, searchText, { sortByReportTypeInSearch: true });
            // Then only one report should be returned
            expect(filteredOptions.recentReports.length).toBe(1);
            // Then the returned report should match the search text
            expect((_a = filteredOptions.recentReports.at(0)) === null || _a === void 0 ? void 0 : _a.login).toBe('barry.allen@expensify.com');
        });
        it('should include workspace rooms in the search results', function () {
            var _a;
            var searchText = 'avengers';
            // Given a set of options with workspace rooms
            // When we call getSearchOptions with all betas
            var options = (0, OptionsListUtils_1.getSearchOptions)(OPTIONS_WITH_WORKSPACE_ROOM, [CONST_1.default.BETAS.ALL]);
            // When we pass the returned options to filterAndOrderOptions with a search value
            var filteredOptions = (0, OptionsListUtils_1.filterAndOrderOptions)(options, searchText);
            // Then only one report should be returned
            expect(filteredOptions.recentReports.length).toBe(1);
            // Then the returned report should match the search text
            expect((_a = filteredOptions.recentReports.at(0)) === null || _a === void 0 ? void 0 : _a.subtitle).toBe('Avengers Room');
        });
        it('should put exact match by login on the top of the list', function () {
            var _a;
            var searchText = 'reedrichards@expensify.com';
            // Given a set of options with all betas
            var options = (0, OptionsListUtils_1.getSearchOptions)(OPTIONS, [CONST_1.default.BETAS.ALL]);
            // When we pass the returned options to filterAndOrderOptions with a search value
            var filteredOptions = (0, OptionsListUtils_1.filterAndOrderOptions)(options, searchText);
            // Then only one report should be returned
            expect(filteredOptions.recentReports.length).toBe(1);
            // Then the returned report should match the search text
            expect((_a = filteredOptions.recentReports.at(0)) === null || _a === void 0 ? void 0 : _a.login).toBe(searchText);
        });
        it('should prioritize options with matching display name over chat rooms', function () {
            var _a;
            var searchText = 'spider';
            // Given a set of options with chat rooms
            var OPTIONS_WITH_CHAT_ROOMS = (0, OptionsListUtils_1.createOptionList)(PERSONAL_DETAILS, REPORTS_WITH_CHAT_ROOM);
            // When we call getSearchOptions with all betas
            var options = (0, OptionsListUtils_1.getSearchOptions)(OPTIONS_WITH_CHAT_ROOMS, [CONST_1.default.BETAS.ALL]);
            // When we pass the returned options to filterAndOrderOptions with a search value
            var filterOptions = (0, OptionsListUtils_1.filterAndOrderOptions)(options, searchText);
            // Then only two reports should be returned
            expect(filterOptions.recentReports.length).toBe(2);
            // Then the second report should match the search text
            expect((_a = filterOptions.recentReports.at(1)) === null || _a === void 0 ? void 0 : _a.isChatRoom).toBe(true);
        });
        it('should put the item with latest lastVisibleActionCreated on top when search value match multiple items', function () {
            var _a, _b;
            var searchText = 'fantastic';
            // Given a set of options
            var options = (0, OptionsListUtils_1.getSearchOptions)(OPTIONS);
            // When we call filterAndOrderOptions with a search value
            var filteredOptions = (0, OptionsListUtils_1.filterAndOrderOptions)(options, searchText);
            // Then only three reports should be returned
            expect(filteredOptions.recentReports.length).toBe(3);
            // Then the first report should match the search text
            expect((_a = filteredOptions.recentReports.at(0)) === null || _a === void 0 ? void 0 : _a.text).toBe('Mister Fantastic');
            // Then the second report should match the search text
            expect((_b = filteredOptions.recentReports.at(1)) === null || _b === void 0 ? void 0 : _b.text).toBe('Mister Fantastic, Invisible Woman');
        });
        it('should return the user to invite when the search value is a valid, non-existent email', function () {
            var _a;
            var searchText = 'test@email.com';
            // Given a set of options
            var options = (0, OptionsListUtils_1.getSearchOptions)(OPTIONS);
            // When we call filterAndOrderOptions with a search value
            var filteredOptions = (0, OptionsListUtils_1.filterAndOrderOptions)(options, searchText);
            // Then the user to invite should be returned
            expect((_a = filteredOptions.userToInvite) === null || _a === void 0 ? void 0 : _a.login).toBe(searchText);
        });
        it('should not return any results if the search value is on an excluded logins list', function () {
            var searchText = 'admin@expensify.com';
            // Given a set of options with excluded logins list
            var options = (0, OptionsListUtils_1.getValidOptions)({ reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails }, { excludeLogins: CONST_1.default.EXPENSIFY_EMAILS_OBJECT });
            // When we call filterAndOrderOptions with a search value and excluded logins list
            var filterOptions = (0, OptionsListUtils_1.filterAndOrderOptions)(options, searchText, { excludeLogins: CONST_1.default.EXPENSIFY_EMAILS_OBJECT });
            // Then no personal details should be returned
            expect(filterOptions.recentReports.length).toBe(0);
        });
        it('should return the user to invite when the search value is a valid, non-existent email and the user is not excluded', function () {
            var _a;
            var searchText = 'test@email.com';
            // Given a set of options
            var options = (0, OptionsListUtils_1.getSearchOptions)(OPTIONS);
            // When we call filterAndOrderOptions with a search value and excludeLogins
            var filteredOptions = (0, OptionsListUtils_1.filterAndOrderOptions)(options, searchText, { excludeLogins: CONST_1.default.EXPENSIFY_EMAILS_OBJECT });
            // Then the user to invite should be returned
            expect((_a = filteredOptions.userToInvite) === null || _a === void 0 ? void 0 : _a.login).toBe(searchText);
        });
        it('should return limited amount of recent reports if the limit is set', function () {
            var searchText = '';
            // Given a set of options
            var options = (0, OptionsListUtils_1.getSearchOptions)(OPTIONS);
            // When we call filterAndOrderOptions with a search value and maxRecentReportsToShow set to 2
            var filteredOptions = (0, OptionsListUtils_1.filterAndOrderOptions)(options, searchText, { maxRecentReportsToShow: 2 });
            // Then only two reports should be returned
            expect(filteredOptions.recentReports.length).toBe(2);
            // Note: in the past maxRecentReportsToShow: 0 would return all recent reports, this has changed, and is expected to return none now
            // When we call filterAndOrderOptions with a search value and maxRecentReportsToShow set to 0
            var limitToZeroOptions = (0, OptionsListUtils_1.filterAndOrderOptions)(options, searchText, { maxRecentReportsToShow: 0 });
            // Then no reports should be returned
            expect(limitToZeroOptions.recentReports.length).toBe(0);
        });
        it('should not return any user to invite if email exists on the personal details list', function () {
            var searchText = 'natasharomanoff@expensify.com';
            // Given a set of options with all betas
            var options = (0, OptionsListUtils_1.getSearchOptions)(OPTIONS, [CONST_1.default.BETAS.ALL]);
            // When we call filterAndOrderOptions with a search value
            var filteredOptions = (0, OptionsListUtils_1.filterAndOrderOptions)(options, searchText);
            // Then there should be one matching result
            expect(filteredOptions.personalDetails.length).toBe(1);
            // Then the user to invite should be null
            expect(filteredOptions.userToInvite).toBe(null);
        });
        it('should not return any options if search value does not match any personal details (getMemberInviteOptions)', function () {
            // Given a set of options
            var options = (0, OptionsListUtils_1.getMemberInviteOptions)(OPTIONS.personalDetails, []);
            // When we call filterAndOrderOptions with a search value that does not match any personal details
            var filteredOptions = (0, OptionsListUtils_1.filterAndOrderOptions)(options, 'magneto');
            // Then no personal details should be returned
            expect(filteredOptions.personalDetails.length).toBe(0);
        });
        it('should return one personal detail if search value matches an email (getMemberInviteOptions)', function () {
            var _a;
            // Given a set of options
            var options = (0, OptionsListUtils_1.getMemberInviteOptions)(OPTIONS.personalDetails, []);
            // When we call filterAndOrderOptions with a search value that matches an email
            var filteredOptions = (0, OptionsListUtils_1.filterAndOrderOptions)(options, 'peterparker@expensify.com');
            // Then one personal detail should be returned
            expect(filteredOptions.personalDetails.length).toBe(1);
            // Then the returned personal detail should match the search text
            expect((_a = filteredOptions.personalDetails.at(0)) === null || _a === void 0 ? void 0 : _a.text).toBe('Spider-Man');
        });
        it('should not show any recent reports if a search value does not match the group chat name (getShareDestinationsOptions)', function () {
            // Given a set of filtered current Reports (as we do in the component) before getting share destination options
            var filteredReports = Object.values(OPTIONS.reports).reduce(function (filtered, option) {
                var report = option.item;
                if ((0, ReportUtils_1.canUserPerformWriteAction)(report) && (0, ReportUtils_1.canCreateTaskInReport)(report) && !(0, ReportUtils_1.isCanceledTaskReport)(report)) {
                    filtered.push(option);
                }
                return filtered;
            }, []);
            // When we call getShareDestinationOptions with the filteredReports
            var options = (0, OptionsListUtils_1.getShareDestinationOptions)(filteredReports, OPTIONS.personalDetails, []);
            // When we pass the returned options to filterAndOrderOptions with a search value that does not match the group chat name
            var filteredOptions = (0, OptionsListUtils_1.filterAndOrderOptions)(options, 'mutants');
            // Then no recent reports should be returned
            expect(filteredOptions.recentReports.length).toBe(0);
        });
        it('should return a workspace room when we search for a workspace room(getShareDestinationsOptions)', function () {
            // Given a set of filtered current Reports (as we do in the component) before getting share destination options
            var filteredReportsWithWorkspaceRooms = Object.values(OPTIONS_WITH_WORKSPACE_ROOM.reports).reduce(function (filtered, option) {
                var report = option.item;
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                if ((0, ReportUtils_1.canUserPerformWriteAction)(report) || (0, ReportUtils_1.isExpensifyOnlyParticipantInReport)(report)) {
                    filtered.push(option);
                }
                return filtered;
            }, []);
            // When we call getShareDestinationOptions with the filteredReports
            var options = (0, OptionsListUtils_1.getShareDestinationOptions)(filteredReportsWithWorkspaceRooms, OPTIONS.personalDetails, []);
            // When we pass the returned options to filterAndOrderOptions with a search value that matches the group chat name
            var filteredOptions = (0, OptionsListUtils_1.filterAndOrderOptions)(options, 'Avengers Room');
            // Then one recent report should be returned
            expect(filteredOptions.recentReports.length).toBe(1);
        });
        it('should not show any results if searching for a non-existing workspace room(getShareDestinationOptions)', function () {
            // Given a set of filtered current Reports (as we do in the component) before getting share destination options
            var filteredReportsWithWorkspaceRooms = Object.values(OPTIONS_WITH_WORKSPACE_ROOM.reports).reduce(function (filtered, option) {
                var report = option.item;
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                if ((0, ReportUtils_1.canUserPerformWriteAction)(report) || (0, ReportUtils_1.isExpensifyOnlyParticipantInReport)(report)) {
                    filtered.push(option);
                }
                return filtered;
            }, []);
            // When we call getShareDestinationOptions with the filteredReports
            var options = (0, OptionsListUtils_1.getShareDestinationOptions)(filteredReportsWithWorkspaceRooms, OPTIONS.personalDetails, []);
            // When we pass the returned options to filterAndOrderOptions with a search value that does not match the group chat name
            var filteredOptions = (0, OptionsListUtils_1.filterAndOrderOptions)(options, 'Mutants Lair');
            // Then no recent reports should be returned
            expect(filteredOptions.recentReports.length).toBe(0);
        });
        it('should show the option from personal details when searching for personal detail with no existing report', function () {
            var _a;
            // Given a set of options
            var options = (0, OptionsListUtils_1.getValidOptions)({ reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails });
            // When we call filterAndOrderOptions with a search value that matches a personal detail with no existing report
            var filteredOptions = (0, OptionsListUtils_1.filterAndOrderOptions)(options, 'hulk');
            // Then no recent reports should be returned
            expect(filteredOptions.recentReports.length).toBe(0);
            // Then one personal detail should be returned
            expect(filteredOptions.personalDetails.length).toBe(1);
            // Then the returned personal detail should match the search text
            expect((_a = filteredOptions.personalDetails.at(0)) === null || _a === void 0 ? void 0 : _a.login).toBe('brucebanner@expensify.com');
        });
        it('should not return any options or user to invite if there are no search results and the string does not match a potential email or phone', function () {
            // Given a set of options
            var options = (0, OptionsListUtils_1.getValidOptions)({ reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails });
            // When we call filterAndOrderOptions with a search value that does not match any personal details or reports
            var filteredOptions = (0, OptionsListUtils_1.filterAndOrderOptions)(options, 'marc@expensify');
            // Then no recent reports or personal details should be returned
            expect(filteredOptions.recentReports.length).toBe(0);
            expect(filteredOptions.personalDetails.length).toBe(0);
            // Then no user to invite should be returned
            expect(filteredOptions.userToInvite).toBe(null);
        });
        it('should not return any options but should return an user to invite if no matching options exist and the search value is a potential email', function () {
            // Given a set of options
            var options = (0, OptionsListUtils_1.getValidOptions)({ reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails });
            // When we call filterAndOrderOptions with a search value that does not match any personal details or reports
            var filteredOptions = (0, OptionsListUtils_1.filterAndOrderOptions)(options, 'marc@expensify.com');
            // Then no recent reports or personal details should be returned
            expect(filteredOptions.recentReports.length).toBe(0);
            expect(filteredOptions.personalDetails.length).toBe(0);
            // Then an user to invite should be returned
            expect(filteredOptions.userToInvite).not.toBe(null);
        });
        it('should return user to invite when search term has a period with options for it that do not contain the period', function () {
            // Given a set of options
            var options = (0, OptionsListUtils_1.getValidOptions)({ reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails });
            // When we call filterAndOrderOptions with a search value that does not match any personal details or reports but matches user to invite
            var filteredOptions = (0, OptionsListUtils_1.filterAndOrderOptions)(options, 'peter.parker@expensify.com');
            // Then no recent reports should be returned
            expect(filteredOptions.recentReports.length).toBe(0);
            // Then one user to invite should be returned
            expect(filteredOptions.userToInvite).not.toBe(null);
        });
        it('should not return options but should return an user to invite if no matching options exist and the search value is a potential phone number', function () {
            var _a;
            // Given a set of options
            var options = (0, OptionsListUtils_1.getValidOptions)({ reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails });
            // When we call filterAndOrderOptions with a search value that does not match any personal details or reports but matches user to invite
            var filteredOptions = (0, OptionsListUtils_1.filterAndOrderOptions)(options, '5005550006');
            // Then no recent reports or personal details should be returned
            expect(filteredOptions.recentReports.length).toBe(0);
            expect(filteredOptions.personalDetails.length).toBe(0);
            // Then one user to invite should be returned
            expect(filteredOptions.userToInvite).not.toBe(null);
            // Then the user to invite should match the search value
            expect((_a = filteredOptions.userToInvite) === null || _a === void 0 ? void 0 : _a.login).toBe('+15005550006');
        });
        it('should not return options but should return an user to invite if no matching options exist and the search value is a potential phone number with country code added', function () {
            var _a;
            // Given a set of options
            var options = (0, OptionsListUtils_1.getValidOptions)({ reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails });
            // When we call filterAndOrderOptions with a search value that does not match any personal details or reports but matches user to invite
            var filteredOptions = (0, OptionsListUtils_1.filterAndOrderOptions)(options, '+15005550006');
            // Then no recent reports or personal details should be returned
            expect(filteredOptions.recentReports.length).toBe(0);
            expect(filteredOptions.personalDetails.length).toBe(0);
            // Then one user to invite should be returned
            expect(filteredOptions.userToInvite).not.toBe(null);
            // Then the user to invite should match the search value
            expect((_a = filteredOptions.userToInvite) === null || _a === void 0 ? void 0 : _a.login).toBe('+15005550006');
        });
        it('should not return options but should return an user to invite if no matching options exist and the search value is a potential phone number with special characters added', function () {
            var _a;
            // Given a set of options
            var options = (0, OptionsListUtils_1.getValidOptions)({ reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails });
            // When we call filterAndOrderOptions with a search value that does not match any personal details or reports but matches user to invite
            var filteredOptions = (0, OptionsListUtils_1.filterAndOrderOptions)(options, '+1 (800)324-3233');
            // Then no recent reports or personal details should be returned
            expect(filteredOptions.recentReports.length).toBe(0);
            expect(filteredOptions.personalDetails.length).toBe(0);
            // Then one user to invite should be returned
            expect(filteredOptions.userToInvite).not.toBe(null);
            // Then the user to invite should match the search value
            expect((_a = filteredOptions.userToInvite) === null || _a === void 0 ? void 0 : _a.login).toBe('+18003243233');
        });
        it('should not return any options or user to invite if contact number contains alphabet characters', function () {
            // Given a set of options
            var options = (0, OptionsListUtils_1.getValidOptions)({ reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails });
            // When we call filterAndOrderOptions with a search value that does not match any personal details or reports
            var filteredOptions = (0, OptionsListUtils_1.filterAndOrderOptions)(options, '998243aaaa');
            // Then no recent reports or personal details should be returned
            expect(filteredOptions.recentReports.length).toBe(0);
            expect(filteredOptions.personalDetails.length).toBe(0);
            // Then no user to invite should be returned
            expect(filteredOptions.userToInvite).toBe(null);
        });
        it('should not return any options if search value does not match any personal details', function () {
            // Given a set of options
            var options = (0, OptionsListUtils_1.getValidOptions)({ reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails });
            // When we call filterAndOrderOptions with a search value that does not match any personal details
            var filteredOptions = (0, OptionsListUtils_1.filterAndOrderOptions)(options, 'magneto');
            // Then no personal details should be returned
            expect(filteredOptions.personalDetails.length).toBe(0);
        });
        it('should return one recent report and no personal details if a search value provides an email', function () {
            var _a;
            // Given a set of options
            var options = (0, OptionsListUtils_1.getValidOptions)({ reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails });
            // When we call filterAndOrderOptions with a search value that matches an email
            var filteredOptions = (0, OptionsListUtils_1.filterAndOrderOptions)(options, 'peterparker@expensify.com', { sortByReportTypeInSearch: true });
            // Then one recent report should be returned
            expect(filteredOptions.recentReports.length).toBe(1);
            // Then the returned recent report should match the search text
            expect((_a = filteredOptions.recentReports.at(0)) === null || _a === void 0 ? void 0 : _a.text).toBe('Spider-Man');
            // Then no personal details should be returned
            expect(filteredOptions.personalDetails.length).toBe(0);
        });
        it('should return all matching reports and personal details', function () {
            var _a, _b, _c, _d;
            // Given a set of options
            var options = (0, OptionsListUtils_1.getValidOptions)({ reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails });
            // When we call filterAndOrderOptions with a search value that matches both reports and personal details and maxRecentReportsToShow param
            var filteredOptions = (0, OptionsListUtils_1.filterAndOrderOptions)(options, '.com', { maxRecentReportsToShow: 5 });
            // Then there should be 4 matching personal details
            expect(filteredOptions.personalDetails.length).toBe(4);
            // Then the first personal detail should match the search text
            expect((_a = filteredOptions.personalDetails.at(0)) === null || _a === void 0 ? void 0 : _a.login).toBe('natasharomanoff@expensify.com');
            // Then there should be 5 matching recent reports
            expect(filteredOptions.recentReports.length).toBe(5);
            expect((_b = filteredOptions.recentReports.at(0)) === null || _b === void 0 ? void 0 : _b.text).toBe('Captain America');
            expect((_c = filteredOptions.recentReports.at(1)) === null || _c === void 0 ? void 0 : _c.text).toBe('Mr Sinister');
            expect((_d = filteredOptions.recentReports.at(2)) === null || _d === void 0 ? void 0 : _d.text).toBe('Black Panther');
        });
        it('should return matching option when searching (getSearchOptions)', function () {
            var _a;
            // Given a set of options
            var options = (0, OptionsListUtils_1.getSearchOptions)(OPTIONS);
            // When we call filterAndOrderOptions with a search value that matches a personal detail
            var filteredOptions = (0, OptionsListUtils_1.filterAndOrderOptions)(options, 'spider');
            // Then one personal detail should be returned
            expect(filteredOptions.recentReports.length).toBe(1);
            // Then the returned personal detail should match the search text
            expect((_a = filteredOptions.recentReports.at(0)) === null || _a === void 0 ? void 0 : _a.text).toBe('Spider-Man');
        });
        it('should return latest lastVisibleActionCreated item on top when search value matches multiple items (getSearchOptions)', function () {
            var _a, _b;
            // Given a set of options
            var options = (0, OptionsListUtils_1.getSearchOptions)(OPTIONS);
            // When we call filterAndOrderOptions with a search value that matches multiple items
            var filteredOptions = (0, OptionsListUtils_1.filterAndOrderOptions)(options, 'fantastic');
            // Then only three reports should be returned
            expect(filteredOptions.recentReports.length).toBe(3);
            // Then the first report should match the search text
            expect((_a = filteredOptions.recentReports.at(0)) === null || _a === void 0 ? void 0 : _a.text).toBe('Mister Fantastic');
            // Then the second report should match the search text
            expect((_b = filteredOptions.recentReports.at(1)) === null || _b === void 0 ? void 0 : _b.text).toBe('Mister Fantastic, Invisible Woman');
            return (0, waitForBatchedUpdates_1.default)()
                .then(function () { return react_native_onyx_1.default.set(ONYXKEYS_1.default.PERSONAL_DETAILS_LIST, PERSONAL_DETAILS_WITH_PERIODS); })
                .then(function () {
                var _a;
                // Given a set of options with periods
                var OPTIONS_WITH_PERIODS = (0, OptionsListUtils_1.createOptionList)(PERSONAL_DETAILS_WITH_PERIODS, REPORTS);
                // When we call getSearchOptions
                var results = (0, OptionsListUtils_1.getSearchOptions)(OPTIONS_WITH_PERIODS);
                // When we pass the returned options to filterAndOrderOptions with a search value
                var filteredResults = (0, OptionsListUtils_1.filterAndOrderOptions)(results, 'barry.allen@expensify.com', { sortByReportTypeInSearch: true });
                // Then only one report should be returned
                expect(filteredResults.recentReports.length).toBe(1);
                // Then the returned report should match the search text
                expect((_a = filteredResults.recentReports.at(0)) === null || _a === void 0 ? void 0 : _a.text).toBe('The Flash');
            });
        });
        it('should filter out duplicated entries by login', function () {
            var login = 'brucebanner@expensify.com';
            // Duplicate personalDetails entries and reassign to OPTIONS
            OPTIONS.personalDetails = OPTIONS.personalDetails.flatMap(function (obj) { return [obj, __assign({}, obj)]; });
            // Given a set of options
            var options = (0, OptionsListUtils_1.getSearchOptions)(OPTIONS, [CONST_1.default.BETAS.ALL]);
            // When we call filterAndOrderOptions with a an empty search value
            var filteredOptions = (0, OptionsListUtils_1.filterAndOrderOptions)(options, '');
            var matchingEntries = filteredOptions.personalDetails.filter(function (detail) { return detail.login === login; });
            // Then there should be 2 unique login entries
            expect(filteredOptions.personalDetails.length).toBe(2);
            // Then there should be 1 matching entry
            expect(matchingEntries.length).toBe(1);
        });
        it('should order self dm always on top if the search matches with the self dm login', function () {
            var _a;
            var searchTerm = 'tonystark@expensify.com';
            var OPTIONS_WITH_SELF_DM = (0, OptionsListUtils_1.createOptionList)(PERSONAL_DETAILS, REPORTS_WITH_SELF_DM);
            // Given a set of options with self dm and all betas
            var options = (0, OptionsListUtils_1.getSearchOptions)(OPTIONS_WITH_SELF_DM, [CONST_1.default.BETAS.ALL]);
            // When we call filterAndOrderOptions with a search value
            var filteredOptions = (0, OptionsListUtils_1.filterAndOrderOptions)(options, searchTerm);
            // Then the self dm should be on top.
            expect((_a = filteredOptions.recentReports.at(0)) === null || _a === void 0 ? void 0 : _a.isSelfDM).toBe(true);
        });
    });
    describe('canCreateOptimisticPersonalDetailOption()', function () {
        var VALID_EMAIL = 'valid@email.com';
        var currentUserEmail = 'tonystark@expensify.com';
        it('should allow to create optimistic personal detail option if email is valid', function () {
            var canCreate = (0, OptionsListUtils_1.canCreateOptimisticPersonalDetailOption)({
                searchValue: VALID_EMAIL,
                currentUserOption: {
                    login: currentUserEmail,
                },
                // Note: in the past this would check for the existence of the email in the personalDetails list, this has changed.
                // We expect only filtered lists to be passed to this function, so we don't need to check for the existence of the email in the personalDetails list.
                // This is a performance optimization.
                personalDetailsOptions: [],
                recentReportOptions: [],
            });
            expect(canCreate).toBe(true);
        });
        it('should not allow to create option if email is an email of current user', function () {
            // Given a set of arguments with currentUserOption object
            // When we call canCreateOptimisticPersonalDetailOption
            var canCreate = (0, OptionsListUtils_1.canCreateOptimisticPersonalDetailOption)({
                searchValue: currentUserEmail,
                recentReportOptions: [],
                personalDetailsOptions: [],
                currentUserOption: {
                    login: currentUserEmail,
                },
            });
            // Then the returned value should be false
            expect(canCreate).toBe(false);
        });
        it('createOptionList() localization', function () {
            var _a;
            // Given a set of reports and personal details
            // When we call createOptionList and extract the reports
            var reports = (0, OptionsListUtils_1.createOptionList)(PERSONAL_DETAILS, REPORTS).reports;
            // Then the returned reports should match the expected values
            expect((_a = reports.at(10)) === null || _a === void 0 ? void 0 : _a.subtitle).toBe("Submits to Mister Fantastic");
            return ((0, waitForBatchedUpdates_1.default)()
                // When we set the preferred locale to Spanish
                .then(function () { return react_native_onyx_1.default.set(ONYXKEYS_1.default.NVP_PREFERRED_LOCALE, CONST_1.default.LOCALES.ES); })
                .then(function () {
                var _a;
                // When we call createOptionList again
                var newReports = (0, OptionsListUtils_1.createOptionList)(PERSONAL_DETAILS, REPORTS).reports;
                // Then the returned reports should change to Spanish
                // cspell:disable-next-line
                expect((_a = newReports.at(10)) === null || _a === void 0 ? void 0 : _a.subtitle).toBe('Se envía a Mister Fantastic');
            }));
        });
    });
    describe('filterWorkspaceChats()', function () {
        it('should return an empty array if there are no expense chats', function () {
            // Given an empty array of expense chats and no search terms
            // When we call filterWorkspaceChats
            var result = (0, OptionsListUtils_1.filterWorkspaceChats)([], []);
            // Then the returned value should be an empty array
            expect(result.length).toEqual(0);
        });
        it('should return all expense chats if there are no search terms', function () {
            // Given a list of expense chats and no search terms
            // When we call filterWorkspaceChats
            var result = (0, OptionsListUtils_1.filterWorkspaceChats)(WORKSPACE_CHATS, []);
            // Then the returned value should be the same as the input
            expect(result).toEqual(WORKSPACE_CHATS);
            // Then the length of the result should be equal to the length of the input
            expect(result.length).toEqual(WORKSPACE_CHATS.length);
        });
        it('should filter multiple expense chats by search term', function () {
            // Given a list of expense chats and one search term
            // When we call filterWorkspaceChats
            var result = (0, OptionsListUtils_1.filterWorkspaceChats)(WORKSPACE_CHATS, ['Google']);
            // Then the returned value should should only include the matching expense chats
            expect(result.length).toEqual(2);
        });
        it('should filter expense chat by exact name', function () {
            // Given a list of expense chats and multiple search terms that reflect the exact name
            // When we call filterWorkspaceChats
            var result = (0, OptionsListUtils_1.filterWorkspaceChats)(WORKSPACE_CHATS, ['Microsoft', 'Teams', 'Workspace']);
            // Then the returned value should should only include the matching expense chat
            expect(result.length).toEqual(1);
        });
        it('should return an empty array if there are no matching expense chats', function () {
            // Given a list of expense chats and a search term that does not match any expense chats
            // When we call filterWorkspaceChats
            var result = (0, OptionsListUtils_1.filterWorkspaceChats)(WORKSPACE_CHATS, ['XYZ']);
            // Then the returned value should be an empty array
            expect(result.length).toEqual(0);
        });
    });
    describe('orderWorkspaceOptions()', function () {
        it('should put the default workspace on top of the list', function () {
            var _a;
            // Given a list of expense chats
            // When we call orderWorkspaceOptions
            var result = (0, OptionsListUtils_1.orderWorkspaceOptions)(WORKSPACE_CHATS);
            // Then the first item in the list should be the default workspace
            expect((_a = result.at(0)) === null || _a === void 0 ? void 0 : _a.text).toEqual('Notion Workspace for Marketing');
        });
    });
    describe('Alternative text', function () {
        it("The text should not contain the last actor's name at prefix if the report is archived.", function () { return __awaiter(void 0, void 0, void 0, function () {
            var reports, archivedReport;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: 
                    // When we set the preferred locale to English and create an ADD_COMMENT report action
                    return [4 /*yield*/, react_native_onyx_1.default.multiSet((_a = {},
                            _a[ONYXKEYS_1.default.NVP_PREFERRED_LOCALE] = CONST_1.default.LOCALES.EN,
                            _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS, "10")] = {
                                '1': (0, LHNTestUtils_1.getFakeAdvancedReportAction)(CONST_1.default.REPORT.ACTIONS.TYPE.ADD_COMMENT),
                            },
                            _a))];
                    case 1:
                        // When we set the preferred locale to English and create an ADD_COMMENT report action
                        _b.sent();
                        reports = (0, OptionsListUtils_1.createOptionList)(PERSONAL_DETAILS, REPORTS).reports;
                        archivedReport = reports.find(function (report) { return report.reportID === '10'; });
                        // Then the returned report should contain default archived reason
                        expect(archivedReport === null || archivedReport === void 0 ? void 0 : archivedReport.lastMessageText).toBe('This chat room has been archived.');
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('filterSelfDMChat()', function () {
        var REPORT = {
            reportID: '1',
            text: 'Google Workspace',
            policyID: '11',
            isPolicyExpenseChat: true,
        };
        var LOGIN = 'johndoe@test.com';
        var ALTERNATE_TEXT = 'John William Doe';
        var SUBTITLE = 'Software Engineer';
        it('should return the report when there are no search terms', function () {
            // Given a report object
            // When we call filterSelfDMChat with the report and no search terms
            var result = (0, OptionsListUtils_1.filterSelfDMChat)(REPORT, []);
            // Then the returned value should be the same as the input
            expect(result === null || result === void 0 ? void 0 : result.reportID).toEqual(REPORT.reportID);
        });
        it('should return undefined, when the search term does not match the report', function () {
            // Given a report object
            // When we call filterSelfDMChat with the report and a search term that does not match the report
            var result = (0, OptionsListUtils_1.filterSelfDMChat)(REPORT, ['XYZ']);
            // Then the returned value should be undefined
            expect(result).toBeUndefined();
        });
        it('should filter report by text', function () {
            // Given a report object
            // When we call filterSelfDMChat with the report and search term that matches the report
            var result = (0, OptionsListUtils_1.filterSelfDMChat)(REPORT, ['Google']);
            // Then the returned value should be the same as the input
            expect(result === null || result === void 0 ? void 0 : result.reportID).toEqual(REPORT.reportID);
        });
        it('should filter report by exact text', function () {
            // Given a report object
            // When we call filterSelfDMChat with the report and multiple search terms that match the report's exact name
            var result = (0, OptionsListUtils_1.filterSelfDMChat)(REPORT, ['Google', 'Workspace']);
            // Then the returned value should be the same as the input
            expect(result === null || result === void 0 ? void 0 : result.reportID).toEqual(REPORT.reportID);
        });
        it('should filter report by login', function () {
            // Given a report object
            // When we call filterSelfDMChat with the report and a search term that matches the report's login
            var result = (0, OptionsListUtils_1.filterSelfDMChat)(__assign(__assign({}, REPORT), { login: LOGIN }), ['john']);
            // Then the returned value should be the same as the input
            expect(result === null || result === void 0 ? void 0 : result.reportID).toEqual(REPORT.reportID);
        });
        it('should filter report by exact login', function () {
            // Given a report object
            // When we call filterSelfDMChat with the report and multiple search terms that match the report's exact login
            var result = (0, OptionsListUtils_1.filterSelfDMChat)(__assign(__assign({}, REPORT), { login: LOGIN }), [LOGIN]);
            // Then the returned value should be the same as the input
            expect(result === null || result === void 0 ? void 0 : result.reportID).toEqual(REPORT.reportID);
        });
        it('should filter report by alternate text', function () {
            // Given a report object
            // When we call filterSelfDMChat with the report and a search term that matches the report's alternate text
            var result = (0, OptionsListUtils_1.filterSelfDMChat)(__assign(__assign({}, REPORT), { alternateText: ALTERNATE_TEXT, isThread: true }), ['William']);
            // Then the returned value should be the same as the input
            expect(result === null || result === void 0 ? void 0 : result.reportID).toEqual(REPORT.reportID);
        });
        it('should filter report by exact alternate text', function () {
            // Given a report object that is a thread
            // When we call filterSelfDMChat with the report and multiple search terms that match the report's exact alternate text
            var result = (0, OptionsListUtils_1.filterSelfDMChat)(__assign(__assign({}, REPORT), { alternateText: ALTERNATE_TEXT, isThread: true }), ['John', 'William', 'Doe']);
            // Then the returned value should be the same as the input
            expect(result === null || result === void 0 ? void 0 : result.reportID).toEqual(REPORT.reportID);
        });
        it('should filter report by alternate text if it is not a thread', function () {
            // Given a report object that is not a thread
            // When we call filterSelfDMChat with the report and a search term that matches the report's alternate text
            var result = (0, OptionsListUtils_1.filterSelfDMChat)(__assign(__assign({}, REPORT), { alternateText: ALTERNATE_TEXT, isThread: false }), ['William']);
            // Then the returned value should be undefined
            expect(result === null || result === void 0 ? void 0 : result.reportID).toBeUndefined();
        });
        it('should filter report by subtitle', function () {
            // Given a report object
            // When we call filterSelfDMChat with the report and a search term that matches the report's subtitle
            var result = (0, OptionsListUtils_1.filterSelfDMChat)(__assign(__assign({}, REPORT), { subtitle: SUBTITLE }), ['Software']);
            // Then the returned value should be the same as the input
            expect(result === null || result === void 0 ? void 0 : result.reportID).toEqual(REPORT.reportID);
        });
        it('should filter report by exact subtitle', function () {
            // Given a report object
            // When we call filterSelfDMChat with the report and multiple search terms that match the report's exact subtitle
            var result = (0, OptionsListUtils_1.filterSelfDMChat)(__assign(__assign({}, REPORT), { subtitle: SUBTITLE }), ['Software', 'Engineer']);
            // Then the returned value should be the same as the input
            expect(result === null || result === void 0 ? void 0 : result.reportID).toEqual(REPORT.reportID);
        });
        it('should not filter report by subtitle if it is not an expense chat nor a chat room', function () {
            // Given a report object that is not an expense chat nor a chat room
            // When we call filterSelfDMChat with the report and a search term that matches the report's subtitle
            var result = (0, OptionsListUtils_1.filterSelfDMChat)(__assign(__assign({}, REPORT), { subtitle: SUBTITLE, isPolicyExpenseChat: false, isChatRoom: false }), ['Software']);
            // Then the returned value should be undefined
            expect(result).toBeUndefined();
        });
        it('should filter report by subtitle if it is a chat room', function () {
            // Given a report object that is not an expense chat but is a chat room
            // When we call filterSelfDMChat with the report and a search term that matches the report's subtitle
            var result = (0, OptionsListUtils_1.filterSelfDMChat)(__assign(__assign({}, REPORT), { subtitle: SUBTITLE, isPolicyExpenseChat: false, isChatRoom: true }), ['Software']);
            // Then the returned value should be the same as the input
            expect(result === null || result === void 0 ? void 0 : result.reportID).toEqual(REPORT.reportID);
        });
    });
    describe('filterReports()', function () {
        it('should match a user with an accented name when searching using non-accented characters', function () {
            // Given a report with accented characters in the text property
            // cspell:disable-next-line
            var reports = [{ text: "Álex Timón D'artagnan Zo-e" }];
            // Given a search term with non-accented characters
            // cspell:disable-next-line
            var searchTerms = ['Alex Timon Dartagnan Zoe'];
            // When we call filterReports with the report and search terms
            var filteredReports = (0, OptionsListUtils_1.filterReports)(reports, searchTerms);
            // Then the returned value should match the search term
            expect(filteredReports).toEqual(reports);
        });
    });
    describe('getMostRecentOptions()', function () {
        it('returns the most recent options up to the specified limit', function () {
            var options = [
                { reportID: '1', lastVisibleActionCreated: '2022-01-01T10:00:00Z' },
                { reportID: '2', lastVisibleActionCreated: '2022-01-01T12:00:00Z' },
                { reportID: '3', lastVisibleActionCreated: '2022-01-01T09:00:00Z' },
                { reportID: '4', lastVisibleActionCreated: '2022-01-01T13:00:00Z' },
            ];
            var comparator = function (option) { var _a; return (_a = option.lastVisibleActionCreated) !== null && _a !== void 0 ? _a : ''; };
            var result = (0, OptionsListUtils_1.optionsOrderBy)(options, 2, comparator);
            expect(result.length).toBe(2);
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            expect(result.at(0).reportID).toBe('4');
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            expect(result.at(1).reportID).toBe('2');
        });
        it('returns all options if limit is greater than options length', function () {
            var options = [
                { reportID: '1', lastVisibleActionCreated: '2022-01-01T10:00:00Z' },
                { reportID: '2', lastVisibleActionCreated: '2022-01-01T12:00:00Z' },
            ];
            var comparator = function (option) { var _a; return (_a = option.lastVisibleActionCreated) !== null && _a !== void 0 ? _a : ''; };
            var result = (0, OptionsListUtils_1.optionsOrderBy)(options, 5, comparator);
            expect(result.length).toBe(2);
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            expect(result.at(0).reportID).toBe('2');
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            expect(result.at(1).reportID).toBe('1');
        });
        it('returns empty array if options is empty', function () {
            var result = (0, OptionsListUtils_1.optionsOrderBy)([], 3, OptionsListUtils_1.recentReportComparator);
            expect(result).toEqual([]);
        });
        it('applies filter function if provided', function () {
            var options = [
                { reportID: '1', lastVisibleActionCreated: '2022-01-01T10:00:00Z', isPinned: true },
                { reportID: '2', lastVisibleActionCreated: '2022-01-01T12:00:00Z', isPinned: false },
                { reportID: '3', lastVisibleActionCreated: '2022-01-01T09:00:00Z', isPinned: true },
            ];
            var comparator = function (option) { var _a; return (_a = option.lastVisibleActionCreated) !== null && _a !== void 0 ? _a : ''; };
            var result = (0, OptionsListUtils_1.optionsOrderBy)(options, 2, comparator, function (option) { return option.isPinned; });
            expect(result.length).toBe(2);
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            expect(result.at(0).reportID).toBe('1');
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            expect(result.at(1).reportID).toBe('3');
        });
    });
});
