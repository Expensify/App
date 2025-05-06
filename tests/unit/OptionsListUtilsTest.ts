/* eslint-disable @typescript-eslint/naming-convention */
import type {OnyxCollection} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import DateUtils from '@libs/DateUtils';
import type {OptionList, Options, SearchOption} from '@libs/OptionsListUtils';
import {
    canCreateOptimisticPersonalDetailOption,
    createOptionList,
    filterAndOrderOptions,
    filterReports,
    filterSelfDMChat,
    filterWorkspaceChats,
    formatMemberForList,
    getLastActorDisplayName,
    getMemberInviteOptions,
    getSearchOptions,
    getShareDestinationOptions,
    getShareLogOptions,
    getValidOptions,
    orderOptions,
    orderWorkspaceOptions,
} from '@libs/OptionsListUtils';
import {canCreateTaskInReport, canUserPerformWriteAction, isCanceledTaskReport, isExpensifyOnlyParticipantInReport} from '@libs/ReportUtils';
import type {OptionData} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetails, Policy, Report} from '@src/types/onyx';
import {getFakeAdvancedReportAction} from '../utils/LHNTestUtils';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@rnmapbox/maps', () => {
    return {
        default: jest.fn(),
        MarkerView: jest.fn(),
        setAccessToken: jest.fn(),
    };
});

jest.mock('@react-native-community/geolocation', () => ({
    setRNConfiguration: jest.fn(),
}));

