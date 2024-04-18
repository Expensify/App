/* eslint-disable @typescript-eslint/naming-convention */
import type {OnyxCollection} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {SelectedTagOption} from '@components/TagPicker';
import CONST from '@src/CONST';
import * as OptionsListUtils from '@src/libs/OptionsListUtils';
import * as ReportUtils from '@src/libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetails, Policy, PolicyCategories, Report, TaxRatesWithDefault} from '@src/types/onyx';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

type PersonalDetailsList = Record<string, PersonalDetails & ReportUtils.OptionData>;

describe('OptionsListUtils', () => {
    // Given a set of reports with both single participants and multiple participants some pinned and some not
    const REPORTS: OnyxCollection<Report> = {
        '1': {
            lastReadTime: '2021-01-14 11:25:39.295',
            lastVisibleActionCreated: '2022-11-22 03:26:02.015',
            isPinned: false,
            reportID: '1',
            participantAccountIDs: [2, 1],
            visibleChatMemberAccountIDs: [2, 1],
            reportName: 'Iron Man, Mister Fantastic',
            type: CONST.REPORT.TYPE.CHAT,
        },
        '2': {
            lastReadTime: '2021-01-14 11:25:39.296',
            lastVisibleActionCreated: '2022-11-22 03:26:02.016',
            isPinned: false,
            reportID: '2',
            participantAccountIDs: [3],
            visibleChatMemberAccountIDs: [3],
            reportName: 'Spider-Man',
            type: CONST.REPORT.TYPE.CHAT,
        },

        // This is the only report we are pinning in this test
        '3': {
            lastReadTime: '2021-01-14 11:25:39.297',
            lastVisibleActionCreated: '2022-11-22 03:26:02.170',
            isPinned: true,
            reportID: '3',
            participantAccountIDs: [1],
            visibleChatMemberAccountIDs: [1],
            reportName: 'Mister Fantastic',
            type: CONST.REPORT.TYPE.CHAT,
        },
        '4': {
            lastReadTime: '2021-01-14 11:25:39.298',
            lastVisibleActionCreated: '2022-11-22 03:26:02.180',
            isPinned: false,
            reportID: '4',
            participantAccountIDs: [4],
            visibleChatMemberAccountIDs: [4],
            reportName: 'Black Panther',
            type: CONST.REPORT.TYPE.CHAT,
        },
        '5': {
            lastReadTime: '2021-01-14 11:25:39.299',
            lastVisibleActionCreated: '2022-11-22 03:26:02.019',
            isPinned: false,
            reportID: '5',
            participantAccountIDs: [5],
            visibleChatMemberAccountIDs: [5],
            reportName: 'Invisible Woman',
            type: CONST.REPORT.TYPE.CHAT,
        },
        '6': {
            lastReadTime: '2021-01-14 11:25:39.300',
            lastVisibleActionCreated: '2022-11-22 03:26:02.020',
            isPinned: false,
            reportID: '6',
            participantAccountIDs: [6],
            visibleChatMemberAccountIDs: [6],
            reportName: 'Thor',
            type: CONST.REPORT.TYPE.CHAT,
        },

        // Note: This report has the largest lastVisibleActionCreated
        '7': {
            lastReadTime: '2021-01-14 11:25:39.301',
            lastVisibleActionCreated: '2022-11-22 03:26:03.999',
            isPinned: false,
            reportID: '7',
            participantAccountIDs: [7],
            visibleChatMemberAccountIDs: [7],
            reportName: 'Captain America',
            type: CONST.REPORT.TYPE.CHAT,
        },

        // Note: This report has no lastVisibleActionCreated
        '8': {
            lastReadTime: '2021-01-14 11:25:39.301',
            lastVisibleActionCreated: '2022-11-22 03:26:02.000',
            isPinned: false,
            reportID: '8',
            participantAccountIDs: [12],
            visibleChatMemberAccountIDs: [12],
            reportName: 'Silver Surfer',
            type: CONST.REPORT.TYPE.CHAT,
        },

        // Note: This report has an IOU
        '9': {
            lastReadTime: '2021-01-14 11:25:39.302',
            lastVisibleActionCreated: '2022-11-22 03:26:02.998',
            isPinned: false,
            reportID: '9',
            participantAccountIDs: [8],
            visibleChatMemberAccountIDs: [8],
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
            participantAccountIDs: [2, 7],
            visibleChatMemberAccountIDs: [2, 7],
            reportName: '',
            oldPolicyName: "SHIELD's workspace",
            chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
            isOwnPolicyExpenseChat: true,
            type: CONST.REPORT.TYPE.CHAT,

            // This indicates that the report is archived
            stateNum: 2,
            statusNum: 2,
        },
    };

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
            participantAccountIDs: [999],
            visibleChatMemberAccountIDs: [999],
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
            participantAccountIDs: [1000],
            visibleChatMemberAccountIDs: [1000],
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
            participantAccountIDs: [1001],
            visibleChatMemberAccountIDs: [1001],
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
            participantAccountIDs: [1, 10, 3],
            visibleChatMemberAccountIDs: [1, 10, 3],
            reportName: '',
            oldPolicyName: 'Avengers Room',
            chatType: CONST.REPORT.CHAT_TYPE.POLICY_ADMINS,
            isOwnPolicyExpenseChat: true,
            type: CONST.REPORT.TYPE.CHAT,
        },
    };

    const REPORTS_WITH_CHAT_ROOM = {
        ...REPORTS,
        15: {
            lastReadTime: '2021-01-14 11:25:39.301',
            lastVisibleActionCreated: '2022-11-22 03:26:02.000',
            isPinned: false,
            reportID: '15',
            participantAccountIDs: [3, 4],
            visibleChatMemberAccountIDs: [3, 4],
            reportName: 'Spider-Man, Black Panther',
            type: CONST.REPORT.TYPE.CHAT,
            chatType: CONST.REPORT.CHAT_TYPE.DOMAIN_ALL,
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

    const policyID = 'ABC123';

    const POLICY: Policy = {
        id: policyID,
        name: 'Hero Policy',
        role: 'user',
        type: 'free',
        owner: '',
        outputCurrency: '',
        isPolicyExpenseChatEnabled: false,
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
            },
        });
        Onyx.registerLogger(() => {});
        return waitForBatchedUpdates().then(() => Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, PERSONAL_DETAILS));
    });

    let OPTIONS: OptionsListUtils.OptionList;
    let OPTIONS_WITH_CONCIERGE: OptionsListUtils.OptionList;
    let OPTIONS_WITH_CHRONOS: OptionsListUtils.OptionList;
    let OPTIONS_WITH_RECEIPTS: OptionsListUtils.OptionList;
    let OPTIONS_WITH_WORKSPACES: OptionsListUtils.OptionList;

    beforeEach(() => {
        OPTIONS = OptionsListUtils.createOptionList(PERSONAL_DETAILS, REPORTS);
        OPTIONS_WITH_CONCIERGE = OptionsListUtils.createOptionList(PERSONAL_DETAILS_WITH_CONCIERGE, REPORTS_WITH_CONCIERGE);
        OPTIONS_WITH_CHRONOS = OptionsListUtils.createOptionList(PERSONAL_DETAILS_WITH_CHRONOS, REPORTS_WITH_CHRONOS);
        OPTIONS_WITH_RECEIPTS = OptionsListUtils.createOptionList(PERSONAL_DETAILS_WITH_RECEIPTS, REPORTS_WITH_RECEIPTS);
        OPTIONS_WITH_WORKSPACES = OptionsListUtils.createOptionList(PERSONAL_DETAILS, REPORTS_WITH_WORKSPACE_ROOMS);
    });

    it('getSearchOptions()', () => {
        // When we filter in the Search view without providing a searchValue
        let results = OptionsListUtils.getSearchOptions(OPTIONS, '', [CONST.BETAS.ALL]);
        // Then the 2 personalDetails that don't have reports should be returned
        expect(results.personalDetails.length).toBe(2);

        // Then all of the reports should be shown including the archived rooms.
        expect(results.recentReports.length).toBe(Object.values(OPTIONS.reports).length);

        // When we filter again but provide a searchValue
        results = OptionsListUtils.getSearchOptions(OPTIONS, 'spider');

        // Then only one option should be returned and it's the one matching the search value
        expect(results.recentReports.length).toBe(1);
        expect(results.recentReports[0].login).toBe('peterparker@expensify.com');

        // When we filter again but provide a searchValue that should match multiple times
        results = OptionsListUtils.getSearchOptions(OPTIONS, 'fantastic');

        // Value with latest lastVisibleActionCreated should be at the top.
        expect(results.recentReports.length).toBe(2);
        expect(results.recentReports[0].text).toBe('Mister Fantastic');
        expect(results.recentReports[1].text).toBe('Mister Fantastic');

        return waitForBatchedUpdates()
            .then(() => Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, PERSONAL_DETAILS_WITH_PERIODS))
            .then(() => {
                const OPTIONS_WITH_PERIODS = OptionsListUtils.createOptionList(PERSONAL_DETAILS_WITH_PERIODS, REPORTS);
                // When we filter again but provide a searchValue that should match with periods
                results = OptionsListUtils.getSearchOptions(OPTIONS_WITH_PERIODS, 'barry.allen@expensify.com');
                // Then we expect to have the personal detail with period filtered
                expect(results.recentReports.length).toBe(1);
                expect(results.recentReports[0].text).toBe('The Flash');
            });
    });

    it('getFilteredOptions()', () => {
        // maxRecentReportsToShow in src/libs/OptionsListUtils.js
        const MAX_RECENT_REPORTS = 5;

        // When we call getFilteredOptions() with no search value
        let results = OptionsListUtils.getFilteredOptions(OPTIONS.reports, OPTIONS.personalDetails, [], '');

        // We should expect maximimum of 5 recent reports to be returned
        expect(results.recentReports.length).toBe(MAX_RECENT_REPORTS);

        // We should expect all personalDetails to be returned,
        // minus the currently logged in user and recent reports count
        expect(results.personalDetails.length).toBe(Object.values(OPTIONS.personalDetails).length - 1 - MAX_RECENT_REPORTS);

        // We should expect personal details sorted alphabetically
        expect(results.personalDetails[0].text).toBe('Black Widow');
        expect(results.personalDetails[1].text).toBe('Invisible Woman');
        expect(results.personalDetails[2].text).toBe('Spider-Man');
        expect(results.personalDetails[3].text).toBe('The Incredible Hulk');

        // Then the result which has an existing report should also have the reportID attached
        const personalDetailWithExistingReport = results.personalDetails.find((personalDetail) => personalDetail.login === 'peterparker@expensify.com');
        expect(personalDetailWithExistingReport?.reportID).toBe('2');

        // When we only pass personal details
        results = OptionsListUtils.getFilteredOptions([], OPTIONS.personalDetails, [], '');

        // We should expect personal details sorted alphabetically
        expect(results.personalDetails[0].text).toBe('Black Panther');
        expect(results.personalDetails[1].text).toBe('Black Widow');
        expect(results.personalDetails[2].text).toBe('Captain America');
        expect(results.personalDetails[3].text).toBe('Invisible Woman');

        // When we provide a search value that does not match any personal details
        results = OptionsListUtils.getFilteredOptions(OPTIONS.reports, OPTIONS.personalDetails, [], 'magneto');

        // Then no options will be returned
        expect(results.personalDetails.length).toBe(0);

        // When we provide a search value that matches an email
        results = OptionsListUtils.getFilteredOptions(OPTIONS.reports, OPTIONS.personalDetails, [], 'peterparker@expensify.com');

        // Then one recentReports will be returned and it will be the correct option
        // personalDetails should be empty array
        expect(results.recentReports.length).toBe(1);
        expect(results.recentReports[0].text).toBe('Spider-Man');
        expect(results.personalDetails.length).toBe(0);

        // When we provide a search value that matches a partial display name or email
        results = OptionsListUtils.getFilteredOptions(OPTIONS.reports, OPTIONS.personalDetails, [], '.com');

        // Then several options will be returned and they will be each have the search string in their email or name
        // even though the currently logged in user matches they should not show.
        // Should be ordered by lastVisibleActionCreated values.
        expect(results.personalDetails.length).toBe(4);
        expect(results.recentReports.length).toBe(5);
        expect(results.personalDetails[0].login).toBe('natasharomanoff@expensify.com');
        expect(results.recentReports[0].text).toBe('Captain America');
        expect(results.recentReports[1].text).toBe('Mr Sinister');
        expect(results.recentReports[2].text).toBe('Black Panther');

        // Test for Concierge's existence in chat options

        results = OptionsListUtils.getFilteredOptions(OPTIONS_WITH_CONCIERGE.reports, OPTIONS_WITH_CONCIERGE.personalDetails);

        // Concierge is included in the results by default. We should expect all the personalDetails to show
        // (minus the 5 that are already showing and the currently logged in user)
        expect(results.personalDetails.length).toBe(Object.values(OPTIONS_WITH_CONCIERGE.personalDetails).length - 1 - MAX_RECENT_REPORTS);
        expect(results.recentReports).toEqual(expect.arrayContaining([expect.objectContaining({login: 'concierge@expensify.com'})]));

        // Test by excluding Concierge from the results
        results = OptionsListUtils.getFilteredOptions(OPTIONS_WITH_CONCIERGE.reports, OPTIONS_WITH_CONCIERGE.personalDetails, [], '', [], [CONST.EMAIL.CONCIERGE]);

        // All the personalDetails should be returned minus the currently logged in user and Concierge
        expect(results.personalDetails.length).toBe(Object.values(OPTIONS_WITH_CONCIERGE.personalDetails).length - 2 - MAX_RECENT_REPORTS);
        expect(results.personalDetails).not.toEqual(expect.arrayContaining([expect.objectContaining({login: 'concierge@expensify.com'})]));

        // Test by excluding Chronos from the results
        results = OptionsListUtils.getFilteredOptions(OPTIONS_WITH_CHRONOS.reports, OPTIONS_WITH_CHRONOS.personalDetails, [], '', [], [CONST.EMAIL.CHRONOS]);

        // All the personalDetails should be returned minus the currently logged in user and Concierge
        expect(results.personalDetails.length).toBe(Object.values(OPTIONS_WITH_CHRONOS.personalDetails).length - 2 - MAX_RECENT_REPORTS);
        expect(results.personalDetails).not.toEqual(expect.arrayContaining([expect.objectContaining({login: 'chronos@expensify.com'})]));

        // Test by excluding Receipts from the results
        results = OptionsListUtils.getFilteredOptions(OPTIONS_WITH_RECEIPTS.reports, OPTIONS_WITH_RECEIPTS.personalDetails, [], '', [], [CONST.EMAIL.RECEIPTS]);

        // All the personalDetails should be returned minus the currently logged in user and Concierge
        expect(results.personalDetails.length).toBe(Object.values(OPTIONS_WITH_RECEIPTS.personalDetails).length - 2 - MAX_RECENT_REPORTS);
        expect(results.personalDetails).not.toEqual(expect.arrayContaining([expect.objectContaining({login: 'receipts@expensify.com'})]));
    });

    it('getFilteredOptions() for group Chat', () => {
        // When we call getFilteredOptions() with no search value
        let results = OptionsListUtils.getFilteredOptions(OPTIONS.reports, OPTIONS.personalDetails, [], '');

        // Then we should expect only a maxmimum of 5 recent reports to be returned
        expect(results.recentReports.length).toBe(5);

        // And we should expect all the personalDetails to show (minus the 5 that are already
        // showing and the currently logged in user)
        expect(results.personalDetails.length).toBe(Object.values(OPTIONS.personalDetails).length - 6);

        // We should expect personal details sorted alphabetically
        expect(results.personalDetails[0].text).toBe('Black Widow');
        expect(results.personalDetails[1].text).toBe('Invisible Woman');
        expect(results.personalDetails[2].text).toBe('Spider-Man');
        expect(results.personalDetails[3].text).toBe('The Incredible Hulk');

        // And none of our personalDetails should include any of the users with recent reports
        const reportLogins = results.recentReports.map((reportOption) => reportOption.login);
        const personalDetailsOverlapWithReports = results.personalDetails.every((personalDetailOption) => reportLogins.includes(personalDetailOption.login));
        expect(personalDetailsOverlapWithReports).toBe(false);

        // When we search for an option that is only in a personalDetail with no existing report
        results = OptionsListUtils.getFilteredOptions(OPTIONS.reports, OPTIONS.personalDetails, [], 'hulk');

        // Then reports should return no results
        expect(results.recentReports.length).toBe(0);

        // And personalDetails should show just one option and it will be the one we expect
        expect(results.personalDetails.length).toBe(1);
        expect(results.personalDetails[0].login).toBe('brucebanner@expensify.com');

        // When we search for an option that matches things in both personalDetails and reports
        results = OptionsListUtils.getFilteredOptions(OPTIONS.reports, OPTIONS.personalDetails, [], '.com');

        // Then all single participant reports that match will show up in the recentReports array, Recently used contact should be at the top
        expect(results.recentReports.length).toBe(5);
        expect(results.recentReports[0].text).toBe('Captain America');

        // And logins with no single participant reports will show up in personalDetails
        expect(results.personalDetails.length).toBe(4);
        expect(results.personalDetails[0].login).toBe('natasharomanoff@expensify.com');

        // When we provide no selected options to getFilteredOptions()
        results = OptionsListUtils.getFilteredOptions(OPTIONS.reports, OPTIONS.personalDetails, [], '', []);

        // Then one of our older report options (not in our five most recent) should appear in the personalDetails
        // but not in recentReports
        expect(results.recentReports.every((option) => option.login !== 'peterparker@expensify.com')).toBe(true);
        expect(results.personalDetails.every((option) => option.login !== 'peterparker@expensify.com')).toBe(false);

        // When we provide a "selected" option to getFilteredOptions()
        results = OptionsListUtils.getFilteredOptions(OPTIONS.reports, OPTIONS.personalDetails, [], '', [{login: 'peterparker@expensify.com'}]);

        // Then the option should not appear anywhere in either list
        expect(results.recentReports.every((option) => option.login !== 'peterparker@expensify.com')).toBe(true);
        expect(results.personalDetails.every((option) => option.login !== 'peterparker@expensify.com')).toBe(true);

        // When we add a search term for which no options exist and the searchValue itself
        // is not a potential email or phone
        results = OptionsListUtils.getFilteredOptions(OPTIONS.reports, OPTIONS.personalDetails, [], 'marc@expensify');

        // Then we should have no options or personal details at all and also that there is no userToInvite
        expect(results.recentReports.length).toBe(0);
        expect(results.personalDetails.length).toBe(0);
        expect(results.userToInvite).toBe(null);

        // When we add a search term for which no options exist and the searchValue itself
        // is a potential email
        results = OptionsListUtils.getFilteredOptions(OPTIONS.reports, OPTIONS.personalDetails, [], 'marc@expensify.com');

        // Then we should have no options or personal details at all but there should be a userToInvite
        expect(results.recentReports.length).toBe(0);
        expect(results.personalDetails.length).toBe(0);
        expect(results.userToInvite).not.toBe(null);

        // When we add a search term with a period, with options for it that don't contain the period
        results = OptionsListUtils.getFilteredOptions(OPTIONS.reports, OPTIONS.personalDetails, [], 'peter.parker@expensify.com');

        // Then we should have no options at all but there should be a userToInvite
        expect(results.recentReports.length).toBe(0);
        expect(results.userToInvite).not.toBe(null);

        // When we add a search term for which no options exist and the searchValue itself
        // is a potential phone number without country code added
        results = OptionsListUtils.getFilteredOptions(OPTIONS.reports, OPTIONS.personalDetails, [], '5005550006');

        // Then we should have no options or personal details at all but there should be a userToInvite and the login
        // should have the country code included
        expect(results.recentReports.length).toBe(0);
        expect(results.personalDetails.length).toBe(0);
        expect(results.userToInvite).not.toBe(null);
        expect(results.userToInvite?.login).toBe('+15005550006');

        // When we add a search term for which no options exist and the searchValue itself
        // is a potential phone number with country code added
        results = OptionsListUtils.getFilteredOptions(OPTIONS.reports, OPTIONS.personalDetails, [], '+15005550006');

        // Then we should have no options or personal details at all but there should be a userToInvite and the login
        // should have the country code included
        expect(results.recentReports.length).toBe(0);
        expect(results.personalDetails.length).toBe(0);
        expect(results.userToInvite).not.toBe(null);
        expect(results.userToInvite?.login).toBe('+15005550006');

        // When we add a search term for which no options exist and the searchValue itself
        // is a potential phone number with special characters added
        results = OptionsListUtils.getFilteredOptions(OPTIONS.reports, OPTIONS.personalDetails, [], '+1 (800)324-3233');

        // Then we should have no options or personal details at all but there should be a userToInvite and the login
        // should have the country code included
        expect(results.recentReports.length).toBe(0);
        expect(results.personalDetails.length).toBe(0);
        expect(results.userToInvite).not.toBe(null);
        expect(results.userToInvite?.login).toBe('+18003243233');

        // When we use a search term for contact number that contains alphabet characters
        results = OptionsListUtils.getFilteredOptions(OPTIONS.reports, OPTIONS.personalDetails, [], '998243aaaa');

        // Then we shouldn't have any results or user to invite
        expect(results.recentReports.length).toBe(0);
        expect(results.personalDetails.length).toBe(0);
        expect(results.userToInvite).toBe(null);

        // Test Concierge's existence in new group options
        results = OptionsListUtils.getFilteredOptions(OPTIONS_WITH_CONCIERGE.reports, OPTIONS_WITH_CONCIERGE.personalDetails);

        // Concierge is included in the results by default. We should expect all the personalDetails to show
        // (minus the 5 that are already showing and the currently logged in user)
        expect(results.personalDetails.length).toBe(Object.values(OPTIONS_WITH_CONCIERGE.personalDetails).length - 6);
        expect(results.recentReports).toEqual(expect.arrayContaining([expect.objectContaining({login: 'concierge@expensify.com'})]));

        // Test by excluding Concierge from the results
        results = OptionsListUtils.getFilteredOptions(OPTIONS_WITH_CONCIERGE.reports, OPTIONS_WITH_CONCIERGE.personalDetails, [], '', [], [CONST.EMAIL.CONCIERGE]);

        // We should expect all the personalDetails to show (minus the 5 that are already showing,
        // the currently logged in user and Concierge)
        expect(results.personalDetails.length).toBe(Object.values(OPTIONS_WITH_CONCIERGE.personalDetails).length - 7);
        expect(results.personalDetails).not.toEqual(expect.arrayContaining([expect.objectContaining({login: 'concierge@expensify.com'})]));
        expect(results.recentReports).not.toEqual(expect.arrayContaining([expect.objectContaining({login: 'concierge@expensify.com'})]));

        // Test by excluding Chronos from the results
        results = OptionsListUtils.getFilteredOptions(OPTIONS_WITH_CHRONOS.reports, OPTIONS_WITH_CHRONOS.personalDetails, [], '', [], [CONST.EMAIL.CHRONOS]);

        // We should expect all the personalDetails to show (minus the 5 that are already showing,
        // the currently logged in user and Concierge)
        expect(results.personalDetails.length).toBe(Object.values(OPTIONS_WITH_CHRONOS.personalDetails).length - 7);
        expect(results.personalDetails).not.toEqual(expect.arrayContaining([expect.objectContaining({login: 'chronos@expensify.com'})]));
        expect(results.recentReports).not.toEqual(expect.arrayContaining([expect.objectContaining({login: 'chronos@expensify.com'})]));

        // Test by excluding Receipts from the results
        results = OptionsListUtils.getFilteredOptions(OPTIONS_WITH_RECEIPTS.reports, OPTIONS_WITH_RECEIPTS.personalDetails, [], '', [], [CONST.EMAIL.RECEIPTS]);

        // We should expect all the personalDetails to show (minus the 5 that are already showing,
        // the currently logged in user and Concierge)
        expect(results.personalDetails.length).toBe(Object.values(OPTIONS_WITH_RECEIPTS.personalDetails).length - 7);
        expect(results.personalDetails).not.toEqual(expect.arrayContaining([expect.objectContaining({login: 'receipts@expensify.com'})]));
        expect(results.recentReports).not.toEqual(expect.arrayContaining([expect.objectContaining({login: 'receipts@expensify.com'})]));
    });

    it('getShareDestinationsOptions()', () => {
        // Filter current REPORTS as we do in the component, before getting share destination options
        const filteredReports = Object.values(OPTIONS.reports).reduce<OptionsListUtils.OptionList['reports']>((filtered, option) => {
            const report = option.item;
            if (ReportUtils.canUserPerformWriteAction(report) && ReportUtils.canCreateTaskInReport(report) && !ReportUtils.isCanceledTaskReport(report)) {
                filtered.push(option);
            }
            return filtered;
        }, []);

        // When we pass an empty search value
        let results = OptionsListUtils.getShareDestinationOptions(filteredReports, OPTIONS.personalDetails, [], '');

        // Then we should expect all the recent reports to show but exclude the archived rooms
        expect(results.recentReports.length).toBe(Object.values(OPTIONS.reports).length - 1);

        // When we pass a search value that doesn't match the group chat name
        results = OptionsListUtils.getShareDestinationOptions(filteredReports, OPTIONS.personalDetails, [], 'mutants');

        // Then we should expect no recent reports to show
        expect(results.recentReports.length).toBe(0);

        // When we pass a search value that matches the group chat name
        results = OptionsListUtils.getShareDestinationOptions(filteredReports, OPTIONS.personalDetails, [], 'Iron Man, Fantastic');

        // Then we should expect the group chat to show along with the contacts matching the search
        expect(results.recentReports.length).toBe(1);

        // Filter current REPORTS_WITH_WORKSPACE_ROOMS as we do in the component, before getting share destination options
        const filteredReportsWithWorkspaceRooms = Object.values(OPTIONS_WITH_WORKSPACES.reports).reduce<OptionsListUtils.OptionList['reports']>((filtered, option) => {
            const report = option.item;
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            if (ReportUtils.canUserPerformWriteAction(report) || ReportUtils.isExpensifyOnlyParticipantInReport(report)) {
                filtered.push(option);
            }
            return filtered;
        }, []);

        // When we also have a policy to return rooms in the results
        results = OptionsListUtils.getShareDestinationOptions(filteredReportsWithWorkspaceRooms, OPTIONS.personalDetails, [], '');
        // Then we should expect the DMS, the group chats and the workspace room to show
        // We should expect all the recent reports to show, excluding the archived rooms
        expect(results.recentReports.length).toBe(Object.values(OPTIONS_WITH_WORKSPACES.reports).length - 1);

        // When we search for a workspace room
        results = OptionsListUtils.getShareDestinationOptions(filteredReportsWithWorkspaceRooms, OPTIONS.personalDetails, [], 'Avengers Room');

        // Then we should expect only the workspace room to show
        expect(results.recentReports.length).toBe(1);

        // When we search for a workspace room that doesn't exist
        results = OptionsListUtils.getShareDestinationOptions(filteredReportsWithWorkspaceRooms, OPTIONS.personalDetails, [], 'Mutants Lair');

        // Then we should expect no results to show
        expect(results.recentReports.length).toBe(0);
    });

    it('getMemberInviteOptions()', () => {
        // When we only pass personal details
        let results = OptionsListUtils.getMemberInviteOptions(OPTIONS.personalDetails, [], '');

        // We should expect personal details to be sorted alphabetically
        expect(results.personalDetails[0].text).toBe('Black Panther');
        expect(results.personalDetails[1].text).toBe('Black Widow');
        expect(results.personalDetails[2].text).toBe('Captain America');
        expect(results.personalDetails[3].text).toBe('Invisible Woman');

        // When we provide a search value that does not match any personal details
        results = OptionsListUtils.getMemberInviteOptions(OPTIONS.personalDetails, [], 'magneto');

        // Then no options will be returned
        expect(results.personalDetails.length).toBe(0);

        // When we provide a search value that matches an email
        results = OptionsListUtils.getMemberInviteOptions(OPTIONS.personalDetails, [], 'peterparker@expensify.com');

        // Then one personal should be in personalDetails list
        expect(results.personalDetails.length).toBe(1);
        expect(results.personalDetails[0].text).toBe('Spider-Man');
    });

    it('getFilteredOptions() for categories', () => {
        const search = 'Food';
        const emptySearch = '';
        const wrongSearch = 'bla bla';
        const recentlyUsedCategories = ['Taxi', 'Restaurant'];
        const selectedOptions: Array<Partial<ReportUtils.OptionData>> = [
            {
                name: 'Medical',
                enabled: true,
            },
        ];
        const smallCategoriesList: PolicyCategories = {
            Taxi: {
                enabled: false,
                name: 'Taxi',
                unencodedName: 'Taxi',
                areCommentsRequired: false,
                'GL Code': '',
                externalID: '',
                origin: '',
            },
            Restaurant: {
                enabled: true,
                name: 'Restaurant',
                unencodedName: 'Restaurant',
                areCommentsRequired: false,
                'GL Code': '',
                externalID: '',
                origin: '',
            },
            Food: {
                enabled: true,
                name: 'Food',
                unencodedName: 'Food',
                areCommentsRequired: false,
                'GL Code': '',
                externalID: '',
                origin: '',
            },
            'Food: Meat': {
                enabled: true,
                name: 'Food: Meat',
                unencodedName: 'Food: Meat',
                areCommentsRequired: false,
                'GL Code': '',
                externalID: '',
                origin: '',
            },
        };
        const smallResultList: OptionsListUtils.CategoryTreeSection[] = [
            {
                title: '',
                shouldShow: false,
                data: [
                    {
                        text: 'Food',
                        keyForList: 'Food',
                        searchText: 'Food',
                        tooltipText: 'Food',
                        isDisabled: false,
                        isSelected: false,
                    },
                    {
                        text: '    Meat',
                        keyForList: 'Food: Meat',
                        searchText: 'Food: Meat',
                        tooltipText: 'Meat',
                        isDisabled: false,
                        isSelected: false,
                    },
                    {
                        text: 'Restaurant',
                        keyForList: 'Restaurant',
                        searchText: 'Restaurant',
                        tooltipText: 'Restaurant',
                        isDisabled: false,
                        isSelected: false,
                    },
                ],
                indexOffset: 3,
            },
        ];
        const smallSearchResultList: OptionsListUtils.CategoryTreeSection[] = [
            {
                title: '',
                shouldShow: true,
                indexOffset: 2,
                data: [
                    {
                        text: 'Food',
                        keyForList: 'Food',
                        searchText: 'Food',
                        tooltipText: 'Food',
                        isDisabled: false,
                        isSelected: false,
                    },
                    {
                        text: 'Food: Meat',
                        keyForList: 'Food: Meat',
                        searchText: 'Food: Meat',
                        tooltipText: 'Food: Meat',
                        isDisabled: false,
                        isSelected: false,
                    },
                ],
            },
        ];
        const smallWrongSearchResultList: OptionsListUtils.CategoryTreeSection[] = [
            {
                title: '',
                shouldShow: true,
                indexOffset: 0,
                data: [],
            },
        ];
        const largeCategoriesList: PolicyCategories = {
            Taxi: {
                enabled: false,
                name: 'Taxi',
                unencodedName: 'Taxi',
                areCommentsRequired: false,
                'GL Code': '',
                externalID: '',
                origin: '',
            },
            Restaurant: {
                enabled: true,
                name: 'Restaurant',
                unencodedName: 'Restaurant',
                areCommentsRequired: false,
                'GL Code': '',
                externalID: '',
                origin: '',
            },
            Food: {
                enabled: true,
                name: 'Food',
                unencodedName: 'Food',
                areCommentsRequired: false,
                'GL Code': '',
                externalID: '',
                origin: '',
            },
            'Food: Meat': {
                enabled: true,
                name: 'Food: Meat',
                unencodedName: 'Food: Meat',
                areCommentsRequired: false,
                'GL Code': '',
                externalID: '',
                origin: '',
            },
            'Food: Milk': {
                enabled: true,
                name: 'Food: Milk',
                unencodedName: 'Food: Milk',
                areCommentsRequired: false,
                'GL Code': '',
                externalID: '',
                origin: '',
            },
            'Food: Vegetables': {
                enabled: false,
                name: 'Food: Vegetables',
                unencodedName: 'Food: Vegetables',
                areCommentsRequired: false,
                'GL Code': '',
                externalID: '',
                origin: '',
            },
            'Cars: Audi': {
                enabled: true,
                name: 'Cars: Audi',
                unencodedName: 'Cars: Audi',
                areCommentsRequired: false,
                'GL Code': '',
                externalID: '',
                origin: '',
            },
            'Cars: BMW': {
                enabled: false,
                name: 'Cars: BMW',
                unencodedName: 'Cars: BMW',
                areCommentsRequired: false,
                'GL Code': '',
                externalID: '',
                origin: '',
            },
            'Cars: Mercedes-Benz': {
                enabled: true,
                name: 'Cars: Mercedes-Benz',
                unencodedName: 'Cars: Mercedes-Benz',
                areCommentsRequired: false,
                'GL Code': '',
                externalID: '',
                origin: '',
            },
            Medical: {
                enabled: false,
                name: 'Medical',
                unencodedName: 'Medical',
                areCommentsRequired: false,
                'GL Code': '',
                externalID: '',
                origin: '',
            },
            'Travel: Meals': {
                enabled: true,
                name: 'Travel: Meals',
                unencodedName: 'Travel: Meals',
                areCommentsRequired: false,
                'GL Code': '',
                externalID: '',
                origin: '',
            },
            'Travel: Meals: Breakfast': {
                enabled: true,
                name: 'Travel: Meals: Breakfast',
                unencodedName: 'Travel: Meals: Breakfast',
                areCommentsRequired: false,
                'GL Code': '',
                externalID: '',
                origin: '',
            },
            'Travel: Meals: Dinner': {
                enabled: false,
                name: 'Travel: Meals: Dinner',
                unencodedName: 'Travel: Meals: Dinner',
                areCommentsRequired: false,
                'GL Code': '',
                externalID: '',
                origin: '',
            },
            'Travel: Meals: Lunch': {
                enabled: true,
                name: 'Travel: Meals: Lunch',
                unencodedName: 'Travel: Meals: Lunch',
                areCommentsRequired: false,
                'GL Code': '',
                externalID: '',
                origin: '',
            },
        };
        const largeResultList: OptionsListUtils.CategoryTreeSection[] = [
            {
                title: '',
                shouldShow: false,
                indexOffset: 1,
                data: [
                    {
                        text: 'Medical',
                        keyForList: 'Medical',
                        searchText: 'Medical',
                        tooltipText: 'Medical',
                        isDisabled: false,
                        isSelected: false,
                    },
                ],
            },
            {
                title: 'Recent',
                shouldShow: true,
                indexOffset: 1,
                data: [
                    {
                        text: 'Restaurant',
                        keyForList: 'Restaurant',
                        searchText: 'Restaurant',
                        tooltipText: 'Restaurant',
                        isDisabled: false,
                        isSelected: false,
                    },
                ],
            },
            {
                title: 'All',
                shouldShow: true,
                indexOffset: 11,
                data: [
                    {
                        text: 'Cars',
                        keyForList: 'Cars',
                        searchText: 'Cars',
                        tooltipText: 'Cars',
                        isDisabled: true,
                        isSelected: false,
                    },
                    {
                        text: '    Audi',
                        keyForList: 'Cars: Audi',
                        searchText: 'Cars: Audi',
                        tooltipText: 'Audi',
                        isDisabled: false,
                        isSelected: false,
                    },
                    {
                        text: '    Mercedes-Benz',
                        keyForList: 'Cars: Mercedes-Benz',
                        searchText: 'Cars: Mercedes-Benz',
                        tooltipText: 'Mercedes-Benz',
                        isDisabled: false,
                        isSelected: false,
                    },
                    {
                        text: 'Food',
                        keyForList: 'Food',
                        searchText: 'Food',
                        tooltipText: 'Food',
                        isDisabled: false,
                        isSelected: false,
                    },
                    {
                        text: '    Meat',
                        keyForList: 'Food: Meat',
                        searchText: 'Food: Meat',
                        tooltipText: 'Meat',
                        isDisabled: false,
                        isSelected: false,
                    },
                    {
                        text: '    Milk',
                        keyForList: 'Food: Milk',
                        searchText: 'Food: Milk',
                        tooltipText: 'Milk',
                        isDisabled: false,
                        isSelected: false,
                    },
                    {
                        text: 'Restaurant',
                        keyForList: 'Restaurant',
                        searchText: 'Restaurant',
                        tooltipText: 'Restaurant',
                        isDisabled: false,
                        isSelected: false,
                    },
                    {
                        text: 'Travel',
                        keyForList: 'Travel',
                        searchText: 'Travel',
                        tooltipText: 'Travel',
                        isDisabled: true,
                        isSelected: false,
                    },
                    {
                        text: '    Meals',
                        keyForList: 'Travel: Meals',
                        searchText: 'Travel: Meals',
                        tooltipText: 'Meals',
                        isDisabled: false,
                        isSelected: false,
                    },
                    {
                        text: '        Breakfast',
                        keyForList: 'Travel: Meals: Breakfast',
                        searchText: 'Travel: Meals: Breakfast',
                        tooltipText: 'Breakfast',
                        isDisabled: false,
                        isSelected: false,
                    },
                    {
                        text: '        Lunch',
                        keyForList: 'Travel: Meals: Lunch',
                        searchText: 'Travel: Meals: Lunch',
                        tooltipText: 'Lunch',
                        isDisabled: false,
                        isSelected: false,
                    },
                ],
            },
        ];
        const largeSearchResultList: OptionsListUtils.CategoryTreeSection[] = [
            {
                title: '',
                shouldShow: true,
                indexOffset: 3,
                data: [
                    {
                        text: 'Food',
                        keyForList: 'Food',
                        searchText: 'Food',
                        tooltipText: 'Food',
                        isDisabled: false,
                        isSelected: false,
                    },
                    {
                        text: 'Food: Meat',
                        keyForList: 'Food: Meat',
                        searchText: 'Food: Meat',
                        tooltipText: 'Food: Meat',
                        isDisabled: false,
                        isSelected: false,
                    },
                    {
                        text: 'Food: Milk',
                        keyForList: 'Food: Milk',
                        searchText: 'Food: Milk',
                        tooltipText: 'Food: Milk',
                        isDisabled: false,
                        isSelected: false,
                    },
                ],
            },
        ];
        const largeWrongSearchResultList: OptionsListUtils.CategoryTreeSection[] = [
            {
                title: '',
                shouldShow: true,
                indexOffset: 0,
                data: [],
            },
        ];
        const emptyCategoriesList = {};
        const emptySelectedResultList: OptionsListUtils.CategoryTreeSection[] = [
            {
                title: '',
                shouldShow: false,
                indexOffset: 1,
                data: [
                    {
                        text: 'Medical',
                        keyForList: 'Medical',
                        searchText: 'Medical',
                        tooltipText: 'Medical',
                        isDisabled: false,
                        isSelected: false,
                    },
                ],
            },
        ];

        const smallResult = OptionsListUtils.getFilteredOptions(OPTIONS.reports, OPTIONS.personalDetails, [], emptySearch, [], [], false, false, true, smallCategoriesList);
        expect(smallResult.categoryOptions).toStrictEqual(smallResultList);

        const smallSearchResult = OptionsListUtils.getFilteredOptions(OPTIONS.reports, OPTIONS.personalDetails, [], search, [], [], false, false, true, smallCategoriesList);
        expect(smallSearchResult.categoryOptions).toStrictEqual(smallSearchResultList);

        const smallWrongSearchResult = OptionsListUtils.getFilteredOptions(OPTIONS.reports, OPTIONS.personalDetails, [], wrongSearch, [], [], false, false, true, smallCategoriesList);
        expect(smallWrongSearchResult.categoryOptions).toStrictEqual(smallWrongSearchResultList);

        const largeResult = OptionsListUtils.getFilteredOptions(
            OPTIONS.reports,
            OPTIONS.personalDetails,
            [],
            emptySearch,
            selectedOptions,
            [],
            false,
            false,
            true,
            largeCategoriesList,
            recentlyUsedCategories,
        );
        expect(largeResult.categoryOptions).toStrictEqual(largeResultList);

        const largeSearchResult = OptionsListUtils.getFilteredOptions(
            OPTIONS.reports,
            OPTIONS.personalDetails,
            [],
            search,
            selectedOptions,
            [],
            false,
            false,
            true,
            largeCategoriesList,
            recentlyUsedCategories,
        );
        expect(largeSearchResult.categoryOptions).toStrictEqual(largeSearchResultList);

        const largeWrongSearchResult = OptionsListUtils.getFilteredOptions(
            OPTIONS.reports,
            OPTIONS.personalDetails,
            [],
            wrongSearch,
            selectedOptions,
            [],
            false,
            false,
            true,
            largeCategoriesList,
            recentlyUsedCategories,
        );
        expect(largeWrongSearchResult.categoryOptions).toStrictEqual(largeWrongSearchResultList);

        const emptyResult = OptionsListUtils.getFilteredOptions(OPTIONS.reports, OPTIONS.personalDetails, [], search, selectedOptions, [], false, false, true, emptyCategoriesList);
        expect(emptyResult.categoryOptions).toStrictEqual(emptySelectedResultList);
    });

    it('getFilteredOptions() for tags', () => {
        const search = 'ing';
        const emptySearch = '';
        const wrongSearch = 'bla bla';
        const recentlyUsedTags = ['Engineering', 'HR'];

        const selectedOptions = [
            {
                name: 'Medical',
            },
        ];
        const smallTagsList: Record<string, SelectedTagOption> = {
            Engineering: {
                enabled: false,
                name: 'Engineering',
                accountID: undefined,
            },
            Medical: {
                enabled: true,
                name: 'Medical',
                accountID: undefined,
            },
            Accounting: {
                enabled: true,
                name: 'Accounting',
                accountID: undefined,
            },
            HR: {
                enabled: true,
                name: 'HR',
                accountID: undefined,
            },
        };
        const smallResultList: OptionsListUtils.CategorySection[] = [
            {
                title: '',
                shouldShow: false,
                // data sorted alphabetically by name
                data: [
                    {
                        text: 'Accounting',
                        keyForList: 'Accounting',
                        searchText: 'Accounting',
                        tooltipText: 'Accounting',
                        isDisabled: false,
                        isSelected: false,
                    },
                    {
                        text: 'HR',
                        keyForList: 'HR',
                        searchText: 'HR',
                        tooltipText: 'HR',
                        isDisabled: false,
                        isSelected: false,
                    },
                    {
                        text: 'Medical',
                        keyForList: 'Medical',
                        searchText: 'Medical',
                        tooltipText: 'Medical',
                        isDisabled: false,
                        isSelected: false,
                    },
                ],
            },
        ];
        const smallSearchResultList: OptionsListUtils.CategorySection[] = [
            {
                title: '',
                shouldShow: true,
                data: [
                    {
                        text: 'Accounting',
                        keyForList: 'Accounting',
                        searchText: 'Accounting',
                        tooltipText: 'Accounting',
                        isDisabled: false,
                        isSelected: false,
                    },
                ],
            },
        ];
        const smallWrongSearchResultList: OptionsListUtils.CategoryTreeSection[] = [
            {
                title: '',
                shouldShow: true,
                data: [],
            },
        ];
        const largeTagsList: Record<string, SelectedTagOption> = {
            Engineering: {
                enabled: false,
                name: 'Engineering',
                accountID: undefined,
            },
            Medical: {
                enabled: true,
                name: 'Medical',
                accountID: undefined,
            },
            Accounting: {
                enabled: true,
                name: 'Accounting',
                accountID: undefined,
            },
            HR: {
                enabled: true,
                name: 'HR',
                accountID: undefined,
            },
            Food: {
                enabled: true,
                name: 'Food',
                accountID: undefined,
            },
            Traveling: {
                enabled: false,
                name: 'Traveling',
                accountID: undefined,
            },
            Cleaning: {
                enabled: true,
                name: 'Cleaning',
                accountID: undefined,
            },
            Software: {
                enabled: true,
                name: 'Software',
                accountID: undefined,
            },
            OfficeSupplies: {
                enabled: false,
                name: 'Office Supplies',
                accountID: undefined,
            },
            Taxes: {
                enabled: true,
                name: 'Taxes',
                accountID: undefined,
            },
            Benefits: {
                enabled: true,
                name: 'Benefits',
                accountID: undefined,
            },
        };
        const largeResultList: OptionsListUtils.CategorySection[] = [
            {
                title: '',
                shouldShow: true,
                data: [
                    {
                        text: 'Medical',
                        keyForList: 'Medical',
                        searchText: 'Medical',
                        tooltipText: 'Medical',
                        isDisabled: false,
                        isSelected: true,
                    },
                ],
            },
            {
                title: 'Recent',
                shouldShow: true,
                data: [
                    {
                        text: 'HR',
                        keyForList: 'HR',
                        searchText: 'HR',
                        tooltipText: 'HR',
                        isDisabled: false,
                        isSelected: false,
                    },
                ],
            },
            {
                title: 'All',
                shouldShow: true,
                // data sorted alphabetically by name
                data: [
                    {
                        text: 'Accounting',
                        keyForList: 'Accounting',
                        searchText: 'Accounting',
                        tooltipText: 'Accounting',
                        isDisabled: false,
                        isSelected: false,
                    },
                    {
                        text: 'Benefits',
                        keyForList: 'Benefits',
                        searchText: 'Benefits',
                        tooltipText: 'Benefits',
                        isDisabled: false,
                        isSelected: false,
                    },
                    {
                        text: 'Cleaning',
                        keyForList: 'Cleaning',
                        searchText: 'Cleaning',
                        tooltipText: 'Cleaning',
                        isDisabled: false,
                        isSelected: false,
                    },
                    {
                        text: 'Food',
                        keyForList: 'Food',
                        searchText: 'Food',
                        tooltipText: 'Food',
                        isDisabled: false,
                        isSelected: false,
                    },
                    {
                        text: 'HR',
                        keyForList: 'HR',
                        searchText: 'HR',
                        tooltipText: 'HR',
                        isDisabled: false,
                        isSelected: false,
                    },
                    {
                        text: 'Software',
                        keyForList: 'Software',
                        searchText: 'Software',
                        tooltipText: 'Software',
                        isDisabled: false,
                        isSelected: false,
                    },
                    {
                        text: 'Taxes',
                        keyForList: 'Taxes',
                        searchText: 'Taxes',
                        tooltipText: 'Taxes',
                        isDisabled: false,
                        isSelected: false,
                    },
                ],
            },
        ];
        const largeSearchResultList: OptionsListUtils.CategorySection[] = [
            {
                title: '',
                shouldShow: true,
                data: [
                    {
                        text: 'Accounting',
                        keyForList: 'Accounting',
                        searchText: 'Accounting',
                        tooltipText: 'Accounting',
                        isDisabled: false,
                        isSelected: false,
                    },
                    {
                        text: 'Cleaning',
                        keyForList: 'Cleaning',
                        searchText: 'Cleaning',
                        tooltipText: 'Cleaning',
                        isDisabled: false,
                        isSelected: false,
                    },
                ],
            },
        ];
        const largeWrongSearchResultList: OptionsListUtils.CategoryTreeSection[] = [
            {
                title: '',
                shouldShow: true,
                data: [],
            },
        ];

        const smallResult = OptionsListUtils.getFilteredOptions(OPTIONS.reports, OPTIONS.personalDetails, [], emptySearch, [], [], false, false, false, {}, [], true, smallTagsList);
        expect(smallResult.tagOptions).toStrictEqual(smallResultList);

        const smallSearchResult = OptionsListUtils.getFilteredOptions(OPTIONS.reports, OPTIONS.personalDetails, [], search, [], [], false, false, false, {}, [], true, smallTagsList);
        expect(smallSearchResult.tagOptions).toStrictEqual(smallSearchResultList);

        const smallWrongSearchResult = OptionsListUtils.getFilteredOptions(
            OPTIONS.reports,
            OPTIONS.personalDetails,
            [],
            wrongSearch,
            [],
            [],
            false,
            false,
            false,
            {},
            [],
            true,
            smallTagsList,
        );
        expect(smallWrongSearchResult.tagOptions).toStrictEqual(smallWrongSearchResultList);

        const largeResult = OptionsListUtils.getFilteredOptions(
            OPTIONS.reports,
            OPTIONS.personalDetails,
            [],
            emptySearch,
            selectedOptions,
            [],
            false,
            false,
            false,
            {},
            [],
            true,
            largeTagsList,
            recentlyUsedTags,
        );
        expect(largeResult.tagOptions).toStrictEqual(largeResultList);

        const largeSearchResult = OptionsListUtils.getFilteredOptions(
            OPTIONS.reports,
            OPTIONS.personalDetails,
            [],
            search,
            selectedOptions,
            [],
            false,
            false,
            false,
            {},
            [],
            true,
            largeTagsList,
            recentlyUsedTags,
        );
        expect(largeSearchResult.tagOptions).toStrictEqual(largeSearchResultList);

        const largeWrongSearchResult = OptionsListUtils.getFilteredOptions(
            OPTIONS.reports,
            OPTIONS.personalDetails,
            [],
            wrongSearch,
            selectedOptions,
            [],
            false,
            false,
            false,
            {},
            [],
            true,
            largeTagsList,
            recentlyUsedTags,
        );
        expect(largeWrongSearchResult.tagOptions).toStrictEqual(largeWrongSearchResultList);
    });

    it('getCategoryOptionTree()', () => {
        const categories = {
            Meals: {
                enabled: true,
                name: 'Meals',
            },
            Restaurant: {
                enabled: true,
                name: 'Restaurant',
            },
            Food: {
                enabled: true,
                name: 'Food',
            },
            'Food: Meat': {
                enabled: true,
                name: 'Food: Meat',
            },
            'Food: Milk': {
                enabled: true,
                name: 'Food: Milk',
            },
            'Cars: Audi': {
                enabled: true,
                name: 'Cars: Audi',
            },
            'Cars: Mercedes-Benz': {
                enabled: true,
                name: 'Cars: Mercedes-Benz',
            },
            'Travel: Meals': {
                enabled: true,
                name: 'Travel: Meals',
            },
            'Travel: Meals: Breakfast': {
                enabled: true,
                name: 'Travel: Meals: Breakfast',
            },
            'Travel: Meals: Lunch': {
                enabled: true,
                name: 'Travel: Meals: Lunch',
            },
            Plain: {
                enabled: true,
                name: 'Plain',
            },
            Audi: {
                enabled: true,
                name: 'Audi',
            },
            Health: {
                enabled: true,
                name: 'Health',
            },
            'A: B: C': {
                enabled: true,
                name: 'A: B: C',
            },
            'A: B: C: D: E': {
                enabled: true,
                name: 'A: B: C: D: E',
            },
        };
        const result = [
            {
                text: 'Meals',
                keyForList: 'Meals',
                searchText: 'Meals',
                tooltipText: 'Meals',
                isDisabled: false,
                isSelected: false,
            },
            {
                text: 'Restaurant',
                keyForList: 'Restaurant',
                searchText: 'Restaurant',
                tooltipText: 'Restaurant',
                isDisabled: false,
                isSelected: false,
            },
            {
                text: 'Food',
                keyForList: 'Food',
                searchText: 'Food',
                tooltipText: 'Food',
                isDisabled: false,
                isSelected: false,
            },
            {
                text: '    Meat',
                keyForList: 'Food: Meat',
                searchText: 'Food: Meat',
                tooltipText: 'Meat',
                isDisabled: false,
                isSelected: false,
            },
            {
                text: '    Milk',
                keyForList: 'Food: Milk',
                searchText: 'Food: Milk',
                tooltipText: 'Milk',
                isDisabled: false,
                isSelected: false,
            },
            {
                text: 'Cars',
                keyForList: 'Cars',
                searchText: 'Cars',
                tooltipText: 'Cars',
                isDisabled: true,
                isSelected: false,
            },
            {
                text: '    Audi',
                keyForList: 'Cars: Audi',
                searchText: 'Cars: Audi',
                tooltipText: 'Audi',
                isDisabled: false,
                isSelected: false,
            },
            {
                text: '    Mercedes-Benz',
                keyForList: 'Cars: Mercedes-Benz',
                searchText: 'Cars: Mercedes-Benz',
                tooltipText: 'Mercedes-Benz',
                isDisabled: false,
                isSelected: false,
            },
            {
                text: 'Travel',
                keyForList: 'Travel',
                searchText: 'Travel',
                tooltipText: 'Travel',
                isDisabled: true,
                isSelected: false,
            },
            {
                text: '    Meals',
                keyForList: 'Travel: Meals',
                searchText: 'Travel: Meals',
                tooltipText: 'Meals',
                isDisabled: false,
                isSelected: false,
            },
            {
                text: '        Breakfast',
                keyForList: 'Travel: Meals: Breakfast',
                searchText: 'Travel: Meals: Breakfast',
                tooltipText: 'Breakfast',
                isDisabled: false,
                isSelected: false,
            },
            {
                text: '        Lunch',
                keyForList: 'Travel: Meals: Lunch',
                searchText: 'Travel: Meals: Lunch',
                tooltipText: 'Lunch',
                isDisabled: false,
                isSelected: false,
            },
            {
                text: 'Plain',
                keyForList: 'Plain',
                searchText: 'Plain',
                tooltipText: 'Plain',
                isDisabled: false,
                isSelected: false,
            },
            {
                text: 'Audi',
                keyForList: 'Audi',
                searchText: 'Audi',
                tooltipText: 'Audi',
                isDisabled: false,
                isSelected: false,
            },
            {
                text: 'Health',
                keyForList: 'Health',
                searchText: 'Health',
                tooltipText: 'Health',
                isDisabled: false,
                isSelected: false,
            },
            {
                text: 'A',
                keyForList: 'A',
                searchText: 'A',
                tooltipText: 'A',
                isDisabled: true,
                isSelected: false,
            },
            {
                text: '    B',
                keyForList: 'A: B',
                searchText: 'A: B',
                tooltipText: 'B',
                isDisabled: true,
                isSelected: false,
            },
            {
                text: '        C',
                keyForList: 'A: B: C',
                searchText: 'A: B: C',
                tooltipText: 'C',
                isDisabled: false,
                isSelected: false,
            },
            {
                text: '            D',
                keyForList: 'A: B: C: D',
                searchText: 'A: B: C: D',
                tooltipText: 'D',
                isDisabled: true,
                isSelected: false,
            },
            {
                text: '                E',
                keyForList: 'A: B: C: D: E',
                searchText: 'A: B: C: D: E',
                tooltipText: 'E',
                isDisabled: false,
                isSelected: false,
            },
        ];
        const resultOneLine = [
            {
                text: 'Meals',
                keyForList: 'Meals',
                searchText: 'Meals',
                tooltipText: 'Meals',
                isDisabled: false,
                isSelected: false,
            },
            {
                text: 'Restaurant',
                keyForList: 'Restaurant',
                searchText: 'Restaurant',
                tooltipText: 'Restaurant',
                isDisabled: false,
                isSelected: false,
            },
            {
                text: 'Food',
                keyForList: 'Food',
                searchText: 'Food',
                tooltipText: 'Food',
                isDisabled: false,
                isSelected: false,
            },
            {
                text: 'Food: Meat',
                keyForList: 'Food: Meat',
                searchText: 'Food: Meat',
                tooltipText: 'Food: Meat',
                isDisabled: false,
                isSelected: false,
            },
            {
                text: 'Food: Milk',
                keyForList: 'Food: Milk',
                searchText: 'Food: Milk',
                tooltipText: 'Food: Milk',
                isDisabled: false,
                isSelected: false,
            },
            {
                text: 'Cars: Audi',
                keyForList: 'Cars: Audi',
                searchText: 'Cars: Audi',
                tooltipText: 'Cars: Audi',
                isDisabled: false,
                isSelected: false,
            },
            {
                text: 'Cars: Mercedes-Benz',
                keyForList: 'Cars: Mercedes-Benz',
                searchText: 'Cars: Mercedes-Benz',
                tooltipText: 'Cars: Mercedes-Benz',
                isDisabled: false,
                isSelected: false,
            },
            {
                text: 'Travel: Meals',
                keyForList: 'Travel: Meals',
                searchText: 'Travel: Meals',
                tooltipText: 'Travel: Meals',
                isDisabled: false,
                isSelected: false,
            },
            {
                text: 'Travel: Meals: Breakfast',
                keyForList: 'Travel: Meals: Breakfast',
                searchText: 'Travel: Meals: Breakfast',
                tooltipText: 'Travel: Meals: Breakfast',
                isDisabled: false,
                isSelected: false,
            },
            {
                text: 'Travel: Meals: Lunch',
                keyForList: 'Travel: Meals: Lunch',
                searchText: 'Travel: Meals: Lunch',
                tooltipText: 'Travel: Meals: Lunch',
                isDisabled: false,
                isSelected: false,
            },
            {
                text: 'Plain',
                keyForList: 'Plain',
                searchText: 'Plain',
                tooltipText: 'Plain',
                isDisabled: false,
                isSelected: false,
            },
            {
                text: 'Audi',
                keyForList: 'Audi',
                searchText: 'Audi',
                tooltipText: 'Audi',
                isDisabled: false,
                isSelected: false,
            },
            {
                text: 'Health',
                keyForList: 'Health',
                searchText: 'Health',
                tooltipText: 'Health',
                isDisabled: false,
                isSelected: false,
            },
            {
                text: 'A: B: C',
                keyForList: 'A: B: C',
                searchText: 'A: B: C',
                tooltipText: 'A: B: C',
                isDisabled: false,
                isSelected: false,
            },
            {
                text: 'A: B: C: D: E',
                keyForList: 'A: B: C: D: E',
                searchText: 'A: B: C: D: E',
                tooltipText: 'A: B: C: D: E',
                isDisabled: false,
                isSelected: false,
            },
        ];

        expect(OptionsListUtils.getCategoryOptionTree(categories)).toStrictEqual(result);
        expect(OptionsListUtils.getCategoryOptionTree(categories, true)).toStrictEqual(resultOneLine);
    });

    it('sortCategories', () => {
        const categoriesIncorrectOrdering = {
            Taxi: {
                name: 'Taxi',
                enabled: false,
            },
            'Test1: Subtest2': {
                name: 'Test1: Subtest2',
                enabled: true,
            },
            'Test: Test1: Subtest4': {
                name: 'Test: Test1: Subtest4',
                enabled: true,
            },
            Taxes: {
                name: 'Taxes',
                enabled: true,
            },
            Test: {
                name: 'Test',
                enabled: true,
            },
            Test1: {
                name: 'Test1',
                enabled: true,
            },
            'Travel: Nested-Travel': {
                name: 'Travel: Nested-Travel',
                enabled: true,
            },
            'Test1: Subtest1': {
                name: 'Test1: Subtest1',
                enabled: true,
            },
            'Test: Test1': {
                name: 'Test: Test1',
                enabled: true,
            },
            'Test: Test1: Subtest1': {
                name: 'Test: Test1: Subtest1',
                enabled: true,
            },
            'Test: Test1: Subtest3': {
                name: 'Test: Test1: Subtest3',
                enabled: false,
            },
            'Test: Test1: Subtest2': {
                name: 'Test: Test1: Subtest2',
                enabled: true,
            },
            'Test: Test2': {
                name: 'Test: Test2',
                enabled: true,
            },
            Travel: {
                name: 'Travel',
                enabled: true,
            },
            Utilities: {
                name: 'Utilities',
                enabled: true,
            },
            'Test: Test3: Subtest1': {
                name: 'Test: Test3: Subtest1',
                enabled: true,
            },
            'Test1: Subtest3': {
                name: 'Test1: Subtest3',
                enabled: true,
            },
        };
        const result = [
            {
                name: 'Taxes',
                enabled: true,
            },
            {
                name: 'Taxi',
                enabled: false,
            },
            {
                name: 'Test',
                enabled: true,
            },
            {
                name: 'Test: Test1',
                enabled: true,
            },
            {
                name: 'Test: Test1: Subtest1',
                enabled: true,
            },
            {
                name: 'Test: Test1: Subtest2',
                enabled: true,
            },
            {
                name: 'Test: Test1: Subtest3',
                enabled: false,
            },
            {
                name: 'Test: Test1: Subtest4',
                enabled: true,
            },
            {
                name: 'Test: Test2',
                enabled: true,
            },
            {
                name: 'Test: Test3: Subtest1',
                enabled: true,
            },
            {
                name: 'Test1',
                enabled: true,
            },
            {
                name: 'Test1: Subtest1',
                enabled: true,
            },
            {
                name: 'Test1: Subtest2',
                enabled: true,
            },
            {
                name: 'Test1: Subtest3',
                enabled: true,
            },
            {
                name: 'Travel',
                enabled: true,
            },
            {
                name: 'Travel: Nested-Travel',
                enabled: true,
            },
            {
                name: 'Utilities',
                enabled: true,
            },
        ];
        const categoriesIncorrectOrdering2 = {
            'Cars: BMW': {
                enabled: false,
                name: 'Cars: BMW',
            },
            Medical: {
                enabled: false,
                name: 'Medical',
            },
            'Travel: Meals: Lunch': {
                enabled: true,
                name: 'Travel: Meals: Lunch',
            },
            'Cars: Mercedes-Benz': {
                enabled: true,
                name: 'Cars: Mercedes-Benz',
            },
            Food: {
                enabled: true,
                name: 'Food',
            },
            'Food: Meat': {
                enabled: true,
                name: 'Food: Meat',
            },
            'Travel: Meals: Dinner': {
                enabled: false,
                name: 'Travel: Meals: Dinner',
            },
            'Food: Vegetables': {
                enabled: false,
                name: 'Food: Vegetables',
            },
            Restaurant: {
                enabled: true,
                name: 'Restaurant',
            },
            Taxi: {
                enabled: false,
                name: 'Taxi',
            },
            'Food: Milk': {
                enabled: true,
                name: 'Food: Milk',
            },
            'Travel: Meals': {
                enabled: true,
                name: 'Travel: Meals',
            },
            'Travel: Meals: Breakfast': {
                enabled: true,
                name: 'Travel: Meals: Breakfast',
            },
            'Cars: Audi': {
                enabled: true,
                name: 'Cars: Audi',
            },
        };
        const result2 = [
            {
                enabled: true,
                name: 'Cars: Audi',
            },
            {
                enabled: false,
                name: 'Cars: BMW',
            },
            {
                enabled: true,
                name: 'Cars: Mercedes-Benz',
            },
            {
                enabled: true,
                name: 'Food',
            },
            {
                enabled: true,
                name: 'Food: Meat',
            },
            {
                enabled: true,
                name: 'Food: Milk',
            },
            {
                enabled: false,
                name: 'Food: Vegetables',
            },
            {
                enabled: false,
                name: 'Medical',
            },
            {
                enabled: true,
                name: 'Restaurant',
            },
            {
                enabled: false,
                name: 'Taxi',
            },
            {
                enabled: true,
                name: 'Travel: Meals',
            },
            {
                enabled: true,
                name: 'Travel: Meals: Breakfast',
            },
            {
                enabled: false,
                name: 'Travel: Meals: Dinner',
            },
            {
                enabled: true,
                name: 'Travel: Meals: Lunch',
            },
        ];
        const categoriesIncorrectOrdering3 = {
            'Movies: Mr. Nobody': {
                enabled: true,
                name: 'Movies: Mr. Nobody',
            },
            Movies: {
                enabled: true,
                name: 'Movies',
            },
            'House, M.D.': {
                enabled: true,
                name: 'House, M.D.',
            },
            'Dr. House': {
                enabled: true,
                name: 'Dr. House',
            },
            'Many.dots.on.the.way.': {
                enabled: true,
                name: 'Many.dots.on.the.way.',
            },
            'More.Many.dots.on.the.way.': {
                enabled: false,
                name: 'More.Many.dots.on.the.way.',
            },
        };
        const result3 = [
            {
                enabled: true,
                name: 'Dr. House',
            },
            {
                enabled: true,
                name: 'House, M.D.',
            },
            {
                enabled: true,
                name: 'Many.dots.on.the.way.',
            },
            {
                enabled: false,
                name: 'More.Many.dots.on.the.way.',
            },
            {
                enabled: true,
                name: 'Movies',
            },
            {
                enabled: true,
                name: 'Movies: Mr. Nobody',
            },
        ];

        expect(OptionsListUtils.sortCategories(categoriesIncorrectOrdering)).toStrictEqual(result);
        expect(OptionsListUtils.sortCategories(categoriesIncorrectOrdering2)).toStrictEqual(result2);
        expect(OptionsListUtils.sortCategories(categoriesIncorrectOrdering3)).toStrictEqual(result3);
    });

    it('sortTags', () => {
        const createTagObjects = (names: string[]) => names.map((name) => ({name, enabled: true}));

        const unorderedTagNames = ['10bc', 'b', '0a', '1', '中国', 'b10', '!', '2', '0', '@', 'a1', 'a', '3', 'b1', '日本', '$', '20', '20a', '#', 'a20', 'c', '10'];
        const expectedOrderNames = ['!', '#', '$', '0', '0a', '1', '10', '10bc', '2', '20', '20a', '3', '@', 'a', 'a1', 'a20', 'b', 'b1', 'b10', 'c', '中国', '日本'];
        const unorderedTags = createTagObjects(unorderedTagNames);
        const expectedOrder = createTagObjects(expectedOrderNames);
        expect(OptionsListUtils.sortTags(unorderedTags)).toStrictEqual(expectedOrder);

        const unorderedTagNames2 = ['0', 'a1', '1', 'b1', '3', '10', 'b10', 'a', '2', 'c', '20', 'a20', 'b'];
        const expectedOrderNames2 = ['0', '1', '10', '2', '20', '3', 'a', 'a1', 'a20', 'b', 'b1', 'b10', 'c'];
        const unorderedTags2 = createTagObjects(unorderedTagNames2);
        const expectedOrder2 = createTagObjects(expectedOrderNames2);
        expect(OptionsListUtils.sortTags(unorderedTags2)).toStrictEqual(expectedOrder2);

        const unorderedTagNames3 = [
            '61',
            '39',
            '97',
            '93',
            '77',
            '71',
            '22',
            '27',
            '30',
            '64',
            '91',
            '24',
            '33',
            '60',
            '21',
            '85',
            '59',
            '76',
            '42',
            '67',
            '13',
            '96',
            '84',
            '44',
            '68',
            '31',
            '62',
            '87',
            '50',
            '4',
            '100',
            '12',
            '28',
            '49',
            '53',
            '5',
            '45',
            '14',
            '55',
            '78',
            '11',
            '35',
            '75',
            '18',
            '9',
            '80',
            '54',
            '2',
            '34',
            '48',
            '81',
            '6',
            '73',
            '15',
            '98',
            '25',
            '8',
            '99',
            '17',
            '90',
            '47',
            '1',
            '10',
            '38',
            '66',
            '57',
            '23',
            '86',
            '29',
            '3',
            '65',
            '74',
            '19',
            '56',
            '63',
            '20',
            '7',
            '32',
            '46',
            '70',
            '26',
            '16',
            '83',
            '37',
            '58',
            '43',
            '36',
            '69',
            '79',
            '72',
            '41',
            '94',
            '95',
            '82',
            '51',
            '52',
            '89',
            '88',
            '40',
            '92',
        ];
        const expectedOrderNames3 = [
            '1',
            '10',
            '100',
            '11',
            '12',
            '13',
            '14',
            '15',
            '16',
            '17',
            '18',
            '19',
            '2',
            '20',
            '21',
            '22',
            '23',
            '24',
            '25',
            '26',
            '27',
            '28',
            '29',
            '3',
            '30',
            '31',
            '32',
            '33',
            '34',
            '35',
            '36',
            '37',
            '38',
            '39',
            '4',
            '40',
            '41',
            '42',
            '43',
            '44',
            '45',
            '46',
            '47',
            '48',
            '49',
            '5',
            '50',
            '51',
            '52',
            '53',
            '54',
            '55',
            '56',
            '57',
            '58',
            '59',
            '6',
            '60',
            '61',
            '62',
            '63',
            '64',
            '65',
            '66',
            '67',
            '68',
            '69',
            '7',
            '70',
            '71',
            '72',
            '73',
            '74',
            '75',
            '76',
            '77',
            '78',
            '79',
            '8',
            '80',
            '81',
            '82',
            '83',
            '84',
            '85',
            '86',
            '87',
            '88',
            '89',
            '9',
            '90',
            '91',
            '92',
            '93',
            '94',
            '95',
            '96',
            '97',
            '98',
            '99',
        ];
        const unorderedTags3 = createTagObjects(unorderedTagNames3);
        const expectedOrder3 = createTagObjects(expectedOrderNames3);
        expect(OptionsListUtils.sortTags(unorderedTags3)).toStrictEqual(expectedOrder3);
    });

    it('getFilteredOptions() for taxRate', () => {
        const search = 'rate';
        const emptySearch = '';
        const wrongSearch = 'bla bla';

        const taxRatesWithDefault: TaxRatesWithDefault = {
            name: 'Tax',
            defaultExternalID: 'CODE1',
            defaultValue: '0%',
            foreignTaxDefault: 'CODE1',
            taxes: {
                CODE2: {
                    name: 'Tax rate 2',
                    value: '3%',
                    code: 'CODE2',
                    modifiedName: 'Tax rate 2 (3%)',
                },
                CODE3: {
                    name: 'Tax option 3',
                    value: '5%',
                    code: 'CODE3',
                    modifiedName: 'Tax option 3 (5%)',
                },
                CODE1: {
                    name: 'Tax exempt 1',
                    value: '0%',
                    code: 'CODE1',
                    modifiedName: 'Tax exempt 1 (0%) • Default',
                },
            },
        };

        const resultList: OptionsListUtils.CategorySection[] = [
            {
                title: '',
                shouldShow: false,
                // data sorted alphabetically by name
                data: [
                    {
                        // Adds 'Default' title to default tax.
                        // Adds value to tax name for more description.
                        text: 'Tax exempt 1 (0%) • Default',
                        keyForList: 'Tax exempt 1 (0%) • Default',
                        searchText: 'Tax exempt 1 (0%) • Default',
                        tooltipText: 'Tax exempt 1 (0%) • Default',
                        isDisabled: undefined,
                        // creates a data option.
                        data: {
                            name: 'Tax exempt 1',
                            code: 'CODE1',
                            modifiedName: 'Tax exempt 1 (0%) • Default',
                            value: '0%',
                        },
                    },
                    {
                        text: 'Tax option 3 (5%)',
                        keyForList: 'Tax option 3 (5%)',
                        searchText: 'Tax option 3 (5%)',
                        tooltipText: 'Tax option 3 (5%)',
                        isDisabled: undefined,
                        data: {
                            name: 'Tax option 3',
                            code: 'CODE3',
                            modifiedName: 'Tax option 3 (5%)',
                            value: '5%',
                        },
                    },
                    {
                        text: 'Tax rate 2 (3%)',
                        keyForList: 'Tax rate 2 (3%)',
                        searchText: 'Tax rate 2 (3%)',
                        tooltipText: 'Tax rate 2 (3%)',
                        isDisabled: undefined,
                        data: {
                            name: 'Tax rate 2',
                            code: 'CODE2',
                            modifiedName: 'Tax rate 2 (3%)',
                            value: '3%',
                        },
                    },
                ],
            },
        ];

        const searchResultList: OptionsListUtils.CategorySection[] = [
            {
                title: '',
                shouldShow: true,
                // data sorted alphabetically by name
                data: [
                    {
                        text: 'Tax rate 2 (3%)',
                        keyForList: 'Tax rate 2 (3%)',
                        searchText: 'Tax rate 2 (3%)',
                        tooltipText: 'Tax rate 2 (3%)',
                        isDisabled: undefined,
                        data: {
                            name: 'Tax rate 2',
                            code: 'CODE2',
                            modifiedName: 'Tax rate 2 (3%)',
                            value: '3%',
                        },
                    },
                ],
            },
        ];

        const wrongSearchResultList: OptionsListUtils.CategorySection[] = [
            {
                title: '',
                shouldShow: true,
                data: [],
            },
        ];

        const result = OptionsListUtils.getFilteredOptions([], [], [], emptySearch, [], [], false, false, false, {}, [], false, {}, [], false, false, true, taxRatesWithDefault);

        expect(result.taxRatesOptions).toStrictEqual(resultList);

        const searchResult = OptionsListUtils.getFilteredOptions([], [], [], search, [], [], false, false, false, {}, [], false, {}, [], false, false, true, taxRatesWithDefault);
        expect(searchResult.taxRatesOptions).toStrictEqual(searchResultList);

        const wrongSearchResult = OptionsListUtils.getFilteredOptions([], [], [], wrongSearch, [], [], false, false, false, {}, [], false, {}, [], false, false, true, taxRatesWithDefault);
        expect(wrongSearchResult.taxRatesOptions).toStrictEqual(wrongSearchResultList);
    });

    it('formatMemberForList()', () => {
        const formattedMembers = Object.values(PERSONAL_DETAILS).map((personalDetail) => OptionsListUtils.formatMemberForList(personalDetail));

        // We're only formatting items inside the array, so the order should be the same as the original PERSONAL_DETAILS array
        expect(formattedMembers[0].text).toBe('Mister Fantastic');
        expect(formattedMembers[1].text).toBe('Iron Man');
        expect(formattedMembers[2].text).toBe('Spider-Man');

        // We should expect only the first item to be selected
        expect(formattedMembers[0].isSelected).toBe(true);

        // And all the others to be unselected
        expect(formattedMembers.slice(1).every((personalDetail) => !personalDetail.isSelected)).toBe(true);

        // `isDisabled` is always false
        expect(formattedMembers.every((personalDetail) => !personalDetail.isDisabled)).toBe(true);
    });

    describe('filterOptions', () => {
        it('should return all options when search is empty', () => {
            const options = OptionsListUtils.getSearchOptions(OPTIONS, '', [CONST.BETAS.ALL]);
            const filteredOptions = OptionsListUtils.filterOptions(options, '');

            expect(options.recentReports.length + options.personalDetails.length).toBe(filteredOptions.recentReports.length);
        });

        it('should return filtered options in correct order', () => {
            const searchText = 'man';
            const options = OptionsListUtils.getSearchOptions(OPTIONS, '', [CONST.BETAS.ALL]);

            const filteredOptions = OptionsListUtils.filterOptions(options, searchText);
            expect(filteredOptions.recentReports.length).toBe(5);
            expect(filteredOptions.recentReports[0].text).toBe('Invisible Woman');
            expect(filteredOptions.recentReports[1].text).toBe('Spider-Man');
            expect(filteredOptions.recentReports[2].text).toBe('Black Widow');
            expect(filteredOptions.recentReports[3].text).toBe('Mister Fantastic');
            expect(filteredOptions.recentReports[4].text).toBe("SHIELD's workspace (archived)");
        });

        it('should filter users by email', () => {
            const searchText = 'mistersinister@marauders.com';
            const options = OptionsListUtils.getSearchOptions(OPTIONS, '', [CONST.BETAS.ALL]);

            const filteredOptions = OptionsListUtils.filterOptions(options, searchText);

            expect(filteredOptions.recentReports.length).toBe(1);
            expect(filteredOptions.recentReports[0].text).toBe('Mr Sinister');
        });

        it('should find archived chats', () => {
            const searchText = 'Archived';
            const options = OptionsListUtils.getSearchOptions(OPTIONS, '', [CONST.BETAS.ALL]);
            const filteredOptions = OptionsListUtils.filterOptions(options, searchText);

            expect(filteredOptions.recentReports.length).toBe(1);
            expect(filteredOptions.recentReports[0].isArchivedRoom).toBe(true);
        });

        it('should filter options by email if dot is skipped in the email', () => {
            const searchText = 'barryallen';
            const OPTIONS_WITH_PERIODS = OptionsListUtils.createOptionList(PERSONAL_DETAILS_WITH_PERIODS, REPORTS);
            const options = OptionsListUtils.getSearchOptions(OPTIONS_WITH_PERIODS, '', [CONST.BETAS.ALL]);

            const filteredOptions = OptionsListUtils.filterOptions(options, searchText);

            expect(filteredOptions.recentReports.length).toBe(1);
            expect(filteredOptions.recentReports[0].login).toBe('barry.allen@expensify.com');
        });

        it('should include workspaces in the search results', () => {
            const searchText = 'avengers';
            const options = OptionsListUtils.getSearchOptions(OPTIONS_WITH_WORKSPACES, '', [CONST.BETAS.ALL]);

            const filteredOptions = OptionsListUtils.filterOptions(options, searchText);

            expect(filteredOptions.recentReports.length).toBe(1);
            expect(filteredOptions.recentReports[0].subtitle).toBe('Avengers Room');
        });

        it('should put exact match by login on the top of the list', () => {
            const searchText = 'reedrichards@expensify.com';
            const options = OptionsListUtils.getSearchOptions(OPTIONS, '', [CONST.BETAS.ALL]);

            const filteredOptions = OptionsListUtils.filterOptions(options, searchText);

            expect(filteredOptions.recentReports.length).toBe(2);
            expect(filteredOptions.recentReports[0].login).toBe(searchText);
        });

        it('should prioritize options with matching display name over chatrooms', () => {
            const searchText = 'spider';
            const OPTIONS_WITH_CHATROOMS = OptionsListUtils.createOptionList(PERSONAL_DETAILS, REPORTS_WITH_CHAT_ROOM);
            const options = OptionsListUtils.getSearchOptions(OPTIONS_WITH_CHATROOMS, '', [CONST.BETAS.ALL]);

            const filterOptions = OptionsListUtils.filterOptions(options, searchText);

            expect(filterOptions.recentReports.length).toBe(2);
            expect(filterOptions.recentReports[1].isChatRoom).toBe(true);
        });

        it('should put the item with latest lastVisibleActionCreated on top when search value match multiple items', () => {
            const searchText = 'fantastic';

            const options = OptionsListUtils.getSearchOptions(OPTIONS, '');
            const filteredOptions = OptionsListUtils.filterOptions(options, searchText);

            expect(filteredOptions.recentReports.length).toBe(2);
            expect(filteredOptions.recentReports[0].text).toBe('Mister Fantastic');
            expect(filteredOptions.recentReports[1].text).toBe('Mister Fantastic');
        });
    });
});
