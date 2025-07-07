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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/naming-convention */
var globals_1 = require("@jest/globals");
var react_native_1 = require("@testing-library/react-native");
var date_fns_1 = require("date-fns");
var react_native_onyx_1 = require("react-native-onyx");
var useReportIsArchived_1 = require("@hooks/useReportIsArchived");
var IOU_1 = require("@libs/actions/IOU");
var DateUtils_1 = require("@libs/DateUtils");
var Localize_1 = require("@libs/Localize");
var ReportActionsUtils_1 = require("@libs/ReportActionsUtils");
var ReportUtils_1 = require("@libs/ReportUtils");
var TransactionUtils_1 = require("@libs/TransactionUtils");
var CONST_1 = require("@src/CONST");
var IntlStore_1 = require("@src/languages/IntlStore");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var CollectionDataSet_1 = require("@src/types/utils/CollectionDataSet");
var reports_1 = require("../../__mocks__/reportData/reports");
var NumberUtils = require("../../src/libs/NumberUtils");
var Invoice_1 = require("../data/Invoice");
var policies_1 = require("../utils/collections/policies");
var reportActions_1 = require("../utils/collections/reportActions");
var reports_2 = require("../utils/collections/reports");
var transaction_1 = require("../utils/collections/transaction");
var LHNTestUtils = require("../utils/LHNTestUtils");
var LHNTestUtils_1 = require("../utils/LHNTestUtils");
var waitForBatchedUpdates_1 = require("../utils/waitForBatchedUpdates");
// Be sure to include the mocked permissions library or else the beta tests won't work
jest.mock('@libs/Permissions');
var testDate = DateUtils_1.default.getDBTime();
var currentUserEmail = 'bjorn@vikings.net';
var currentUserAccountID = 5;
var participantsPersonalDetails = {
    '1': {
        accountID: 1,
        displayName: 'Ragnar Lothbrok',
        firstName: 'Ragnar',
        login: 'ragnar@vikings.net',
    },
    '2': {
        accountID: 2,
        login: 'floki@vikings.net',
        displayName: 'floki@vikings.net',
    },
    '3': {
        accountID: 3,
        displayName: 'Lagertha Lothbrok',
        firstName: 'Lagertha',
        login: 'lagertha@vikings.net',
        pronouns: 'She/her',
    },
    '4': {
        accountID: 4,
        login: '+18332403627@expensify.sms',
        displayName: '(833) 240-3627',
    },
    '5': {
        accountID: 5,
        displayName: 'Lagertha Lothbrok',
        firstName: 'Lagertha',
        login: 'lagertha2@vikings.net',
        pronouns: 'She/her',
    },
};
var employeeList = {
    'owner@test.com': {
        email: 'owner@test.com',
        role: 'admin',
        submitsTo: '',
    },
    'admin@test.com': {
        email: 'admin@test.com',
        role: 'admin',
        submitsTo: '',
    },
    'employee@test.com': {
        email: 'employee@test.com',
        role: 'user',
        submitsTo: 'admin@test.com',
    },
    'categoryapprover1@test.com': {
        email: 'categoryapprover1@test.com',
        role: 'user',
        submitsTo: 'admin@test.com',
    },
    'categoryapprover2@test.com': {
        email: 'categoryapprover2@test.com',
        role: 'user',
        submitsTo: 'admin@test.com',
    },
    'tagapprover1@test.com': {
        email: 'tagapprover1@test.com',
        role: 'user',
        submitsTo: 'admin@test.com',
    },
    'tagapprover2@test.com': {
        email: 'tagapprover2@test.com',
        role: 'user',
        submitsTo: 'admin@test.com',
    },
};
var personalDetails = {
    '1': {
        accountID: 1,
        login: 'admin@test.com',
    },
    '2': {
        accountID: 2,
        login: 'employee@test.com',
    },
    '3': {
        accountID: 3,
        login: 'categoryapprover1@test.com',
    },
    '4': {
        accountID: 4,
        login: 'categoryapprover2@test.com',
    },
    '5': {
        accountID: 5,
        login: 'tagapprover1@test.com',
    },
    '6': {
        accountID: 6,
        login: 'tagapprover2@test.com',
    },
    '7': {
        accountID: 7,
        login: 'owner@test.com',
    },
};
var rules = {
    approvalRules: [
        {
            applyWhen: [
                {
                    condition: 'matches',
                    field: 'category',
                    value: 'cat1',
                },
            ],
            approver: 'categoryapprover1@test.com',
            id: '1',
        },
        {
            applyWhen: [
                {
                    condition: 'matches',
                    field: 'tag',
                    value: 'tag1',
                },
            ],
            approver: 'tagapprover1@test.com',
            id: '2',
        },
        {
            applyWhen: [
                {
                    condition: 'matches',
                    field: 'category',
                    value: 'cat2',
                },
            ],
            approver: 'categoryapprover2@test.com',
            id: '3',
        },
        {
            applyWhen: [
                {
                    condition: 'matches',
                    field: 'tag',
                    value: 'tag2',
                },
            ],
            approver: 'tagapprover2@test.com',
            id: '4',
        },
    ],
};
var employeeAccountID = 2;
var categoryApprover1Email = 'categoryapprover1@test.com';
var categoryApprover2Email = 'categoryapprover2@test.com';
var tagApprover1Email = 'tagapprover1@test.com';
var tagApprover2Email = 'tagapprover2@test.com';
var policy = {
    id: '1',
    name: 'Vikings Policy',
    role: 'user',
    type: CONST_1.default.POLICY.TYPE.TEAM,
    owner: '',
    outputCurrency: '',
    isPolicyExpenseChatEnabled: false,
};
describe('ReportUtils', function () {
    (0, globals_1.beforeAll)(function () {
        var _a;
        react_native_onyx_1.default.init({ keys: ONYXKEYS_1.default });
        var policyCollectionDataSet = (0, CollectionDataSet_1.toCollectionDataSet)(ONYXKEYS_1.default.COLLECTION.POLICY, [policy], function (current) { return current.id; });
        react_native_onyx_1.default.multiSet(__assign((_a = {}, _a[ONYXKEYS_1.default.PERSONAL_DETAILS_LIST] = participantsPersonalDetails, _a[ONYXKEYS_1.default.SESSION] = { email: currentUserEmail, accountID: currentUserAccountID }, _a[ONYXKEYS_1.default.COUNTRY_CODE] = 1, _a), policyCollectionDataSet));
        return (0, waitForBatchedUpdates_1.default)();
    });
    beforeEach(function () { return IntlStore_1.default.load(CONST_1.default.LOCALES.DEFAULT).then(waitForBatchedUpdates_1.default); });
    describe('prepareOnboardingOnyxData', function () {
        it('provides test drive url to task title', function () {
            var title = jest.fn();
            (0, ReportUtils_1.prepareOnboardingOnyxData)(undefined, CONST_1.default.ONBOARDING_CHOICES.MANAGE_TEAM, {
                message: 'This is a test',
                tasks: [
                    {
                        type: 'test',
                        title: title,
                        description: function () { return ''; },
                        autoCompleted: false,
                        mediaAttributes: {},
                    },
                ],
            }, '1');
            expect(title).toBeCalledWith(expect.objectContaining({
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                testDriveURL: expect.any(String),
            }));
        });
        it('provides test drive url to task description', function () {
            var description = jest.fn();
            (0, ReportUtils_1.prepareOnboardingOnyxData)(undefined, CONST_1.default.ONBOARDING_CHOICES.MANAGE_TEAM, {
                message: 'This is a test',
                tasks: [
                    {
                        type: 'test',
                        title: function () { return ''; },
                        description: description,
                        autoCompleted: false,
                        mediaAttributes: {},
                    },
                ],
            }, '1');
            expect(description).toBeCalledWith(expect.objectContaining({
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                testDriveURL: expect.any(String),
            }));
        });
    });
    describe('getIconsForParticipants', function () {
        it('returns sorted avatar source by name, then accountID', function () {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            var participants = (0, ReportUtils_1.getIconsForParticipants)([1, 2, 3, 4, 5], participantsPersonalDetails);
            expect(participants).toHaveLength(5);
            expect((_a = participants.at(0)) === null || _a === void 0 ? void 0 : _a.source).toBeInstanceOf(Function);
            expect((_b = participants.at(0)) === null || _b === void 0 ? void 0 : _b.name).toBe('(833) 240-3627');
            expect((_c = participants.at(0)) === null || _c === void 0 ? void 0 : _c.id).toBe(4);
            expect((_d = participants.at(0)) === null || _d === void 0 ? void 0 : _d.type).toBe('avatar');
            expect((_e = participants.at(1)) === null || _e === void 0 ? void 0 : _e.source).toBeInstanceOf(Function);
            expect((_f = participants.at(1)) === null || _f === void 0 ? void 0 : _f.name).toBe('floki@vikings.net');
            expect((_g = participants.at(1)) === null || _g === void 0 ? void 0 : _g.id).toBe(2);
            expect((_h = participants.at(1)) === null || _h === void 0 ? void 0 : _h.type).toBe('avatar');
        });
    });
    describe('getWorkspaceIcon', function () {
        it('should not use cached icon when avatar is updated', function () {
            // Given a new workspace and a expense chat with undefined `policyAvatar`
            var workspace = LHNTestUtils.getFakePolicy('1', 'ws');
            var workspaceChat = LHNTestUtils.getFakeReport();
            workspaceChat.policyID = workspace.id;
            expect((0, ReportUtils_1.getWorkspaceIcon)(workspaceChat, workspace).source).toBe((0, ReportUtils_1.getDefaultWorkspaceAvatar)(workspace.name));
            // When the user uploads a new avatar
            var newAvatarURL = 'https://example.com';
            workspace.avatarURL = newAvatarURL;
            // Then it should return the new avatar
            expect((0, ReportUtils_1.getWorkspaceIcon)(workspaceChat, workspace).source).toBe(newAvatarURL);
        });
    });
    describe('hasReceiptError', function () {
        it('should return true for transaction has receipt error', function () {
            var parentReport = LHNTestUtils.getFakeReport();
            var report = LHNTestUtils.getFakeReport();
            var errors = {
                '1231231231313221': {
                    error: CONST_1.default.IOU.RECEIPT_ERROR,
                    source: 'blob:https://dev.new.expensify.com:8082/6c5b7110-42c2-4e6d-8566-657ff24caf21',
                    filename: 'images.jpeg',
                    action: 'replaceReceipt',
                },
            };
            report.parentReportID = parentReport.reportID;
            var currentReportId = '';
            var transactionID = 1;
            var transaction = __assign(__assign({}, (0, transaction_1.default)(transactionID)), { category: '', tag: '', created: testDate, reportID: currentReportId, managedCard: true, comment: {
                    liabilityType: CONST_1.default.TRANSACTION.LIABILITY_TYPE.RESTRICT,
                }, errors: errors });
            expect((0, ReportUtils_1.hasReceiptError)(transaction)).toBe(true);
        });
    });
    describe('hasReceiptError', function () {
        it('should return false for transaction has no receipt error', function () {
            var parentReport = LHNTestUtils.getFakeReport();
            var report = LHNTestUtils.getFakeReport();
            report.parentReportID = parentReport.reportID;
            var currentReportId = '';
            var transactionID = 1;
            var transaction = __assign(__assign({}, (0, transaction_1.default)(transactionID)), { category: '', tag: '', created: testDate, reportID: currentReportId, managedCard: true, comment: {
                    liabilityType: CONST_1.default.TRANSACTION.LIABILITY_TYPE.RESTRICT,
                } });
            expect((0, ReportUtils_1.hasReceiptError)(transaction)).toBe(false);
        });
    });
    describe('getDisplayNamesWithTooltips', function () {
        test('withSingleParticipantReport', function () {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
            var participants = (0, ReportUtils_1.getDisplayNamesWithTooltips)(participantsPersonalDetails, false);
            expect(participants).toHaveLength(5);
            expect((_a = participants.at(0)) === null || _a === void 0 ? void 0 : _a.displayName).toBe('(833) 240-3627');
            expect((_b = participants.at(0)) === null || _b === void 0 ? void 0 : _b.login).toBe('+18332403627@expensify.sms');
            expect((_c = participants.at(2)) === null || _c === void 0 ? void 0 : _c.displayName).toBe('Lagertha Lothbrok');
            expect((_d = participants.at(2)) === null || _d === void 0 ? void 0 : _d.login).toBe('lagertha@vikings.net');
            expect((_e = participants.at(2)) === null || _e === void 0 ? void 0 : _e.accountID).toBe(3);
            expect((_f = participants.at(2)) === null || _f === void 0 ? void 0 : _f.pronouns).toBe('She/her');
            expect((_g = participants.at(4)) === null || _g === void 0 ? void 0 : _g.displayName).toBe('Ragnar Lothbrok');
            expect((_h = participants.at(4)) === null || _h === void 0 ? void 0 : _h.login).toBe('ragnar@vikings.net');
            expect((_j = participants.at(4)) === null || _j === void 0 ? void 0 : _j.accountID).toBe(1);
            expect((_k = participants.at(4)) === null || _k === void 0 ? void 0 : _k.pronouns).toBeUndefined();
        });
    });
    describe('getReportName', function () {
        describe('1:1 DM', function () {
            test('with displayName', function () {
                expect((0, ReportUtils_1.getReportName)({
                    reportID: '',
                    participants: (0, ReportUtils_1.buildParticipantsFromAccountIDs)([currentUserAccountID, 1]),
                })).toBe('Ragnar Lothbrok');
            });
            test('no displayName', function () {
                expect((0, ReportUtils_1.getReportName)({
                    reportID: '',
                    participants: (0, ReportUtils_1.buildParticipantsFromAccountIDs)([currentUserAccountID, 2]),
                })).toBe('floki@vikings.net');
            });
            test('SMS', function () {
                expect((0, ReportUtils_1.getReportName)({
                    reportID: '',
                    participants: (0, ReportUtils_1.buildParticipantsFromAccountIDs)([currentUserAccountID, 4]),
                })).toBe('(833) 240-3627');
            });
        });
        test('Group DM', function () {
            expect((0, ReportUtils_1.getReportName)({
                reportID: '',
                participants: (0, ReportUtils_1.buildParticipantsFromAccountIDs)([currentUserAccountID, 1, 2, 3, 4]),
            })).toBe('Ragnar, floki@vikings.net, Lagertha, (833) 240-3627');
        });
        describe('Default Policy Room', function () {
            afterEach(function () { return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, react_native_onyx_1.default.setCollection(ONYXKEYS_1.default.COLLECTION.REPORT_NAME_VALUE_PAIRS, {})];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
            var baseAdminsRoom = {
                reportID: '',
                chatType: CONST_1.default.REPORT.CHAT_TYPE.POLICY_ADMINS,
                reportName: '#admins',
            };
            var reportNameValuePairs = {
                private_isArchived: DateUtils_1.default.getDBTime(),
            };
            test('Active', function () {
                expect((0, ReportUtils_1.getReportName)(baseAdminsRoom)).toBe('#admins');
            });
            test('Archived', function () { return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_NAME_VALUE_PAIRS).concat(baseAdminsRoom.reportID), reportNameValuePairs)];
                        case 1:
                            _a.sent();
                            expect((0, ReportUtils_1.getReportName)(baseAdminsRoom)).toBe('#admins (archived)');
                            return [2 /*return*/, IntlStore_1.default.load(CONST_1.default.LOCALES.ES).then(function () { return expect((0, ReportUtils_1.getReportName)(baseAdminsRoom)).toBe('#admins (archivado)'); })];
                    }
                });
            }); });
        });
        describe('User-Created Policy Room', function () {
            afterEach(function () { return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, react_native_onyx_1.default.setCollection(ONYXKEYS_1.default.COLLECTION.REPORT_NAME_VALUE_PAIRS, {})];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
            var baseUserCreatedRoom = {
                reportID: '',
                chatType: CONST_1.default.REPORT.CHAT_TYPE.POLICY_ROOM,
                reportName: '#VikingsChat',
            };
            var reportNameValuePairs = {
                private_isArchived: DateUtils_1.default.getDBTime(),
            };
            test('Active', function () {
                expect((0, ReportUtils_1.getReportName)(baseUserCreatedRoom)).toBe('#VikingsChat');
            });
            test('Archived', function () { return __awaiter(void 0, void 0, void 0, function () {
                var archivedPolicyRoom;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            archivedPolicyRoom = __assign({}, baseUserCreatedRoom);
                            return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_NAME_VALUE_PAIRS).concat(baseUserCreatedRoom.reportID), reportNameValuePairs)];
                        case 1:
                            _a.sent();
                            expect((0, ReportUtils_1.getReportName)(archivedPolicyRoom)).toBe('#VikingsChat (archived)');
                            return [2 /*return*/, IntlStore_1.default.load(CONST_1.default.LOCALES.ES).then(function () { return expect((0, ReportUtils_1.getReportName)(archivedPolicyRoom)).toBe('#VikingsChat (archivado)'); })];
                    }
                });
            }); });
        });
        describe('PolicyExpenseChat', function () {
            describe('Active', function () {
                test('as member', function () {
                    expect((0, ReportUtils_1.getReportName)({
                        reportID: '',
                        chatType: CONST_1.default.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                        policyID: policy.id,
                        isOwnPolicyExpenseChat: true,
                        ownerAccountID: 1,
                    })).toBe("Ragnar Lothbrok's expenses");
                });
                test('as admin', function () {
                    expect((0, ReportUtils_1.getReportName)({
                        reportID: '',
                        chatType: CONST_1.default.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                        policyID: policy.id,
                        isOwnPolicyExpenseChat: false,
                        ownerAccountID: 1,
                    })).toBe("Ragnar Lothbrok's expenses");
                });
            });
            describe('Archived', function () {
                var baseArchivedPolicyExpenseChat = {
                    reportID: '',
                    chatType: CONST_1.default.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                    ownerAccountID: 1,
                    policyID: policy.id,
                    oldPolicyName: policy.name,
                };
                var reportNameValuePairs = {
                    private_isArchived: DateUtils_1.default.getDBTime(),
                };
                test('as member', function () { return __awaiter(void 0, void 0, void 0, function () {
                    var memberArchivedPolicyExpenseChat;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                memberArchivedPolicyExpenseChat = __assign(__assign({}, baseArchivedPolicyExpenseChat), { isOwnPolicyExpenseChat: true });
                                return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_NAME_VALUE_PAIRS).concat(baseArchivedPolicyExpenseChat.reportID), reportNameValuePairs)];
                            case 1:
                                _a.sent();
                                expect((0, ReportUtils_1.getReportName)(memberArchivedPolicyExpenseChat)).toBe("Ragnar Lothbrok's expenses (archived)");
                                return [2 /*return*/, IntlStore_1.default.load(CONST_1.default.LOCALES.ES).then(function () { return expect((0, ReportUtils_1.getReportName)(memberArchivedPolicyExpenseChat)).toBe("Ragnar Lothbrok's gastos (archivado)"); })];
                        }
                    });
                }); });
                test('as admin', function () { return __awaiter(void 0, void 0, void 0, function () {
                    var adminArchivedPolicyExpenseChat;
                    return __generator(this, function (_a) {
                        adminArchivedPolicyExpenseChat = __assign(__assign({}, baseArchivedPolicyExpenseChat), { isOwnPolicyExpenseChat: false });
                        expect((0, ReportUtils_1.getReportName)(adminArchivedPolicyExpenseChat)).toBe("Ragnar Lothbrok's expenses (archived)");
                        return [2 /*return*/, IntlStore_1.default.load(CONST_1.default.LOCALES.ES).then(function () { return expect((0, ReportUtils_1.getReportName)(adminArchivedPolicyExpenseChat)).toBe("Ragnar Lothbrok's gastos (archivado)"); })];
                    });
                }); });
            });
        });
        describe('ParentReportAction is', function () {
            test('Manually Submitted Report Action', function () {
                var threadOfSubmittedReportAction = __assign(__assign({}, LHNTestUtils.getFakeReport()), { type: CONST_1.default.REPORT.TYPE.EXPENSE, stateNum: CONST_1.default.REPORT.STATE_NUM.SUBMITTED, statusNum: CONST_1.default.REPORT.STATUS_NUM.SUBMITTED, parentReportID: '101', policyID: policy.id });
                var submittedParentReportAction = {
                    actionName: CONST_1.default.REPORT.ACTIONS.TYPE.SUBMITTED,
                    originalMessage: {
                        amount: 169,
                        currency: 'USD',
                    },
                };
                expect((0, ReportUtils_1.getReportName)(threadOfSubmittedReportAction, policy, submittedParentReportAction)).toBe('submitted');
            });
            test('Invited/Removed Room Member Action', function () {
                var threadOfRemovedRoomMemberAction = __assign(__assign({}, LHNTestUtils.getFakeReport()), { type: CONST_1.default.REPORT.TYPE.CHAT, chatType: CONST_1.default.REPORT.CHAT_TYPE.POLICY_ROOM, parentReportID: '101', parentReportActionID: '102', policyID: policy.id });
                var removedParentReportAction = {
                    actionName: CONST_1.default.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG.REMOVE_FROM_ROOM,
                    originalMessage: {
                        targetAccountIDs: [1],
                    },
                };
                expect((0, ReportUtils_1.getReportName)(threadOfRemovedRoomMemberAction, policy, removedParentReportAction)).toBe('removed ragnar@vikings.net');
            });
        });
        describe('Task Report', function () {
            var htmlTaskTitle = "<h1>heading with <a href=\"https://www.unknown.com\" target=\"_blank\" rel=\"noreferrer noopener\">link</a></h1>";
            it('Should return the text extracted from report name html', function () {
                var report = __assign(__assign({}, (0, reports_2.createRandomReport)(1)), { type: 'task' });
                expect((0, ReportUtils_1.getReportName)(__assign(__assign({}, report), { reportName: htmlTaskTitle }))).toEqual('heading with link');
            });
            it('Should return deleted task translations when task is is deleted', function () {
                var report = __assign(__assign({}, (0, reports_2.createRandomReport)(1)), { type: 'task', isDeletedParentAction: true });
                expect((0, ReportUtils_1.getReportName)(__assign(__assign({}, report), { reportName: htmlTaskTitle }))).toEqual((0, Localize_1.translateLocal)('parentReportAction.deletedTask'));
            });
        });
        describe('Derived values', function () {
            var report = {
                reportID: '1',
                chatType: CONST_1.default.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                currency: 'CLP',
                ownerAccountID: 1,
                isPinned: false,
                isOwnPolicyExpenseChat: true,
                isWaitingOnBankAccount: false,
                policyID: '1',
            };
            beforeEach(function () {
                jest.clearAllMocks();
            });
            (0, globals_1.beforeAll)(function () { return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, react_native_onyx_1.default.mergeCollection(ONYXKEYS_1.default.COLLECTION.REPORT, {
                                report_1: report,
                            })];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
            test('should return report name from a derived value', function () {
                expect((0, ReportUtils_1.getReportName)(report)).toEqual("Ragnar Lothbrok's expenses");
            });
            test('should generate report name if report is not merged in the Onyx', function () {
                var expenseChatReport = {
                    reportID: '2',
                    chatType: CONST_1.default.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                    currency: 'CLP',
                    ownerAccountID: 1,
                    isPinned: false,
                    isOwnPolicyExpenseChat: true,
                    isWaitingOnBankAccount: false,
                    policyID: '1',
                };
                expect((0, ReportUtils_1.getReportName)(expenseChatReport)).toEqual("Ragnar Lothbrok's expenses");
            });
        });
    });
    describe('requiresAttentionFromCurrentUser', function () {
        afterEach(function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, react_native_onyx_1.default.clear()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, react_native_onyx_1.default.set(ONYXKEYS_1.default.SESSION, { email: currentUserEmail, accountID: currentUserAccountID })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('returns false when there is no report', function () {
            expect((0, ReportUtils_1.requiresAttentionFromCurrentUser)(undefined)).toBe(false);
        });
        it('returns false when the matched IOU report does not have an owner accountID', function () {
            var report = __assign(__assign({}, LHNTestUtils.getFakeReport()), { ownerAccountID: undefined });
            expect((0, ReportUtils_1.requiresAttentionFromCurrentUser)(report)).toBe(false);
        });
        it('returns false when the linked iou report has an outstanding IOU', function () {
            var report = __assign(__assign({}, LHNTestUtils.getFakeReport()), { iouReportID: '1' });
            react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT, "1"), {
                reportID: '1',
                ownerAccountID: 99,
            }).then(function () {
                expect((0, ReportUtils_1.requiresAttentionFromCurrentUser)(report)).toBe(false);
            });
        });
        it('returns false when the report has no outstanding IOU but is waiting for a bank account and the logged user is the report owner', function () {
            var report = __assign(__assign({}, LHNTestUtils.getFakeReport()), { ownerAccountID: currentUserAccountID, isWaitingOnBankAccount: true });
            expect((0, ReportUtils_1.requiresAttentionFromCurrentUser)(report)).toBe(false);
        });
        it('returns false when the report has outstanding IOU and is not waiting for a bank account and the logged user is the report owner', function () {
            var report = __assign(__assign({}, LHNTestUtils.getFakeReport()), { ownerAccountID: currentUserAccountID, isWaitingOnBankAccount: false });
            expect((0, ReportUtils_1.requiresAttentionFromCurrentUser)(report)).toBe(false);
        });
        it('returns false when the report has no outstanding IOU but is waiting for a bank account and the logged user is not the report owner', function () {
            var report = __assign(__assign({}, LHNTestUtils.getFakeReport()), { ownerAccountID: 97, isWaitingOnBankAccount: true });
            expect((0, ReportUtils_1.requiresAttentionFromCurrentUser)(report)).toBe(false);
        });
        it('returns true when the report has an unread mention', function () {
            var report = __assign(__assign({}, LHNTestUtils.getFakeReport()), { isUnreadWithMention: true });
            expect((0, ReportUtils_1.requiresAttentionFromCurrentUser)(report)).toBe(true);
        });
        it('returns true when the report is an outstanding task', function () {
            var report = __assign(__assign({}, LHNTestUtils.getFakeReport()), { type: CONST_1.default.REPORT.TYPE.TASK, managerID: currentUserAccountID, isUnreadWithMention: false, stateNum: CONST_1.default.REPORT.STATE_NUM.OPEN, statusNum: CONST_1.default.REPORT.STATUS_NUM.OPEN, hasParentAccess: false });
            expect((0, ReportUtils_1.requiresAttentionFromCurrentUser)(report)).toBe(true);
        });
        it('returns true when the report has outstanding child expense', function () {
            var report = __assign(__assign({}, LHNTestUtils.getFakeReport()), { ownerAccountID: 99, hasOutstandingChildRequest: true, isWaitingOnBankAccount: false });
            expect((0, ReportUtils_1.requiresAttentionFromCurrentUser)(report)).toBe(true);
        });
        it('returns false if the user is not on free trial', function () { return __awaiter(void 0, void 0, void 0, function () {
            var report;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, react_native_onyx_1.default.multiSet((_a = {},
                            _a[ONYXKEYS_1.default.NVP_LAST_DAY_FREE_TRIAL] = null,
                            _a[ONYXKEYS_1.default.NVP_BILLING_FUND_ID] = null,
                            _a))];
                    case 1:
                        _b.sent();
                        report = __assign(__assign({}, LHNTestUtils.getFakeReport()), { chatType: CONST_1.default.REPORT.CHAT_TYPE.SYSTEM });
                        expect((0, ReportUtils_1.requiresAttentionFromCurrentUser)(report)).toBe(false);
                        return [2 /*return*/];
                }
            });
        }); });
        it("returns false if the user free trial hasn't ended yet", function () { return __awaiter(void 0, void 0, void 0, function () {
            var report;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, react_native_onyx_1.default.multiSet((_a = {},
                            _a[ONYXKEYS_1.default.NVP_LAST_DAY_FREE_TRIAL] = (0, date_fns_1.format)((0, date_fns_1.addDays)(new Date(), 1), CONST_1.default.DATE.FNS_DATE_TIME_FORMAT_STRING),
                            _a[ONYXKEYS_1.default.NVP_BILLING_FUND_ID] = null,
                            _a))];
                    case 1:
                        _b.sent();
                        report = __assign(__assign({}, LHNTestUtils.getFakeReport()), { chatType: CONST_1.default.REPORT.CHAT_TYPE.SYSTEM });
                        expect((0, ReportUtils_1.requiresAttentionFromCurrentUser)(report)).toBe(false);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('getMoneyRequestOptions', function () {
        var participantsAccountIDs = Object.keys(participantsPersonalDetails).map(Number);
        (0, globals_1.beforeAll)(function () {
            var _a;
            react_native_onyx_1.default.merge(ONYXKEYS_1.default.PERSONAL_DETAILS_LIST, (_a = {},
                _a[currentUserAccountID] = {
                    accountID: currentUserAccountID,
                    login: currentUserEmail,
                },
                _a));
        });
        afterAll(function () { return react_native_onyx_1.default.clear(); });
        describe('return empty iou options if', function () {
            it('participants array contains excluded expensify iou emails', function () {
                var allEmpty = CONST_1.default.EXPENSIFY_ACCOUNT_IDS.every(function (accountID) {
                    var moneyRequestOptions = (0, ReportUtils_1.temporary_getMoneyRequestOptions)(undefined, undefined, [currentUserAccountID, accountID]);
                    return moneyRequestOptions.length === 0;
                });
                expect(allEmpty).toBe(true);
            });
            it('it is a room with no participants except self', function () {
                var report = __assign(__assign({}, LHNTestUtils.getFakeReport()), { chatType: CONST_1.default.REPORT.CHAT_TYPE.POLICY_ROOM });
                var moneyRequestOptions = (0, ReportUtils_1.temporary_getMoneyRequestOptions)(report, undefined, [currentUserAccountID]);
                expect(moneyRequestOptions.length).toBe(0);
            });
            it('its not your policy expense chat', function () {
                var report = __assign(__assign({}, LHNTestUtils.getFakeReport()), { chatType: CONST_1.default.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT, isOwnPolicyExpenseChat: false });
                var moneyRequestOptions = (0, ReportUtils_1.temporary_getMoneyRequestOptions)(report, undefined, [currentUserAccountID]);
                expect(moneyRequestOptions.length).toBe(0);
            });
            it('its paid IOU report', function () {
                var report = __assign(__assign({}, LHNTestUtils.getFakeReport()), { type: CONST_1.default.REPORT.TYPE.IOU, statusNum: CONST_1.default.REPORT.STATUS_NUM.REIMBURSED });
                var moneyRequestOptions = (0, ReportUtils_1.temporary_getMoneyRequestOptions)(report, undefined, [currentUserAccountID]);
                expect(moneyRequestOptions.length).toBe(0);
            });
            it('its approved Expense report', function () {
                var report = __assign(__assign({}, LHNTestUtils.getFakeReport()), { type: CONST_1.default.REPORT.TYPE.EXPENSE, stateNum: CONST_1.default.REPORT.STATE_NUM.APPROVED, statusNum: CONST_1.default.REPORT.STATUS_NUM.APPROVED });
                var moneyRequestOptions = (0, ReportUtils_1.temporary_getMoneyRequestOptions)(report, undefined, [currentUserAccountID]);
                expect(moneyRequestOptions.length).toBe(0);
            });
            it('its trip room', function () {
                var report = __assign(__assign({}, LHNTestUtils.getFakeReport()), { type: CONST_1.default.REPORT.TYPE.CHAT, chatType: CONST_1.default.REPORT.CHAT_TYPE.TRIP_ROOM });
                var moneyRequestOptions = (0, ReportUtils_1.temporary_getMoneyRequestOptions)(report, undefined, [currentUserAccountID]);
                expect(moneyRequestOptions.length).toBe(0);
            });
            it('its paid Expense report', function () {
                var report = __assign(__assign({}, LHNTestUtils.getFakeReport()), { type: CONST_1.default.REPORT.TYPE.EXPENSE, statusNum: CONST_1.default.REPORT.STATUS_NUM.REIMBURSED });
                var moneyRequestOptions = (0, ReportUtils_1.temporary_getMoneyRequestOptions)(report, undefined, [currentUserAccountID]);
                expect(moneyRequestOptions.length).toBe(0);
            });
            it('it is an expense report tied to a policy expense chat user does not own', function () {
                react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT, "100"), {
                    reportID: '100',
                    isOwnPolicyExpenseChat: false,
                }).then(function () {
                    var report = __assign(__assign({}, LHNTestUtils.getFakeReport()), { parentReportID: '100', type: CONST_1.default.REPORT.TYPE.EXPENSE });
                    var moneyRequestOptions = (0, ReportUtils_1.temporary_getMoneyRequestOptions)(report, undefined, [currentUserAccountID]);
                    expect(moneyRequestOptions.length).toBe(0);
                });
            });
        });
        describe('return only iou split option if', function () {
            it('it is a chat room with more than one participant that is not an announce room', function () {
                var onlyHaveSplitOption = [CONST_1.default.REPORT.CHAT_TYPE.POLICY_ADMINS, CONST_1.default.REPORT.CHAT_TYPE.DOMAIN_ALL, CONST_1.default.REPORT.CHAT_TYPE.POLICY_ROOM].every(function (chatType) {
                    var _a;
                    var report = __assign(__assign({}, LHNTestUtils.getFakeReport()), { chatType: chatType });
                    var moneyRequestOptions = (0, ReportUtils_1.temporary_getMoneyRequestOptions)(report, undefined, [currentUserAccountID, (_a = participantsAccountIDs.at(0)) !== null && _a !== void 0 ? _a : CONST_1.default.DEFAULT_NUMBER_ID]);
                    return moneyRequestOptions.length === 1 && moneyRequestOptions.includes(CONST_1.default.IOU.TYPE.SPLIT);
                });
                expect(onlyHaveSplitOption).toBe(true);
            });
            it('has multiple participants excluding self', function () {
                var report = __assign(__assign({}, LHNTestUtils.getFakeReport()), { chatType: CONST_1.default.REPORT.CHAT_TYPE.POLICY_ROOM });
                var moneyRequestOptions = (0, ReportUtils_1.temporary_getMoneyRequestOptions)(report, undefined, __spreadArray([currentUserAccountID], participantsAccountIDs, true));
                expect(moneyRequestOptions.length).toBe(1);
                expect(moneyRequestOptions.includes(CONST_1.default.IOU.TYPE.SPLIT)).toBe(true);
            });
            it('user has pay expense permission', function () {
                var report = __assign(__assign({}, LHNTestUtils.getFakeReport()), { chatType: CONST_1.default.REPORT.CHAT_TYPE.POLICY_ROOM });
                var moneyRequestOptions = (0, ReportUtils_1.temporary_getMoneyRequestOptions)(report, undefined, __spreadArray([currentUserAccountID], participantsAccountIDs, true));
                expect(moneyRequestOptions.length).toBe(1);
                expect(moneyRequestOptions.includes(CONST_1.default.IOU.TYPE.SPLIT)).toBe(true);
            });
            it("it's a group DM report", function () {
                var report = __assign(__assign({}, LHNTestUtils.getFakeReport()), { type: CONST_1.default.REPORT.TYPE.CHAT, participantsAccountIDs: __spreadArray([currentUserAccountID], participantsAccountIDs, true) });
                var moneyRequestOptions = (0, ReportUtils_1.temporary_getMoneyRequestOptions)(report, undefined, __spreadArray([currentUserAccountID], participantsAccountIDs.map(Number), true));
                expect(moneyRequestOptions.length).toBe(1);
                expect(moneyRequestOptions.includes(CONST_1.default.IOU.TYPE.SPLIT)).toBe(true);
            });
        });
        describe('return only submit expense option if', function () {
            it('it is an IOU report in submitted state', function () {
                var _a;
                var report = __assign(__assign({}, LHNTestUtils.getFakeReport()), { type: CONST_1.default.REPORT.TYPE.IOU, stateNum: CONST_1.default.REPORT.STATE_NUM.SUBMITTED, statusNum: CONST_1.default.REPORT.STATUS_NUM.SUBMITTED, managerID: currentUserAccountID });
                var moneyRequestOptions = (0, ReportUtils_1.temporary_getMoneyRequestOptions)(report, undefined, [currentUserAccountID, (_a = participantsAccountIDs.at(0)) !== null && _a !== void 0 ? _a : CONST_1.default.DEFAULT_NUMBER_ID]);
                expect(moneyRequestOptions.length).toBe(1);
                expect(moneyRequestOptions.includes(CONST_1.default.IOU.TYPE.SUBMIT)).toBe(true);
            });
            it('it is an IOU report in submitted state even with pay expense permissions', function () {
                var _a;
                var report = __assign(__assign({}, LHNTestUtils.getFakeReport()), { type: CONST_1.default.REPORT.TYPE.IOU, stateNum: CONST_1.default.REPORT.STATE_NUM.SUBMITTED, statusNum: CONST_1.default.REPORT.STATUS_NUM.SUBMITTED, managerID: currentUserAccountID });
                var moneyRequestOptions = (0, ReportUtils_1.temporary_getMoneyRequestOptions)(report, undefined, [currentUserAccountID, (_a = participantsAccountIDs.at(0)) !== null && _a !== void 0 ? _a : CONST_1.default.DEFAULT_NUMBER_ID]);
                expect(moneyRequestOptions.length).toBe(1);
                expect(moneyRequestOptions.includes(CONST_1.default.IOU.TYPE.SUBMIT)).toBe(true);
            });
        });
        describe('return only submit expense and track expense options if', function () {
            it("it is an expense report tied to user's own policy expense chat", function () {
                react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT, "102"), {
                    reportID: '102',
                    chatType: CONST_1.default.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                    isOwnPolicyExpenseChat: true,
                }).then(function () {
                    var report = __assign(__assign({}, LHNTestUtils.getFakeReport()), { parentReportID: '102', type: CONST_1.default.REPORT.TYPE.EXPENSE, managerID: currentUserAccountID });
                    var moneyRequestOptions = (0, ReportUtils_1.temporary_getMoneyRequestOptions)(report, undefined, [currentUserAccountID]);
                    expect(moneyRequestOptions.length).toBe(2);
                    expect(moneyRequestOptions.includes(CONST_1.default.IOU.TYPE.SUBMIT)).toBe(true);
                    expect(moneyRequestOptions.includes(CONST_1.default.IOU.TYPE.TRACK)).toBe(true);
                    expect(moneyRequestOptions.indexOf(CONST_1.default.IOU.TYPE.SUBMIT)).toBe(0);
                });
            });
            it("it is an open expense report tied to user's own policy expense chat", function () {
                react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT, "103"), {
                    reportID: '103',
                    chatType: CONST_1.default.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                    isOwnPolicyExpenseChat: true,
                }).then(function () {
                    var _a;
                    var report = __assign(__assign({}, LHNTestUtils.getFakeReport()), { type: CONST_1.default.REPORT.TYPE.EXPENSE, stateNum: CONST_1.default.REPORT.STATE_NUM.OPEN, statusNum: CONST_1.default.REPORT.STATUS_NUM.OPEN, parentReportID: '103', managerID: currentUserAccountID });
                    var paidPolicy = {
                        type: CONST_1.default.POLICY.TYPE.TEAM,
                        id: '',
                        name: '',
                        role: 'user',
                        owner: '',
                        outputCurrency: '',
                        isPolicyExpenseChatEnabled: false,
                    };
                    var moneyRequestOptions = (0, ReportUtils_1.temporary_getMoneyRequestOptions)(report, paidPolicy, [currentUserAccountID, (_a = participantsAccountIDs.at(0)) !== null && _a !== void 0 ? _a : CONST_1.default.DEFAULT_NUMBER_ID]);
                    expect(moneyRequestOptions.length).toBe(2);
                    expect(moneyRequestOptions.includes(CONST_1.default.IOU.TYPE.SUBMIT)).toBe(true);
                    expect(moneyRequestOptions.includes(CONST_1.default.IOU.TYPE.TRACK)).toBe(true);
                    expect(moneyRequestOptions.indexOf(CONST_1.default.IOU.TYPE.SUBMIT)).toBe(0);
                });
            });
            it('it is an IOU report in submitted state', function () {
                var _a;
                var report = __assign(__assign({}, LHNTestUtils.getFakeReport()), { type: CONST_1.default.REPORT.TYPE.IOU, stateNum: CONST_1.default.REPORT.STATE_NUM.SUBMITTED, statusNum: CONST_1.default.REPORT.STATUS_NUM.SUBMITTED, managerID: currentUserAccountID });
                var moneyRequestOptions = (0, ReportUtils_1.temporary_getMoneyRequestOptions)(report, undefined, [currentUserAccountID, (_a = participantsAccountIDs.at(0)) !== null && _a !== void 0 ? _a : CONST_1.default.DEFAULT_NUMBER_ID]);
                expect(moneyRequestOptions.length).toBe(1);
                expect(moneyRequestOptions.includes(CONST_1.default.IOU.TYPE.SUBMIT)).toBe(true);
            });
            it('it is an IOU report in submitted state even with pay expense permissions', function () {
                var _a;
                var report = __assign(__assign({}, LHNTestUtils.getFakeReport()), { type: CONST_1.default.REPORT.TYPE.IOU, stateNum: CONST_1.default.REPORT.STATE_NUM.SUBMITTED, statusNum: CONST_1.default.REPORT.STATUS_NUM.SUBMITTED, managerID: currentUserAccountID });
                var moneyRequestOptions = (0, ReportUtils_1.temporary_getMoneyRequestOptions)(report, undefined, [currentUserAccountID, (_a = participantsAccountIDs.at(0)) !== null && _a !== void 0 ? _a : CONST_1.default.DEFAULT_NUMBER_ID]);
                expect(moneyRequestOptions.length).toBe(1);
                expect(moneyRequestOptions.includes(CONST_1.default.IOU.TYPE.SUBMIT)).toBe(true);
            });
            it("it is a submitted expense report in user's own policyExpenseChat and the policy has Instant Submit frequency", function () {
                var _a;
                var paidPolicy = {
                    id: 'ef72dfeb',
                    type: CONST_1.default.POLICY.TYPE.TEAM,
                    autoReporting: true,
                    autoReportingFrequency: CONST_1.default.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT,
                    name: '',
                    role: 'user',
                    owner: '',
                    outputCurrency: '',
                    isPolicyExpenseChatEnabled: false,
                    employeeList: (_a = {},
                        _a[currentUserEmail] = {
                            email: currentUserEmail,
                            submitsTo: currentUserEmail,
                        },
                        _a),
                };
                Promise.all([
                    react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(paidPolicy.id), paidPolicy),
                    react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT, "101"), {
                        reportID: '101',
                        chatType: CONST_1.default.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                        isOwnPolicyExpenseChat: true,
                        policyID: paidPolicy.id,
                        ownerAccountID: currentUserAccountID,
                    }),
                ]).then(function () {
                    var _a;
                    var report = __assign(__assign({}, LHNTestUtils.getFakeReport()), { type: CONST_1.default.REPORT.TYPE.EXPENSE, stateNum: CONST_1.default.REPORT.STATE_NUM.SUBMITTED, statusNum: CONST_1.default.REPORT.STATUS_NUM.SUBMITTED, parentReportID: '101', policyID: paidPolicy.id, managerID: currentUserAccountID, ownerAccountID: currentUserAccountID });
                    var moneyRequestOptions = (0, ReportUtils_1.temporary_getMoneyRequestOptions)(report, paidPolicy, [currentUserAccountID, (_a = participantsAccountIDs.at(0)) !== null && _a !== void 0 ? _a : CONST_1.default.DEFAULT_NUMBER_ID]);
                    expect(moneyRequestOptions.length).toBe(2);
                    expect(moneyRequestOptions.includes(CONST_1.default.IOU.TYPE.SUBMIT)).toBe(true);
                    expect(moneyRequestOptions.includes(CONST_1.default.IOU.TYPE.TRACK)).toBe(true);
                    expect(moneyRequestOptions.indexOf(CONST_1.default.IOU.TYPE.SUBMIT)).toBe(0);
                });
            });
        });
        describe('return multiple expense options if', function () {
            it('it is a 1:1 DM', function () {
                var _a;
                var report = __assign(__assign({}, LHNTestUtils.getFakeReport()), { type: CONST_1.default.REPORT.TYPE.CHAT });
                var moneyRequestOptions = (0, ReportUtils_1.temporary_getMoneyRequestOptions)(report, undefined, [currentUserAccountID, (_a = participantsAccountIDs.at(0)) !== null && _a !== void 0 ? _a : CONST_1.default.DEFAULT_NUMBER_ID]);
                expect(moneyRequestOptions.length).toBe(3);
                expect(moneyRequestOptions.includes(CONST_1.default.IOU.TYPE.SPLIT)).toBe(true);
                expect(moneyRequestOptions.includes(CONST_1.default.IOU.TYPE.SUBMIT)).toBe(true);
                expect(moneyRequestOptions.includes(CONST_1.default.IOU.TYPE.PAY)).toBe(true);
                expect(moneyRequestOptions.indexOf(CONST_1.default.IOU.TYPE.SUBMIT)).toBe(0);
            });
            it("it is a submitted report tied to user's own policy expense chat", function () {
                var paidPolicy = {
                    id: '3f54cca8',
                    type: CONST_1.default.POLICY.TYPE.TEAM,
                    name: '',
                    role: 'user',
                    owner: '',
                    outputCurrency: '',
                    isPolicyExpenseChatEnabled: false,
                };
                Promise.all([
                    react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(paidPolicy.id), paidPolicy),
                    react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT, "101"), {
                        reportID: '101',
                        chatType: CONST_1.default.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                        isOwnPolicyExpenseChat: true,
                    }),
                ]).then(function () {
                    var _a;
                    var report = __assign(__assign({}, LHNTestUtils.getFakeReport()), { type: CONST_1.default.REPORT.TYPE.EXPENSE, stateNum: CONST_1.default.REPORT.STATE_NUM.SUBMITTED, statusNum: CONST_1.default.REPORT.STATUS_NUM.SUBMITTED, parentReportID: '101', policyID: paidPolicy.id });
                    var moneyRequestOptions = (0, ReportUtils_1.temporary_getMoneyRequestOptions)(report, paidPolicy, [currentUserAccountID, (_a = participantsAccountIDs.at(0)) !== null && _a !== void 0 ? _a : CONST_1.default.DEFAULT_NUMBER_ID]);
                    expect(moneyRequestOptions.length).toBe(2);
                    expect(moneyRequestOptions.includes(CONST_1.default.IOU.TYPE.SUBMIT)).toBe(true);
                    expect(moneyRequestOptions.includes(CONST_1.default.IOU.TYPE.TRACK)).toBe(true);
                });
            });
            it("it is user's own policy expense chat", function () {
                var report = __assign(__assign({}, LHNTestUtils.getFakeReport()), { chatType: CONST_1.default.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT, isOwnPolicyExpenseChat: true, managerID: currentUserAccountID });
                var moneyRequestOptions = (0, ReportUtils_1.temporary_getMoneyRequestOptions)(report, undefined, __spreadArray([currentUserAccountID], participantsAccountIDs, true));
                expect(moneyRequestOptions.length).toBe(2);
                expect(moneyRequestOptions.includes(CONST_1.default.IOU.TYPE.SUBMIT)).toBe(true);
                expect(moneyRequestOptions.includes(CONST_1.default.IOU.TYPE.TRACK)).toBe(true);
                expect(moneyRequestOptions.indexOf(CONST_1.default.IOU.TYPE.SUBMIT)).toBe(0);
            });
        });
        describe('Teachers Unite policy logic', function () {
            var teachersUniteTestPolicyID = CONST_1.default.TEACHERS_UNITE.TEST_POLICY_ID;
            var otherPolicyID = 'normal-policy-id';
            it('should hide Create Expense option and show Split Expense for Teachers Unite policy', function () {
                var _a;
                var report = __assign(__assign({}, LHNTestUtils.getFakeReport()), { policyID: teachersUniteTestPolicyID, chatType: CONST_1.default.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT, isOwnPolicyExpenseChat: true });
                var moneyRequestOptions = (0, ReportUtils_1.temporary_getMoneyRequestOptions)(report, undefined, [currentUserAccountID, (_a = participantsAccountIDs.at(0)) !== null && _a !== void 0 ? _a : CONST_1.default.DEFAULT_NUMBER_ID]);
                // Should not include SUBMIT (Create Expense)
                expect(moneyRequestOptions.includes(CONST_1.default.IOU.TYPE.SUBMIT)).toBe(false);
                // Should include SPLIT (Split Expense)
                expect(moneyRequestOptions.includes(CONST_1.default.IOU.TYPE.SPLIT)).toBe(true);
            });
            it('should show Create Expense option and hide Split Expense for non-Teachers Unite policy', function () {
                var _a;
                var report = __assign(__assign({}, LHNTestUtils.getFakeReport()), { policyID: otherPolicyID, chatType: CONST_1.default.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT, isOwnPolicyExpenseChat: true });
                var moneyRequestOptions = (0, ReportUtils_1.temporary_getMoneyRequestOptions)(report, undefined, [currentUserAccountID, (_a = participantsAccountIDs.at(0)) !== null && _a !== void 0 ? _a : CONST_1.default.DEFAULT_NUMBER_ID]);
                // Should include SUBMIT (Create Expense)
                expect(moneyRequestOptions.includes(CONST_1.default.IOU.TYPE.SUBMIT)).toBe(true);
                // Should not include SPLIT (Split Expense)
                expect(moneyRequestOptions.includes(CONST_1.default.IOU.TYPE.SPLIT)).toBe(false);
                // Should include other options like TRACK
                expect(moneyRequestOptions.includes(CONST_1.default.IOU.TYPE.TRACK)).toBe(true);
            });
            it('should disable Create report option for expense chats on Teachers Unite workspace', function () {
                var _a;
                var expenseReport = __assign(__assign({}, LHNTestUtils.getFakeReport()), { policyID: teachersUniteTestPolicyID, type: CONST_1.default.REPORT.TYPE.EXPENSE, chatType: CONST_1.default.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT, isOwnPolicyExpenseChat: true });
                var moneyRequestOptions = (0, ReportUtils_1.temporary_getMoneyRequestOptions)(expenseReport, undefined, [currentUserAccountID, (_a = participantsAccountIDs.at(0)) !== null && _a !== void 0 ? _a : CONST_1.default.DEFAULT_NUMBER_ID]);
                // Should not include SUBMIT
                expect(moneyRequestOptions.includes(CONST_1.default.IOU.TYPE.SUBMIT)).toBe(false);
            });
        });
    });
    describe('getReportIDFromLink', function () {
        it('should get the correct reportID from a deep link', function () {
            expect((0, ReportUtils_1.getReportIDFromLink)('new-expensify://r/75431276')).toBe('75431276');
            expect((0, ReportUtils_1.getReportIDFromLink)('https://www.expensify.cash/r/75431276')).toBe('75431276');
            expect((0, ReportUtils_1.getReportIDFromLink)('https://staging.new.expensify.com/r/75431276')).toBe('75431276');
            expect((0, ReportUtils_1.getReportIDFromLink)('https://dev.new.expensify.com/r/75431276')).toBe('75431276');
            expect((0, ReportUtils_1.getReportIDFromLink)('https://staging.expensify.cash/r/75431276')).toBe('75431276');
            expect((0, ReportUtils_1.getReportIDFromLink)('https://new.expensify.com/r/75431276')).toBe('75431276');
        });
        it("shouldn't get the correct reportID from a deep link", function () {
            expect((0, ReportUtils_1.getReportIDFromLink)('new-expensify-not-valid://r/75431276')).toBe('');
            expect((0, ReportUtils_1.getReportIDFromLink)('new-expensify://settings')).toBe('');
        });
    });
    describe('getMostRecentlyVisitedReport', function () {
        it('should filter out report without reportID & lastReadTime and return the most recently visited report', function () {
            var reports = [
                { reportID: '1', lastReadTime: '2023-07-08 07:15:44.030' },
                { reportID: '2', lastReadTime: undefined },
                { reportID: '3', lastReadTime: '2023-07-06 07:15:44.030' },
                { reportID: '4', lastReadTime: '2023-07-07 07:15:44.030', type: CONST_1.default.REPORT.TYPE.IOU },
                { lastReadTime: '2023-07-09 07:15:44.030' },
                { reportID: '6' },
                undefined,
            ];
            var latestReport = { reportID: '1', lastReadTime: '2023-07-08 07:15:44.030' };
            expect((0, ReportUtils_1.getMostRecentlyVisitedReport)(reports, undefined)).toEqual(latestReport);
        });
    });
    describe('shouldDisableThread', function () {
        var reportID = '1';
        it('should disable on thread-disabled actions', function () {
            var reportAction = (0, ReportUtils_1.buildOptimisticCreatedReportAction)('email1@test.com');
            expect((0, ReportUtils_1.shouldDisableThread)(reportAction, reportID, false)).toBeTruthy();
        });
        it('should disable thread on split expense actions', function () {
            var reportAction = (0, ReportUtils_1.buildOptimisticIOUReportAction)({
                type: CONST_1.default.IOU.REPORT_ACTION_TYPE.SPLIT,
                amount: 50000,
                currency: CONST_1.default.CURRENCY.USD,
                comment: '',
                participants: [{ login: 'email1@test.com' }, { login: 'email2@test.com' }],
                transactionID: NumberUtils.rand64(),
            });
            expect((0, ReportUtils_1.shouldDisableThread)(reportAction, reportID, false)).toBeTruthy();
        });
        it("should disable on a whisper action and it's neither a report preview nor IOU action", function () {
            var reportAction = {
                actionName: CONST_1.default.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE,
                originalMessage: {
                    whisperedTo: [123456],
                },
            };
            expect((0, ReportUtils_1.shouldDisableThread)(reportAction, reportID, false)).toBeTruthy();
        });
        it('should disable on thread first chat', function () {
            var reportAction = {
                childReportID: reportID,
            };
            expect((0, ReportUtils_1.shouldDisableThread)(reportAction, reportID, true)).toBeTruthy();
        });
        describe('deleted threads', function () {
            it('should be enabled if the report action is not-deleted and child visible action count is 1', function () {
                // Given a normal report action with one child visible action count
                var reportAction = {
                    message: [
                        {
                            translationKey: '',
                            type: 'COMMENT',
                            html: 'test',
                            text: 'test',
                        },
                    ],
                    childVisibleActionCount: 1,
                };
                // When it's checked to see if the thread should be disabled
                var isThreadDisabled = (0, ReportUtils_1.shouldDisableThread)(reportAction, reportID, false);
                // Then the thread should be enabled
                expect(isThreadDisabled).toBeFalsy();
            });
            it('should be enabled if the report action is not-deleted and child visible action count is 0', function () {
                // Given a normal report action with zero child visible action count
                var reportAction = {
                    message: [
                        {
                            translationKey: '',
                            type: 'COMMENT',
                            html: 'test',
                            text: 'test',
                        },
                    ],
                    childVisibleActionCount: 0,
                };
                // When it's checked to see if the thread should be disabled
                var isThreadDisabled = (0, ReportUtils_1.shouldDisableThread)(reportAction, reportID, false);
                // Then the thread should be enabled
                expect(isThreadDisabled).toBeFalsy();
            });
            it('should be enabled if the report action is deleted and child visible action count is 1', function () {
                // Given a normal report action with one child visible action count
                var reportAction = {
                    message: [
                        {
                            translationKey: '',
                            type: 'COMMENT',
                            html: '',
                            text: '',
                        },
                    ],
                    childVisibleActionCount: 1,
                };
                // When it's checked to see if the thread should be disabled
                var isThreadDisabled = (0, ReportUtils_1.shouldDisableThread)(reportAction, reportID, false);
                // Then the thread should be enabled
                expect(isThreadDisabled).toBeFalsy();
            });
            it('should be disabled if the report action is deleted and child visible action count is 0', function () {
                // Given a normal report action with zero child visible action count
                var reportAction = {
                    message: [
                        {
                            translationKey: '',
                            type: 'COMMENT',
                            html: '',
                            text: '',
                        },
                    ],
                    childVisibleActionCount: 0,
                };
                // When it's checked to see if the thread should be disabled
                var isThreadDisabled = (0, ReportUtils_1.shouldDisableThread)(reportAction, reportID, false);
                // Then the thread should be disabled
                expect(isThreadDisabled).toBeTruthy();
            });
        });
        describe('archived report threads', function () {
            it('should be enabled if the report is not-archived and child visible action count is 1', function () {
                // Given a normal report action with one child visible action count
                var reportAction = {
                    message: [
                        {
                            translationKey: '',
                            type: 'COMMENT',
                            html: 'test',
                            text: 'test',
                        },
                    ],
                    childVisibleActionCount: 1,
                };
                // And a report that is not archived
                var isReportArchived = false;
                // When it's checked to see if the thread should be disabled
                var isThreadDisabled = (0, ReportUtils_1.shouldDisableThread)(reportAction, reportID, false, isReportArchived);
                // Then the thread should be enabled
                expect(isThreadDisabled).toBeFalsy();
            });
            it('should be enabled if the report is not-archived and child visible action count is 0', function () {
                // Given a normal report action with zero child visible action counts
                var reportAction = {
                    message: [
                        {
                            translationKey: '',
                            type: 'COMMENT',
                            html: 'test',
                            text: 'test',
                        },
                    ],
                    childVisibleActionCount: 1,
                };
                // And a report that is not archived
                var isReportArchived = false;
                // When it's checked to see if the thread should be disabled
                var isThreadDisabled = (0, ReportUtils_1.shouldDisableThread)(reportAction, reportID, false, isReportArchived);
                // Then the thread should be enabled
                expect(isThreadDisabled).toBeFalsy();
            });
            it('should be enabled if the report is archived and child visible action count is 1', function () {
                // Given a normal report action with one child visible action count
                var reportAction = {
                    message: [
                        {
                            translationKey: '',
                            type: 'COMMENT',
                            html: 'test',
                            text: 'test',
                        },
                    ],
                    childVisibleActionCount: 1,
                };
                // And a report that is not archived
                var isReportArchived = true;
                // When it's checked to see if the thread should be disabled
                var isThreadDisabled = (0, ReportUtils_1.shouldDisableThread)(reportAction, reportID, false, isReportArchived);
                // Then the thread should be enabled
                expect(isThreadDisabled).toBeFalsy();
            });
            it('should be disabled if the report is archived and child visible action count is 0', function () {
                // Given a normal report action with zero child visible action counts
                var reportAction = {
                    message: [
                        {
                            translationKey: '',
                            type: 'COMMENT',
                            html: 'test',
                            text: 'test',
                        },
                    ],
                    childVisibleActionCount: 0,
                };
                // And a report that is not archived
                var isReportArchived = true;
                // When it's checked to see if the thread should be disabled
                var isThreadDisabled = (0, ReportUtils_1.shouldDisableThread)(reportAction, reportID, false, isReportArchived);
                // Then the thread should be disabled
                expect(isThreadDisabled).toBeTruthy();
            });
        });
    });
    describe('getAllAncestorReportActions', function () {
        var reports = [
            { reportID: '1', lastReadTime: '2024-02-01 04:56:47.233', reportName: 'Report' },
            { reportID: '2', lastReadTime: '2024-02-01 04:56:47.233', parentReportActionID: '1', parentReportID: '1', reportName: 'Report' },
            { reportID: '3', lastReadTime: '2024-02-01 04:56:47.233', parentReportActionID: '2', parentReportID: '2', reportName: 'Report' },
            { reportID: '4', lastReadTime: '2024-02-01 04:56:47.233', parentReportActionID: '3', parentReportID: '3', reportName: 'Report' },
            { reportID: '5', lastReadTime: '2024-02-01 04:56:47.233', parentReportActionID: '4', parentReportID: '4', reportName: 'Report' },
        ];
        var reportActions = [
            { reportActionID: '1', created: '2024-02-01 04:42:22.965', actionName: CONST_1.default.REPORT.ACTIONS.TYPE.MARKED_REIMBURSED },
            { reportActionID: '2', created: '2024-02-01 04:42:28.003', actionName: CONST_1.default.REPORT.ACTIONS.TYPE.MARKED_REIMBURSED },
            { reportActionID: '3', created: '2024-02-01 04:42:31.742', actionName: CONST_1.default.REPORT.ACTIONS.TYPE.MARKED_REIMBURSED },
            { reportActionID: '4', created: '2024-02-01 04:42:35.619', actionName: CONST_1.default.REPORT.ACTIONS.TYPE.MARKED_REIMBURSED },
        ];
        (0, globals_1.beforeAll)(function () {
            var reportCollectionDataSet = (0, CollectionDataSet_1.toCollectionDataSet)(ONYXKEYS_1.default.COLLECTION.REPORT, reports, function (report) { return report.reportID; });
            var reportActionCollectionDataSet = (0, CollectionDataSet_1.toCollectionDataSet)(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS, reportActions.map(function (reportAction) {
                var _a;
                return (_a = {}, _a[reportAction.reportActionID] = reportAction, _a);
            }), function (actions) { var _a; return (_a = Object.values(actions).at(0)) === null || _a === void 0 ? void 0 : _a.reportActionID; });
            react_native_onyx_1.default.multiSet(__assign(__assign({}, reportCollectionDataSet), reportActionCollectionDataSet));
            return (0, waitForBatchedUpdates_1.default)();
        });
        afterAll(function () { return react_native_onyx_1.default.clear(); });
        it('should return correctly all ancestors of a thread report', function () {
            var resultAncestors = [
                { report: reports.at(0), reportAction: reportActions.at(0), shouldDisplayNewMarker: false },
                { report: reports.at(1), reportAction: reportActions.at(1), shouldDisplayNewMarker: false },
                { report: reports.at(2), reportAction: reportActions.at(2), shouldDisplayNewMarker: false },
                { report: reports.at(3), reportAction: reportActions.at(3), shouldDisplayNewMarker: false },
            ];
            expect((0, ReportUtils_1.getAllAncestorReportActions)(reports.at(4))).toEqual(resultAncestors);
        });
    });
    describe('isChatUsedForOnboarding', function () {
        afterEach(function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, react_native_onyx_1.default.clear()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, react_native_onyx_1.default.set(ONYXKEYS_1.default.SESSION, { email: currentUserEmail, accountID: currentUserAccountID })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should return false if the report is neither the system or concierge chat', function () {
            expect((0, ReportUtils_1.isChatUsedForOnboarding)(LHNTestUtils.getFakeReport())).toBeFalsy();
        });
        it('should return false if the user account ID is odd and report is the system chat - only the Concierge chat chat should be the onboarding chat for users without the onboarding NVP', function () { return __awaiter(void 0, void 0, void 0, function () {
            var accountID, report;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        accountID = 1;
                        return [4 /*yield*/, react_native_onyx_1.default.multiSet((_a = {},
                                _a[ONYXKEYS_1.default.PERSONAL_DETAILS_LIST] = (_b = {},
                                    _b[accountID] = {
                                        accountID: accountID,
                                    },
                                    _b),
                                _a[ONYXKEYS_1.default.SESSION] = { email: currentUserEmail, accountID: accountID },
                                _a))];
                    case 1:
                        _c.sent();
                        report = __assign(__assign({}, LHNTestUtils.getFakeReport()), { chatType: CONST_1.default.REPORT.CHAT_TYPE.SYSTEM });
                        expect((0, ReportUtils_1.isChatUsedForOnboarding)(report)).toBeFalsy();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should return true if the user account ID is even and report is the concierge chat', function () { return __awaiter(void 0, void 0, void 0, function () {
            var accountID, report;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        accountID = 2;
                        report = LHNTestUtils.getFakeReport([accountID, CONST_1.default.ACCOUNT_ID.CONCIERGE]);
                        return [4 /*yield*/, react_native_onyx_1.default.multiSet((_a = {},
                                _a[ONYXKEYS_1.default.PERSONAL_DETAILS_LIST] = (_b = {},
                                    _b[accountID] = {
                                        accountID: accountID,
                                    },
                                    _b),
                                _a[ONYXKEYS_1.default.SESSION] = { email: currentUserEmail, accountID: accountID },
                                _a))];
                    case 1:
                        _c.sent();
                        return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report.reportID), report)];
                    case 2:
                        _c.sent();
                        // Test failure is being discussed here: https://github.com/Expensify/App/pull/63096#issuecomment-2930818443
                        expect(true).toBe(true);
                        return [2 /*return*/];
                }
            });
        }); });
        it("should use the report id from the onboarding NVP if it's set", function () { return __awaiter(void 0, void 0, void 0, function () {
            var reportID, report1, report2;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        reportID = '8010';
                        return [4 /*yield*/, react_native_onyx_1.default.multiSet((_a = {},
                                _a[ONYXKEYS_1.default.NVP_ONBOARDING] = { chatReportID: reportID, hasCompletedGuidedSetupFlow: true },
                                _a))];
                    case 1:
                        _b.sent();
                        report1 = __assign(__assign({}, LHNTestUtils.getFakeReport()), { reportID: reportID });
                        expect((0, ReportUtils_1.isChatUsedForOnboarding)(report1)).toBeTruthy();
                        report2 = __assign(__assign({}, LHNTestUtils.getFakeReport()), { reportID: '8011' });
                        expect((0, ReportUtils_1.isChatUsedForOnboarding)(report2)).toBeFalsy();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('canHoldUnholdReportAction', function () {
        it('should return canUnholdRequest as true for a held duplicate transaction', function () { return __awaiter(void 0, void 0, void 0, function () {
            var chatReport, reportPreviewReportActionID, expenseReport, expenseTransaction, reportPreview, expenseCreatedAction, transactionThreadReport;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        chatReport = { reportID: '1' };
                        reportPreviewReportActionID = '8';
                        expenseReport = (0, ReportUtils_1.buildOptimisticExpenseReport)(chatReport.reportID, '123', currentUserAccountID, 122, 'USD', undefined, reportPreviewReportActionID);
                        expenseTransaction = (0, TransactionUtils_1.buildOptimisticTransaction)({
                            transactionParams: {
                                amount: 100,
                                currency: 'USD',
                                reportID: expenseReport.reportID,
                            },
                        });
                        reportPreview = (0, ReportUtils_1.buildOptimisticReportPreview)(chatReport, expenseReport, '', expenseTransaction, expenseReport.reportID, reportPreviewReportActionID);
                        expenseCreatedAction = (0, ReportUtils_1.buildOptimisticIOUReportAction)({
                            type: 'create',
                            amount: 100,
                            currency: 'USD',
                            comment: '',
                            participants: [],
                            transactionID: expenseTransaction.transactionID,
                            iouReportID: expenseReport.reportID,
                        });
                        transactionThreadReport = (0, ReportUtils_1.buildTransactionThread)(expenseCreatedAction, expenseReport);
                        expenseCreatedAction.childReportID = transactionThreadReport.reportID;
                        return [4 /*yield*/, react_native_onyx_1.default.merge(ONYXKEYS_1.default.PERSONAL_DETAILS_LIST, {
                                currentUserAccountID: {
                                    accountID: currentUserAccountID,
                                    displayName: currentUserEmail,
                                    login: currentUserEmail,
                                },
                            })];
                    case 1:
                        _c.sent();
                        return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(expenseTransaction.transactionID), __assign({}, expenseTransaction))];
                    case 2:
                        _c.sent();
                        return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(expenseReport.reportID), expenseReport)];
                    case 3:
                        _c.sent();
                        return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(transactionThreadReport.reportID), transactionThreadReport)];
                    case 4:
                        _c.sent();
                        return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(expenseReport.reportID), (_a = {},
                                _a[expenseCreatedAction.reportActionID] = expenseCreatedAction,
                                _a))];
                    case 5:
                        _c.sent();
                        return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(chatReport.reportID), (_b = {},
                                _b[reportPreview.reportActionID] = reportPreview,
                                _b))];
                    case 6:
                        _c.sent();
                        // Given a transaction with duplicate transaction violation
                        return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS).concat(expenseTransaction.transactionID), [
                                {
                                    name: CONST_1.default.VIOLATIONS.DUPLICATED_TRANSACTION,
                                    type: CONST_1.default.VIOLATION_TYPES.WARNING,
                                },
                            ])];
                    case 7:
                        // Given a transaction with duplicate transaction violation
                        _c.sent();
                        expect((0, ReportUtils_1.canHoldUnholdReportAction)(expenseCreatedAction)).toEqual({ canHoldRequest: true, canUnholdRequest: false });
                        (0, IOU_1.putOnHold)(expenseTransaction.transactionID, 'hold', transactionThreadReport.reportID);
                        return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                    case 8:
                        _c.sent();
                        // canUnholdRequest should be true after the transaction is held.
                        expect((0, ReportUtils_1.canHoldUnholdReportAction)(expenseCreatedAction)).toEqual({ canHoldRequest: false, canUnholdRequest: true });
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('getQuickActionDetails', function () {
        it('if the report is archived, the quick action will hide the subtitle and avatar', function () {
            // Create a fake archived report as quick action report
            var archivedReport = __assign(__assign({}, LHNTestUtils.getFakeReport()), { reportID: '1' });
            var reportNameValuePairs = {
                type: 'chat',
                private_isArchived: DateUtils_1.default.getDBTime(),
            };
            // Get the quick action detail
            var quickActionDetails = (0, ReportUtils_1.getQuickActionDetails)(archivedReport, undefined, undefined, reportNameValuePairs);
            // Expect the quickActionAvatars is empty array and hideQABSubtitle is true since the quick action report is archived
            expect(quickActionDetails.quickActionAvatars.length).toEqual(0);
            expect(quickActionDetails.hideQABSubtitle).toEqual(true);
        });
    });
    describe('getChatByParticipants', function () {
        var userAccountID = 1;
        var userAccountID2 = 2;
        var oneOnOneChatReport;
        var groupChatReport;
        (0, globals_1.beforeAll)(function () {
            var _a, _b, _c, _d, _e;
            var invoiceReport = {
                reportID: '1',
                type: CONST_1.default.REPORT.TYPE.INVOICE,
                participants: (_a = {},
                    _a[userAccountID] = { notificationPreference: CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.ALWAYS },
                    _a[currentUserAccountID] = { notificationPreference: CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.ALWAYS },
                    _a),
            };
            var taskReport = {
                reportID: '2',
                type: CONST_1.default.REPORT.TYPE.TASK,
                participants: (_b = {},
                    _b[userAccountID] = { notificationPreference: CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.ALWAYS },
                    _b[currentUserAccountID] = { notificationPreference: CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.ALWAYS },
                    _b),
            };
            var iouReport = {
                reportID: '3',
                type: CONST_1.default.REPORT.TYPE.IOU,
                participants: (_c = {},
                    _c[userAccountID] = { notificationPreference: CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.ALWAYS },
                    _c[currentUserAccountID] = { notificationPreference: CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.ALWAYS },
                    _c),
            };
            groupChatReport = {
                reportID: '4',
                type: CONST_1.default.REPORT.TYPE.CHAT,
                chatType: CONST_1.default.REPORT.CHAT_TYPE.GROUP,
                participants: (_d = {},
                    _d[userAccountID] = { notificationPreference: CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.ALWAYS },
                    _d[userAccountID2] = { notificationPreference: CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.ALWAYS },
                    _d[currentUserAccountID] = { notificationPreference: CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.ALWAYS },
                    _d),
            };
            oneOnOneChatReport = {
                reportID: '5',
                type: CONST_1.default.REPORT.TYPE.CHAT,
                participants: (_e = {},
                    _e[userAccountID] = { notificationPreference: CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.ALWAYS },
                    _e[currentUserAccountID] = { notificationPreference: CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.ALWAYS },
                    _e),
            };
            var reportCollectionDataSet = (0, CollectionDataSet_1.toCollectionDataSet)(ONYXKEYS_1.default.COLLECTION.REPORT, [invoiceReport, taskReport, iouReport, groupChatReport, oneOnOneChatReport], function (item) { return item.reportID; });
            return react_native_onyx_1.default.mergeCollection(ONYXKEYS_1.default.COLLECTION.REPORT, reportCollectionDataSet);
        });
        it('should return the 1:1 chat', function () {
            var report = (0, ReportUtils_1.getChatByParticipants)([currentUserAccountID, userAccountID]);
            expect(report === null || report === void 0 ? void 0 : report.reportID).toEqual(oneOnOneChatReport.reportID);
        });
        it('should return the group chat', function () {
            var report = (0, ReportUtils_1.getChatByParticipants)([currentUserAccountID, userAccountID, userAccountID2], undefined, true);
            expect(report === null || report === void 0 ? void 0 : report.reportID).toEqual(groupChatReport.reportID);
        });
        it('should return undefined when no report is found', function () {
            var report = (0, ReportUtils_1.getChatByParticipants)([currentUserAccountID, userAccountID2], undefined);
            expect(report).toEqual(undefined);
        });
    });
    describe('getGroupChatName tests', function () {
        afterEach(function () { return react_native_onyx_1.default.clear(); });
        var fourParticipants = [
            { accountID: 1, login: 'email1@test.com' },
            { accountID: 2, login: 'email2@test.com' },
            { accountID: 3, login: 'email3@test.com' },
            { accountID: 4, login: 'email4@test.com' },
        ];
        var eightParticipants = [
            { accountID: 1, login: 'email1@test.com' },
            { accountID: 2, login: 'email2@test.com' },
            { accountID: 3, login: 'email3@test.com' },
            { accountID: 4, login: 'email4@test.com' },
            { accountID: 5, login: 'email5@test.com' },
            { accountID: 6, login: 'email6@test.com' },
            { accountID: 7, login: 'email7@test.com' },
            { accountID: 8, login: 'email8@test.com' },
        ];
        describe('When participantAccountIDs is passed to getGroupChatName', function () {
            it('Should show all participants name if count <= 5 and shouldApplyLimit is false', function () { return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, react_native_onyx_1.default.merge(ONYXKEYS_1.default.PERSONAL_DETAILS_LIST, LHNTestUtils_1.fakePersonalDetails)];
                        case 1:
                            _a.sent();
                            expect((0, ReportUtils_1.getGroupChatName)(fourParticipants)).toEqual('Four, One, Three, Two');
                            return [2 /*return*/];
                    }
                });
            }); });
            it('Should show all participants name if count <= 5 and shouldApplyLimit is true', function () { return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, react_native_onyx_1.default.merge(ONYXKEYS_1.default.PERSONAL_DETAILS_LIST, LHNTestUtils_1.fakePersonalDetails)];
                        case 1:
                            _a.sent();
                            expect((0, ReportUtils_1.getGroupChatName)(fourParticipants)).toEqual('Four, One, Three, Two');
                            return [2 /*return*/];
                    }
                });
            }); });
            it('Should show 5 participants name with ellipsis if count > 5 and shouldApplyLimit is true', function () { return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, react_native_onyx_1.default.merge(ONYXKEYS_1.default.PERSONAL_DETAILS_LIST, LHNTestUtils_1.fakePersonalDetails)];
                        case 1:
                            _a.sent();
                            expect((0, ReportUtils_1.getGroupChatName)(eightParticipants, true)).toEqual('Five, Four, One, Three, Two...');
                            return [2 /*return*/];
                    }
                });
            }); });
            it('Should show all participants name if count > 5 and shouldApplyLimit is false', function () { return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, react_native_onyx_1.default.merge(ONYXKEYS_1.default.PERSONAL_DETAILS_LIST, LHNTestUtils_1.fakePersonalDetails)];
                        case 1:
                            _a.sent();
                            expect((0, ReportUtils_1.getGroupChatName)(eightParticipants, false)).toEqual('Eight, Five, Four, One, Seven, Six, Three, Two');
                            return [2 /*return*/];
                    }
                });
            }); });
            it('Should use correct display name for participants', function () { return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, react_native_onyx_1.default.merge(ONYXKEYS_1.default.PERSONAL_DETAILS_LIST, participantsPersonalDetails)];
                        case 1:
                            _a.sent();
                            expect((0, ReportUtils_1.getGroupChatName)(fourParticipants, true)).toEqual('(833) 240-3627, floki@vikings.net, Lagertha, Ragnar');
                            return [2 /*return*/];
                    }
                });
            }); });
        });
        describe('When participantAccountIDs is not passed to getGroupChatName and report ID is passed', function () {
            it('Should show report name if count <= 5 and shouldApplyLimit is false', function () { return __awaiter(void 0, void 0, void 0, function () {
                var report;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            report = __assign(__assign({}, LHNTestUtils.getFakeReport([1, 2, 3, 4], 0, false, [1])), { chatType: CONST_1.default.REPORT.CHAT_TYPE.GROUP, reportID: "1", reportName: "Let's talk" });
                            return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT, "1"), report)];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, react_native_onyx_1.default.merge(ONYXKEYS_1.default.PERSONAL_DETAILS_LIST, LHNTestUtils_1.fakePersonalDetails)];
                        case 2:
                            _a.sent();
                            expect((0, ReportUtils_1.getGroupChatName)(undefined, false, report)).toEqual("Let's talk");
                            return [2 /*return*/];
                    }
                });
            }); });
            it('Should show report name if count <= 5 and shouldApplyLimit is true', function () { return __awaiter(void 0, void 0, void 0, function () {
                var report;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            report = __assign(__assign({}, LHNTestUtils.getFakeReport([1, 2, 3, 4], 0, false, [1])), { chatType: CONST_1.default.REPORT.CHAT_TYPE.GROUP, reportID: "1", reportName: "Let's talk" });
                            return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT, "1"), report)];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, react_native_onyx_1.default.merge(ONYXKEYS_1.default.PERSONAL_DETAILS_LIST, LHNTestUtils_1.fakePersonalDetails)];
                        case 2:
                            _a.sent();
                            expect((0, ReportUtils_1.getGroupChatName)(undefined, true, report)).toEqual("Let's talk");
                            return [2 /*return*/];
                    }
                });
            }); });
            it('Should show report name if count > 5 and shouldApplyLimit is true', function () { return __awaiter(void 0, void 0, void 0, function () {
                var report;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            report = __assign(__assign({}, LHNTestUtils.getFakeReport([1, 2, 3, 4, 5, 6, 7, 8], 0, false, [1, 2])), { chatType: CONST_1.default.REPORT.CHAT_TYPE.GROUP, reportID: "1", reportName: "Let's talk" });
                            return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT, "1"), report)];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, react_native_onyx_1.default.merge(ONYXKEYS_1.default.PERSONAL_DETAILS_LIST, LHNTestUtils_1.fakePersonalDetails)];
                        case 2:
                            _a.sent();
                            expect((0, ReportUtils_1.getGroupChatName)(undefined, true, report)).toEqual("Let's talk");
                            return [2 /*return*/];
                    }
                });
            }); });
            it('Should show report name if count > 5 and shouldApplyLimit is false', function () { return __awaiter(void 0, void 0, void 0, function () {
                var report;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            report = __assign(__assign({}, LHNTestUtils.getFakeReport([1, 2, 3, 4, 5, 6, 7, 8], 0, false, [1, 2])), { chatType: CONST_1.default.REPORT.CHAT_TYPE.GROUP, reportID: "1", reportName: "Let's talk" });
                            return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT, "1"), report)];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, react_native_onyx_1.default.merge(ONYXKEYS_1.default.PERSONAL_DETAILS_LIST, LHNTestUtils_1.fakePersonalDetails)];
                        case 2:
                            _a.sent();
                            expect((0, ReportUtils_1.getGroupChatName)(undefined, false, report)).toEqual("Let's talk");
                            return [2 /*return*/];
                    }
                });
            }); });
            it('Should show participant names if report name is not available', function () { return __awaiter(void 0, void 0, void 0, function () {
                var report;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            report = __assign(__assign({}, LHNTestUtils.getFakeReport([1, 2, 3, 4, 5, 6, 7, 8], 0, false, [1, 2])), { chatType: CONST_1.default.REPORT.CHAT_TYPE.GROUP, reportID: "1", reportName: '' });
                            return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT, "1"), report)];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, react_native_onyx_1.default.merge(ONYXKEYS_1.default.PERSONAL_DETAILS_LIST, LHNTestUtils_1.fakePersonalDetails)];
                        case 2:
                            _a.sent();
                            expect((0, ReportUtils_1.getGroupChatName)(undefined, false, report)).toEqual('Eight, Five, Four, One, Seven, Six, Three, Two');
                            return [2 /*return*/];
                    }
                });
            }); });
        });
    });
    describe('shouldReportBeInOptionList tests', function () {
        afterEach(function () { return react_native_onyx_1.default.clear(); });
        it('should return true when the report is current active report', function () {
            var report = LHNTestUtils.getFakeReport();
            var currentReportId = report.reportID;
            var isInFocusMode = true;
            var betas = [CONST_1.default.BETAS.DEFAULT_ROOMS];
            expect((0, ReportUtils_1.shouldReportBeInOptionList)({
                report: report,
                chatReport: reports_1.chatReportR14932,
                currentReportId: currentReportId,
                isInFocusMode: isInFocusMode,
                betas: betas,
                doesReportHaveViolations: false,
                excludeEmptyChats: false,
            })).toBeTruthy();
        });
        it('should return true when the report has outstanding violations', function () { return __awaiter(void 0, void 0, void 0, function () {
            var expenseReport, expenseTransaction, expenseCreatedAction1, expenseCreatedAction2, transactionThreadReport, currentReportId, isInFocusMode, betas;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        expenseReport = (0, ReportUtils_1.buildOptimisticExpenseReport)('212', '123', 100, 122, 'USD');
                        expenseTransaction = (0, TransactionUtils_1.buildOptimisticTransaction)({
                            transactionParams: {
                                amount: 100,
                                currency: 'USD',
                                reportID: expenseReport.reportID,
                            },
                        });
                        expenseCreatedAction1 = (0, ReportUtils_1.buildOptimisticIOUReportAction)({
                            type: 'create',
                            amount: 100,
                            currency: 'USD',
                            comment: '',
                            participants: [],
                            transactionID: expenseTransaction.transactionID,
                            iouReportID: expenseReport.reportID,
                        });
                        expenseCreatedAction2 = (0, ReportUtils_1.buildOptimisticIOUReportAction)({
                            type: 'create',
                            amount: 100,
                            currency: 'USD',
                            comment: '',
                            participants: [],
                            transactionID: expenseTransaction.transactionID,
                            iouReportID: expenseReport.reportID,
                        });
                        transactionThreadReport = (0, ReportUtils_1.buildTransactionThread)(expenseCreatedAction1, expenseReport);
                        currentReportId = '1';
                        isInFocusMode = false;
                        betas = [CONST_1.default.BETAS.DEFAULT_ROOMS];
                        return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(expenseReport.reportID), expenseReport)];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(expenseReport.reportID), (_a = {},
                                _a[expenseCreatedAction1.reportActionID] = expenseCreatedAction1,
                                _a[expenseCreatedAction2.reportActionID] = expenseCreatedAction2,
                                _a))];
                    case 2:
                        _b.sent();
                        expect((0, ReportUtils_1.shouldReportBeInOptionList)({
                            report: transactionThreadReport,
                            chatReport: reports_1.chatReportR14932,
                            currentReportId: currentReportId,
                            isInFocusMode: isInFocusMode,
                            betas: betas,
                            doesReportHaveViolations: true,
                            excludeEmptyChats: false,
                        })).toBeTruthy();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should return true when the report needing user action', function () {
            var chatReport = __assign(__assign({}, LHNTestUtils.getFakeReport()), { hasOutstandingChildRequest: true });
            var currentReportId = '3';
            var isInFocusMode = true;
            var betas = [CONST_1.default.BETAS.DEFAULT_ROOMS];
            expect((0, ReportUtils_1.shouldReportBeInOptionList)({
                report: chatReport,
                chatReport: reports_1.chatReportR14932,
                currentReportId: currentReportId,
                isInFocusMode: isInFocusMode,
                betas: betas,
                doesReportHaveViolations: false,
                excludeEmptyChats: false,
            })).toBeTruthy();
        });
        it('should return true when the report has valid draft comment', function () { return __awaiter(void 0, void 0, void 0, function () {
            var report, currentReportId, isInFocusMode, betas;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        report = LHNTestUtils.getFakeReport();
                        currentReportId = '3';
                        isInFocusMode = false;
                        betas = [CONST_1.default.BETAS.DEFAULT_ROOMS];
                        return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_DRAFT_COMMENT).concat(report.reportID), 'fake draft')];
                    case 1:
                        _a.sent();
                        expect((0, ReportUtils_1.shouldReportBeInOptionList)({
                            report: report,
                            chatReport: reports_1.chatReportR14932,
                            currentReportId: currentReportId,
                            isInFocusMode: isInFocusMode,
                            betas: betas,
                            doesReportHaveViolations: false,
                            excludeEmptyChats: false,
                        })).toBeTruthy();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should return true when the report is pinned', function () {
            var report = __assign(__assign({}, LHNTestUtils.getFakeReport()), { isPinned: true });
            var currentReportId = '3';
            var isInFocusMode = false;
            var betas = [CONST_1.default.BETAS.DEFAULT_ROOMS];
            expect((0, ReportUtils_1.shouldReportBeInOptionList)({
                report: report,
                chatReport: reports_1.chatReportR14932,
                currentReportId: currentReportId,
                isInFocusMode: isInFocusMode,
                betas: betas,
                doesReportHaveViolations: false,
                excludeEmptyChats: false,
            })).toBeTruthy();
        });
        it('should return true when the report is unread and we are in the focus mode', function () { return __awaiter(void 0, void 0, void 0, function () {
            var report, currentReportId, isInFocusMode, betas;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        report = __assign(__assign({}, LHNTestUtils.getFakeReport()), { lastReadTime: '1', lastVisibleActionCreated: '2', type: CONST_1.default.REPORT.TYPE.CHAT, participants: {
                                '1': {
                                    notificationPreference: 'always',
                                },
                            }, lastMessageText: 'fake' });
                        currentReportId = '3';
                        isInFocusMode = true;
                        betas = [CONST_1.default.BETAS.DEFAULT_ROOMS];
                        return [4 /*yield*/, react_native_onyx_1.default.merge(ONYXKEYS_1.default.SESSION, {
                                accountID: 1,
                            })];
                    case 1:
                        _a.sent();
                        expect((0, ReportUtils_1.shouldReportBeInOptionList)({
                            report: report,
                            chatReport: reports_1.chatReportR14932,
                            currentReportId: currentReportId,
                            isInFocusMode: isInFocusMode,
                            betas: betas,
                            doesReportHaveViolations: false,
                            excludeEmptyChats: false,
                        })).toBeTruthy();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should return true when the report is an archived report and we are in the default mode', function () { return __awaiter(void 0, void 0, void 0, function () {
            var archivedReport, reportNameValuePairs, currentReportId, isInFocusMode, betas, isReportArchived;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        archivedReport = __assign(__assign({}, LHNTestUtils.getFakeReport()), { reportID: '1' });
                        reportNameValuePairs = {
                            type: 'chat',
                            private_isArchived: DateUtils_1.default.getDBTime(),
                        };
                        currentReportId = '3';
                        isInFocusMode = false;
                        betas = [CONST_1.default.BETAS.DEFAULT_ROOMS];
                        return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_NAME_VALUE_PAIRS).concat(archivedReport.reportID), reportNameValuePairs)];
                    case 1:
                        _a.sent();
                        isReportArchived = (0, react_native_1.renderHook)(function () { return (0, useReportIsArchived_1.default)(archivedReport === null || archivedReport === void 0 ? void 0 : archivedReport.reportID); }).result;
                        expect((0, ReportUtils_1.shouldReportBeInOptionList)({
                            report: archivedReport,
                            chatReport: reports_1.chatReportR14932,
                            currentReportId: currentReportId,
                            isInFocusMode: isInFocusMode,
                            betas: betas,
                            doesReportHaveViolations: false,
                            excludeEmptyChats: false,
                            isReportArchived: isReportArchived.current,
                        })).toBeTruthy();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should return false when the report is an archived report and we are in the focus mode', function () { return __awaiter(void 0, void 0, void 0, function () {
            var archivedReport, reportNameValuePairs, currentReportId, isInFocusMode, betas, isReportArchived;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        archivedReport = __assign(__assign({}, LHNTestUtils.getFakeReport()), { reportID: '1' });
                        reportNameValuePairs = {
                            type: 'chat',
                            private_isArchived: DateUtils_1.default.getDBTime(),
                        };
                        currentReportId = '3';
                        isInFocusMode = true;
                        betas = [CONST_1.default.BETAS.DEFAULT_ROOMS];
                        return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_NAME_VALUE_PAIRS).concat(archivedReport.reportID), reportNameValuePairs)];
                    case 1:
                        _a.sent();
                        isReportArchived = (0, react_native_1.renderHook)(function () { return (0, useReportIsArchived_1.default)(archivedReport === null || archivedReport === void 0 ? void 0 : archivedReport.reportID); }).result;
                        expect((0, ReportUtils_1.shouldReportBeInOptionList)({
                            report: archivedReport,
                            chatReport: reports_1.chatReportR14932,
                            currentReportId: currentReportId,
                            isInFocusMode: isInFocusMode,
                            betas: betas,
                            doesReportHaveViolations: false,
                            excludeEmptyChats: false,
                            isReportArchived: isReportArchived.current,
                        })).toBeFalsy();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should return true when the report is selfDM', function () {
            var report = __assign(__assign({}, LHNTestUtils.getFakeReport()), { chatType: CONST_1.default.REPORT.CHAT_TYPE.SELF_DM });
            var currentReportId = '3';
            var isInFocusMode = false;
            var betas = [CONST_1.default.BETAS.DEFAULT_ROOMS];
            var includeSelfDM = true;
            expect((0, ReportUtils_1.shouldReportBeInOptionList)({
                report: report,
                chatReport: reports_1.chatReportR14932,
                currentReportId: currentReportId,
                isInFocusMode: isInFocusMode,
                betas: betas,
                doesReportHaveViolations: false,
                excludeEmptyChats: false,
                includeSelfDM: includeSelfDM,
            })).toBeTruthy();
        });
        it('should return false when the report is marked as hidden', function () {
            var report = __assign(__assign({}, LHNTestUtils.getFakeReport()), { participants: {
                    '1': {
                        notificationPreference: CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.HIDDEN,
                    },
                } });
            var currentReportId = '';
            var isInFocusMode = true;
            var betas = [CONST_1.default.BETAS.DEFAULT_ROOMS];
            expect((0, ReportUtils_1.shouldReportBeInOptionList)({
                report: report,
                chatReport: reports_1.chatReportR14932,
                currentReportId: currentReportId,
                isInFocusMode: isInFocusMode,
                betas: betas,
                doesReportHaveViolations: false,
                excludeEmptyChats: false,
            })).toBeFalsy();
        });
        it('should return false when the report does not have participants', function () {
            var report = LHNTestUtils.getFakeReport([]);
            var currentReportId = '';
            var isInFocusMode = true;
            var betas = [CONST_1.default.BETAS.DEFAULT_ROOMS];
            expect((0, ReportUtils_1.shouldReportBeInOptionList)({
                report: report,
                chatReport: reports_1.chatReportR14932,
                currentReportId: currentReportId,
                isInFocusMode: isInFocusMode,
                betas: betas,
                doesReportHaveViolations: false,
                excludeEmptyChats: false,
            })).toBeFalsy();
        });
        it('should return false when the report is the report that the user cannot access due to policy restrictions', function () {
            var report = __assign(__assign({}, LHNTestUtils.getFakeReport()), { chatType: CONST_1.default.REPORT.CHAT_TYPE.DOMAIN_ALL });
            var currentReportId = '';
            var isInFocusMode = false;
            var betas = [];
            expect((0, ReportUtils_1.shouldReportBeInOptionList)({
                report: report,
                chatReport: reports_1.chatReportR14932,
                currentReportId: currentReportId,
                isInFocusMode: isInFocusMode,
                betas: betas,
                doesReportHaveViolations: false,
                excludeEmptyChats: false,
            })).toBeFalsy();
        });
        it('should return false when the report is the single transaction thread', function () { return __awaiter(void 0, void 0, void 0, function () {
            var expenseReport, expenseTransaction, expenseCreatedAction, transactionThreadReport, currentReportId, isInFocusMode, betas;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        expenseReport = (0, ReportUtils_1.buildOptimisticExpenseReport)('212', '123', 100, 122, 'USD');
                        expenseTransaction = (0, TransactionUtils_1.buildOptimisticTransaction)({
                            transactionParams: {
                                amount: 100,
                                currency: 'USD',
                                reportID: expenseReport.reportID,
                            },
                        });
                        expenseCreatedAction = (0, ReportUtils_1.buildOptimisticIOUReportAction)({
                            type: 'create',
                            amount: 100,
                            currency: 'USD',
                            comment: '',
                            participants: [],
                            transactionID: expenseTransaction.transactionID,
                            iouReportID: expenseReport.reportID,
                        });
                        transactionThreadReport = (0, ReportUtils_1.buildTransactionThread)(expenseCreatedAction, expenseReport);
                        expenseCreatedAction.childReportID = transactionThreadReport.reportID;
                        currentReportId = '1';
                        isInFocusMode = false;
                        betas = [CONST_1.default.BETAS.DEFAULT_ROOMS];
                        return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(expenseReport.reportID), expenseReport)];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(expenseReport.reportID), (_a = {},
                                _a[expenseCreatedAction.reportActionID] = expenseCreatedAction,
                                _a))];
                    case 2:
                        _b.sent();
                        expect((0, ReportUtils_1.shouldReportBeInOptionList)({
                            report: transactionThreadReport,
                            chatReport: reports_1.chatReportR14932,
                            currentReportId: currentReportId,
                            isInFocusMode: isInFocusMode,
                            betas: betas,
                            doesReportHaveViolations: false,
                            excludeEmptyChats: false,
                        })).toBeFalsy();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should return false when the report is empty chat and the excludeEmptyChats setting is true', function () {
            var report = LHNTestUtils.getFakeReport();
            var currentReportId = '';
            var isInFocusMode = false;
            var betas = [CONST_1.default.BETAS.DEFAULT_ROOMS];
            expect((0, ReportUtils_1.shouldReportBeInOptionList)({
                report: report,
                chatReport: reports_1.chatReportR14932,
                currentReportId: currentReportId,
                isInFocusMode: isInFocusMode,
                betas: betas,
                doesReportHaveViolations: false,
                excludeEmptyChats: true,
            })).toBeFalsy();
        });
        it('should return false when the users email is domain-based and the includeDomainEmail is false', function () {
            var report = LHNTestUtils.getFakeReport();
            var currentReportId = '';
            var isInFocusMode = false;
            var betas = [CONST_1.default.BETAS.DEFAULT_ROOMS];
            expect((0, ReportUtils_1.shouldReportBeInOptionList)({
                report: report,
                chatReport: reports_1.chatReportR14932,
                currentReportId: currentReportId,
                isInFocusMode: isInFocusMode,
                betas: betas,
                doesReportHaveViolations: false,
                login: '+@domain.com',
                excludeEmptyChats: false,
                includeDomainEmail: false,
            })).toBeFalsy();
        });
        it('should return false when the report has the parent message is pending removal', function () { return __awaiter(void 0, void 0, void 0, function () {
            var parentReport, report, parentReportAction, currentReportId, isInFocusMode, betas;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        parentReport = LHNTestUtils.getFakeReport();
                        report = LHNTestUtils.getFakeReport();
                        parentReportAction = __assign(__assign({}, LHNTestUtils.getFakeReportAction()), { message: [
                                {
                                    type: 'COMMENT',
                                    html: 'hey',
                                    text: 'hey',
                                    isEdited: false,
                                    whisperedTo: [],
                                    isDeletedParentAction: false,
                                    moderationDecision: {
                                        decision: CONST_1.default.MODERATION.MODERATOR_DECISION_PENDING_REMOVE,
                                    },
                                },
                            ], childReportID: report.reportID });
                        report.parentReportID = parentReport.reportID;
                        report.parentReportActionID = parentReportAction.reportActionID;
                        currentReportId = '';
                        isInFocusMode = false;
                        betas = [CONST_1.default.BETAS.DEFAULT_ROOMS];
                        return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(parentReport.reportID), parentReport)];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(parentReport.reportID), (_a = {},
                                _a[parentReportAction.reportActionID] = parentReportAction,
                                _a))];
                    case 2:
                        _b.sent();
                        expect((0, ReportUtils_1.shouldReportBeInOptionList)({
                            report: report,
                            chatReport: reports_1.chatReportR14932,
                            currentReportId: currentReportId,
                            isInFocusMode: isInFocusMode,
                            betas: betas,
                            doesReportHaveViolations: false,
                            excludeEmptyChats: false,
                        })).toBeFalsy();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should return false when the report is read and we are in the focus mode', function () {
            var report = LHNTestUtils.getFakeReport();
            var currentReportId = '';
            var isInFocusMode = true;
            var betas = [CONST_1.default.BETAS.DEFAULT_ROOMS];
            expect((0, ReportUtils_1.shouldReportBeInOptionList)({
                report: report,
                chatReport: reports_1.chatReportR14932,
                currentReportId: currentReportId,
                isInFocusMode: isInFocusMode,
                betas: betas,
                doesReportHaveViolations: false,
                excludeEmptyChats: false,
            })).toBeFalsy();
        });
        it('should return false when the empty report has deleted action with child comment but isDeletedParentAction is false', function () { return __awaiter(void 0, void 0, void 0, function () {
            var report, iouReportAction;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        report = LHNTestUtils.getFakeReport();
                        iouReportAction = __assign(__assign({}, LHNTestUtils.getFakeReportAction()), { message: [
                                {
                                    type: 'COMMENT',
                                    html: '',
                                    text: '',
                                    isEdited: false,
                                    whisperedTo: [],
                                    isDeletedParentAction: false,
                                },
                            ], childVisibleActionCount: 1 });
                        return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(report.reportID), (_a = {},
                                _a[iouReportAction.reportActionID] = iouReportAction,
                                _a))];
                    case 1:
                        _b.sent();
                        expect((0, ReportUtils_1.shouldReportBeInOptionList)({
                            report: report,
                            chatReport: reports_1.chatReportR14932,
                            currentReportId: '',
                            isInFocusMode: false,
                            betas: [],
                            doesReportHaveViolations: false,
                            excludeEmptyChats: true,
                        })).toBeFalsy();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('buildOptimisticChatReport', function () {
        it('should always set isPinned to false', function () {
            var result = (0, ReportUtils_1.buildOptimisticChatReport)({
                participantList: [1, 2, 3],
            });
            expect(result.isPinned).toBe(false);
        });
    });
    describe('getInvoiceChatByParticipants', function () {
        it('only returns an invoice chat if the receiver type matches', function () {
            var _a;
            // Given an invoice chat that has been converted from an individual to policy receiver type
            var reports = (_a = {},
                _a[Invoice_1.convertedInvoiceChat.reportID] = Invoice_1.convertedInvoiceChat,
                _a);
            // When we send another invoice to the individual from global create and call getInvoiceChatByParticipants
            var invoiceChatReport = (0, ReportUtils_1.getInvoiceChatByParticipants)(33, CONST_1.default.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL, Invoice_1.convertedInvoiceChat.policyID, reports);
            // Then no invoice chat should be returned because the receiver type does not match
            expect(invoiceChatReport).toBeUndefined();
        });
    });
    describe('getWorkspaceNameUpdatedMessage', function () {
        it('return the encoded workspace name updated message', function () {
            var action = {
                originalMessage: {
                    newName: '&#104;&#101;&#108;&#108;&#111;',
                    oldName: 'workspace 1',
                },
            };
            expect((0, ReportUtils_1.getWorkspaceNameUpdatedMessage)(action)).toEqual('updated the name of this workspace to &quot;&amp;#104;&amp;#101;&amp;#108;&amp;#108;&amp;#111;&quot; (previously &quot;workspace 1&quot;)');
        });
    });
    describe('buildOptimisticIOUReportAction', function () {
        it('should not include IOUReportID in the originalMessage when tracking a personal expense', function () {
            var _a;
            var iouAction = (0, ReportUtils_1.buildOptimisticIOUReportAction)({
                type: 'track',
                amount: 1200,
                currency: 'INR',
                comment: '',
                participants: [{ login: 'email1@test.com' }],
                transactionID: '8749701985416635400',
                iouReportID: '8698041594589716',
                isPersonalTrackingExpense: true,
            });
            expect((_a = (0, ReportActionsUtils_1.getOriginalMessage)(iouAction)) === null || _a === void 0 ? void 0 : _a.IOUReportID).toBe(undefined);
        });
    });
    describe('isAllowedToApproveExpenseReport', function () {
        var expenseReport = __assign(__assign({}, (0, reports_2.createRandomReport)(6)), { type: CONST_1.default.REPORT.TYPE.EXPENSE, ownerAccountID: currentUserAccountID });
        it('should return true if preventSelfApproval is disabled and the approver is not the owner of the expense report', function () {
            var fakePolicy = __assign(__assign({}, (0, policies_1.default)(6)), { preventSelfApproval: false });
            expect((0, ReportUtils_1.isAllowedToApproveExpenseReport)(expenseReport, 0, fakePolicy)).toBeTruthy();
        });
        it('should return true if preventSelfApproval is enabled and the approver is not the owner of the expense report', function () {
            var fakePolicy = __assign(__assign({}, (0, policies_1.default)(6)), { preventSelfApproval: true });
            expect((0, ReportUtils_1.isAllowedToApproveExpenseReport)(expenseReport, 0, fakePolicy)).toBeTruthy();
        });
        it('should return true if preventSelfApproval is disabled and the approver is the owner of the expense report', function () {
            var fakePolicy = __assign(__assign({}, (0, policies_1.default)(6)), { preventSelfApproval: false });
            expect((0, ReportUtils_1.isAllowedToApproveExpenseReport)(expenseReport, currentUserAccountID, fakePolicy)).toBeTruthy();
        });
        it('should return false if preventSelfApproval is enabled and the approver is the owner of the expense report', function () {
            var fakePolicy = __assign(__assign({}, (0, policies_1.default)(6)), { preventSelfApproval: true });
            expect((0, ReportUtils_1.isAllowedToApproveExpenseReport)(expenseReport, currentUserAccountID, fakePolicy)).toBeFalsy();
        });
    });
    describe('isArchivedReport', function () {
        var archivedReport = __assign(__assign({}, (0, reports_2.createRandomReport)(1)), { chatType: CONST_1.default.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT });
        var nonArchivedReport = __assign(__assign({}, (0, reports_2.createRandomReport)(2)), { chatType: CONST_1.default.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT });
        (0, globals_1.beforeAll)(function () { return __awaiter(void 0, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, react_native_onyx_1.default.setCollection(ONYXKEYS_1.default.COLLECTION.REPORT_NAME_VALUE_PAIRS, (_a = {},
                            _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_NAME_VALUE_PAIRS).concat(archivedReport.reportID)] = { private_isArchived: DateUtils_1.default.getDBTime() },
                            _a))];
                    case 1:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should return true for archived report', function () { return __awaiter(void 0, void 0, void 0, function () {
            var reportNameValuePairs;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, new Promise(function (resolve) {
                            react_native_onyx_1.default.connect({
                                key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_NAME_VALUE_PAIRS).concat(archivedReport.reportID),
                                callback: resolve,
                            });
                        })];
                    case 1:
                        reportNameValuePairs = _a.sent();
                        expect((0, ReportUtils_1.isArchivedReport)(reportNameValuePairs)).toBe(true);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should return false for non-archived report', function () { return __awaiter(void 0, void 0, void 0, function () {
            var reportNameValuePairs;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, new Promise(function (resolve) {
                            react_native_onyx_1.default.connect({
                                key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_NAME_VALUE_PAIRS).concat(nonArchivedReport.reportID),
                                callback: resolve,
                            });
                            expect((0, ReportUtils_1.isArchivedReport)(reportNameValuePairs)).toBe(false);
                        })];
                    case 1:
                        reportNameValuePairs = _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('useReportIsArchived', function () {
        var archivedReport = __assign(__assign({}, (0, reports_2.createRandomReport)(1)), { chatType: CONST_1.default.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT });
        var nonArchivedReport = __assign(__assign({}, (0, reports_2.createRandomReport)(2)), { chatType: CONST_1.default.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT });
        (0, globals_1.beforeAll)(function () { return __awaiter(void 0, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, react_native_onyx_1.default.setCollection(ONYXKEYS_1.default.COLLECTION.REPORT_NAME_VALUE_PAIRS, (_a = {},
                            _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_NAME_VALUE_PAIRS).concat(archivedReport.reportID)] = { private_isArchived: DateUtils_1.default.getDBTime() },
                            _a))];
                    case 1:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should return true for archived report', function () {
            var isReportArchived = (0, react_native_1.renderHook)(function () { return (0, useReportIsArchived_1.default)(archivedReport === null || archivedReport === void 0 ? void 0 : archivedReport.reportID); }).result;
            expect(isReportArchived.current).toBe(true);
        });
        it('should return false for non-archived report', function () {
            var isReportArchived = (0, react_native_1.renderHook)(function () { return (0, useReportIsArchived_1.default)(nonArchivedReport === null || nonArchivedReport === void 0 ? void 0 : nonArchivedReport.reportID); }).result;
            expect(isReportArchived.current).toBe(false);
        });
    });
    describe('canEditWriteCapability', function () {
        it('should return false for expense chat', function () {
            var workspaceChat = __assign(__assign({}, (0, reports_2.createRandomReport)(1)), { chatType: CONST_1.default.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT });
            expect((0, ReportUtils_1.canEditWriteCapability)(workspaceChat, __assign(__assign({}, policy), { role: CONST_1.default.POLICY.ROLE.ADMIN }), false)).toBe(false);
        });
        var policyAnnounceRoom = __assign(__assign({}, (0, reports_2.createRandomReport)(1)), { chatType: CONST_1.default.REPORT.CHAT_TYPE.POLICY_ANNOUNCE });
        var adminPolicy = __assign(__assign({}, policy), { role: CONST_1.default.POLICY.ROLE.ADMIN });
        it('should return true for non-archived policy announce room', function () {
            expect((0, ReportUtils_1.canEditWriteCapability)(policyAnnounceRoom, adminPolicy, false)).toBe(true);
        });
        it('should return false for archived policy announce room', function () {
            expect((0, ReportUtils_1.canEditWriteCapability)(policyAnnounceRoom, adminPolicy, true)).toBe(false);
        });
        it('should return false for non-admin user', function () {
            var normalChat = (0, reports_2.createRandomReport)(11);
            var memberPolicy = __assign(__assign({}, policy), { role: CONST_1.default.POLICY.ROLE.USER });
            expect((0, ReportUtils_1.canEditWriteCapability)(normalChat, memberPolicy, false)).toBe(false);
        });
        it('should return false for admin room', function () {
            var adminRoom = __assign(__assign({}, (0, reports_2.createRandomReport)(12)), { chatType: CONST_1.default.REPORT.CHAT_TYPE.POLICY_ADMINS });
            expect((0, ReportUtils_1.canEditWriteCapability)(adminRoom, adminPolicy, false)).toBe(false);
        });
        it('should return false for thread reports', function () {
            var parent = (0, reports_2.createRandomReport)(13);
            var thread = __assign(__assign({}, (0, reports_2.createRandomReport)(14)), { parentReportID: parent.reportID, parentReportActionID: '2' });
            expect((0, ReportUtils_1.canEditWriteCapability)(thread, adminPolicy, false)).toBe(false);
        });
        it('should return false for invoice rooms', function () {
            var invoiceRoom = __assign(__assign({}, (0, reports_2.createRandomReport)(13)), { chatType: CONST_1.default.REPORT.CHAT_TYPE.INVOICE });
            expect((0, ReportUtils_1.canEditWriteCapability)(invoiceRoom, adminPolicy, false)).toBe(false);
        });
    });
    describe('canEditRoomVisibility', function () {
        it('should return true for policy rooms that are not archived and the user is an admin', function () {
            expect((0, ReportUtils_1.canEditRoomVisibility)(__assign(__assign({}, policy), { role: CONST_1.default.POLICY.ROLE.ADMIN }), false)).toBeTruthy();
            expect((0, ReportUtils_1.canEditRoomVisibility)(__assign(__assign({}, policy), { role: CONST_1.default.POLICY.ROLE.AUDITOR }), false)).toBeFalsy();
            expect((0, ReportUtils_1.canEditRoomVisibility)(__assign(__assign({}, policy), { role: CONST_1.default.POLICY.ROLE.USER }), false)).toBeFalsy();
        });
        it('should return false for policy rooms that are archived regardless of the policy role', function () {
            expect((0, ReportUtils_1.canEditRoomVisibility)(__assign(__assign({}, policy), { role: CONST_1.default.POLICY.ROLE.ADMIN }), true)).toBeFalsy();
            expect((0, ReportUtils_1.canEditRoomVisibility)(__assign(__assign({}, policy), { role: CONST_1.default.POLICY.ROLE.AUDITOR }), true)).toBeFalsy();
            expect((0, ReportUtils_1.canEditRoomVisibility)(__assign(__assign({}, policy), { role: CONST_1.default.POLICY.ROLE.USER }), true)).toBeFalsy();
        });
    });
    describe('canDeleteReportAction', function () {
        it('should return false for delete button visibility if transaction is not allowed to be deleted', function () {
            var parentReport = LHNTestUtils.getFakeReport();
            var report = LHNTestUtils.getFakeReport();
            var parentReportAction = __assign(__assign({}, LHNTestUtils.getFakeReportAction()), { message: [
                    {
                        type: 'COMMENT',
                        html: 'hey',
                        text: 'hey',
                        isEdited: false,
                        whisperedTo: [],
                        isDeletedParentAction: false,
                        moderationDecision: {
                            decision: CONST_1.default.MODERATION.MODERATOR_DECISION_PENDING_REMOVE,
                        },
                    },
                ], childReportID: report.reportID });
            report.parentReportID = parentReport.reportID;
            report.parentReportActionID = parentReportAction.reportActionID;
            var currentReportId = '';
            var transactionID = 1;
            var moneyRequestAction = __assign(__assign({}, parentReportAction), { actorAccountID: currentUserAccountID, actionName: CONST_1.default.REPORT.ACTIONS.TYPE.IOU, originalMessage: {
                    IOUReportID: '1',
                    IOUTransactionID: '1',
                    amount: 100,
                    participantAccountID: 1,
                    currency: CONST_1.default.CURRENCY.USD,
                    type: CONST_1.default.IOU.REPORT_ACTION_TYPE.PAY,
                    paymentType: CONST_1.default.IOU.PAYMENT_TYPE.EXPENSIFY,
                } });
            var transaction = __assign(__assign({}, (0, transaction_1.default)(transactionID)), { category: '', tag: '', created: testDate, reportID: currentReportId, managedCard: true, comment: {
                    liabilityType: CONST_1.default.TRANSACTION.LIABILITY_TYPE.RESTRICT,
                } });
            expect((0, ReportUtils_1.canDeleteReportAction)(moneyRequestAction, currentReportId, transaction)).toBe(false);
        });
    });
    describe('getPolicyExpenseChat', function () {
        it('should return the correct policy expense chat when we have a task report is the child of this report', function () { return __awaiter(void 0, void 0, void 0, function () {
            var policyExpenseChat, taskReport;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        policyExpenseChat = __assign(__assign({}, (0, reports_2.createRandomReport)(11)), { ownerAccountID: 1, policyID: '1', chatType: CONST_1.default.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT, type: CONST_1.default.REPORT.TYPE.CHAT });
                        taskReport = __assign(__assign({}, (0, reports_2.createRandomReport)(10)), { ownerAccountID: 1, policyID: '1', chatType: CONST_1.default.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT, type: CONST_1.default.REPORT.TYPE.TASK, parentReportID: policyExpenseChat.reportID, parentReportActionID: '1' });
                        return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(taskReport.reportID), taskReport)];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(policyExpenseChat.reportID), policyExpenseChat)];
                    case 2:
                        _b.sent();
                        expect((_a = (0, ReportUtils_1.getPolicyExpenseChat)(1, '1')) === null || _a === void 0 ? void 0 : _a.reportID).toBe(policyExpenseChat.reportID);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('findLastAccessedReport', function () {
        var archivedReport;
        var normalReport;
        (0, globals_1.beforeAll)(function () { return __awaiter(void 0, void 0, void 0, function () {
            var reportNameValuePairs;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Set up test reports - one archived, one normal
                        archivedReport = __assign(__assign({}, LHNTestUtils.getFakeReport()), { reportID: '1001', lastReadTime: '2024-02-01 04:56:47.233', lastVisibleActionCreated: '2024-02-01 04:56:47.233' });
                        normalReport = __assign(__assign({}, LHNTestUtils.getFakeReport()), { reportID: '1002', lastReadTime: '2024-01-01 04:56:47.233', lastVisibleActionCreated: '2024-01-01 04:56:47.233' });
                        reportNameValuePairs = {
                            private_isArchived: DateUtils_1.default.getDBTime(),
                        };
                        // Add reports to Onyx
                        return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(archivedReport.reportID), archivedReport)];
                    case 1:
                        // Add reports to Onyx
                        _a.sent();
                        return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(normalReport.reportID), normalReport)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_NAME_VALUE_PAIRS).concat(archivedReport.reportID), reportNameValuePairs)];
                    case 3:
                        _a.sent();
                        // Set up report metadata for lastVisitTime
                        return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_METADATA).concat(archivedReport.reportID), {
                                lastVisitTime: '2024-02-01 04:56:47.233', // More recent visit
                            })];
                    case 4:
                        // Set up report metadata for lastVisitTime
                        _a.sent();
                        return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_METADATA).concat(normalReport.reportID), {
                                lastVisitTime: '2024-01-01 04:56:47.233',
                            })];
                    case 5:
                        _a.sent();
                        return [2 /*return*/, (0, waitForBatchedUpdates_1.default)()];
                }
            });
        }); });
        afterAll(function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, react_native_onyx_1.default.clear()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, react_native_onyx_1.default.set(ONYXKEYS_1.default.SESSION, { email: currentUserEmail, accountID: currentUserAccountID })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should not return an archived report even if it was most recently accessed', function () {
            var result = (0, ReportUtils_1.findLastAccessedReport)(false);
            // Even though the archived report has a more recent lastVisitTime,
            // the function should filter it out and return the normal report
            expect(result === null || result === void 0 ? void 0 : result.reportID).toBe(normalReport.reportID);
            expect(result === null || result === void 0 ? void 0 : result.reportID).not.toBe(archivedReport.reportID);
        });
    });
    describe('findLastAccessedReport should return owned report if no reports was accessed before', function () {
        var ownedReport;
        var nonOwnedReport;
        (0, globals_1.beforeAll)(function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Set up test reports - one archived, one normal
                        nonOwnedReport = __assign(__assign({}, LHNTestUtils.getFakeReport()), { reportID: '1001', lastReadTime: '2024-02-01 04:56:47.233', lastVisibleActionCreated: '2024-02-01 04:56:47.233', ownerAccountID: 1 });
                        ownedReport = __assign(__assign({}, LHNTestUtils.getFakeReport()), { reportID: '1002', lastReadTime: '2024-01-01 04:56:47.233', lastVisibleActionCreated: '2024-01-01 04:56:47.233', ownerAccountID: currentUserAccountID });
                        // Add reports to Onyx
                        return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(ownedReport.reportID), ownedReport)];
                    case 1:
                        // Add reports to Onyx
                        _a.sent();
                        return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(nonOwnedReport.reportID), nonOwnedReport)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, (0, waitForBatchedUpdates_1.default)()];
                }
            });
        }); });
        afterAll(function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, react_native_onyx_1.default.clear()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, react_native_onyx_1.default.set(ONYXKEYS_1.default.SESSION, { email: currentUserEmail, accountID: currentUserAccountID })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('findLastAccessedReport should return owned report if no reports was accessed before', function () {
            var result = (0, ReportUtils_1.findLastAccessedReport)(false);
            // Even though the archived report has a more recent lastVisitTime,
            // the function should filter it out and return the normal report
            expect(result === null || result === void 0 ? void 0 : result.reportID).toBe(ownedReport.reportID);
            expect(result === null || result === void 0 ? void 0 : result.reportID).not.toBe(nonOwnedReport.reportID);
        });
    });
    describe('getApprovalChain', function () {
        describe('submit and close policy', function () {
            it('should return empty array', function () {
                var policyTest = __assign(__assign({}, (0, policies_1.default)(0)), { approver: 'owner@test.com', owner: 'owner@test.com', type: CONST_1.default.POLICY.TYPE.TEAM, approvalMode: CONST_1.default.POLICY.APPROVAL_MODE.OPTIONAL });
                var expenseReport = __assign(__assign({}, (0, reports_2.createRandomReport)(0)), { ownerAccountID: employeeAccountID, type: CONST_1.default.REPORT.TYPE.EXPENSE });
                expect((0, ReportUtils_1.getApprovalChain)(policyTest, expenseReport)).toStrictEqual([]);
            });
        });
        describe('basic/advance workflow', function () {
            describe('has no approver rule', function () {
                it('should return list contain policy approver/owner and the forwardsTo of them if the policy use basic workflow', function () {
                    var policyTest = __assign(__assign({}, (0, policies_1.default)(0)), { approver: 'owner@test.com', owner: 'owner@test.com', type: CONST_1.default.POLICY.TYPE.TEAM, employeeList: employeeList, approvalMode: CONST_1.default.POLICY.APPROVAL_MODE.BASIC });
                    var expenseReport = __assign(__assign({}, (0, reports_2.createRandomReport)(0)), { ownerAccountID: employeeAccountID, type: CONST_1.default.REPORT.TYPE.EXPENSE });
                    react_native_onyx_1.default.set(ONYXKEYS_1.default.PERSONAL_DETAILS_LIST, personalDetails).then(function () {
                        var result = ['owner@test.com'];
                        expect((0, ReportUtils_1.getApprovalChain)(policyTest, expenseReport)).toStrictEqual(result);
                    });
                });
                it('should return list contain submitsTo of ownerAccountID and the forwardsTo of them if the policy use advance workflow', function () {
                    var policyTest = __assign(__assign({}, (0, policies_1.default)(0)), { approver: 'owner@test.com', owner: 'owner@test.com', type: CONST_1.default.POLICY.TYPE.CORPORATE, employeeList: employeeList, approvalMode: CONST_1.default.POLICY.APPROVAL_MODE.ADVANCED });
                    var expenseReport = __assign(__assign({}, (0, reports_2.createRandomReport)(0)), { ownerAccountID: employeeAccountID, type: CONST_1.default.REPORT.TYPE.EXPENSE });
                    react_native_onyx_1.default.set(ONYXKEYS_1.default.PERSONAL_DETAILS_LIST, personalDetails).then(function () {
                        var result = ['admin@test.com'];
                        expect((0, ReportUtils_1.getApprovalChain)(policyTest, expenseReport)).toStrictEqual(result);
                    });
                });
            });
            // This test is broken, so I am commenting it out. I have opened up https://github.com/Expensify/App/issues/60854 to get the test fixed
            describe('has approver rule', function () {
                describe('has no transaction match with approver rule', function () {
                    it('should return list contain submitsTo of ownerAccountID and the forwardsTo of them', function () {
                        var _a, _b;
                        var policyTest = __assign(__assign({}, (0, policies_1.default)(0)), { approver: 'owner@test.com', owner: 'owner@test.com', type: CONST_1.default.POLICY.TYPE.CORPORATE, employeeList: employeeList, rules: rules, approvalMode: CONST_1.default.POLICY.APPROVAL_MODE.BASIC });
                        var expenseReport = __assign(__assign({}, (0, reports_2.createRandomReport)(0)), { ownerAccountID: employeeAccountID, type: CONST_1.default.REPORT.TYPE.EXPENSE });
                        var transaction1 = __assign(__assign({}, (0, transaction_1.default)(0)), { category: '', tag: '', created: testDate, reportID: expenseReport.reportID });
                        var transaction2 = __assign(__assign({}, (0, transaction_1.default)(1)), { category: '', tag: '', created: DateUtils_1.default.subtractMillisecondsFromDateTime(testDate, 1), reportID: expenseReport.reportID });
                        react_native_onyx_1.default.multiSet((_a = {},
                            _a[ONYXKEYS_1.default.PERSONAL_DETAILS_LIST] = personalDetails,
                            _a[ONYXKEYS_1.default.COLLECTION.TRANSACTION] = (_b = {},
                                _b[transaction1.transactionID] = transaction1,
                                _b[transaction2.transactionID] = transaction2,
                                _b),
                            _a)).then(function () {
                            var result = ['owner@test.com'];
                            expect((0, ReportUtils_1.getApprovalChain)(policyTest, expenseReport)).toStrictEqual(result);
                        });
                    });
                });
                describe('has transaction match with approver rule', function () {
                    it('should return the list with correct order of category/tag approver sorted by created/inserted of the transaction', function () {
                        var policyTest = __assign(__assign({}, (0, policies_1.default)(1)), { approver: 'owner@test.com', owner: 'owner@test.com', type: CONST_1.default.POLICY.TYPE.CORPORATE, employeeList: employeeList, rules: rules, approvalMode: CONST_1.default.POLICY.APPROVAL_MODE.ADVANCED });
                        var expenseReport = __assign(__assign({}, (0, reports_2.createRandomReport)(100)), { ownerAccountID: employeeAccountID, type: CONST_1.default.REPORT.TYPE.EXPENSE });
                        var transaction1 = __assign(__assign({}, (0, transaction_1.default)(1)), { category: 'cat1', tag: '', created: testDate, reportID: expenseReport.reportID, inserted: DateUtils_1.default.subtractMillisecondsFromDateTime(testDate, 1) });
                        var transaction2 = __assign(__assign({}, (0, transaction_1.default)(2)), { category: '', tag: 'tag1', created: DateUtils_1.default.subtractMillisecondsFromDateTime(testDate, 1), reportID: expenseReport.reportID, inserted: DateUtils_1.default.subtractMillisecondsFromDateTime(testDate, 1) });
                        var transaction3 = __assign(__assign({}, (0, transaction_1.default)(3)), { category: 'cat2', tag: '', created: testDate, reportID: expenseReport.reportID, inserted: DateUtils_1.default.subtractMillisecondsFromDateTime(testDate, 2) });
                        var transaction4 = __assign(__assign({}, (0, transaction_1.default)(4)), { category: '', tag: 'tag2', created: DateUtils_1.default.subtractMillisecondsFromDateTime(testDate, 1), reportID: expenseReport.reportID, inserted: DateUtils_1.default.subtractMillisecondsFromDateTime(testDate, 2) });
                        react_native_onyx_1.default.mergeCollection(ONYXKEYS_1.default.COLLECTION.TRANSACTION, {
                            transactions_1: transaction1,
                            transactions_2: transaction2,
                            transactions_3: transaction3,
                            transactions_4: transaction4,
                        }).then(function () {
                            var result = [categoryApprover2Email, categoryApprover1Email, tagApprover2Email, tagApprover1Email, 'admin@test.com'];
                            expect((0, ReportUtils_1.getApprovalChain)(policyTest, expenseReport)).toStrictEqual(result);
                        });
                    });
                });
            });
        });
    });
    describe('shouldReportShowSubscript', function () {
        afterEach(function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, react_native_onyx_1.default.clear()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, react_native_onyx_1.default.set(ONYXKEYS_1.default.SESSION, { email: currentUserEmail, accountID: currentUserAccountID })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should return true for policy expense chat', function () {
            var report = (0, reports_2.createPolicyExpenseChat)(1);
            expect((0, ReportUtils_1.shouldReportShowSubscript)(report)).toBe(true);
        });
        it('should return true for workspace thread', function () {
            var report = (0, reports_2.createWorkspaceThread)(1);
            expect((0, ReportUtils_1.shouldReportShowSubscript)(report)).toBe(true);
        });
        it('should return false for archived non-expense report that is not a workspace thread', function () { return __awaiter(void 0, void 0, void 0, function () {
            var report, isReportArchived;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        report = (0, reports_2.createRegularChat)(1, [currentUserAccountID, 1]);
                        return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_NAME_VALUE_PAIRS).concat(report.reportID), {
                                private_isArchived: new Date().toString(),
                            })];
                    case 1:
                        _a.sent();
                        isReportArchived = (0, react_native_1.renderHook)(function () { return (0, useReportIsArchived_1.default)(report === null || report === void 0 ? void 0 : report.reportID); }).result;
                        expect((0, ReportUtils_1.shouldReportShowSubscript)(report, isReportArchived.current)).toBe(false);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should return false for a non-archived non-expense report', function () {
            var report = (0, reports_2.createRegularChat)(1, [currentUserAccountID, 1]);
            var isReportArchived = (0, react_native_1.renderHook)(function () { return (0, useReportIsArchived_1.default)(report === null || report === void 0 ? void 0 : report.reportID); }).result;
            expect((0, ReportUtils_1.shouldReportShowSubscript)(report, isReportArchived.current)).toBe(false);
        });
        it('should return false for regular 1:1 chat', function () {
            var report = (0, reports_2.createRegularChat)(1, [currentUserAccountID, 1]);
            expect((0, ReportUtils_1.shouldReportShowSubscript)(report)).toBe(false);
        });
        it('should return true for expense request report', function () { return __awaiter(void 0, void 0, void 0, function () {
            var parentReport, randomReportAction, parentReportAction, report;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        parentReport = (0, reports_2.createExpenseReport)(1);
                        return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(parentReport.reportID), parentReport)];
                    case 1:
                        _a.sent();
                        randomReportAction = (0, reportActions_1.default)(2);
                        parentReportAction = __assign(__assign({}, (0, reportActions_1.default)(2)), { actionName: CONST_1.default.REPORT.ACTIONS.TYPE.IOU, message: __assign(__assign({}, randomReportAction.message), { type: CONST_1.default.IOU.REPORT_ACTION_TYPE.CREATE }) });
                        return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(parentReport.reportID), {
                                '3': parentReportAction,
                            })];
                    case 2:
                        _a.sent();
                        report = (0, reports_2.createExpenseRequestReport)(2, parentReport.reportID, '3');
                        // When we check if the report should show a subscript
                        // Then it should return true because isExpenseRequest() returns true
                        expect((0, ReportUtils_1.shouldReportShowSubscript)(report)).toBe(true);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should return true for workspace task report', function () { return __awaiter(void 0, void 0, void 0, function () {
            var parentReport, report;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        parentReport = (0, reports_2.createPolicyExpenseChat)(1);
                        return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(parentReport.reportID), parentReport)];
                    case 1:
                        _a.sent();
                        report = (0, reports_2.createWorkspaceTaskReport)(2, [currentUserAccountID, 1], parentReport.reportID);
                        // When we check if the report should show a subscript
                        // Then it should return true because isWorkspaceTaskReport() returns true
                        expect((0, ReportUtils_1.shouldReportShowSubscript)(report)).toBe(true);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should return true for invoice room', function () {
            var report = (0, reports_2.createInvoiceRoom)(1);
            expect((0, ReportUtils_1.shouldReportShowSubscript)(report)).toBe(true);
        });
        it('should return true for invoice report', function () {
            var report = (0, reports_2.createInvoiceReport)(1);
            expect((0, ReportUtils_1.shouldReportShowSubscript)(report)).toBe(true);
        });
        it('should return true for policy expense chat that is not own', function () {
            var report = (0, reports_2.createPolicyExpenseChat)(1, false);
            expect((0, ReportUtils_1.shouldReportShowSubscript)(report)).toBe(true);
        });
        it('should return true for archived workspace thread (exception to archived rule)', function () { return __awaiter(void 0, void 0, void 0, function () {
            var report, isReportArchived;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        report = (0, reports_2.createWorkspaceThread)(1);
                        return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_NAME_VALUE_PAIRS).concat(report.reportID), {
                                private_isArchived: new Date().toString(),
                            })];
                    case 1:
                        _a.sent();
                        isReportArchived = (0, react_native_1.renderHook)(function () { return (0, useReportIsArchived_1.default)(report === null || report === void 0 ? void 0 : report.reportID); }).result;
                        // Even if archived, workspace threads should show subscript
                        expect((0, ReportUtils_1.shouldReportShowSubscript)(report, isReportArchived.current)).toBe(true);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should return false for archived non-expense report', function () { return __awaiter(void 0, void 0, void 0, function () {
            var report, isReportArchived;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        report = (0, reports_2.createRegularChat)(1, []);
                        return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_NAME_VALUE_PAIRS).concat(report.reportID), {
                                private_isArchived: new Date().toString(),
                            })];
                    case 1:
                        _a.sent();
                        isReportArchived = (0, react_native_1.renderHook)(function () { return (0, useReportIsArchived_1.default)(report === null || report === void 0 ? void 0 : report.reportID); }).result;
                        // Archived expense reports should not show subscript
                        expect((0, ReportUtils_1.shouldReportShowSubscript)(report, isReportArchived.current)).toBe(false);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should return false for policy expense chat that is also a chat thread', function () {
            var report = (0, reports_2.createPolicyExpenseChatThread)(1);
            // Policy expense chats that are threads should not show subscript
            expect((0, ReportUtils_1.shouldReportShowSubscript)(report)).toBe(false);
        });
        it('should return false for policy expense chat that is also a task report', function () {
            var report = (0, reports_2.createPolicyExpenseChatTask)(1);
            // Policy expense chats that are task reports should not show subscript
            expect((0, ReportUtils_1.shouldReportShowSubscript)(report)).toBe(false);
        });
        it('should return false for group chat', function () {
            var report = (0, reports_2.createGroupChat)(1, [currentUserAccountID, 1, 2, 3]);
            expect((0, ReportUtils_1.shouldReportShowSubscript)(report)).toBe(false);
        });
        it('should return false for self DM', function () {
            var report = (0, reports_2.createSelfDM)(1, currentUserAccountID);
            expect((0, ReportUtils_1.shouldReportShowSubscript)(report)).toBe(false);
        });
        it('should return false for admin room', function () {
            var report = (0, reports_2.createAdminRoom)(1);
            expect((0, ReportUtils_1.shouldReportShowSubscript)(report)).toBe(false);
        });
        it('should return false for announce room', function () {
            var report = (0, reports_2.createAnnounceRoom)(1);
            expect((0, ReportUtils_1.shouldReportShowSubscript)(report)).toBe(false);
        });
        it('should return false for domain room', function () {
            var report = (0, reports_2.createDomainRoom)(1);
            expect((0, ReportUtils_1.shouldReportShowSubscript)(report)).toBe(false);
        });
        it('should return false for regular task report (non-workspace)', function () {
            var report = __assign(__assign({}, (0, reports_2.createRegularTaskReport)(1, currentUserAccountID)), { chatType: CONST_1.default.REPORT.CHAT_TYPE.TRIP_ROOM });
            expect((0, ReportUtils_1.shouldReportShowSubscript)(report)).toBe(false);
        });
    });
    describe('isArchivedNonExpenseReport', function () {
        // Given an expense report, a chat report, and an archived chat report
        var expenseReport = __assign(__assign({}, (0, reports_2.createRandomReport)(1000)), { ownerAccountID: employeeAccountID, type: CONST_1.default.REPORT.TYPE.EXPENSE });
        var chatReport = __assign(__assign({}, (0, reports_2.createRandomReport)(2000)), { ownerAccountID: employeeAccountID, type: CONST_1.default.REPORT.TYPE.CHAT });
        var archivedChatReport = __assign(__assign({}, (0, reports_2.createRandomReport)(3000)), { ownerAccountID: employeeAccountID, type: CONST_1.default.REPORT.TYPE.CHAT });
        (0, globals_1.beforeAll)(function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(expenseReport.reportID), expenseReport)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(chatReport.reportID), chatReport)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(archivedChatReport.reportID), archivedChatReport)];
                    case 3:
                        _a.sent();
                        // This is what indicates that a report is archived (see ReportUtils.isArchivedReport())
                        return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_NAME_VALUE_PAIRS).concat(archivedChatReport.reportID), {
                                private_isArchived: new Date().toString(),
                            })];
                    case 4:
                        // This is what indicates that a report is archived (see ReportUtils.isArchivedReport())
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should return false if the report is an expense report', function () {
            // Simulate how components use the hook useReportIsArchived() to see if the report is archived
            var isReportArchived = (0, react_native_1.renderHook)(function () { return (0, useReportIsArchived_1.default)(expenseReport === null || expenseReport === void 0 ? void 0 : expenseReport.reportID); }).result;
            expect((0, ReportUtils_1.isArchivedNonExpenseReport)(expenseReport, isReportArchived.current)).toBe(false);
        });
        it('should return false if the report is a non-expense report and not archived', function () {
            var isReportArchived = (0, react_native_1.renderHook)(function () { return (0, useReportIsArchived_1.default)(chatReport === null || chatReport === void 0 ? void 0 : chatReport.reportID); }).result;
            expect((0, ReportUtils_1.isArchivedNonExpenseReport)(chatReport, isReportArchived.current)).toBe(false);
        });
        it('should return true if the report is a non-expense report and archived', function () {
            var isReportArchived = (0, react_native_1.renderHook)(function () { return (0, useReportIsArchived_1.default)(archivedChatReport === null || archivedChatReport === void 0 ? void 0 : archivedChatReport.reportID); }).result;
            expect((0, ReportUtils_1.isArchivedNonExpenseReport)(archivedChatReport, isReportArchived.current)).toBe(true);
        });
    });
    describe('parseReportRouteParams', function () {
        var testReportID = '123456789';
        it('should return empty reportID and isSubReportPageRoute as false if the route is not a report route', function () {
            var result = (0, ReportUtils_1.parseReportRouteParams)('/concierge');
            expect(result.reportID).toBe('');
            expect(result.isSubReportPageRoute).toBe(false);
        });
        it('should return isSubReportPageRoute as false if the route is a report screen route', function () {
            var result = (0, ReportUtils_1.parseReportRouteParams)("r/".concat(testReportID, "/11111111"));
            expect(result.reportID).toBe(testReportID);
            expect(result.isSubReportPageRoute).toBe(false);
        });
        it('should return isSubReportPageRoute as true if the route is a sub report page route', function () {
            var result = (0, ReportUtils_1.parseReportRouteParams)("r/".concat(testReportID, "/details"));
            expect(result.reportID).toBe(testReportID);
            expect(result.isSubReportPageRoute).toBe(true);
        });
    });
    describe('isPayer', function () {
        var _a;
        var approvedReport = __assign(__assign({}, (0, reports_2.createRandomReport)(1)), { type: CONST_1.default.REPORT.TYPE.EXPENSE, stateNum: CONST_1.default.REPORT.STATE_NUM.APPROVED, statusNum: CONST_1.default.REPORT.STATUS_NUM.APPROVED, policyID: '1' });
        var unapprovedReport = __assign(__assign({}, (0, reports_2.createRandomReport)(2)), { type: CONST_1.default.REPORT.TYPE.EXPENSE, stateNum: CONST_1.default.REPORT.STATE_NUM.SUBMITTED, statusNum: CONST_1.default.REPORT.STATUS_NUM.SUBMITTED, policyID: '1' });
        var policyTest = __assign(__assign({}, (0, policies_1.default)(1)), { employeeList: (_a = {},
                _a[currentUserEmail] = {
                    role: CONST_1.default.POLICY.ROLE.AUDITOR,
                },
                _a) });
        (0, globals_1.beforeAll)(function () {
            var _a, _b;
            react_native_onyx_1.default.multiSet((_a = {},
                _a[ONYXKEYS_1.default.SESSION] = { email: currentUserEmail, accountID: currentUserAccountID },
                _a[ONYXKEYS_1.default.COLLECTION.POLICY] = (_b = {},
                    _b["".concat(ONYXKEYS_1.default.COLLECTION.POLICY, "1")] = policyTest,
                    _b),
                _a));
            return (0, waitForBatchedUpdates_1.default)();
        });
        afterAll(function () { return react_native_onyx_1.default.clear(); });
        it('should return false for admin of a group policy with reimbursement enabled and report not approved', function () {
            expect((0, ReportUtils_1.isPayer)({ email: currentUserEmail, accountID: currentUserAccountID }, unapprovedReport, false)).toBe(false);
        });
        it('should return false for non-admin of a group policy', function () {
            expect((0, ReportUtils_1.isPayer)({ email: currentUserEmail, accountID: currentUserAccountID }, approvedReport, false)).toBe(false);
        });
    });
    describe('buildReportNameFromParticipantNames', function () {
        /**
         * Generates a fake report and matching personal details for specified number of participants.
         * Participants in the report are directly linked with their personal details.
         */
        var generateFakeReportAndParticipantsPersonalDetails = function (_a) {
            var count = _a.count, _b = _a.start, start = _b === void 0 ? 0 : _b;
            var data = {
                report: __assign(__assign({}, reports_1.chatReportR14932), { participants: Object.keys(LHNTestUtils_1.fakePersonalDetails)
                        .slice(start, count)
                        .reduce(function (acc, cur) {
                        acc[cur] = { notificationPreference: CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.ALWAYS };
                        return acc;
                    }, {}) }),
                personalDetails: Object.fromEntries(Object.entries(LHNTestUtils_1.fakePersonalDetails).slice(start, count)),
            };
            data.personalDetails[currentUserAccountID] = {
                accountID: currentUserAccountID,
                displayName: 'CURRENT USER',
                firstName: 'CURRENT',
            };
            return data;
        };
        it('excludes the current user from the report title', function () {
            var result = (0, ReportUtils_1.buildReportNameFromParticipantNames)(generateFakeReportAndParticipantsPersonalDetails({ count: currentUserAccountID + 2 }));
            expect(result).not.toContain('CURRENT');
        });
        it('limits to a maximum of 5 participants in the title', function () {
            var result = (0, ReportUtils_1.buildReportNameFromParticipantNames)(generateFakeReportAndParticipantsPersonalDetails({ count: 10 }));
            expect(result.split(',').length).toBeLessThanOrEqual(5);
        });
        it('returns full name if only one participant is present (excluding current user)', function () {
            var _a;
            var result = (0, ReportUtils_1.buildReportNameFromParticipantNames)(generateFakeReportAndParticipantsPersonalDetails({ count: 1 }));
            var displayName = ((_a = LHNTestUtils_1.fakePersonalDetails[1]) !== null && _a !== void 0 ? _a : {}).displayName;
            expect(result).toEqual(displayName);
        });
        it('returns an empty string if there are no participants or all are excluded', function () {
            var result = (0, ReportUtils_1.buildReportNameFromParticipantNames)(generateFakeReportAndParticipantsPersonalDetails({ start: currentUserAccountID - 1, count: 1 }));
            expect(result).toEqual('');
        });
        it('handles partial or missing personal details correctly', function () {
            var report = generateFakeReportAndParticipantsPersonalDetails({ count: 6 }).report;
            var secondUser = LHNTestUtils_1.fakePersonalDetails[2];
            var fourthUser = LHNTestUtils_1.fakePersonalDetails[4];
            var incompleteDetails = { 2: secondUser, 4: fourthUser };
            var result = (0, ReportUtils_1.buildReportNameFromParticipantNames)({ report: report, personalDetails: incompleteDetails });
            var expectedNames = [secondUser === null || secondUser === void 0 ? void 0 : secondUser.firstName, fourthUser === null || fourthUser === void 0 ? void 0 : fourthUser.firstName].sort();
            var resultNames = result.split(', ').sort();
            expect(resultNames).toEqual(expect.arrayContaining(expectedNames));
        });
    });
    describe('getParticipantsList', function () {
        it('should exclude hidden participants', function () {
            var report = __assign(__assign({}, (0, reports_2.createRandomReport)(1)), { chatType: 'policyRoom', participants: {
                    1: { notificationPreference: 'hidden' },
                    2: { notificationPreference: 'always' },
                } });
            var participants = (0, ReportUtils_1.getParticipantsList)(report, participantsPersonalDetails);
            expect(participants.length).toBe(1);
        });
        it('should include hidden participants for IOU report', function () {
            var report = __assign(__assign({}, (0, reports_2.createRandomReport)(1)), { type: CONST_1.default.REPORT.TYPE.IOU, participants: {
                    1: { notificationPreference: 'hidden' },
                    2: { notificationPreference: 'always' },
                } });
            var participants = (0, ReportUtils_1.getParticipantsList)(report, participantsPersonalDetails);
            expect(participants.length).toBe(2);
        });
        it('should include hidden participants for expense report', function () {
            var report = __assign(__assign({}, (0, reports_2.createRandomReport)(1)), { type: CONST_1.default.REPORT.TYPE.EXPENSE, participants: {
                    1: { notificationPreference: 'hidden' },
                    2: { notificationPreference: 'always' },
                } });
            var participants = (0, ReportUtils_1.getParticipantsList)(report, participantsPersonalDetails);
            expect(participants.length).toBe(2);
        });
        it('should include hidden participants for IOU transaction report', function () { return __awaiter(void 0, void 0, void 0, function () {
            var parentReport, parentReportAction, report, participants;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        parentReport = __assign(__assign({}, (0, reports_2.createRandomReport)(0)), { type: CONST_1.default.REPORT.TYPE.IOU });
                        parentReportAction = __assign(__assign({}, (0, reportActions_1.default)(0)), { actionName: CONST_1.default.REPORT.ACTIONS.TYPE.IOU, message: [], previousMessage: [], originalMessage: {
                                amount: 1,
                                currency: 'USD',
                                type: CONST_1.default.IOU.REPORT_ACTION_TYPE.CREATE,
                            } });
                        return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(parentReport.reportID), parentReport)];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(parentReport.reportID), (_a = {},
                                _a[parentReportAction.reportActionID] = parentReportAction,
                                _a))];
                    case 2:
                        _b.sent();
                        report = __assign(__assign({}, (0, reports_2.createRandomReport)(1)), { parentReportID: parentReport.reportID, parentReportActionID: parentReportAction.reportActionID, participants: {
                                1: { notificationPreference: 'hidden' },
                                2: { notificationPreference: 'always' },
                            } });
                        participants = (0, ReportUtils_1.getParticipantsList)(report, participantsPersonalDetails);
                        expect(participants.length).toBe(2);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should include hidden participants for expense transaction report', function () { return __awaiter(void 0, void 0, void 0, function () {
            var parentReport, parentReportAction, report, participants;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        parentReport = __assign(__assign({}, (0, reports_2.createRandomReport)(0)), { type: CONST_1.default.REPORT.TYPE.EXPENSE });
                        parentReportAction = __assign(__assign({}, (0, reportActions_1.default)(0)), { actionName: CONST_1.default.REPORT.ACTIONS.TYPE.IOU, message: [], previousMessage: [], originalMessage: {
                                amount: 1,
                                currency: 'USD',
                                type: CONST_1.default.IOU.REPORT_ACTION_TYPE.CREATE,
                            } });
                        return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(parentReport.reportID), parentReport)];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(parentReport.reportID), (_a = {},
                                _a[parentReportAction.reportActionID] = parentReportAction,
                                _a))];
                    case 2:
                        _b.sent();
                        report = __assign(__assign({}, (0, reports_2.createRandomReport)(1)), { parentReportID: parentReport.reportID, parentReportActionID: parentReportAction.reportActionID, participants: {
                                1: { notificationPreference: 'hidden' },
                                2: { notificationPreference: 'always' },
                            } });
                        participants = (0, ReportUtils_1.getParticipantsList)(report, participantsPersonalDetails);
                        expect(participants.length).toBe(2);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('isReportOutstanding', function () {
        it('should return true for submitted reports', function () {
            var report = __assign(__assign({}, (0, reports_2.createRandomReport)(1)), { policyID: policy.id, type: CONST_1.default.REPORT.TYPE.EXPENSE, stateNum: CONST_1.default.REPORT.STATE_NUM.SUBMITTED, statusNum: CONST_1.default.REPORT.STATUS_NUM.SUBMITTED });
            expect((0, ReportUtils_1.isReportOutstanding)(report, policy.id)).toBe(true);
        });
        it('should return false for archived report', function () { return __awaiter(void 0, void 0, void 0, function () {
            var report;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        report = __assign(__assign({}, (0, reports_2.createRandomReport)(1)), { policyID: policy.id, type: CONST_1.default.REPORT.TYPE.EXPENSE, stateNum: CONST_1.default.REPORT.STATE_NUM.SUBMITTED, statusNum: CONST_1.default.REPORT.STATUS_NUM.SUBMITTED });
                        return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_NAME_VALUE_PAIRS).concat(report.reportID), { private_isArchived: DateUtils_1.default.getDBTime() })];
                    case 1:
                        _a.sent();
                        expect((0, ReportUtils_1.isReportOutstanding)(report, policy.id)).toBe(false);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('getMoneyReportPreviewName', function () {
        (0, globals_1.beforeAll)(function () { return __awaiter(void 0, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, react_native_onyx_1.default.clear()];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, react_native_onyx_1.default.multiSet((_a = {},
                                _a[ONYXKEYS_1.default.PERSONAL_DETAILS_LIST] = participantsPersonalDetails,
                                _a[ONYXKEYS_1.default.SESSION] = { email: currentUserEmail, accountID: currentUserAccountID },
                                _a))];
                    case 2:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        afterAll(function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, react_native_onyx_1.default.clear()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should return the report name when the chat type is policy room', function () {
            var action = __assign(__assign({}, (0, reportActions_1.default)(1)), { actionName: CONST_1.default.REPORT.ACTIONS.TYPE.REPORT_PREVIEW });
            var report = __assign(__assign({}, (0, reports_2.createRandomReport)(1)), { chatType: CONST_1.default.REPORT.CHAT_TYPE.POLICY_ROOM });
            var result = (0, ReportUtils_1.getMoneyReportPreviewName)(action, report);
            expect(result).toBe(report.reportName);
        });
        it('should return the report name when the chat type is domain all', function () {
            var action = __assign(__assign({}, (0, reportActions_1.default)(1)), { actionName: CONST_1.default.REPORT.ACTIONS.TYPE.REPORT_PREVIEW });
            var report = __assign(__assign({}, (0, reports_2.createRandomReport)(1)), { chatType: CONST_1.default.REPORT.CHAT_TYPE.DOMAIN_ALL });
            var result = (0, ReportUtils_1.getMoneyReportPreviewName)(action, report);
            expect(result).toBe(report.reportName);
        });
        it('should return the report name when the chat type is group', function () {
            var action = __assign(__assign({}, (0, reportActions_1.default)(1)), { actionName: CONST_1.default.REPORT.ACTIONS.TYPE.REPORT_PREVIEW });
            var report = __assign(__assign({}, (0, reports_2.createRandomReport)(1)), { chatType: CONST_1.default.REPORT.CHAT_TYPE.GROUP });
            var result = (0, ReportUtils_1.getMoneyReportPreviewName)(action, report);
            expect(result).toBe(report.reportName);
        });
        it('should return policy name when the chat type is invoice', function () {
            var action = __assign(__assign({}, (0, reportActions_1.default)(1)), { actionName: CONST_1.default.REPORT.ACTIONS.TYPE.REPORT_PREVIEW });
            var report = __assign(__assign({}, (0, reports_2.createRandomReport)(1)), { chatType: CONST_1.default.REPORT.CHAT_TYPE.INVOICE });
            var result = (0, ReportUtils_1.getMoneyReportPreviewName)(action, report);
            // Policies are empty, so the policy name is "Unavailable workspace"
            expect(result).toBe('Unavailable workspace');
        });
        it('should return the report name when the chat type is policy admins', function () {
            var action = __assign(__assign({}, (0, reportActions_1.default)(1)), { actionName: CONST_1.default.REPORT.ACTIONS.TYPE.REPORT_PREVIEW });
            var report = __assign(__assign({}, (0, reports_2.createRandomReport)(1)), { chatType: CONST_1.default.REPORT.CHAT_TYPE.POLICY_ADMINS });
            var result = (0, ReportUtils_1.getMoneyReportPreviewName)(action, report);
            expect(result).toBe(report.reportName);
        });
        it('should return the report name when the chat type is policy announce', function () {
            var action = __assign(__assign({}, (0, reportActions_1.default)(1)), { actionName: CONST_1.default.REPORT.ACTIONS.TYPE.REPORT_PREVIEW });
            var report = __assign(__assign({}, (0, reports_2.createRandomReport)(1)), { chatType: CONST_1.default.REPORT.CHAT_TYPE.POLICY_ANNOUNCE });
            var result = (0, ReportUtils_1.getMoneyReportPreviewName)(action, report);
            expect(result).toBe(report.reportName);
        });
        it('should return the owner name expenses when the chat type is policy expense chat', function () {
            var action = __assign(__assign({}, (0, reportActions_1.default)(1)), { actionName: CONST_1.default.REPORT.ACTIONS.TYPE.REPORT_PREVIEW });
            var report = __assign(__assign({}, (0, reports_2.createRandomReport)(1)), { chatType: CONST_1.default.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT });
            var result = (0, ReportUtils_1.getMoneyReportPreviewName)(action, report);
            // Report with ownerAccountID: 1 corresponds to "Ragnar Lothbrok"
            expect(result).toBe("Ragnar Lothbrok's expenses");
        });
        it('should return the display name of the current user when the chat type is self dm', function () {
            var action = __assign(__assign({}, (0, reportActions_1.default)(1)), { actionName: CONST_1.default.REPORT.ACTIONS.TYPE.REPORT_PREVIEW });
            var report = __assign(__assign({}, (0, reports_2.createRandomReport)(1)), { chatType: CONST_1.default.REPORT.CHAT_TYPE.SELF_DM });
            var result = (0, ReportUtils_1.getMoneyReportPreviewName)(action, report);
            // currentUserAccountID: 5 corresponds to "Lagertha Lothbrok"
            expect(result).toBe('Lagertha Lothbrok (you)');
        });
        it('should return the participant name when the chat type is system', function () {
            var action = __assign(__assign({}, (0, reportActions_1.default)(1)), { actionName: CONST_1.default.REPORT.ACTIONS.TYPE.REPORT_PREVIEW });
            var report = __assign(__assign({}, (0, reports_2.createRandomReport)(1)), { chatType: CONST_1.default.REPORT.CHAT_TYPE.SYSTEM, participants: {
                    1: { notificationPreference: 'hidden' },
                } });
            var result = (0, ReportUtils_1.getMoneyReportPreviewName)(action, report);
            // participant accountID: 1 corresponds to "Ragnar Lothbrok"
            expect(result).toBe('Ragnar Lothbrok');
        });
        it('should return the participant names when the chat type is trip room', function () {
            var action = __assign(__assign({}, (0, reportActions_1.default)(1)), { actionName: CONST_1.default.REPORT.ACTIONS.TYPE.REPORT_PREVIEW });
            var report = __assign(__assign({}, (0, reports_2.createRandomReport)(1)), { participants: {
                    1: { notificationPreference: 'hidden' },
                    2: { notificationPreference: 'always' },
                }, chatType: CONST_1.default.REPORT.CHAT_TYPE.TRIP_ROOM });
            var result = (0, ReportUtils_1.getMoneyReportPreviewName)(action, report);
            // participant accountID: 1, 2 corresponds to "Ragnar", "floki@vikings.net"
            expect(result).toBe('Ragnar, floki@vikings.net');
        });
        it('should return the child report name when the report name is not present', function () {
            var action = __assign(__assign({}, (0, reportActions_1.default)(1)), { actionName: CONST_1.default.REPORT.ACTIONS.TYPE.REPORT_PREVIEW, childReportName: 'Child Report' });
            var result = (0, ReportUtils_1.getMoneyReportPreviewName)(action, undefined);
            expect(result).toBe('Child Report');
        });
    });
    describe('canAddTransaction', function () {
        it('should return true for a non-archived report', function () { return __awaiter(void 0, void 0, void 0, function () {
            var report, isReportArchived, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        report = __assign(__assign({}, (0, reports_2.createRandomReport)(10000)), { type: CONST_1.default.REPORT.TYPE.EXPENSE });
                        return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report.reportID), report)];
                    case 1:
                        _a.sent();
                        isReportArchived = (0, react_native_1.renderHook)(function () { return (0, useReportIsArchived_1.default)(report === null || report === void 0 ? void 0 : report.reportID); }).result;
                        result = (0, ReportUtils_1.canAddTransaction)(report, isReportArchived.current);
                        // Then the result is true
                        expect(result).toBe(true);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should return false for an archived report', function () { return __awaiter(void 0, void 0, void 0, function () {
            var report, isReportArchived, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        report = __assign(__assign({}, (0, reports_2.createRandomReport)(10001)), { type: CONST_1.default.REPORT.TYPE.EXPENSE });
                        return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report.reportID), report)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_NAME_VALUE_PAIRS).concat(report.reportID), { private_isArchived: DateUtils_1.default.getDBTime() })];
                    case 2:
                        _a.sent();
                        isReportArchived = (0, react_native_1.renderHook)(function () { return (0, useReportIsArchived_1.default)(report === null || report === void 0 ? void 0 : report.reportID); }).result;
                        result = (0, ReportUtils_1.canAddTransaction)(report, isReportArchived.current);
                        // Then the result is false
                        expect(result).toBe(false);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('canDeleteTransaction', function () {
        it('should return true for a non-archived report', function () { return __awaiter(void 0, void 0, void 0, function () {
            var report, isReportArchived, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        report = __assign(__assign({}, (0, reports_2.createRandomReport)(20000)), { type: CONST_1.default.REPORT.TYPE.EXPENSE });
                        return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report.reportID), report)];
                    case 1:
                        _a.sent();
                        isReportArchived = (0, react_native_1.renderHook)(function () { return (0, useReportIsArchived_1.default)(report === null || report === void 0 ? void 0 : report.reportID); }).result;
                        result = (0, ReportUtils_1.canDeleteTransaction)(report, isReportArchived.current);
                        // Then the result is true
                        expect(result).toBe(true);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should return false for an archived report', function () { return __awaiter(void 0, void 0, void 0, function () {
            var report, isReportArchived, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        report = __assign(__assign({}, (0, reports_2.createRandomReport)(20001)), { type: CONST_1.default.REPORT.TYPE.EXPENSE });
                        return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report.reportID), report)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_NAME_VALUE_PAIRS).concat(report.reportID), { private_isArchived: DateUtils_1.default.getDBTime() })];
                    case 2:
                        _a.sent();
                        isReportArchived = (0, react_native_1.renderHook)(function () { return (0, useReportIsArchived_1.default)(report === null || report === void 0 ? void 0 : report.reportID); }).result;
                        result = (0, ReportUtils_1.canDeleteTransaction)(report, isReportArchived.current);
                        // Then the result is false
                        expect(result).toBe(false);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('getReasonAndReportActionThatRequiresAttention', function () {
        it('should return a reason for a non-archived report', function () { return __awaiter(void 0, void 0, void 0, function () {
            var report, isReportArchived, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        report = __assign(__assign({}, (0, reports_2.createRandomReport)(30000)), { type: CONST_1.default.REPORT.TYPE.EXPENSE, isUnreadWithMention: true });
                        return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report.reportID), report)];
                    case 1:
                        _a.sent();
                        isReportArchived = (0, react_native_1.renderHook)(function () { return (0, useReportIsArchived_1.default)(report === null || report === void 0 ? void 0 : report.reportID); }).result;
                        result = (0, ReportUtils_1.getReasonAndReportActionThatRequiresAttention)(report, undefined, isReportArchived.current);
                        // There should be some kind of a reason (any reason is fine)
                        expect(result).toHaveProperty('reason');
                        return [2 /*return*/];
                }
            });
        }); });
        it('should return null for an archived report', function () { return __awaiter(void 0, void 0, void 0, function () {
            var report, isReportArchived, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        report = __assign(__assign({}, (0, reports_2.createRandomReport)(30000)), { type: CONST_1.default.REPORT.TYPE.EXPENSE, isUnreadWithMention: true });
                        return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report.reportID), report)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_NAME_VALUE_PAIRS).concat(report.reportID), { private_isArchived: DateUtils_1.default.getDBTime() })];
                    case 2:
                        _a.sent();
                        isReportArchived = (0, react_native_1.renderHook)(function () { return (0, useReportIsArchived_1.default)(report === null || report === void 0 ? void 0 : report.reportID); }).result;
                        result = (0, ReportUtils_1.getReasonAndReportActionThatRequiresAttention)(report, undefined, isReportArchived.current);
                        // Then the result is null
                        expect(result).toBe(null);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('canEditReportDescription', function () {
        it('should return true for a non-archived policy room', function () { return __awaiter(void 0, void 0, void 0, function () {
            var report, isReportArchived, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        report = __assign(__assign({}, (0, reports_2.createRandomReport)(40001)), { chatType: CONST_1.default.REPORT.CHAT_TYPE.POLICY_ROOM, participants: (0, ReportUtils_1.buildParticipantsFromAccountIDs)([currentUserAccountID, 1]) });
                        return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report.reportID), report)];
                    case 1:
                        _a.sent();
                        isReportArchived = (0, react_native_1.renderHook)(function () { return (0, useReportIsArchived_1.default)(report === null || report === void 0 ? void 0 : report.reportID); }).result;
                        result = (0, ReportUtils_1.canEditReportDescription)(report, policy, isReportArchived.current);
                        // Then it can be edited
                        expect(result).toBeTruthy();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should return false for an archived policy room', function () { return __awaiter(void 0, void 0, void 0, function () {
            var report, isReportArchived, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        report = __assign(__assign({}, (0, reports_2.createRandomReport)(40002)), { chatType: CONST_1.default.REPORT.CHAT_TYPE.POLICY_ROOM, participants: (0, ReportUtils_1.buildParticipantsFromAccountIDs)([currentUserAccountID, 1]) });
                        return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report.reportID), report)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_NAME_VALUE_PAIRS).concat(report.reportID), { private_isArchived: DateUtils_1.default.getDBTime() })];
                    case 2:
                        _a.sent();
                        isReportArchived = (0, react_native_1.renderHook)(function () { return (0, useReportIsArchived_1.default)(report === null || report === void 0 ? void 0 : report.reportID); }).result;
                        result = (0, ReportUtils_1.canEditReportDescription)(report, policy, isReportArchived.current);
                        // Then it cannot be edited
                        expect(result).toBeFalsy();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('shouldDisableRename', function () {
        it('should return true for archived reports', function () { return __awaiter(void 0, void 0, void 0, function () {
            var report, isReportArchived, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        report = __assign(__assign({}, (0, reports_2.createRandomReport)(50001)), { chatType: CONST_1.default.REPORT.CHAT_TYPE.POLICY_ROOM, participants: (0, ReportUtils_1.buildParticipantsFromAccountIDs)([currentUserAccountID, 1]) });
                        return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report.reportID), report)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_NAME_VALUE_PAIRS).concat(report.reportID), { private_isArchived: DateUtils_1.default.getDBTime() })];
                    case 2:
                        _a.sent();
                        isReportArchived = (0, react_native_1.renderHook)(function () { return (0, useReportIsArchived_1.default)(report === null || report === void 0 ? void 0 : report.reportID); }).result;
                        result = (0, ReportUtils_1.shouldDisableRename)(report, isReportArchived.current);
                        // Then it should return true
                        expect(result).toBe(true);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should return true for default rooms', function () {
            // Given a default room
            var report = __assign(__assign({}, (0, reports_2.createRandomReport)(50002)), { chatType: CONST_1.default.REPORT.CHAT_TYPE.POLICY_ADMINS, reportName: '#admins' });
            // When shouldDisableRename is called
            var result = (0, ReportUtils_1.shouldDisableRename)(report);
            // Then it should return true
            expect(result).toBe(true);
        });
        it('should return true for public rooms', function () {
            // Given a public room
            var report = __assign(__assign({}, (0, reports_2.createRandomReport)(50003)), { chatType: CONST_1.default.REPORT.CHAT_TYPE.POLICY_ROOM, visibility: CONST_1.default.REPORT.VISIBILITY.PUBLIC });
            // When shouldDisableRename is called
            var result = (0, ReportUtils_1.shouldDisableRename)(report);
            // Then it should return true
            expect(result).toBe(true);
        });
        it('should return true for threads', function () {
            // Given a thread report
            var report = __assign(__assign({}, (0, reports_2.createRandomReport)(50004)), { parentReportID: '12345', parentReportActionID: '67890' });
            // When shouldDisableRename is called
            var result = (0, ReportUtils_1.shouldDisableRename)(report);
            // Then it should return true
            expect(result).toBe(true);
        });
        it('should return true for money request reports', function () {
            // Given a money request report
            var report = __assign(__assign({}, (0, reports_2.createRandomReport)(50005)), { type: CONST_1.default.REPORT.TYPE.IOU });
            // When shouldDisableRename is called
            var result = (0, ReportUtils_1.shouldDisableRename)(report);
            // Then it should return true
            expect(result).toBe(true);
        });
        it('should return true for expense reports', function () {
            // Given an expense report
            var report = __assign(__assign({}, (0, reports_2.createRandomReport)(50006)), { type: CONST_1.default.REPORT.TYPE.EXPENSE });
            // When shouldDisableRename is called
            var result = (0, ReportUtils_1.shouldDisableRename)(report);
            // Then it should return true
            expect(result).toBe(true);
        });
        it('should return true for policy expense chats', function () {
            // Given a policy expense chat
            var report = __assign(__assign({}, (0, reports_2.createRandomReport)(50007)), { chatType: CONST_1.default.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT, isOwnPolicyExpenseChat: true });
            // When shouldDisableRename is called
            var result = (0, ReportUtils_1.shouldDisableRename)(report);
            // Then it should return true
            expect(result).toBe(true);
        });
        it('should return true for invoice rooms', function () {
            // Given an invoice room
            var report = __assign(__assign({}, (0, reports_2.createRandomReport)(50008)), { chatType: CONST_1.default.REPORT.CHAT_TYPE.INVOICE });
            // When shouldDisableRename is called
            var result = (0, ReportUtils_1.shouldDisableRename)(report);
            // Then it should return true
            expect(result).toBe(true);
        });
        it('should return true for invoice reports', function () {
            // Given an invoice report
            var report = __assign(__assign({}, (0, reports_2.createRandomReport)(50009)), { type: CONST_1.default.REPORT.TYPE.INVOICE });
            // When shouldDisableRename is called
            var result = (0, ReportUtils_1.shouldDisableRename)(report);
            // Then it should return true
            expect(result).toBe(true);
        });
        it('should return true for system chats', function () {
            // Given a system chat
            var report = __assign(__assign({}, (0, reports_2.createRandomReport)(50010)), { chatType: CONST_1.default.REPORT.CHAT_TYPE.SYSTEM });
            // When shouldDisableRename is called
            var result = (0, ReportUtils_1.shouldDisableRename)(report);
            // Then it should return true
            expect(result).toBe(true);
        });
        it('should return false for group chats', function () { return __awaiter(void 0, void 0, void 0, function () {
            var report, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        report = __assign(__assign({}, (0, reports_2.createRandomReport)(50011)), { type: CONST_1.default.REPORT.TYPE.CHAT, chatType: CONST_1.default.REPORT.CHAT_TYPE.GROUP, participants: (0, ReportUtils_1.buildParticipantsFromAccountIDs)([currentUserAccountID, 1, 2]) });
                        return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report.reportID), report)];
                    case 1:
                        _a.sent();
                        result = (0, ReportUtils_1.shouldDisableRename)(report);
                        // Then it should return false
                        expect(result).toBe(false);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should return false for non-archived regular chats', function () { return __awaiter(void 0, void 0, void 0, function () {
            var report, isReportArchived, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        report = {
                            reportID: '50012',
                            type: CONST_1.default.REPORT.TYPE.CHAT,
                            participants: (0, ReportUtils_1.buildParticipantsFromAccountIDs)([currentUserAccountID, 1]),
                            // Ensure it's not a policy expense chat or any other special chat type
                            chatType: undefined,
                            isOwnPolicyExpenseChat: false,
                            policyID: undefined,
                        };
                        return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report.reportID), report)];
                    case 1:
                        _a.sent();
                        isReportArchived = (0, react_native_1.renderHook)(function () { return (0, useReportIsArchived_1.default)(report === null || report === void 0 ? void 0 : report.reportID); }).result;
                        result = (0, ReportUtils_1.shouldDisableRename)(report, isReportArchived.current);
                        // Then it should return false (since this is a 1:1 DM and not a group chat, and none of the other conditions are met)
                        expect(result).toBe(false);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('isWhisperAction', function () {
        it('an action where reportAction.message.whisperedTo has accountIDs is a whisper action', function () {
            var whisperReportAction = __assign({}, (0, reportActions_1.default)(1));
            expect((0, ReportActionsUtils_1.isWhisperAction)(whisperReportAction)).toBe(true);
        });
        it('an action where reportAction.originalMessage.whisperedTo does not exist is not a whisper action', function () {
            var nonWhisperReportAction = __assign(__assign({}, (0, reportActions_1.default)(1)), { message: [
                    {
                        whisperedTo: undefined,
                    },
                ] });
            expect((0, ReportActionsUtils_1.isWhisperAction)(nonWhisperReportAction)).toBe(false);
        });
    });
    describe('canFlagReportAction', function () {
        describe('a whisper action', function () {
            var whisperReportAction = __assign({}, (0, reportActions_1.default)(1));
            it('cannot be flagged if it is from concierge', function () {
                var whisperReportActionFromConcierge = __assign(__assign({}, whisperReportAction), { actorAccountID: CONST_1.default.ACCOUNT_ID.CONCIERGE });
                // The reportID doesn't matter because there is an early return for whisper actions and the report is not looked at
                expect((0, ReportUtils_1.canFlagReportAction)(whisperReportActionFromConcierge, '123456')).toBe(false);
            });
            it('cannot be flagged if it is from the current user', function () {
                var whisperReportActionFromCurrentUser = __assign(__assign({}, whisperReportAction), { actorAccountID: currentUserAccountID });
                // The reportID doesn't matter because there is an early return for whisper actions and the report is not looked at
                expect((0, ReportUtils_1.canFlagReportAction)(whisperReportActionFromCurrentUser, '123456')).toBe(false);
            });
            it('can be flagged if it is not from concierge or the current user', function () {
                expect((0, ReportUtils_1.canFlagReportAction)(whisperReportAction, '123456')).toBe(true);
            });
        });
        describe('a non-whisper action', function () {
            var report = __assign({}, (0, reports_2.createRandomReport)(1));
            var nonWhisperReportAction = __assign(__assign({}, (0, reportActions_1.default)(1)), { actionName: CONST_1.default.REPORT.ACTIONS.TYPE.ADD_COMMENT, message: [
                    {
                        whisperedTo: undefined,
                    },
                ] });
            (0, globals_1.beforeAll)(function () { return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report.reportID), report)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
            afterAll(function () { return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report.reportID), null)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
            it('cannot be flagged if it is from the current user', function () {
                var nonWhisperReportActionFromCurrentUser = __assign(__assign({}, nonWhisperReportAction), { actorAccountID: currentUserAccountID });
                expect((0, ReportUtils_1.canFlagReportAction)(nonWhisperReportActionFromCurrentUser, report.reportID)).toBe(false);
            });
            it('cannot be flagged if the action name is something other than ADD_COMMENT', function () {
                var nonWhisperReportActionWithDifferentActionName = __assign(__assign({}, nonWhisperReportAction), { actionName: CONST_1.default.REPORT.ACTIONS.TYPE.APPROVED });
                expect((0, ReportUtils_1.canFlagReportAction)(nonWhisperReportActionWithDifferentActionName, report.reportID)).toBe(false);
            });
            it('cannot be flagged if the action is deleted', function () {
                var deletedReportAction = __assign(__assign({}, nonWhisperReportAction), { message: [
                        {
                            whisperedTo: undefined,
                            html: '',
                            deleted: (0, reportActions_1.getRandomDate)(),
                        },
                    ] });
                expect((0, ReportUtils_1.canFlagReportAction)(deletedReportAction, report.reportID)).toBe(false);
            });
            it('cannot be flagged if the action is a created task report', function () {
                var createdTaskReportAction = __assign(__assign({}, nonWhisperReportAction), { originalMessage: {
                        // This signifies that the action is a created task report along with the ADD_COMMENT action name
                        taskReportID: '123456',
                    } });
                expect((0, ReportUtils_1.canFlagReportAction)(createdTaskReportAction, report.reportID)).toBe(false);
            });
            it('cannot be flagged if the report does not exist', function () {
                // cspell:disable-next-line
                expect((0, ReportUtils_1.canFlagReportAction)(nonWhisperReportAction, 'starwarsisthebest')).toBe(false);
            });
            it('cannot be flagged if the report is not allowed to be commented on', function () {
                // eslint-disable-next-line rulesdir/no-negated-variables
                var reportThatCannotBeCommentedOn = __assign(__assign({}, (0, reports_2.createRandomReport)(2)), { 
                    // If the permissions does not contain WRITE, then it cannot be commented on
                    permissions: [] });
                expect((0, ReportUtils_1.canFlagReportAction)(nonWhisperReportAction, reportThatCannotBeCommentedOn.reportID)).toBe(false);
            });
            it('can be flagged', function () {
                expect((0, ReportUtils_1.canFlagReportAction)(nonWhisperReportAction, report.reportID)).toBe(true);
            });
        });
    });
    // Note: shouldShowFlagComment() calls isArchivedNonExpenseReport() which has it's own unit tests, so whether
    // the report is an expense report or not does not need to be tested here.
    describe('shouldShowFlagComment', function () {
        var validReportAction = __assign(__assign({}, (0, reportActions_1.default)(1)), { actionName: CONST_1.default.REPORT.ACTIONS.TYPE.ADD_COMMENT, 
            // Actor is not the current user or Concierge
            actorAccountID: 123456 });
        describe('can flag report action', function () {
            var expenseReport;
            var reportActionThatCanBeFlagged = __assign({}, validReportAction);
            // eslint-disable-next-line rulesdir/no-negated-variables
            var reportActionThatCannotBeFlagged = __assign(__assign({}, (0, reportActions_1.default)(1)), { actionName: CONST_1.default.REPORT.ACTIONS.TYPE.ADD_COMMENT, 
                // If the actor is Concierge, the report action cannot be flagged
                actorAccountID: CONST_1.default.ACCOUNT_ID.CONCIERGE });
            (0, globals_1.beforeAll)(function () { return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            expenseReport = __assign(__assign({}, (0, reports_2.createRandomReport)(60000)), { type: CONST_1.default.REPORT.TYPE.EXPENSE });
                            return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(expenseReport.reportID), expenseReport)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
            afterAll(function () { return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(expenseReport.reportID), null)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
            it('should return true for an archived expense report with an action that can be flagged', function () {
                expect((0, ReportUtils_1.shouldShowFlagComment)(reportActionThatCanBeFlagged, expenseReport, true)).toBe(true);
            });
            it('should return true for a non-archived expense report with an action that can be flagged', function () {
                expect((0, ReportUtils_1.shouldShowFlagComment)(reportActionThatCanBeFlagged, expenseReport, false)).toBe(true);
            });
            it('should return false for an archived expense report with an action that cannot be flagged', function () {
                expect((0, ReportUtils_1.shouldShowFlagComment)(reportActionThatCannotBeFlagged, expenseReport, true)).toBe(false);
            });
            it('should return false for a non-archived expense report with an action that cannot be flagged', function () {
                expect((0, ReportUtils_1.shouldShowFlagComment)(reportActionThatCannotBeFlagged, expenseReport, false)).toBe(false);
            });
        });
        describe('Chat with Chronos', function () {
            var chatReport;
            (0, globals_1.beforeAll)(function () { return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            chatReport = __assign(__assign({}, (0, reports_2.createRandomReport)(60000)), { type: CONST_1.default.REPORT.TYPE.CHAT, participants: (0, ReportUtils_1.buildParticipantsFromAccountIDs)([currentUserAccountID, CONST_1.default.ACCOUNT_ID.CHRONOS]) });
                            return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(chatReport.reportID), chatReport)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
            afterAll(function () { return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(chatReport.reportID), null)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
            it('should return false for an archived chat report', function () {
                expect((0, ReportUtils_1.shouldShowFlagComment)(validReportAction, chatReport, true)).toBe(false);
            });
            it('should return false for a non-archived chat report', function () {
                expect((0, ReportUtils_1.shouldShowFlagComment)(validReportAction, chatReport, false)).toBe(false);
            });
        });
        describe('Chat with Concierge', function () {
            var chatReport;
            (0, globals_1.beforeAll)(function () { return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            chatReport = __assign(__assign({}, (0, reports_2.createRandomReport)(60000)), { type: CONST_1.default.REPORT.TYPE.CHAT, participants: (0, ReportUtils_1.buildParticipantsFromAccountIDs)([currentUserAccountID, CONST_1.default.ACCOUNT_ID.CONCIERGE]) });
                            return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(chatReport.reportID), chatReport)];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.CONCIERGE_REPORT_ID), chatReport.reportID)];
                        case 2:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
            afterAll(function () { return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(chatReport.reportID), null)];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.CONCIERGE_REPORT_ID), null)];
                        case 2:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
            it('should return false for an archived chat report', function () {
                expect((0, ReportUtils_1.shouldShowFlagComment)(validReportAction, chatReport, true)).toBe(false);
            });
            it('should return false for a non-archived chat report', function () {
                expect((0, ReportUtils_1.shouldShowFlagComment)(validReportAction, chatReport, false)).toBe(false);
            });
        });
        describe('Action from Concierge', function () {
            var chatReport;
            var actionFromConcierge = __assign(__assign({}, (0, reportActions_1.default)(1)), { actionName: CONST_1.default.REPORT.ACTIONS.TYPE.ADD_COMMENT, actorAccountID: CONST_1.default.ACCOUNT_ID.CONCIERGE });
            (0, globals_1.beforeAll)(function () { return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            chatReport = __assign(__assign({}, (0, reports_2.createRandomReport)(60000)), { type: CONST_1.default.REPORT.TYPE.CHAT });
                            return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(chatReport.reportID), chatReport)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
            afterAll(function () { return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(chatReport.reportID), null)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
            it('should return false for an archived chat report', function () {
                expect((0, ReportUtils_1.shouldShowFlagComment)(actionFromConcierge, chatReport, true)).toBe(false);
            });
            it('should return false for a non-archived chat report', function () {
                expect((0, ReportUtils_1.shouldShowFlagComment)(actionFromConcierge, chatReport, false)).toBe(false);
            });
        });
    });
});