type PersonalDetailsList = Record<string, PersonalDetails & OptionData>;

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
        18: {
            lastReadTime: '2021-01-14 11:25:39.302',
            lastVisibleActionCreated: '2022-11-22 03:26:02.022',
            isPinned: false,
            reportID: '18',
            participants: {
                2: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN},
                1: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN},
                10: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN},
                3: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN},
            },
            reportName: '',
            oldPolicyName: 'Justice League Room',
            chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM,
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

    const REPORTS_WITH_SELFDM: OnyxCollection<Report> = {
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
            text: 'Asana Task Workspace',
            policyID: '99',
            isPolicyExpenseChat: false,
        },
        {
            reportID: '10',
            text: 'Asana Project Management',
            policyID: '1010',
            isPolicyExpenseChat: true,
        },
    ];

    const reportNameValuePairs = {
        private_isArchived: DateUtils.getDBTime(),
    };

    // Set the currently logged in user, report data, and personal details
    beforeAll(() => {
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
        return waitForBatchedUpdates().then(() => Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, PERSONAL_DETAILS));
    });

    let OPTIONS: OptionList;
    let OPTIONS_WITH_CONCIERGE: OptionList;
    let OPTIONS_WITH_CHRONOS: OptionList;
    let OPTIONS_WITH_RECEIPTS: OptionList;
    let OPTIONS_WITH_WORKSPACE_ROOM: OptionList;
    let OPTIONS_WITH_MANAGER_MCTEST: OptionList;

    beforeEach(() => {
        Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}10`, reportNameValuePairs);
        OPTIONS = createOptionList(PERSONAL_DETAILS, REPORTS);
        OPTIONS_WITH_CONCIERGE = createOptionList(PERSONAL_DETAILS_WITH_CONCIERGE, REPORTS_WITH_CONCIERGE);
        OPTIONS_WITH_CHRONOS = createOptionList(PERSONAL_DETAILS_WITH_CHRONOS, REPORTS_WITH_CHRONOS);
        OPTIONS_WITH_RECEIPTS = createOptionList(PERSONAL_DETAILS_WITH_RECEIPTS, REPORTS_WITH_RECEIPTS);
        OPTIONS_WITH_WORKSPACE_ROOM = createOptionList(PERSONAL_DETAILS, REPORTS_WITH_WORKSPACE_ROOMS);
        OPTIONS_WITH_MANAGER_MCTEST = createOptionList(PERSONAL_DETAILS_WITH_MANAGER_MCTEST);
    });

    describe('getSearchOptions()', () => {
        it('should return all options when no search value is provided', () => {
            // Given a set of options
            // When we call getSearchOptions with all betas
            const results = getSearchOptions(OPTIONS, [CONST.BETAS.ALL]);

            // Then all personal details (including those that have reports) should be returned
            expect(results.personalDetails.length).toBe(9);

            // Then all of the reports should be shown including the archived rooms, except for the thread report with notificationPreferences hidden.
            expect(results.recentReports.length).toBe(Object.values(OPTIONS.reports).length - 1);
        });
    });

    describe('orderOptions()', () => {
        it('should sort options alphabetically and preserves reportID for personal details with existing reports', () => {
            // Given a set of reports and personalDetails
            // When we call getValidOptions()
            let results: Pick<Options, 'personalDetails' | 'recentReports'> = getValidOptions({
                reports: OPTIONS.reports,
                personalDetails: OPTIONS.personalDetails,
            });
            // When we call orderOptions()
            results = orderOptions(results);

            // Then all personalDetails except the currently logged in user should be returned
            expect(results.personalDetails.length).toBe(Object.values(OPTIONS.personalDetails).length - 1);

            const expected = ['Black Panther', 'Black Widow', 'Captain America', 'Invisible Woman', 'Mister Fantastic', 'Mr Sinister', 'Spider-Man', 'The Incredible Hulk', 'Thor'];
            const actual = results.personalDetails?.map((item) => item.text);

            // Then the results should be sorted alphabetically
            expect(actual).toEqual(expected);

            const personalDetailWithExistingReport = results.personalDetails.find((personalDetail) => personalDetail.login === 'peterparker@expensify.com');
            // Then the result which has an existing report should also have the reportID attached
            expect(personalDetailWithExistingReport?.reportID).toBe('2');
        });

        it('should sort personal details options alphabetically when only personal details are provided', () => {
            // Given a set of personalDetails and an empty reports array
            let results: Pick<Options, 'personalDetails' | 'recentReports'> = getValidOptions({personalDetails: OPTIONS.personalDetails, reports: []});
            // When we call orderOptions()
            results = orderOptions(results);

            const expected = ['Black Panther', 'Black Widow', 'Captain America', 'Invisible Woman', 'Mister Fantastic', 'Mr Sinister', 'Spider-Man', 'The Incredible Hulk', 'Thor'];
            const actual = results.personalDetails?.map((item) => item.text);

            // Then the results should be sorted alphabetically
            expect(actual).toEqual(expected);
        });
    });

    describe('getValidOptions()', () => {
        it('should return empty options when no reports or personal details are provided', () => {
            // Given empty arrays of reports and personalDetails
            // When we call getValidOptions()
            const results = getValidOptions({reports: [], personalDetails: []});

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
            const results = getValidOptions({reports: OPTIONS_WITH_CONCIERGE.reports, personalDetails: OPTIONS_WITH_CONCIERGE.personalDetails});

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
            const results = getValidOptions({reports: OPTIONS_WITH_CHRONOS.reports, personalDetails: OPTIONS_WITH_CHRONOS.personalDetails}, {excludeLogins: {[CONST.EMAIL.CHRONOS]: true}});

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
                {includeP2P: true, canShowManagerMcTest: true, betas: [CONST.BETAS.NEWDOT_MANAGER_MCTEST]},
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
                {includeP2P: true, canShowManagerMcTest: false, betas: [CONST.BETAS.NEWDOT_MANAGER_MCTEST]},
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
                        {includeP2P: true, canShowManagerMcTest: true, betas: [CONST.BETAS.NEWDOT_MANAGER_MCTEST]},
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
                {
                    includeMultipleParticipantReports: true,
                },
            );
            const adminRoomOption = results.recentReports.find((report) => report.reportID === '1455140530846319');

            // Then the result should include the admin room
            expect(adminRoomOption).toBeDefined();
        });
    });

    describe('getValidOptions() for chat room', () => {
        it('should include all reports by default', () => {
            // Given a set of reports and personalDetails that includes workspace rooms with no `excludeHiddenChatRoom` flag
            // When we call getValidOptions()
            const results = getValidOptions(OPTIONS_WITH_WORKSPACE_ROOM, {
                includeRecentReports: true,
                includeMultipleParticipantReports: true,
                includeP2P: true,
                includeOwnedWorkspaceChats: true,
            });

            // Then the result should include all reports except the currently logged in user
            expect(results.recentReports.length).toBe(OPTIONS_WITH_WORKSPACE_ROOM.reports.length - 1);
            expect(results.recentReports).toEqual(expect.arrayContaining([expect.objectContaining({reportID: '14'})]));
            expect(results.recentReports).toEqual(expect.arrayContaining([expect.objectContaining({reportID: '18'})]));
        });

        it('should exclude hidden chat room when excludeHiddenChatRoom flag is set', () => {
            // Given a set of reports and personalDetails that includes workspace rooms with `excludeHiddenChatRoom` flag
            // When we call getValidOptions()
            const results = getValidOptions(OPTIONS_WITH_WORKSPACE_ROOM, {
                includeRecentReports: true,
                includeMultipleParticipantReports: true,
                includeP2P: true,
                includeOwnedWorkspaceChats: true,
                excludeHiddenChatRoom: true,
            });

            // Then the result should include all reports except the currently logged in user and hidden chat room
            expect(results.recentReports.length).toBe(OPTIONS_WITH_WORKSPACE_ROOM.reports.length - 2);
            expect(results.recentReports).toEqual(expect.arrayContaining([expect.objectContaining({reportID: '14'})]));
            expect(results.recentReports).not.toEqual(expect.arrayContaining([expect.objectContaining({reportID: '18'})]));
        });
    });

    describe('getValidOptions() for group Chat', () => {
        it('should exclude users with recent reports from personalDetails', () => {
            // Given a set of reports and personalDetails
            // When we call getValidOptions with no search value
            const results = getValidOptions({reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails});
            const reportLogins = results.recentReports.map((reportOption) => reportOption.login);
            const personalDetailsOverlapWithReports = results.personalDetails.every((personalDetailOption) => reportLogins.includes(personalDetailOption.login));

            // Then we should expect all the personalDetails to show except the currently logged in user
            expect(results.personalDetails.length).toBe(Object.values(OPTIONS.personalDetails).length - 1);
            // Then none of our personalDetails should include any of the users with recent reports
            expect(personalDetailsOverlapWithReports).toBe(false);
        });

        it('should exclude selected options', () => {
            // Given a set of reports and personalDetails
            // When we call getValidOptions with excludeLogins param
            const results = getValidOptions({reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails}, {excludeLogins: {'peterparker@expensify.com': true}});

            // Then the option should not appear anywhere in either list
            expect(results.recentReports.every((option) => option.login !== 'peterparker@expensify.com')).toBe(true);
            expect(results.personalDetails.every((option) => option.login !== 'peterparker@expensify.com')).toBe(true);
        });

        it('should include Concierge in the results by default', () => {
            // Given a set of report and personalDetails that include Concierge
            // When we call getValidOptions()
            const results = getValidOptions({reports: OPTIONS_WITH_CONCIERGE.reports, personalDetails: OPTIONS_WITH_CONCIERGE.personalDetails});

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
            const results = getValidOptions({reports: OPTIONS_WITH_CHRONOS.reports, personalDetails: OPTIONS_WITH_CHRONOS.personalDetails}, {excludeLogins: {[CONST.EMAIL.CHRONOS]: true}});

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
    });

    describe('getShareDestinationsOptions()', () => {
        it('should exclude archived rooms and hidden threads from share destinations', () => {
            // Given a set of filtered current Reports (as we do in the component) before getting share destination options
            const filteredReports = Object.values(OPTIONS.reports).reduce<OptionList['reports']>((filtered, option) => {
                const report = option.item;
                if (canUserPerformWriteAction(report) && canCreateTaskInReport(report) && !isCanceledTaskReport(report)) {
                    filtered.push(option);
                }
                return filtered;
            }, []);

            // When we call getShareDestinationOptions with an empty search value
            const results = getShareDestinationOptions(filteredReports, OPTIONS.personalDetails, []);

            // Then all the recent reports should be returned except the archived rooms and the hidden thread
            expect(results.recentReports.length).toBe(Object.values(OPTIONS.reports).length - 2);
        });

        it('should include DMS, group chats, and workspace rooms in share destinations', () => {
            // Given a set of filtered current Reports (as we do in the component) with workspace rooms before getting share destination options
            const filteredReportsWithWorkspaceRooms = Object.values(OPTIONS_WITH_WORKSPACE_ROOM.reports).reduce<OptionList['reports']>((filtered, option) => {
                const report = option.item;
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                if (canUserPerformWriteAction(report) || isExpensifyOnlyParticipantInReport(report)) {
                    filtered.push(option);
                }
                return filtered;
            }, []);

            // When we call getShareDestinationOptions with an empty search value
            const results = getShareDestinationOptions(filteredReportsWithWorkspaceRooms, OPTIONS.personalDetails, []);

            // Then all recent reports should be returned except the archived rooms and the hidden thread
            expect(results.recentReports.length).toBe(Object.values(OPTIONS_WITH_WORKSPACE_ROOM.reports).length - 2);
        });
    });

    describe('getShareLogOptions()', () => {
        it('should not include read-only report', () => {
            // Given a list of 11 report options with reportID of 10 is archived
            // When we call getShareLogOptions
            const results = getShareLogOptions(OPTIONS, []);

            // Then the report with reportID of 10 should not be included on the list
            expect(results.recentReports.length).toBe(10);
            expect(results.recentReports.find((report) => report.reportID === '10')).toBeUndefined();
        });
    });

    describe('getMemberInviteOptions()', () => {
        it('should sort personal details alphabetically', () => {
            // Given a set of personalDetails
            // When we call getMemberInviteOptions
            const results = getMemberInviteOptions(OPTIONS.personalDetails, []);

            // Then personal details should be sorted alphabetically
            expect(results.personalDetails.at(0)?.text).toBe('Black Panther');
            expect(results.personalDetails.at(1)?.text).toBe('Black Widow');
            expect(results.personalDetails.at(2)?.text).toBe('Captain America');
            expect(results.personalDetails.at(3)?.text).toBe('Invisible Woman');
        });
    });

    describe('getLastActorDisplayName()', () => {
        it('should return correct display name', () => {
            // Given two different personal details
            // When we call getLastActorDisplayName
            const result1 = getLastActorDisplayName(PERSONAL_DETAILS['2']);
            const result2 = getLastActorDisplayName(PERSONAL_DETAILS['3']);

            // We should expect the display names to be the same as the personal details
            expect(result1).toBe('You');
            expect(result2).toBe('Spider-Man');
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
            const options = getSearchOptions(OPTIONS, [CONST.BETAS.ALL]);
            // When we pass the returned options to filterAndOrderOptions with an empty search value
            const filteredOptions = filterAndOrderOptions(options, '');

            // Then all options should be returned
            expect(filteredOptions.recentReports.length + filteredOptions.personalDetails.length).toBe(13);
        });

        it('should return filtered options in correct order', () => {
            const searchText = 'man';
            // Given a set of options
            // When we call getSearchOptions with all betas
            const options = getSearchOptions(OPTIONS, [CONST.BETAS.ALL]);
            // When we pass the returned options to filterAndOrderOptions with a search value and sortByReportTypeInSearch param
            const filteredOptions = filterAndOrderOptions(options, searchText, {sortByReportTypeInSearch: true});

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
            const options = getSearchOptions(OPTIONS, [CONST.BETAS.ALL]);
            // When we pass the returned options to filterAndOrderOptions with a search value
            const filteredOptions = filterAndOrderOptions(options, searchText);

            // Then only one report should be returned
            expect(filteredOptions.recentReports.length).toBe(1);
            // Then the returned report should match the search text
            expect(filteredOptions.recentReports.at(0)?.text).toBe('Mr Sinister');
        });

        it('should find archived chats', () => {
            const searchText = 'Archived';
            // Given a set of options
            // When we call getSearchOptions with all betas
            const options = getSearchOptions(OPTIONS, [CONST.BETAS.ALL]);
            // When we pass the returned options to filterAndOrderOptions with a search value
            const filteredOptions = filterAndOrderOptions(options, searchText);

            // Then only one report should be returned
            expect(filteredOptions.recentReports.length).toBe(1);
            // Then the returned report should match the search text
            expect(!!filteredOptions.recentReports.at(0)?.private_isArchived).toBe(true);
        });

        it('should filter options by email if dot is skipped in the email', () => {
            const searchText = 'barryallen';
            // Given a set of options created from PERSONAL_DETAILS_WITH_PERIODS
            const OPTIONS_WITH_PERIODS = createOptionList(PERSONAL_DETAILS_WITH_PERIODS, REPORTS);
            // When we call getSearchOptions with all betas
            const options = getSearchOptions(OPTIONS_WITH_PERIODS, [CONST.BETAS.ALL]);
            // When we pass the returned options to filterAndOrderOptions with a search value and sortByReportTypeInSearch param
            const filteredOptions = filterAndOrderOptions(options, searchText, {sortByReportTypeInSearch: true});

            // Then only one report should be returned
            expect(filteredOptions.recentReports.length).toBe(1);
            // Then the returned report should match the search text
            expect(filteredOptions.recentReports.at(0)?.login).toBe('barry.allen@expensify.com');
        });

        it('should include workspace rooms in the search results', () => {
            const searchText = 'avengers';
            // Given a set of options with workspace rooms
            // When we call getSearchOptions with all betas
            const options = getSearchOptions(OPTIONS_WITH_WORKSPACE_ROOM, [CONST.BETAS.ALL]);
            // When we pass the returned options to filterAndOrderOptions with a search value
            const filteredOptions = filterAndOrderOptions(options, searchText);

            // Then only one report should be returned
            expect(filteredOptions.recentReports.length).toBe(1);
            // Then the returned report should match the search text
            expect(filteredOptions.recentReports.at(0)?.subtitle).toBe('Avengers Room');
        });

        it('should put exact match by login on the top of the list', () => {
            const searchText = 'reedrichards@expensify.com';
            // Given a set of options with all betas
            const options = getSearchOptions(OPTIONS, [CONST.BETAS.ALL]);
            // When we pass the returned options to filterAndOrderOptions with a search value
            const filteredOptions = filterAndOrderOptions(options, searchText);

            // Then only one report should be returned
            expect(filteredOptions.recentReports.length).toBe(1);
            // Then the returned report should match the search text
            expect(filteredOptions.recentReports.at(0)?.login).toBe(searchText);
        });

        it('should prioritize options with matching display name over chatrooms', () => {
            const searchText = 'spider';
            // Given a set of options with chatrooms
            const OPTIONS_WITH_CHATROOMS = createOptionList(PERSONAL_DETAILS, REPORTS_WITH_CHAT_ROOM);
            // When we call getSearchOptions with all betas
            const options = getSearchOptions(OPTIONS_WITH_CHATROOMS, [CONST.BETAS.ALL]);
            // When we pass the returned options to filterAndOrderOptions with a search value
            const filterOptions = filterAndOrderOptions(options, searchText);

            // Then only two reports should be returned
            expect(filterOptions.recentReports.length).toBe(2);
            // Then the second report should match the search text
            expect(filterOptions.recentReports.at(1)?.isChatRoom).toBe(true);
        });

        it('should put the item with latest lastVisibleActionCreated on top when search value match multiple items', () => {
            const searchText = 'fantastic';
            // Given a set of options
            const options = getSearchOptions(OPTIONS);
            // When we call filterAndOrderOptions with a search value
            const filteredOptions = filterAndOrderOptions(options, searchText);

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
            const options = getSearchOptions(OPTIONS);
            // When we call filterAndOrderOptions with a search value
            const filteredOptions = filterAndOrderOptions(options, searchText);

            // Then the user to invite should be returned
            expect(filteredOptions.userToInvite?.login).toBe(searchText);
        });

        it('should not return any results if the search value is on an exluded logins list', () => {
            const searchText = 'admin@expensify.com';
            // Given a set of options with excluded logins list
            const options = getValidOptions({reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails}, {excludeLogins: CONST.EXPENSIFY_EMAILS_OBJECT});
            // When we call filterAndOrderOptions with a search value and excluded logins list
            const filterOptions = filterAndOrderOptions(options, searchText, {excludeLogins: CONST.EXPENSIFY_EMAILS_OBJECT});

            // Then no personal details should be returned
            expect(filterOptions.recentReports.length).toBe(0);
        });

        it('should return the user to invite when the search value is a valid, non-existent email and the user is not excluded', () => {
            const searchText = 'test@email.com';
            // Given a set of options
            const options = getSearchOptions(OPTIONS);
            // When we call filterAndOrderOptions with a search value and excludeLogins
            const filteredOptions = filterAndOrderOptions(options, searchText, {excludeLogins: CONST.EXPENSIFY_EMAILS_OBJECT});

            // Then the user to invite should be returned
            expect(filteredOptions.userToInvite?.login).toBe(searchText);
        });

        it('should return limited amount of recent reports if the limit is set', () => {
            const searchText = '';
            // Given a set of options
            const options = getSearchOptions(OPTIONS);
            // When we call filterAndOrderOptions with a search value and maxRecentReportsToShow set to 2
            const filteredOptions = filterAndOrderOptions(options, searchText, {maxRecentReportsToShow: 2});

            // Then only two reports should be returned
            expect(filteredOptions.recentReports.length).toBe(2);

            // Note: in the past maxRecentReportsToShow: 0 would return all recent reports, this has changed, and is expected to return none now
            // When we call filterAndOrderOptions with a search value and maxRecentReportsToShow set to 0
            const limitToZeroOptions = filterAndOrderOptions(options, searchText, {maxRecentReportsToShow: 0});

            // Then no reports should be returned
            expect(limitToZeroOptions.recentReports.length).toBe(0);
        });

        it('should not return any user to invite if email exists on the personal details list', () => {
            const searchText = 'natasharomanoff@expensify.com';
            // Given a set of options with all betas
            const options = getSearchOptions(OPTIONS, [CONST.BETAS.ALL]);
            // When we call filterAndOrderOptions with a search value
            const filteredOptions = filterAndOrderOptions(options, searchText);

            // Then there should be one matching result
            expect(filteredOptions.personalDetails.length).toBe(1);
            // Then the user to invite should be null
            expect(filteredOptions.userToInvite).toBe(null);
        });

        it('should not return any options if search value does not match any personal details (getMemberInviteOptions)', () => {
            // Given a set of options
            const options = getMemberInviteOptions(OPTIONS.personalDetails, []);
            // When we call filterAndOrderOptions with a search value that does not match any personal details
            const filteredOptions = filterAndOrderOptions(options, 'magneto');

            // Then no personal details should be returned
            expect(filteredOptions.personalDetails.length).toBe(0);
        });

        it('should return one personal detail if search value matches an email (getMemberInviteOptions)', () => {
            // Given a set of options
            const options = getMemberInviteOptions(OPTIONS.personalDetails, []);
            // When we call filterAndOrderOptions with a search value that matches an email
            const filteredOptions = filterAndOrderOptions(options, 'peterparker@expensify.com');

            // Then one personal detail should be returned
            expect(filteredOptions.personalDetails.length).toBe(1);
            // Then the returned personal detail should match the search text
            expect(filteredOptions.personalDetails.at(0)?.text).toBe('Spider-Man');
        });

        it('should not show any recent reports if a search value does not match the group chat name (getShareDestinationsOptions)', () => {
            // Given a set of filtered current Reports (as we do in the component) before getting share destination options
            const filteredReports = Object.values(OPTIONS.reports).reduce<OptionList['reports']>((filtered, option) => {
                const report = option.item;
                if (canUserPerformWriteAction(report) && canCreateTaskInReport(report) && !isCanceledTaskReport(report)) {
                    filtered.push(option);
                }
                return filtered;
            }, []);
            // When we call getShareDestinationOptions with the filteredReports
            const options = getShareDestinationOptions(filteredReports, OPTIONS.personalDetails, []);
            // When we pass the returned options to filterAndOrderOptions with a search value that does not match the group chat name
            const filteredOptions = filterAndOrderOptions(options, 'mutants');

            // Then no recent reports should be returned
            expect(filteredOptions.recentReports.length).toBe(0);
        });

        it('should return a workspace room when we search for a workspace room(getShareDestinationsOptions)', () => {
            // Given a set of filtered current Reports (as we do in the component) before getting share destination options
            const filteredReportsWithWorkspaceRooms = Object.values(OPTIONS_WITH_WORKSPACE_ROOM.reports).reduce<OptionList['reports']>((filtered, option) => {
                const report = option.item;
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                if (canUserPerformWriteAction(report) || isExpensifyOnlyParticipantInReport(report)) {
                    filtered.push(option);
                }
                return filtered;
            }, []);

            // When we call getShareDestinationOptions with the filteredReports
            const options = getShareDestinationOptions(filteredReportsWithWorkspaceRooms, OPTIONS.personalDetails, []);
            // When we pass the returned options to filterAndOrderOptions with a search value that matches the group chat name
            const filteredOptions = filterAndOrderOptions(options, 'Avengers Room');

            // Then one recent report should be returned
            expect(filteredOptions.recentReports.length).toBe(1);
        });

        it('should not show any results if searching for a non-existing workspace room(getShareDestinationOptions)', () => {
            // Given a set of filtered current Reports (as we do in the component) before getting share destination options
            const filteredReportsWithWorkspaceRooms = Object.values(OPTIONS_WITH_WORKSPACE_ROOM.reports).reduce<OptionList['reports']>((filtered, option) => {
                const report = option.item;
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                if (canUserPerformWriteAction(report) || isExpensifyOnlyParticipantInReport(report)) {
                    filtered.push(option);
                }
                return filtered;
            }, []);

            // When we call getShareDestinationOptions with the filteredReports
            const options = getShareDestinationOptions(filteredReportsWithWorkspaceRooms, OPTIONS.personalDetails, []);
            // When we pass the returned options to filterAndOrderOptions with a search value that does not match the group chat name
            const filteredOptions = filterAndOrderOptions(options, 'Mutants Lair');

            // Then no recent reports should be returned
            expect(filteredOptions.recentReports.length).toBe(0);
        });

        it('should show the option from personal details when searching for personal detail with no existing report', () => {
            // Given a set of options
            const options = getValidOptions({reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails});
            // When we call filterAndOrderOptions with a search value that matches a personal detail with no existing report
            const filteredOptions = filterAndOrderOptions(options, 'hulk');

            // Then no recent reports should be returned
            expect(filteredOptions.recentReports.length).toBe(0);
            // Then one personal detail should be returned
            expect(filteredOptions.personalDetails.length).toBe(1);
            // Then the returned personal detail should match the search text
            expect(filteredOptions.personalDetails.at(0)?.login).toBe('brucebanner@expensify.com');
        });

        it('should not return any options or user to invite if there are no search results and the string does not match a potential email or phone', () => {
            // Given a set of options
            const options = getValidOptions({reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails});
            // When we call filterAndOrderOptions with a search value that does not match any personal details or reports
            const filteredOptions = filterAndOrderOptions(options, 'marc@expensify');

            // Then no recent reports or personal details should be returned
            expect(filteredOptions.recentReports.length).toBe(0);
            expect(filteredOptions.personalDetails.length).toBe(0);
            // Then no user to invite should be returned
            expect(filteredOptions.userToInvite).toBe(null);
        });

        it('should not return any options but should return an user to invite if no matching options exist and the search value is a potential email', () => {
            // Given a set of options
            const options = getValidOptions({reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails});
            // When we call filterAndOrderOptions with a search value that does not match any personal details or reports
            const filteredOptions = filterAndOrderOptions(options, 'marc@expensify.com');

            // Then no recent reports or personal details should be returned
            expect(filteredOptions.recentReports.length).toBe(0);
            expect(filteredOptions.personalDetails.length).toBe(0);
            // Then an user to invite should be returned
            expect(filteredOptions.userToInvite).not.toBe(null);
        });

        it('should return user to invite when search term has a period with options for it that do not contain the period', () => {
            // Given a set of options
            const options = getValidOptions({reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails});
            // When we call filterAndOrderOptions with a search value that does not match any personal details or reports but matches user to invite
            const filteredOptions = filterAndOrderOptions(options, 'peter.parker@expensify.com');

            // Then no recent reports should be returned
            expect(filteredOptions.recentReports.length).toBe(0);
            // Then one user to invite should be returned
            expect(filteredOptions.userToInvite).not.toBe(null);
        });

        it('should not return options but should return an user to invite if no matching options exist and the search value is a potential phone number', () => {
            // Given a set of options
            const options = getValidOptions({reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails});
            // When we call filterAndOrderOptions with a search value that does not match any personal details or reports but matches user to invite
            const filteredOptions = filterAndOrderOptions(options, '5005550006');

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
            const options = getValidOptions({reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails});
            // When we call filterAndOrderOptions with a search value that does not match any personal details or reports but matches user to invite
            const filteredOptions = filterAndOrderOptions(options, '+15005550006');

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
            const options = getValidOptions({reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails});
            // When we call filterAndOrderOptions with a search value that does not match any personal details or reports but matches user to invite
            const filteredOptions = filterAndOrderOptions(options, '+1 (800)324-3233');

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
            const options = getValidOptions({reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails});
            // When we call filterAndOrderOptions with a search value that does not match any personal details or reports
            const filteredOptions = filterAndOrderOptions(options, '998243aaaa');

            // Then no recent reports or personal details should be returned
            expect(filteredOptions.recentReports.length).toBe(0);
            expect(filteredOptions.personalDetails.length).toBe(0);
            // Then no user to invite should be returned
            expect(filteredOptions.userToInvite).toBe(null);
        });

        it('should not return any options if search value does not match any personal details', () => {
            // Given a set of options
            const options = getValidOptions({reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails});
            // When we call filterAndOrderOptions with a search value that does not match any personal details
            const filteredOptions = filterAndOrderOptions(options, 'magneto');

            // Then no personal details should be returned
            expect(filteredOptions.personalDetails.length).toBe(0);
        });

        it('should return one recent report and no personal details if a search value provides an email', () => {
            // Given a set of options
            const options = getValidOptions({reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails});
            // When we call filterAndOrderOptions with a search value that matches an email
            const filteredOptions = filterAndOrderOptions(options, 'peterparker@expensify.com', {sortByReportTypeInSearch: true});

            // Then one recent report should be returned
            expect(filteredOptions.recentReports.length).toBe(1);
            // Then the returned recent report should match the search text
            expect(filteredOptions.recentReports.at(0)?.text).toBe('Spider-Man');
            // Then no personal details should be returned
            expect(filteredOptions.personalDetails.length).toBe(0);
        });

        it('should return all matching reports and personal details', () => {
            // Given a set of options
            const options = getValidOptions({reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails});
            // When we call filterAndOrderOptions with a search value that matches both reports and personal details and maxRecentReportsToShow param
            const filteredOptions = filterAndOrderOptions(options, '.com', {maxRecentReportsToShow: 5});

            // Then there should be 4 matching personal details
            expect(filteredOptions.personalDetails.length).toBe(4);
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
            const options = getSearchOptions(OPTIONS);
            // When we call filterAndOrderOptions with a search value that matches a personal detail
            const filteredOptions = filterAndOrderOptions(options, 'spider');

            // Then one personal detail should be returned
            expect(filteredOptions.recentReports.length).toBe(1);
            // Then the returned personal detail should match the search text
            expect(filteredOptions.recentReports.at(0)?.text).toBe('Spider-Man');
        });

        it('should return latest lastVisibleActionCreated item on top when search value matches multiple items (getSearchOptions)', () => {
            // Given a set of options
            const options = getSearchOptions(OPTIONS);
            // When we call filterAndOrderOptions with a search value that matches multiple items
            const filteredOptions = filterAndOrderOptions(options, 'fantastic');

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
                    const OPTIONS_WITH_PERIODS = createOptionList(PERSONAL_DETAILS_WITH_PERIODS, REPORTS);
                    // When we call getSearchOptions
                    const results = getSearchOptions(OPTIONS_WITH_PERIODS);
                    // When we pass the returned options to filterAndOrderOptions with a search value
                    const filteredResults = filterAndOrderOptions(results, 'barry.allen@expensify.com', {sortByReportTypeInSearch: true});

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
            const options = getSearchOptions(OPTIONS, [CONST.BETAS.ALL]);
            // When we call filterAndOrderOptions with a an empty search value
            const filteredOptions = filterAndOrderOptions(options, '');
            const matchingEntries = filteredOptions.personalDetails.filter((detail) => detail.login === login);

            // Then there should be 2 unique login entries
            expect(filteredOptions.personalDetails.length).toBe(2);
            // Then there should be 1 matching entry
            expect(matchingEntries.length).toBe(1);
        });

        it('should order self dm always on top if the search matches with the self dm login', () => {
            const searchTerm = 'tonystark@expensify.com';
            const OPTIONS_WITH_SELFDM = createOptionList(PERSONAL_DETAILS, REPORTS_WITH_SELFDM);

            // Given a set of options with self dm and all betas
            const options = getSearchOptions(OPTIONS_WITH_SELFDM, [CONST.BETAS.ALL]);
            // When we call filterAndOrderOptions with a search value
            const filteredOptions = filterAndOrderOptions(options, searchTerm);

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
            // Given a set of reports and personal details
            // When we call createOptionList and extract the reports
            const reports = createOptionList(PERSONAL_DETAILS, REPORTS).reports;

            // Then the returned reports should match the expected values
            expect(reports.at(10)?.subtitle).toBe(`Submits to Mister Fantastic`);

            return (
                waitForBatchedUpdates()
                    // When we set the preferred locale to Spanish
                    .then(() => Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.ES))
                    .then(() => {
                        // When we call createOptionList again
                        const newReports = createOptionList(PERSONAL_DETAILS, REPORTS).reports;
                        // Then the returned reports should change to Spanish
                        expect(newReports.at(10)?.subtitle).toBe('Se envía a Mister Fantastic');
                    })
            );
        });
    });

    describe('filterWorkspaceChats()', () => {
        it('should return an empty array if there are no workspace chats', () => {
            // Given an empty array of workspace chats and no search terms
            // When we call filterWorkspaceChats
            const result = filterWorkspaceChats([], []);

            // Then the returned value should be an empty array
            expect(result.length).toEqual(0);
        });

        it('should return all workspace chats if there are no search terms', () => {
            // Given a list of workspace chats and no search terms
            // When we call filterWorkspaceChats
            const result = filterWorkspaceChats(WORKSPACE_CHATS, []);

            // Then the returned value should be the same as the input
            expect(result).toEqual(WORKSPACE_CHATS);
            // Then the length of the result should be equal to the length of the input
            expect(result.length).toEqual(WORKSPACE_CHATS.length);
        });

        it('should filter multiple workspace chats by search term', () => {
            // Given a list of workspace chats and one search term
            // When we call filterWorkspaceChats
            const result = filterWorkspaceChats(WORKSPACE_CHATS, ['Google']);

            // Then the returned value should should only include the matching workspace chats
            expect(result.length).toEqual(2);
        });

        it('should filter workspace chat by exact name', () => {
            // Given a list of workspace chats and multiple search terms that reflect the exact name
            // When we call filterWorkspaceChats
            const result = filterWorkspaceChats(WORKSPACE_CHATS, ['Microsoft', 'Teams', 'Workspace']);

            // Then the returned value should should only include the matching workspace chat
            expect(result.length).toEqual(1);
        });

        it('should return an empty array if there are no matching workspace chats', () => {
            // Given a list of workspace chats and a search term that does not match any workspace chats
            // When we call filterWorkspaceChats
            const result = filterWorkspaceChats(WORKSPACE_CHATS, ['XYZ']);

            // Then the returned value should be an empty array
            expect(result.length).toEqual(0);
        });
    });

    describe('orderWorkspaceOptions()', () => {
        it('should put the default workspace on top of the list', () => {
            // Given a list of workspace chats
            // When we call orderWorkspaceOptions
            const result = orderWorkspaceOptions(WORKSPACE_CHATS);

            // Then the first item in the list should be the default workspace
            expect(result.at(0)?.text).toEqual('Notion Workspace for Marketing');
        });
    });

    describe('Alternative text', () => {
        it("The text should not contain the last actor's name at prefix if the report is archived.", async () => {
            // When we set the preferred locale to English and create an ADD_COMMENT report action
            await Onyx.multiSet({
                [ONYXKEYS.NVP_PREFERRED_LOCALE]: CONST.LOCALES.EN,
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}10` as const]: {
                    '1': getFakeAdvancedReportAction(CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT),
                },
            });
            // When we call createOptionList
            const reports = createOptionList(PERSONAL_DETAILS, REPORTS).reports;
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
            const reports = [{text: "Álex Timón D'artagnan Zo-e"} as OptionData];
            // Given a search term with non-accented characters
            const searchTerms = ['Alex Timon Dartagnan Zoe'];
            // When we call filterReports with the report and search terms
            const filteredReports = filterReports(reports, searchTerms);

            // Then the returned value should match the search term
            expect(filteredReports).toEqual(reports);
        });
    });
});
