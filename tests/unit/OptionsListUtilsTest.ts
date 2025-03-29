/* eslint-disable @typescript-eslint/naming-convention */
import type {OnyxCollection} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import DateUtils from '@libs/DateUtils';
import {canCreateTaskInReport, canUserPerformWriteAction, isCanceledTaskReport, isExpensifyOnlyParticipantInReport} from '@libs/ReportUtils';
import type {OptionData} from '@libs/ReportUtils';
import CONST from '@src/CONST';
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
} from '@src/libs/OptionsListUtils';
import type {OptionList, Options} from '@src/libs/OptionsListUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetails, Policy, Report} from '@src/types/onyx';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

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

    const activePolicyID = 'DEF456';

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

    const PERSONAL_DETAILS_WITH_PERIODS: PersonalDetailsList = {
        ...PERSONAL_DETAILS,

        '1002': {
            accountID: 1002,
            displayName: 'The Flash',
            login: 'barry.allen@expensify.com',
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

    it('getSearchOptions()', () => {
        // When we filter in the Search view without providing a searchValue
        const results = getSearchOptions(OPTIONS, [CONST.BETAS.ALL]);

        // All 2 personalDetails (including those that have reports) should be returned
        // Filtering of personalDetails that have reports is done in filterOptions
        expect(results.personalDetails.length).toBe(9);

        // Then all of the reports should be shown including the archived rooms, except for the thread report with notificationPreferences hidden.
        expect(results.recentReports.length).toBe(Object.values(OPTIONS.reports).length - 1);
    });

    it('orderOptions()', () => {
        // When we call getValidOptions() with no search value
        let results: Pick<Options, 'personalDetails' | 'recentReports'> = getValidOptions({
            reports: OPTIONS.reports,
            personalDetails: OPTIONS.personalDetails,
        });
        results = orderOptions(results);

        // We should expect all personalDetails except the currently logged in user to be returned
        // Filtering of personalDetails that have reports is done in filterOptions
        expect(results.personalDetails.length).toBe(Object.values(OPTIONS.personalDetails).length - 1);

        // All personal details including those that have reports should be returned
        // We should expect personal details sorted alphabetically
        expect(results.personalDetails.at(0)?.text).toBe('Black Panther');
        expect(results.personalDetails.at(1)?.text).toBe('Black Widow');
        expect(results.personalDetails.at(2)?.text).toBe('Captain America');
        expect(results.personalDetails.at(3)?.text).toBe('Invisible Woman');
        expect(results.personalDetails.at(4)?.text).toBe('Mister Fantastic');
        expect(results.personalDetails.at(5)?.text).toBe('Mr Sinister');
        expect(results.personalDetails.at(6)?.text).toBe('Spider-Man');
        expect(results.personalDetails.at(7)?.text).toBe('The Incredible Hulk');
        expect(results.personalDetails.at(8)?.text).toBe('Thor');

        // Then the result which has an existing report should also have the reportID attached
        const personalDetailWithExistingReport = results.personalDetails.find((personalDetail) => personalDetail.login === 'peterparker@expensify.com');
        expect(personalDetailWithExistingReport?.reportID).toBe('2');

        // When we only pass personal details
        results = getValidOptions({personalDetails: OPTIONS.personalDetails, reports: []});
        results = orderOptions(results);

        // We should expect personal details sorted alphabetically
        expect(results.personalDetails.at(0)?.text).toBe('Black Panther');
        expect(results.personalDetails.at(1)?.text).toBe('Black Widow');
        expect(results.personalDetails.at(2)?.text).toBe('Captain America');
        expect(results.personalDetails.at(3)?.text).toBe('Invisible Woman');
    });

    it('getValidOptions()', () => {
        // When we don't include personal detail to the result
        let results = getValidOptions({
            personalDetails: [],
            reports: [],
        });

        // Then no personal detail options will be returned
        expect(results.personalDetails.length).toBe(0);

        // Test for Concierge's existence in chat options

        results = getValidOptions({reports: OPTIONS_WITH_CONCIERGE.reports, personalDetails: OPTIONS_WITH_CONCIERGE.personalDetails});

        // Concierge is included in the results by default. We should expect all the personalDetails to show
        // (minus the currently logged in user)
        // Filtering of personalDetails that have reports is done in filterOptions
        expect(results.personalDetails.length).toBe(Object.values(OPTIONS_WITH_CONCIERGE.personalDetails).length - 1);
        expect(results.recentReports).toEqual(expect.arrayContaining([expect.objectContaining({login: 'concierge@expensify.com'})]));

        // Test by excluding Concierge from the results
        results = getValidOptions(
            {
                reports: OPTIONS_WITH_CONCIERGE.reports,
                personalDetails: OPTIONS_WITH_CONCIERGE.personalDetails,
            },
            {
                excludeLogins: {[CONST.EMAIL.CONCIERGE]: true},
            },
        );

        // All the personalDetails should be returned minus the currently logged in user and Concierge
        // Filtering of personalDetails that have reports is done in filterOptions
        expect(results.personalDetails.length).toBe(Object.values(OPTIONS_WITH_CONCIERGE.personalDetails).length - 2);
        expect(results.personalDetails).not.toEqual(expect.arrayContaining([expect.objectContaining({login: 'concierge@expensify.com'})]));

        // Test by excluding Chronos from the results
        results = getValidOptions({reports: OPTIONS_WITH_CHRONOS.reports, personalDetails: OPTIONS_WITH_CHRONOS.personalDetails}, {excludeLogins: {[CONST.EMAIL.CHRONOS]: true}});

        // All the personalDetails should be returned minus the currently logged in user and Concierge
        // Filtering of personalDetails that have reports is done in filterOptions
        expect(results.personalDetails.length).toBe(Object.values(OPTIONS_WITH_CHRONOS.personalDetails).length - 2);
        expect(results.personalDetails).not.toEqual(expect.arrayContaining([expect.objectContaining({login: 'chronos@expensify.com'})]));

        // Test by excluding Receipts from the results
        results = getValidOptions(
            {
                reports: OPTIONS_WITH_RECEIPTS.reports,
                personalDetails: OPTIONS_WITH_RECEIPTS.personalDetails,
            },
            {
                excludeLogins: {[CONST.EMAIL.RECEIPTS]: true},
            },
        );

        // All the personalDetails should be returned minus the currently logged in user and Concierge
        // Filtering of personalDetails that have reports is done in filterOptions
        expect(results.personalDetails.length).toBe(Object.values(OPTIONS_WITH_RECEIPTS.personalDetails).length - 2);
        expect(results.personalDetails).not.toEqual(expect.arrayContaining([expect.objectContaining({login: 'receipts@expensify.com'})]));

        // Test for check if Manager McTest is correctly included or excluded from the results
        let options = getValidOptions(
            {reports: OPTIONS_WITH_MANAGER_MCTEST.reports, personalDetails: OPTIONS_WITH_MANAGER_MCTEST.personalDetails},
            {includeP2P: true, canShowManagerMcTest: true, betas: [CONST.BETAS.NEWDOT_MANAGER_MCTEST]},
        );
        expect(options.personalDetails).toEqual(expect.arrayContaining([expect.objectContaining({login: CONST.EMAIL.MANAGER_MCTEST})]));

        // Manager McTest shouldn't be included to recipients when its not an IOU action
        options = getValidOptions(
            {reports: OPTIONS_WITH_MANAGER_MCTEST.reports, personalDetails: OPTIONS_WITH_MANAGER_MCTEST.personalDetails},
            {includeP2P: true, betas: [CONST.BETAS.NEWDOT_MANAGER_MCTEST]},
        );

        expect(options.personalDetails).not.toEqual(expect.arrayContaining([expect.objectContaining({login: CONST.EMAIL.MANAGER_MCTEST})]));

        return waitForBatchedUpdates()
            .then(() =>
                Onyx.set(ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING, {
                    [CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.SCAN_TEST_TOOLTIP]: {
                        timestamp: DateUtils.getDBTime(new Date().valueOf()),
                    },
                }),
            )
            .then(() => {
                // Manager McTest shouldn't be included to recipients when the user has already submitted an expense
                const optionsWhenUserAlreadySubmittedExpense = getValidOptions(
                    {reports: OPTIONS_WITH_MANAGER_MCTEST.reports, personalDetails: OPTIONS_WITH_MANAGER_MCTEST.personalDetails},
                    {includeP2P: true, canShowManagerMcTest: true, betas: [CONST.BETAS.NEWDOT_MANAGER_MCTEST]},
                );
                expect(optionsWhenUserAlreadySubmittedExpense.personalDetails).not.toEqual(expect.arrayContaining([expect.objectContaining({login: CONST.EMAIL.MANAGER_MCTEST})]));
            });
    });

    it('getValidOptions() for group Chat', () => {
        // When we call getValidOptions() with no search value
        let results = getValidOptions({reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails});

        // We should expect all the personalDetails to show except the currently logged in user
        // Filtering of personalDetails that have reports is done in filterOptions
        expect(results.personalDetails.length).toBe(Object.values(OPTIONS.personalDetails).length - 1);

        // And none of our personalDetails should include any of the users with recent reports
        const reportLogins = results.recentReports.map((reportOption) => reportOption.login);
        const personalDetailsOverlapWithReports = results.personalDetails.every((personalDetailOption) => reportLogins.includes(personalDetailOption.login));
        expect(personalDetailsOverlapWithReports).toBe(false);

        // When we provide a "selected" option to getValidOptions()
        results = getValidOptions({reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails}, {excludeLogins: {'peterparker@expensify.com': true}});

        // Then the option should not appear anywhere in either list
        expect(results.recentReports.every((option) => option.login !== 'peterparker@expensify.com')).toBe(true);
        expect(results.personalDetails.every((option) => option.login !== 'peterparker@expensify.com')).toBe(true);

        // Test Concierge's existence in new group options
        results = getValidOptions({reports: OPTIONS_WITH_CONCIERGE.reports, personalDetails: OPTIONS_WITH_CONCIERGE.personalDetails});

        // Concierge is included in the results by default. We should expect all the personalDetails to show
        // (minus the currently logged in user)
        // Filtering of personalDetails that have reports is done in filterOptions
        expect(results.personalDetails.length).toBe(Object.values(OPTIONS_WITH_CONCIERGE.personalDetails).length - 1);
        expect(results.recentReports).toEqual(expect.arrayContaining([expect.objectContaining({login: 'concierge@expensify.com'})]));

        // Test by excluding Concierge from the results
        results = getValidOptions(
            {
                reports: OPTIONS_WITH_CONCIERGE.reports,
                personalDetails: OPTIONS_WITH_CONCIERGE.personalDetails,
            },
            {
                excludeLogins: {[CONST.EMAIL.CONCIERGE]: true},
            },
        );

        // We should expect all the personalDetails to show (minus
        // the currently logged in user and Concierge)
        // Filtering of personalDetails that have reports is done in filterOptions
        expect(results.personalDetails.length).toBe(Object.values(OPTIONS_WITH_CONCIERGE.personalDetails).length - 2);
        expect(results.personalDetails).not.toEqual(expect.arrayContaining([expect.objectContaining({login: 'concierge@expensify.com'})]));
        expect(results.recentReports).not.toEqual(expect.arrayContaining([expect.objectContaining({login: 'concierge@expensify.com'})]));

        // Test by excluding Chronos from the results
        results = getValidOptions({reports: OPTIONS_WITH_CHRONOS.reports, personalDetails: OPTIONS_WITH_CHRONOS.personalDetails}, {excludeLogins: {[CONST.EMAIL.CHRONOS]: true}});

        // We should expect all the personalDetails to show (minus
        // the currently logged in user and Concierge)
        // Filtering of personalDetails that have reports is done in filterOptions
        expect(results.personalDetails.length).toBe(Object.values(OPTIONS_WITH_CHRONOS.personalDetails).length - 2);
        expect(results.personalDetails).not.toEqual(expect.arrayContaining([expect.objectContaining({login: 'chronos@expensify.com'})]));
        expect(results.recentReports).not.toEqual(expect.arrayContaining([expect.objectContaining({login: 'chronos@expensify.com'})]));

        // Test by excluding Receipts from the results
        results = getValidOptions(
            {
                reports: OPTIONS_WITH_RECEIPTS.reports,
                personalDetails: OPTIONS_WITH_RECEIPTS.personalDetails,
            },
            {
                excludeLogins: {[CONST.EMAIL.RECEIPTS]: true},
            },
        );

        // We should expect all the personalDetails to show (minus
        // the currently logged in user and Concierge)
        // Filtering of personalDetails that have reports is done in filterOptions
        expect(results.personalDetails.length).toBe(Object.values(OPTIONS_WITH_RECEIPTS.personalDetails).length - 2);
        expect(results.personalDetails).not.toEqual(expect.arrayContaining([expect.objectContaining({login: 'receipts@expensify.com'})]));
        expect(results.recentReports).not.toEqual(expect.arrayContaining([expect.objectContaining({login: 'receipts@expensify.com'})]));
    });

    it('getShareDestinationsOptions()', () => {
        // Filter current REPORTS as we do in the component, before getting share destination options
        const filteredReports = Object.values(OPTIONS.reports).reduce<OptionList['reports']>((filtered, option) => {
            const report = option.item;
            if (canUserPerformWriteAction(report) && canCreateTaskInReport(report) && !isCanceledTaskReport(report)) {
                filtered.push(option);
            }
            return filtered;
        }, []);

        // When we pass an empty search value
        let results = getShareDestinationOptions(filteredReports, OPTIONS.personalDetails, []);

        // Then we should expect all the recent reports to show but exclude the archived rooms and the hidden thread
        expect(results.recentReports.length).toBe(Object.values(OPTIONS.reports).length - 2);

        // Filter current REPORTS_WITH_WORKSPACE_ROOMS as we do in the component, before getting share destination options
        const filteredReportsWithWorkspaceRooms = Object.values(OPTIONS_WITH_WORKSPACE_ROOM.reports).reduce<OptionList['reports']>((filtered, option) => {
            const report = option.item;
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            if (canUserPerformWriteAction(report) || isExpensifyOnlyParticipantInReport(report)) {
                filtered.push(option);
            }
            return filtered;
        }, []);

        // When we also have a policy to return rooms in the results
        results = getShareDestinationOptions(filteredReportsWithWorkspaceRooms, OPTIONS.personalDetails, []);
        // Then we should expect the DMS, the group chats and the workspace room to show
        // We should expect all the recent reports to show, excluding the archived rooms and the hidden thread
        expect(results.recentReports.length).toBe(Object.values(OPTIONS_WITH_WORKSPACE_ROOM.reports).length - 2);
    });

    describe('getShareLogOptions', () => {
        it('should not include read-only report', () => {
            // Given a list of 11 report options with reportID of 10 is archived
            // OPTIONS, defined above

            // When getting the share log options
            const results = getShareLogOptions(OPTIONS, []);

            // Then the report with reportID of 10 should not be included on the list
            expect(results.recentReports.length).toBe(10);
            expect(results.recentReports.find((report) => report.reportID === '10')).toBeUndefined();
        });
    });

    it('getMemberInviteOptions()', () => {
        // When we only pass personal details
        const results = getMemberInviteOptions(OPTIONS.personalDetails, []);

        // We should expect personal details to be sorted alphabetically
        expect(results.personalDetails.at(0)?.text).toBe('Black Panther');
        expect(results.personalDetails.at(1)?.text).toBe('Black Widow');
        expect(results.personalDetails.at(2)?.text).toBe('Captain America');
        expect(results.personalDetails.at(3)?.text).toBe('Invisible Woman');
    });

    it('getLastActorDisplayName()', () => {
        expect(getLastActorDisplayName(PERSONAL_DETAILS['2'])).toBe('You');
        expect(getLastActorDisplayName(PERSONAL_DETAILS['3'])).toBe('Spider-Man');
    });

    it('formatMemberForList()', () => {
        const formattedMembers = Object.values(PERSONAL_DETAILS).map((personalDetail) => formatMemberForList(personalDetail));

        // We're only formatting items inside the array, so the order should be the same as the original PERSONAL_DETAILS array
        expect(formattedMembers.at(0)?.text).toBe('Mister Fantastic');
        expect(formattedMembers.at(1)?.text).toBe('Iron Man');
        expect(formattedMembers.at(2)?.text).toBe('Spider-Man');

        // We should expect only the first item to be selected
        expect(formattedMembers.at(0)?.isSelected).toBe(true);

        // And all the others to be unselected
        expect(formattedMembers.slice(1).every((personalDetail) => !personalDetail.isSelected)).toBe(true);

        // `isDisabled` is always false
        expect(formattedMembers.every((personalDetail) => !personalDetail.isDisabled)).toBe(true);
    });

    describe('filterAndOrderOptions', () => {
        it('should return all options when search is empty', () => {
            const options = getSearchOptions(OPTIONS, [CONST.BETAS.ALL]);
            const filteredOptions = filterAndOrderOptions(options, '');

            expect(filteredOptions.recentReports.length + filteredOptions.personalDetails.length).toBe(13);
        });

        it('should return filtered options in correct order', () => {
            const searchText = 'man';
            const options = getSearchOptions(OPTIONS, [CONST.BETAS.ALL]);

            const filteredOptions = filterAndOrderOptions(options, searchText, {sortByReportTypeInSearch: true});

            // When sortByReportTypeInSearch is true, we expect all options to be part of the recentReports list and reports should be first:
            expect(filteredOptions.personalDetails.length).toBe(0);

            // Expect to only find reports that matched our search text:
            expect(filteredOptions.recentReports.length).toBe(4);

            // This items should be ordered by most recent action (and other criteria such as whether they are archived):
            expect(filteredOptions.recentReports.at(0)?.text).toBe('Invisible Woman'); // '2022-11-22 03:26:02.019'
            expect(filteredOptions.recentReports.at(1)?.text).toBe('Spider-Man'); // '2022-11-22 03:26:02.016'
            expect(filteredOptions.recentReports.at(2)?.text).toBe('Black Widow'); // This is a personal detail, which has no lastVisibleActionCreated, but matches the login
            expect(filteredOptions.recentReports.at(3)?.text).toBe('Mister Fantastic, Invisible Woman'); // This again is a report with '2022-11-22 03:26:02.015'
        });

        it('should filter users by email', () => {
            const searchText = 'mistersinister@marauders.com';
            const options = getSearchOptions(OPTIONS, [CONST.BETAS.ALL]);

            const filteredOptions = filterAndOrderOptions(options, searchText);

            expect(filteredOptions.recentReports.length).toBe(1);
            expect(filteredOptions.recentReports.at(0)?.text).toBe('Mr Sinister');
        });

        it('should find archived chats', () => {
            const searchText = 'Archived';
            const options = getSearchOptions(OPTIONS, [CONST.BETAS.ALL]);
            const filteredOptions = filterAndOrderOptions(options, searchText);

            expect(filteredOptions.recentReports.length).toBe(1);
            expect(!!filteredOptions.recentReports.at(0)?.private_isArchived).toBe(true);
        });

        it('should filter options by email if dot is skipped in the email', () => {
            const searchText = 'barryallen';
            const OPTIONS_WITH_PERIODS = createOptionList(PERSONAL_DETAILS_WITH_PERIODS, REPORTS);
            const options = getSearchOptions(OPTIONS_WITH_PERIODS, [CONST.BETAS.ALL]);

            const filteredOptions = filterAndOrderOptions(options, searchText, {sortByReportTypeInSearch: true});

            expect(filteredOptions.recentReports.length).toBe(1);
            expect(filteredOptions.recentReports.at(0)?.login).toBe('barry.allen@expensify.com');
        });

        it('should include workspace rooms in the search results', () => {
            const searchText = 'avengers';
            const options = getSearchOptions(OPTIONS_WITH_WORKSPACE_ROOM, [CONST.BETAS.ALL]);

            const filteredOptions = filterAndOrderOptions(options, searchText);

            expect(filteredOptions.recentReports.length).toBe(1);
            expect(filteredOptions.recentReports.at(0)?.subtitle).toBe('Avengers Room');
        });

        it('should put exact match by login on the top of the list', () => {
            const searchText = 'reedrichards@expensify.com';
            const options = getSearchOptions(OPTIONS, [CONST.BETAS.ALL]);

            const filteredOptions = filterAndOrderOptions(options, searchText);

            expect(filteredOptions.recentReports.length).toBe(1);
            expect(filteredOptions.recentReports.at(0)?.login).toBe(searchText);
        });

        it('should prioritize options with matching display name over chatrooms', () => {
            const searchText = 'spider';
            const OPTIONS_WITH_CHATROOMS = createOptionList(PERSONAL_DETAILS, REPORTS_WITH_CHAT_ROOM);
            const options = getSearchOptions(OPTIONS_WITH_CHATROOMS, [CONST.BETAS.ALL]);

            const filterOptions = filterAndOrderOptions(options, searchText);

            expect(filterOptions.recentReports.length).toBe(2);
            expect(filterOptions.recentReports.at(1)?.isChatRoom).toBe(true);
        });

        it('should put the item with latest lastVisibleActionCreated on top when search value match multiple items', () => {
            const searchText = 'fantastic';

            const options = getSearchOptions(OPTIONS);
            const filteredOptions = filterAndOrderOptions(options, searchText);

            expect(filteredOptions.recentReports.length).toBe(3);
            expect(filteredOptions.recentReports.at(0)?.text).toBe('Mister Fantastic');
            expect(filteredOptions.recentReports.at(1)?.text).toBe('Mister Fantastic, Invisible Woman');
        });

        it('should return the user to invite when the search value is a valid, non-existent email', () => {
            const searchText = 'test@email.com';

            const options = getSearchOptions(OPTIONS);
            const filteredOptions = filterAndOrderOptions(options, searchText);

            expect(filteredOptions.userToInvite?.login).toBe(searchText);
        });

        it('should not return any results if the search value is on an exluded logins list', () => {
            const searchText = 'admin@expensify.com';

            const options = getValidOptions({reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails}, {excludeLogins: CONST.EXPENSIFY_EMAILS_OBJECT});
            const filterOptions = filterAndOrderOptions(options, searchText, {excludeLogins: CONST.EXPENSIFY_EMAILS_OBJECT});
            expect(filterOptions.recentReports.length).toBe(0);
        });

        it('should return the user to invite when the search value is a valid, non-existent email and the user is not excluded', () => {
            const searchText = 'test@email.com';

            const options = getSearchOptions(OPTIONS);
            const filteredOptions = filterAndOrderOptions(options, searchText, {excludeLogins: CONST.EXPENSIFY_EMAILS_OBJECT});

            expect(filteredOptions.userToInvite?.login).toBe(searchText);
        });

        it('should return limited amount of recent reports if the limit is set', () => {
            const searchText = '';

            const options = getSearchOptions(OPTIONS);
            const filteredOptions = filterAndOrderOptions(options, searchText, {maxRecentReportsToShow: 2});

            // Note: in the past maxRecentReportsToShow: 0 would return all recent reports, this has changed, and is expected to return none now
            const limitToZeroOptions = filterAndOrderOptions(options, searchText, {maxRecentReportsToShow: 0});

            expect(filteredOptions.recentReports.length).toBe(2);
            expect(limitToZeroOptions.recentReports.length).toBe(0);
        });

        it('should not return any user to invite if email exists on the personal details list', () => {
            const searchText = 'natasharomanoff@expensify.com';
            const options = getSearchOptions(OPTIONS, [CONST.BETAS.ALL]);

            const filteredOptions = filterAndOrderOptions(options, searchText);
            expect(filteredOptions.personalDetails.length).toBe(1);
            expect(filteredOptions.userToInvite).toBe(null);
        });

        it('should not return any options if search value does not match any personal details (getMemberInviteOptions)', () => {
            const options = getMemberInviteOptions(OPTIONS.personalDetails, []);
            const filteredOptions = filterAndOrderOptions(options, 'magneto');
            expect(filteredOptions.personalDetails.length).toBe(0);
        });

        it('should return one personal detail if search value matches an email (getMemberInviteOptions)', () => {
            const options = getMemberInviteOptions(OPTIONS.personalDetails, []);
            const filteredOptions = filterAndOrderOptions(options, 'peterparker@expensify.com');

            expect(filteredOptions.personalDetails.length).toBe(1);
            expect(filteredOptions.personalDetails.at(0)?.text).toBe('Spider-Man');
        });

        it('should not show any recent reports if a search value does not match the group chat name (getShareDestinationsOptions)', () => {
            // Filter current REPORTS as we do in the component, before getting share destination options
            const filteredReports = Object.values(OPTIONS.reports).reduce<OptionList['reports']>((filtered, option) => {
                const report = option.item;
                if (canUserPerformWriteAction(report) && canCreateTaskInReport(report) && !isCanceledTaskReport(report)) {
                    filtered.push(option);
                }
                return filtered;
            }, []);
            const options = getShareDestinationOptions(filteredReports, OPTIONS.personalDetails, []);
            const filteredOptions = filterAndOrderOptions(options, 'mutants');

            expect(filteredOptions.recentReports.length).toBe(0);
        });

        it('should return a workspace room when we search for a workspace room(getShareDestinationsOptions)', () => {
            const filteredReportsWithWorkspaceRooms = Object.values(OPTIONS_WITH_WORKSPACE_ROOM.reports).reduce<OptionList['reports']>((filtered, option) => {
                const report = option.item;
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                if (canUserPerformWriteAction(report) || isExpensifyOnlyParticipantInReport(report)) {
                    filtered.push(option);
                }
                return filtered;
            }, []);

            const options = getShareDestinationOptions(filteredReportsWithWorkspaceRooms, OPTIONS.personalDetails, []);
            const filteredOptions = filterAndOrderOptions(options, 'Avengers Room');

            expect(filteredOptions.recentReports.length).toBe(1);
        });

        it('should not show any results if searching for a non-existing workspace room(getShareDestinationOptions)', () => {
            const filteredReportsWithWorkspaceRooms = Object.values(OPTIONS_WITH_WORKSPACE_ROOM.reports).reduce<OptionList['reports']>((filtered, option) => {
                const report = option.item;
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                if (canUserPerformWriteAction(report) || isExpensifyOnlyParticipantInReport(report)) {
                    filtered.push(option);
                }
                return filtered;
            }, []);

            const options = getShareDestinationOptions(filteredReportsWithWorkspaceRooms, OPTIONS.personalDetails, []);
            const filteredOptions = filterAndOrderOptions(options, 'Mutants Lair');

            expect(filteredOptions.recentReports.length).toBe(0);
        });

        it('should show the option from personal details when searching for personal detail with no existing report', () => {
            const options = getValidOptions({reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails});
            const filteredOptions = filterAndOrderOptions(options, 'hulk');

            expect(filteredOptions.recentReports.length).toBe(0);

            expect(filteredOptions.personalDetails.length).toBe(1);
            expect(filteredOptions.personalDetails.at(0)?.login).toBe('brucebanner@expensify.com');
        });

        it('should not return any options or user to invite if there are no search results and the string does not match a potential email or phone', () => {
            const options = getValidOptions({reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails});
            const filteredOptions = filterAndOrderOptions(options, 'marc@expensify');

            expect(filteredOptions.recentReports.length).toBe(0);
            expect(filteredOptions.personalDetails.length).toBe(0);
            expect(filteredOptions.userToInvite).toBe(null);
        });

        it('should not return any options but should return an user to invite if no matching options exist and the search value is a potential email', () => {
            const options = getValidOptions({reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails});
            const filteredOptions = filterAndOrderOptions(options, 'marc@expensify.com');

            expect(filteredOptions.recentReports.length).toBe(0);
            expect(filteredOptions.personalDetails.length).toBe(0);
            expect(filteredOptions.userToInvite).not.toBe(null);
        });

        it('should return user to invite when search term has a period with options for it that do not contain the period', () => {
            const options = getValidOptions({reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails});
            const filteredOptions = filterAndOrderOptions(options, 'peter.parker@expensify.com');

            expect(filteredOptions.recentReports.length).toBe(0);
            expect(filteredOptions.userToInvite).not.toBe(null);
        });

        it('should not return options but should return an user to invite if no matching options exist and the search value is a potential phone number', () => {
            const options = getValidOptions({reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails});
            const filteredOptions = filterAndOrderOptions(options, '5005550006');

            expect(filteredOptions.recentReports.length).toBe(0);
            expect(filteredOptions.personalDetails.length).toBe(0);
            expect(filteredOptions.userToInvite).not.toBe(null);
            expect(filteredOptions.userToInvite?.login).toBe('+15005550006');
        });

        it('should not return options but should return an user to invite if no matching options exist and the search value is a potential phone number with country code added', () => {
            const options = getValidOptions({reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails});
            const filteredOptions = filterAndOrderOptions(options, '+15005550006');

            expect(filteredOptions.recentReports.length).toBe(0);
            expect(filteredOptions.personalDetails.length).toBe(0);
            expect(filteredOptions.userToInvite).not.toBe(null);
            expect(filteredOptions.userToInvite?.login).toBe('+15005550006');
        });

        it('should not return options but should return an user to invite if no matching options exist and the search value is a potential phone number with special characters added', () => {
            const options = getValidOptions({reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails});
            const filteredOptions = filterAndOrderOptions(options, '+1 (800)324-3233');

            expect(filteredOptions.recentReports.length).toBe(0);
            expect(filteredOptions.personalDetails.length).toBe(0);
            expect(filteredOptions.userToInvite).not.toBe(null);
            expect(filteredOptions.userToInvite?.login).toBe('+18003243233');
        });

        it('should not return any options or user to invite if contact number contains alphabet characters', () => {
            const options = getValidOptions({reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails});
            const filteredOptions = filterAndOrderOptions(options, '998243aaaa');

            expect(filteredOptions.recentReports.length).toBe(0);
            expect(filteredOptions.personalDetails.length).toBe(0);
            expect(filteredOptions.userToInvite).toBe(null);
        });

        it('should not return any options if search value does not match any personal details', () => {
            const options = getValidOptions({reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails});
            const filteredOptions = filterAndOrderOptions(options, 'magneto');

            expect(filteredOptions.personalDetails.length).toBe(0);
        });

        it('should return one recent report and no personal details if a search value provides an email', () => {
            const options = getValidOptions({reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails});
            const filteredOptions = filterAndOrderOptions(options, 'peterparker@expensify.com', {sortByReportTypeInSearch: true});
            expect(filteredOptions.recentReports.length).toBe(1);
            expect(filteredOptions.recentReports.at(0)?.text).toBe('Spider-Man');
            expect(filteredOptions.personalDetails.length).toBe(0);
        });

        it('should return all matching reports and personal details', () => {
            const options = getValidOptions({reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails});
            const filteredOptions = filterAndOrderOptions(options, '.com', {maxRecentReportsToShow: 5});

            expect(filteredOptions.personalDetails.length).toBe(4);
            expect(filteredOptions.personalDetails.at(0)?.login).toBe('natasharomanoff@expensify.com');
            expect(filteredOptions.recentReports.length).toBe(5);
            expect(filteredOptions.recentReports.at(0)?.text).toBe('Captain America');
            expect(filteredOptions.recentReports.at(1)?.text).toBe('Mr Sinister');
            expect(filteredOptions.recentReports.at(2)?.text).toBe('Black Panther');
        });

        it('should return matching option when searching (getSearchOptions)', () => {
            const options = getSearchOptions(OPTIONS);
            const filteredOptions = filterAndOrderOptions(options, 'spider');

            expect(filteredOptions.recentReports.length).toBe(1);
            expect(filteredOptions.recentReports.at(0)?.text).toBe('Spider-Man');
        });

        it('should return latest lastVisibleActionCreated item on top when search value matches multiple items (getSearchOptions)', () => {
            const options = getSearchOptions(OPTIONS);
            const filteredOptions = filterAndOrderOptions(options, 'fantastic');

            expect(filteredOptions.recentReports.length).toBe(3);
            expect(filteredOptions.recentReports.at(0)?.text).toBe('Mister Fantastic');
            expect(filteredOptions.recentReports.at(1)?.text).toBe('Mister Fantastic, Invisible Woman');

            return waitForBatchedUpdates()
                .then(() => Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, PERSONAL_DETAILS_WITH_PERIODS))
                .then(() => {
                    const OPTIONS_WITH_PERIODS = createOptionList(PERSONAL_DETAILS_WITH_PERIODS, REPORTS);
                    const results = getSearchOptions(OPTIONS_WITH_PERIODS);
                    const filteredResults = filterAndOrderOptions(results, 'barry.allen@expensify.com', {sortByReportTypeInSearch: true});

                    expect(filteredResults.recentReports.length).toBe(1);
                    expect(filteredResults.recentReports.at(0)?.text).toBe('The Flash');
                });
        });

        it('should filter out duplicated entries by login', () => {
            const login = 'brucebanner@expensify.com';

            // Duplicate personalDetails entries and reassign to OPTIONS
            OPTIONS.personalDetails = OPTIONS.personalDetails.flatMap((obj) => [obj, {...obj}]);

            const options = getSearchOptions(OPTIONS, [CONST.BETAS.ALL]);
            const filteredOptions = filterAndOrderOptions(options, '');
            const matchingEntries = filteredOptions.personalDetails.filter((detail) => detail.login === login);

            // There should be 2 unique login entries
            expect(filteredOptions.personalDetails.length).toBe(2);
            expect(matchingEntries.length).toBe(1);
        });

        it('should order self dm always on top if the search matches with the self dm login', () => {
            const searchTerm = 'tonystark@expensify.com';

            const OPTIONS_WITH_SELFDM = createOptionList(PERSONAL_DETAILS, REPORTS_WITH_SELFDM);

            // When search term matches with self dm login
            const options = getSearchOptions(OPTIONS_WITH_SELFDM, [CONST.BETAS.ALL]);
            const filteredOptions = filterAndOrderOptions(options, searchTerm);

            // Then the self dm should be on top.
            expect(filteredOptions.recentReports.at(0)?.isSelfDM).toBe(true);
        });
    });

    describe('canCreateOptimisticPersonalDetailOption', () => {
        const VALID_EMAIL = 'valid@email.com';
        it('should allow to create optimistic personal detail option if email is valid', () => {
            const currentUserEmail = 'tonystark@expensify.com';
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
            const currentUserEmail = 'tonystark@expensify.com';
            const canCreate = canCreateOptimisticPersonalDetailOption({
                searchValue: currentUserEmail,
                recentReportOptions: [],
                personalDetailsOptions: [],
                currentUserOption: {
                    login: currentUserEmail,
                } as OptionData,
            });

            expect(canCreate).toBe(false);
        });

        it('createOptionList() localization', () => {
            const reports = createOptionList(PERSONAL_DETAILS, REPORTS).reports;
            expect(reports.at(10)?.subtitle).toBe(`Submits to Mister Fantastic`);
            return waitForBatchedUpdates()
                .then(() => Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.ES))
                .then(() => {
                    const newReports = createOptionList(PERSONAL_DETAILS, REPORTS).reports;
                    expect(newReports.at(10)?.subtitle).toBe('Se envía a Mister Fantastic');
                });
        });
    });

    describe('filterWorkspaceChats', () => {
        it('should return an empty array if there are no workspace chats', () => {
            const result = filterWorkspaceChats([], []);

            expect(result.length).toEqual(0);
        });

        it('should return all workspace chats if there are no search terms', () => {
            const result = filterWorkspaceChats(WORKSPACE_CHATS, []);

            expect(result).toEqual(WORKSPACE_CHATS);
            expect(result.length).toEqual(WORKSPACE_CHATS.length);
        });

        it('should filter multiple workspace chats by search term', () => {
            const result = filterWorkspaceChats(WORKSPACE_CHATS, ['Google']);

            expect(result.length).toEqual(2);
        });

        it('should filter workspace chat by exact name', () => {
            const result = filterWorkspaceChats(WORKSPACE_CHATS, ['Microsoft', 'Teams', 'Workspace']);

            expect(result.length).toEqual(1);
        });

        it('should return an empty array if there are no matching workspace chats', () => {
            const result = filterWorkspaceChats(WORKSPACE_CHATS, ['XYZ']);

            expect(result.length).toEqual(0);
        });
    });

    describe('orderWorkspaceOptions', () => {
        it('should put the default workspace on top of the list', () => {
            const result = orderWorkspaceOptions(WORKSPACE_CHATS);

            expect(result.at(0)?.text).toEqual('Notion Workspace for Marketing');
        });
    });

    describe('filterSelfDMChat', () => {
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
            const result = filterSelfDMChat(REPORT, []);

            expect(result?.reportID).toEqual(REPORT.reportID);
        });

        it('should return undefined, when the search term does not match the report', () => {
            const result = filterSelfDMChat(REPORT, ['XYZ']);

            expect(result).toBeUndefined();
        });

        it('should filter report by text', () => {
            const result = filterSelfDMChat(REPORT, ['Google']);

            expect(result?.reportID).toEqual(REPORT.reportID);
        });

        it('should filter report by exact text', () => {
            const result = filterSelfDMChat(REPORT, ['Google', 'Workspace']);

            expect(result?.reportID).toEqual(REPORT.reportID);
        });

        it('should filter report by login', () => {
            const result = filterSelfDMChat({...REPORT, login: LOGIN}, ['john']);

            expect(result?.reportID).toEqual(REPORT.reportID);
        });

        it('should filter report by exact login', () => {
            const result = filterSelfDMChat({...REPORT, login: LOGIN}, [LOGIN]);

            expect(result?.reportID).toEqual(REPORT.reportID);
        });

        it('should filter report by alternate text', () => {
            const result = filterSelfDMChat({...REPORT, alternateText: ALTERNATE_TEXT, isThread: true}, ['William']);

            expect(result?.reportID).toEqual(REPORT.reportID);
        });

        it('should filter report by exact alternate text', () => {
            const result = filterSelfDMChat({...REPORT, alternateText: ALTERNATE_TEXT, isThread: true}, ['John', 'William', 'Doe']);

            expect(result?.reportID).toEqual(REPORT.reportID);
        });

        it('should filter report by alternate text if it is not a thread', () => {
            const result = filterSelfDMChat({...REPORT, alternateText: ALTERNATE_TEXT, isThread: false}, ['William']);

            expect(result?.reportID).toBeUndefined();
        });

        it('should filter report by subtitle', () => {
            const result = filterSelfDMChat({...REPORT, subtitle: SUBTITLE}, ['Software']);

            expect(result?.reportID).toEqual(REPORT.reportID);
        });

        it('should filter report by exact subtitle', () => {
            const result = filterSelfDMChat({...REPORT, subtitle: SUBTITLE}, ['Software', 'Engineer']);

            expect(result?.reportID).toEqual(REPORT.reportID);
        });

        it('should not filter report by subtitle if it is not an expense chat nor a chat room', () => {
            const result = filterSelfDMChat({...REPORT, subtitle: SUBTITLE, isPolicyExpenseChat: false, isChatRoom: false}, ['Software']);

            expect(result).toBeUndefined();
        });

        it('should filter report by subtitle if it is a chat room', () => {
            const result = filterSelfDMChat({...REPORT, subtitle: SUBTITLE, isPolicyExpenseChat: false, isChatRoom: true}, ['Software']);

            expect(result?.reportID).toEqual(REPORT.reportID);
        });
    });

    describe('filterReports', () => {
        it('should match a user with an accented name when searching using non-accented characters', () => {
            const reports = [{text: "Álex Timón D'artagnan Zo-e"} as OptionData];
            const searchTerms = ['Alex Timon Dartagnan Zoe'];
            const filteredReports = filterReports(reports, searchTerms);

            expect(filteredReports).toEqual(reports);
        });
    });
});
