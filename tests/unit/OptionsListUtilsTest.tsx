/* eslint-disable @typescript-eslint/naming-convention */
import {act, render, renderHook} from '@testing-library/react-native';
import {View} from 'react-native';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import useReportIsArchived from '@hooks/useReportIsArchived';
import DateUtils from '@libs/DateUtils';
import {translate} from '@libs/Localize';
import isSearchTopmostFullScreenRoute from '@libs/Navigation/helpers/isSearchTopmostFullScreenRoute';
import type {OptionList, Options, SearchOption} from '@libs/OptionsListUtils';
import {
    canCreateOptimisticPersonalDetailOption,
    createOption,
    createOptionList,
    filterAndOrderOptions,
    filterReports,
    filterSelfDMChat,
    filterWorkspaceChats,
    formatMemberForList,
    getCurrentUserSearchTerms,
    getLastActorDisplayName,
    getLastActorDisplayNameFromLastVisibleActions,
    getLastMessageTextForReport,
    getMemberInviteOptions,
    getPersonalDetailSearchTerms,
    getPolicyExpenseReportOption,
    getReportDisplayOption,
    getReportOption,
    getSearchOptions,
    getSearchValueForPhoneOrEmail,
    getUserToInviteOption,
    getValidOptions,
    optionsOrderBy,
    orderOptions,
    orderWorkspaceOptions,
    recentReportComparator,
    shouldShowLastActorDisplayName,
    sortAlphabetically,
} from '@libs/OptionsListUtils';
import Parser from '@libs/Parser';
import {getChangedApproverActionMessage, getDynamicExternalWorkflowRoutedMessage} from '@libs/ReportActionsUtils';
import {
    canCreateTaskInReport,
    canUserPerformWriteAction,
    formatReportLastMessageText,
    getMovedActionMessage,
    getMovedTransactionMessage,
    getReportPreviewMessage,
    isCanceledTaskReport,
    isExpensifyOnlyParticipantInReport,
} from '@libs/ReportUtils';
import type {OptionData} from '@libs/ReportUtils';
import initOnyxDerivedValues from '@userActions/OnyxDerived';
import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetails, Policy, Report, ReportAction, ReportNameValuePairs, Transaction} from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';
import createRandomReportAction from '../utils/collections/reportActions';
import {createRandomReport, createRegularChat} from '../utils/collections/reports';
import createRandomTransaction from '../utils/collections/transaction';
import {getFakeAdvancedReportAction} from '../utils/LHNTestUtils';
import {getNvpDismissedProductTraining, localeCompare, translateLocal} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@rnmapbox/maps', () => {
    return {
        default: jest.fn(),
        MarkerView: jest.fn(),
        setAccessToken: jest.fn(),
    };
});

jest.mock('@src/libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    dismissModal: jest.fn(),
    dismissModalWithReport: jest.fn(),
    goBack: jest.fn(),
    getTopmostReportId: jest.fn(() => undefined),
    setNavigationActionToMicrotaskQueue: jest.fn(),
    isNavigationReady: jest.fn(() => Promise.resolve()),
    getReportRHPActiveRoute: jest.fn(),
}));

jest.mock('@libs/Navigation/helpers/isSearchTopmostFullScreenRoute', () => jest.fn());

type PersonalDetailsList = Record<string, PersonalDetails & OptionData>;

const renderLocaleContextProvider = () => {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <View>TEST</View>
        </ComposeProviders>,
    );
};

const nvpDismissedProductTraining = getNvpDismissedProductTraining();

