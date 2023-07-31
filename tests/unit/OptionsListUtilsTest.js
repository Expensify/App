import _ from 'underscore';
import Onyx from 'react-native-onyx';
import * as OptionsListUtils from '../../src/libs/OptionsListUtils';
import ONYXKEYS from '../../src/ONYXKEYS';
import waitForPromisesToResolve from '../utils/waitForPromisesToResolve';
import CONST from '../../src/CONST';

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
        },
        2: {
            lastReadTime: '2021-01-14 11:25:39.296',
            lastVisibleActionCreated: '2022-11-22 03:26:02.016',
            isPinned: false,
            reportID: 2,
            participantAccountIDs: [3],
            reportName: 'Spider-Man',
        },

        // This is the only report we are pinning in this test
        3: {
            lastReadTime: '2021-01-14 11:25:39.297',
            lastVisibleActionCreated: '2022-11-22 03:26:02.170',
            isPinned: true,
            reportID: 3,
            participantAccountIDs: [1],
            reportName: 'Mister Fantastic',
        },
        4: {
            lastReadTime: '2021-01-14 11:25:39.298',
            lastVisibleActionCreated: '2022-11-22 03:26:02.180',
            isPinned: false,
            reportID: 4,
            participantAccountIDs: [4],
            reportName: 'Black Panther',
        },
        5: {
            lastReadTime: '2021-01-14 11:25:39.299',
            lastVisibleActionCreated: '2022-11-22 03:26:02.019',
            isPinned: false,
            reportID: 5,
            participantAccountIDs: [5],
            reportName: 'Invisible Woman',
        },
        6: {
            lastReadTime: '2021-01-14 11:25:39.300',
            lastVisibleActionCreated: '2022-11-22 03:26:02.020',
            isPinned: false,
            reportID: 6,
            participantAccountIDs: [6],
            reportName: 'Thor',
        },

        // Note: This report has the largest lastVisibleActionCreated
        7: {
            lastReadTime: '2021-01-14 11:25:39.301',
            lastVisibleActionCreated: '2022-11-22 03:26:03.999',
            isPinned: false,
            reportID: 7,
            participantAccountIDs: [7],
            reportName: 'Captain America',
        },

        // Note: This report has no lastVisibleActionCreated
        8: {
            lastReadTime: '2021-01-14 11:25:39.301',
            lastVisibleActionCreated: '2022-11-22 03:26:02.000',
            isPinned: false,
            reportID: 8,
            participantAccountIDs: [12],
            reportName: 'Silver Surfer',
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
        return waitForPromisesToResolve().then(() => Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, PERSONAL_DETAILS));
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

        return waitForPromisesToResolve()
            .then(() => Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, PERSONAL_DETAILS_WITH_PERIODS))
            .then(() => {
                // When we filter again but provide a searchValue that should match with periods
                results = OptionsListUtils.getSearchOptions(REPORTS, PERSONAL_DETAILS_WITH_PERIODS, 'barry.allen@expensify.com');

                // Then we expect to have the personal detail with period filtered
                expect(results.recentReports.length).toBe(1);
                expect(results.recentReports[0].text).toBe('The Flash');
            });
    });

    it('getNewChatOptions()', () => {
        // maxRecentReportsToShow in src/libs/OptionsListUtils.js
        const MAX_RECENT_REPORTS = 5;

        // When we call getNewChatOptions() with no search value
        let results = OptionsListUtils.getNewChatOptions(REPORTS, PERSONAL_DETAILS, [], '');

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
        results = OptionsListUtils.getNewChatOptions([], PERSONAL_DETAILS, [], '');

        // We should expect personal details sorted alphabetically
        expect(results.personalDetails[0].text).toBe('Black Panther');
        expect(results.personalDetails[1].text).toBe('Black Widow');
        expect(results.personalDetails[2].text).toBe('Captain America');
        expect(results.personalDetails[3].text).toBe('Invisible Woman');

        // When we provide a search value that does not match any personal details
        results = OptionsListUtils.getNewChatOptions(REPORTS, PERSONAL_DETAILS, [], 'magneto');

        // Then no options will be returned
        expect(results.personalDetails.length).toBe(0);

        // When we provide a search value that matches an email
        results = OptionsListUtils.getNewChatOptions(REPORTS, PERSONAL_DETAILS, [], 'peterparker@expensify.com');

        // Then one recentReports will be returned and it will be the correct option
        // personalDetails should be empty array
        expect(results.recentReports.length).toBe(1);
        expect(results.recentReports[0].text).toBe('Spider-Man');
        expect(results.personalDetails.length).toBe(0);

        // When we provide a search value that matches a partial display name or email
        results = OptionsListUtils.getNewChatOptions(REPORTS, PERSONAL_DETAILS, [], '.com');

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
        results = OptionsListUtils.getNewChatOptions(REPORTS_WITH_CONCIERGE, PERSONAL_DETAILS_WITH_CONCIERGE);

        // Concierge is included in the results by default. We should expect all the personalDetails to show
        // (minus the 5 that are already showing and the currently logged in user)
        expect(results.personalDetails.length).toBe(_.size(PERSONAL_DETAILS_WITH_CONCIERGE) - 1 - MAX_RECENT_REPORTS);
        expect(results.recentReports).toEqual(expect.arrayContaining([expect.objectContaining({login: 'concierge@expensify.com'})]));

        // Test by excluding Concierge from the results
        results = OptionsListUtils.getNewChatOptions(REPORTS_WITH_CONCIERGE, PERSONAL_DETAILS_WITH_CONCIERGE, [], '', [], [CONST.EMAIL.CONCIERGE]);

        // All the personalDetails should be returned minus the currently logged in user and Concierge
        expect(results.personalDetails.length).toBe(_.size(PERSONAL_DETAILS_WITH_CONCIERGE) - 2 - MAX_RECENT_REPORTS);
        expect(results.personalDetails).not.toEqual(expect.arrayContaining([expect.objectContaining({login: 'concierge@expensify.com'})]));

        // Test by excluding Chronos from the results
        results = OptionsListUtils.getNewChatOptions(REPORTS_WITH_CHRONOS, PERSONAL_DETAILS_WITH_CHRONOS, [], '', [], [CONST.EMAIL.CHRONOS]);

        // All the personalDetails should be returned minus the currently logged in user and Concierge
        expect(results.personalDetails.length).toBe(_.size(PERSONAL_DETAILS_WITH_CHRONOS) - 2 - MAX_RECENT_REPORTS);
        expect(results.personalDetails).not.toEqual(expect.arrayContaining([expect.objectContaining({login: 'chronos@expensify.com'})]));

        // Test by excluding Receipts from the results
        results = OptionsListUtils.getNewChatOptions(REPORTS_WITH_RECEIPTS, PERSONAL_DETAILS_WITH_RECEIPTS, [], '', [], [CONST.EMAIL.RECEIPTS]);

        // All the personalDetails should be returned minus the currently logged in user and Concierge
        expect(results.personalDetails.length).toBe(_.size(PERSONAL_DETAILS_WITH_RECEIPTS) - 2 - MAX_RECENT_REPORTS);
        expect(results.personalDetails).not.toEqual(expect.arrayContaining([expect.objectContaining({login: 'receipts@expensify.com'})]));
    });

    it('getNewChatOptions() for group Chat', () => {
        // When we call getNewChatOptions() with no search value
        let results = OptionsListUtils.getNewChatOptions(REPORTS, PERSONAL_DETAILS, [], '');

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
        results = OptionsListUtils.getNewChatOptions(REPORTS, PERSONAL_DETAILS, [], 'hulk');

        // Then reports should return no results
        expect(results.recentReports.length).toBe(0);

        // And personalDetails should show just one option and it will be the one we expect
        expect(results.personalDetails.length).toBe(1);
        expect(results.personalDetails[0].login).toBe('brucebanner@expensify.com');

        // When we search for an option that matches things in both personalDetails and reports
        results = OptionsListUtils.getNewChatOptions(REPORTS, PERSONAL_DETAILS, [], '.com');

        // Then all single participant reports that match will show up in the recentReports array, Recently used contact should be at the top
        expect(results.recentReports.length).toBe(5);
        expect(results.recentReports[0].text).toBe('Captain America');

        // And logins with no single participant reports will show up in personalDetails
        expect(results.personalDetails.length).toBe(4);
        expect(results.personalDetails[0].login).toBe('natasharomanoff@expensify.com');

        // When we provide no selected options to getNewChatOptions()
        results = OptionsListUtils.getNewChatOptions(REPORTS, PERSONAL_DETAILS, [], '', []);

        // Then one of our older report options (not in our five most recent) should appear in the personalDetails
        // but not in recentReports
        expect(_.every(results.recentReports, (option) => option.login !== 'peterparker@expensify.com')).toBe(true);
        expect(_.every(results.personalDetails, (option) => option.login !== 'peterparker@expensify.com')).toBe(false);

        // When we provide a "selected" option to getNewChatOptions()
        results = OptionsListUtils.getNewChatOptions(REPORTS, PERSONAL_DETAILS, [], '', [{login: 'peterparker@expensify.com'}]);

        // Then the option should not appear anywhere in either list
        expect(_.every(results.recentReports, (option) => option.login !== 'peterparker@expensify.com')).toBe(true);
        expect(_.every(results.personalDetails, (option) => option.login !== 'peterparker@expensify.com')).toBe(true);

        // When we add a search term for which no options exist and the searchValue itself
        // is not a potential email or phone
        results = OptionsListUtils.getNewChatOptions(REPORTS, PERSONAL_DETAILS, [], 'marc@expensify');

        // Then we should have no options or personal details at all and also that there is no userToInvite
        expect(results.recentReports.length).toBe(0);
        expect(results.personalDetails.length).toBe(0);
        expect(results.userToInvite).toBe(null);

        // When we add a search term for which no options exist and the searchValue itself
        // is a potential email
        results = OptionsListUtils.getNewChatOptions(REPORTS, PERSONAL_DETAILS, [], 'marc@expensify.com');

        // Then we should have no options or personal details at all but there should be a userToInvite
        expect(results.recentReports.length).toBe(0);
        expect(results.personalDetails.length).toBe(0);
        expect(results.userToInvite).not.toBe(null);

        // When we add a search term with a period, with options for it that don't contain the period
        results = OptionsListUtils.getNewChatOptions(REPORTS, PERSONAL_DETAILS, [], 'peter.parker@expensify.com');

        // Then we should have no options at all but there should be a userToInvite
        expect(results.recentReports.length).toBe(0);
        expect(results.userToInvite).not.toBe(null);

        // When we add a search term for which no options exist and the searchValue itself
        // is a potential phone number without country code added
        results = OptionsListUtils.getNewChatOptions(REPORTS, PERSONAL_DETAILS, [], '5005550006');

        // Then we should have no options or personal details at all but there should be a userToInvite and the login
        // should have the country code included
        expect(results.recentReports.length).toBe(0);
        expect(results.personalDetails.length).toBe(0);
        expect(results.userToInvite).not.toBe(null);
        expect(results.userToInvite.login).toBe('+15005550006');

        // When we add a search term for which no options exist and the searchValue itself
        // is a potential phone number with country code added
        results = OptionsListUtils.getNewChatOptions(REPORTS, PERSONAL_DETAILS, [], '+15005550006');

        // Then we should have no options or personal details at all but there should be a userToInvite and the login
        // should have the country code included
        expect(results.recentReports.length).toBe(0);
        expect(results.personalDetails.length).toBe(0);
        expect(results.userToInvite).not.toBe(null);
        expect(results.userToInvite.login).toBe('+15005550006');

        // When we add a search term for which no options exist and the searchValue itself
        // is a potential phone number with special characters added
        results = OptionsListUtils.getNewChatOptions(REPORTS, PERSONAL_DETAILS, [], '+1 (800)324-3233');

        // Then we should have no options or personal details at all but there should be a userToInvite and the login
        // should have the country code included
        expect(results.recentReports.length).toBe(0);
        expect(results.personalDetails.length).toBe(0);
        expect(results.userToInvite).not.toBe(null);
        expect(results.userToInvite.login).toBe('+18003243233');

        // When we use a search term for contact number that contains alphabet characters
        results = OptionsListUtils.getNewChatOptions(REPORTS, PERSONAL_DETAILS, [], '998243aaaa');

        // Then we shouldn't have any results or user to invite
        expect(results.recentReports.length).toBe(0);
        expect(results.personalDetails.length).toBe(0);
        expect(results.userToInvite).toBe(null);

        // Test Concierge's existence in new group options
        results = OptionsListUtils.getNewChatOptions(REPORTS_WITH_CONCIERGE, PERSONAL_DETAILS_WITH_CONCIERGE);

        // Concierge is included in the results by default. We should expect all the personalDetails to show
        // (minus the 5 that are already showing and the currently logged in user)
        expect(results.personalDetails.length).toBe(_.size(PERSONAL_DETAILS_WITH_CONCIERGE) - 6);
        expect(results.recentReports).toEqual(expect.arrayContaining([expect.objectContaining({login: 'concierge@expensify.com'})]));

        // Test by excluding Concierge from the results
        results = OptionsListUtils.getNewChatOptions(REPORTS_WITH_CONCIERGE, PERSONAL_DETAILS_WITH_CONCIERGE, [], '', [], [CONST.EMAIL.CONCIERGE]);

        // We should expect all the personalDetails to show (minus the 5 that are already showing,
        // the currently logged in user and Concierge)
        expect(results.personalDetails.length).toBe(_.size(PERSONAL_DETAILS_WITH_CONCIERGE) - 7);
        expect(results.personalDetails).not.toEqual(expect.arrayContaining([expect.objectContaining({login: 'concierge@expensify.com'})]));
        expect(results.recentReports).not.toEqual(expect.arrayContaining([expect.objectContaining({login: 'concierge@expensify.com'})]));

        // Test by excluding Chronos from the results
        results = OptionsListUtils.getNewChatOptions(REPORTS_WITH_CHRONOS, PERSONAL_DETAILS_WITH_CHRONOS, [], '', [], [CONST.EMAIL.CHRONOS]);

        // We should expect all the personalDetails to show (minus the 5 that are already showing,
        // the currently logged in user and Concierge)
        expect(results.personalDetails.length).toBe(_.size(PERSONAL_DETAILS_WITH_CHRONOS) - 7);
        expect(results.personalDetails).not.toEqual(expect.arrayContaining([expect.objectContaining({login: 'chronos@expensify.com'})]));
        expect(results.recentReports).not.toEqual(expect.arrayContaining([expect.objectContaining({login: 'chronos@expensify.com'})]));

        // Test by excluding Receipts from the results
        results = OptionsListUtils.getNewChatOptions(REPORTS_WITH_RECEIPTS, PERSONAL_DETAILS_WITH_RECEIPTS, [], '', [], [CONST.EMAIL.RECEIPTS]);

        // We should expect all the personalDetails to show (minus the 5 that are already showing,
        // the currently logged in user and Concierge)
        expect(results.personalDetails.length).toBe(_.size(PERSONAL_DETAILS_WITH_RECEIPTS) - 7);
        expect(results.personalDetails).not.toEqual(expect.arrayContaining([expect.objectContaining({login: 'receipts@expensify.com'})]));
        expect(results.recentReports).not.toEqual(expect.arrayContaining([expect.objectContaining({login: 'receipts@expensify.com'})]));
    });

    it('getShareDestinationsOptions()', () => {
        // When we pass an empty search value
        let results = OptionsListUtils.getShareDestinationOptions(REPORTS, PERSONAL_DETAILS, [], '');

        // Then we should expect 5 recent reports to show because we're grabbing DM chats and group chats
        // because we've limited the number of recent reports to 5
        expect(results.recentReports.length).toBe(5);

        // When we pass a search value that doesn't match the group chat name
        results = OptionsListUtils.getShareDestinationOptions(REPORTS, PERSONAL_DETAILS, [], 'mutants');

        // Then we should expect no recent reports to show
        expect(results.recentReports.length).toBe(0);

        // When we pass a search value that matches the group chat name
        results = OptionsListUtils.getShareDestinationOptions(REPORTS, PERSONAL_DETAILS, [], 'Iron Man, Fantastic');

        // Then we should expect the group chat to show along with the contacts matching the search
        expect(results.recentReports.length).toBe(1);

        // When we also have a policy to return rooms in the results
        results = OptionsListUtils.getShareDestinationOptions(REPORTS_WITH_WORKSPACE_ROOMS, PERSONAL_DETAILS, [], '');

        // Then we should expect the DMS, the group chats and the workspace room to show
        // We should expect 5 recent reports to show because we've limited the number of recent reports to 5
        expect(results.recentReports.length).toBe(5);

        // When we search for a workspace room
        results = OptionsListUtils.getShareDestinationOptions(REPORTS_WITH_WORKSPACE_ROOMS, PERSONAL_DETAILS, [], 'Avengers Room');

        // Then we should expect only the workspace room to show
        expect(results.recentReports.length).toBe(1);

        // When we search for a workspace room that doesn't exist
        results = OptionsListUtils.getShareDestinationOptions(REPORTS_WITH_WORKSPACE_ROOMS, PERSONAL_DETAILS, [], 'Mutants Lair');

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
});
