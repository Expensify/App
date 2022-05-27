import _ from 'underscore';
import Onyx from 'react-native-onyx';
import * as OptionsListUtils from '../../src/libs/OptionsListUtils';
import ONYXKEYS from '../../src/ONYXKEYS';
import waitForPromisesToResolve from '../utils/waitForPromisesToResolve';
import CONST from '../../src/CONST';
import * as Report from '../../src/libs/actions/Report';

describe('OptionsListUtils', () => {
    // Given a set of reports with both single participants and multiple participants some pinned and some not
    const REPORTS = {
        1: {
            lastVisitedTimestamp: 1610666739295,
            lastMessageTimestamp: 1,
            isPinned: false,
            reportID: 1,
            participants: ['tonystark@expensify.com', 'reedrichards@expensify.com'],
            reportName: 'Iron Man, Mister Fantastic',
            unreadActionCount: 1,
        },
        2: {
            lastVisitedTimestamp: 1610666739296,
            lastMessageTimestamp: 1,
            isPinned: false,
            reportID: 2,
            participants: ['peterparker@expensify.com'],
            reportName: 'Spider-Man',
            unreadActionCount: 1,
        },

        // This is the only report we are pinning in this test
        3: {
            lastVisitedTimestamp: 1610666739297,
            lastMessageTimestamp: 1,
            isPinned: true,
            reportID: 3,
            participants: ['reedrichards@expensify.com'],
            reportName: 'Mister Fantastic',
            unreadActionCount: 0,
        },
        4: {
            lastVisitedTimestamp: 1610666739298,
            lastMessageTimestamp: 1,
            isPinned: false,
            reportID: 4,
            participants: ['tchalla@expensify.com'],
            reportName: 'Black Panther',
            unreadActionCount: 1,
        },
        5: {
            lastVisitedTimestamp: 1610666739299,
            lastMessageTimestamp: 1,
            isPinned: false,
            reportID: 5,
            participants: ['suestorm@expensify.com'],
            reportName: 'Invisible Woman',
            unreadActionCount: 1,
        },
        6: {
            lastVisitedTimestamp: 1610666739300,
            lastMessageTimestamp: 1,
            isPinned: false,
            reportID: 6,
            participants: ['thor@expensify.com'],
            reportName: 'Thor',
            unreadActionCount: 0,
        },

        // Note: This report has the largest lastMessageTimestamp
        7: {
            lastVisitedTimestamp: 1610666739301,
            lastMessageTimestamp: 1611282169,
            isPinned: false,
            reportID: 7,
            participants: ['steverogers@expensify.com'],
            reportName: 'Captain America',
            unreadActionCount: 1,
        },

        // Note: This report has no lastMessageTimestamp
        8: {
            lastVisitedTimestamp: 1610666739301,
            lastMessageTimestamp: 0,
            isPinned: false,
            reportID: 8,
            participants: ['galactus_herald@expensify.com'],
            reportName: 'Silver Surfer',
            unreadActionCount: 0,
        },

        // Note: This report has an IOU
        9: {
            lastVisitedTimestamp: 1610666739302,
            lastMessageTimestamp: 1611282168,
            isPinned: false,
            reportID: 9,
            participants: ['mistersinister@marauders.com'],
            reportName: 'Mister Sinister',
            unreadActionCount: 0,
            iouReportID: 100,
            hasOutstandingIOU: true,
        },

        // This report is an archived room – it does not have a name and instead falls back on oldPolicyName
        10: {
            lastVisitedTimestamp: 1610666739200,
            lastMessageTimestamp: 1,
            reportID: 10,
            isPinned: false,
            participants: ['captain_britain@expensify.com', 'captain_america@expensify.com'],
            reportName: '',
            oldPolicyName: "SHIELD's workspace",
            chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
            isOwnPolicyExpenseChat: true,
        },
    };

    // And a set of personalDetails some with existing reports and some without
    const PERSONAL_DETAILS = {
        // These exist in our reports
        'reedrichards@expensify.com': {
            displayName: 'Mister Fantastic',
            login: 'reedrichards@expensify.com',
        },
        'tonystark@expensify.com': {
            displayName: 'Iron Man',
            login: 'tonystark@expensify.com',
        },
        'peterparker@expensify.com': {
            displayName: 'Spider-Man',
            login: 'peterparker@expensify.com',
        },
        'tchalla@expensify.com': {
            displayName: 'Black Panther',
            login: 'tchalla@expensify.com',
        },
        'suestorm@expensify.com': {
            displayName: 'Invisible Woman',
            login: 'suestorm@expensify.com',
        },
        'thor@expensify.com': {
            displayName: 'Thor',
            login: 'thor@expensify.com',
        },
        'steverogers@expensify.com': {
            displayName: 'Captain America',
            login: 'steverogers@expensify.com',
        },
        'mistersinister@marauders.com': {
            displayName: 'Mr Sinister',
            login: 'mistersinister@marauders.com',
        },

        // These do not exist in reports at all
        'natasharomanoff@expensify.com': {
            displayName: 'Black Widow',
            login: 'natasharomanoff@expensify.com',
        },
        'brucebanner@expensify.com': {
            displayName: 'The Incredible Hulk',
            login: 'brucebanner@expensify.com',
        },
    };

    const REPORTS_WITH_CONCIERGE = {
        ...REPORTS,

        11: {
            lastVisitedTimestamp: 1610666739302,
            lastMessageTimestamp: 1,
            isPinned: false,
            reportID: 11,
            participants: ['concierge@expensify.com'],
            reportName: 'Concierge',
            unreadActionCount: 1,
        },
    };

    const REPORTS_WITH_CHRONOS = {
        ...REPORTS,
        12: {
            lastVisitedTimestamp: 1610666739302,
            lastMessageTimestamp: 1,
            isPinned: false,
            reportID: 12,
            participants: ['chronos@expensify.com'],
            reportName: 'Chronos',
            unreadActionCount: 1,
        },
    };

    const REPORTS_WITH_RECEIPTS = {
        ...REPORTS,
        13: {
            lastVisitedTimestamp: 1610666739302,
            lastMessageTimestamp: 1,
            isPinned: false,
            reportID: 13,
            participants: ['receipts@expensify.com'],
            reportName: 'Receipts',
            unreadActionCount: 1,
        },
    };

    const REPORTS_WITH_MORE_PINS = {
        ...REPORTS,
        14: {
            lastVisitedTimestamp: 1610666739302,
            lastMessageTimestamp: 1,
            isPinned: true,
            reportID: 14,
            participants: ['d_email@email.com'],
            reportName: 'D report name',
            unreadActionCount: 0,
        },
        15: {
            lastVisitedTimestamp: 1610666732302,
            lastMessageTimestamp: 1,
            isPinned: true,
            reportID: 15,
            participants: ['z_email@email.com'],
            reportName: 'Z Report Name',
            unreadActionCount: 0,
        },
    };

    const PERSONAL_DETAILS_WITH_CONCIERGE = {
        ...PERSONAL_DETAILS,

        'concierge@expensify.com': {
            displayName: 'Concierge',
            login: 'concierge@expensify.com',
        },
    };

    const PERSONAL_DETAILS_WITH_CHRONOS = {
        ...PERSONAL_DETAILS,

        'chronos@expensify.com': {
            displayName: 'Chronos',
            login: 'chronos@expensify.com',
        },
    };

    const PERSONAL_DETAILS_WITH_RECEIPTS = {
        ...PERSONAL_DETAILS,

        'receipts@expensify.com': {
            displayName: 'Receipts',
            login: 'receipts@expensify.com',
        },
    };

    const PERSONAL_DETAILS_WITH_PERIODS = {
        ...PERSONAL_DETAILS,

        'barry.allen@expensify.com': {
            displayName: 'The Flash',
            login: 'barry.allen@expensify.com',
        },
    };

    const POLICY = {
        policyID: 'ABC123',
        name: 'Hero Policy',
    }

    // Set the currently logged in user, report data, and personal details
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
            initialKeyStates: {
                [ONYXKEYS.SESSION]: {email: 'tonystark@expensify.com'},
                [`${ONYXKEYS.COLLECTION.REPORT_IOUS}100`]: {
                    ownerEmail: 'mistersinister@marauders.com',
                    total: '1000',
                },
                [`${ONYXKEYS.COLLECTION.POLICY}${POLICY.policyID}`]: POLICY
            },
        });
        Onyx.registerLogger(() => {});
        return waitForPromisesToResolve();
    });

    it('getSearchOptions()', () => {
        // When we filter in the Search view without providing a searchValue
        let results = OptionsListUtils.getSearchOptions(REPORTS, PERSONAL_DETAILS, '');

        // Then the 2 personalDetails that don't have reports should be returned
        expect(results.personalDetails.length).toBe(2);

        // Then all of the reports should be shown, including the one that has no message on them.
        expect(results.recentReports.length).toBe(_.size(REPORTS));

        // When we filter again but provide a searchValue
        results = OptionsListUtils.getSearchOptions(REPORTS, PERSONAL_DETAILS, 'spider');

        // Then only one option should be returned and it's the one matching the search value
        expect(results.recentReports.length).toBe(1);
        expect(results.recentReports[0].login).toBe('peterparker@expensify.com');

        // When we filter again but provide a searchValue that should match multiple times
        results = OptionsListUtils.getSearchOptions(REPORTS, PERSONAL_DETAILS, 'fantastic');

        // Then we get both values with the pinned value still on top
        expect(results.recentReports.length).toBe(2);
        expect(results.recentReports[0].text).toBe('Mister Fantastic');

        // When we filter again but provide a searchValue that should match with periods
        results = OptionsListUtils.getSearchOptions(REPORTS, PERSONAL_DETAILS_WITH_PERIODS, 'barryallen@expensify.com');

        // Then we expect to have the personal detail with period filtered
        expect(results.recentReports.length).toBe(1);
        expect(results.recentReports[0].text).toBe('The Flash');
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

        // Then the result which has an existing report should also have the reportID attached
        const personalDetailWithExistingReport = _.find(
            results.personalDetails,
            personalDetail => personalDetail.login === 'peterparker@expensify.com',
        );
        expect(personalDetailWithExistingReport.reportID).toBe(2);

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
        results = OptionsListUtils.getNewChatOptions(REPORTS, PERSONAL_DETAILS, [], 'man');

        // Then several options will be returned and they will be each have the search string in their email or name
        // even though the currently logged in user matches they should not show.
        expect(results.personalDetails.length).toBe(1);
        expect(results.recentReports.length).toBe(2);
        expect(results.personalDetails[0].login).toBe('natasharomanoff@expensify.com');
        expect(results.recentReports[0].text).toBe('Invisible Woman');
        expect(results.recentReports[1].text).toBe('Spider-Man');

        // Test for Concierge's existence in chat options
        results = OptionsListUtils.getNewChatOptions(REPORTS_WITH_CONCIERGE, PERSONAL_DETAILS_WITH_CONCIERGE);

        // Concierge is included in the results by default. We should expect all the personalDetails to show
        // (minus the 5 that are already showing and the currently logged in user)
        expect(results.personalDetails.length).toBe(_.size(PERSONAL_DETAILS_WITH_CONCIERGE) - 1 - MAX_RECENT_REPORTS);
        expect(results.recentReports).toEqual(
            expect.arrayContaining([
                expect.objectContaining({login: 'concierge@expensify.com'}),
            ]),
        );

        // Test by excluding Concierge from the results
        results = OptionsListUtils.getNewChatOptions(
            REPORTS_WITH_CONCIERGE, PERSONAL_DETAILS_WITH_CONCIERGE, [], '', [], [CONST.EMAIL.CONCIERGE],
        );

        // All the personalDetails should be returned minus the currently logged in user and Concierge
        expect(results.personalDetails.length).toBe(_.size(PERSONAL_DETAILS_WITH_CONCIERGE) - 2 - MAX_RECENT_REPORTS);
        expect(results.personalDetails).not.toEqual(
            expect.arrayContaining([
                expect.objectContaining({login: 'concierge@expensify.com'}),
            ]),
        );

        // Test by excluding Chronos from the results
        results = OptionsListUtils.getNewChatOptions(
            REPORTS_WITH_CHRONOS, PERSONAL_DETAILS_WITH_CHRONOS, [], '', [], [CONST.EMAIL.CHRONOS],
        );

        // All the personalDetails should be returned minus the currently logged in user and Concierge
        expect(results.personalDetails.length).toBe(_.size(PERSONAL_DETAILS_WITH_CHRONOS) - 2 - MAX_RECENT_REPORTS);
        expect(results.personalDetails).not.toEqual(
            expect.arrayContaining([
                expect.objectContaining({login: 'chronos@expensify.com'}),
            ]),
        );

        // Test by excluding Receipts from the results
        results = OptionsListUtils.getNewChatOptions(
            REPORTS_WITH_RECEIPTS, PERSONAL_DETAILS_WITH_RECEIPTS, [], '', [], [CONST.EMAIL.RECEIPTS],
        );

        // All the personalDetails should be returned minus the currently logged in user and Concierge
        expect(results.personalDetails.length).toBe(_.size(PERSONAL_DETAILS_WITH_RECEIPTS) - 2 - MAX_RECENT_REPORTS);
        expect(results.personalDetails).not.toEqual(
            expect.arrayContaining([
                expect.objectContaining({login: 'receipts@expensify.com'}),
            ]),
        );
    });

    it('getNewChatOptions() for group Chat', () => {
        // When we call getNewChatOptions() with no search value
        let results = OptionsListUtils.getNewChatOptions(REPORTS, PERSONAL_DETAILS, [], '');

        // Then we should expect only a maxmimum of 5 recent reports to be returned
        expect(results.recentReports.length).toBe(5);

        // And we should expect all the personalDetails to show (minus the 5 that are already
        // showing and the currently logged in user)
        expect(results.personalDetails.length).toBe(_.size(PERSONAL_DETAILS) - 6);

        // And none of our personalDetails should include any of the users with recent reports
        const reportLogins = _.map(results.recentReports, reportOption => reportOption.login);
        const personalDetailsOverlapWithReports = _.every(results.personalDetails, (
            personalDetailOption => _.contains(reportLogins, personalDetailOption.login)
        ));
        expect(personalDetailsOverlapWithReports).toBe(false);

        // When we search for an option that is only in a personalDetail with no existing report
        results = OptionsListUtils.getNewChatOptions(REPORTS, PERSONAL_DETAILS, [], 'hulk');

        // Then reports should return no results
        expect(results.recentReports.length).toBe(0);

        // And personalDetails should show just one option and it will be the one we expect
        expect(results.personalDetails.length).toBe(1);
        expect(results.personalDetails[0].login).toBe('brucebanner@expensify.com');

        // When we search for an option that matches things in both personalDetails and reports
        results = OptionsListUtils.getNewChatOptions(REPORTS, PERSONAL_DETAILS, [], 'man');

        // Then all single participant reports that match will show up in the recentReports array
        expect(results.recentReports.length).toBe(2);
        expect(results.recentReports[0].text).toBe('Invisible Woman');
        expect(results.recentReports[1].text).toBe('Spider-Man');

        // And logins with no single participant reports will show up in personalDetails
        expect(results.personalDetails.length).toBe(1);
        expect(results.personalDetails[0].login).toBe('natasharomanoff@expensify.com');

        // When we provide no selected options to getNewChatOptions()
        results = OptionsListUtils.getNewChatOptions(REPORTS, PERSONAL_DETAILS, [], '', []);

        // Then one of our older report options (not in our five most recent) should appear in the personalDetails
        // but not in recentReports
        expect(_.every(results.recentReports, option => option.login !== 'peterparker@expensify.com')).toBe(true);
        expect(_.every(results.personalDetails, option => option.login !== 'peterparker@expensify.com')).toBe(false);

        // When we provide a "selected" option to getNewChatOptions()
        results = OptionsListUtils.getNewChatOptions(
            REPORTS,
            PERSONAL_DETAILS,
            [],
            '',
            [{login: 'peterparker@expensify.com'}],
        );

        // Then the option should not appear anywhere in either list
        expect(_.every(results.recentReports, option => option.login !== 'peterparker@expensify.com')).toBe(true);
        expect(_.every(results.personalDetails, option => option.login !== 'peterparker@expensify.com')).toBe(true);

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

        // When we add a search term for which exist options for it excluding its period.
        results = OptionsListUtils.getNewChatOptions(REPORTS, PERSONAL_DETAILS, [], 'peter.parker@expensify.com');

        // Then we will have an options at all and there should be a userToInvite too.
        expect(results.recentReports.length).toBe(1);
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

        // Test Concierge's existence in new group options
        results = OptionsListUtils.getNewChatOptions(REPORTS_WITH_CONCIERGE, PERSONAL_DETAILS_WITH_CONCIERGE);

        // Concierge is included in the results by default. We should expect all the personalDetails to show
        // (minus the 5 that are already showing and the currently logged in user)
        expect(results.personalDetails.length).toBe(_.size(PERSONAL_DETAILS_WITH_CONCIERGE) - 6);
        expect(results.recentReports).toEqual(
            expect.arrayContaining([
                expect.objectContaining({login: 'concierge@expensify.com'}),
            ]),
        );

        // Test by excluding Concierge from the results
        results = OptionsListUtils.getNewChatOptions(
            REPORTS_WITH_CONCIERGE,
            PERSONAL_DETAILS_WITH_CONCIERGE,
            [],
            '',
            [],
            [CONST.EMAIL.CONCIERGE],
        );

        // We should expect all the personalDetails to show (minus the 5 that are already showing,
        // the currently logged in user and Concierge)
        expect(results.personalDetails.length).toBe(_.size(PERSONAL_DETAILS_WITH_CONCIERGE) - 7);
        expect(results.personalDetails).not.toEqual(
            expect.arrayContaining([
                expect.objectContaining({login: 'concierge@expensify.com'}),
            ]),
        );
        expect(results.recentReports).not.toEqual(
            expect.arrayContaining([
                expect.objectContaining({login: 'concierge@expensify.com'}),
            ]),
        );

        // Test by excluding Chronos from the results
        results = OptionsListUtils.getNewChatOptions(
            REPORTS_WITH_CHRONOS,
            PERSONAL_DETAILS_WITH_CHRONOS,
            [],
            '',
            [],
            [CONST.EMAIL.CHRONOS],
        );

        // We should expect all the personalDetails to show (minus the 5 that are already showing,
        // the currently logged in user and Concierge)
        expect(results.personalDetails.length).toBe(_.size(PERSONAL_DETAILS_WITH_CHRONOS) - 7);
        expect(results.personalDetails).not.toEqual(
            expect.arrayContaining([
                expect.objectContaining({login: 'chronos@expensify.com'}),
            ]),
        );
        expect(results.recentReports).not.toEqual(
            expect.arrayContaining([
                expect.objectContaining({login: 'chronos@expensify.com'}),
            ]),
        );

        // Test by excluding Receipts from the results
        results = OptionsListUtils.getNewChatOptions(
            REPORTS_WITH_RECEIPTS,
            PERSONAL_DETAILS_WITH_RECEIPTS,
            [],
            '',
            [],
            [CONST.EMAIL.RECEIPTS],
        );

        // We should expect all the personalDetails to show (minus the 5 that are already showing,
        // the currently logged in user and Concierge)
        expect(results.personalDetails.length).toBe(_.size(PERSONAL_DETAILS_WITH_RECEIPTS) - 7);
        expect(results.personalDetails).not.toEqual(
            expect.arrayContaining([
                expect.objectContaining({login: 'receipts@expensify.com'}),
            ]),
        );
        expect(results.recentReports).not.toEqual(
            expect.arrayContaining([
                expect.objectContaining({login: 'receipts@expensify.com'}),
            ]),
        );
    });

    it('getSidebarOptions() with default priority mode', () => {
        const reportsWithAddedPinnedMessagelessReport = {
            ...REPORTS,

            // Note: This report has no lastMessageTimestamp but is also pinned
            16: {
                lastVisitedTimestamp: 1610666739300,
                lastMessageTimestamp: 0,
                isPinned: true,
                reportID: 16,
                participants: ['captain_britain@expensify.com'],
                reportName: 'Captain Britain',
            },
        };

        return Report.setReportWithDraft(1, true)
            .then(() => {
                // When we call getSidebarOptions() with no search value and default priority mode
                const results = OptionsListUtils.getSidebarOptions(
                    reportsWithAddedPinnedMessagelessReport,
                    PERSONAL_DETAILS,
                    0,
                    CONST.PRIORITY_MODE.DEFAULT,
                );

                // Then expect all of the reports to be shown both multiple and single participant except the
                // unpinned report that has no lastMessageTimestamp
                expect(results.recentReports.length).toBe(_.size(reportsWithAddedPinnedMessagelessReport) - 1);

                const numberOfPinnedReports = _.filter(results.recentReports, report => report.isPinned).length;
                expect(numberOfPinnedReports).toBe(2);

                // That no personalDetails are shown
                expect(results.personalDetails.length).toBe(0);

                // And the most recent pinned report is first in the list of reports
                let index = 0;
                expect(results.recentReports[index].login).toBe('captain_britain@expensify.com');

                // And the third report is the report with an IOU debt
                index += 2;
                expect(results.recentReports[index].login).toBe('mistersinister@marauders.com');

                // And the fourth report is the report with a draft comment
                expect(results.recentReports[++index].text).toBe('tonystark@expensify.com, reedrichards@expensify.com');

                // And the fifth report is the report with the lastMessage timestamp
                expect(results.recentReports[++index].login).toBe('steverogers@expensify.com');

                expect(_.last(results.recentReports).text).toBe("SHIELD's workspace");
            });
    });

    it('getSidebarOptions() with GSD priority mode',
        () => Report.setReportWithDraft(1, true)
            .then(() => {
                // When we call getSidebarOptions() with no search value
                const results = OptionsListUtils.getSidebarOptions(REPORTS_WITH_MORE_PINS, PERSONAL_DETAILS, 0, CONST.PRIORITY_MODE.GSD);

                // Then expect all of the reports to be shown both multiple and single participant except the
                // report that has no lastMessageTimestamp and the chat with Thor who's message is read
                expect(results.recentReports.length).toBe(_.size(REPORTS_WITH_MORE_PINS) - 2);

                // That no personalDetails are shown
                expect(results.personalDetails.length).toBe(0);

                // Pinned reports are always on the top in alphabetical order regardless of whether they are unread or have IOU debt.
                // D report name (Alphabetically first among pinned reports)
                let index = 0;
                expect(results.recentReports[index].login).toBe('d_email@email.com');

                // Mister Fantastic report name (Alphabetically second among pinned reports)
                expect(results.recentReports[++index].login).toBe('reedrichards@expensify.com');

                // Z report name (Alphabetically third among pinned reports)
                expect(results.recentReports[++index].login).toBe('z_email@email.com');

                // Unpinned report name ordered alphabetically after pinned reports
                // Black Panther report name has unread message
                expect(results.recentReports[++index].text).toBe("SHIELD's workspace");

                expect(results.recentReports[++index].login).toBe('tchalla@expensify.com');

                // Captain America report name has unread message
                expect(results.recentReports[++index].login).toBe('steverogers@expensify.com');

                // Invisible woman report name has unread message
                expect(results.recentReports[++index].login).toBe('suestorm@expensify.com');

                // Mister Sinister report name has IOU debt
                index += 2;
                expect(results.recentReports[index].login).toBe('mistersinister@marauders.com');

                // Spider-Man report name is last report and has unread message
                expect(results.recentReports[++index].login).toBe('peterparker@expensify.com');
            }));

    it('getSidebarOptions() with empty policyExpenseChats and defaultRooms', () => {
        const reportsWithEmptyChatRooms = {
            // This report is a policyExpenseChat without any messages in it (i.e. no lastMessageTimestamp)
            10: {
                chatType: 'policyExpenseChat',
                hasOutstandingIOU: false,
                isOwnPolicyExpenseChat: true,
                isPinned: false,
                lastMessageTimestamp: 0,
                lastVisitedTimestamp: 1610666739302,
                participants: ['test3@instantworkspace.com'],
                policyID: 'ABC123',
                reportID: 10,
                reportName: '',
                unreadActionCount: 0,
                visibility: undefined,
            },

            // This is an archived version of the above policyExpenseChat
            11: {
                chatType: 'policyExpenseChat',
                hasOutstandingIOU: false,
                isOwnPolicyExpenseChat: true,
                isPinned: false,
                lastMessageTimestamp: 0,
                lastVisitedTimestamp: 1610666739302,
                participants: ['test3@instantworkspace.com'],
                policyID: 'ABC123',
                reportID: 11,
                reportName: '',
                unreadActionCount: 0,
                visibility: undefined,
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                statusNum: CONST.REPORT.STATUS.CLOSED,
            },

            // This report is a defaultRoom without any messages in it (i.e. no lastMessageTimestamp)
            12: {
                chatType: 'policyAdmins',
                hasOutstandingIOU: false,
                isPinned: false,
                lastMessageTimestamp: 0,
                lastVisitedTimestamp: 1610666739302,
                participants: ['test3@instantworkspace.com'],
                policyID: 'ABC123',
                reportID: 12,
                reportName: 'admins',
                unreadActionCount: 0,
                visibility: undefined,
            },

            // This is an archived version of the above defaultRoom
            13: {
                chatType: 'policyAdmins',
                hasOutstandingIOU: false,
                isPinned: false,
                lastMessageTimestamp: 0,
                lastVisitedTimestamp: 1610666739302,
                participants: ['test3@instantworkspace.com'],
                policyID: 'ABC123',
                reportID: 13,
                reportName: 'admins',
                unreadActionCount: 0,
                visibility: undefined,
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                statusNum: CONST.REPORT.STATUS.CLOSED,
            },
        };

        // First we call getSidebarOptions() with no search value and default priority mode
        let results = OptionsListUtils.getSidebarOptions(
            reportsWithEmptyChatRooms,
            PERSONAL_DETAILS,
            0,
            CONST.PRIORITY_MODE.DEFAULT,
        );

        // Then expect all of the reports to be shown except the archived policyExpenseChats and defaultRooms
        expect(results.recentReports.length).toBe(_.size(reportsWithEmptyChatRooms) - 2);

        expect(results.recentReports[0].isPolicyExpenseChat).toBe(true);
        expect(results.recentReports[0].text).toBe('Hero Policy');

        expect(results.recentReports[1].isChatRoom).toBe(true);
        expect(results.recentReports[1].text).toBe('#admins');

        // Now we call getSidebarOptions() with no search value and GSD priority mode
        results = OptionsListUtils.getSidebarOptions(
            reportsWithEmptyChatRooms,
            PERSONAL_DETAILS,
            0,
            CONST.PRIORITY_MODE.GSD,
        );

        // None of the chats should be here since they've all been read
        expect(results.recentReports.length).toBe(0);
    });
});