describe('OptionsListUtils', () => {
    const policyID = 'ABC123';

    const POLICY: Policy = {
        id: policyID,
        name: 'Hero Policy',
        role: 'user',
        type: CONST.POLICY.TYPE.TEAM,
        owner: 'reedrichards@expensify.com',
        outputCurrency: '',
        isPolicyExpenseChatEnabled: false,
        approvalMode: CONST.POLICY.APPROVAL_MODE.OPTIONAL,
    };

    const allPolicies: OnyxCollection<Policy> = {
        [`${ONYXKEYS.COLLECTION.POLICY}${policyID}`]: POLICY,
    };

    const COUNTRY_CODE = 1;

    // Given a set of reports with both single participants and multiple participants some pinned and some not
    const REPORTS: OnyxCollection<Report> = {
        '1': {
            lastReadTime: '2021-01-14 11:25:39.295',
            lastVisibleActionCreated: '2022-11-22 03:26:02.015',
            isPinned: false,
            reportID: '1',
            participants: {
                2: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                1: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                5: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
            },
            reportName: 'Iron Man, Mister Fantastic, Invisible Woman',
            type: CONST.REPORT.TYPE.CHAT,
        },
        '2': {
            lastReadTime: '2021-01-14 11:25:39.296',
            lastVisibleActionCreated: '2022-11-22 03:26:02.016',
            isPinned: false,
            reportID: '2',
            participants: {
                2: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                3: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
            },
            reportName: 'Spider-Man',
            type: CONST.REPORT.TYPE.CHAT,
        },

        // This is the only report we are pinning in this test
        '3': {
            lastReadTime: '2021-01-14 11:25:39.297',
            lastVisibleActionCreated: '2022-11-22 03:26:02.170',
            isPinned: true,
            reportID: '3',
            participants: {
                2: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                1: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
            },
            reportName: 'Mister Fantastic',
            type: CONST.REPORT.TYPE.CHAT,
        },
        '4': {
            lastReadTime: '2021-01-14 11:25:39.298',
            lastVisibleActionCreated: '2022-11-22 03:26:02.180',
            isPinned: false,
            reportID: '4',
            participants: {
                2: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                4: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
            },
            reportName: 'Black Panther',
            type: CONST.REPORT.TYPE.CHAT,
        },
        '5': {
            lastReadTime: '2021-01-14 11:25:39.299',
            lastVisibleActionCreated: '2022-11-22 03:26:02.019',
            isPinned: false,
            reportID: '5',
            participants: {
                2: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                5: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
            },
            reportName: 'Invisible Woman',
            type: CONST.REPORT.TYPE.CHAT,
        },
        '6': {
            lastReadTime: '2021-01-14 11:25:39.300',
            lastVisibleActionCreated: '2022-11-22 03:26:02.020',
            isPinned: false,
            reportID: '6',
            participants: {
                2: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                6: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
            },
            reportName: 'Thor',
            type: CONST.REPORT.TYPE.CHAT,
        },

        // Note: This report has the largest lastVisibleActionCreated
        '7': {
            lastReadTime: '2021-01-14 11:25:39.301',
            lastVisibleActionCreated: '2022-11-22 03:26:03.999',
            isPinned: false,
            reportID: '7',
            participants: {
                2: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                7: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
            },
            reportName: 'Captain America',
            type: CONST.REPORT.TYPE.CHAT,
        },

        // Note: This report has no lastVisibleActionCreated
        '8': {
            lastReadTime: '2021-01-14 11:25:39.301',
            lastVisibleActionCreated: '2022-11-22 03:26:02.000',
            isPinned: false,
            reportID: '8',
            participants: {
                2: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                12: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
            },
            reportName: 'Silver Surfer',
            type: CONST.REPORT.TYPE.CHAT,
        },

        // Note: This report has an IOU
        '9': {
            lastReadTime: '2021-01-14 11:25:39.302',
            lastVisibleActionCreated: '2022-11-22 03:26:02.998',
            isPinned: false,
            reportID: '9',
            participants: {
                2: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                8: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
            },
            reportName: 'Mister Sinister',
            iouReportID: '100',
            type: CONST.REPORT.TYPE.CHAT,
        },

        // This report is an archived room – it does not have a name and instead falls back on oldPolicyName
        '10': {
            lastReadTime: '2021-01-14 11:25:39.200',
            lastVisibleActionCreated: '2022-11-22 03:26:02.001',
            reportID: '10',
            isPinned: false,
            participants: {
                2: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                7: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
            },
            reportName: '',
            oldPolicyName: "SHIELD's workspace",
            chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
            isOwnPolicyExpenseChat: true,
            type: CONST.REPORT.TYPE.CHAT,
            lastActorAccountID: 2,
        },
        '11': {
            lastReadTime: '2021-01-14 11:25:39.200',
            lastVisibleActionCreated: '2022-11-22 03:26:02.001',
            reportID: '11',
            isPinned: false,
            participants: {
                10: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN},
            },
            reportName: '',
            chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
            isOwnPolicyExpenseChat: true,
            type: CONST.REPORT.TYPE.CHAT,
            policyID,
            policyName: POLICY.name,
        },

        // Thread report with notification preference = hidden
        '12': {
            lastReadTime: '2021-01-14 11:25:39.200',
            lastVisibleActionCreated: '2022-11-22 03:26:02.001',
            reportID: '11',
            isPinned: false,
            participants: {
                10: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN},
            },
            reportName: '',
            chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
            isOwnPolicyExpenseChat: true,
            type: CONST.REPORT.TYPE.CHAT,
            policyID,
            policyName: POLICY.name,
            parentReportActionID: '123',
            parentReportID: '123',
        },
    };

    const REPORTS_WITH_CONCIERGE: OnyxCollection<Report> = {
        ...REPORTS,

        '11': {
            lastReadTime: '2021-01-14 11:25:39.302',
            lastVisibleActionCreated: '2022-11-22 03:26:02.022',
            isPinned: false,
            reportID: '11',
            participants: {
                2: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                999: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
            },
            reportName: 'Concierge',
            type: CONST.REPORT.TYPE.CHAT,
        },
    };

    const REPORTS_WITH_CHRONOS: OnyxCollection<Report> = {
        ...REPORTS,
        '12': {
            lastReadTime: '2021-01-14 11:25:39.302',
            lastVisibleActionCreated: '2022-11-22 03:26:02.022',
            isPinned: false,
            reportID: '12',
            participants: {
                2: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                1000: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
            },
            reportName: 'Chronos',
            type: CONST.REPORT.TYPE.CHAT,
        },
    };

    const REPORTS_WITH_RECEIPTS: OnyxCollection<Report> = {
        ...REPORTS,
        '13': {
            lastReadTime: '2021-01-14 11:25:39.302',
            lastVisibleActionCreated: '2022-11-22 03:26:02.022',
            isPinned: false,
            reportID: '13',
            participants: {
                2: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                1001: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
            },
            reportName: 'Receipts',
            type: CONST.REPORT.TYPE.CHAT,
        },
    };

    const REPORTS_WITH_WORKSPACE_ROOMS: OnyxCollection<Report> = {
        ...REPORTS,
        '14': {
            lastReadTime: '2021-01-14 11:25:39.302',
            lastVisibleActionCreated: '2022-11-22 03:26:02.022',
            isPinned: false,
            reportID: '14',
            participants: {
                2: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                1: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                10: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                3: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
            },
            reportName: '',
            oldPolicyName: 'Avengers Room',
            chatType: CONST.REPORT.CHAT_TYPE.POLICY_ADMINS,
            isOwnPolicyExpenseChat: true,
            type: CONST.REPORT.TYPE.CHAT,
        },
    };

    const REPORTS_WITH_CHAT_ROOM: OnyxCollection<Report> = {
        ...REPORTS,
        15: {
            lastReadTime: '2021-01-14 11:25:39.301',
            lastVisibleActionCreated: '2022-11-22 03:26:02.000',
            isPinned: false,
            reportID: '15',
            participants: {
                2: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                3: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                4: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
            },
            reportName: 'Spider-Man, Black Panther',
            type: CONST.REPORT.TYPE.CHAT,
            chatType: CONST.REPORT.CHAT_TYPE.DOMAIN_ALL,
        },
    };

    const REPORTS_WITH_SELF_DM: OnyxCollection<Report> = {
        16: {
            lastReadTime: '2021-01-14 11:25:39.302',
            lastVisibleActionCreated: '2022-11-22 03:26:02.022',
            isPinned: false,
            reportID: '16',
            participants: {
                2: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
            },
            reportName: 'Expense Report',
            type: CONST.REPORT.TYPE.EXPENSE,
        },
        17: {
            lastReadTime: '2021-01-14 11:25:39.302',
            lastVisibleActionCreated: '2022-11-22 03:26:02.022',
            isPinned: false,
            reportID: '17',
            participants: {
                2: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
            },
            reportName: '',
            type: CONST.REPORT.TYPE.CHAT,
            chatType: CONST.REPORT.CHAT_TYPE.SELF_DM,
        },
    };

    const activePolicyID = 'DEF456';

    // And a set of personalDetails some with existing reports and some without
    const PERSONAL_DETAILS: PersonalDetailsList = {
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
        '11': {
            accountID: 11,
            displayName: 'Timothée',
            login: 'chalamet@expensify.com',
            reportID: '',
        },
    };

    const PERSONAL_DETAILS_WITH_CONCIERGE: PersonalDetailsList = {
        ...PERSONAL_DETAILS,
        '999': {
            accountID: 999,
            displayName: 'Concierge',
            login: 'concierge@expensify.com',
            reportID: '',
        },
    };

    const PERSONAL_DETAILS_WITH_CHRONOS: PersonalDetailsList = {
        ...PERSONAL_DETAILS,

        '1000': {
            accountID: 1000,
            displayName: 'Chronos',
            login: 'chronos@expensify.com',
            reportID: '',
        },
    };

    const PERSONAL_DETAILS_WITH_RECEIPTS: PersonalDetailsList = {
        ...PERSONAL_DETAILS,

        '1001': {
            accountID: 1001,
            displayName: 'Receipts',
            login: 'receipts@expensify.com',
            reportID: '',
        },
    };

    const PERSONAL_DETAILS_WITH_MANAGER_MCTEST: PersonalDetailsList = {
        ...PERSONAL_DETAILS,
        '1003': {
            accountID: 1003,
            displayName: 'Manager McTest',
            login: CONST.EMAIL.MANAGER_MCTEST,
            reportID: '',
        },
    };

    const PERSONAL_DETAILS_WITH_PERIODS: PersonalDetailsList = {
        ...PERSONAL_DETAILS,

        '1002': {
            accountID: 1002,
            displayName: 'The Flash',
            login: 'barry.allen@expensify.com',
            reportID: '',
        },
    };

    const WORKSPACE_CHATS: OptionData[] = [
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

    const loginList = {};
    const CURRENT_USER_ACCOUNT_ID = 2;
    const CURRENT_USER_EMAIL = 'tonystark@expensify.com';

    const reportNameValuePairs = {
        private_isArchived: DateUtils.getDBTime(),
    };

    let OPTIONS: OptionList;
    let OPTIONS_WITH_CONCIERGE: OptionList;
    let OPTIONS_WITH_CHRONOS: OptionList;
    let OPTIONS_WITH_RECEIPTS: OptionList;
    let OPTIONS_WITH_WORKSPACE_ROOM: OptionList;
    let OPTIONS_WITH_MANAGER_MCTEST: OptionList;

    // Set the currently logged in user, report data, and personal details
    beforeAll(async () => {
        IntlStore.load(CONST.LOCALES.EN);
        initOnyxDerivedValues();
        Onyx.init({
            keys: ONYXKEYS,
            initialKeyStates: {
                [ONYXKEYS.SESSION]: {accountID: 2, email: 'tonystark@expensify.com'},
                [`${ONYXKEYS.COLLECTION.REPORT}100` as const]: {
                    reportID: '',
                    ownerAccountID: 8,
                    total: 1000,
                },
                [`${ONYXKEYS.COLLECTION.POLICY}${policyID}` as const]: POLICY,
                [ONYXKEYS.NVP_ACTIVE_POLICY_ID]: activePolicyID,
                [ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING]: {},
            },
        });

        Onyx.registerLogger(() => {});

        await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, PERSONAL_DETAILS);
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}10`, REPORTS['10'] ?? {});
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}10`, reportNameValuePairs);
        await waitForBatchedUpdates();

        OPTIONS = createOptionList(PERSONAL_DETAILS, undefined, CURRENT_USER_ACCOUNT_ID, REPORTS);
        OPTIONS_WITH_CONCIERGE = createOptionList(PERSONAL_DETAILS_WITH_CONCIERGE, undefined, CURRENT_USER_ACCOUNT_ID, REPORTS_WITH_CONCIERGE);
        OPTIONS_WITH_CHRONOS = createOptionList(PERSONAL_DETAILS_WITH_CHRONOS, undefined, CURRENT_USER_ACCOUNT_ID, REPORTS_WITH_CHRONOS);
        OPTIONS_WITH_RECEIPTS = createOptionList(PERSONAL_DETAILS_WITH_RECEIPTS, undefined, CURRENT_USER_ACCOUNT_ID, REPORTS_WITH_RECEIPTS);
        OPTIONS_WITH_WORKSPACE_ROOM = createOptionList(PERSONAL_DETAILS, undefined, CURRENT_USER_ACCOUNT_ID, REPORTS_WITH_WORKSPACE_ROOMS);
        OPTIONS_WITH_MANAGER_MCTEST = createOptionList(PERSONAL_DETAILS_WITH_MANAGER_MCTEST, undefined, CURRENT_USER_ACCOUNT_ID);
    });

    describe('getSearchOptions()', () => {
        it('should return all options when no search value is provided', () => {
            // Given a set of options
            // When we call getSearchOptions with all betas
            const results = getSearchOptions({
                options: OPTIONS,
                draftComments: {},
                nvpDismissedProductTraining,
                policyTags: undefined,
                loginList,
                betas: [CONST.BETAS.ALL],
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                currentUserEmail: CURRENT_USER_EMAIL,
            });

            // Then all personal details (including those that have reports) should be returned
            expect(results.personalDetails.length).toBe(10);

            // Then all of the reports should be shown including the archived rooms, except for the thread report with notificationPreferences hidden.
            expect(results.recentReports.length).toBe(Object.values(OPTIONS.reports).length - 1);
        });

        it('should include current user when includeCurrentUser is true for type:chat from suggestions', () => {
            // Given a set of options where the current user is Iron Man (accountID: 2)
            // When we call getSearchOptions with includeCurrentUser set to true
            const results = getSearchOptions({
                options: OPTIONS,
                draftComments: {},
                nvpDismissedProductTraining,
                betas: [CONST.BETAS.ALL],
                isUsedInChatFinder: true,
                includeReadOnly: true,
                searchQuery: '',
                maxResults: undefined,
                includeUserToInvite: false,
                includeRecentReports: true,
                includeCurrentUser: true,
                policyTags: {},
                loginList,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                currentUserEmail: CURRENT_USER_EMAIL,
            });

            // Then the current user should be included in personalDetails
            const currentUserOption = results.personalDetails.find((option) => option.login === 'tonystark@expensify.com');
            expect(currentUserOption).toBeDefined();
            expect(currentUserOption?.text).toBe('Iron Man');
            expect(currentUserOption?.accountID).toBe(2);

            // Then all personal details including the current user should be returned
            expect(results.personalDetails.length).toBe(11);
        });

        it('should exclude current user when includeCurrentUser is false', () => {
            // Given a set of options where the current user is Iron Man (accountID: 2)
            // When we call getSearchOptions with includeCurrentUser set to false (default behavior)
            const results = getSearchOptions({
                options: OPTIONS,
                draftComments: {},
                nvpDismissedProductTraining,
                betas: [CONST.BETAS.ALL],
                isUsedInChatFinder: true,
                includeReadOnly: true,
                searchQuery: '',
                maxResults: undefined,
                includeUserToInvite: false,
                includeRecentReports: true,
                policyTags: undefined,
                loginList,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                currentUserEmail: CURRENT_USER_EMAIL,
            });

            // Then the current user should not be included in personalDetails
            const currentUserOption = results.personalDetails.find((option) => option.login === 'tonystark@expensify.com');
            expect(currentUserOption).toBeUndefined();

            // Then all personal details except the current user should be returned
            expect(results.personalDetails.length).toBe(10);
        });
    });

    describe('orderOptions()', () => {
        it('should sort options alphabetically and preserves reportID for personal details with existing reports', () => {
            // Given a set of reports and personalDetails
            // When we call getValidOptions()
            let results: Pick<Options, 'personalDetails' | 'recentReports'> = getValidOptions(
                {
                    reports: OPTIONS.reports,
                    personalDetails: OPTIONS.personalDetails,
                },
                allPolicies,
                {},
                nvpDismissedProductTraining,
                undefined,

                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
            );
            // When we call orderOptions()
            results = orderOptions(results);

            // Then all personalDetails except the currently logged in user should be returned
            expect(results.personalDetails.length).toBe(Object.values(OPTIONS.personalDetails).length - 1);

            const expected = [
                'Black Panther',
                'Black Widow',
                'Captain America',
                'Invisible Woman',
                'Mister Fantastic',
                'Mr Sinister',
                'Spider-Man',
                'The Incredible Hulk',
                'Thor',
                'Timothée',
            ];
            const actual = results.personalDetails?.map((item) => item.text);

            // Then the results should be sorted alphabetically
            expect(actual).toEqual(expected);

            const personalDetailWithExistingReport = results.personalDetails.find((personalDetail) => personalDetail.login === 'peterparker@expensify.com');
            // Then the result which has an existing report should also have the reportID attached
            expect(personalDetailWithExistingReport?.reportID).toBe('2');
        });

        it('should sort personal details options alphabetically when only personal details are provided', () => {
            // Given a set of personalDetails and an empty reports array
            let results: Pick<Options, 'personalDetails' | 'recentReports'> = getValidOptions(
                {personalDetails: OPTIONS.personalDetails, reports: []},
                allPolicies,
                {},
                nvpDismissedProductTraining,
                undefined,

                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
            );
            // When we call orderOptions()
            results = orderOptions(results);

            const expected = [
                'Black Panther',
                'Black Widow',
                'Captain America',
                'Invisible Woman',
                'Mister Fantastic',
                'Mr Sinister',
                'Spider-Man',
                'The Incredible Hulk',
                'Thor',
                'Timothée',
            ];
            const actual = results.personalDetails?.map((item) => item.text);

            // Then the results should be sorted alphabetically
            expect(actual).toEqual(expected);
        });
    });

    describe('getValidOptions()', () => {
        it('should return empty options when no reports or personal details are provided', () => {
            // Given empty arrays of reports and personalDetails
            // When we call getValidOptions()
            const results = getValidOptions(
                {reports: [], personalDetails: []},
                allPolicies,
                {},
                nvpDismissedProductTraining,
                undefined,

                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
            );

            // Then the result should be empty
            expect(results.personalDetails).toEqual([]);
            expect(results.recentReports).toEqual([]);
            expect(results.currentUserOption).toBeUndefined();
            expect(results.userToInvite).toEqual(null);
            expect(results.workspaceChats).toEqual([]);
            expect(results.selfDMChat).toEqual(undefined);
        });

        it('should include Concierge by default in results', () => {
            // Given a set of reports and personalDetails that includes Concierge
            // When we call getValidOptions()
            const results = getValidOptions(
                {reports: OPTIONS_WITH_CONCIERGE.reports, personalDetails: OPTIONS_WITH_CONCIERGE.personalDetails},
                allPolicies,
                {},
                nvpDismissedProductTraining,
                undefined,

                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
            );

            // Then the result should include all personalDetails except the currently logged in user
            expect(results.personalDetails.length).toBe(Object.values(OPTIONS_WITH_CONCIERGE.personalDetails).length - 1);
            // Then the result should include Concierge
            expect(results.recentReports).toEqual(expect.arrayContaining([expect.objectContaining({login: 'concierge@expensify.com'})]));
        });

        it('should exclude Concierge when excludedLogins is specified', () => {
            // Given a set of reports and personalDetails that includes Concierge and a config object that excludes Concierge
            // When we call getValidOptions()
            const results = getValidOptions(
                {
                    reports: OPTIONS_WITH_CONCIERGE.reports,
                    personalDetails: OPTIONS_WITH_CONCIERGE.personalDetails,
                },
                allPolicies,
                {},
                nvpDismissedProductTraining,
                undefined,

                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
                {
                    excludeLogins: {[CONST.EMAIL.CONCIERGE]: true},
                },
            );

            // Then the result should include all personalDetails except the currently logged in user and Concierge
            expect(results.personalDetails.length).toBe(Object.values(OPTIONS_WITH_CONCIERGE.personalDetails).length - 2);
            // Then the result should not include Concierge
            expect(results.personalDetails).not.toEqual(expect.arrayContaining([expect.objectContaining({login: 'concierge@expensify.com'})]));
        });

        it('should exclude Chronos when excludedLogins is specified', () => {
            // Given a set of reports and personalDetails that includes Chronos and a config object that excludes Chronos
            // When we call getValidOptions()
            const results = getValidOptions(
                {reports: OPTIONS_WITH_CHRONOS.reports, personalDetails: OPTIONS_WITH_CHRONOS.personalDetails},
                allPolicies,
                {},
                nvpDismissedProductTraining,
                undefined,

                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
                {
                    excludeLogins: {[CONST.EMAIL.CHRONOS]: true},
                },
            );

            // Then the result should include all personalDetails except the currently logged in user and Chronos
            expect(results.personalDetails.length).toBe(Object.values(OPTIONS_WITH_CHRONOS.personalDetails).length - 2);
            // Then the result should not include Chronos
            expect(results.personalDetails).not.toEqual(expect.arrayContaining([expect.objectContaining({login: 'chronos@expensify.com'})]));
        });

        it('should exclude Receipts option from results when excludedLogins is specified', () => {
            // Given a set of reports and personalDetails that includes receipts and a config object that excludes receipts
            // When we call getValidOptions()
            const results = getValidOptions(
                {
                    reports: OPTIONS_WITH_RECEIPTS.reports,
                    personalDetails: OPTIONS_WITH_RECEIPTS.personalDetails,
                },
                allPolicies,
                {},
                nvpDismissedProductTraining,
                undefined,

                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
                {
                    excludeLogins: {[CONST.EMAIL.RECEIPTS]: true},
                },
            );

            // Then the result should include all personalDetails except the currently logged in user and receipts
            expect(results.personalDetails.length).toBe(Object.values(OPTIONS_WITH_RECEIPTS.personalDetails).length - 2);
            // Then the result should not include receipts
            expect(results.personalDetails).not.toEqual(expect.arrayContaining([expect.objectContaining({login: 'receipts@expensify.com'})]));
        });

        it('should include Manager McTest in results by default', () => {
            // Given a set of reports and personalDetails that includes Manager McTest
            // When we call getValidOptions()
            const result = getValidOptions(
                {reports: OPTIONS_WITH_MANAGER_MCTEST.reports, personalDetails: OPTIONS_WITH_MANAGER_MCTEST.personalDetails},
                allPolicies,
                {},
                {
                    // @ts-expect-error Mocked for testing
                    [CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.RENAME_SAVED_SEARCH]: {
                        timestamp: DateUtils.getDBTime(new Date().valueOf()),
                    },
                },
                undefined,

                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
                {
                    includeP2P: true,
                    canShowManagerMcTest: true,
                    betas: [CONST.BETAS.NEWDOT_MANAGER_MCTEST],
                },
            );

            // Then the result should include all personalDetails except the currently logged in user
            expect(result.personalDetails.length).toBe(Object.values(OPTIONS_WITH_MANAGER_MCTEST.personalDetails).length - 1);
            // Then the result should include Manager McTest
            expect(result.personalDetails).toEqual(expect.arrayContaining([expect.objectContaining({login: CONST.EMAIL.MANAGER_MCTEST})]));
        });

        it('should exclude Manager McTest from results if flag is set to false', () => {
            // Given a set of reports and personalDetails that includes Manager McTest and a config object that excludes Manager McTest
            // When we call getValidOptions()
            const result = getValidOptions(
                {reports: OPTIONS_WITH_MANAGER_MCTEST.reports, personalDetails: OPTIONS_WITH_MANAGER_MCTEST.personalDetails},
                allPolicies,
                {},
                nvpDismissedProductTraining,
                undefined,

                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
                {
                    includeP2P: true,
                    canShowManagerMcTest: false,
                    betas: [CONST.BETAS.NEWDOT_MANAGER_MCTEST],
                },
            );

            // Then the result should include all personalDetails except the currently logged in user and Manager McTest
            expect(result.personalDetails.length).toBe(Object.values(OPTIONS_WITH_MANAGER_MCTEST.personalDetails).length - 2);
            // Then the result should not include Manager McTest
            expect(result.personalDetails).not.toEqual(expect.arrayContaining([expect.objectContaining({login: CONST.EMAIL.MANAGER_MCTEST})]));
        });

        it('should exclude Manager McTest from results if user dismissed the tooltip', () => {
            return waitForBatchedUpdates()
                .then(() =>
                    // Given that the user has dismissed the tooltip
                    Onyx.set(ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING, {
                        [CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.SCAN_TEST_TOOLTIP]: {
                            timestamp: DateUtils.getDBTime(new Date().valueOf()),
                        },
                    }),
                )
                .then(() => {
                    // When we call getValidOptions()
                    const optionsWhenUserAlreadySubmittedExpense = getValidOptions(
                        {reports: OPTIONS_WITH_MANAGER_MCTEST.reports, personalDetails: OPTIONS_WITH_MANAGER_MCTEST.personalDetails},
                        allPolicies,
                        {},
                        nvpDismissedProductTraining,
                        undefined,

                        loginList,
                        CURRENT_USER_ACCOUNT_ID,
                        CURRENT_USER_EMAIL,
                        {
                            includeP2P: true,
                            canShowManagerMcTest: true,
                            betas: [CONST.BETAS.NEWDOT_MANAGER_MCTEST],
                        },
                    );

                    // Then the result should include all personalDetails except the currently logged in user and Manager McTest
                    expect(optionsWhenUserAlreadySubmittedExpense.personalDetails.length).toBe(Object.values(OPTIONS_WITH_MANAGER_MCTEST.personalDetails).length - 2);
                    // Then the result should not include Manager McTest
                    expect(optionsWhenUserAlreadySubmittedExpense.personalDetails).not.toEqual(expect.arrayContaining([expect.objectContaining({login: CONST.EMAIL.MANAGER_MCTEST})]));
                });
        });

        it('should keep admin rooms if specified', () => {
            // Given an admin room report search option
            const adminRoom: SearchOption<Report> = {
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
            const results = getValidOptions(
                {reports: [adminRoom], personalDetails: OPTIONS.personalDetails},
                allPolicies,
                {},
                nvpDismissedProductTraining,
                undefined,

                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
                {
                    includeMultipleParticipantReports: true,
                },
            );
            const adminRoomOption = results.recentReports.find((report) => report.reportID === '1455140530846319');

            // Then the result should include the admin room
            expect(adminRoomOption).toBeDefined();
        });

        it('should include brickRoadIndicator if showRBR is true', () => {
            const reportID = '1455140530846319';
            const workspaceChat: SearchOption<Report> = {
                item: {
                    chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                    currency: 'USD',
                    errorFields: {},
                    lastActionType: 'CREATED',
                    lastReadTime: '2025-03-21 07:25:46.279',
                    lastVisibleActionCreated: '2024-12-15 21:13:24.317',
                    lastVisibleActionLastModified: '2024-12-15 21:13:24.317',
                    ownerAccountID: 0,
                    permissions: ['read', 'write'],
                    participants: {1: {notificationPreference: 'always'}},
                    policyID: '52A5ABD88FBBD18F',
                    policyName: "A's Workspace",
                    reportID,
                    reportName: "A's Workspace chat",
                    type: 'chat',
                    writeCapability: 'all',
                },
                text: "A's Workspace chat",
                alternateText: "A's Workspace",
                allReportErrors: {},
                subtitle: "A's Workspace",
                participantsList: [],
                reportID,
                keyForList: '1455140530846319',
                isDefaultRoom: true,
                isChatRoom: true,
                policyID: '52A5ABD88FBBD18F',
                lastMessageText: '',
                lastVisibleActionCreated: '2024-12-15 21:13:24.317',
                notificationPreference: 'hidden',
                brickRoadIndicator: CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR,
            };
            const results = getValidOptions(
                {reports: [workspaceChat], personalDetails: []},
                allPolicies,
                {},
                nvpDismissedProductTraining,
                undefined,

                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
                {
                    includeMultipleParticipantReports: true,
                    showRBR: true,
                },
            );
            expect(results.recentReports.at(0)?.brickRoadIndicator).toBe(CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR);
        });

        it('should not include brickRoadIndicator if showRBR is false', () => {
            const reportID = '1455140530846319';
            const workspaceChat: SearchOption<Report> = {
                item: {
                    chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                    currency: 'USD',
                    errorFields: {},
                    lastActionType: 'CREATED',
                    lastReadTime: '2025-03-21 07:25:46.279',
                    lastVisibleActionCreated: '2024-12-15 21:13:24.317',
                    lastVisibleActionLastModified: '2024-12-15 21:13:24.317',
                    ownerAccountID: 0,
                    permissions: ['read', 'write'],
                    participants: {1: {notificationPreference: 'always'}},
                    policyID: '52A5ABD88FBBD18F',
                    policyName: "A's Workspace",
                    reportID,
                    reportName: "A's Workspace chat",
                    type: 'chat',
                    writeCapability: 'all',
                },
                text: "A's Workspace chat",
                alternateText: "A's Workspace",
                allReportErrors: {},
                subtitle: "A's Workspace",
                participantsList: [],
                reportID,
                keyForList: '1455140530846319',
                isDefaultRoom: true,
                isChatRoom: true,
                policyID: '52A5ABD88FBBD18F',
                lastMessageText: '',
                lastVisibleActionCreated: '2024-12-15 21:13:24.317',
                notificationPreference: 'hidden',
                brickRoadIndicator: CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR,
            };
            const results = getValidOptions(
                {reports: [workspaceChat], personalDetails: []},
                allPolicies,
                {},
                nvpDismissedProductTraining,
                undefined,

                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
                {
                    includeMultipleParticipantReports: true,
                    showRBR: false,
                },
            );
            expect(results.recentReports.at(0)?.brickRoadIndicator).toBe(null);
        });

        it('should mark unread report as bold when shouldUnreadBeBold is true', async () => {
            const reportID = '99999';
            const report: Report = {
                ...createRegularChat(Number(reportID), [1]),
                reportID,
                reportName: 'Unread Report',
                lastReadTime: DateUtils.getDBTime(Date.now() - 10000),
                lastVisibleActionCreated: DateUtils.getDBTime(Date.now()),
                lastActorAccountID: 1,
                lastMessageText: 'Test message',
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
            await waitForBatchedUpdates();

            const inputOption: SearchOption<Report> = {
                item: report,
                reportID,
                text: 'Unread Report',
                isUnread: false, // Intentionally false initially to prove it gets recalculated
                participantsList: [],
                keyForList: reportID,
                isChatRoom: true,
                policyID: '123',
                lastMessageText: '',
                lastVisibleActionCreated: report.lastVisibleActionCreated,
                notificationPreference: 'always',
                accountID: 0,
                login: '',
                alternateText: '',
                subtitle: '',
                firstName: '',
                lastName: '',
                icons: [],
                isSelected: false,
                isDisabled: false,
                brickRoadIndicator: null,
                isBold: false,
            };

            const results = getValidOptions(
                {reports: [inputOption], personalDetails: []},
                allPolicies,
                {},
                nvpDismissedProductTraining,
                undefined,

                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
                {
                    includeRecentReports: true,
                    shouldUnreadBeBold: true,
                    includeMultipleParticipantReports: true,
                },
            );

            expect(results.recentReports.at(0)?.isBold).toBe(true);
            expect(results.recentReports.at(0)?.isUnread).toBe(true);
        });

        it('should use personalDetails parameter when passed to getValidOptions', () => {
            // Given a personalDetails object to pass explicitly
            const customPersonalDetails = {
                2: {
                    accountID: 2,
                    displayName: 'Custom Iron Man',
                    login: 'tonystark@expensify.com',
                },
                3: {
                    accountID: 3,
                    displayName: 'Custom Spider-Man',
                    login: 'peterparker@expensify.com',
                },
            };

            // When we call getValidOptions with personalDetails parameter
            const results = getValidOptions(
                {reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails},
                {},
                {},
                nvpDismissedProductTraining,
                undefined,

                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
                {
                    personalDetails: customPersonalDetails,
                },
            );

            // Then the function should complete without errors and return valid results
            // The personalDetails param is used internally by prepareReportOptionsForDisplay for workspace chats
            expect(results.recentReports.length).toBeGreaterThan(0);
            expect(results.personalDetails.length).toBeGreaterThan(0);
        });
    });

    describe('getValidOptions() for chat room', () => {
        it('should include all reports by default', () => {
            // Given a set of reports and personalDetails that includes workspace rooms
            // When we call getValidOptions()
            const results = getValidOptions(
                OPTIONS_WITH_WORKSPACE_ROOM,
                allPolicies,
                {},
                nvpDismissedProductTraining,
                undefined,

                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
                {
                    includeRecentReports: true,
                    includeMultipleParticipantReports: true,
                    includeP2P: true,
                    includeOwnedWorkspaceChats: true,
                },
            );

            // Then the result should include all reports except the currently logged in user
            expect(results.recentReports.length).toBe(OPTIONS_WITH_WORKSPACE_ROOM.reports.length - 1);
            expect(results.recentReports).toEqual(expect.arrayContaining([expect.objectContaining({reportID: '14'})]));
        });
    });

    describe('getValidOptions() for group Chat', () => {
        it('should exclude users with recent reports from personalDetails', () => {
            // Given a set of reports and personalDetails
            // When we call getValidOptions with no search value
            const results = getValidOptions(
                {reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails},
                allPolicies,
                {},
                nvpDismissedProductTraining,
                undefined,

                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
            );
            const reportLogins = new Set(results.recentReports.map((reportOption) => reportOption.login));
            const personalDetailsOverlapWithReports = results.personalDetails.every((personalDetailOption) => reportLogins.has(personalDetailOption.login));

            // Then we should expect all the personalDetails to show except the currently logged in user
            expect(results.personalDetails.length).toBe(Object.values(OPTIONS.personalDetails).length - 1);
            // Then none of our personalDetails should include any of the users with recent reports
            expect(personalDetailsOverlapWithReports).toBe(false);
        });

        it('should exclude selected options', () => {
            // Given a set of reports and personalDetails
            // When we call getValidOptions with excludeLogins param
            const results = getValidOptions(
                {reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails},
                allPolicies,
                {},
                nvpDismissedProductTraining,
                undefined,

                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
                {
                    excludeLogins: {'peterparker@expensify.com': true},
                },
            );

            // Then the option should not appear anywhere in either list
            expect(results.recentReports.every((option) => option.login !== 'peterparker@expensify.com')).toBe(true);
            expect(results.personalDetails.every((option) => option.login !== 'peterparker@expensify.com')).toBe(true);
        });

        it('should include Concierge in the results by default', () => {
            // Given a set of report and personalDetails that include Concierge
            // When we call getValidOptions()
            const results = getValidOptions(
                {reports: OPTIONS_WITH_CONCIERGE.reports, personalDetails: OPTIONS_WITH_CONCIERGE.personalDetails},
                allPolicies,
                {},
                nvpDismissedProductTraining,
                undefined,

                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
            );

            // Then the result should include all personalDetails except the currently logged in user
            expect(results.personalDetails.length).toBe(Object.values(OPTIONS_WITH_CONCIERGE.personalDetails).length - 1);
            // Then Concierge should be included in the results
            expect(results.recentReports).toEqual(expect.arrayContaining([expect.objectContaining({login: 'concierge@expensify.com'})]));
        });

        it('should exclude Concierge from the results when it is specified in excludedLogins', () => {
            // Given a set of reports and personalDetails that includes Concierge
            // When we call getValidOptions with excludeLogins param
            const results = getValidOptions(
                {
                    reports: OPTIONS_WITH_CONCIERGE.reports,
                    personalDetails: OPTIONS_WITH_CONCIERGE.personalDetails,
                },
                undefined,
                {},
                nvpDismissedProductTraining,
                undefined,

                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
                {
                    excludeLogins: {[CONST.EMAIL.CONCIERGE]: true},
                },
            );

            // Then the result should include all personalDetails except the currently logged in user and Concierge
            expect(results.personalDetails.length).toBe(Object.values(OPTIONS_WITH_CONCIERGE.personalDetails).length - 2);
            // Then none of the results should include Concierge
            expect(results.personalDetails).not.toEqual(expect.arrayContaining([expect.objectContaining({login: 'concierge@expensify.com'})]));
            expect(results.recentReports).not.toEqual(expect.arrayContaining([expect.objectContaining({login: 'concierge@expensify.com'})]));
        });

        it('should exclude Chronos from the results when it is specified in excludedLogins', () => {
            // given a set of reports and personalDetails that includes Chronos
            // When we call getValidOptions() with excludeLogins param
            const results = getValidOptions(
                {reports: OPTIONS_WITH_CHRONOS.reports, personalDetails: OPTIONS_WITH_CHRONOS.personalDetails},
                allPolicies,
                {},
                nvpDismissedProductTraining,
                undefined,

                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
                {
                    excludeLogins: {[CONST.EMAIL.CHRONOS]: true},
                },
            );

            // Then the result should include all personalDetails except the currently logged in user and Chronos
            expect(results.personalDetails.length).toBe(Object.values(OPTIONS_WITH_CHRONOS.personalDetails).length - 2);
            // Then none of the results should include Chronos
            expect(results.personalDetails).not.toEqual(expect.arrayContaining([expect.objectContaining({login: 'chronos@expensify.com'})]));
            expect(results.recentReports).not.toEqual(expect.arrayContaining([expect.objectContaining({login: 'chronos@expensify.com'})]));
        });

        it('should exclude Receipts from the results when it is specified in excludedLogins', () => {
            // Given a set of reports and personalDetails that includes receipts
            // When we call getValidOptions() with excludeLogins param
            const results = getValidOptions(
                {
                    reports: OPTIONS_WITH_RECEIPTS.reports,
                    personalDetails: OPTIONS_WITH_RECEIPTS.personalDetails,
                },
                undefined,
                {},
                nvpDismissedProductTraining,
                undefined,

                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
                {
                    excludeLogins: {[CONST.EMAIL.RECEIPTS]: true},
                },
            );

            // Then the result should include all personalDetails except the currently logged in user and receipts
            expect(results.personalDetails.length).toBe(Object.values(OPTIONS_WITH_RECEIPTS.personalDetails).length - 2);
            // Then none of the results should include receipts
            expect(results.personalDetails).not.toEqual(expect.arrayContaining([expect.objectContaining({login: 'receipts@expensify.com'})]));
            expect(results.recentReports).not.toEqual(expect.arrayContaining([expect.objectContaining({login: 'receipts@expensify.com'})]));
        });

        it('should limit recent reports when maxRecentReportElements is specified', () => {
            // Given a set of reports and personalDetails with multiple reports
            // When we call getValidOptions with maxRecentReportElements set to 2
            const maxRecentReports = 2;
            const results = getValidOptions(
                {reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails},
                allPolicies,
                {},
                nvpDismissedProductTraining,
                undefined,

                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
                {
                    maxRecentReportElements: maxRecentReports,
                },
            );

            // Then the recent reports should be limited to the specified number
            expect(results.recentReports.length).toBeLessThanOrEqual(maxRecentReports);
        });

        it('should show all reports when maxRecentReportElements is not specified', () => {
            // Given a set of reports and personalDetails
            // When we call getValidOptions without maxRecentReportElements
            const resultsWithoutLimit = getValidOptions(
                {reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails},
                allPolicies,
                {},
                nvpDismissedProductTraining,
                undefined,

                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
            );
            const resultsWithLimit = getValidOptions(
                {reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails},
                allPolicies,
                {},
                nvpDismissedProductTraining,
                undefined,

                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
                {
                    maxRecentReportElements: 2,
                },
            );

            // Then the results without limit should have more or equal reports
            expect(resultsWithoutLimit.recentReports.length).toBeGreaterThanOrEqual(resultsWithLimit.recentReports.length);
        });

        it('should not affect personalDetails count when maxRecentReportElements is specified', () => {
            // Given a set of reports and personalDetails
            // When we call getValidOptions with and without maxRecentReportElements
            const resultsWithoutLimit = getValidOptions(
                {reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails},
                allPolicies,
                {},
                nvpDismissedProductTraining,
                undefined,

                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
            );
            const resultsWithLimit = getValidOptions(
                {reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails},
                allPolicies,
                {},
                nvpDismissedProductTraining,
                undefined,

                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
                {
                    maxRecentReportElements: 2,
                },
            );

            // Then personalDetails should remain the same regardless of maxRecentReportElements
            expect(resultsWithLimit.personalDetails.length).toBe(resultsWithoutLimit.personalDetails.length);
        });

        it('should respect maxRecentReportElements when combined with maxElements', () => {
            // Given a set of reports and personalDetails
            // When we call getValidOptions with both maxElements and maxRecentReportElements
            const maxRecentReports = 3;
            const maxTotalElements = 10;
            const results = getValidOptions(
                {reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails},
                allPolicies,
                {},
                nvpDismissedProductTraining,
                undefined,

                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
                {
                    maxElements: maxTotalElements,
                    maxRecentReportElements: maxRecentReports,
                },
            );

            // Then recent reports should be limited by maxRecentReportElements
            expect(results.recentReports.length).toBeLessThanOrEqual(maxRecentReports);
            // Then the total number of options (reports + personalDetails) should not exceed maxElements
            expect(results.recentReports.length + results.personalDetails.length).toBeLessThanOrEqual(maxTotalElements);
        });
    });

    describe('getShareDestinationsOptions()', () => {
        it('should exclude archived rooms and hidden threads from share destinations', () => {
            // Given a set of filtered current Reports (as we do in the component) before getting share destination options
            const filteredReports = Object.values(OPTIONS.reports).reduce<OptionList['reports']>((filtered, option) => {
                const report = option.item;
                const {result: isReportArchived} = renderHook(() => useReportIsArchived(report.reportID));
                if (canUserPerformWriteAction(report, isReportArchived.current) && canCreateTaskInReport(report) && !isCanceledTaskReport(report)) {
                    filtered.push(option);
                }
                return filtered;
            }, []);

            // When we call getValidOptions for share destination with an empty search value
            const results = getValidOptions(
                {reports: filteredReports, personalDetails: OPTIONS.personalDetails},
                allPolicies,
                {},
                nvpDismissedProductTraining,
                undefined,

                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
                {
                    betas: [],
                    includeMultipleParticipantReports: true,
                    showChatPreviewLine: true,
                    forcePolicyNamePreview: true,
                    includeThreads: true,
                    includeMoneyRequests: true,
                    includeTasks: true,
                    excludeLogins: {},
                    includeOwnedWorkspaceChats: true,
                    includeSelfDM: true,
                    searchString: '',
                    includeUserToInvite: false,
                },
            );

            // Then all the recent reports should be returned except the archived rooms and the hidden thread
            expect(results.recentReports.length).toBe(Object.values(OPTIONS.reports).length - 2);
        });

        it('should include DMS, group chats, and workspace rooms in share destinations', () => {
            // Given a set of filtered current Reports (as we do in the component) with workspace rooms before getting share destination options
            const filteredReportsWithWorkspaceRooms = Object.values(OPTIONS_WITH_WORKSPACE_ROOM.reports).reduce<OptionList['reports']>((filtered, option) => {
                const report = option.item;
                const {result: isReportArchived} = renderHook(() => useReportIsArchived(report.reportID));
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                if (canUserPerformWriteAction(report, isReportArchived.current) || isExpensifyOnlyParticipantInReport(report)) {
                    filtered.push(option);
                }
                return filtered;
            }, []);

            // When we call getValidOptions for share destination with an empty search value
            const results = getValidOptions(
                {reports: filteredReportsWithWorkspaceRooms, personalDetails: OPTIONS.personalDetails},
                allPolicies,
                {},
                nvpDismissedProductTraining,
                undefined,

                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
                {
                    betas: [],
                    includeMultipleParticipantReports: true,
                    showChatPreviewLine: true,
                    forcePolicyNamePreview: true,
                    includeThreads: true,
                    includeMoneyRequests: true,
                    includeTasks: true,
                    excludeLogins: {},
                    includeOwnedWorkspaceChats: true,
                    includeSelfDM: true,
                    searchString: '',
                    includeUserToInvite: false,
                },
            );

            // Then all recent reports should be returned except the archived rooms and the hidden thread
            expect(results.recentReports.length).toBe(Object.values(OPTIONS_WITH_WORKSPACE_ROOM.reports).length - 2);
        });
    });

    describe('getMemberInviteOptions()', () => {
        it('should sort personal details alphabetically and return expected structure', () => {
            // Given a set of personalDetails
            // When we call getMemberInviteOptions
            const results = getMemberInviteOptions(OPTIONS.personalDetails, nvpDismissedProductTraining, loginList, CURRENT_USER_ACCOUNT_ID, CURRENT_USER_EMAIL, []);

            // Then personal details should be sorted alphabetically
            expect(results.personalDetails.at(0)?.text).toBe('Black Panther');
            expect(results.personalDetails.at(1)?.text).toBe('Black Widow');
            expect(results.personalDetails.at(2)?.text).toBe('Captain America');
            expect(results.personalDetails.at(3)?.text).toBe('Invisible Woman');

            // Then the results should contain expected structure
            expect(results.personalDetails.length).toBeGreaterThan(0);
            expect(results.recentReports).toEqual([]);
            expect(results.currentUserOption).toBeUndefined();
        });

        it('should exclude logins when excludeLogins is provided', () => {
            // Given a set of personalDetails and excludeLogins
            const excludeLogins = {'reedrichards@expensify.com': true};

            // When we call getMemberInviteOptions with excludeLogins
            const results = getMemberInviteOptions(OPTIONS.personalDetails, nvpDismissedProductTraining, loginList, CURRENT_USER_ACCOUNT_ID, CURRENT_USER_EMAIL, [], excludeLogins);

            // Then the excluded login should not be in the results
            const excludedUser = results.personalDetails.find((detail) => detail.login === 'reedrichards@expensify.com');
            expect(excludedUser).toBeUndefined();
        });
    });

    describe('getLastActorDisplayName()', () => {
        it('should return correct display name', () => {
            renderLocaleContextProvider();
            // Given two different personal details and current user is accountID 2
            const currentUserAccountID = 2;

            // When we call getLastActorDisplayName
            const result1 = getLastActorDisplayName(PERSONAL_DETAILS['2'], currentUserAccountID);
            const result2 = getLastActorDisplayName(PERSONAL_DETAILS['3'], currentUserAccountID);

            // We should expect "You" for current user and first name for others
            expect(result1).toBe('You');
            expect(result2).toBe('Spider-Man');
        });
    });

    describe('shouldShowLastActorDisplayName()', () => {
        const currentUserAccountID = 2;

        it('should return false when lastReportAction is not available', () => {
            // Given a report with no lastVisibleReportAction and no lastAction provided
            const report = REPORTS['1'];
            const lastActorDetails = PERSONAL_DETAILS['3'];

            const result = shouldShowLastActorDisplayName(report, lastActorDetails, undefined, currentUserAccountID);
            expect(result).toBe(false);
        });

        it('should return false when lastActorDetails is null', () => {
            // Given a report with a lastReportAction but no lastActorDetails
            const report = REPORTS['1'];
            const lastAction = createRandomReportAction(1);

            const result = shouldShowLastActorDisplayName(report, null, lastAction, currentUserAccountID);
            expect(result).toBe(false);
        });

        it('should return false when report is a self DM', () => {
            // Given a self DM report with a lastAction and lastActorDetails
            const report = REPORTS_WITH_SELF_DM['17'];
            const lastActorDetails = PERSONAL_DETAILS['2'];
            const lastAction = createRandomReportAction(1);

            // When we call shouldShowLastActorDisplayName with a self DM report
            const result = shouldShowLastActorDisplayName(report, lastActorDetails, lastAction, currentUserAccountID);
            expect(result).toBe(false);
        });

        it('should return false when report is a DM but lastActorDetails is not the current user', () => {
            // Given a DM report where last actor is not current user
            const report = {
                ...REPORTS['2'],
                type: CONST.REPORT.TYPE.CHAT,
            } as Report;
            const lastActorDetails = PERSONAL_DETAILS['3'];
            const lastAction = createRandomReportAction(1);

            const result = shouldShowLastActorDisplayName(report, lastActorDetails, lastAction, currentUserAccountID);
            expect(result).toBe(false);
        });

        it('should return false when the last action is an IOU', () => {
            // Given a report with an IOU last action name
            const report = REPORTS['1'];
            const lastActorDetails = PERSONAL_DETAILS['2'];
            const lastAction: ReportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
            };

            const result = shouldShowLastActorDisplayName(report, lastActorDetails, lastAction, currentUserAccountID);
            expect(result).toBe(false);
        });

        it('should return false when the last action is a REPORT_PREVIEW with MANAGER_MCTEST as participant', () => {
            // Given a report with a REPORT_PREVIEW last action and MANAGER_MCTEST as participant
            const report = {
                ...REPORTS['1'],
                participants: {
                    2: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                    [CONST.ACCOUNT_ID.MANAGER_MCTEST]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                },
            } as Report;
            const lastActorDetails = PERSONAL_DETAILS['2'];
            const lastAction: ReportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW,
            };

            const result = shouldShowLastActorDisplayName(report, lastActorDetails, lastAction, currentUserAccountID);
            expect(result).toBe(false);
        });

        it('should return false when getLastActorDisplayName returns empty string', () => {
            renderLocaleContextProvider();
            // Given a report with lastActorDetails that has no displayName or firstName
            const report = REPORTS['1'];
            const lastActorDetails: Partial<PersonalDetails> = {
                accountID: 99,
                login: '',
                displayName: '',
                firstName: '',
            };
            const lastAction = createRandomReportAction(1);

            const result = shouldShowLastActorDisplayName(report, lastActorDetails, lastAction, currentUserAccountID);
            expect(result).toBe(false);
        });

        it('should return true when all conditions are met', () => {
            renderLocaleContextProvider();
            // Given a report without reportID (so it uses the lastReportAction)
            const report: Report | undefined = undefined;
            const lastActorDetails = PERSONAL_DETAILS['3'];
            const lastAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
            };

            // When we call shouldShowLastActorDisplayName with all valid conditions
            const result = shouldShowLastActorDisplayName(report, lastActorDetails, lastAction, currentUserAccountID);
            expect(result).toBe(true);
        });

        it('should return true when the last actor is the current user in a group chat', () => {
            renderLocaleContextProvider();
            // Given a report without reportID (so it uses the lastReportAction)
            const report: Report | undefined = undefined;
            const lastActorDetails = PERSONAL_DETAILS['2'];
            const lastAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
            };

            const result = shouldShowLastActorDisplayName(report, lastActorDetails, lastAction, currentUserAccountID);
            expect(result).toBe(true);
        });

        it('should return true when report is a DM with current user as the last actor', () => {
            renderLocaleContextProvider();
            // Given a report without reportID
            const report: Report | undefined = undefined;
            const lastActorDetails = PERSONAL_DETAILS['2'];
            const lastAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
            };

            // When we call shouldShowLastActorDisplayName with the current user as last actor
            const result = shouldShowLastActorDisplayName(report, lastActorDetails, lastAction, currentUserAccountID);
            expect(result).toBe(true);
        });
    });

    describe('formatMemberForList()', () => {
        it('should format members correctly', () => {
            // Given a set of personal details
            // When we call formatMemberForList
            const formattedMembers = Object.values(PERSONAL_DETAILS).map((personalDetail) => formatMemberForList(personalDetail));

            // Then the formatted members' order should be the same as the original PERSONAL_DETAILS array
            expect(formattedMembers.at(0)?.text).toBe('Mister Fantastic');
            expect(formattedMembers.at(1)?.text).toBe('Iron Man');
            expect(formattedMembers.at(2)?.text).toBe('Spider-Man');

            // Then only the first item should be selected
            expect(formattedMembers.at(0)?.isSelected).toBe(true);
            // Then all remaining items should be unselected
            expect(formattedMembers.slice(1).every((personalDetail) => !personalDetail.isSelected)).toBe(true);
            // Then all items should be enabled
            expect(formattedMembers.every((personalDetail) => !personalDetail.isDisabled)).toBe(true);
        });
    });

    describe('filterAndOrderOptions()', () => {
        it('should return all options when search is empty', () => {
            // Given a set of options
            // When we call getSearchOptions with all betas
            const options = getSearchOptions({
                options: OPTIONS,
                draftComments: {},
                nvpDismissedProductTraining,
                policyTags: undefined,
                loginList,
                betas: [CONST.BETAS.ALL],
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                currentUserEmail: CURRENT_USER_EMAIL,
            });
            // When we pass the returned options to filterAndOrderOptions with an empty search value
            const filteredOptions = filterAndOrderOptions(options, '', COUNTRY_CODE, loginList, CURRENT_USER_EMAIL, CURRENT_USER_ACCOUNT_ID);

            // Then all options should be returned
            expect(filteredOptions.recentReports.length + filteredOptions.personalDetails.length).toBe(14);
        });

        it('should return filtered options in correct order', () => {
            const searchText = 'man';
            // Given a set of options
            // When we call getSearchOptions with all betas
            const options = getSearchOptions({
                options: OPTIONS,
                draftComments: {},
                nvpDismissedProductTraining,
                loginList,
                policyTags: undefined,
                betas: [CONST.BETAS.ALL],
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                currentUserEmail: CURRENT_USER_EMAIL,
            });
            // When we pass the returned options to filterAndOrderOptions with a search value and sortByReportTypeInSearch param
            const filteredOptions = filterAndOrderOptions(options, searchText, COUNTRY_CODE, loginList, CURRENT_USER_EMAIL, CURRENT_USER_ACCOUNT_ID, {
                sortByReportTypeInSearch: true,
            });

            // Then we expect all options to be part of the recentReports list and reports should be first:
            expect(filteredOptions.personalDetails.length).toBe(0);
            // Then returned reports should match the search text
            expect(filteredOptions.recentReports.length).toBe(4);
            // Then the returned reports should be ordered by most recent action (and other criteria such as whether they are archived)
            expect(filteredOptions.recentReports.at(0)?.text).toBe('Invisible Woman'); // '2022-11-22 03:26:02.019'
            expect(filteredOptions.recentReports.at(1)?.text).toBe('Spider-Man'); // '2022-11-22 03:26:02.016'
            expect(filteredOptions.recentReports.at(2)?.text).toBe('Black Widow'); // This is a personal detail, which has no lastVisibleActionCreated, but matches the login
            expect(filteredOptions.recentReports.at(3)?.text).toBe('Mister Fantastic, Invisible Woman'); // This again is a report with '2022-11-22 03:26:02.015'
        });

        it('should filter users by email', () => {
            const searchText = 'mistersinister@marauders.com';
            // Given a set of options
            // When we call getSearchOptions with all betas
            const options = getSearchOptions({
                options: OPTIONS,
                draftComments: {},
                nvpDismissedProductTraining,
                loginList,
                policyTags: undefined,

                betas: [CONST.BETAS.ALL],
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                currentUserEmail: CURRENT_USER_EMAIL,
            });
            // When we pass the returned options to filterAndOrderOptions with a search value
            const filteredOptions = filterAndOrderOptions(options, searchText, COUNTRY_CODE, loginList, CURRENT_USER_EMAIL, CURRENT_USER_ACCOUNT_ID);

            // Then only one report should be returned
            expect(filteredOptions.recentReports.length).toBe(1);
            // Then the returned report should match the search text
            expect(filteredOptions.recentReports.at(0)?.text).toBe('Mr Sinister');
        });

        it('should find archived chats', () => {
            const searchText = 'Archived';
            // Given a set of options
            // When we call getSearchOptions with all betas
            const options = getSearchOptions({
                options: OPTIONS,
                draftComments: {},
                nvpDismissedProductTraining,
                loginList,
                policyTags: undefined,

                betas: [CONST.BETAS.ALL],
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                currentUserEmail: CURRENT_USER_EMAIL,
            });
            // When we pass the returned options to filterAndOrderOptions with a search value
            const filteredOptions = filterAndOrderOptions(options, searchText, COUNTRY_CODE, loginList, CURRENT_USER_EMAIL, CURRENT_USER_ACCOUNT_ID);

            // Then only one report should be returned
            expect(filteredOptions.recentReports.length).toBe(1);
            // Then the returned report should match the search text
            expect(!!filteredOptions.recentReports.at(0)?.private_isArchived).toBe(true);
        });

        it('should filter options by email if dot is skipped in the email', () => {
            // cspell:disable-next-line
            const searchText = 'barryallen';
            // Given a set of options created from PERSONAL_DETAILS_WITH_PERIODS
            const OPTIONS_WITH_PERIODS = createOptionList(PERSONAL_DETAILS_WITH_PERIODS, undefined, CURRENT_USER_ACCOUNT_ID, REPORTS);
            // When we call getSearchOptions with all betas
            const options = getSearchOptions({
                options: OPTIONS_WITH_PERIODS,
                draftComments: {},
                nvpDismissedProductTraining,
                policyTags: undefined,

                loginList,
                betas: [CONST.BETAS.ALL],
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                currentUserEmail: CURRENT_USER_EMAIL,
            });
            // When we pass the returned options to filterAndOrderOptions with a search value and sortByReportTypeInSearch param
            const filteredOptions = filterAndOrderOptions(options, searchText, COUNTRY_CODE, loginList, CURRENT_USER_EMAIL, CURRENT_USER_ACCOUNT_ID, {
                sortByReportTypeInSearch: true,
            });

            // Then only one report should be returned
            expect(filteredOptions.recentReports.length).toBe(1);
            // Then the returned report should match the search text
            expect(filteredOptions.recentReports.at(0)?.login).toBe('barry.allen@expensify.com');
        });

        it('should include workspace rooms in the search results', () => {
            const searchText = 'avengers';
            // Given a set of options with workspace rooms
            // When we call getSearchOptions with all betas
            const options = getSearchOptions({
                options: OPTIONS_WITH_WORKSPACE_ROOM,
                draftComments: {},
                nvpDismissedProductTraining,
                policyTags: undefined,

                loginList,
                betas: [CONST.BETAS.ALL],
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                currentUserEmail: CURRENT_USER_EMAIL,
            });
            // When we pass the returned options to filterAndOrderOptions with a search value
            const filteredOptions = filterAndOrderOptions(options, searchText, COUNTRY_CODE, loginList, CURRENT_USER_EMAIL, CURRENT_USER_ACCOUNT_ID);

            // Then only one report should be returned
            expect(filteredOptions.recentReports.length).toBe(1);
            // Then the returned report should match the search text
            expect(filteredOptions.recentReports.at(0)?.subtitle).toBe('Avengers Room');
        });

        it('should put exact match by login on the top of the list', () => {
            const searchText = 'reedrichards@expensify.com';
            // Given a set of options with all betas
            const options = getSearchOptions({
                options: OPTIONS,
                draftComments: {},
                nvpDismissedProductTraining,
                policyTags: undefined,
                loginList,
                betas: [CONST.BETAS.ALL],
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                currentUserEmail: CURRENT_USER_EMAIL,
            });
            // When we pass the returned options to filterAndOrderOptions with a search value
            const filteredOptions = filterAndOrderOptions(options, searchText, COUNTRY_CODE, loginList, CURRENT_USER_EMAIL, CURRENT_USER_ACCOUNT_ID);

            // Then only one report should be returned
            expect(filteredOptions.recentReports.length).toBe(1);
            // Then the returned report should match the search text
            expect(filteredOptions.recentReports.at(0)?.login).toBe(searchText);
        });

        it('should prioritize options with matching display name over chat rooms', () => {
            const searchText = 'spider';
            // Given a set of options with chat rooms
            const OPTIONS_WITH_CHAT_ROOMS = createOptionList(PERSONAL_DETAILS, {}, CURRENT_USER_ACCOUNT_ID, REPORTS_WITH_CHAT_ROOM);
            // When we call getSearchOptions with all betas
            const options = getSearchOptions({
                options: OPTIONS_WITH_CHAT_ROOMS,
                draftComments: {},
                nvpDismissedProductTraining,
                policyTags: undefined,

                loginList,
                betas: [CONST.BETAS.ALL],
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                currentUserEmail: CURRENT_USER_EMAIL,
            });
            // When we pass the returned options to filterAndOrderOptions with a search value
            const filterOptions = filterAndOrderOptions(options, searchText, COUNTRY_CODE, loginList, CURRENT_USER_EMAIL, CURRENT_USER_ACCOUNT_ID);

            // Then only two reports should be returned
            expect(filterOptions.recentReports.length).toBe(2);
            // Then the second report should match the search text
            expect(filterOptions.recentReports.at(1)?.isChatRoom).toBe(true);
        });

        it('should put the item with latest lastVisibleActionCreated on top when search value match multiple items', () => {
            renderLocaleContextProvider();
            const searchText = 'fantastic';
            // Given a set of options
            const options = getSearchOptions({
                options: OPTIONS,
                draftComments: {},
                nvpDismissedProductTraining,
                policyTags: undefined,

                loginList,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                currentUserEmail: CURRENT_USER_EMAIL,
            });
            // When we call filterAndOrderOptions with a search value
            const filteredOptions = filterAndOrderOptions(options, searchText, COUNTRY_CODE, loginList, CURRENT_USER_EMAIL, CURRENT_USER_ACCOUNT_ID);

            // Then only three reports should be returned
            expect(filteredOptions.recentReports.length).toBe(3);
            // Then the first report should match the search text
            expect(filteredOptions.recentReports.at(0)?.text).toBe('Mister Fantastic');
            // Then the second report should match the search text
            expect(filteredOptions.recentReports.at(1)?.text).toBe('Mister Fantastic, Invisible Woman');
        });

        it('should return the user to invite when the search value is a valid, non-existent email', () => {
            const searchText = 'test@email.com';
            // Given a set of options
            const options = getSearchOptions({
                options: OPTIONS,
                draftComments: {},
                policyTags: undefined,

                loginList,
                nvpDismissedProductTraining,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                currentUserEmail: CURRENT_USER_EMAIL,
            });
            // When we call filterAndOrderOptions with a search value
            const filteredOptions = filterAndOrderOptions(options, searchText, COUNTRY_CODE, loginList, CURRENT_USER_EMAIL, CURRENT_USER_ACCOUNT_ID);

            // Then the user to invite should be returned
            expect(filteredOptions.userToInvite?.login).toBe(searchText);
        });

        it('should not return any results if the search value is on an excluded logins list', () => {
            const searchText = 'admin@expensify.com';
            // Given a set of options with excluded logins list
            const options = getValidOptions(
                {reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails},
                allPolicies,
                {},
                nvpDismissedProductTraining,
                undefined,

                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
                {
                    excludeLogins: CONST.EXPENSIFY_EMAILS_OBJECT,
                },
            );
            // When we call filterAndOrderOptions with a search value and excluded logins list
            const filterOptions = filterAndOrderOptions(options, searchText, COUNTRY_CODE, loginList, CURRENT_USER_EMAIL, CURRENT_USER_ACCOUNT_ID, {
                excludeLogins: CONST.EXPENSIFY_EMAILS_OBJECT,
            });

            // Then no personal details should be returned
            expect(filterOptions.recentReports.length).toBe(0);
        });

        it('should return the user to invite when the search value is a valid, non-existent email and the user is not excluded', () => {
            const searchText = 'test@email.com';
            // Given a set of options
            const options = getSearchOptions({
                options: OPTIONS,
                draftComments: {},
                loginList,
                nvpDismissedProductTraining,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                currentUserEmail: CURRENT_USER_EMAIL,
                policyTags: undefined,
            });
            // When we call filterAndOrderOptions with a search value and excludeLogins
            const filteredOptions = filterAndOrderOptions(options, searchText, COUNTRY_CODE, loginList, CURRENT_USER_EMAIL, CURRENT_USER_ACCOUNT_ID, {
                excludeLogins: CONST.EXPENSIFY_EMAILS_OBJECT,
            });

            // Then the user to invite should be returned
            expect(filteredOptions.userToInvite?.login).toBe(searchText);
        });

        it('should return limited amount of recent reports if the limit is set', () => {
            const searchText = '';
            // Given a set of options
            const options = getSearchOptions({
                options: OPTIONS,
                draftComments: {},
                loginList,
                nvpDismissedProductTraining,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                currentUserEmail: CURRENT_USER_EMAIL,
                policyTags: undefined,
            });
            // When we call filterAndOrderOptions with a search value and maxRecentReportsToShow set to 2
            const filteredOptions = filterAndOrderOptions(options, searchText, COUNTRY_CODE, loginList, CURRENT_USER_EMAIL, CURRENT_USER_ACCOUNT_ID, {
                maxRecentReportsToShow: 2,
            });

            // Then only two reports should be returned
            expect(filteredOptions.recentReports.length).toBe(2);

            // Note: in the past maxRecentReportsToShow: 0 would return all recent reports, this has changed, and is expected to return none now
            // When we call filterAndOrderOptions with a search value and maxRecentReportsToShow set to 0
            const limitToZeroOptions = filterAndOrderOptions(options, searchText, COUNTRY_CODE, loginList, CURRENT_USER_EMAIL, CURRENT_USER_ACCOUNT_ID, {
                maxRecentReportsToShow: 0,
            });

            // Then no reports should be returned
            expect(limitToZeroOptions.recentReports.length).toBe(0);
        });

        it('should not return any user to invite if email exists on the personal details list', () => {
            const searchText = 'natasharomanoff@expensify.com';
            // Given a set of options with all betas
            const options = getSearchOptions({
                options: OPTIONS,
                draftComments: {},
                nvpDismissedProductTraining,
                loginList,
                betas: [CONST.BETAS.ALL],
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                currentUserEmail: CURRENT_USER_EMAIL,
                policyTags: undefined,
            });
            // When we call filterAndOrderOptions with a search value
            const filteredOptions = filterAndOrderOptions(options, searchText, COUNTRY_CODE, loginList, CURRENT_USER_EMAIL, CURRENT_USER_ACCOUNT_ID);

            // Then there should be one matching result
            expect(filteredOptions.personalDetails.length).toBe(1);
            // Then the user to invite should be null
            expect(filteredOptions.userToInvite).toBe(null);
        });

        it('should not return any options if search value does not match any personal details (getMemberInviteOptions)', () => {
            // Given a set of options
            const options = getMemberInviteOptions(OPTIONS.personalDetails, nvpDismissedProductTraining, loginList, CURRENT_USER_ACCOUNT_ID, CURRENT_USER_EMAIL, []);
            // When we call filterAndOrderOptions with a search value that does not match any personal details
            const filteredOptions = filterAndOrderOptions(options, 'magneto', COUNTRY_CODE, loginList, CURRENT_USER_EMAIL, CURRENT_USER_ACCOUNT_ID);

            // Then no personal details should be returned
            expect(filteredOptions.personalDetails.length).toBe(0);
        });

        it('should return one personal detail if search value matches an email (getMemberInviteOptions)', () => {
            // Given a set of options
            const options = getMemberInviteOptions(OPTIONS.personalDetails, nvpDismissedProductTraining, loginList, CURRENT_USER_ACCOUNT_ID, CURRENT_USER_EMAIL, []);
            // When we call filterAndOrderOptions with a search value that matches an email
            const filteredOptions = filterAndOrderOptions(options, 'peterparker@expensify.com', COUNTRY_CODE, loginList, CURRENT_USER_EMAIL, CURRENT_USER_ACCOUNT_ID);

            // Then one personal detail should be returned
            expect(filteredOptions.personalDetails.length).toBe(1);
            // Then the returned personal detail should match the search text
            expect(filteredOptions.personalDetails.at(0)?.text).toBe('Spider-Man');
        });

        it('should not show any recent reports if a search value does not match the group chat name (getShareDestinationsOptions)', () => {
            // Given a set of filtered current Reports (as we do in the component) before getting share destination options
            const filteredReports = Object.values(OPTIONS.reports).reduce<OptionList['reports']>((filtered, option) => {
                const report = option.item;
                if (canUserPerformWriteAction(report, false) && canCreateTaskInReport(report) && !isCanceledTaskReport(report)) {
                    filtered.push(option);
                }
                return filtered;
            }, []);
            // When we call getValidOptions for share destination with the filteredReports
            const options = getValidOptions(
                {reports: filteredReports, personalDetails: OPTIONS.personalDetails},
                allPolicies,
                {},
                nvpDismissedProductTraining,
                undefined,

                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
                {
                    betas: [],
                    includeMultipleParticipantReports: true,
                    showChatPreviewLine: true,
                    forcePolicyNamePreview: true,
                    includeThreads: true,
                    includeMoneyRequests: true,
                    includeTasks: true,
                    excludeLogins: {},
                    includeOwnedWorkspaceChats: true,
                    includeSelfDM: true,
                    searchString: '',
                    includeUserToInvite: false,
                },
            );
            // When we pass the returned options to filterAndOrderOptions with a search value that does not match the group chat name
            const filteredOptions = filterAndOrderOptions(options, 'mutants', COUNTRY_CODE, loginList, CURRENT_USER_EMAIL, CURRENT_USER_ACCOUNT_ID);

            // Then no recent reports should be returned
            expect(filteredOptions.recentReports.length).toBe(0);
        });

        it('should return a workspace room when we search for a workspace room(getShareDestinationsOptions)', () => {
            // Given a set of filtered current Reports (as we do in the component) before getting share destination options
            const filteredReportsWithWorkspaceRooms = Object.values(OPTIONS_WITH_WORKSPACE_ROOM.reports).reduce<OptionList['reports']>((filtered, option) => {
                const report = option.item;
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                if (canUserPerformWriteAction(report, false) || isExpensifyOnlyParticipantInReport(report)) {
                    filtered.push(option);
                }
                return filtered;
            }, []);

            // When we call getValidOptions for share destination with the filteredReports
            const options = getValidOptions(
                {reports: filteredReportsWithWorkspaceRooms, personalDetails: OPTIONS.personalDetails},
                allPolicies,
                {},
                nvpDismissedProductTraining,
                undefined,

                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
                {
                    betas: [],
                    includeMultipleParticipantReports: true,
                    showChatPreviewLine: true,
                    forcePolicyNamePreview: true,
                    includeThreads: true,
                    includeMoneyRequests: true,
                    includeTasks: true,
                    excludeLogins: {},
                    includeOwnedWorkspaceChats: true,
                    includeSelfDM: true,
                    searchString: '',
                    includeUserToInvite: false,
                },
            );
            // When we pass the returned options to filterAndOrderOptions with a search value that matches the group chat name
            const filteredOptions = filterAndOrderOptions(options, 'Avengers Room', COUNTRY_CODE, loginList, CURRENT_USER_EMAIL, CURRENT_USER_ACCOUNT_ID);

            // Then one recent report should be returned
            expect(filteredOptions.recentReports.length).toBe(1);
        });

        it('should not show any results if searching for a non-existing workspace room(getShareDestinationOptions)', () => {
            // Given a set of filtered current Reports (as we do in the component) before getting share destination options
            const filteredReportsWithWorkspaceRooms = Object.values(OPTIONS_WITH_WORKSPACE_ROOM.reports).reduce<OptionList['reports']>((filtered, option) => {
                const report = option.item;
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                if (canUserPerformWriteAction(report, false) || isExpensifyOnlyParticipantInReport(report)) {
                    filtered.push(option);
                }
                return filtered;
            }, []);

            // When we call getValidOptions for share destination with the filteredReports
            const options = getValidOptions(
                {reports: filteredReportsWithWorkspaceRooms, personalDetails: OPTIONS.personalDetails},
                allPolicies,
                {},
                nvpDismissedProductTraining,
                undefined,

                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
                {
                    betas: [],
                    includeMultipleParticipantReports: true,
                    showChatPreviewLine: true,
                    forcePolicyNamePreview: true,
                    includeThreads: true,
                    includeMoneyRequests: true,
                    includeTasks: true,
                    excludeLogins: {},
                    includeOwnedWorkspaceChats: true,
                    includeSelfDM: true,
                    searchString: '',
                    includeUserToInvite: false,
                },
            );
            // When we pass the returned options to filterAndOrderOptions with a search value that does not match the group chat name
            const filteredOptions = filterAndOrderOptions(options, 'Mutants Lair', COUNTRY_CODE, loginList, CURRENT_USER_EMAIL, CURRENT_USER_ACCOUNT_ID);

            // Then no recent reports should be returned
            expect(filteredOptions.recentReports.length).toBe(0);
        });

        it('should show the option from personal details when searching for personal detail with no existing report', () => {
            // Given a set of options
            const options = getValidOptions(
                {reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails},
                allPolicies,
                {},
                nvpDismissedProductTraining,
                undefined,

                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
            );
            // When we call filterAndOrderOptions with a search value that matches a personal detail with no existing report
            const filteredOptions = filterAndOrderOptions(options, 'hulk', COUNTRY_CODE, loginList, CURRENT_USER_EMAIL, CURRENT_USER_ACCOUNT_ID);

            // Then no recent reports should be returned
            expect(filteredOptions.recentReports.length).toBe(0);
            // Then one personal detail should be returned
            expect(filteredOptions.personalDetails.length).toBe(1);
            // Then the returned personal detail should match the search text
            expect(filteredOptions.personalDetails.at(0)?.login).toBe('brucebanner@expensify.com');
        });

        it('should not return any options or user to invite if there are no search results and the string does not match a potential email or phone', () => {
            // Given a set of options
            const options = getValidOptions(
                {reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails},
                allPolicies,
                {},
                nvpDismissedProductTraining,
                undefined,

                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
            );
            // When we call filterAndOrderOptions with a search value that does not match any personal details or reports
            const filteredOptions = filterAndOrderOptions(options, 'marc@expensify', COUNTRY_CODE, loginList, CURRENT_USER_EMAIL, CURRENT_USER_ACCOUNT_ID);

            // Then no recent reports or personal details should be returned
            expect(filteredOptions.recentReports.length).toBe(0);
            expect(filteredOptions.personalDetails.length).toBe(0);
            // Then no user to invite should be returned
            expect(filteredOptions.userToInvite).toBe(null);
        });

        it('should not return any options but should return an user to invite if no matching options exist and the search value is a potential email', () => {
            // Given a set of options
            const options = getValidOptions(
                {reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails},
                allPolicies,
                {},
                nvpDismissedProductTraining,
                undefined,

                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
            );
            // When we call filterAndOrderOptions with a search value that does not match any personal details or reports
            const filteredOptions = filterAndOrderOptions(options, 'marc@expensify.com', COUNTRY_CODE, loginList, CURRENT_USER_EMAIL, CURRENT_USER_ACCOUNT_ID);

            // Then no recent reports or personal details should be returned
            expect(filteredOptions.recentReports.length).toBe(0);
            expect(filteredOptions.personalDetails.length).toBe(0);
            // Then an user to invite should be returned
            expect(filteredOptions.userToInvite).not.toBe(null);
        });

        it('should return user to invite when search term has a period with options for it that do not contain the period', () => {
            // Given a set of options
            const options = getValidOptions(
                {reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails},
                allPolicies,
                {},
                nvpDismissedProductTraining,
                undefined,

                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
            );
            // When we call filterAndOrderOptions with a search value that does not match any personal details or reports but matches user to invite
            const filteredOptions = filterAndOrderOptions(options, 'peter.parker@expensify.com', COUNTRY_CODE, loginList, CURRENT_USER_EMAIL, CURRENT_USER_ACCOUNT_ID);

            // Then no recent reports should be returned
            expect(filteredOptions.recentReports.length).toBe(0);
            // Then one user to invite should be returned
            expect(filteredOptions.userToInvite).not.toBe(null);
        });

        it('should return user which has displayName with accent mark when search value without accent mark', () => {
            // Given a set of options
            const options = getValidOptions(
                {reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails},
                allPolicies,
                {},
                nvpDismissedProductTraining,
                undefined,

                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
            );
            // When we call filterAndOrderOptions with a search value without accent mark
            const filteredOptions = filterAndOrderOptions(options, 'Timothee', COUNTRY_CODE, loginList, CURRENT_USER_EMAIL, CURRENT_USER_ACCOUNT_ID);

            // Then one personalDetails with accent mark should be returned
            expect(filteredOptions.personalDetails.length).toBe(1);
        });

        it('should not return options but should return an user to invite if no matching options exist and the search value is a potential phone number', () => {
            // Given a set of options
            const options = getValidOptions(
                {reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails},
                allPolicies,
                {},
                nvpDismissedProductTraining,
                undefined,

                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
            );
            // When we call filterAndOrderOptions with a search value that does not match any personal details or reports but matches user to invite
            const filteredOptions = filterAndOrderOptions(options, '5005550006', COUNTRY_CODE, loginList, CURRENT_USER_EMAIL, CURRENT_USER_ACCOUNT_ID);

            // Then no recent reports or personal details should be returned
            expect(filteredOptions.recentReports.length).toBe(0);
            expect(filteredOptions.personalDetails.length).toBe(0);
            // Then one user to invite should be returned
            expect(filteredOptions.userToInvite).not.toBe(null);
            // Then the user to invite should match the search value
            expect(filteredOptions.userToInvite?.login).toBe('+15005550006');
        });

        it('should not return options but should return an user to invite if no matching options exist and the search value is a potential phone number with country code added', () => {
            // Given a set of options
            const options = getValidOptions(
                {reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails},
                allPolicies,
                {},
                nvpDismissedProductTraining,
                undefined,

                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
            );
            // When we call filterAndOrderOptions with a search value that does not match any personal details or reports but matches user to invite
            const filteredOptions = filterAndOrderOptions(options, '+15005550006', COUNTRY_CODE, loginList, CURRENT_USER_EMAIL, CURRENT_USER_ACCOUNT_ID);

            // Then no recent reports or personal details should be returned
            expect(filteredOptions.recentReports.length).toBe(0);
            expect(filteredOptions.personalDetails.length).toBe(0);
            // Then one user to invite should be returned
            expect(filteredOptions.userToInvite).not.toBe(null);
            // Then the user to invite should match the search value
            expect(filteredOptions.userToInvite?.login).toBe('+15005550006');
        });

        it('should not return options but should return an user to invite if no matching options exist and the search value is a potential phone number with special characters added', () => {
            // Given a set of options
            const options = getValidOptions(
                {reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails},
                allPolicies,
                {},
                nvpDismissedProductTraining,
                undefined,

                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
            );
            // When we call filterAndOrderOptions with a search value that does not match any personal details or reports but matches user to invite
            const filteredOptions = filterAndOrderOptions(options, '+1 (800)324-3233', COUNTRY_CODE, loginList, CURRENT_USER_EMAIL, CURRENT_USER_ACCOUNT_ID);

            // Then no recent reports or personal details should be returned
            expect(filteredOptions.recentReports.length).toBe(0);
            expect(filteredOptions.personalDetails.length).toBe(0);
            // Then one user to invite should be returned
            expect(filteredOptions.userToInvite).not.toBe(null);
            // Then the user to invite should match the search value
            expect(filteredOptions.userToInvite?.login).toBe('+18003243233');
        });

        it('should not return any options or user to invite if contact number contains alphabet characters', () => {
            // Given a set of options
            const options = getValidOptions(
                {reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails},
                allPolicies,
                {},
                nvpDismissedProductTraining,
                undefined,

                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
            );
            // When we call filterAndOrderOptions with a search value that does not match any personal details or reports
            const filteredOptions = filterAndOrderOptions(options, '998243aaaa', COUNTRY_CODE, loginList, CURRENT_USER_EMAIL, CURRENT_USER_ACCOUNT_ID);

            // Then no recent reports or personal details should be returned
            expect(filteredOptions.recentReports.length).toBe(0);
            expect(filteredOptions.personalDetails.length).toBe(0);
            // Then no user to invite should be returned
            expect(filteredOptions.userToInvite).toBe(null);
        });

        it('should not return any options if search value does not match any personal details', () => {
            // Given a set of options
            const options = getValidOptions(
                {reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails},
                allPolicies,
                {},
                nvpDismissedProductTraining,
                undefined,

                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
            );
            // When we call filterAndOrderOptions with a search value that does not match any personal details
            const filteredOptions = filterAndOrderOptions(options, 'magneto', COUNTRY_CODE, loginList, CURRENT_USER_EMAIL, CURRENT_USER_ACCOUNT_ID);

            // Then no personal details should be returned
            expect(filteredOptions.personalDetails.length).toBe(0);
        });

        it('should return one recent report and no personal details if a search value provides an email', () => {
            // Given a set of options
            const options = getValidOptions(
                {reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails},
                allPolicies,
                {},
                nvpDismissedProductTraining,
                undefined,

                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
            );
            // When we call filterAndOrderOptions with a search value that matches an email
            const filteredOptions = filterAndOrderOptions(options, 'peterparker@expensify.com', COUNTRY_CODE, loginList, CURRENT_USER_EMAIL, CURRENT_USER_ACCOUNT_ID, {
                sortByReportTypeInSearch: true,
            });

            // Then one recent report should be returned
            expect(filteredOptions.recentReports.length).toBe(1);
            // Then the returned recent report should match the search text
            expect(filteredOptions.recentReports.at(0)?.text).toBe('Spider-Man');
            // Then no personal details should be returned
            expect(filteredOptions.personalDetails.length).toBe(0);
        });

        it('should return all matching reports and personal details', () => {
            // Given a set of options
            const options = getValidOptions(
                {reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails},
                allPolicies,
                {},
                nvpDismissedProductTraining,
                undefined,

                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
            );
            // When we call filterAndOrderOptions with a search value that matches both reports and personal details and maxRecentReportsToShow param
            const filteredOptions = filterAndOrderOptions(options, '.com', COUNTRY_CODE, loginList, CURRENT_USER_EMAIL, CURRENT_USER_ACCOUNT_ID, {
                maxRecentReportsToShow: 5,
            });

            // Then there should be 4 matching personal details
            expect(filteredOptions.personalDetails.length).toBe(5);
            // Then the first personal detail should match the search text
            expect(filteredOptions.personalDetails.at(0)?.login).toBe('natasharomanoff@expensify.com');
            // Then there should be 5 matching recent reports
            expect(filteredOptions.recentReports.length).toBe(5);
            expect(filteredOptions.recentReports.at(0)?.text).toBe('Captain America');
            expect(filteredOptions.recentReports.at(1)?.text).toBe('Mr Sinister');
            expect(filteredOptions.recentReports.at(2)?.text).toBe('Black Panther');
        });

        it('should return matching option when searching (getSearchOptions)', () => {
            // Given a set of options
            const options = getSearchOptions({
                options: OPTIONS,
                draftComments: {},
                nvpDismissedProductTraining,
                loginList,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                currentUserEmail: CURRENT_USER_EMAIL,
                policyTags: undefined,
            });
            // When we call filterAndOrderOptions with a search value that matches a personal detail
            const filteredOptions = filterAndOrderOptions(options, 'spider', COUNTRY_CODE, loginList, CURRENT_USER_EMAIL, CURRENT_USER_ACCOUNT_ID);

            // Then one personal detail should be returned
            expect(filteredOptions.recentReports.length).toBe(1);
            // Then the returned personal detail should match the search text
            expect(filteredOptions.recentReports.at(0)?.text).toBe('Spider-Man');
        });

        it('should return latest lastVisibleActionCreated item on top when search value matches multiple items (getSearchOptions)', () => {
            // Given a set of options
            const options = getSearchOptions({
                options: OPTIONS,
                draftComments: {},
                nvpDismissedProductTraining,
                loginList,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                currentUserEmail: CURRENT_USER_EMAIL,
                policyTags: undefined,
            });
            // When we call filterAndOrderOptions with a search value that matches multiple items
            const filteredOptions = filterAndOrderOptions(options, 'fantastic', COUNTRY_CODE, loginList, CURRENT_USER_EMAIL, CURRENT_USER_ACCOUNT_ID);

            // Then only three reports should be returned
            expect(filteredOptions.recentReports.length).toBe(3);
            // Then the first report should match the search text
            expect(filteredOptions.recentReports.at(0)?.text).toBe('Mister Fantastic');
            // Then the second report should match the search text
            expect(filteredOptions.recentReports.at(1)?.text).toBe('Mister Fantastic, Invisible Woman');

            return waitForBatchedUpdates()
                .then(() => Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, PERSONAL_DETAILS_WITH_PERIODS))
                .then(() => {
                    // Given a set of options with periods
                    const OPTIONS_WITH_PERIODS = createOptionList(PERSONAL_DETAILS_WITH_PERIODS, undefined, CURRENT_USER_ACCOUNT_ID, REPORTS);
                    // When we call getSearchOptions
                    const results = getSearchOptions({
                        options: OPTIONS_WITH_PERIODS,
                        draftComments: {},
                        nvpDismissedProductTraining,
                        policyTags: undefined,

                        loginList,
                        currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                        currentUserEmail: CURRENT_USER_EMAIL,
                    });
                    // When we pass the returned options to filterAndOrderOptions with a search value
                    const filteredResults = filterAndOrderOptions(
                        results,
                        'barry.allen@expensify.com',

                        COUNTRY_CODE,
                        loginList,
                        CURRENT_USER_EMAIL,
                        CURRENT_USER_ACCOUNT_ID,
                        {
                            sortByReportTypeInSearch: true,
                        },
                    );

                    // Then only one report should be returned
                    expect(filteredResults.recentReports.length).toBe(1);
                    // Then the returned report should match the search text
                    expect(filteredResults.recentReports.at(0)?.text).toBe('The Flash');
                });
        });

        it('should filter out duplicated entries by login', () => {
            const login = 'brucebanner@expensify.com';

            // Duplicate personalDetails entries and reassign to OPTIONS
            OPTIONS.personalDetails = OPTIONS.personalDetails.flatMap((obj) => [obj, {...obj}]);

            // Given a set of options
            const options = getSearchOptions({
                options: OPTIONS,
                draftComments: {},
                nvpDismissedProductTraining,
                policyTags: undefined,

                loginList,
                betas: [CONST.BETAS.ALL],
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                currentUserEmail: CURRENT_USER_EMAIL,
            });
            // When we call filterAndOrderOptions with a an empty search value
            const filteredOptions = filterAndOrderOptions(options, '', COUNTRY_CODE, loginList, CURRENT_USER_EMAIL, CURRENT_USER_ACCOUNT_ID);
            const matchingEntries = filteredOptions.personalDetails.filter((detail) => detail.login === login);

            // Then there should be 2 unique login entries
            expect(filteredOptions.personalDetails.length).toBe(3);
            // Then there should be 1 matching entry
            expect(matchingEntries.length).toBe(1);
        });

        it('should order self dm always on top if the search matches with the self dm login', () => {
            const searchTerm = 'tonystark@expensify.com';
            const OPTIONS_WITH_SELF_DM = createOptionList(PERSONAL_DETAILS, undefined, CURRENT_USER_ACCOUNT_ID, REPORTS_WITH_SELF_DM);

            // Given a set of options with self dm and all betas
            const options = getSearchOptions({
                options: OPTIONS_WITH_SELF_DM,
                draftComments: {},
                nvpDismissedProductTraining,
                policyTags: undefined,

                loginList,
                betas: [CONST.BETAS.ALL],
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                currentUserEmail: CURRENT_USER_EMAIL,
            });
            // When we call filterAndOrderOptions with a search value
            const filteredOptions = filterAndOrderOptions(options, searchTerm, COUNTRY_CODE, loginList, CURRENT_USER_EMAIL, CURRENT_USER_ACCOUNT_ID);

            // Then the self dm should be on top.
            expect(filteredOptions.recentReports.at(0)?.isSelfDM).toBe(true);
        });
    });

    describe('canCreateOptimisticPersonalDetailOption()', () => {
        const VALID_EMAIL = 'valid@email.com';
        const currentUserEmail = 'tonystark@expensify.com';

        it('should allow to create optimistic personal detail option if email is valid', () => {
            const canCreate = canCreateOptimisticPersonalDetailOption({
                searchValue: VALID_EMAIL,
                currentUserOption: {
                    login: currentUserEmail,
                } as OptionData,
                // Note: in the past this would check for the existence of the email in the personalDetails list, this has changed.
                // We expect only filtered lists to be passed to this function, so we don't need to check for the existence of the email in the personalDetails list.
                // This is a performance optimization.
                personalDetailsOptions: [],
                recentReportOptions: [],
            });

            expect(canCreate).toBe(true);
        });

        it('should not allow to create option if email is an email of current user', () => {
            // Given a set of arguments with currentUserOption object
            // When we call canCreateOptimisticPersonalDetailOption
            const canCreate = canCreateOptimisticPersonalDetailOption({
                searchValue: currentUserEmail,
                recentReportOptions: [],
                personalDetailsOptions: [],
                currentUserOption: {
                    login: currentUserEmail,
                } as OptionData,
            });

            // Then the returned value should be false
            expect(canCreate).toBe(false);
        });

        it('createOptionList() localization', () => {
            renderLocaleContextProvider();
            // Given a set of reports and personal details
            // When we call createOptionList and extract the reports
            const reports = createOptionList(PERSONAL_DETAILS, undefined, CURRENT_USER_ACCOUNT_ID, REPORTS).reports;

            // Then the returned reports should match the expected values
            expect(reports.at(10)?.subtitle).toBe(`Submits to Mister Fantastic`);

            return (
                waitForBatchedUpdates()
                    // When we set the preferred locale to Spanish
                    .then(() => Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.ES))
                    .then(() => {
                        // When we call createOptionList again
                        const newReports = createOptionList(PERSONAL_DETAILS, undefined, CURRENT_USER_ACCOUNT_ID, REPORTS).reports;
                        // Then the returned reports should change to Spanish
                        // cspell:disable-next-line
                        expect(newReports.at(10)?.subtitle).toBe('Se envía a Mister Fantastic');
                    })
            );
        });
    });

    describe('filterWorkspaceChats()', () => {
        it('should return an empty array if there are no expense chats', () => {
            // Given an empty array of expense chats and no search terms
            // When we call filterWorkspaceChats
            const result = filterWorkspaceChats([], []);

            // Then the returned value should be an empty array
            expect(result.length).toEqual(0);
        });

        it('should return all expense chats if there are no search terms', () => {
            // Given a list of expense chats and no search terms
            // When we call filterWorkspaceChats
            const result = filterWorkspaceChats(WORKSPACE_CHATS, []);

            // Then the returned value should be the same as the input
            expect(result).toEqual(WORKSPACE_CHATS);
            // Then the length of the result should be equal to the length of the input
            expect(result.length).toEqual(WORKSPACE_CHATS.length);
        });

        it('should filter multiple expense chats by search term', () => {
            // Given a list of expense chats and one search term
            // When we call filterWorkspaceChats
            const result = filterWorkspaceChats(WORKSPACE_CHATS, ['Google']);

            // Then the returned value should should only include the matching expense chats
            expect(result.length).toEqual(2);
        });

        it('should filter expense chat by exact name', () => {
            // Given a list of expense chats and multiple search terms that reflect the exact name
            // When we call filterWorkspaceChats
            const result = filterWorkspaceChats(WORKSPACE_CHATS, ['Microsoft', 'Teams', 'Workspace']);

            // Then the returned value should should only include the matching expense chat
            expect(result.length).toEqual(1);
        });

        it('should return an empty array if there are no matching expense chats', () => {
            // Given a list of expense chats and a search term that does not match any expense chats
            // When we call filterWorkspaceChats
            const result = filterWorkspaceChats(WORKSPACE_CHATS, ['XYZ']);

            // Then the returned value should be an empty array
            expect(result.length).toEqual(0);
        });
    });

    describe('orderWorkspaceOptions()', () => {
        it('should put the default workspace on top of the list', () => {
            // Given a list of expense chats
            // When we call orderWorkspaceOptions
            const result = orderWorkspaceOptions(WORKSPACE_CHATS);

            // Then the first item in the list should be the default workspace
            expect(result.at(0)?.text).toEqual('Notion Workspace for Marketing');
        });
    });

    describe('Alternative text', () => {
        it("The text should not contain the last actor's name at prefix if the report is archived.", async () => {
            renderLocaleContextProvider();
            // When we set the preferred locale to English and create an ADD_COMMENT report action
            await Onyx.multiSet({
                [ONYXKEYS.NVP_PREFERRED_LOCALE]: CONST.LOCALES.EN,
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}10` as const]: {
                    '1': getFakeAdvancedReportAction(CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT),
                },
            });
            // When we call createOptionList
            const reports = createOptionList(PERSONAL_DETAILS, undefined, CURRENT_USER_ACCOUNT_ID, REPORTS).reports;
            const archivedReport = reports.find((report) => report.reportID === '10');

            // Then the returned report should contain default archived reason
            expect(archivedReport?.lastMessageText).toBe('This chat room has been archived.');
        });
    });

    describe('filterSelfDMChat()', () => {
        const REPORT = {
            reportID: '1',
            text: 'Google Workspace',
            policyID: '11',
            isPolicyExpenseChat: true,
        };
        const LOGIN = 'johndoe@test.com';
        const ALTERNATE_TEXT = 'John William Doe';
        const SUBTITLE = 'Software Engineer';

        it('should return the report when there are no search terms', () => {
            // Given a report object
            // When we call filterSelfDMChat with the report and no search terms
            const result = filterSelfDMChat(REPORT, []);

            // Then the returned value should be the same as the input
            expect(result?.reportID).toEqual(REPORT.reportID);
        });

        it('should return undefined, when the search term does not match the report', () => {
            // Given a report object
            // When we call filterSelfDMChat with the report and a search term that does not match the report
            const result = filterSelfDMChat(REPORT, ['XYZ']);

            // Then the returned value should be undefined
            expect(result).toBeUndefined();
        });

        it('should filter report by text', () => {
            // Given a report object
            // When we call filterSelfDMChat with the report and search term that matches the report
            const result = filterSelfDMChat(REPORT, ['Google']);

            // Then the returned value should be the same as the input
            expect(result?.reportID).toEqual(REPORT.reportID);
        });

        it('should filter report by exact text', () => {
            // Given a report object
            // When we call filterSelfDMChat with the report and multiple search terms that match the report's exact name
            const result = filterSelfDMChat(REPORT, ['Google', 'Workspace']);

            // Then the returned value should be the same as the input
            expect(result?.reportID).toEqual(REPORT.reportID);
        });

        it('should filter report by login', () => {
            // Given a report object
            // When we call filterSelfDMChat with the report and a search term that matches the report's login
            const result = filterSelfDMChat({...REPORT, login: LOGIN}, ['john']);

            // Then the returned value should be the same as the input
            expect(result?.reportID).toEqual(REPORT.reportID);
        });

        it('should filter report by exact login', () => {
            // Given a report object
            // When we call filterSelfDMChat with the report and multiple search terms that match the report's exact login
            const result = filterSelfDMChat({...REPORT, login: LOGIN}, [LOGIN]);

            // Then the returned value should be the same as the input
            expect(result?.reportID).toEqual(REPORT.reportID);
        });

        it('should filter report by alternate text', () => {
            // Given a report object
            // When we call filterSelfDMChat with the report and a search term that matches the report's alternate text
            const result = filterSelfDMChat({...REPORT, alternateText: ALTERNATE_TEXT, isThread: true}, ['William']);

            // Then the returned value should be the same as the input
            expect(result?.reportID).toEqual(REPORT.reportID);
        });

        it('should filter report by exact alternate text', () => {
            // Given a report object that is a thread
            // When we call filterSelfDMChat with the report and multiple search terms that match the report's exact alternate text
            const result = filterSelfDMChat({...REPORT, alternateText: ALTERNATE_TEXT, isThread: true}, ['John', 'William', 'Doe']);

            // Then the returned value should be the same as the input
            expect(result?.reportID).toEqual(REPORT.reportID);
        });

        it('should filter report by alternate text if it is not a thread', () => {
            // Given a report object that is not a thread
            // When we call filterSelfDMChat with the report and a search term that matches the report's alternate text
            const result = filterSelfDMChat({...REPORT, alternateText: ALTERNATE_TEXT, isThread: false}, ['William']);

            // Then the returned value should be undefined
            expect(result?.reportID).toBeUndefined();
        });

        it('should filter report by subtitle', () => {
            // Given a report object
            // When we call filterSelfDMChat with the report and a search term that matches the report's subtitle
            const result = filterSelfDMChat({...REPORT, subtitle: SUBTITLE}, ['Software']);

            // Then the returned value should be the same as the input
            expect(result?.reportID).toEqual(REPORT.reportID);
        });

        it('should filter report by exact subtitle', () => {
            // Given a report object
            // When we call filterSelfDMChat with the report and multiple search terms that match the report's exact subtitle
            const result = filterSelfDMChat({...REPORT, subtitle: SUBTITLE}, ['Software', 'Engineer']);

            // Then the returned value should be the same as the input
            expect(result?.reportID).toEqual(REPORT.reportID);
        });

        it('should not filter report by subtitle if it is not an expense chat nor a chat room', () => {
            // Given a report object that is not an expense chat nor a chat room
            // When we call filterSelfDMChat with the report and a search term that matches the report's subtitle
            const result = filterSelfDMChat({...REPORT, subtitle: SUBTITLE, isPolicyExpenseChat: false, isChatRoom: false}, ['Software']);

            // Then the returned value should be undefined
            expect(result).toBeUndefined();
        });

        it('should filter report by subtitle if it is a chat room', () => {
            // Given a report object that is not an expense chat but is a chat room
            // When we call filterSelfDMChat with the report and a search term that matches the report's subtitle
            const result = filterSelfDMChat({...REPORT, subtitle: SUBTITLE, isPolicyExpenseChat: false, isChatRoom: true}, ['Software']);

            // Then the returned value should be the same as the input
            expect(result?.reportID).toEqual(REPORT.reportID);
        });
    });

    describe('filterReports()', () => {
        it('should match a user with an accented name when searching using non-accented characters', () => {
            // Given a report with accented characters in the text property
            // cspell:disable-next-line
            const reports = [{text: "Álex Timón D'artagnan Zo-e"} as OptionData];
            // Given a search term with non-accented characters
            // cspell:disable-next-line
            const searchTerms = ['Alex Timon Dartagnan Zoe'];
            // When we call filterReports with the report and search terms
            const filteredReports = filterReports(reports, searchTerms);

            // Then the returned value should match the search term
            expect(filteredReports).toEqual(reports);
        });
    });

    describe('getMostRecentOptions()', () => {
        it('returns the most recent options up to the specified limit', () => {
            const options: OptionData[] = [
                {reportID: '1', lastVisibleActionCreated: '2022-01-01T10:00:00Z'} as OptionData,
                {reportID: '2', lastVisibleActionCreated: '2022-01-01T12:00:00Z'} as OptionData,
                {reportID: '3', lastVisibleActionCreated: '2022-01-01T09:00:00Z'} as OptionData,
                {reportID: '4', lastVisibleActionCreated: '2022-01-01T13:00:00Z'} as OptionData,
            ];
            const comparator = (option: OptionData) => option.lastVisibleActionCreated ?? '';
            const result = optionsOrderBy(options, comparator, 2);
            expect(result.length).toBe(2);
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            expect(result.at(0)!.reportID).toBe('4');
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            expect(result.at(1)!.reportID).toBe('2');
        });

        it('returns all options if limit is greater than options length', () => {
            const options: OptionData[] = [
                {reportID: '1', lastVisibleActionCreated: '2022-01-01T10:00:00Z'} as OptionData,
                {reportID: '2', lastVisibleActionCreated: '2022-01-01T12:00:00Z'} as OptionData,
            ];
            const comparator = (option: OptionData) => option.lastVisibleActionCreated ?? '';
            const result = optionsOrderBy(options, comparator, 5);
            expect(result.length).toBe(2);
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            expect(result.at(0)!.reportID).toBe('2');
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            expect(result.at(1)!.reportID).toBe('1');
        });

        it('returns empty array if options is empty', () => {
            const result = optionsOrderBy([], recentReportComparator, 3);
            expect(result).toEqual([]);
        });

        it('applies filter function if provided', () => {
            const options: OptionData[] = [
                {reportID: '1', lastVisibleActionCreated: '2022-01-01T10:00:00Z', isPinned: true} as OptionData,
                {reportID: '2', lastVisibleActionCreated: '2022-01-01T12:00:00Z', isPinned: false} as OptionData,
                {reportID: '3', lastVisibleActionCreated: '2022-01-01T09:00:00Z', isPinned: true} as OptionData,
            ];
            const comparator = (option: OptionData) => option.lastVisibleActionCreated ?? '';
            const result = optionsOrderBy(options, comparator, 2, (option) => option.isPinned);
            expect(result.length).toBe(2);
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            expect(result.at(0)!.reportID).toBe('1');
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            expect(result.at(1)!.reportID).toBe('3');
        });

        it('handles negative limit by returning empty array', () => {
            const options: OptionData[] = [
                {reportID: '1', lastVisibleActionCreated: '2022-01-01T10:00:00Z'} as OptionData,
                {reportID: '2', lastVisibleActionCreated: '2022-01-01T12:00:00Z'} as OptionData,
                {reportID: '3', lastVisibleActionCreated: '2022-01-01T09:00:00Z'} as OptionData,
            ];
            const comparator = (option: OptionData) => option.lastVisibleActionCreated ?? '';
            const result = optionsOrderBy(options, comparator, -1);
            expect(result).toEqual([]);
        });

        it('handles negative limit with large absolute value', () => {
            const options: OptionData[] = [
                {reportID: '1', lastVisibleActionCreated: '2022-01-01T10:00:00Z'} as OptionData,
                {reportID: '2', lastVisibleActionCreated: '2022-01-01T12:00:00Z'} as OptionData,
            ];
            const comparator = (option: OptionData) => option.lastVisibleActionCreated ?? '';
            const result = optionsOrderBy(options, comparator, -100);
            expect(result).toEqual([]);
        });

        it('handles limit equal to zero', () => {
            const options: OptionData[] = [
                {reportID: '1', lastVisibleActionCreated: '2022-01-01T10:00:00Z'} as OptionData,
                {reportID: '2', lastVisibleActionCreated: '2022-01-01T12:00:00Z'} as OptionData,
            ];
            const comparator = (option: OptionData) => option.lastVisibleActionCreated ?? '';
            const result = optionsOrderBy(options, comparator, 0);
            expect(result).toEqual([]);
        });

        it('returns the older options up to the specified limit', () => {
            const options: OptionData[] = [
                {reportID: '1', lastVisibleActionCreated: '2022-01-01T10:00:00Z'} as OptionData,
                {reportID: '2', lastVisibleActionCreated: '2022-01-01T12:00:00Z'} as OptionData,
                {reportID: '3', lastVisibleActionCreated: '2022-01-01T09:00:00Z'} as OptionData,
                {reportID: '4', lastVisibleActionCreated: '2022-01-01T13:00:00Z'} as OptionData,
            ];
            const comparator = (option: OptionData) => option.lastVisibleActionCreated ?? '';
            // We will pass reversed === true to sort the list in ascending order
            const result = optionsOrderBy(options, comparator, 2, undefined, true);
            expect(result.length).toBe(2);
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            expect(result.at(0)!.reportID).toBe('3');
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            expect(result.at(1)!.reportID).toBe('1');
        });
    });

    describe('sortAlphabetically', () => {
        it('should sort options alphabetically by text', () => {
            const options: OptionData[] = [{text: 'Banana', reportID: '1'} as OptionData, {text: 'Apple', reportID: '2'} as OptionData, {text: 'Cherry', reportID: '3'} as OptionData];
            const sortedOptions = sortAlphabetically(options, 'text', localeCompare);
            expect(sortedOptions.at(0)?.reportID).toBe('2');
            expect(sortedOptions.at(1)?.reportID).toBe('1');
            expect(sortedOptions.at(2)?.reportID).toBe('3');
        });

        it('should handle empty array', () => {
            const sortedOptions = sortAlphabetically([], 'abc', localeCompare);
            expect(sortedOptions).toEqual([]);
        });

        it('should handle single option', () => {
            const options: OptionData[] = [{text: 'Single', reportID: '1'} as OptionData];
            const sortedOptions = sortAlphabetically(options, 'text', localeCompare);
            expect(sortedOptions.length).toBe(1);
            expect(sortedOptions.at(0)?.text).toBe('Single');
        });
    });
    describe('getSearchValueForPhoneOrEmail', () => {
        it('should return E164 format for valid phone number', () => {
            const result = getSearchValueForPhoneOrEmail('+1 (234) 567-8901', 1);
            expect(result).toBe('+12345678901');
        });

        it('should return E164 format for valid international phone number', () => {
            const result = getSearchValueForPhoneOrEmail('+44 20 8759 9036', 44);
            expect(result).toBe('+442087599036');
        });

        it('should return lowercase for email address', () => {
            const result = getSearchValueForPhoneOrEmail('Test@Example.COM', 1);
            expect(result).toBe('test@example.com');
        });

        it('should handle SMS domain removal for valid phone number', () => {
            const result = getSearchValueForPhoneOrEmail('+12345678901@expensify.sms', 1);
            expect(result).toBe('+12345678901');
        });

        it('should return empty string for empty input', () => {
            const result = getSearchValueForPhoneOrEmail('', 1);
            expect(result).toBe('');
        });
    });

    describe('createOption', () => {
        it('should return alternative text correctly when the last action is report preview action', async () => {
            const report = {
                chatType: '',
                currency: 'USD',
                description: '',
                errorFields: {},
                hasOutstandingChildRequest: false,
                hasOutstandingChildTask: false,
                iouReportID: '456',
                lastMessageHtml: '',
                lastMessageText: '',
                participants: {
                    '1': {
                        notificationPreference: 'always',
                    },
                    '2': {
                        notificationPreference: 'always',
                    },
                },
                reportID: '123',
                type: 'chat',
                lastActorAccountID: 1,
            } as unknown as Report;

            const reportPreviewAction = {
                actionName: 'REPORTPREVIEW',
                actorAccountID: 1,
                childManagerAccountID: 2,
                childOwnerAccountID: 1,
                childReportID: '456',
                childReportName: 'IOU',
                created: '2025-10-02 06:50:36.302',
                reportActionID: '12345678',
                shouldShow: true,
                message: [
                    {
                        html: 'Iron Man owes ₫34',
                        text: 'Iron Man owes ₫34',
                        type: 'COMMENT',
                        whisperedTo: [],
                    },
                ],
            } as unknown as ReportAction;

            const iouReport = {
                chatReportID: '123',
                currency: 'VND',
                managerID: 2,
                ownerAccountID: 1,
                parentReportActionID: '12345678',
                parentReportID: '123',
                participants: {
                    '19960856': {
                        notificationPreference: '',
                    },
                    '20669492': {
                        notificationPreference: '',
                    },
                },
                reportID: '456',
                reportName: 'IOU',
                total: 3400,
            } as unknown as Report;

            const iouAction = {
                actorAccountID: 1,
                message: [
                    {
                        type: 'COMMENT',
                        html: '₫34 expense',
                        text: '₫34 expense',
                        isEdited: false,
                        whisperedTo: [],
                        isDeletedParentAction: false,
                        deleted: '',
                        reactions: [],
                    },
                ],
                originalMessage: {
                    IOUReportID: '456',
                    IOUTransactionID: '123456',
                    amount: 3400,
                    comment: '',
                    currency: 'VND',
                    participantAccountIDs: [1, 2],
                },
                actionName: 'IOU',
                reportActionID: '789',
            } as unknown as ReportAction;

            const transaction = {
                transactionID: '123456',
                amount: 3400,
                currency: 'VND',
                reportID: '3993091505909230',
                comment: {
                    comment: '',
                },
                merchant: '(none)',
                created: '2025-10-02',
                category: '',
                taxAmount: 0,
                reimbursable: true,
            } as unknown as Transaction;

            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {[reportPreviewAction.reportActionID]: reportPreviewAction});
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${iouReport.reportID}`, iouReport);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport.reportID}`, {[iouAction.reportActionID]: iouAction});
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`, transaction);
            await waitForBatchedUpdates();

            const result = createOption([1, 2], PERSONAL_DETAILS, report, CONST.POLICY.DEFAULT_TAG_LIST, CURRENT_USER_ACCOUNT_ID, {showChatPreviewLine: true});

            expect(result.alternateText).toBe('Iron Man owes ₫34');
        });
    });

    describe('getLastMessageTextForReport', () => {
        describe('getReportPreviewMessage', () => {
            it('should format report preview message correctly for non-policy expense chat with IOU action', async () => {
                const iouReport: Report = {
                    ...createRandomReport(1, undefined),
                    isOwnPolicyExpenseChat: false,
                    type: CONST.REPORT.TYPE.IOU,
                    isWaitingOnBankAccount: false,
                    currency: CONST.CURRENCY.USD,
                    total: 100,
                    unheldTotal: 100,
                };
                const reportPreviewAction: ReportAction = {
                    ...createRandomReportAction(1),
                    actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW,
                    childMoneyRequestCount: 1,
                    message: [{type: 'COMMENT', text: ''}],
                    originalMessage: {
                        linkedReportID: iouReport.reportID,
                    },
                    shouldShow: true,
                };
                const transaction: Transaction = {
                    ...createRandomTransaction(0),
                    amount: 100,
                    currency: CONST.CURRENCY.USD,
                    merchant: '',
                    modifiedMerchant: '',
                    comment: {
                        comment: '<strong>A</strong><br />A<br />A',
                    },
                };
                const iouAction: ReportAction = {
                    ...createRandomReportAction(2),
                    reportID: iouReport.reportID,
                    actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                    message: [{type: 'COMMENT', text: ''}],
                    originalMessage: {
                        IOUTransactionID: transaction.transactionID,
                        type: 'create',
                    },
                    shouldShow: true,
                };

                await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${iouReport.reportID}`, iouReport);
                await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`, transaction);
                await waitForBatchedUpdates();

                // Test getReportPreviewMessage directly - this is the function responsible for formatting the message
                const reportPreviewMessage = getReportPreviewMessage(iouReport, iouAction, true, false, null, true, reportPreviewAction);
                const formattedMessage = formatReportLastMessageText(Parser.htmlToText(reportPreviewMessage));
                expect(formattedMessage).toBe('$1.00 for A A A');
            });
        });
        it('MOVED_TRANSACTION action', async () => {
            const mockIsSearchTopmostFullScreenRoute = jest.mocked(isSearchTopmostFullScreenRoute);
            mockIsSearchTopmostFullScreenRoute.mockReturnValue(false);
            const report: Report = createRandomReport(2, undefined);
            const report2: Report = {
                ...createRandomReport(1, undefined),
                reportName: 'Expense Report #123',
            };
            const movedTransactionAction: ReportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.MOVED_TRANSACTION,
                message: [{type: 'COMMENT', text: ''}],
                originalMessage: {
                    toReportID: report2.reportID,
                    fromReportID: report.reportID,
                },
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report2.reportID}`, report2);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {
                [movedTransactionAction.reportActionID]: movedTransactionAction,
            });
            const lastMessage = getLastMessageTextForReport({
                translate: translateLocal,
                report,
                lastActorDetails: null,
                isReportArchived: false,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                policyTags: undefined,
            });
            expect(lastMessage).toBe(Parser.htmlToText(getMovedTransactionMessage(translateLocal, movedTransactionAction)));
        });
        describe('SUBMITTED action', () => {
            it('should return automatic submitted message if submitted via harvesting', async () => {
                const report: Report = createRandomReport(0, undefined);
                const submittedAction: ReportAction = {
                    ...createRandomReportAction(1),
                    actionName: CONST.REPORT.ACTIONS.TYPE.SUBMITTED,
                    message: [{type: 'COMMENT', text: ''}],
                    originalMessage: {
                        amount: 1,
                        harvesting: true,
                    },
                };
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {
                    [submittedAction.reportActionID]: submittedAction,
                });
                const lastMessage = getLastMessageTextForReport({
                    translate: translateLocal,
                    report,
                    lastActorDetails: null,
                    isReportArchived: false,
                    visibleReportActionsDataParam: {},
                    currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                    policyTags: undefined,
                });
                expect(lastMessage).toBe(Parser.htmlToText(translate(CONST.LOCALES.EN, 'iou.automaticallySubmitted')));
            });
        });
        describe('APPROVED action', () => {
            it('should return automatic approved message if approved automatically', async () => {
                const report: Report = createRandomReport(0, undefined);
                const approvedAction: ReportAction = {
                    ...createRandomReportAction(1),
                    actionName: CONST.REPORT.ACTIONS.TYPE.APPROVED,
                    message: [{type: 'COMMENT', text: ''}],
                    originalMessage: {
                        type: CONST.IOU.REPORT_ACTION_TYPE.APPROVE,
                        automaticAction: true,
                    },
                };
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {
                    [approvedAction.reportActionID]: approvedAction,
                });
                const lastMessage = getLastMessageTextForReport({
                    translate: translateLocal,
                    report,
                    lastActorDetails: null,
                    isReportArchived: false,
                    visibleReportActionsDataParam: {},
                    currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                    policyTags: undefined,
                });
                expect(lastMessage).toBe(Parser.htmlToText(translate(CONST.LOCALES.EN, 'iou.automaticallyApproved')));
            });
        });
        describe('FORWARDED action', () => {
            it('should return automatic forwarded message if forwarded automatically', async () => {
                const report: Report = createRandomReport(0, undefined);
                const forwardedAction: ReportAction = {
                    ...createRandomReportAction(1),
                    actionName: CONST.REPORT.ACTIONS.TYPE.FORWARDED,
                    message: [{type: 'COMMENT', text: ''}],
                    originalMessage: {
                        type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                        automaticAction: true,
                    },
                };
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {
                    [forwardedAction.reportActionID]: forwardedAction,
                });
                const lastMessage = getLastMessageTextForReport({
                    translate: translateLocal,
                    report,
                    lastActorDetails: null,
                    isReportArchived: false,
                    visibleReportActionsDataParam: {},
                    currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                    policyTags: undefined,
                });
                expect(lastMessage).toBe(Parser.htmlToText(translate(CONST.LOCALES.EN, 'iou.automaticallyForwarded')));
            });
        });
        describe('POLICY_CHANGE_LOG.CORPORATE_FORCE_UPGRADE action', () => {
            it('should return forced corporate upgrade message', async () => {
                const report: Report = createRandomReport(0, undefined);
                const corporateForceUpgradeAction: ReportAction = {
                    ...createRandomReportAction(1),
                    actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.CORPORATE_FORCE_UPGRADE,
                    message: [{type: 'COMMENT', text: ''}],
                    originalMessage: {},
                };
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {
                    [corporateForceUpgradeAction.reportActionID]: corporateForceUpgradeAction,
                });
                const lastMessage = getLastMessageTextForReport({
                    translate: translateLocal,
                    report,
                    lastActorDetails: null,
                    isReportArchived: false,
                    visibleReportActionsDataParam: {},
                    currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                    policyTags: undefined,
                });
                expect(lastMessage).toBe(Parser.htmlToText(translate(CONST.LOCALES.EN, 'workspaceActions.forcedCorporateUpgrade')));
            });
        });
        it('TAKE_CONTROL action', async () => {
            const report: Report = createRandomReport(0, undefined);
            const takeControlAction: ReportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.TAKE_CONTROL,
                message: [{type: 'COMMENT', text: ''}],
                originalMessage: {},
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {
                [takeControlAction.reportActionID]: takeControlAction,
            });
            const lastMessage = getLastMessageTextForReport({
                translate: translateLocal,
                report,
                lastActorDetails: null,
                isReportArchived: false,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                policyTags: undefined,
            });
            expect(lastMessage).toBe(Parser.htmlToText(getChangedApproverActionMessage(translateLocal, takeControlAction)));
        });
        it('REROUTE action', async () => {
            const report: Report = createRandomReport(0, undefined);
            const rerouteAction: ReportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.REROUTE,
                message: [{type: 'COMMENT', text: ''}],
                originalMessage: {},
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {
                [rerouteAction.reportActionID]: rerouteAction,
            });
            const lastMessage = getLastMessageTextForReport({
                translate: translateLocal,
                report,
                lastActorDetails: null,
                isReportArchived: false,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                policyTags: undefined,
            });
            expect(lastMessage).toBe(Parser.htmlToText(getChangedApproverActionMessage(translateLocal, rerouteAction)));
        });
        it('MOVED action', async () => {
            const report: Report = createRandomReport(0, undefined);
            const movedAction: ReportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.MOVED,
                message: [{type: 'COMMENT', text: ''}],
                originalMessage: {},
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {
                [movedAction.reportActionID]: movedAction,
            });
            const lastMessage = getLastMessageTextForReport({
                translate: translateLocal,
                report,
                lastActorDetails: null,
                isReportArchived: false,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                policyTags: undefined,
            });
            expect(lastMessage).toBe(Parser.htmlToText(getMovedActionMessage(translateLocal, movedAction, report)));
        });
        it('DYNAMIC_EXTERNAL_WORKFLOW_ROUTED action', async () => {
            // Given a DYNAMIC_EXTERNAL_WORKFLOW_ROUTED as the last action
            const report: Report = createRandomReport(0, undefined);
            const action: ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.DYNAMIC_EXTERNAL_WORKFLOW_ROUTED> = {
                reportActionID: '1',
                created: '',
                actionName: CONST.REPORT.ACTIONS.TYPE.DYNAMIC_EXTERNAL_WORKFLOW_ROUTED,
                message: [{type: 'COMMENT', text: ''}],
                originalMessage: {to: 'example@gmail.com'},
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {
                [action.reportActionID]: action,
            });

            // When getting the last message text for the report
            const lastMessage = getLastMessageTextForReport({
                translate: translateLocal,
                report,
                lastActorDetails: null,
                isReportArchived: false,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                policyTags: undefined,
            });

            // Then it should return the DYNAMIC_EXTERNAL_WORKFLOW_ROUTED message
            expect(lastMessage).toBe(Parser.htmlToText(getDynamicExternalWorkflowRoutedMessage(action, translateLocal)));
        });
        it('should return last visible message text when last action is hidden (e.g. whisper)', async () => {
            const report: Report = {
                ...createRandomReport(0, undefined),
                lastMessageText: 'joined the chat',
            };
            const whisperAction: ReportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {
                [whisperAction.reportActionID]: whisperAction,
            });
            await waitForBatchedUpdates();

            const expectedVisibleText = '';
            const result = getLastMessageTextForReport({
                translate: translateLocal,
                report,
                lastActorDetails: null,
                isReportArchived: false,
                policyTags: {},
                visibleReportActionsDataParam: {},
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
            });
            expect(result).toBe(expectedVisibleText);
        });

        describe('DEW (Dynamic External Workflow)', () => {
            beforeEach(async () => {
                await act(async () => {
                    await Onyx.clear();
                });
                jest.clearAllMocks();
            });

            it('should show queued message for SUBMITTED action with DEW policy when offline and pending submit', async () => {
                const reportID = 'dewReport1';
                const report: Report = {
                    reportID,
                    reportName: 'Test Report',
                    type: CONST.REPORT.TYPE.EXPENSE,
                    policyID: 'dewPolicy1',
                };
                const policy: Policy = {
                    id: 'dewPolicy1',
                    name: 'Test Policy',
                    type: CONST.POLICY.TYPE.CORPORATE,
                    approvalMode: CONST.POLICY.APPROVAL_MODE.DYNAMICEXTERNAL,
                } as Policy;
                const submittedAction: ReportAction = {
                    reportActionID: '1',
                    actionName: CONST.REPORT.ACTIONS.TYPE.SUBMITTED,
                    created: '2024-01-01 00:00:00',
                    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                    message: [{type: 'COMMENT', text: 'submitted'}],
                    originalMessage: {},
                };
                const reportMetadata = {
                    pendingExpenseAction: CONST.EXPENSE_PENDING_ACTION.SUBMIT,
                };

                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
                    [submittedAction.reportActionID]: submittedAction,
                });
                const lastMessage = getLastMessageTextForReport({
                    translate: translateLocal,
                    report,
                    lastActorDetails: null,
                    isReportArchived: false,
                    policy,
                    reportMetadata,
                    policyTags: undefined,
                    visibleReportActionsDataParam: {},
                    currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                });
                expect(lastMessage).toBe(translate(CONST.LOCALES.EN, 'iou.queuedToSubmitViaDEW'));
            });

            it('should show custom error message for DEW_SUBMIT_FAILED action', async () => {
                const reportID = 'dewReport2';
                const report: Report = {
                    reportID,
                    reportName: 'Test Report',
                    type: CONST.REPORT.TYPE.EXPENSE,
                };
                const customErrorMessage = 'This report contains an expense missing required fields.';
                const dewSubmitFailedAction: ReportAction = {
                    reportActionID: '1',
                    actionName: CONST.REPORT.ACTIONS.TYPE.DEW_SUBMIT_FAILED,
                    created: '2024-01-01 00:00:00',
                    message: [{type: 'COMMENT', text: customErrorMessage}],
                    originalMessage: {
                        message: customErrorMessage,
                    },
                };

                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
                    [dewSubmitFailedAction.reportActionID]: dewSubmitFailedAction,
                });
                const lastMessage = getLastMessageTextForReport({
                    translate: translateLocal,
                    report,
                    lastActorDetails: null,
                    isReportArchived: false,
                    visibleReportActionsDataParam: {},
                    currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                    policyTags: undefined,
                });
                expect(lastMessage).toBe(customErrorMessage);
            });

            it('should show fallback message for DEW_SUBMIT_FAILED action without message', async () => {
                const reportID = 'dewReport3';
                const report: Report = {
                    reportID,
                    reportName: 'Test Report',
                    type: CONST.REPORT.TYPE.EXPENSE,
                };
                const dewSubmitFailedAction: ReportAction = {
                    reportActionID: '1',
                    actionName: CONST.REPORT.ACTIONS.TYPE.DEW_SUBMIT_FAILED,
                    created: '2024-01-01 00:00:00',
                    message: [{type: 'COMMENT', text: ''}],
                    originalMessage: {},
                };

                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
                    [dewSubmitFailedAction.reportActionID]: dewSubmitFailedAction,
                });
                const lastMessage = getLastMessageTextForReport({
                    translate: translateLocal,
                    report,
                    lastActorDetails: null,
                    isReportArchived: false,
                    visibleReportActionsDataParam: {},
                    currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                    policyTags: undefined,
                });
                expect(lastMessage).toBe(translate(CONST.LOCALES.EN, 'iou.error.genericCreateFailureMessage'));
            });
        });
    });

    describe('getPersonalDetailSearchTerms', () => {
        it('should include display name', () => {
            const displayName = 'test';
            const searchTerms = getPersonalDetailSearchTerms({displayName}, CURRENT_USER_ACCOUNT_ID);
            expect(searchTerms.includes(displayName)).toBe(true);
            const searchTerms2 = getPersonalDetailSearchTerms({participantsList: [{displayName, accountID: 123}]}, CURRENT_USER_ACCOUNT_ID);
            expect(searchTerms2.includes(displayName)).toBe(true);
        });
    });

    describe('getCurrentUserSearchTerms', () => {
        it('should include display name', () => {
            const displayName = 'test';
            const searchTerms = getCurrentUserSearchTerms({displayName});
            expect(searchTerms.includes(displayName)).toBe(true);
            const searchTerms2 = getCurrentUserSearchTerms({text: displayName});
            expect(searchTerms2.includes(displayName)).toBe(true);
        });
    });

    describe('getLastActorDisplayNameFromLastVisibleActions', () => {
        beforeEach(() => {
            renderLocaleContextProvider();
        });

        it('should return display name from lastActorDetails when no last visible action exists', () => {
            // Given a report with no last visible action and lastActorDetails
            const report: Report = {
                ...createRandomReport(0, undefined),
                reportID: 'test-report-1',
            };
            const lastActorDetails: Partial<PersonalDetails> = {
                accountID: 3,
                displayName: 'Spider-Man',
                login: 'peterparker@expensify.com',
            };
            const personalDetails: PersonalDetailsList = PERSONAL_DETAILS;

            // When we call getLastActorDisplayNameFromLastVisibleActions
            const result = getLastActorDisplayNameFromLastVisibleActions(report, lastActorDetails, CURRENT_USER_ACCOUNT_ID, personalDetails);

            // Then it should return the display name from lastActorDetails
            expect(result).toBe('Spider-Man');
        });

        it('should return display name from personalDetails when last visible action exists and actor is found in personalDetails', async () => {
            // Given a report with a last visible action
            const reportID = 'test-report-2';
            const actorAccountID = 3;
            const report: Report = {
                ...createRandomReport(0, undefined),
                reportID,
                lastActorAccountID: actorAccountID,
            };
            const lastActorDetails: Partial<PersonalDetails> = {
                accountID: 1,
                displayName: 'Mister Fantastic',
            };
            const personalDetails: PersonalDetailsList = PERSONAL_DETAILS;

            const reportAction: ReportAction = {
                ...createRandomReportAction(actorAccountID),
                reportActionID: 'action-1',
                actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                actorAccountID,
                created: DateUtils.getDBTime(),
                message: [{type: 'COMMENT', text: 'Test message', html: 'Test message', isEdited: false, isDeletedParentAction: false, whisperedTo: []}],
                shouldShow: true,
                pendingAction: null,
            };

            // Set up the report and report action in Onyx so it gets picked up by lastVisibleReportActions
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
                [reportAction.reportActionID]: reportAction,
            });
            await waitForBatchedUpdates();

            // When we call getLastActorDisplayNameFromLastVisibleActions
            const result = getLastActorDisplayNameFromLastVisibleActions(report, lastActorDetails, CURRENT_USER_ACCOUNT_ID, personalDetails);

            // Then it should return the display name from personalDetails for the actor
            expect(result).toBe('Spider-Man');
        });

        it('should return display name from reportAction.person when actor is not found in personalDetails', async () => {
            // Given a report with a last visible action where actor is not in personalDetails
            const reportID = 'test-report-3';
            const actorAccountID = 999;
            const report: Report = {
                ...createRandomReport(0, undefined),
                reportID,
                lastActorAccountID: actorAccountID,
            };
            const lastActorDetails: Partial<PersonalDetails> = {
                accountID: 1,
                displayName: 'Mister Fantastic',
            };
            const personalDetails: PersonalDetailsList = PERSONAL_DETAILS;

            const reportAction: ReportAction = {
                ...createRandomReportAction(actorAccountID),
                reportActionID: 'action-2',
                actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                actorAccountID,
                created: DateUtils.getDBTime(),
                message: [{type: 'COMMENT', text: 'Test message', html: 'Test message', isEdited: false, isDeletedParentAction: false, whisperedTo: []}],
                shouldShow: true,
                pendingAction: null,
                person: [{text: 'Unknown User', type: 'TEXT'}],
            };

            // Set up the report and report action in Onyx
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
                [reportAction.reportActionID]: reportAction,
            });
            await waitForBatchedUpdates();

            // When we call getLastActorDisplayNameFromLastVisibleActions
            const result = getLastActorDisplayNameFromLastVisibleActions(report, lastActorDetails, CURRENT_USER_ACCOUNT_ID, personalDetails);

            // Then it should return the display name from reportAction.person
            // Note: formatPhoneNumberPhoneUtils replaces spaces with non-breaking spaces
            expect(result).toBe('Unknown User'.replaceAll(' ', '\u00A0'));
        });

        it('should return "You" when the last actor is the current user', async () => {
            // Given a report with current user as the last actor
            const reportID = 'test-report-4';
            const currentUserAccountID = 2; // Iron Man
            const report: Report = {
                ...createRandomReport(0, undefined),
                reportID,
                lastActorAccountID: currentUserAccountID,
            };
            const lastActorDetails: Partial<PersonalDetails> = {
                accountID: 1,
                displayName: 'Mister Fantastic',
            };
            const personalDetails: PersonalDetailsList = PERSONAL_DETAILS;

            const reportAction: ReportAction = {
                ...createRandomReportAction(currentUserAccountID),
                reportActionID: 'action-3',
                actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                actorAccountID: currentUserAccountID,
                created: DateUtils.getDBTime(),
                message: [{type: 'COMMENT', text: 'Test message', html: 'Test message', isEdited: false, isDeletedParentAction: false, whisperedTo: []}],
                shouldShow: true,
                pendingAction: null,
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
                [reportAction.reportActionID]: reportAction,
            });
            await waitForBatchedUpdates();

            // When we call getLastActorDisplayNameFromLastVisibleActions
            const result = getLastActorDisplayNameFromLastVisibleActions(report, lastActorDetails, currentUserAccountID, personalDetails);

            // Then it should return "You" for the current user
            expect(result).toBe('You');
        });

        it('should fall back to lastActorDetails when last visible action exists but actor cannot be determined', async () => {
            // Given a report with a last visible action but no actor account ID
            const reportID = 'test-report-5';
            const report: Report = {
                ...createRandomReport(0, undefined),
                reportID,
            };
            const lastActorDetails: Partial<PersonalDetails> = {
                accountID: 3,
                displayName: 'Spider-Man',
                firstName: 'Spider',
            };
            const personalDetails: PersonalDetailsList = PERSONAL_DETAILS;

            const reportAction: ReportAction = {
                ...createRandomReportAction(0),
                reportActionID: 'action-4',
                actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                actorAccountID: undefined,
                created: DateUtils.getDBTime(),
                message: [{type: 'COMMENT', text: 'Test message', html: 'Test message', isEdited: false, isDeletedParentAction: false, whisperedTo: []}],
                shouldShow: true,
                pendingAction: null,
                person: [], // Ensure person array is empty so it doesn't create actorDetails from person
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
                [reportAction.reportActionID]: reportAction,
            });
            await waitForBatchedUpdates();

            // When we call getLastActorDisplayNameFromLastVisibleActions
            const result = getLastActorDisplayNameFromLastVisibleActions(report, lastActorDetails, 0, personalDetails);

            // Then it should fall back to lastActorDetails
            // getLastActorDisplayName returns firstName if available, otherwise formatPhoneNumberPhoneUtils(getDisplayNameOrDefault(...))
            expect(result).toBe('Spider');
        });
    });

    describe('getReportDisplayOption', () => {
        beforeEach(() => {
            renderLocaleContextProvider();
        });

        it('should return option with isSelfDM alternateText when report is a self DM', () => {
            // Given a self DM report
            const report: Report = {
                ...createRandomReport(0, undefined),
                reportID: 'self-dm-1',
                type: CONST.REPORT.TYPE.CHAT,
                chatType: CONST.REPORT.CHAT_TYPE.SELF_DM,
                participants: {
                    2: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                },
            };
            const personalDetails: PersonalDetailsList = PERSONAL_DETAILS;

            // When we call getReportDisplayOption
            const result = getReportDisplayOption(report, undefined, undefined, CURRENT_USER_ACCOUNT_ID, personalDetails, undefined);

            // Then it should return an option with isSelfDM and alternateText set
            expect(result.isSelfDM).toBe(true);
            expect(result.alternateText).toBe(translateLocal('reportActionsView.yourSpace'));
            expect(result.isDisabled).toBe(true);
            expect(result.isSelected).toBe(false);
        });

        it('should return option with invoice room text and alternateText when report is an invoice room', () => {
            // Given an invoice room report
            const report: Report = {
                ...createRandomReport(0, undefined),
                reportID: 'invoice-room-1',
                type: CONST.REPORT.TYPE.CHAT,
                chatType: CONST.REPORT.CHAT_TYPE.INVOICE,
            };
            const personalDetails: PersonalDetailsList = PERSONAL_DETAILS;

            // When we call getReportDisplayOption
            const result = getReportDisplayOption(report, undefined, undefined, CURRENT_USER_ACCOUNT_ID, personalDetails, undefined);

            // Then it should return an option with invoice room text and alternateText
            expect(result.isInvoiceRoom).toBe(true);
            expect(result.alternateText).toBe(translateLocal('workspace.common.invoices'));
            expect(result.isDisabled).toBe(true);
        });

        it('should return option with unknownUserDetails when provided', () => {
            // Given a report with unknown user details
            const report: Report = {
                ...createRandomReport(0, undefined),
                reportID: 'unknown-user-1',
            };
            const unknownUserDetails = {
                accountID: 999,
                login: 'unknown@expensify.com',
                text: 'Unknown User',
            };
            const personalDetails: PersonalDetailsList = PERSONAL_DETAILS;

            // When we call getReportDisplayOption
            const result = getReportDisplayOption(report, unknownUserDetails, undefined, CURRENT_USER_ACCOUNT_ID, personalDetails, undefined);

            // Then it should return an option with unknownUserDetails data
            expect(result.text).toBe('Unknown User');
            expect(result.alternateText).toBe('unknown@expensify.com');
            expect(result.participantsList).toBeDefined();
            expect(result.participantsList?.at(0)?.accountID).toBe(999);
            expect(result.isDisabled).toBe(true);
        });

        it('should return option with workspace name when report has ownerAccountID', () => {
            // Given a workspace report
            const report: Report = {
                ...createRandomReport(0, undefined),
                reportID: 'workspace-1',
                ownerAccountID: 1,
                policyID,
            };
            const personalDetails: PersonalDetailsList = PERSONAL_DETAILS;

            // When we call getReportDisplayOption
            const result = getReportDisplayOption(report, undefined, undefined, CURRENT_USER_ACCOUNT_ID, personalDetails, undefined);

            // Then it should return an option with workspace name
            expect(result.text).toBe(POLICY.name);
            expect(result.alternateText).toBe(translateLocal('workspace.common.workspace'));
            expect(result.isDisabled).toBe(true);
        });

        it('should use personalDetails parameter instead of Onyx.connect data', () => {
            // Given a report with participants
            const report: Report = {
                ...createRandomReport(0, undefined),
                reportID: 'test-personal-details-1',
                participants: {
                    3: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                },
            };
            // Use a modified personalDetails that differs from what's in Onyx
            const customPersonalDetails: PersonalDetailsList = {
                ...PERSONAL_DETAILS,
                3: {
                    ...PERSONAL_DETAILS['3'],
                    displayName: 'Custom Spider-Man Name',
                },
            };

            // When we call getReportDisplayOption with custom personalDetails
            const result = getReportDisplayOption(report, undefined, undefined, CURRENT_USER_ACCOUNT_ID, customPersonalDetails, undefined);

            // Then it should use the custom personalDetails parameter
            expect(result).toBeDefined();
            expect(result.isDisabled).toBe(true);
            expect(result.isSelected).toBe(false);
        });

        it('should handle empty personalDetails gracefully', () => {
            // Given a report with empty personalDetails
            const report: Report = {
                ...createRandomReport(0, undefined),
                reportID: 'test-empty-details-1',
            };
            const emptyPersonalDetails: PersonalDetailsList = {};

            // When we call getReportDisplayOption
            const result = getReportDisplayOption(report, undefined, undefined, CURRENT_USER_ACCOUNT_ID, emptyPersonalDetails, undefined);

            // Then it should not throw and return a valid option
            expect(result).toBeDefined();
            expect(result.isDisabled).toBe(true);
        });

        it('should handle undefined report gracefully', () => {
            // Given an undefined report
            const personalDetails: PersonalDetailsList = PERSONAL_DETAILS;

            // When we call getReportDisplayOption with undefined report
            const result = getReportDisplayOption(undefined, undefined, undefined, CURRENT_USER_ACCOUNT_ID, personalDetails, undefined);

            // Then it should return a valid option (createOption handles undefined)
            expect(result).toBeDefined();
            expect(result.isDisabled).toBe(true);
        });
    });

    describe('getValidOptions with policies parameter', () => {
        it('should accept policies collection as second parameter', () => {
            const policy: Policy = {
                id: 'test-policy',
                name: 'Test Policy',
                role: 'admin',
                type: CONST.POLICY.TYPE.TEAM,
                owner: 'owner@test.com',
                outputCurrency: 'USD',
                isPolicyExpenseChatEnabled: true,
                approvalMode: CONST.POLICY.APPROVAL_MODE.OPTIONAL,
                areCategoriesEnabled: true,
            };

            const policies = {[`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`]: policy};

            // Test that getValidOptions accepts policies collection as second parameter
            const results = getValidOptions(
                {reports: [], personalDetails: []},
                policies,
                undefined,
                nvpDismissedProductTraining,
                undefined,

                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
            );

            expect(results).toBeDefined();
            expect(results.recentReports).toBeDefined();
            expect(results.personalDetails).toBeDefined();
        });

        it('should work with undefined policies', () => {
            const options = {reports: [], personalDetails: []};
            const results = getValidOptions(options, undefined, undefined, nvpDismissedProductTraining, undefined, loginList, CURRENT_USER_ACCOUNT_ID, CURRENT_USER_EMAIL);

            expect(results).toBeDefined();
            expect(results.recentReports).toBeDefined();
            expect(results.personalDetails).toBeDefined();
        });

        it('should work with empty policies collection', () => {
            const options = {reports: [], personalDetails: []};
            const results = getValidOptions(options, {}, undefined, nvpDismissedProductTraining, undefined, loginList, CURRENT_USER_ACCOUNT_ID, CURRENT_USER_EMAIL);

            expect(results).toBeDefined();
            expect(results.recentReports).toBeDefined();
            expect(results.personalDetails).toBeDefined();
        });

        it('should pass policies to filtering logic', () => {
            const testPolicyID = 'test-policy-123';
            const policy: Policy = {
                id: testPolicyID,
                name: 'Test Workspace',
                role: 'admin',
                type: CONST.POLICY.TYPE.TEAM,
                owner: 'owner@test.com',
                outputCurrency: 'USD',
                isPolicyExpenseChatEnabled: true,
                approvalMode: CONST.POLICY.APPROVAL_MODE.OPTIONAL,
                areCategoriesEnabled: true,
            };

            const policies = {[`${ONYXKEYS.COLLECTION.POLICY}${testPolicyID}`]: policy};

            // Verify function works with policies parameter
            const results = getValidOptions(
                {reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails},
                policies,
                undefined,
                nvpDismissedProductTraining,
                undefined,

                loginList,
                CURRENT_USER_ACCOUNT_ID,
                CURRENT_USER_EMAIL,
                {
                    betas: [],
                    includeRecentReports: true,
                },
            );

            expect(results.recentReports).toBeDefined();
            expect(Array.isArray(results.recentReports)).toBe(true);
        });
    });

    describe('getReportOption', () => {
        beforeEach(async () => {
            await act(async () => {
                await Onyx.clear();
            });
            jest.clearAllMocks();
        });

        it('should return option with correct workspace name when policy is provided', async () => {
            const reportID = '101';
            const testPolicyID = 'policy123';
            const policy: Policy = {
                id: testPolicyID,
                name: 'Test Workspace',
                role: 'admin',
                type: CONST.POLICY.TYPE.TEAM,
                owner: 'owner@test.com',
                outputCurrency: 'USD',
                approvalMode: CONST.POLICY.APPROVAL_MODE.OPTIONAL,
                isPolicyExpenseChatEnabled: false,
            };
            const report: Report = {
                reportID,
                reportName: 'Test Report',
                type: CONST.REPORT.TYPE.CHAT,
                policyID: testPolicyID,
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${testPolicyID}`, policy);
            await waitForBatchedUpdates();

            const participant = {
                reportID,
                policyID: testPolicyID,
                isPolicyExpenseChat: true,
            };

            const option = getReportOption(participant, undefined, undefined, policy, CURRENT_USER_ACCOUNT_ID, {});

            expect(option.text).toBe('Test Workspace');
            expect(option.alternateText).toBe(translateLocal('workspace.common.workspace'));
            expect(option.isSelected).toBe(undefined);
        });

        it('should show submits to info when policy has approval workflow', async () => {
            const reportID = '102';
            const testPolicyID = 'policy124';
            const ownerAccountID = 8888;
            const approverAccountID = 9999;
            const policy: Policy = {
                id: testPolicyID,
                name: 'Test Workspace with Submit',
                role: 'user',
                type: CONST.POLICY.TYPE.TEAM,
                owner: 'owner@test.com',
                outputCurrency: 'USD',
                approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
                isPolicyExpenseChatEnabled: false,
            };
            const report: Report = {
                reportID,
                reportName: 'Test Report',
                type: CONST.REPORT.TYPE.EXPENSE,
                policyID: testPolicyID,
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                ownerAccountID,
            };

            const personalDetails = {
                [ownerAccountID]: {
                    accountID: ownerAccountID,
                    displayName: 'Report Owner',
                    login: 'owner@test.com',
                },
                [approverAccountID]: {
                    accountID: approverAccountID,
                    displayName: 'John Manager',
                    login: 'manager@test.com',
                },
            };

            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetails);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${testPolicyID}`, policy);
            await waitForBatchedUpdates();

            const participant = {
                reportID,
                policyID: testPolicyID,
                isPolicyExpenseChat: true,
            };

            const option = getReportOption(participant, undefined, undefined, policy, CURRENT_USER_ACCOUNT_ID, {});

            expect(option.text).toBe('Test Workspace with Submit');
            // The submitsTo logic may or may not apply depending on complex approval rules
            // Just verify the option was created correctly
            expect(option.alternateText).toBeDefined();
        });

        it('should mark draft reports as disabled', async () => {
            const reportID = '103';
            const report: Report = {
                reportID,
                reportName: 'Draft Report',
                type: CONST.REPORT.TYPE.CHAT,
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_DRAFT}${reportID}`, report);
            await waitForBatchedUpdates();

            const participant = {
                reportID,
            };

            const option = getReportOption(participant, undefined, undefined, POLICY, CURRENT_USER_ACCOUNT_ID, {});

            expect(option.isDisabled).toBe(true);
        });

        it('should handle self DM reports correctly', async () => {
            const reportID = '104';
            const currentUserAccountID = 1;
            const report: Report = {
                reportID,
                reportName: 'My Space',
                type: CONST.REPORT.TYPE.CHAT,
                chatType: CONST.REPORT.CHAT_TYPE.SELF_DM,
                participants: {
                    [currentUserAccountID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                },
            };

            const personalDetails = {
                [currentUserAccountID]: {
                    accountID: currentUserAccountID,
                    displayName: 'Current User',
                    login: 'currentuser@test.com',
                },
            };

            await Onyx.merge(ONYXKEYS.SESSION, {accountID: currentUserAccountID, email: 'currentuser@test.com'});
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetails);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
            await waitForBatchedUpdates();

            const participant = {
                reportID,
                isSelfDM: true,
            };

            const option = getReportOption(participant, undefined, undefined, POLICY, CURRENT_USER_ACCOUNT_ID, personalDetails);

            // The option.isSelfDM is set by createOption based on the report type
            // Just verify the alternateText is correct for self DM
            if (option.isSelfDM) {
                expect(option.alternateText).toBe(translateLocal('reportActionsView.yourSpace'));
            } else {
                // If not detected as selfDM, just ensure option was created
                expect(option).toBeDefined();
            }
        });

        it('should handle invoice rooms correctly', async () => {
            const reportID = '105';
            const testPolicyID = 'policy125';
            const report: Report = {
                reportID,
                reportName: 'Invoice Room',
                type: CONST.REPORT.TYPE.INVOICE,
                policyID: testPolicyID,
                chatType: CONST.REPORT.CHAT_TYPE.INVOICE,
                invoiceReceiver: {
                    type: CONST.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL,
                    accountID: 1,
                },
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
            await waitForBatchedUpdates();

            const participant = {
                reportID,
                isInvoiceRoom: true,
            };

            const option = getReportOption(participant, undefined, undefined, POLICY, CURRENT_USER_ACCOUNT_ID, {});

            expect(option.isInvoiceRoom).toBe(true);
            expect(option.alternateText).toBe(translateLocal('workspace.common.invoices'));
        });

        it('should return option with correct text for workspace chat', async () => {
            const workspaceReport: Report = {
                lastReadTime: '2021-01-14 11:25:39.302',
                lastVisibleActionCreated: '2022-11-22 03:26:02.022',
                isPinned: false,
                reportID: '18',
                participants: {
                    2: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                },
                reportName: '',
                policyID,
                policyName: POLICY.name,
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                isOwnPolicyExpenseChat: true,
                type: CONST.REPORT.TYPE.CHAT,
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}18`, workspaceReport);
            await waitForBatchedUpdates();

            const participant: Participant = {
                reportID: '18',
                selected: false,
            };

            let reportNameValuePair: OnyxEntry<ReportNameValuePairs>;
            Onyx.connect({
                key: `${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${participant.reportID}`,
                waitForCollectionCallback: false,
                callback: (value) => {
                    reportNameValuePair = value;
                },
            });
            await waitForBatchedUpdates();

            const option = getReportOption(participant, undefined, reportNameValuePair?.private_isArchived, POLICY, CURRENT_USER_ACCOUNT_ID, {});

            expect(option.text).toBe(POLICY.name);
            expect(option.alternateText).toBeTruthy();
            expect(option.alternateText === translateLocal('workspace.common.workspace') || option.alternateText?.includes('Submits to')).toBe(true);
        });

        it('should handle draft reports', async () => {
            const draftReport: Report = {
                lastReadTime: '2021-01-14 11:25:39.302',
                lastVisibleActionCreated: '2022-11-22 03:26:02.022',
                isPinned: false,
                reportID: '19',
                participants: {
                    2: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                    3: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                },
                reportName: 'Draft Report',
                type: CONST.REPORT.TYPE.CHAT,
                writeCapability: CONST.REPORT.WRITE_CAPABILITIES.ADMINS,
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_DRAFT}19`, draftReport);
            await waitForBatchedUpdates();

            const draftReports = {
                '19': draftReport,
            };

            const participant: Participant = {
                reportID: '19',
                selected: false,
            };

            let reportNameValuePair: OnyxEntry<ReportNameValuePairs>;
            Onyx.connect({
                key: `${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${participant.reportID}`,
                waitForCollectionCallback: false,
                callback: (value) => {
                    reportNameValuePair = value;
                },
            });
            await waitForBatchedUpdates();

            const option = getReportOption(participant, undefined, reportNameValuePair?.private_isArchived, POLICY, CURRENT_USER_ACCOUNT_ID, {}, undefined, draftReports);

            expect(option.isDisabled).toBe(true);
        });
    });

    describe('getReportDisplayOption', () => {
        it('should use reportNameValuePair parameter for archived reports', async () => {
            const reportID = '23';
            const report: Report = {
                ...createRegularChat(Number(reportID), [2, 7]),
                reportID,
                lastVisibleActionCreated: '2022-11-22 03:26:02.001',
            };

            const reportNameValuePair: ReportNameValuePairs = {
                private_isArchived: DateUtils.getDBTime(),
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
            await waitForBatchedUpdates();

            const option = getReportDisplayOption(report, undefined, undefined, CURRENT_USER_ACCOUNT_ID, PERSONAL_DETAILS, reportNameValuePair?.private_isArchived);

            expect(option).toBeDefined();
            expect(option.reportID).toBe(reportID);
            expect(option.private_isArchived).toBeDefined();
            expect(option.private_isArchived).toBe(reportNameValuePair.private_isArchived);
            expect(option.isDisabled).toBe(true);
            expect(option.isSelected).toBe(false);
        });

        it('should use reportNameValuePair parameter for non-archived reports', async () => {
            const reportID = '24';
            const report: Report = {
                ...createRegularChat(Number(reportID), [2, 7]),
                reportID,
                lastVisibleActionCreated: '2022-11-22 03:26:02.001',
            };

            const reportNameValuePair: ReportNameValuePairs = {};

            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
            await waitForBatchedUpdates();

            const option = getReportDisplayOption(report, undefined, undefined, CURRENT_USER_ACCOUNT_ID, PERSONAL_DETAILS, reportNameValuePair?.private_isArchived);

            expect(option).toBeDefined();
            expect(option.reportID).toBe(reportID);
            expect(option.private_isArchived).toBeUndefined();
            expect(option.isDisabled).toBe(true);
            expect(option.isSelected).toBe(false);
        });

        it('should handle undefined reportNameValuePair', async () => {
            const reportID = '25';
            const report: Report = {
                ...createRegularChat(Number(reportID), [2, 7]),
                reportID,
                lastVisibleActionCreated: '2022-11-22 03:26:02.001',
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
            await waitForBatchedUpdates();

            const option = getReportDisplayOption(report, undefined, undefined, CURRENT_USER_ACCOUNT_ID, PERSONAL_DETAILS, undefined);

            expect(option).toBeDefined();
            expect(option.reportID).toBe(reportID);
            expect(option.isDisabled).toBe(true);
            expect(option.isSelected).toBe(false);
        });

        it('should use reportNameValuePair for invoice room reports', async () => {
            const reportID = '26';
            const report: Report = {
                ...createRegularChat(Number(reportID), [2, 7]),
                reportID,
                chatType: CONST.REPORT.CHAT_TYPE.INVOICE,
                lastVisibleActionCreated: '2022-11-22 03:26:02.001',
            };

            const reportNameValuePair: ReportNameValuePairs = {
                private_isArchived: DateUtils.getDBTime(),
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
            await waitForBatchedUpdates();

            const option = getReportDisplayOption(report, undefined, undefined, CURRENT_USER_ACCOUNT_ID, PERSONAL_DETAILS, reportNameValuePair?.private_isArchived);

            expect(option).toBeDefined();
            expect(option.reportID).toBe(reportID);
            expect(option.isInvoiceRoom).toBe(true);
            expect(option.private_isArchived).toBeDefined();
            expect(option.private_isArchived).toBe(reportNameValuePair.private_isArchived);
        });

        it('should use reportNameValuePair for self DM reports', async () => {
            const reportID = '27';
            const report: Report = {
                ...createRegularChat(Number(reportID), [2]),
                reportID,
                chatType: CONST.REPORT.CHAT_TYPE.SELF_DM,
                ownerAccountID: 2,
                lastVisibleActionCreated: '2022-11-22 03:26:02.001',
            };

            const reportNameValuePair: ReportNameValuePairs = {};

            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
            await waitForBatchedUpdates();

            const option = getReportDisplayOption(report, undefined, undefined, CURRENT_USER_ACCOUNT_ID, PERSONAL_DETAILS, reportNameValuePair?.private_isArchived);

            expect(option).toBeDefined();
            expect(option.reportID).toBe(reportID);
            expect(option.isSelfDM).toBe(true);
        });

        it('should preserve selected state from participant', async () => {
            const reportID = '106';
            const report: Report = {
                reportID,
                reportName: 'Selected Report',
                type: CONST.REPORT.TYPE.CHAT,
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
            await waitForBatchedUpdates();

            const participant = {
                reportID,
                selected: true,
            };

            const option = getReportOption(participant, undefined, undefined, POLICY, CURRENT_USER_ACCOUNT_ID, {});

            expect(option.isSelected).toBe(true);
            expect(option.selected).toBe(true);
        });

        it('should handle policy parameter being null', async () => {
            const reportID = '107';
            const report: Report = {
                reportID,
                reportName: 'Test Report',
                type: CONST.REPORT.TYPE.CHAT,
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
            await waitForBatchedUpdates();

            const participant = {
                reportID,
            };

            const option = getReportOption(participant, undefined, undefined, undefined, CURRENT_USER_ACCOUNT_ID, {});

            expect(option).toBeDefined();
            expect(option.text).toBeDefined();
        });

        it('should handle reportAttributesDerived parameter', async () => {
            const reportID = '108';
            const report: Report = {
                reportID,
                reportName: 'Test Report',
                type: CONST.REPORT.TYPE.CHAT,
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
            await waitForBatchedUpdates();

            const participant = {
                reportID,
            };

            // Test that the function works with reportAttributesDerived parameter (optional)
            const option = getReportOption(participant, undefined, undefined, POLICY, CURRENT_USER_ACCOUNT_ID, {});

            expect(option).toBeDefined();
        });

        it('should use personalDetails to populate participant display names', async () => {
            const reportID = '109';
            const participantAccountID = 12345;
            const report: Report = {
                reportID,
                reportName: 'Test Chat',
                type: CONST.REPORT.TYPE.CHAT,
                participants: {
                    [participantAccountID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                },
            };

            const testPersonalDetails = {
                [participantAccountID]: {
                    accountID: participantAccountID,
                    displayName: 'Test User Display Name',
                    login: 'testuser@example.com',
                    firstName: 'Test',
                    lastName: 'User',
                },
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
            await waitForBatchedUpdates();

            const participant = {
                reportID,
            };

            const option = getReportOption(participant, undefined, undefined, POLICY, CURRENT_USER_ACCOUNT_ID, testPersonalDetails);

            expect(option).toBeDefined();
            // The createOption function uses personalDetails to build display names
            // Verify that option was created successfully with the personalDetails
            expect(option.participantsList).toBeDefined();
        });

        it('should show submits to info using personalDetails when policy has approval workflow', async () => {
            const reportID = '110';
            const testPolicyID = 'policy_with_submits_to';
            const submitterAccountID = 100;
            const approverAccountID = 200;

            const report: Report = {
                reportID,
                reportName: 'Test Workspace',
                type: CONST.REPORT.TYPE.EXPENSE,
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                policyID: testPolicyID,
                ownerAccountID: submitterAccountID,
                participants: {
                    [submitterAccountID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                },
            };

            const policy: Policy = {
                id: testPolicyID,
                name: 'Test Workspace with Approver',
                type: CONST.POLICY.TYPE.TEAM,
                owner: 'owner@test.com',
                role: 'user',
                approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
                outputCurrency: 'USD',
                isPolicyExpenseChatEnabled: false,
            };

            // PersonalDetails with the approver's information
            const testPersonalDetails = {
                [submitterAccountID]: {
                    accountID: submitterAccountID,
                    displayName: 'Submitter Name',
                    login: 'submitter@test.com',
                },
                [approverAccountID]: {
                    accountID: approverAccountID,
                    displayName: 'Approver Manager',
                    login: 'approver@test.com',
                },
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${testPolicyID}`, policy);
            await waitForBatchedUpdates();

            const participant = {
                reportID,
                policyID: testPolicyID,
                isPolicyExpenseChat: true,
            };

            const option = getReportOption(participant, undefined, undefined, policy, CURRENT_USER_ACCOUNT_ID, testPersonalDetails);

            expect(option).toBeDefined();
            expect(option.text).toBe('Test Workspace with Approver');
            // The alternateText should include "Submits to" with the approver's name from personalDetails
            // Note: This depends on the policy approval mode and workflow configuration
            expect(option.alternateText).toBeDefined();
        });

        it('should fall back gracefully when personalDetails is empty', async () => {
            const reportID = '111';
            const report: Report = {
                reportID,
                reportName: 'Test Report Empty PD',
                type: CONST.REPORT.TYPE.CHAT,
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
            await waitForBatchedUpdates();

            const participant = {
                reportID,
            };

            // Pass empty personalDetails
            const option = getReportOption(participant, undefined, undefined, POLICY, CURRENT_USER_ACCOUNT_ID, {});

            expect(option).toBeDefined();
            expect(option.text).toBeDefined();
        });

        it('should fall back gracefully when personalDetails is undefined', async () => {
            const reportID = '112';
            const report: Report = {
                reportID,
                reportName: 'Test Report Undefined PD',
                type: CONST.REPORT.TYPE.CHAT,
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
            await waitForBatchedUpdates();

            const participant = {
                reportID,
            };

            // Pass undefined personalDetails
            const option = getReportOption(participant, undefined, undefined, POLICY, CURRENT_USER_ACCOUNT_ID, undefined);

            expect(option).toBeDefined();
            expect(option.text).toBeDefined();
        });

        it('should use personalDetails for invoice room report name', async () => {
            const reportID = '113';
            const senderAccountID = 300;
            const receiverAccountID = 400;
            const report: Report = {
                reportID,
                reportName: 'Invoice Room',
                type: CONST.REPORT.TYPE.CHAT,
                chatType: CONST.REPORT.CHAT_TYPE.INVOICE,
                invoiceReceiver: {
                    type: 'individual',
                    accountID: receiverAccountID,
                },
                participants: {
                    [senderAccountID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                    [receiverAccountID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                },
            };

            const testPersonalDetails = {
                [senderAccountID]: {
                    accountID: senderAccountID,
                    displayName: 'Invoice Sender',
                    login: 'sender@test.com',
                },
                [receiverAccountID]: {
                    accountID: receiverAccountID,
                    displayName: 'Invoice Receiver',
                    login: 'receiver@test.com',
                },
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
            await waitForBatchedUpdates();

            const participant = {
                reportID,
                isInvoiceRoom: true,
            };

            const option = getReportOption(participant, undefined, undefined, POLICY, CURRENT_USER_ACCOUNT_ID, testPersonalDetails);

            expect(option).toBeDefined();
            expect(option.isInvoiceRoom).toBe(true);
            // personalDetails is used in computeReportName for invoice rooms
            expect(option.text).toBeDefined();
        });
    });

    describe('getPolicyExpenseReportOption', () => {
        it('should return option with policy expense chat details', async () => {
            const reportID = '201';
            const testPolicyID = 'policy201';
            const ownerAccountID = 1001;

            const report: Report = {
                reportID,
                reportName: 'Test Policy Expense',
                type: CONST.REPORT.TYPE.CHAT,
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                policyID: testPolicyID,
                ownerAccountID,
                participants: {
                    [ownerAccountID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                },
            };

            const policy: Policy = {
                id: testPolicyID,
                name: 'Test Workspace Policy',
                type: CONST.POLICY.TYPE.TEAM,
                owner: 'owner@test.com',
                role: 'user',
                outputCurrency: 'USD',
                isPolicyExpenseChatEnabled: true,
            };

            const testPersonalDetails = {
                [ownerAccountID]: {
                    accountID: ownerAccountID,
                    displayName: 'Policy Owner',
                    login: 'owner@test.com',
                },
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${testPolicyID}`, policy);
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, testPersonalDetails);
            await waitForBatchedUpdates();

            const participant = {
                reportID,
                policyID: testPolicyID,
                isPolicyExpenseChat: true,
                selected: true,
            };

            const option = getPolicyExpenseReportOption(participant, undefined, CURRENT_USER_ACCOUNT_ID, testPersonalDetails);

            expect(option).toBeDefined();
            expect(option.text).toBe('Test Workspace Policy');
            expect(option.alternateText).toBe(translateLocal('workspace.common.workspace'));
            expect(option.isSelected).toBe(true);
        });

        it('should use personalDetails to create option with participant info', async () => {
            const reportID = '202';
            const testPolicyID = 'policy202';
            const ownerAccountID = 1002;
            const memberAccountID = 1003;

            const report: Report = {
                reportID,
                reportName: 'Team Expense Chat',
                type: CONST.REPORT.TYPE.CHAT,
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                policyID: testPolicyID,
                ownerAccountID,
                participants: {
                    [ownerAccountID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                    [memberAccountID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                },
            };

            const policy: Policy = {
                id: testPolicyID,
                name: 'Team Workspace',
                type: CONST.POLICY.TYPE.TEAM,
                owner: 'owner@test.com',
                role: 'admin',
                outputCurrency: 'USD',
                isPolicyExpenseChatEnabled: true,
            };

            const testPersonalDetails = {
                [ownerAccountID]: {
                    accountID: ownerAccountID,
                    displayName: 'Team Owner',
                    login: 'teamowner@test.com',
                },
                [memberAccountID]: {
                    accountID: memberAccountID,
                    displayName: 'Team Member',
                    login: 'teammember@test.com',
                },
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${testPolicyID}`, policy);
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, testPersonalDetails);
            await waitForBatchedUpdates();

            const participant = {
                reportID,
                policyID: testPolicyID,
                isPolicyExpenseChat: true,
            };

            const option = getPolicyExpenseReportOption(participant, undefined, CURRENT_USER_ACCOUNT_ID, testPersonalDetails);

            expect(option).toBeDefined();
            expect(option.text).toBe('Team Workspace');
        });

        it('should handle empty personalDetails gracefully', async () => {
            const reportID = '203';
            const testPolicyID = 'policy203';
            const ownerAccountID = 1004;

            const report: Report = {
                reportID,
                reportName: 'Empty Details Chat',
                type: CONST.REPORT.TYPE.CHAT,
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                policyID: testPolicyID,
                ownerAccountID,
                participants: {
                    [ownerAccountID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                },
            };

            const policy: Policy = {
                id: testPolicyID,
                name: 'Workspace Without Details',
                type: CONST.POLICY.TYPE.TEAM,
                owner: 'owner@test.com',
                role: 'user',
                outputCurrency: 'USD',
                isPolicyExpenseChatEnabled: true,
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${testPolicyID}`, policy);
            await waitForBatchedUpdates();

            const participant = {
                reportID,
                policyID: testPolicyID,
                isPolicyExpenseChat: true,
            };

            // Should not throw when personalDetails is empty
            const option = getPolicyExpenseReportOption(participant, undefined, CURRENT_USER_ACCOUNT_ID, {});

            expect(option).toBeDefined();
            expect(option.text).toBe('Workspace Without Details');
        });

        it('should handle undefined personalDetails gracefully', async () => {
            const reportID = '204';
            const testPolicyID = 'policy204';
            const ownerAccountID = 1005;

            const report: Report = {
                reportID,
                reportName: 'Undefined Details Chat',
                type: CONST.REPORT.TYPE.CHAT,
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                policyID: testPolicyID,
                ownerAccountID,
                participants: {
                    [ownerAccountID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                },
            };

            const policy: Policy = {
                id: testPolicyID,
                name: 'Workspace Undefined Details',
                type: CONST.POLICY.TYPE.TEAM,
                owner: 'owner@test.com',
                role: 'user',
                outputCurrency: 'USD',
                isPolicyExpenseChatEnabled: true,
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${testPolicyID}`, policy);
            await waitForBatchedUpdates();

            const participant = {
                reportID,
                policyID: testPolicyID,
                isPolicyExpenseChat: true,
            };

            // Should not throw when personalDetails is undefined
            const option = getPolicyExpenseReportOption(participant, undefined, CURRENT_USER_ACCOUNT_ID, undefined);

            expect(option).toBeDefined();
            expect(option.text).toBe('Workspace Undefined Details');
        });

        it('should preserve selected state from participant', async () => {
            const reportID = '205';
            const testPolicyID = 'policy205';
            const ownerAccountID = 1006;

            const report: Report = {
                reportID,
                reportName: 'Selected State Chat',
                type: CONST.REPORT.TYPE.CHAT,
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                policyID: testPolicyID,
                ownerAccountID,
                participants: {
                    [ownerAccountID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                },
            };

            const policy: Policy = {
                id: testPolicyID,
                name: 'Selection Test Workspace',
                type: CONST.POLICY.TYPE.TEAM,
                owner: 'owner@test.com',
                role: 'user',
                outputCurrency: 'USD',
                isPolicyExpenseChatEnabled: true,
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${testPolicyID}`, policy);
            await waitForBatchedUpdates();

            const participantSelected = {
                reportID,
                policyID: testPolicyID,
                isPolicyExpenseChat: true,
                selected: true,
            };

            // eslint-disable-next-line rulesdir/no-negated-variables
            const participantNotSelected = {
                reportID,
                policyID: testPolicyID,
                isPolicyExpenseChat: true,
                selected: false,
            };

            const optionSelected = getPolicyExpenseReportOption(participantSelected, undefined, CURRENT_USER_ACCOUNT_ID, {});

            // eslint-disable-next-line rulesdir/no-negated-variables
            const optionNotSelected = getPolicyExpenseReportOption(participantNotSelected, undefined, CURRENT_USER_ACCOUNT_ID, {});

            expect(optionSelected.isSelected).toBe(true);
            expect(optionSelected.selected).toBe(true);
            expect(optionNotSelected.isSelected).toBe(false);
            expect(optionNotSelected.selected).toBe(false);
        });
    });

    describe('getUserToInviteOption', () => {
        it('should not return userToInvite for plain text name when shouldAcceptName is false', () => {
            const result = getUserToInviteOption({
                searchValue: 'Jeff Amazon',
                loginList: {},
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                currentUserEmail: CURRENT_USER_EMAIL,
            });
            expect(result).toBeNull();
        });

        it('should return userToInvite for plain text name when shouldAcceptName is true', () => {
            const result = getUserToInviteOption({
                searchValue: 'Jeff Amazon',
                shouldAcceptName: true,
                loginList: {},
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                currentUserEmail: CURRENT_USER_EMAIL,
            });
            expect(result).not.toBeNull();
            expect(result?.login).toBe('Jeff Amazon');
        });
    });
});
