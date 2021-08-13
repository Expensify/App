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

        10: {
            lastVisitedTimestamp: 1610666739302,
            lastMessageTimestamp: 1,
            isPinned: false,
            reportID: 10,
            participants: ['concierge@expensify.com'],
            reportName: 'Concierge',
            unreadActionCount: 1,
        },
    };

    const PERSONAL_DETAILS_WITH_CONCIERGE = {
        ...PERSONAL_DETAILS,

        'concierge@expensify.com': {
            displayName: 'Concierge',
            login: 'concierge@expensify.com',
        },
    };

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
            },
            registerStorageEventListener: () => {},
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
    });

    it('getNewChatOptions()', () => {
        // maxRecentReportsToShow in src/libs/OptionsListUtils.js
        const MAX_RECENT_REPORTS = 5;

        // When we call getNewChatOptions() with no search value
        let results = OptionsListUtils.getNewChatOptions(REPORTS, PERSONAL_DETAILS, '');

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
        results = OptionsListUtils.getNewChatOptions(REPORTS, PERSONAL_DETAILS, 'magneto');

        // Then no options will be returned
        expect(results.personalDetails.length).toBe(0);

        // When we provide a search value that matches an email
        results = OptionsListUtils.getNewChatOptions(REPORTS, PERSONAL_DETAILS, 'peterparker@expensify.com');

        // Then one recentReports will be returned and it will be the correct option
        // personalDetails should be empty array
        expect(results.recentReports.length).toBe(1);
        expect(results.recentReports[0].text).toBe('Spider-Man');
        expect(results.personalDetails.length).toBe(0);

        // When we provide a search value that matches a partial display name or email
        results = OptionsListUtils.getNewChatOptions(REPORTS, PERSONAL_DETAILS, 'man');

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
            REPORTS_WITH_CONCIERGE, PERSONAL_DETAILS_WITH_CONCIERGE, '', {excludeConcierge: true},
        );

        // All the personalDetails should be returned minus the currently logged in user and Concierge
        expect(results.personalDetails.length).toBe(_.size(PERSONAL_DETAILS_WITH_CONCIERGE) - 2 - MAX_RECENT_REPORTS);
        expect(results.personalDetails).not.toEqual(
            expect.arrayContaining([
                expect.objectContaining({login: 'concierge@expensify.com'}),
            ]),
        );
    });

    it('getNewGroupOptions()', () => {
        // When we call getNewGroupOptions() with no search value
        let results = OptionsListUtils.getNewGroupOptions(REPORTS, PERSONAL_DETAILS, '');

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
        results = OptionsListUtils.getNewGroupOptions(REPORTS, PERSONAL_DETAILS, 'hulk');

        // Then reports should return no results
        expect(results.recentReports.length).toBe(0);

        // And personalDetails should show just one option and it will be the one we expect
        expect(results.personalDetails.length).toBe(1);
        expect(results.personalDetails[0].login).toBe('brucebanner@expensify.com');

        // When we search for an option that matches things in both personalDetails and reports
        results = OptionsListUtils.getNewGroupOptions(REPORTS, PERSONAL_DETAILS, 'man');

        // Then all single participant reports that match will show up in the recentReports array
        expect(results.recentReports.length).toBe(2);
        expect(results.recentReports[0].text).toBe('Invisible Woman');
        expect(results.recentReports[1].text).toBe('Spider-Man');

        // And logins with no single participant reports will show up in personalDetails
        expect(results.personalDetails.length).toBe(1);
        expect(results.personalDetails[0].login).toBe('natasharomanoff@expensify.com');

        // When we provide no selected options to getNewGroupOptions()
        results = OptionsListUtils.getNewGroupOptions(REPORTS, PERSONAL_DETAILS, '', []);

        // Then one of our older report options (not in our five most recent) should appear in the personalDetails
        // but not in recentReports
        expect(_.every(results.recentReports, option => option.login !== 'peterparker@expensify.com')).toBe(true);
        expect(_.every(results.personalDetails, option => option.login !== 'peterparker@expensify.com')).toBe(false);

        // When we provide a "selected" option to getNewGroupOptions()
        results = OptionsListUtils.getNewGroupOptions(
            REPORTS,
            PERSONAL_DETAILS,
            '',
            [{login: 'peterparker@expensify.com'}],
        );

        // Then the option should not appear anywhere in either list
        expect(_.every(results.recentReports, option => option.login !== 'peterparker@expensify.com')).toBe(true);
        expect(_.every(results.personalDetails, option => option.login !== 'peterparker@expensify.com')).toBe(true);

        // When we add a search term for which no options exist and the searchValue itself
        // is not a potential email or phone
        results = OptionsListUtils.getNewGroupOptions(REPORTS, PERSONAL_DETAILS, 'marc@expensify');

        // Then we should have no options or personal details at all and also that there is no userToInvite
        expect(results.recentReports.length).toBe(0);
        expect(results.personalDetails.length).toBe(0);
        expect(results.userToInvite).toBe(null);

        // When we add a search term for which no options exist and the searchValue itself
        // is a potential email
        results = OptionsListUtils.getNewGroupOptions(REPORTS, PERSONAL_DETAILS, 'marc@expensify.com');

        // Then we should have no options or personal details at all but there should be a userToInvite
        expect(results.recentReports.length).toBe(0);
        expect(results.personalDetails.length).toBe(0);
        expect(results.userToInvite).not.toBe(null);

        // When we add a search term for which no options exist and the searchValue itself
        // is a potential phone number without country code added
        results = OptionsListUtils.getNewGroupOptions(REPORTS, PERSONAL_DETAILS, '5005550006');

        // Then we should have no options or personal details at all but there should be a userToInvite and the login
        // should have the country code included
        expect(results.recentReports.length).toBe(0);
        expect(results.personalDetails.length).toBe(0);
        expect(results.userToInvite).not.toBe(null);
        expect(results.userToInvite.login).toBe(`+15005550006${CONST.SMS.DOMAIN}`);

        // When we add a search term for which no options exist and the searchValue itself
        // is a potential phone number with country code added
        results = OptionsListUtils.getNewGroupOptions(REPORTS, PERSONAL_DETAILS, '+15005550006');

        // Then we should have no options or personal details at all but there should be a userToInvite and the login
        // should have the country code included
        expect(results.recentReports.length).toBe(0);
        expect(results.personalDetails.length).toBe(0);
        expect(results.userToInvite).not.toBe(null);
        expect(results.userToInvite.login).toBe(`+15005550006${CONST.SMS.DOMAIN}`);

        // Test Concierge's existence in new group options
        results = OptionsListUtils.getNewGroupOptions(REPORTS_WITH_CONCIERGE, PERSONAL_DETAILS_WITH_CONCIERGE);

        // Concierge is included in the results by default. We should expect all the personalDetails to show
        // (minus the 5 that are already showing and the currently logged in user)
        expect(results.personalDetails.length).toBe(_.size(PERSONAL_DETAILS_WITH_CONCIERGE) - 6);
        expect(results.recentReports).toEqual(
            expect.arrayContaining([
                expect.objectContaining({login: 'concierge@expensify.com'}),
            ]),
        );

        // Test by excluding Concierge from the results
        results = OptionsListUtils.getNewGroupOptions(
            REPORTS_WITH_CONCIERGE,
            PERSONAL_DETAILS_WITH_CONCIERGE,
            '',
            [],
            {
                excludeConcierge: true,
            },
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
    });

    it('getSidebarOptions() with default priority mode', () => {
        const reportsWithAddedPinnedMessagelessReport = {
            ...REPORTS,

            // Note: This report has no lastMessageTimestamp but is also pinned
            10: {
                lastVisitedTimestamp: 1610666739300,
                lastMessageTimestamp: 0,
                isPinned: true,
                reportID: 10,
                participants: ['captain_britain@expensify.com'],
                reportName: 'Captain Britain',
            },
        };

        // When we call getSidebarOptions() with no search value and default priority mode
        const results = OptionsListUtils.getSidebarOptions(
            reportsWithAddedPinnedMessagelessReport,
            PERSONAL_DETAILS,
            {},
            0,
            CONST.PRIORITY_MODE.DEFAULT,
        );

        // Then expect all of the reports to be shown both multiple and single participant except the
        // unpinned report that has no lastMessageTimestamp
        expect(results.recentReports.length).toBe(_.size(reportsWithAddedPinnedMessagelessReport) - 1);

        const numberOfPinnedReports = results.recentReports.filter(report => report.isPinned).length;
        expect(numberOfPinnedReports).toBe(2);

        // That no personalDetails are shown
        expect(results.personalDetails.length).toBe(0);

        // And the most recent pinned report is first in the list of reports
        expect(results.recentReports[0].login).toBe('captain_britain@expensify.com');

        // And the third report is the report with an IOU debt
        expect(results.recentReports[2].login).toBe('mistersinister@marauders.com');

        // And the fourth report is the report with the lastMessage timestamp
        expect(results.recentReports[3].login).toBe('steverogers@expensify.com');
    });

    it('getSidebarOptions() with GSD priority mode', () => {
        // When we call getSidebarOptions() with no search value
        const results = OptionsListUtils.getSidebarOptions(REPORTS, PERSONAL_DETAILS, {}, 0, CONST.PRIORITY_MODE.GSD);

        // Then expect all of the reports to be shown both multiple and single participant except the
        // report that has no lastMessageTimestamp and the chat with Thor who's message is read
        expect(results.recentReports.length).toBe(_.size(REPORTS) - 2);

        // That no personalDetails are shown
        expect(results.personalDetails.length).toBe(0);

        // And Mister Fantastic is alphabetically the fourth report and has an unread message
        // despite being pinned
        expect(results.recentReports[4].login).toBe('reedrichards@expensify.com');

        // And Black Panther is alphabetically the first report and has an unread message
        expect(results.recentReports[0].login).toBe('tchalla@expensify.com');

        // And Mister Sinister is alphabetically the fifth report and has an IOU debt despite not being pinned
        expect(results.recentReports[5].login).toBe('mistersinister@marauders.com');
    });
});
