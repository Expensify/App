import {View} from 'react-native';
import Onyx from 'react-native-onyx';
import _ from 'underscore';
import CONST from '../../src/CONST';
import * as OptionsListUtils from '../../src/libs/OptionsListUtils';
import * as ReportUtils from '../../src/libs/ReportUtils';
import ONYXKEYS from '../../src/ONYXKEYS';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

describe('OptionsListUtils', () => {
    // Given a set of reports with both single participants and multiple participants some pinned and some not
    const REPORTS = {
        1: {
            lastReadTime: '2021-01-14 11:25:39.295',
            lastVisibleActionCreated: '2022-11-22 03:26:02.015',
            isPinned: false,
            reportID: 1,
            participantAccountIDs: [2, 1],
            reportName: 'Iron Man, Mister Fantastic',
            hasDraft: true,
            type: CONST.REPORT.TYPE.CHAT,
        },
        2: {
            lastReadTime: '2021-01-14 11:25:39.296',
            lastVisibleActionCreated: '2022-11-22 03:26:02.016',
            isPinned: false,
            reportID: 2,
            participantAccountIDs: [3],
            reportName: 'Spider-Man',
            type: CONST.REPORT.TYPE.CHAT,
        },

        // This is the only report we are pinning in this test
        3: {
            lastReadTime: '2021-01-14 11:25:39.297',
            lastVisibleActionCreated: '2022-11-22 03:26:02.170',
            isPinned: true,
            reportID: 3,
            participantAccountIDs: [1],
            reportName: 'Mister Fantastic',
            type: CONST.REPORT.TYPE.CHAT,
        },
        4: {
            lastReadTime: '2021-01-14 11:25:39.298',
            lastVisibleActionCreated: '2022-11-22 03:26:02.180',
            isPinned: false,
            reportID: 4,
            participantAccountIDs: [4],
            reportName: 'Black Panther',
            type: CONST.REPORT.TYPE.CHAT,
        },
        5: {
            lastReadTime: '2021-01-14 11:25:39.299',
            lastVisibleActionCreated: '2022-11-22 03:26:02.019',
            isPinned: false,
            reportID: 5,
            participantAccountIDs: [5],
            reportName: 'Invisible Woman',
            type: CONST.REPORT.TYPE.CHAT,
        },
        6: {
            lastReadTime: '2021-01-14 11:25:39.300',
            lastVisibleActionCreated: '2022-11-22 03:26:02.020',
            isPinned: false,
            reportID: 6,
            participantAccountIDs: [6],
            reportName: 'Thor',
            type: CONST.REPORT.TYPE.CHAT,
        },

        // Note: This report has the largest lastVisibleActionCreated
        7: {
            lastReadTime: '2021-01-14 11:25:39.301',
            lastVisibleActionCreated: '2022-11-22 03:26:03.999',
            isPinned: false,
            reportID: 7,
            participantAccountIDs: [7],
            reportName: 'Captain America',
            type: CONST.REPORT.TYPE.CHAT,
        },

        // Note: This report has no lastVisibleActionCreated
        8: {
            lastReadTime: '2021-01-14 11:25:39.301',
            lastVisibleActionCreated: '2022-11-22 03:26:02.000',
            isPinned: false,
            reportID: 8,
            participantAccountIDs: [12],
            reportName: 'Silver Surfer',
            type: CONST.REPORT.TYPE.CHAT,
        },

        // Note: This report has an IOU
        9: {
            lastReadTime: '2021-01-14 11:25:39.302',
            lastVisibleActionCreated: '2022-11-22 03:26:02.998',
            isPinned: false,
            reportID: 9,
            participantAccountIDs: [8],
            reportName: 'Mister Sinister',
            iouReportID: 100,
            hasOutstandingIOU: true,
            type: CONST.REPORT.TYPE.CHAT,
        },

        // This report is an archived room – it does not have a name and instead falls back on oldPolicyName
        10: {
            lastReadTime: '2021-01-14 11:25:39.200',
            lastVisibleActionCreated: '2022-11-22 03:26:02.001',
            reportID: 10,
            isPinned: false,
            participantAccountIDs: [2, 7],
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
    const PERSONAL_DETAILS = {
        // These exist in our reports
        1: {
            accountID: 1,
            displayName: 'Mister Fantastic',
            login: 'reedrichards@expensify.com',
        },
        2: {
            accountID: 2,
            displayName: 'Iron Man',
            login: 'tonystark@expensify.com',
        },
        3: {
            accountID: 3,
            displayName: 'Spider-Man',
            login: 'peterparker@expensify.com',
        },
        4: {
            accountID: 4,
            displayName: 'Black Panther',
            login: 'tchalla@expensify.com',
        },
        5: {
            accountID: 5,
            displayName: 'Invisible Woman',
            login: 'suestorm@expensify.com',
        },
        6: {
            accountID: 6,
            displayName: 'Thor',
            login: 'thor@expensify.com',
        },
        7: {
            accountID: 7,
            displayName: 'Captain America',
            login: 'steverogers@expensify.com',
        },
        8: {
            accountID: 8,
            displayName: 'Mr Sinister',
            login: 'mistersinister@marauders.com',
        },

        // These do not exist in reports at all
        9: {
            accountID: 9,
            displayName: 'Black Widow',
            login: 'natasharomanoff@expensify.com',
        },
        10: {
            accountID: 10,
            displayName: 'The Incredible Hulk',
            login: 'brucebanner@expensify.com',
        },
    };

    const REPORTS_WITH_CONCIERGE = {
        ...REPORTS,

        11: {
            lastReadTime: '2021-01-14 11:25:39.302',
            lastVisibleActionCreated: '2022-11-22 03:26:02.022',
            isPinned: false,
            reportID: 11,
            participantAccountIDs: [999],
            reportName: 'Concierge',
            type: CONST.REPORT.TYPE.CHAT,
        },
    };

    const REPORTS_WITH_CHRONOS = {
        ...REPORTS,
        12: {
            lastReadTime: '2021-01-14 11:25:39.302',
            lastVisibleActionCreated: '2022-11-22 03:26:02.022',
            isPinned: false,
            reportID: 12,
            participantAccountIDs: [1000],
            reportName: 'Chronos',
            type: CONST.REPORT.TYPE.CHAT,
        },
    };

    const REPORTS_WITH_RECEIPTS = {
        ...REPORTS,
        13: {
            lastReadTime: '2021-01-14 11:25:39.302',
            lastVisibleActionCreated: '2022-11-22 03:26:02.022',
            isPinned: false,
            reportID: 13,
            participantAccountIDs: [1001],
            reportName: 'Receipts',
            type: CONST.REPORT.TYPE.CHAT,
        },
    };

    const REPORTS_WITH_WORKSPACE_ROOMS = {
        ...REPORTS,
        14: {
            lastReadTime: '2021-01-14 11:25:39.302',
            lastVisibleActionCreated: '2022-11-22 03:26:02.022',
            isPinned: false,
            reportID: 14,
            participantAccountIDs: [1, 10, 3],
            reportName: '',
            oldPolicyName: 'Avengers Room',
            isArchivedRoom: false,
            chatType: CONST.REPORT.CHAT_TYPE.POLICY_ADMINS,
            isOwnPolicyExpenseChat: true,
            type: CONST.REPORT.TYPE.CHAT,
        },
    };

    const PERSONAL_DETAILS_WITH_CONCIERGE = {
        ...PERSONAL_DETAILS,

        999: {
            accountID: 999,
            displayName: 'Concierge',
            login: 'concierge@expensify.com',
        },
    };

    const PERSONAL_DETAILS_WITH_CHRONOS = {
        ...PERSONAL_DETAILS,

        1000: {
            accountID: 1000,
            displayName: 'Chronos',
            login: 'chronos@expensify.com',
        },
    };

    const PERSONAL_DETAILS_WITH_RECEIPTS = {
        ...PERSONAL_DETAILS,

        1001: {
            accountID: 1001,
            displayName: 'Receipts',
            login: 'receipts@expensify.com',
        },
    };

    const PERSONAL_DETAILS_WITH_PERIODS = {
        ...PERSONAL_DETAILS,

        1002: {
            accountID: 1002,
            displayName: 'The Flash',
            login: 'barry.allen@expensify.com',
        },
    };

    const POLICY = {
        policyID: 'ABC123',
        name: 'Hero Policy',
    };

    // Set the currently logged in user, report data, and personal details
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
            initialKeyStates: {
                [ONYXKEYS.SESSION]: {accountID: 2, email: 'tonystark@expensify.com'},
                [`${ONYXKEYS.COLLECTION.REPORT}100`]: {
                    ownerAccountID: 8,
                    total: '1000',
                },
                [`${ONYXKEYS.COLLECTION.POLICY}${POLICY.policyID}`]: POLICY,
            },
        });
        Onyx.registerLogger(() => {});
        return waitForBatchedUpdates().then(() => Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, PERSONAL_DETAILS));
    });

    it('getSearchOptions()', () => {
        // When we filter in the Search view without providing a searchValue
        let results = OptionsListUtils.getSearchOptions(REPORTS, PERSONAL_DETAILS, '', [CONST.BETAS.ALL]);

        // Then the 2 personalDetails that don't have reports should be returned
        expect(results.personalDetails.length).toBe(2);

        // Then all of the reports should be shown including the archived rooms.
        expect(results.recentReports.length).toBe(_.size(REPORTS));

        // When we filter again but provide a searchValue
        results = OptionsListUtils.getSearchOptions(REPORTS, PERSONAL_DETAILS, 'spider');

        // Then only one option should be returned and it's the one matching the search value
        expect(results.recentReports.length).toBe(1);
        expect(results.recentReports[0].login).toBe('peterparker@expensify.com');

        // When we filter again but provide a searchValue that should match multiple times
        results = OptionsListUtils.getSearchOptions(REPORTS, PERSONAL_DETAILS, 'fantastic');

        // Value with latest lastVisibleActionCreated should be at the top.
        expect(results.recentReports.length).toBe(2);
        expect(results.recentReports[0].text).toBe('Mister Fantastic');
        expect(results.recentReports[1].text).toBe('Mister Fantastic');

        return waitForBatchedUpdates()
            .then(() => Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, PERSONAL_DETAILS_WITH_PERIODS))
            .then(() => {
                // When we filter again but provide a searchValue that should match with periods
                results = OptionsListUtils.getSearchOptions(REPORTS, PERSONAL_DETAILS_WITH_PERIODS, 'barry.allen@expensify.com');

                // Then we expect to have the personal detail with period filtered
                expect(results.recentReports.length).toBe(1);
                expect(results.recentReports[0].text).toBe('The Flash');
            });
    });

    it('getFilteredOptions()', () => {
        // maxRecentReportsToShow in src/libs/OptionsListUtils.js
        const MAX_RECENT_REPORTS = 5;

        // When we call getFilteredOptions() with no search value
        let results = OptionsListUtils.getFilteredOptions(REPORTS, PERSONAL_DETAILS, [], '');

        // We should expect maximimum of 5 recent reports to be returned
        expect(results.recentReports.length).toBe(MAX_RECENT_REPORTS);

        // We should expect all personalDetails to be returned,
        // minus the currently logged in user and recent reports count
        expect(results.personalDetails.length).toBe(_.size(PERSONAL_DETAILS) - 1 - MAX_RECENT_REPORTS);

        // We should expect personal details sorted alphabetically
        expect(results.personalDetails[0].text).toBe('Black Widow');
        expect(results.personalDetails[1].text).toBe('Invisible Woman');
        expect(results.personalDetails[2].text).toBe('Spider-Man');
        expect(results.personalDetails[3].text).toBe('The Incredible Hulk');

        // Then the result which has an existing report should also have the reportID attached
        const personalDetailWithExistingReport = _.find(results.personalDetails, (personalDetail) => personalDetail.login === 'peterparker@expensify.com');
        expect(personalDetailWithExistingReport.reportID).toBe(2);

        // When we only pass personal details
        results = OptionsListUtils.getFilteredOptions([], PERSONAL_DETAILS, [], '');

        // We should expect personal details sorted alphabetically
        expect(results.personalDetails[0].text).toBe('Black Panther');
        expect(results.personalDetails[1].text).toBe('Black Widow');
        expect(results.personalDetails[2].text).toBe('Captain America');
        expect(results.personalDetails[3].text).toBe('Invisible Woman');

        // When we provide a search value that does not match any personal details
        results = OptionsListUtils.getFilteredOptions(REPORTS, PERSONAL_DETAILS, [], 'magneto');

        // Then no options will be returned
        expect(results.personalDetails.length).toBe(0);

        // When we provide a search value that matches an email
        results = OptionsListUtils.getFilteredOptions(REPORTS, PERSONAL_DETAILS, [], 'peterparker@expensify.com');

        // Then one recentReports will be returned and it will be the correct option
        // personalDetails should be empty array
        expect(results.recentReports.length).toBe(1);
        expect(results.recentReports[0].text).toBe('Spider-Man');
        expect(results.personalDetails.length).toBe(0);

        // When we provide a search value that matches a partial display name or email
        results = OptionsListUtils.getFilteredOptions(REPORTS, PERSONAL_DETAILS, [], '.com');

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
        results = OptionsListUtils.getFilteredOptions(REPORTS_WITH_CONCIERGE, PERSONAL_DETAILS_WITH_CONCIERGE);

        // Concierge is included in the results by default. We should expect all the personalDetails to show
        // (minus the 5 that are already showing and the currently logged in user)
        expect(results.personalDetails.length).toBe(_.size(PERSONAL_DETAILS_WITH_CONCIERGE) - 1 - MAX_RECENT_REPORTS);
        expect(results.recentReports).toEqual(expect.arrayContaining([expect.objectContaining({login: 'concierge@expensify.com'})]));

        // Test by excluding Concierge from the results
        results = OptionsListUtils.getFilteredOptions(REPORTS_WITH_CONCIERGE, PERSONAL_DETAILS_WITH_CONCIERGE, [], '', [], [CONST.EMAIL.CONCIERGE]);

        // All the personalDetails should be returned minus the currently logged in user and Concierge
        expect(results.personalDetails.length).toBe(_.size(PERSONAL_DETAILS_WITH_CONCIERGE) - 2 - MAX_RECENT_REPORTS);
        expect(results.personalDetails).not.toEqual(expect.arrayContaining([expect.objectContaining({login: 'concierge@expensify.com'})]));

        // Test by excluding Chronos from the results
        results = OptionsListUtils.getFilteredOptions(REPORTS_WITH_CHRONOS, PERSONAL_DETAILS_WITH_CHRONOS, [], '', [], [CONST.EMAIL.CHRONOS]);

        // All the personalDetails should be returned minus the currently logged in user and Concierge
        expect(results.personalDetails.length).toBe(_.size(PERSONAL_DETAILS_WITH_CHRONOS) - 2 - MAX_RECENT_REPORTS);
        expect(results.personalDetails).not.toEqual(expect.arrayContaining([expect.objectContaining({login: 'chronos@expensify.com'})]));

        // Test by excluding Receipts from the results
        results = OptionsListUtils.getFilteredOptions(REPORTS_WITH_RECEIPTS, PERSONAL_DETAILS_WITH_RECEIPTS, [], '', [], [CONST.EMAIL.RECEIPTS]);

        // All the personalDetails should be returned minus the currently logged in user and Concierge
        expect(results.personalDetails.length).toBe(_.size(PERSONAL_DETAILS_WITH_RECEIPTS) - 2 - MAX_RECENT_REPORTS);
        expect(results.personalDetails).not.toEqual(expect.arrayContaining([expect.objectContaining({login: 'receipts@expensify.com'})]));
    });

    it('getFilteredOptions() for group Chat', () => {
        // When we call getFilteredOptions() with no search value
        let results = OptionsListUtils.getFilteredOptions(REPORTS, PERSONAL_DETAILS, [], '');

        // Then we should expect only a maxmimum of 5 recent reports to be returned
        expect(results.recentReports.length).toBe(5);

        // And we should expect all the personalDetails to show (minus the 5 that are already
        // showing and the currently logged in user)
        expect(results.personalDetails.length).toBe(_.size(PERSONAL_DETAILS) - 6);

        // We should expect personal details sorted alphabetically
        expect(results.personalDetails[0].text).toBe('Black Widow');
        expect(results.personalDetails[1].text).toBe('Invisible Woman');
        expect(results.personalDetails[2].text).toBe('Spider-Man');
        expect(results.personalDetails[3].text).toBe('The Incredible Hulk');

        // And none of our personalDetails should include any of the users with recent reports
        const reportLogins = _.map(results.recentReports, (reportOption) => reportOption.login);
        const personalDetailsOverlapWithReports = _.every(results.personalDetails, (personalDetailOption) => _.contains(reportLogins, personalDetailOption.login));
        expect(personalDetailsOverlapWithReports).toBe(false);

        // When we search for an option that is only in a personalDetail with no existing report
        results = OptionsListUtils.getFilteredOptions(REPORTS, PERSONAL_DETAILS, [], 'hulk');

        // Then reports should return no results
        expect(results.recentReports.length).toBe(0);

        // And personalDetails should show just one option and it will be the one we expect
        expect(results.personalDetails.length).toBe(1);
        expect(results.personalDetails[0].login).toBe('brucebanner@expensify.com');

        // When we search for an option that matches things in both personalDetails and reports
        results = OptionsListUtils.getFilteredOptions(REPORTS, PERSONAL_DETAILS, [], '.com');

        // Then all single participant reports that match will show up in the recentReports array, Recently used contact should be at the top
        expect(results.recentReports.length).toBe(5);
        expect(results.recentReports[0].text).toBe('Captain America');

        // And logins with no single participant reports will show up in personalDetails
        expect(results.personalDetails.length).toBe(4);
        expect(results.personalDetails[0].login).toBe('natasharomanoff@expensify.com');

        // When we provide no selected options to getFilteredOptions()
        results = OptionsListUtils.getFilteredOptions(REPORTS, PERSONAL_DETAILS, [], '', []);

        // Then one of our older report options (not in our five most recent) should appear in the personalDetails
        // but not in recentReports
        expect(_.every(results.recentReports, (option) => option.login !== 'peterparker@expensify.com')).toBe(true);
        expect(_.every(results.personalDetails, (option) => option.login !== 'peterparker@expensify.com')).toBe(false);

        // When we provide a "selected" option to getFilteredOptions()
        results = OptionsListUtils.getFilteredOptions(REPORTS, PERSONAL_DETAILS, [], '', [{login: 'peterparker@expensify.com'}]);

        // Then the option should not appear anywhere in either list
        expect(_.every(results.recentReports, (option) => option.login !== 'peterparker@expensify.com')).toBe(true);
        expect(_.every(results.personalDetails, (option) => option.login !== 'peterparker@expensify.com')).toBe(true);

        // When we add a search term for which no options exist and the searchValue itself
        // is not a potential email or phone
        results = OptionsListUtils.getFilteredOptions(REPORTS, PERSONAL_DETAILS, [], 'marc@expensify');

        // Then we should have no options or personal details at all and also that there is no userToInvite
        expect(results.recentReports.length).toBe(0);
        expect(results.personalDetails.length).toBe(0);
        expect(results.userToInvite).toBe(null);

        // When we add a search term for which no options exist and the searchValue itself
        // is a potential email
        results = OptionsListUtils.getFilteredOptions(REPORTS, PERSONAL_DETAILS, [], 'marc@expensify.com');

        // Then we should have no options or personal details at all but there should be a userToInvite
        expect(results.recentReports.length).toBe(0);
        expect(results.personalDetails.length).toBe(0);
        expect(results.userToInvite).not.toBe(null);

        // When we add a search term with a period, with options for it that don't contain the period
        results = OptionsListUtils.getFilteredOptions(REPORTS, PERSONAL_DETAILS, [], 'peter.parker@expensify.com');

        // Then we should have no options at all but there should be a userToInvite
        expect(results.recentReports.length).toBe(0);
        expect(results.userToInvite).not.toBe(null);

        // When we add a search term for which no options exist and the searchValue itself
        // is a potential phone number without country code added
        results = OptionsListUtils.getFilteredOptions(REPORTS, PERSONAL_DETAILS, [], '5005550006');

        // Then we should have no options or personal details at all but there should be a userToInvite and the login
        // should have the country code included
        expect(results.recentReports.length).toBe(0);
        expect(results.personalDetails.length).toBe(0);
        expect(results.userToInvite).not.toBe(null);
        expect(results.userToInvite.login).toBe('+15005550006');

        // When we add a search term for which no options exist and the searchValue itself
        // is a potential phone number with country code added
        results = OptionsListUtils.getFilteredOptions(REPORTS, PERSONAL_DETAILS, [], '+15005550006');

        // Then we should have no options or personal details at all but there should be a userToInvite and the login
        // should have the country code included
        expect(results.recentReports.length).toBe(0);
        expect(results.personalDetails.length).toBe(0);
        expect(results.userToInvite).not.toBe(null);
        expect(results.userToInvite.login).toBe('+15005550006');

        // When we add a search term for which no options exist and the searchValue itself
        // is a potential phone number with special characters added
        results = OptionsListUtils.getFilteredOptions(REPORTS, PERSONAL_DETAILS, [], '+1 (800)324-3233');

        // Then we should have no options or personal details at all but there should be a userToInvite and the login
        // should have the country code included
        expect(results.recentReports.length).toBe(0);
        expect(results.personalDetails.length).toBe(0);
        expect(results.userToInvite).not.toBe(null);
        expect(results.userToInvite.login).toBe('+18003243233');

        // When we use a search term for contact number that contains alphabet characters
        results = OptionsListUtils.getFilteredOptions(REPORTS, PERSONAL_DETAILS, [], '998243aaaa');

        // Then we shouldn't have any results or user to invite
        expect(results.recentReports.length).toBe(0);
        expect(results.personalDetails.length).toBe(0);
        expect(results.userToInvite).toBe(null);

        // Test Concierge's existence in new group options
        results = OptionsListUtils.getFilteredOptions(REPORTS_WITH_CONCIERGE, PERSONAL_DETAILS_WITH_CONCIERGE);

        // Concierge is included in the results by default. We should expect all the personalDetails to show
        // (minus the 5 that are already showing and the currently logged in user)
        expect(results.personalDetails.length).toBe(_.size(PERSONAL_DETAILS_WITH_CONCIERGE) - 6);
        expect(results.recentReports).toEqual(expect.arrayContaining([expect.objectContaining({login: 'concierge@expensify.com'})]));

        // Test by excluding Concierge from the results
        results = OptionsListUtils.getFilteredOptions(REPORTS_WITH_CONCIERGE, PERSONAL_DETAILS_WITH_CONCIERGE, [], '', [], [CONST.EMAIL.CONCIERGE]);

        // We should expect all the personalDetails to show (minus the 5 that are already showing,
        // the currently logged in user and Concierge)
        expect(results.personalDetails.length).toBe(_.size(PERSONAL_DETAILS_WITH_CONCIERGE) - 7);
        expect(results.personalDetails).not.toEqual(expect.arrayContaining([expect.objectContaining({login: 'concierge@expensify.com'})]));
        expect(results.recentReports).not.toEqual(expect.arrayContaining([expect.objectContaining({login: 'concierge@expensify.com'})]));

        // Test by excluding Chronos from the results
        results = OptionsListUtils.getFilteredOptions(REPORTS_WITH_CHRONOS, PERSONAL_DETAILS_WITH_CHRONOS, [], '', [], [CONST.EMAIL.CHRONOS]);

        // We should expect all the personalDetails to show (minus the 5 that are already showing,
        // the currently logged in user and Concierge)
        expect(results.personalDetails.length).toBe(_.size(PERSONAL_DETAILS_WITH_CHRONOS) - 7);
        expect(results.personalDetails).not.toEqual(expect.arrayContaining([expect.objectContaining({login: 'chronos@expensify.com'})]));
        expect(results.recentReports).not.toEqual(expect.arrayContaining([expect.objectContaining({login: 'chronos@expensify.com'})]));

        // Test by excluding Receipts from the results
        results = OptionsListUtils.getFilteredOptions(REPORTS_WITH_RECEIPTS, PERSONAL_DETAILS_WITH_RECEIPTS, [], '', [], [CONST.EMAIL.RECEIPTS]);

        // We should expect all the personalDetails to show (minus the 5 that are already showing,
        // the currently logged in user and Concierge)
        expect(results.personalDetails.length).toBe(_.size(PERSONAL_DETAILS_WITH_RECEIPTS) - 7);
        expect(results.personalDetails).not.toEqual(expect.arrayContaining([expect.objectContaining({login: 'receipts@expensify.com'})]));
        expect(results.recentReports).not.toEqual(expect.arrayContaining([expect.objectContaining({login: 'receipts@expensify.com'})]));
    });

    it('getShareDestinationsOptions()', () => {
        // Filter current REPORTS as we do in the component, before getting share destination options
        const filteredReports = {};
        _.keys(REPORTS).forEach((reportKey) => {
            if (!ReportUtils.canUserPerformWriteAction(REPORTS[reportKey]) || ReportUtils.isExpensifyOnlyParticipantInReport(REPORTS[reportKey])) {
                return;
            }
            filteredReports[reportKey] = REPORTS[reportKey];
        });

        // When we pass an empty search value
        let results = OptionsListUtils.getShareDestinationOptions(filteredReports, PERSONAL_DETAILS, [], '');

        // Then we should expect all the recent reports to show but exclude the archived rooms
        expect(results.recentReports.length).toBe(_.size(REPORTS) - 1);

        // When we pass a search value that doesn't match the group chat name
        results = OptionsListUtils.getShareDestinationOptions(filteredReports, PERSONAL_DETAILS, [], 'mutants');

        // Then we should expect no recent reports to show
        expect(results.recentReports.length).toBe(0);

        // When we pass a search value that matches the group chat name
        results = OptionsListUtils.getShareDestinationOptions(filteredReports, PERSONAL_DETAILS, [], 'Iron Man, Fantastic');

        // Then we should expect the group chat to show along with the contacts matching the search
        expect(results.recentReports.length).toBe(1);

        // Filter current REPORTS_WITH_WORKSPACE_ROOMS as we do in the component, before getting share destination options
        const filteredReportsWithWorkspaceRooms = {};
        _.keys(REPORTS_WITH_WORKSPACE_ROOMS).forEach((reportKey) => {
            if (!ReportUtils.canUserPerformWriteAction(REPORTS_WITH_WORKSPACE_ROOMS[reportKey]) || ReportUtils.isExpensifyOnlyParticipantInReport(REPORTS_WITH_WORKSPACE_ROOMS[reportKey])) {
                return;
            }
            filteredReportsWithWorkspaceRooms[reportKey] = REPORTS_WITH_WORKSPACE_ROOMS[reportKey];
        });

        // When we also have a policy to return rooms in the results
        results = OptionsListUtils.getShareDestinationOptions(filteredReportsWithWorkspaceRooms, PERSONAL_DETAILS, [], '');

        // Then we should expect the DMS, the group chats and the workspace room to show
        // We should expect all the recent reports to show, excluding the archived rooms
        expect(results.recentReports.length).toBe(_.size(REPORTS_WITH_WORKSPACE_ROOMS) - 1);

        // When we search for a workspace room
        results = OptionsListUtils.getShareDestinationOptions(filteredReportsWithWorkspaceRooms, PERSONAL_DETAILS, [], 'Avengers Room');

        // Then we should expect only the workspace room to show
        expect(results.recentReports.length).toBe(1);

        // When we search for a workspace room that doesn't exist
        results = OptionsListUtils.getShareDestinationOptions(filteredReportsWithWorkspaceRooms, PERSONAL_DETAILS, [], 'Mutants Lair');

        // Then we should expect no results to show
        expect(results.recentReports.length).toBe(0);
    });

    it('getMemberInviteOptions()', () => {
        // When we only pass personal details
        let results = OptionsListUtils.getMemberInviteOptions(PERSONAL_DETAILS, [], '');

        // We should expect personal details to be sorted alphabetically
        expect(results.personalDetails[0].text).toBe('Black Panther');
        expect(results.personalDetails[1].text).toBe('Black Widow');
        expect(results.personalDetails[2].text).toBe('Captain America');
        expect(results.personalDetails[3].text).toBe('Invisible Woman');

        // When we provide a search value that does not match any personal details
        results = OptionsListUtils.getMemberInviteOptions(PERSONAL_DETAILS, [], 'magneto');

        // Then no options will be returned
        expect(results.personalDetails.length).toBe(0);

        // When we provide a search value that matches an email
        results = OptionsListUtils.getMemberInviteOptions(PERSONAL_DETAILS, [], 'peterparker@expensify.com');

        // Then one personal should be in personalDetails list
        expect(results.personalDetails.length).toBe(1);
        expect(results.personalDetails[0].text).toBe('Spider-Man');
    });

    it('getFilteredOptions() for categories', () => {
        const search = 'Food';
        const emptySearch = '';
        const wrongSearch = 'bla bla';
        const recentlyUsedCategories = ['Taxi', 'Restaurant'];
        const selectedOptions = [
            {
                name: 'Medical',
                enabled: true,
            },
        ];
        const smallCategoriesList = {
            Taxi: {
                enabled: false,
                name: 'Taxi',
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
        };
        const smallResultList = [
            {
                title: '',
                shouldShow: false,
                indexOffset: 0,
                data: [
                    {
                        text: 'Food',
                        keyForList: 'Food',
                        searchText: 'Food',
                        tooltipText: 'Food',
                        isDisabled: false,
                    },
                    {
                        text: '    Meat',
                        keyForList: 'Food: Meat',
                        searchText: 'Food: Meat',
                        tooltipText: 'Meat',
                        isDisabled: false,
                    },
                    {
                        text: 'Restaurant',
                        keyForList: 'Restaurant',
                        searchText: 'Restaurant',
                        tooltipText: 'Restaurant',
                        isDisabled: false,
                    },
                ],
            },
        ];
        const smallSearchResultList = [
            {
                title: '',
                shouldShow: true,
                indexOffset: 0,
                data: [
                    {
                        text: 'Food',
                        keyForList: 'Food',
                        searchText: 'Food',
                        tooltipText: 'Food',
                        isDisabled: false,
                    },
                    {
                        text: 'Food: Meat',
                        keyForList: 'Food: Meat',
                        searchText: 'Food: Meat',
                        tooltipText: 'Food: Meat',
                        isDisabled: false,
                    },
                ],
            },
        ];
        const smallWrongSearchResultList = [
            {
                title: '',
                shouldShow: true,
                indexOffset: 0,
                data: [],
            },
        ];
        const largeCategoriesList = {
            Taxi: {
                enabled: false,
                name: 'Taxi',
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
            'Food: Vegetables': {
                enabled: false,
                name: 'Food: Vegetables',
            },
            'Cars: Audi': {
                enabled: true,
                name: 'Cars: Audi',
            },
            'Cars: BMW': {
                enabled: false,
                name: 'Cars: BMW',
            },
            'Cars: Mercedes-Benz': {
                enabled: true,
                name: 'Cars: Mercedes-Benz',
            },
            Medical: {
                enabled: false,
                name: 'Medical',
            },
            'Travel: Meals': {
                enabled: true,
                name: 'Travel: Meals',
            },
            'Travel: Meals: Breakfast': {
                enabled: true,
                name: 'Travel: Meals: Breakfast',
            },
            'Travel: Meals: Dinner': {
                enabled: false,
                name: 'Travel: Meals: Dinner',
            },
            'Travel: Meals: Lunch': {
                enabled: true,
                name: 'Travel: Meals: Lunch',
            },
        };
        const largeResultList = [
            {
                title: '',
                shouldShow: true,
                indexOffset: 0,
                data: [
                    {
                        text: 'Medical',
                        keyForList: 'Medical',
                        searchText: 'Medical',
                        tooltipText: 'Medical',
                        isDisabled: false,
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
                    },
                ],
            },
            {
                title: 'All',
                shouldShow: true,
                indexOffset: 2,
                data: [
                    {
                        text: 'Cars',
                        keyForList: 'Cars',
                        searchText: 'Cars',
                        tooltipText: 'Cars',
                        isDisabled: true,
                    },
                    {
                        text: '    Audi',
                        keyForList: 'Cars: Audi',
                        searchText: 'Cars: Audi',
                        tooltipText: 'Audi',
                        isDisabled: false,
                    },
                    {
                        text: '    Mercedes-Benz',
                        keyForList: 'Cars: Mercedes-Benz',
                        searchText: 'Cars: Mercedes-Benz',
                        tooltipText: 'Mercedes-Benz',
                        isDisabled: false,
                    },
                    {
                        text: 'Food',
                        keyForList: 'Food',
                        searchText: 'Food',
                        tooltipText: 'Food',
                        isDisabled: false,
                    },
                    {
                        text: '    Meat',
                        keyForList: 'Food: Meat',
                        searchText: 'Food: Meat',
                        tooltipText: 'Meat',
                        isDisabled: false,
                    },
                    {
                        text: '    Milk',
                        keyForList: 'Food: Milk',
                        searchText: 'Food: Milk',
                        tooltipText: 'Milk',
                        isDisabled: false,
                    },
                    {
                        text: 'Restaurant',
                        keyForList: 'Restaurant',
                        searchText: 'Restaurant',
                        tooltipText: 'Restaurant',
                        isDisabled: false,
                    },
                    {
                        text: 'Travel',
                        keyForList: 'Travel',
                        searchText: 'Travel',
                        tooltipText: 'Travel',
                        isDisabled: true,
                    },
                    {
                        text: '    Meals',
                        keyForList: 'Travel: Meals',
                        searchText: 'Travel: Meals',
                        tooltipText: 'Meals',
                        isDisabled: false,
                    },
                    {
                        text: '        Breakfast',
                        keyForList: 'Travel: Meals: Breakfast',
                        searchText: 'Travel: Meals: Breakfast',
                        tooltipText: 'Breakfast',
                        isDisabled: false,
                    },
                    {
                        text: '        Lunch',
                        keyForList: 'Travel: Meals: Lunch',
                        searchText: 'Travel: Meals: Lunch',
                        tooltipText: 'Lunch',
                        isDisabled: false,
                    },
                ],
            },
        ];
        const largeSearchResultList = [
            {
                title: '',
                shouldShow: true,
                indexOffset: 0,
                data: [
                    {
                        text: 'Food',
                        keyForList: 'Food',
                        searchText: 'Food',
                        tooltipText: 'Food',
                        isDisabled: false,
                    },
                    {
                        text: 'Food: Meat',
                        keyForList: 'Food: Meat',
                        searchText: 'Food: Meat',
                        tooltipText: 'Food: Meat',
                        isDisabled: false,
                    },
                    {
                        text: 'Food: Milk',
                        keyForList: 'Food: Milk',
                        searchText: 'Food: Milk',
                        tooltipText: 'Food: Milk',
                        isDisabled: false,
                    },
                ],
            },
        ];
        const largeWrongSearchResultList = [
            {
                title: '',
                shouldShow: true,
                indexOffset: 0,
                data: [],
            },
        ];
        const emptyCategoriesList = {};
        const emptySelectedResultList = [
            {
                title: '',
                shouldShow: false,
                indexOffset: 0,
                data: [
                    {
                        text: 'Medical',
                        keyForList: 'Medical',
                        searchText: 'Medical',
                        tooltipText: 'Medical',
                        isDisabled: false,
                    },
                ],
            },
        ];

        const smallResult = OptionsListUtils.getFilteredOptions(REPORTS, PERSONAL_DETAILS, [], emptySearch, [], [], false, false, true, smallCategoriesList);
        expect(smallResult.categoryOptions).toStrictEqual(smallResultList);

        const smallSearchResult = OptionsListUtils.getFilteredOptions(REPORTS, PERSONAL_DETAILS, [], search, [], [], false, false, true, smallCategoriesList);
        expect(smallSearchResult.categoryOptions).toStrictEqual(smallSearchResultList);

        const smallWrongSearchResult = OptionsListUtils.getFilteredOptions(REPORTS, PERSONAL_DETAILS, [], wrongSearch, [], [], false, false, true, smallCategoriesList);
        expect(smallWrongSearchResult.categoryOptions).toStrictEqual(smallWrongSearchResultList);

        const largeResult = OptionsListUtils.getFilteredOptions(
            REPORTS,
            PERSONAL_DETAILS,
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
            REPORTS,
            PERSONAL_DETAILS,
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
            REPORTS,
            PERSONAL_DETAILS,
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

        const emptyResult = OptionsListUtils.getFilteredOptions(REPORTS, PERSONAL_DETAILS, [], search, selectedOptions, [], false, false, true, emptyCategoriesList);
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
        const smallTagsList = {
            Engineering: {
                enabled: false,
                name: 'Engineering',
            },
            Medical: {
                enabled: true,
                name: 'Medical',
            },
            Accounting: {
                enabled: true,
                name: 'Accounting',
            },
            HR: {
                enabled: true,
                name: 'HR',
            },
        };
        const smallResultList = [
            {
                title: '',
                shouldShow: false,
                indexOffset: 0,
                // data sorted alphabetically by name
                data: [
                    {
                        text: 'Accounting',
                        keyForList: 'Accounting',
                        searchText: 'Accounting',
                        tooltipText: 'Accounting',
                        isDisabled: false,
                    },
                    {
                        text: 'HR',
                        keyForList: 'HR',
                        searchText: 'HR',
                        tooltipText: 'HR',
                        isDisabled: false,
                    },
                    {
                        text: 'Medical',
                        keyForList: 'Medical',
                        searchText: 'Medical',
                        tooltipText: 'Medical',
                        isDisabled: false,
                    },
                ],
            },
        ];
        const smallSearchResultList = [
            {
                title: '',
                shouldShow: true,
                indexOffset: 0,
                data: [
                    {
                        text: 'Accounting',
                        keyForList: 'Accounting',
                        searchText: 'Accounting',
                        tooltipText: 'Accounting',
                        isDisabled: false,
                    },
                ],
            },
        ];
        const smallWrongSearchResultList = [
            {
                title: '',
                shouldShow: true,
                indexOffset: 0,
                data: [],
            },
        ];
        const largeTagsList = {
            Engineering: {
                enabled: false,
                name: 'Engineering',
            },
            Medical: {
                enabled: true,
                name: 'Medical',
            },
            Accounting: {
                enabled: true,
                name: 'Accounting',
            },
            HR: {
                enabled: true,
                name: 'HR',
            },
            Food: {
                enabled: true,
                name: 'Food',
            },
            Traveling: {
                enabled: false,
                name: 'Traveling',
            },
            Cleaning: {
                enabled: true,
                name: 'Cleaning',
            },
            Software: {
                enabled: true,
                name: 'Software',
            },
            OfficeSupplies: {
                enabled: false,
                name: 'Office Supplies',
            },
            Taxes: {
                enabled: true,
                name: 'Taxes',
            },
            Benefits: {
                enabled: true,
                name: 'Benefits',
            },
        };
        const largeResultList = [
            {
                title: '',
                shouldShow: true,
                indexOffset: 0,
                data: [
                    {
                        text: 'Medical',
                        keyForList: 'Medical',
                        searchText: 'Medical',
                        tooltipText: 'Medical',
                        isDisabled: false,
                    },
                ],
            },
            {
                title: 'Recent',
                shouldShow: true,
                indexOffset: 1,
                data: [
                    {
                        text: 'HR',
                        keyForList: 'HR',
                        searchText: 'HR',
                        tooltipText: 'HR',
                        isDisabled: false,
                    },
                ],
            },
            {
                title: 'All',
                shouldShow: true,
                indexOffset: 2,
                // data sorted alphabetically by name
                data: [
                    {
                        text: 'Accounting',
                        keyForList: 'Accounting',
                        searchText: 'Accounting',
                        tooltipText: 'Accounting',
                        isDisabled: false,
                    },
                    {
                        text: 'Benefits',
                        keyForList: 'Benefits',
                        searchText: 'Benefits',
                        tooltipText: 'Benefits',
                        isDisabled: false,
                    },
                    {
                        text: 'Cleaning',
                        keyForList: 'Cleaning',
                        searchText: 'Cleaning',
                        tooltipText: 'Cleaning',
                        isDisabled: false,
                    },
                    {
                        text: 'Food',
                        keyForList: 'Food',
                        searchText: 'Food',
                        tooltipText: 'Food',
                        isDisabled: false,
                    },
                    {
                        text: 'HR',
                        keyForList: 'HR',
                        searchText: 'HR',
                        tooltipText: 'HR',
                        isDisabled: false,
                    },
                    {
                        text: 'Software',
                        keyForList: 'Software',
                        searchText: 'Software',
                        tooltipText: 'Software',
                        isDisabled: false,
                    },
                    {
                        text: 'Taxes',
                        keyForList: 'Taxes',
                        searchText: 'Taxes',
                        tooltipText: 'Taxes',
                        isDisabled: false,
                    },
                ],
            },
        ];
        const largeSearchResultList = [
            {
                title: '',
                shouldShow: true,
                indexOffset: 0,
                data: [
                    {
                        text: 'Accounting',
                        keyForList: 'Accounting',
                        searchText: 'Accounting',
                        tooltipText: 'Accounting',
                        isDisabled: false,
                    },
                    {
                        text: 'Cleaning',
                        keyForList: 'Cleaning',
                        searchText: 'Cleaning',
                        tooltipText: 'Cleaning',
                        isDisabled: false,
                    },
                ],
            },
        ];
        const largeWrongSearchResultList = [
            {
                title: '',
                shouldShow: true,
                indexOffset: 0,
                data: [],
            },
        ];

        const smallResult = OptionsListUtils.getFilteredOptions(REPORTS, PERSONAL_DETAILS, [], emptySearch, [], [], false, false, false, {}, [], true, smallTagsList);
        expect(smallResult.tagOptions).toStrictEqual(smallResultList);

        const smallSearchResult = OptionsListUtils.getFilteredOptions(REPORTS, PERSONAL_DETAILS, [], search, [], [], false, false, false, {}, [], true, smallTagsList);
        expect(smallSearchResult.tagOptions).toStrictEqual(smallSearchResultList);

        const smallWrongSearchResult = OptionsListUtils.getFilteredOptions(REPORTS, PERSONAL_DETAILS, [], wrongSearch, [], [], false, false, false, {}, [], true, smallTagsList);
        expect(smallWrongSearchResult.tagOptions).toStrictEqual(smallWrongSearchResultList);

        const largeResult = OptionsListUtils.getFilteredOptions(
            REPORTS,
            PERSONAL_DETAILS,
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
            REPORTS,
            PERSONAL_DETAILS,
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
            REPORTS,
            PERSONAL_DETAILS,
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
            },
            {
                text: 'Restaurant',
                keyForList: 'Restaurant',
                searchText: 'Restaurant',
                tooltipText: 'Restaurant',
                isDisabled: false,
            },
            {
                text: 'Food',
                keyForList: 'Food',
                searchText: 'Food',
                tooltipText: 'Food',
                isDisabled: false,
            },
            {
                text: '    Meat',
                keyForList: 'Food: Meat',
                searchText: 'Food: Meat',
                tooltipText: 'Meat',
                isDisabled: false,
            },
            {
                text: '    Milk',
                keyForList: 'Food: Milk',
                searchText: 'Food: Milk',
                tooltipText: 'Milk',
                isDisabled: false,
            },
            {
                text: 'Cars',
                keyForList: 'Cars',
                searchText: 'Cars',
                tooltipText: 'Cars',
                isDisabled: true,
            },
            {
                text: '    Audi',
                keyForList: 'Cars: Audi',
                searchText: 'Cars: Audi',
                tooltipText: 'Audi',
                isDisabled: false,
            },
            {
                text: '    Mercedes-Benz',
                keyForList: 'Cars: Mercedes-Benz',
                searchText: 'Cars: Mercedes-Benz',
                tooltipText: 'Mercedes-Benz',
                isDisabled: false,
            },
            {
                text: 'Travel',
                keyForList: 'Travel',
                searchText: 'Travel',
                tooltipText: 'Travel',
                isDisabled: true,
            },
            {
                text: '    Meals',
                keyForList: 'Travel: Meals',
                searchText: 'Travel: Meals',
                tooltipText: 'Meals',
                isDisabled: false,
            },
            {
                text: '        Breakfast',
                keyForList: 'Travel: Meals: Breakfast',
                searchText: 'Travel: Meals: Breakfast',
                tooltipText: 'Breakfast',
                isDisabled: false,
            },
            {
                text: '        Lunch',
                keyForList: 'Travel: Meals: Lunch',
                searchText: 'Travel: Meals: Lunch',
                tooltipText: 'Lunch',
                isDisabled: false,
            },
            {
                text: 'Plain',
                keyForList: 'Plain',
                searchText: 'Plain',
                tooltipText: 'Plain',
                isDisabled: false,
            },
            {
                text: 'Audi',
                keyForList: 'Audi',
                searchText: 'Audi',
                tooltipText: 'Audi',
                isDisabled: false,
            },
            {
                text: 'Health',
                keyForList: 'Health',
                searchText: 'Health',
                tooltipText: 'Health',
                isDisabled: false,
            },
            {
                text: 'A',
                keyForList: 'A',
                searchText: 'A',
                tooltipText: 'A',
                isDisabled: true,
            },
            {
                text: '    B',
                keyForList: 'A: B',
                searchText: 'A: B',
                tooltipText: 'B',
                isDisabled: true,
            },
            {
                text: '        C',
                keyForList: 'A: B: C',
                searchText: 'A: B: C',
                tooltipText: 'C',
                isDisabled: false,
            },
            {
                text: '            D',
                keyForList: 'A: B: C: D',
                searchText: 'A: B: C: D',
                tooltipText: 'D',
                isDisabled: true,
            },
            {
                text: '                E',
                keyForList: 'A: B: C: D: E',
                searchText: 'A: B: C: D: E',
                tooltipText: 'E',
                isDisabled: false,
            },
        ];
        const resultOneLine = [
            {
                text: 'Meals',
                keyForList: 'Meals',
                searchText: 'Meals',
                tooltipText: 'Meals',
                isDisabled: false,
            },
            {
                text: 'Restaurant',
                keyForList: 'Restaurant',
                searchText: 'Restaurant',
                tooltipText: 'Restaurant',
                isDisabled: false,
            },
            {
                text: 'Food',
                keyForList: 'Food',
                searchText: 'Food',
                tooltipText: 'Food',
                isDisabled: false,
            },
            {
                text: 'Food: Meat',
                keyForList: 'Food: Meat',
                searchText: 'Food: Meat',
                tooltipText: 'Food: Meat',
                isDisabled: false,
            },
            {
                text: 'Food: Milk',
                keyForList: 'Food: Milk',
                searchText: 'Food: Milk',
                tooltipText: 'Food: Milk',
                isDisabled: false,
            },
            {
                text: 'Cars: Audi',
                keyForList: 'Cars: Audi',
                searchText: 'Cars: Audi',
                tooltipText: 'Cars: Audi',
                isDisabled: false,
            },
            {
                text: 'Cars: Mercedes-Benz',
                keyForList: 'Cars: Mercedes-Benz',
                searchText: 'Cars: Mercedes-Benz',
                tooltipText: 'Cars: Mercedes-Benz',
                isDisabled: false,
            },
            {
                text: 'Travel: Meals',
                keyForList: 'Travel: Meals',
                searchText: 'Travel: Meals',
                tooltipText: 'Travel: Meals',
                isDisabled: false,
            },
            {
                text: 'Travel: Meals: Breakfast',
                keyForList: 'Travel: Meals: Breakfast',
                searchText: 'Travel: Meals: Breakfast',
                tooltipText: 'Travel: Meals: Breakfast',
                isDisabled: false,
            },
            {
                text: 'Travel: Meals: Lunch',
                keyForList: 'Travel: Meals: Lunch',
                searchText: 'Travel: Meals: Lunch',
                tooltipText: 'Travel: Meals: Lunch',
                isDisabled: false,
            },
            {
                text: 'Plain',
                keyForList: 'Plain',
                searchText: 'Plain',
                tooltipText: 'Plain',
                isDisabled: false,
            },
            {
                text: 'Audi',
                keyForList: 'Audi',
                searchText: 'Audi',
                tooltipText: 'Audi',
                isDisabled: false,
            },
            {
                text: 'Health',
                keyForList: 'Health',
                searchText: 'Health',
                tooltipText: 'Health',
                isDisabled: false,
            },
            {
                text: 'A: B: C',
                keyForList: 'A: B: C',
                searchText: 'A: B: C',
                tooltipText: 'A: B: C',
                isDisabled: false,
            },
            {
                text: 'A: B: C: D: E',
                keyForList: 'A: B: C: D: E',
                searchText: 'A: B: C: D: E',
                tooltipText: 'A: B: C: D: E',
                isDisabled: false,
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

    it('formatMemberForList()', () => {
        const formattedMembers = _.map(PERSONAL_DETAILS, (personalDetail, key) => OptionsListUtils.formatMemberForList(personalDetail, {isSelected: key === '1'}));

        // We're only formatting items inside the array, so the order should be the same as the original PERSONAL_DETAILS array
        expect(formattedMembers[0].text).toBe('Mister Fantastic');
        expect(formattedMembers[1].text).toBe('Iron Man');
        expect(formattedMembers[2].text).toBe('Spider-Man');

        // We should expect only the first item to be selected
        expect(formattedMembers[0].isSelected).toBe(true);

        // And all the others to be unselected
        expect(_.every(formattedMembers.slice(1), (personalDetail) => !personalDetail.isSelected)).toBe(true);

        // `isDisabled` is always false
        expect(_.every(formattedMembers, (personalDetail) => !personalDetail.isDisabled)).toBe(true);

        // `rightElement` is always null
        expect(_.every(formattedMembers, (personalDetail) => personalDetail.rightElement === null)).toBe(true);

        // Passing a config should override the other keys
        const formattedMembersWithRightElement = _.map(PERSONAL_DETAILS, (personalDetail) => OptionsListUtils.formatMemberForList(personalDetail, {rightElement: <View />}));
        expect(_.every(formattedMembersWithRightElement, (personalDetail) => Boolean(personalDetail.rightElement))).toBe(true);
    });
});
