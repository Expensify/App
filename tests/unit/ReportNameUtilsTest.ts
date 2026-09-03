import type {LocalizedTranslate} from '@components/LocaleContextProvider';

import {convertToDisplayString} from '@libs/CurrencyUtils';
import {translate} from '@libs/Localize';
import {
    buildReportNameFromParticipantNames,
    // eslint-disable-next-line no-restricted-imports -- testing computeReportName directly
    computeReportName as computeReportNameOriginal,
    getGroupChatName,
    getInvoicePayerName,
    getInvoicesChatName,
    getMoneyRequestReportName,
    getPolicyExpenseChatName,
    getReportName,
} from '@libs/ReportNameUtils';
import {buildTransactionsByReportID} from '@libs/TodosUtils';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList, Policy, PolicyTagLists, Report, ReportAction, ReportActions, ReportAttributesDerivedValue, ReportNameValuePairs, Transaction} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

import createRandomPolicy from '../utils/collections/policies';
import createRandomReportAction from '../utils/collections/reportActions';
import {createAdminRoom, createExpenseReport, createPolicyExpenseChat, createRegularChat, createRegularTaskReport, createSelfDM, createWorkspaceThread} from '../utils/collections/reports';
import createRandomTransaction from '../utils/collections/transaction';
import createMock from '../utils/createMock';
import {fakePersonalDetails} from '../utils/LHNTestUtils';
import {formatPhoneNumber, translateLocal} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const currentUserLogin = 'lagertha2@vikings.net';
describe('ReportNameUtils', () => {
    const currentUserAccountID = 5;
    const computeReportName = (
        report?: Report,
        reports?: OnyxCollection<Report>,
        policies?: OnyxCollection<Policy>,
        transactions?: OnyxCollection<Transaction>,
        allReportNameValuePairs?: OnyxCollection<ReportNameValuePairs>,
        personalDetailsList?: PersonalDetailsList,
        reportActions?: OnyxCollection<ReportActions>,
        currentUserID = currentUserAccountID,
    ) =>
        computeReportNameOriginal({
            dateFnsLocale: undefined,
            conciergeReportID: undefined,
            report,
            reports,
            policies,
            transactions,
            allReportNameValuePairs,
            personalDetailsList,
            reportActions,
            currentUserAccountID: currentUserID,
            currentUserLogin,
            reportTransactions: buildTransactionsByReportID(transactions),
            translate: translateLocal,
            isTrackIntentUser: false,
        });
    const participantsPersonalDetails: PersonalDetailsList = [
        {
            accountID: 1,
            displayName: 'Ragnar Lothbrok',
            firstName: 'Ragnar',
            login: 'ragnar@vikings.net',
        },
        {
            accountID: 2,
            login: 'floki@vikings.net',
            displayName: 'floki@vikings.net',
        },
        {
            accountID: 3,
            displayName: 'Lagertha Lothbrok',
            firstName: 'Lagertha',
            login: 'lagertha@vikings.net',
            pronouns: 'She/her',
        },
        {
            accountID: 4,
            login: '+18332403627@expensify.sms',
            displayName: '(833) 240-3627',
        },
        {
            accountID: 5,
            displayName: 'Lagertha Lothbrok',
            firstName: 'Lagertha',
            login: 'lagertha2@vikings.net',
            pronouns: 'She/her',
        },
    ].reduce<PersonalDetailsList>((acc, detail) => {
        acc[String(detail.accountID)] = detail;
        return acc;
    }, {});

    beforeAll(async () => {
        Onyx.init({keys: ONYXKEYS});
        await Onyx.multiSet({
            [ONYXKEYS.PERSONAL_DETAILS_LIST]: participantsPersonalDetails,
            [ONYXKEYS.SESSION]: {accountID: currentUserAccountID, email: 'lagertha2@vikings.net'},
        });
        await IntlStore.load(CONST.LOCALES.EN);
        await waitForBatchedUpdates();
    });

    const emptyCollections: {
        reports: OnyxCollection<Report>;
        policies: OnyxCollection<Policy>;
        transactions: OnyxCollection<Transaction>;
        reportNameValuePairs: OnyxCollection<ReportNameValuePairs>;
        reportActions: OnyxCollection<ReportActions>;
    } = {
        reports: {},
        policies: {},
        transactions: {},
        reportNameValuePairs: {},
        reportActions: {},
    };

    describe('computeReportName - DMs and Group chats', () => {
        test('1:1 DM with displayName', () => {
            const report: Report = {
                ...createRegularChat(1, [currentUserAccountID, 1]),
                ownerAccountID: currentUserAccountID,
            };

            const name = computeReportName(
                report,
                emptyCollections.reports,
                emptyCollections.policies,
                undefined,
                undefined,
                participantsPersonalDetails,
                emptyCollections.reportActions,
                currentUserAccountID,
            );
            expect(name).toBe('Ragnar Lothbrok');
        });

        test('1:1 DM without displayName uses login', () => {
            const report: Report = {
                ...createRegularChat(2, [currentUserAccountID, 2]),
                ownerAccountID: currentUserAccountID,
            };

            const name = computeReportName(
                report,
                emptyCollections.reports,
                emptyCollections.policies,
                undefined,
                undefined,
                participantsPersonalDetails,
                emptyCollections.reportActions,
                currentUserAccountID,
            );
            expect(name).toBe('floki@vikings.net');
        });

        test('1:1 DM SMS uses formatted phone', () => {
            const report: Report = {
                ...createRegularChat(3, [currentUserAccountID, 4]),
                ownerAccountID: currentUserAccountID,
            };

            const name = computeReportName(
                report,
                emptyCollections.reports,
                emptyCollections.policies,
                undefined,
                undefined,
                participantsPersonalDetails,
                emptyCollections.reportActions,
                currentUserAccountID,
            );
            expect(name).toBe('(833) 240-3627');
        });

        test('Group DM uses up to 5 participant short names', async () => {
            const report: Report = {
                ...createRegularChat(4, [currentUserAccountID, 1, 2, 3, 4]),
                ownerAccountID: currentUserAccountID,
                reportName: undefined,
            };

            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, participantsPersonalDetails);
            const name = computeReportName(
                report,
                emptyCollections.reports,
                emptyCollections.policies,
                undefined,
                undefined,
                participantsPersonalDetails,
                emptyCollections.reportActions,
                currentUserAccountID,
            );
            expect(name).toBe('Ragnar, floki@vikings.net, Lagertha, (833) 240-3627');
        });
    });

    describe('computeReportName - Admin room', () => {
        test('Active admin room', () => {
            const report = createAdminRoom(10);
            const name = computeReportName(
                report,
                emptyCollections.reports,
                emptyCollections.policies,
                undefined,
                undefined,
                participantsPersonalDetails,
                emptyCollections.reportActions,
                currentUserAccountID,
            );
            expect(name).toBe('#admins');
        });

        test('Archived admin room in EN and ES', async () => {
            const report = createAdminRoom(11);
            const reportNameValuePairs = {
                [`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report.reportID}`]: {private_isArchived: 'true'},
            } satisfies Record<string, ReportNameValuePairs>;

            const nameEn = computeReportName(
                report,
                emptyCollections.reports,
                emptyCollections.policies,
                undefined,
                reportNameValuePairs,
                participantsPersonalDetails,
                emptyCollections.reportActions,
                currentUserAccountID,
            );
            expect(nameEn).toBe('#admins (archived)');

            await IntlStore.load(CONST.LOCALES.ES);
            const nameEs = computeReportName(
                report,
                emptyCollections.reports,
                emptyCollections.policies,
                undefined,
                reportNameValuePairs,
                participantsPersonalDetails,
                emptyCollections.reportActions,
                currentUserAccountID,
            );
            expect(nameEs).toBe('#admins (archivado)');

            await IntlStore.load(CONST.LOCALES.EN);
        });
    });

    describe('computeReportName - Policy expense chat', () => {
        test('Returns policy expense chat name when owner is set', async () => {
            const report: Report = {
                ...createPolicyExpenseChat(20, true),
                ownerAccountID: 1,
            };

            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, participantsPersonalDetails);
            const name = computeReportName(
                report,
                emptyCollections.reports,
                emptyCollections.policies,
                undefined,
                undefined,
                participantsPersonalDetails,
                emptyCollections.reportActions,
                currentUserAccountID,
            );
            expect(name).toBe("Ragnar Lothbrok's expenses");
        });
    });

    describe('computeReportName - Self DM', () => {
        test('Returns self DM with postfix', async () => {
            const report: Report = {
                ...createSelfDM(30, currentUserAccountID),
                ownerAccountID: currentUserAccountID,
            };

            await Onyx.merge(ONYXKEYS.SESSION, {accountID: currentUserAccountID, email: 'lagertha2@vikings.net', authTokenType: CONST.AUTH_TOKEN_TYPES.SUPPORT});
            const name = computeReportName(
                report,
                emptyCollections.reports,
                emptyCollections.policies,
                undefined,
                undefined,
                participantsPersonalDetails,
                emptyCollections.reportActions,
                currentUserAccountID,
            );
            expect(name).toBe('Lagertha Lothbrok (you)');
        });

        test('resolves the self-DM "(you)" postfix through the provided translate function', async () => {
            const report: Report = {
                ...createSelfDM(31, currentUserAccountID),
                ownerAccountID: currentUserAccountID,
            };

            await Onyx.merge(ONYXKEYS.SESSION, {accountID: currentUserAccountID, email: 'lagertha2@vikings.net', authTokenType: CONST.AUTH_TOKEN_TYPES.SUPPORT});
            const translateWithYouMarker: LocalizedTranslate = (path, ...parameters) => (path === 'common.you' ? 'You Marker' : translateLocal(path, ...parameters));
            const name = computeReportNameOriginal({
                dateFnsLocale: undefined,
                conciergeReportID: undefined,
                report,
                reports: emptyCollections.reports,
                policies: emptyCollections.policies,
                transactions: undefined,
                personalDetailsList: participantsPersonalDetails,
                reportActions: emptyCollections.reportActions,
                currentUserAccountID,
                currentUserLogin,
                translate: translateWithYouMarker,
                isTrackIntentUser: false,
                reportTransactions: {},
            });
            // temporaryGetDisplayNameOrDefault lowercases the "you" postfix sourced from translate('common.you').
            expect(name).toBe('Lagertha Lothbrok (you marker)');
        });
    });

    describe('computeReportName - Task report', () => {
        test('Extracts plain text from HTML title', () => {
            const htmlTaskTitle = '<h1>heading with <a href="https://example.com">link</a></h1>';
            const report: Report = {
                ...createRegularTaskReport(40, currentUserAccountID),
                reportName: htmlTaskTitle,
            };

            const name = computeReportName(
                report,
                emptyCollections.reports,
                emptyCollections.policies,
                undefined,
                undefined,
                participantsPersonalDetails,
                emptyCollections.reportActions,
                currentUserAccountID,
            );
            expect(name).toBe('heading with link');
        });

        test('Returns plain text title without HTML conversion', () => {
            const plainTaskTitle = 'Fix the login bug on Android';
            const report: Report = {
                ...createRegularTaskReport(41, currentUserAccountID),
                reportName: plainTaskTitle,
            };

            const name = computeReportName(
                report,
                emptyCollections.reports,
                emptyCollections.policies,
                undefined,
                undefined,
                participantsPersonalDetails,
                emptyCollections.reportActions,
                currentUserAccountID,
            );
            expect(name).toBe('Fix the login bug on Android');
        });

        test('Trims whitespace from plain text title', () => {
            const report: Report = {
                ...createRegularTaskReport(42, currentUserAccountID),
                reportName: '  Expense report review  ',
            };

            const name = computeReportName(
                report,
                emptyCollections.reports,
                emptyCollections.policies,
                undefined,
                undefined,
                participantsPersonalDetails,
                emptyCollections.reportActions,
                currentUserAccountID,
            );
            expect(name).toBe('Expense report review');
        });

        test('Returns empty string for undefined reportName', () => {
            const report: Report = {
                ...createRegularTaskReport(43, currentUserAccountID),
                reportName: undefined,
            };

            const name = computeReportName(
                report,
                emptyCollections.reports,
                emptyCollections.policies,
                undefined,
                undefined,
                participantsPersonalDetails,
                emptyCollections.reportActions,
                currentUserAccountID,
            );
            expect(name).toBe('');
        });
    });

    describe('computeReportName - Thread report action names', () => {
        test('Submitted parent action', () => {
            const thread: Report = createWorkspaceThread(50);
            const parentAction = createMock<ReportAction>({
                actionName: CONST.REPORT.ACTIONS.TYPE.SUBMITTED,
                reportActionID: String(thread.parentReportActionID),
                message: [],
                created: '',
                lastModified: '',
                actorAccountID: 1,
                person: [],
                originalMessage: {
                    message: 'via workflow',
                },
            });

            expect(thread.parentReportID).toBeDefined();
            expect(thread.parentReportActionID).toBeDefined();
            const parentId = String(thread.parentReportID);
            const actionId = String(thread.parentReportActionID);

            const reportActionsCollection: Record<string, ReportActions> = {
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentId}`]: {
                    [actionId]: parentAction,
                },
            };

            const expected = translate(CONST.LOCALES.EN, 'iou.submitted', 'via workflow');
            const name = computeReportName(
                thread,
                emptyCollections.reports,
                emptyCollections.policies,
                undefined,
                undefined,
                participantsPersonalDetails,
                reportActionsCollection,
                currentUserAccountID,
            );
            expect(name).toBe(expected);
        });

        test('Rejected parent action', () => {
            const thread: Report = createWorkspaceThread(51);
            const parentAction = createMock<ReportAction>({
                actionName: CONST.REPORT.ACTIONS.TYPE.REJECTED,
                reportActionID: String(thread.parentReportActionID),
                message: [],
                created: '',
                lastModified: '',
                actorAccountID: 1,
                person: [],
            });

            expect(thread.parentReportID).toBeDefined();
            expect(thread.parentReportActionID).toBeDefined();
            const parentId = String(thread.parentReportID);
            const actionId = String(thread.parentReportActionID);

            const reportActionsCollection: Record<string, ReportActions> = {
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentId}`]: {
                    [actionId]: parentAction,
                },
            };

            const expected = translate(CONST.LOCALES.EN, 'iou.rejectedThisReport');
            const name = computeReportName(
                thread,
                emptyCollections.reports,
                emptyCollections.policies,
                undefined,
                undefined,
                participantsPersonalDetails,
                reportActionsCollection,
                currentUserAccountID,
            );
            expect(name).toBe(expected);
        });
        test('VBBA pay parent action uses action accountNumber before current policy account', () => {
            const policyID = '123';
            const thread: Report = {
                ...createWorkspaceThread(61),
                policyID,
            };
            const parentAction: ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> = {
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                reportActionID: String(thread.parentReportActionID),
                message: [],
                created: '',
                lastModified: '',
                actorAccountID: 1,
                person: [],
                originalMessage: {
                    type: CONST.IOU.REPORT_ACTION_TYPE.PAY,
                    paymentType: CONST.IOU.PAYMENT_TYPE.VBBA,
                    accountNumber: 'XXXX1111',
                },
            };

            const reportActionsCollection: Record<string, ReportActions> = {
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${thread.parentReportID}`]: {
                    [String(thread.parentReportActionID)]: parentAction,
                },
            };
            const policiesCollection: Record<string, Policy> = {
                [`${ONYXKEYS.COLLECTION.POLICY}${policyID}`]: {
                    ...createRandomPolicy(Number(policyID), CONST.POLICY.TYPE.TEAM),
                    id: policyID,
                    achAccount: {
                        bankAccountID: 1,
                        accountNumber: 'XXXX2222',
                        routingNumber: '',
                        addressName: '',
                        bankName: '',
                        reimburser: '',
                    },
                },
            };

            const name = computeReportName(
                thread,
                emptyCollections.reports,
                policiesCollection,
                undefined,
                undefined,
                participantsPersonalDetails,
                reportActionsCollection,
                currentUserAccountID,
            );

            expect(name).toBe(translate(CONST.LOCALES.EN, 'iou.businessBankAccount', undefined, '1111'));
        });
        test('Cross-border pay parent action', () => {
            // Given a thread on a payment that converted currency for the employee
            const thread: Report = createWorkspaceThread(60);
            const parentAction: ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> = {
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                reportActionID: String(thread.parentReportActionID),
                message: [],
                created: '',
                lastModified: '',
                actorAccountID: 1,
                person: [],
                originalMessage: {
                    type: CONST.IOU.REPORT_ACTION_TYPE.PAY,
                    paymentType: CONST.IOU.PAYMENT_TYPE.VBBA,
                    creditedAmount: 1340,
                    creditedCurrency: 'GBP',
                    debitBankAccountLast4: '6789',
                    creditBankAccountLast4: '3335',
                },
            };

            const parentId = String(thread.parentReportID);
            const actionId = String(thread.parentReportActionID);
            const reportActionsCollection: Record<string, ReportActions> = {
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentId}`]: {
                    [actionId]: parentAction,
                },
            };

            // When the thread is named
            const name = computeReportName(
                thread,
                emptyCollections.reports,
                emptyCollections.policies,
                undefined,
                undefined,
                participantsPersonalDetails,
                reportActionsCollection,
                currentUserAccountID,
            );

            // Then it names the credited amount and both accounts rather than only the company account
            expect(name).toBe(translate(CONST.LOCALES.EN, 'iou.reimbursedCrossBorder', {amount: convertToDisplayString(1340, 'GBP'), debitBankAccount: '6789', creditBankAccount: '3335'}));
        });
        test('Hold parent action', () => {
            const thread: Report = createWorkspaceThread(52);
            const parentAction = createMock<ReportAction>({
                actionName: CONST.REPORT.ACTIONS.TYPE.HOLD,
                reportActionID: String(thread.parentReportActionID),
                message: [],
                created: '',
                lastModified: '',
                actorAccountID: 1,
                person: [],
            });

            expect(thread.parentReportID).toBeDefined();
            expect(thread.parentReportActionID).toBeDefined();
            const parentId = String(thread.parentReportID);
            const actionId = String(thread.parentReportActionID);

            const reportActionsCollection: Record<string, ReportActions> = {
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentId}`]: {
                    [actionId]: parentAction,
                },
            };

            const expected = translate(CONST.LOCALES.EN, 'iou.heldExpense');
            const name = computeReportName(
                thread,
                emptyCollections.reports,
                emptyCollections.policies,
                undefined,
                undefined,
                participantsPersonalDetails,
                reportActionsCollection,
                currentUserAccountID,
            );
            expect(name).toBe(expected);
        });
        test('Unhold parent action', () => {
            const thread: Report = createWorkspaceThread(53);
            const parentAction = createMock<ReportAction>({
                actionName: CONST.REPORT.ACTIONS.TYPE.UNHOLD,
                reportActionID: String(thread.parentReportActionID),
                message: [],
                created: '',
                lastModified: '',
                actorAccountID: 1,
                person: [],
            });

            expect(thread.parentReportID).toBeDefined();
            expect(thread.parentReportActionID).toBeDefined();
            const parentId = String(thread.parentReportID);
            const actionId = String(thread.parentReportActionID);

            const reportActionsCollection: Record<string, ReportActions> = {
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentId}`]: {
                    [actionId]: parentAction,
                },
            };

            const expected = translate(CONST.LOCALES.EN, 'iou.unheldExpense');
            const name = computeReportName(
                thread,
                emptyCollections.reports,
                emptyCollections.policies,
                undefined,
                undefined,
                participantsPersonalDetails,
                reportActionsCollection,
                currentUserAccountID,
            );
            expect(name).toBe(expected);
        });

        test('uses provided policy tags for modified expense thread name generation', () => {
            const thread: Report = {
                ...createRegularChat(52, [currentUserAccountID, 1]),
                policyID: 'policy123',
                parentReportID: '1000',
                parentReportActionID: '2000',
            };
            const parentAction = createMock<ReportAction>({
                actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE,
                reportActionID: String(thread.parentReportActionID),
                message: [],
                created: '',
                lastModified: '',
                actorAccountID: 1,
                person: [],
                originalMessage: {
                    oldTag: 'Engineering',
                    tag: 'Finance',
                },
            });

            const parentId = String(thread.parentReportID);
            const actionId = String(thread.parentReportActionID);
            const reportActionsCollection: Record<string, ReportActions> = {
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentId}`]: {
                    [actionId]: parentAction,
                },
            };

            const policyTagsCollection = {
                [`${ONYXKEYS.COLLECTION.POLICY_TAGS}${thread.policyID}`]: {
                    tagList0: {
                        name: 'Cost Center',
                        required: false,
                        orderWeight: 0,
                        tags: {},
                    },
                },
            } satisfies OnyxCollection<PolicyTagLists>;

            const name = computeReportNameOriginal({
                dateFnsLocale: undefined,
                conciergeReportID: undefined,
                report: thread,
                reports: emptyCollections.reports,
                policies: emptyCollections.policies,
                transactions: {},
                personalDetailsList: participantsPersonalDetails,
                reportActions: reportActionsCollection,
                currentUserAccountID,
                currentUserLogin: '',
                translate: translateLocal,
                allPolicyTags: policyTagsCollection,
                reportTransactions: {},
                isTrackIntentUser: false,
            });

            expect(name).toContain('Cost Center');
        });

        test('ADD_CARD_FEED parent action', () => {
            const thread: Report = createWorkspaceThread(100);
            const parentAction = createMock<ReportAction>({
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_CARD_FEED,
                reportActionID: String(thread.parentReportActionID),
                message: [],
                created: '',
                lastModified: '',
                actorAccountID: 1,
                person: [],
                originalMessage: {
                    feedName: 'Visa Commercial',
                },
            });

            const parentId = String(thread.parentReportID);
            const actionId = String(thread.parentReportActionID);
            const reportActionsCollection: Record<string, ReportActions> = {
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentId}`]: {[actionId]: parentAction},
            };

            const name = computeReportName(
                thread,
                emptyCollections.reports,
                emptyCollections.policies,
                undefined,
                undefined,
                participantsPersonalDetails,
                reportActionsCollection,
                currentUserAccountID,
            );
            expect(name).toBe('added card feed "Visa Commercial"');
        });

        test('UPDATE_REQUIRE_COMPANY_CARDS_ENABLED parent action', () => {
            const thread: Report = createWorkspaceThread(150);
            const enabledParentAction = createMock<ReportAction>({
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_REQUIRE_COMPANY_CARDS_ENABLED,
                reportActionID: String(thread.parentReportActionID),
                message: [],
                created: '',
                lastModified: '',
                actorAccountID: 1,
                person: [],
                originalMessage: {
                    enabled: true,
                },
            });

            const parentId = String(thread.parentReportID);
            const actionId = String(thread.parentReportActionID);
            const reportActionsCollection: Record<string, ReportActions> = {
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentId}`]: {[actionId]: enabledParentAction},
            };

            const enabledName = computeReportName(
                thread,
                emptyCollections.reports,
                emptyCollections.policies,
                undefined,
                undefined,
                participantsPersonalDetails,
                reportActionsCollection,
                currentUserAccountID,
            );
            expect(enabledName).toBe('enabled the company card purchases requirement');

            const disabledParentAction = createMock<ReportAction>({
                ...enabledParentAction,
                originalMessage: {
                    enabled: false,
                },
            });
            const disabledReportActionsCollection: Record<string, ReportActions> = {
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentId}`]: {[actionId]: disabledParentAction},
            };
            const disabledName = computeReportName(
                thread,
                emptyCollections.reports,
                emptyCollections.policies,
                undefined,
                undefined,
                participantsPersonalDetails,
                disabledReportActionsCollection,
                currentUserAccountID,
            );
            expect(disabledName).toBe('disabled the company card purchases requirement');
        });

        test('UPDATE_REQUIRES_CATEGORY parent action', () => {
            const thread: Report = createWorkspaceThread(151);
            const parentId = String(thread.parentReportID);
            const actionId = String(thread.parentReportActionID);
            const enabledParentAction: ReportAction = {
                ...createRandomReportAction(151),
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_REQUIRES_CATEGORY,
                reportActionID: actionId,
                originalMessage: {enabled: true},
            };

            const enabledName = computeReportName(
                thread,
                emptyCollections.reports,
                emptyCollections.policies,
                undefined,
                undefined,
                participantsPersonalDetails,
                {[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentId}`]: {[actionId]: enabledParentAction}},
                currentUserAccountID,
            );
            expect(enabledName).toBe('enabled the expense categorization requirement');

            const disabledParentAction: ReportAction = {...enabledParentAction, originalMessage: {enabled: false}};
            const disabledName = computeReportName(
                thread,
                emptyCollections.reports,
                emptyCollections.policies,
                undefined,
                undefined,
                participantsPersonalDetails,
                {[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentId}`]: {[actionId]: disabledParentAction}},
                currentUserAccountID,
            );
            expect(disabledName).toBe('disabled the expense categorization requirement');
        });

        test('UPDATE_REQUIRES_TAG parent action', () => {
            const thread: Report = createWorkspaceThread(152);
            const parentId = String(thread.parentReportID);
            const actionId = String(thread.parentReportActionID);
            const enabledParentAction: ReportAction = {
                ...createRandomReportAction(152),
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_REQUIRES_TAG,
                reportActionID: actionId,
                originalMessage: {enabled: true},
            };

            const enabledName = computeReportName(
                thread,
                emptyCollections.reports,
                emptyCollections.policies,
                undefined,
                undefined,
                participantsPersonalDetails,
                {[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentId}`]: {[actionId]: enabledParentAction}},
                currentUserAccountID,
            );
            expect(enabledName).toBe('enabled the expense tagging requirement');

            const disabledParentAction: ReportAction = {...enabledParentAction, originalMessage: {enabled: false}};
            const disabledName = computeReportName(
                thread,
                emptyCollections.reports,
                emptyCollections.policies,
                undefined,
                undefined,
                participantsPersonalDetails,
                {[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentId}`]: {[actionId]: disabledParentAction}},
                currentUserAccountID,
            );
            expect(disabledName).toBe('disabled the expense tagging requirement');
        });

        test('UPDATE_GLOBAL_REIMBURSEMENTS_FX_PREFERENCE parent action', () => {
            const thread: Report = createWorkspaceThread(153);
            const companyPaysParentAction: ReportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_GLOBAL_REIMBURSEMENTS_FX_PREFERENCE,
                reportActionID: String(thread.parentReportActionID),
                originalMessage: {
                    preference: CONST.POLICY.GLOBAL_REIMBURSEMENT_FX_PREFERENCE.COMPANY,
                },
            };

            const parentId = String(thread.parentReportID);
            const actionId = String(thread.parentReportActionID);
            const companyPaysName = computeReportName(
                thread,
                emptyCollections.reports,
                emptyCollections.policies,
                undefined,
                undefined,
                participantsPersonalDetails,
                {[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentId}`]: {[actionId]: companyPaysParentAction}},
                currentUserAccountID,
            );
            expect(companyPaysName).toBe('updated the currency conversion fee setting to "Company pays"');

            const employeePaysParentAction: ReportAction = {
                ...companyPaysParentAction,
                originalMessage: {
                    preference: CONST.POLICY.GLOBAL_REIMBURSEMENT_FX_PREFERENCE.EMPLOYEE,
                },
            };
            const employeePaysName = computeReportName(
                thread,
                emptyCollections.reports,
                emptyCollections.policies,
                undefined,
                undefined,
                participantsPersonalDetails,
                {[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentId}`]: {[actionId]: employeePaysParentAction}},
                currentUserAccountID,
            );
            expect(employeePaysName).toBe('updated the currency conversion fee setting to "Employee pays"');
        });

        test('UPDATE_CUSTOM_UNIT_RATE parent action', () => {
            const thread: Report = createWorkspaceThread(153);
            const parentId = String(thread.parentReportID);
            const actionId = String(thread.parentReportActionID);
            const parentAction: ReportAction = {
                ...createRandomReportAction(153),
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CUSTOM_UNIT_RATE,
                reportActionID: actionId,
                originalMessage: {
                    customUnitName: 'Distance',
                    customUnitRateName: 'Default Rate',
                    updatedField: 'taxClaimablePercentage',
                    oldValue: 0.5,
                    newValue: 0.7,
                },
            };

            const name = computeReportName(
                thread,
                emptyCollections.reports,
                emptyCollections.policies,
                undefined,
                undefined,
                participantsPersonalDetails,
                {[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentId}`]: {[actionId]: parentAction}},
                currentUserAccountID,
            );
            expect(name).toBe('changed the tax reclaimable portion on the distance rate "Default Rate" to "70%" (previously "50%")');
        });

        test('UPDATE_AUTO_HARVESTING parent action', () => {
            const thread: Report = createWorkspaceThread(151);
            const enabledParentAction: ReportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_AUTO_HARVESTING,
                reportActionID: String(thread.parentReportActionID),
                originalMessage: {
                    value: true,
                },
            };

            const parentId = String(thread.parentReportID);
            const actionId = String(thread.parentReportActionID);
            const reportActionsCollection: Record<string, ReportActions> = {
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentId}`]: {[actionId]: enabledParentAction},
            };

            const enabledName = computeReportName(
                thread,
                emptyCollections.reports,
                emptyCollections.policies,
                undefined,
                undefined,
                participantsPersonalDetails,
                reportActionsCollection,
                currentUserAccountID,
            );
            expect(enabledName).toBe('enabled submissions');

            const disabledParentAction: ReportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_AUTO_HARVESTING,
                reportActionID: String(thread.parentReportActionID),
                originalMessage: {
                    value: false,
                },
            };
            const disabledReportActionsCollection: Record<string, ReportActions> = {
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentId}`]: {[actionId]: disabledParentAction},
            };
            const disabledName = computeReportName(
                thread,
                emptyCollections.reports,
                emptyCollections.policies,
                undefined,
                undefined,
                participantsPersonalDetails,
                disabledReportActionsCollection,
                currentUserAccountID,
            );
            expect(disabledName).toBe('disabled submissions');
        });

        test('UPDATE_CATEGORY_TAX_RATE parent action renders the rendered category default tax rate change', () => {
            const thread: Report = createWorkspaceThread(160);
            const parentAction = createMock<ReportAction>({
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CATEGORY_TAX_RATE,
                reportActionID: String(thread.parentReportActionID),
                message: [],
                created: '',
                lastModified: '',
                actorAccountID: 1,
                person: [],
                originalMessage: {
                    categoryName: 'Office Supplies',
                    oldTaxName: 'Tax Exempt',
                    oldTaxPercentage: '0%',
                    newTaxName: 'Tax Rate 1',
                    newTaxPercentage: '5%',
                },
            });

            const parentId = String(thread.parentReportID);
            const actionId = String(thread.parentReportActionID);
            const reportActionsCollection: Record<string, ReportActions> = {
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentId}`]: {
                    [actionId]: parentAction,
                },
            };

            const name = computeReportName(
                thread,
                emptyCollections.reports,
                emptyCollections.policies,
                undefined,
                undefined,
                participantsPersonalDetails,
                reportActionsCollection,
                currentUserAccountID,
            );
            expect(name).toBe('changed the "Office Supplies" category default tax rate to "Tax Rate 1 (5%)" (previously "Tax Exempt (0%)")');
        });

        test.each([
            [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_CATEGORY, {categoryName: 'Advertising'}, 'added the category "Advertising"'],
            [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_CATEGORY, {categoryName: 'Advertising'}, 'removed the category "Advertising"'],
            [
                CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CATEGORY,
                {categoryName: 'Advertising', updatedField: 'areAttendeesRequired', oldValue: '', newValue: true},
                'changed the "Advertising" category attendees to required (previously not required)',
            ],
            [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.SET_CATEGORY_NAME, {oldName: 'Advertising', newName: 'Marketing'}, 'renamed the category "Advertising" to "Marketing"'],
        ])('%s parent action renders the same message as the system message in the chat', (actionName, originalMessage, expected) => {
            const thread: Report = createWorkspaceThread(161);
            const parentAction = createMock<ReportAction>({
                actionName,
                reportActionID: String(thread.parentReportActionID),
                message: [],
                created: '',
                lastModified: '',
                actorAccountID: 1,
                person: [],
                originalMessage,
            });

            const reportActionsCollection: Record<string, ReportActions> = {
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${String(thread.parentReportID)}`]: {
                    [String(thread.parentReportActionID)]: parentAction,
                },
            };

            const name = computeReportName(
                thread,
                emptyCollections.reports,
                emptyCollections.policies,
                undefined,
                undefined,
                participantsPersonalDetails,
                reportActionsCollection,
                currentUserAccountID,
            );
            expect(name).toBe(expected);
        });

        test('UPDATE_CATEGORY parent action renders the description hint as plain text', () => {
            const thread: Report = createWorkspaceThread(163);
            const parentAction = createMock<ReportAction>({
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CATEGORY,
                reportActionID: String(thread.parentReportActionID),
                message: [],
                created: '',
                lastModified: '',
                actorAccountID: 1,
                person: [],
                originalMessage: {
                    categoryName: 'Advertising',
                    updatedField: 'commentHint',
                    oldValue: '',
                    newValue: 'Client&#x27;s &amp; partner&#x27;s names',
                },
            });

            const reportActionsCollection: Record<string, ReportActions> = {
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${String(thread.parentReportID)}`]: {
                    [String(thread.parentReportActionID)]: parentAction,
                },
            };

            const name = computeReportName(
                thread,
                emptyCollections.reports,
                emptyCollections.policies,
                undefined,
                undefined,
                participantsPersonalDetails,
                reportActionsCollection,
                currentUserAccountID,
            );
            expect(name).toBe(`added the description hint "Client's & partner's names" to the category "Advertising"`);
        });

        test('UPDATE_CATEGORY parent action formats the workspace default receipt amount with the policy currency', () => {
            const thread: Report = createWorkspaceThread(162);
            const parentAction = createMock<ReportAction>({
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CATEGORY,
                reportActionID: String(thread.parentReportActionID),
                message: [],
                created: '',
                lastModified: '',
                actorAccountID: 1,
                person: [],
                originalMessage: {
                    categoryName: 'Advertising',
                    updatedField: 'maxAmountNoReceipt',
                    oldValue: 0,
                    newValue: '',
                },
            });

            const reportActionsCollection: Record<string, ReportActions> = {
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${String(thread.parentReportID)}`]: {
                    [String(thread.parentReportActionID)]: parentAction,
                },
            };
            const policies: OnyxCollection<Policy> = {
                [`${ONYXKEYS.COLLECTION.POLICY}${String(thread.policyID)}`]: createMock<Policy>({
                    id: String(thread.policyID),
                    maxExpenseAmountNoReceipt: 5000,
                    outputCurrency: 'EUR',
                }),
            };

            const name = computeReportName(thread, emptyCollections.reports, policies, undefined, undefined, participantsPersonalDetails, reportActionsCollection, currentUserAccountID);
            expect(name).toBe('changed the "Advertising" category to €50 • Default (previously Always require receipts)');
        });

        test('DELETE_CARD_FEED parent action', () => {
            const thread: Report = createWorkspaceThread(101);
            const parentAction = createMock<ReportAction>({
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_CARD_FEED,
                reportActionID: String(thread.parentReportActionID),
                message: [],
                created: '',
                lastModified: '',
                actorAccountID: 1,
                person: [],
                originalMessage: {
                    feedName: 'Amex Corporate',
                },
            });

            const parentId = String(thread.parentReportID);
            const actionId = String(thread.parentReportActionID);
            const reportActionsCollection: Record<string, ReportActions> = {
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentId}`]: {[actionId]: parentAction},
            };

            const name = computeReportName(
                thread,
                emptyCollections.reports,
                emptyCollections.policies,
                undefined,
                undefined,
                participantsPersonalDetails,
                reportActionsCollection,
                currentUserAccountID,
            );
            expect(name).toBe('removed card feed "Amex Corporate"');
        });

        test('RENAME_CARD_FEED parent action', () => {
            const thread: Report = createWorkspaceThread(102);
            const parentAction = createMock<ReportAction>({
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.RENAME_CARD_FEED,
                reportActionID: String(thread.parentReportActionID),
                message: [],
                created: '',
                lastModified: '',
                actorAccountID: 1,
                person: [],
                originalMessage: {
                    oldName: 'Old Feed Name',
                    newName: 'New Feed Name',
                },
            });

            const parentId = String(thread.parentReportID);
            const actionId = String(thread.parentReportActionID);
            const reportActionsCollection: Record<string, ReportActions> = {
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentId}`]: {[actionId]: parentAction},
            };

            const name = computeReportName(
                thread,
                emptyCollections.reports,
                emptyCollections.policies,
                undefined,
                undefined,
                participantsPersonalDetails,
                reportActionsCollection,
                currentUserAccountID,
            );
            expect(name).toBe('renamed card feed to "New Feed Name" (previously "Old Feed Name")');
        });

        test('ASSIGN_COMPANY_CARD parent action', () => {
            const thread: Report = createWorkspaceThread(103);
            const parentAction = createMock<ReportAction>({
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ASSIGN_COMPANY_CARD,
                reportActionID: String(thread.parentReportActionID),
                message: [],
                created: '',
                lastModified: '',
                actorAccountID: 1,
                person: [],
                originalMessage: {
                    email: 'user@example.com',
                    feedName: 'US Bank',
                    cardLastFour: '1234',
                },
            });

            const parentId = String(thread.parentReportID);
            const actionId = String(thread.parentReportActionID);
            const reportActionsCollection: Record<string, ReportActions> = {
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentId}`]: {[actionId]: parentAction},
            };

            const name = computeReportName(
                thread,
                emptyCollections.reports,
                emptyCollections.policies,
                undefined,
                undefined,
                participantsPersonalDetails,
                reportActionsCollection,
                currentUserAccountID,
            );
            expect(name).toBe('assigned user@example.com "US Bank" company card ending in 1234');
        });

        test('UNASSIGN_COMPANY_CARD parent action', () => {
            const thread: Report = createWorkspaceThread(104);
            const parentAction = createMock<ReportAction>({
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UNASSIGN_COMPANY_CARD,
                reportActionID: String(thread.parentReportActionID),
                message: [],
                created: '',
                lastModified: '',
                actorAccountID: 1,
                person: [],
                originalMessage: {
                    email: 'user@example.com',
                    feedName: 'US Bank',
                    cardLastFour: '5678',
                },
            });

            const parentId = String(thread.parentReportID);
            const actionId = String(thread.parentReportActionID);
            const reportActionsCollection: Record<string, ReportActions> = {
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentId}`]: {[actionId]: parentAction},
            };

            const name = computeReportName(
                thread,
                emptyCollections.reports,
                emptyCollections.policies,
                undefined,
                undefined,
                participantsPersonalDetails,
                reportActionsCollection,
                currentUserAccountID,
            );
            expect(name).toBe('unassigned user@example.com "US Bank" company card ending in 5678');
        });

        test('UPDATE_CARD_FEED_LIABILITY parent action with ALLOW type', () => {
            const thread: Report = createWorkspaceThread(105);
            const parentAction = createMock<ReportAction>({
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CARD_FEED_LIABILITY,
                reportActionID: String(thread.parentReportActionID),
                message: [],
                created: '',
                lastModified: '',
                actorAccountID: 1,
                person: [],
                originalMessage: {
                    feedName: 'Visa Commercial',
                    liabilityType: CONST.TRANSACTION.LIABILITY_TYPE.ALLOW,
                },
            });

            const parentId = String(thread.parentReportID);
            const actionId = String(thread.parentReportActionID);
            const reportActionsCollection: Record<string, ReportActions> = {
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentId}`]: {[actionId]: parentAction},
            };

            const name = computeReportName(
                thread,
                emptyCollections.reports,
                emptyCollections.policies,
                undefined,
                undefined,
                participantsPersonalDetails,
                reportActionsCollection,
                currentUserAccountID,
            );
            expect(name).toBe('enabled cardholders to delete card transactions for card feed "Visa Commercial"');
        });

        test('UPDATE_CARD_FEED_STATEMENT_PERIOD parent action with numeric days', () => {
            const thread: Report = createWorkspaceThread(106);
            const parentAction = createMock<ReportAction>({
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CARD_FEED_STATEMENT_PERIOD,
                reportActionID: String(thread.parentReportActionID),
                message: [],
                created: '',
                lastModified: '',
                actorAccountID: 1,
                person: [],
                originalMessage: {
                    feedName: 'Visa Commercial',
                    statementPeriodEndDay: '15',
                    previousStatementPeriodEndDay: '20',
                },
            });

            const parentId = String(thread.parentReportID);
            const actionId = String(thread.parentReportActionID);
            const reportActionsCollection: Record<string, ReportActions> = {
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentId}`]: {[actionId]: parentAction},
            };

            const name = computeReportName(
                thread,
                emptyCollections.reports,
                emptyCollections.policies,
                undefined,
                undefined,
                participantsPersonalDetails,
                reportActionsCollection,
                currentUserAccountID,
            );
            expect(name).toBe('changed card feed "Visa Commercial" statement period end day to "15" (previously "20")');
        });

        test('UPDATE_MCC_GROUP_CATEGORY parent action renders the friendly MCC group label', () => {
            const thread: Report = createWorkspaceThread(75);
            const parentAction = createMock<ReportAction>({
                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_MCC_GROUP_CATEGORY,
                reportActionID: String(thread.parentReportActionID),
                message: [],
                created: '',
                lastModified: '',
                actorAccountID: 1,
                person: [],
                originalMessage: {
                    mccGroupName: 'Airlines',
                    oldCategory: 'Insurance',
                    newCategory: 'Travel',
                },
            });

            const parentId = String(thread.parentReportID);
            const actionId = String(thread.parentReportActionID);
            const reportActionsCollection: Record<string, ReportActions> = {
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentId}`]: {
                    [actionId]: parentAction,
                },
            };

            const name = computeReportName(
                thread,
                emptyCollections.reports,
                emptyCollections.policies,
                undefined,
                undefined,
                participantsPersonalDetails,
                reportActionsCollection,
                currentUserAccountID,
            );
            expect(name).toBe('changed the default spend category for "Airlines" to "Travel" (previously "Insurance")');
        });
    });

    describe('deprecatedGetReportName (resolves the name out of the attributes Record)', () => {
        test('Returns derived value when provided', () => {
            const report: Report = {
                ...createPolicyExpenseChat(60, true),
                reportID: '60',
                ownerAccountID: 1,
            };

            const derived: ReportAttributesDerivedValue['reports'] = {
                [report.reportID]: {
                    reportName: "Ragnar Lothbrok's expenses",
                    isEmpty: false,
                    brickRoadStatus: undefined,
                    requiresAttention: false,
                    reportErrors: {},
                },
            };

            expect(getReportName(report, derived[report.reportID]?.reportName)).toBe("Ragnar Lothbrok's expenses");
        });

        test('Falls back to report.reportName when derived missing', () => {
            const report: Report = {
                ...createRegularChat(61, [currentUserAccountID, 1]),
                reportID: '61',
                reportName: 'Custom Report Name',
                ownerAccountID: currentUserAccountID,
            };

            expect(getReportName(report, undefined)).toBe('Custom Report Name');
        });

        test('Returns empty string when neither present', () => {
            const report: Report = {
                ...createRegularChat(62, [currentUserAccountID, 1]),
                reportID: '62',
                ownerAccountID: currentUserAccountID,
                reportName: undefined,
            };

            expect(getReportName(report, undefined)).toBe('');
        });
    });

    describe('getReportName (derived name vs fallback)', () => {
        test('Returns the derived name when provided', () => {
            const report: Report = {
                ...createPolicyExpenseChat(70, true),
                reportID: '70',
                reportName: 'Raw Report Name',
                ownerAccountID: 1,
            };

            expect(getReportName(report, "Ragnar Lothbrok's expenses")).toBe("Ragnar Lothbrok's expenses");
        });

        test('Falls back to report.reportName when no derived name is passed', () => {
            const report: Report = {
                ...createRegularChat(71, [currentUserAccountID, 1]),
                reportID: '71',
                reportName: 'Custom Report Name',
                ownerAccountID: currentUserAccountID,
            };

            expect(getReportName(report)).toBe('Custom Report Name');
            expect(getReportName(report, undefined)).toBe('Custom Report Name');
        });

        test('Returns empty string when neither the derived name nor report.reportName is present', () => {
            const report: Report = {
                ...createRegularChat(72, [currentUserAccountID, 1]),
                reportID: '72',
                ownerAccountID: currentUserAccountID,
                reportName: undefined,
            };

            expect(getReportName(report)).toBe('');
        });

        test('Returns empty string when the report is missing or has no reportID', () => {
            const reportWithoutID: Report = {
                ...createRegularChat(74, [currentUserAccountID, 1]),
                reportID: '',
                reportName: 'Custom Report Name',
                ownerAccountID: currentUserAccountID,
            };

            expect(getReportName(undefined, 'Derived Name')).toBe('');
            // reportID is the lookup key, so a report without one has no name even if it carries a reportName
            expect(getReportName(reportWithoutID, 'Derived Name')).toBe('');
        });

        test('Keeps an empty derived name rather than falling back to report.reportName', () => {
            const report: Report = {
                ...createRegularChat(73, [currentUserAccountID, 1]),
                reportID: '73',
                reportName: 'Custom Report Name',
                ownerAccountID: currentUserAccountID,
            };

            // `??` only falls through on null/undefined, so a derived empty name wins. This mirrors the
            // pre-migration behavior of indexing the attributes Record inline.
            expect(getReportName(report, '')).toBe('');
        });
    });

    describe('computeReportName - reportNameValuePairs archiving', () => {
        test('Regular chat gets archived suffix from reportNameValuePairs', async () => {
            const report: Report = {
                ...createRegularChat(70, [currentUserAccountID, 1]),
                ownerAccountID: currentUserAccountID,
                reportName: undefined,
            };
            const reportNameValuePairs = {
                [`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report.reportID}`]: {private_isArchived: 'true'},
            } satisfies Record<string, ReportNameValuePairs>;

            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, participantsPersonalDetails);
            const name = computeReportName(
                report,
                emptyCollections.reports,
                emptyCollections.policies,
                undefined,
                reportNameValuePairs,
                participantsPersonalDetails,
                emptyCollections.reportActions,
                currentUserAccountID,
            );
            expect(name).toBe('Ragnar Lothbrok (archived) ');
        });
    });

    describe('buildReportNameFromParticipantNames', () => {
        test('Excludes current user and uses short names for multiple participants', () => {
            const report = createMock<Report>({
                ...createRegularChat(1000, [currentUserAccountID, 1, 2]),
            });

            const name = buildReportNameFromParticipantNames({report, personalDetailsList: participantsPersonalDetails, currentUserAccountID, translate: translateLocal});
            expect(name).toBe('Ragnar, floki@vikings.net');
        });

        test('Uses full name when only one participant remains after filtering current user', () => {
            const report = createMock<Report>({
                ...createRegularChat(1001, [currentUserAccountID, 1]),
            });

            const name = buildReportNameFromParticipantNames({report, personalDetailsList: participantsPersonalDetails, currentUserAccountID, translate: translateLocal});
            expect(name).toBe('Ragnar Lothbrok');
        });

        test('resolves a hidden participant name through the provided translate function', () => {
            const hiddenAccountID = 987654;
            const report = {...createRegularChat(1002, [currentUserAccountID, hiddenAccountID])};
            // The lone remaining participant has empty personal details, so its name resolves via translate('common.hidden').
            const translateWithHiddenMarker: LocalizedTranslate = (path, ...parameters) => (path === 'common.hidden' ? 'HiddenMarker' : translateLocal(path, ...parameters));

            const name = buildReportNameFromParticipantNames({
                report,
                personalDetailsList: {[hiddenAccountID]: {accountID: hiddenAccountID, login: '', displayName: ''}},
                currentUserAccountID,
                translate: translateWithHiddenMarker,
            });
            expect(name).toBe('HiddenMarker');
        });
    });

    describe('Invoice naming helpers', () => {
        test('Invoice room uses policy name when current user is receiver', () => {
            const receiverPolicy = createMock<Policy>({name: 'Personal Workspace'});
            const report: Report = {
                reportID: 'invoice-chat-1',
                invoiceReceiver: {type: CONST.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL, accountID: currentUserAccountID},
                policyName: 'Personal Workspace',
            };

            const name = getInvoicesChatName({
                report,
                receiverPolicy,
                personalDetails: participantsPersonalDetails,
                policy: undefined,
                currentUserAccountID,
                translate: translateLocal,
            });

            expect(name).toBe('Personal Workspace');
        });

        test('Invoice room displays receiver name for other individuals', () => {
            const receiverPolicy = createMock<Policy>({name: 'Vendor Workspace'});
            const report: Report = {
                reportID: 'invoice-chat-2',
                invoiceReceiver: {type: CONST.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL, accountID: 1},
                policyName: 'Vendor Workspace',
            };

            const name = getInvoicesChatName({
                report,
                receiverPolicy,
                personalDetails: participantsPersonalDetails,
                policy: undefined,
                currentUserAccountID,
                translate: translateLocal,
            });

            const normalizedName = name?.replaceAll('\u00A0', ' ');
            expect(normalizedName).toBe('Ragnar Lothbrok');
        });

        test('Invoice payer name resolves the receiver from the passed personal detail', () => {
            const report: Report = {
                reportID: 'invoice-chat-3',
                invoiceReceiver: {type: CONST.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL, accountID: 1},
            };
            const name = getInvoicePayerName(report, translateLocal, participantsPersonalDetails['1']);

            const normalizedName = name?.replaceAll('\u00A0', ' ');
            expect(normalizedName).toBe('Ragnar Lothbrok');
        });

        test('Invoice room resolves the hidden fallback through the provided translate function', () => {
            const translateWithHiddenMarker: LocalizedTranslate = (path, ...parameters) => (path === 'common.hidden' ? 'HiddenMarker' : translateLocal(path, ...parameters));
            const report: Report = {
                reportID: 'invoice-chat-4',
                invoiceReceiver: {type: CONST.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL, accountID: 424242},
            };

            const name = getInvoicesChatName({
                report,
                receiverPolicy: undefined,
                personalDetails: {},
                policy: undefined,
                currentUserAccountID,
                translate: translateWithHiddenMarker,
            });

            expect(name).toBe('HiddenMarker');
        });

        test('Invoice payer name resolves the hidden fallback through the provided translate function', () => {
            const translateWithHiddenMarker: LocalizedTranslate = (path, ...parameters) => (path === 'common.hidden' ? 'HiddenMarker' : translateLocal(path, ...parameters));
            const report: Report = {
                reportID: 'invoice-chat-5',
                invoiceReceiver: {type: CONST.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL, accountID: 424242},
            };

            const name = getInvoicePayerName(report, translateWithHiddenMarker, null);

            expect(name).toBe('HiddenMarker');
        });

        test('Invoice room (current user receiver) resolves the workspace-unavailable fallback through the provided translate function', () => {
            const translateWithUnavailableMarker: LocalizedTranslate = (path, ...parameters) =>
                path === 'workspace.common.unavailable' ? 'UnavailableMarker' : translateLocal(path, ...parameters);
            const report: Report = {
                reportID: 'invoice-chat-6',
                // Current user is the receiver but the policy cannot be resolved, so the name falls back to the unavailable label.
                invoiceReceiver: {type: CONST.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL, accountID: currentUserAccountID},
            };

            const name = getInvoicesChatName({
                report,
                receiverPolicy: undefined,
                personalDetails: {},
                policy: undefined,
                currentUserAccountID,
                translate: translateWithUnavailableMarker,
            });

            expect(name).toBe('UnavailableMarker');
        });

        test('Invoice room (business receiver) resolves the workspace-unavailable fallback through the provided translate function', () => {
            const translateWithUnavailableMarker: LocalizedTranslate = (path, ...parameters) =>
                path === 'workspace.common.unavailable' ? 'UnavailableMarker' : translateLocal(path, ...parameters);
            const report: Report = {
                reportID: 'invoice-chat-7',
                // Business receiver with no resolvable receiver policy falls back to the unavailable label.
                invoiceReceiver: {type: CONST.REPORT.INVOICE_RECEIVER_TYPE.BUSINESS, policyID: 'missing-policy'},
            };

            const name = getInvoicesChatName({
                report,
                receiverPolicy: undefined,
                personalDetails: {},
                policy: undefined,
                currentUserAccountID,
                translate: translateWithUnavailableMarker,
            });

            expect(name).toBe('UnavailableMarker');
        });

        test('Invoice payer name resolves the workspace-unavailable fallback through the provided translate function', () => {
            const translateWithUnavailableMarker: LocalizedTranslate = (path, ...parameters) =>
                path === 'workspace.common.unavailable' ? 'UnavailableMarker' : translateLocal(path, ...parameters);
            const report: Report = {
                reportID: 'invoice-chat-8',
                // Business receiver with no resolvable policy falls back to the unavailable label.
                invoiceReceiver: {type: CONST.REPORT.INVOICE_RECEIVER_TYPE.BUSINESS, policyID: 'missing-policy'},
            };

            const name = getInvoicePayerName(report, translateWithUnavailableMarker, null);

            expect(name).toBe('UnavailableMarker');
        });
    });

    describe('getPolicyExpenseChatName', () => {
        it("returns owner's display name when available", () => {
            const report = createMock<Report>({
                ownerAccountID: 1,
                reportName: 'Fallback Report Name',
            });

            const name = getPolicyExpenseChatName({report, personalDetailsList: participantsPersonalDetails, translate: translateLocal});
            expect(name).toBe(translate(CONST.LOCALES.EN, 'workspace.common.policyExpenseChatName', 'Ragnar Lothbrok'));
        });

        it('falls back to owner login when display name not present', () => {
            const report = createMock<Report>({
                ownerAccountID: 2,
                reportName: 'Fallback Report Name',
            });

            const name = getPolicyExpenseChatName({report, personalDetailsList: participantsPersonalDetails, translate: translateLocal});
            expect(name).toBe(translate(CONST.LOCALES.EN, 'workspace.common.policyExpenseChatName', 'floki'));
        });

        it('returns report name when no personal details or owner', () => {
            const report = createMock<Report>({
                ownerAccountID: undefined,
                reportName: 'Fallback Report Name',
            });

            const name = getPolicyExpenseChatName({report, personalDetailsList: {}, translate: translateLocal});
            expect(name).toBe('Fallback Report Name');
        });

        it('builds the policy expense chat name through the provided translate function', () => {
            const report = createMock<Report>({ownerAccountID: 1, reportName: 'Fallback Report Name'});
            // The workspace.common.policyExpenseChatName label is produced by the provided translate function.
            const translateWithMarker: LocalizedTranslate = (path, ...parameters) =>
                path === 'workspace.common.policyExpenseChatName' ? `PolicyMarker:${String(parameters.at(0))}` : translateLocal(path, ...parameters);

            const name = getPolicyExpenseChatName({report, personalDetailsList: participantsPersonalDetails, translate: translateWithMarker});
            expect(name).toBe('PolicyMarker:Ragnar Lothbrok');
        });
    });

    describe('getGroupChatName', () => {
        afterEach(() => Onyx.clear());

        const fourParticipants = [
            {accountID: 1, login: 'email1@test.com'},
            {accountID: 2, login: 'email2@test.com'},
            {accountID: 3, login: 'email3@test.com'},
            {accountID: 4, login: 'email4@test.com'},
        ];

        const eightParticipants = [
            {accountID: 1, login: 'email1@test.com'},
            {accountID: 2, login: 'email2@test.com'},
            {accountID: 3, login: 'email3@test.com'},
            {accountID: 4, login: 'email4@test.com'},
            {accountID: 5, login: 'email5@test.com'},
            {accountID: 6, login: 'email6@test.com'},
            {accountID: 7, login: 'email7@test.com'},
            {accountID: 8, login: 'email8@test.com'},
        ];

        describe('When participantAccountIDs is passed to getGroupChatName', () => {
            it('shows all participants when count <= 5 and shouldApplyLimit is false', async () => {
                await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, fakePersonalDetails);
                expect(getGroupChatName(formatPhoneNumber, translateLocal, fourParticipants)).toEqual('Four, One, Three, Two');
            });

            it('shows all participants when count <= 5 and shouldApplyLimit is true', async () => {
                await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, fakePersonalDetails);
                expect(getGroupChatName(formatPhoneNumber, translateLocal, fourParticipants, true)).toEqual('Four, One, Three, Two');
            });

            it('shows 5 participants with ellipsis when count > 5 and shouldApplyLimit is true', async () => {
                await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, fakePersonalDetails);
                expect(getGroupChatName(formatPhoneNumber, translateLocal, eightParticipants, true)).toEqual('Five, Four, One, Three, Two...');
            });

            it('shows all participants when count > 5 and shouldApplyLimit is false', async () => {
                await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, fakePersonalDetails);
                expect(getGroupChatName(formatPhoneNumber, translateLocal, eightParticipants, false)).toEqual('Eight, Five, Four, One, Seven, Six, Three, Two');
            });

            it('uses correct display names for participants', async () => {
                await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, participantsPersonalDetails);
                expect(getGroupChatName(formatPhoneNumber, translateLocal, fourParticipants, true)).toEqual('(833) 240-3627, floki@vikings.net, Lagertha, Ragnar');
            });
        });

        describe('When participantAccountIDs is not passed and report is provided', () => {
            it('uses report name when available (no limit)', async () => {
                const report: Report = {
                    ...createRegularChat(1, [1, 2, 3, 4]),
                    chatType: CONST.REPORT.CHAT_TYPE.GROUP,
                    reportName: "Let's talk",
                };
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);
                await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, fakePersonalDetails);
                expect(getGroupChatName(formatPhoneNumber, translateLocal, undefined, false, report)).toEqual("Let's talk");
            });

            it('uses report name when available (limit true)', async () => {
                const report: Report = {
                    ...createRegularChat(1, [1, 2, 3, 4]),
                    chatType: CONST.REPORT.CHAT_TYPE.GROUP,
                    reportName: "Let's talk",
                };
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);
                await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, fakePersonalDetails);
                expect(getGroupChatName(formatPhoneNumber, translateLocal, undefined, true, report)).toEqual("Let's talk");
            });

            it('uses report name when >5 participants and limit true', async () => {
                const report: Report = {
                    ...createRegularChat(1, [1, 2, 3, 4, 5, 6, 7, 8]),
                    chatType: CONST.REPORT.CHAT_TYPE.GROUP,
                    reportName: "Let's talk",
                };
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);
                await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, fakePersonalDetails);
                expect(getGroupChatName(formatPhoneNumber, translateLocal, undefined, true, report)).toEqual("Let's talk");
            });

            it('uses report name when >5 participants and limit false', async () => {
                const report: Report = {
                    ...createRegularChat(1, [1, 2, 3, 4, 5, 6, 7, 8]),
                    chatType: CONST.REPORT.CHAT_TYPE.GROUP,
                    reportName: "Let's talk",
                };
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);
                await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, fakePersonalDetails);
                expect(getGroupChatName(formatPhoneNumber, translateLocal, undefined, false, report)).toEqual("Let's talk");
            });

            it('falls back to participant names when report name is empty', async () => {
                const report: Report = {
                    ...createRegularChat(1, [1, 2, 3, 4, 5, 6, 7, 8]),
                    chatType: CONST.REPORT.CHAT_TYPE.GROUP,
                    reportName: '',
                };
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);
                await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, fakePersonalDetails);
                expect(getGroupChatName(formatPhoneNumber, translateLocal, undefined, false, report)).toEqual('Eight, Five, Four, One, Seven, Six, Three, Two');
            });

            it('excludes participants whose accountIDs are in pendingDeleteMemberAccountIDs', async () => {
                const report: Report = {
                    ...createRegularChat(1, [1, 2, 3, 4]),
                    chatType: CONST.REPORT.CHAT_TYPE.GROUP,
                    reportName: '',
                };
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);
                await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, fakePersonalDetails);

                expect(getGroupChatName(formatPhoneNumber, translateLocal, undefined, false, report, ['2', '4'])).toEqual('One, Three');
            });

            it('includes all participants when pendingDeleteMemberAccountIDs is empty', async () => {
                const report: Report = {
                    ...createRegularChat(1, [1, 2, 3, 4]),
                    chatType: CONST.REPORT.CHAT_TYPE.GROUP,
                    reportName: '',
                };
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);
                await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, fakePersonalDetails);

                expect(getGroupChatName(formatPhoneNumber, translateLocal, undefined, false, report, [])).toEqual('Four, One, Three, Two');
            });

            it('uses passed pendingDeleteMemberAccountIDs instead of falling back to report metadata', async () => {
                const report: Report = {
                    ...createRegularChat(1, [1, 2, 3, 4]),
                    chatType: CONST.REPORT.CHAT_TYPE.GROUP,
                    reportName: '',
                };
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);
                await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, fakePersonalDetails);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${report.reportID}`, {
                    pendingChatMembers: [{accountID: '1', pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}],
                });

                expect(getGroupChatName(formatPhoneNumber, translateLocal, undefined, false, report, ['3'])).toEqual('Four, One, Two');
            });
        });

        it('builds the single-participant default name through the provided translate function', async () => {
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, fakePersonalDetails);
            // A single participant produces the groupChat.defaultReportName label from the provided translate function.
            const translateWithMarker: LocalizedTranslate = (path, ...parameters) =>
                path === 'groupChat.defaultReportName' ? `GroupMarker:${String(parameters.at(0))}` : translateLocal(path, ...parameters);

            const name = getGroupChatName(formatPhoneNumber, translateWithMarker, [{accountID: 1, login: 'ragnar@vikings.net'}]);
            expect(name).toContain('GroupMarker:');
        });
    });

    describe('getMoneyRequestReportName', () => {
        it('resolves the payer name through the provided translate function for an IOU report', async () => {
            const hiddenManagerAccountID = 780060;
            // The manager has no displayName/login, so the payer name resolves to the hidden label provided by translate.
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {[hiddenManagerAccountID]: {accountID: hiddenManagerAccountID, login: '', displayName: ''}});
            await waitForBatchedUpdates();
            const iouReport: Report = {
                reportID: '780061',
                type: CONST.REPORT.TYPE.IOU,
                managerID: hiddenManagerAccountID,
                ownerAccountID: currentUserAccountID,
                total: 0,
                currency: 'USD',
            };
            const translateWithHiddenMarker: LocalizedTranslate = (path, ...parameters) => (path === 'common.hidden' ? 'HiddenMarker' : translateLocal(path, ...parameters));

            const reportName = getMoneyRequestReportName({
                report: iouReport,
                translate: translateWithHiddenMarker,
                personalDetailsList: undefined,
                linkedTransactions: [],
            });
            expect(reportName).toContain('HiddenMarker');
        });

        it('resolves the invoice payer name from the provided personal details list', async () => {
            const chatReportID = '990001';
            // The chat report's invoice receiver is an individual (accountID 1 = "Ragnar Lothbrok" in the list).
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`, {
                reportID: chatReportID,
                chatType: CONST.REPORT.CHAT_TYPE.INVOICE,
                invoiceReceiver: {type: CONST.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL, accountID: 1},
            });
            await waitForBatchedUpdates();

            const invoiceReport: Report = {
                reportID: '990002',
                type: CONST.REPORT.TYPE.INVOICE,
                chatReportID,
                ownerAccountID: currentUserAccountID,
                total: 100,
                currency: 'USD',
            };

            const reportName = getMoneyRequestReportName({report: invoiceReport, personalDetailsList: participantsPersonalDetails, linkedTransactions: [], translate: translateLocal});
            expect(reportName?.replaceAll(/\s+/g, ' ')).toContain('Ragnar Lothbrok');
        });

        it('should return "New Report" when reportName is empty string, report is expense report, and policy has empty fieldList', () => {
            // Given an expense report with empty reportName
            const expenseReport: Report = {
                ...createExpenseReport(200),
                reportID: '200',
                reportName: '',
                policyID: '200',
                type: CONST.REPORT.TYPE.EXPENSE,
                total: 0,
                currency: 'USD',
            };

            // And a policy with empty fieldList
            const policyWithEmptyFieldList: Policy = {
                ...createRandomPolicy(200, CONST.POLICY.TYPE.TEAM),
                id: '200',
                fieldList: {},
            };

            // When we get the money request report name
            const reportName = getMoneyRequestReportName({
                report: expenseReport,
                policy: policyWithEmptyFieldList,
                personalDetailsList: undefined,
                linkedTransactions: [],
                translate: translateLocal,
            });

            // Then it should return "New Report"
            expect(reportName).toBe(CONST.REPORT.DEFAULT_EXPENSE_REPORT_NAME);
        });

        it('should not return empty string for expense report with empty reportName when policy has a normal fieldList', () => {
            // Given an expense report with empty reportName
            const expenseReport: Report = {
                ...createExpenseReport(201),
                reportID: '201',
                reportName: '',
                policyID: '201',
                type: CONST.REPORT.TYPE.EXPENSE,
                total: 0,
                currency: 'USD',
            };

            // And a policy with a normal (non-empty) fieldList
            const policyWithFieldList: Policy = {
                ...createRandomPolicy(201, CONST.POLICY.TYPE.TEAM),
                id: '201',
                fieldList: {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    text_title: {
                        defaultValue: '{report:type} {report:startdate}',
                        deletable: false,
                        externalIDs: [],
                        fieldID: 'text_title',
                        isTax: false,
                        name: 'title',
                        orderWeight: 0,
                        type: 'formula',
                        target: 'expense',
                        values: [],
                        disabledOptions: [],
                        keys: [],
                    },
                },
            };

            // When we get the money request report name
            const reportName = getMoneyRequestReportName({
                report: expenseReport,
                policy: policyWithFieldList,
                personalDetailsList: undefined,
                linkedTransactions: [],
                translate: translateLocal,
            });

            // Then it should NOT return empty string — it should fall through to dynamic name computation
            expect(reportName).not.toBe('');
        });

        it('returns the "spent" message when the report has non-reimbursable transactions and is not settled', async () => {
            // Earlier tests in this file overwrite ONYXKEYS.PERSONAL_DETAILS_LIST, so restore it here to keep this test order-independent
            await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, participantsPersonalDetails);
            await waitForBatchedUpdates();

            // Given an unsettled expense report owned by Ragnar (accountID 1) with a non-empty fieldList
            const expenseReport: Report = {
                ...createExpenseReport(202),
                reportID: '202',
                reportName: '',
                policyID: '202',
                type: CONST.REPORT.TYPE.EXPENSE,
                total: -2500,
                currency: 'USD',
                ownerAccountID: 1,
                isWaitingOnBankAccount: false,
                stateNum: undefined,
                statusNum: undefined,
            };

            const policyWithFieldList: Policy = {
                ...createRandomPolicy(202, CONST.POLICY.TYPE.TEAM),
                id: '202',
                fieldList: {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    text_title: {
                        defaultValue: '{report:type} {report:startdate}',
                        deletable: false,
                        externalIDs: [],
                        fieldID: 'text_title',
                        isTax: false,
                        name: 'title',
                        orderWeight: 0,
                        type: 'formula',
                        target: 'expense',
                        values: [],
                        disabledOptions: [],
                        keys: [],
                    },
                },
            };

            // And a linked transaction that is marked non-reimbursable
            const nonReimbursableTransaction: Transaction = {
                ...createRandomTransaction(2),
                reportID: '202',
                reimbursable: false,
            };

            // When we get the money request report name
            const reportName = getMoneyRequestReportName({
                report: expenseReport,
                policy: policyWithFieldList,
                personalDetailsList: undefined,
                linkedTransactions: [nonReimbursableTransaction],
                translate: translateLocal,
            });

            // Then it should use the "spent" wording with the owner's display name
            expect(reportName).toBe('Ragnar Lothbrok spent $25.00');
        });

        it('resolves the expense report workspace name through the provided translate function', () => {
            // Given an OPEN expense report whose policy cannot resolve a name (empty policy name)
            const expenseReport: Report = {
                ...createExpenseReport(203),
                reportID: '203',
                reportName: '',
                policyName: '',
                oldPolicyName: '',
                policyID: '203',
                type: CONST.REPORT.TYPE.EXPENSE,
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                total: 0,
                currency: 'USD',
            };

            // And a policy with a non-empty fieldList (so we skip the "New Report" shortcut) but no resolvable name
            const policyWithoutName: Policy = {
                ...createRandomPolicy(203, CONST.POLICY.TYPE.TEAM),
                id: '203',
                name: '',
                fieldList: {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    text_title: {
                        defaultValue: '{report:type} {report:startdate}',
                        deletable: false,
                        externalIDs: [],
                        fieldID: 'text_title',
                        isTax: false,
                        name: 'title',
                        orderWeight: 0,
                        type: 'formula',
                        target: 'expense',
                        values: [],
                        disabledOptions: [],
                        keys: [],
                    },
                },
            };

            // A translate that tags the "unavailable" workspace copy so we can prove getPolicyName used the provided translate
            const translateWithUnavailableMarker: LocalizedTranslate = (path, ...parameters) =>
                path === 'workspace.common.unavailable' ? 'UnavailableWorkspaceMarker' : translateLocal(path, ...parameters);

            const reportName = getMoneyRequestReportName({
                report: expenseReport,
                policy: policyWithoutName,
                personalDetailsList: undefined,
                linkedTransactions: [],
                translate: translateWithUnavailableMarker,
            });

            expect(reportName).toContain('UnavailableWorkspaceMarker');
        });
    });

    describe('computeReportName - Transaction thread with linkedTransaction', () => {
        test('returns formatted expense name for transaction thread', () => {
            const transactionID = '999';
            const parentReportID = '100';
            const parentReportActionID = '200';
            const expenseReportID = '300';

            const thread: Report = {
                ...createWorkspaceThread(60),
                parentReportID,
                parentReportActionID,
            };

            const parentAction = createMock<ReportAction>({
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                reportActionID: parentReportActionID,
                message: [{type: 'TEXT', text: 'test'}],
                created: '2024-01-01 00:00:00',
                lastModified: '',
                actorAccountID: 1,
                person: [],
                originalMessage: {
                    type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                    IOUTransactionID: transactionID,
                    IOUReportID: expenseReportID,
                    amount: 2500,
                    currency: CONST.CURRENCY.USD,
                    participantAccountIDs: [1, 2],
                },
            });

            const transaction: Transaction = {
                ...createRandomTransaction(1),
                transactionID,
                reportID: expenseReportID,
                merchant: 'Coffee Shop',
                modifiedMerchant: '',
                amount: -2500,
                currency: CONST.CURRENCY.USD,
                comment: {comment: ''},
            };

            const reportActionsCollection: Record<string, ReportActions> = {
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReportID}`]: {
                    [parentReportActionID]: parentAction,
                },
            };

            const transactionsCollection: Record<string, Transaction> = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`]: transaction,
            };

            const expenseReport: Report = {
                ...createExpenseReport(300),
                reportID: expenseReportID,
                type: CONST.REPORT.TYPE.EXPENSE,
            };

            const reportsCollection: Record<string, Report> = {
                [`${ONYXKEYS.COLLECTION.REPORT}${parentReportID}`]: createRegularChat(100, [1, 2]),
                [`${ONYXKEYS.COLLECTION.REPORT}${expenseReportID}`]: expenseReport,
            };

            const name = computeReportName(
                thread,
                reportsCollection,
                emptyCollections.policies,
                transactionsCollection,
                undefined,
                participantsPersonalDetails,
                reportActionsCollection,
                currentUserAccountID,
            );

            expect(name).toContain('$25.00');
            expect(name).toContain('Coffee Shop');
        });

        test('returns expense fallback when transaction is not in collection', () => {
            const transactionID = '888';
            const parentReportID = '101';
            const parentReportActionID = '201';

            const thread: Report = {
                ...createWorkspaceThread(61),
                parentReportID,
                parentReportActionID,
            };

            const parentAction = createMock<ReportAction>({
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                reportActionID: parentReportActionID,
                message: [{type: 'TEXT', text: 'test'}],
                created: '2024-01-01 00:00:00',
                lastModified: '',
                actorAccountID: 1,
                person: [],
                originalMessage: {
                    type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                    IOUTransactionID: transactionID,
                    IOUReportID: '301',
                    amount: 1000,
                    currency: CONST.CURRENCY.USD,
                    participantAccountIDs: [1, 2],
                },
            });

            const reportActionsCollection: Record<string, ReportActions> = {
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReportID}`]: {
                    [parentReportActionID]: parentAction,
                },
            };

            const name = computeReportName(
                thread,
                emptyCollections.reports,
                emptyCollections.policies,
                {},
                undefined,
                participantsPersonalDetails,
                reportActionsCollection,
                currentUserAccountID,
            );

            expect(name).toBe(translate(CONST.LOCALES.EN, 'iou.expense'));
        });
    });
    describe('concierge chat name', () => {
        it('names the chat Concierge only when the threaded conciergeReportID matches the report', () => {
            const report: Report = {
                ...createRegularChat(1, [currentUserAccountID, 1]),
                reportID: 'concierge-name-1',
            };

            // When the threaded conciergeReportID matches the report
            const nameWithMatchingID = computeReportNameOriginal({
                dateFnsLocale: undefined,
                conciergeReportID: 'concierge-name-1',
                report,
                transactions: undefined,
                currentUserAccountID,
                currentUserLogin,
                translate: translateLocal,
                reportTransactions: {},
                isTrackIntentUser: false,
            });
            expect(nameWithMatchingID).toBe(CONST.CONCIERGE_DISPLAY_NAME);

            // And an identical report with a non-matching conciergeReportID keeps its regular name
            const nameWithDifferentID = computeReportNameOriginal({
                dateFnsLocale: undefined,
                conciergeReportID: 'a-different-report-id',
                report,
                transactions: undefined,
                currentUserAccountID,
                currentUserLogin,
                translate: translateLocal,
                reportTransactions: {},
                isTrackIntentUser: false,
            });
            expect(nameWithDifferentID).not.toBe(CONST.CONCIERGE_DISPLAY_NAME);
        });
    });
});
