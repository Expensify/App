import _ from 'underscore';
import Onyx from 'react-native-onyx';
import * as OptionsListUtils from '../../src/libs/OptionsListUtils';
import ONYXKEYS from '../../src/ONYXKEYS';
import waitForPromisesToResolve from '../utils/waitForPromisesToResolve';

describe('OptionsListUtils', () => {
    // Given a set of reports with both single participants and multiple participants some pinned and some not
    const REPORTS = {
        1: {
            lastVisitedTimestamp: 1610666739295,
            isPinned: false,
            reportID: 1,
            participants: ['tonystark@expensify.com', 'reedrichards@expensify.com'],
            reportName: 'Iron Man, Mister Fantastic',
        },
        2: {
            lastVisitedTimestamp: 1610666739296,
            isPinned: false,
            reportID: 2,
            participants: ['peterparker@expensify.com'],
            reportName: 'Spider-Man',
        },

        // This is the only report we are pinning in this test
        3: {
            lastVisitedTimestamp: 1610666739297,
            isPinned: true,
            reportID: 3,
            participants: ['reedrichards@expensify.com'],
            reportName: 'Mister Fantastic',
        },
        4: {
            lastVisitedTimestamp: 1610666739298,
            isPinned: false,
            reportID: 4,
            participants: ['tchalla@expensify.com'],
            reportName: 'Black Panther',
        },
        5: {
            lastVisitedTimestamp: 1610666739299,
            isPinned: false,
            reportID: 5,
            participants: ['suestorm@expensify.com'],
            reportName: 'Invisible Woman',
        },
        6: {
            lastVisitedTimestamp: 1610666739300,
            isPinned: false,
            reportID: 6,
            participants: ['thor@expensify.com'],
            reportName: 'Thor',
        },
        7: {
            lastVisitedTimestamp: 1610666739301,
            isPinned: false,
            reportID: 7,
            participants: ['steverogers@expensify.com'],
            reportName: 'Captain America',
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

    // Set the currently logged in user, report data, and personal details
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
            initialKeyStates: {
                [ONYXKEYS.SESSION]: {email: 'tonystark@expensify.com'},
            },
            registerStorageEventListener: () => {},
        });
        Onyx.registerLogger(() => {});
        return waitForPromisesToResolve();
    });

    it('getSearchOptions()', () => {
        // When we filter in the Search view without providing a searchValue
        let results = OptionsListUtils.getSearchOptions(REPORTS, PERSONAL_DETAILS, {}, 0, '');

        // Then all options returned should be recentReports and none should be personalDetails
        expect(results.personalDetails.length).toBe(0);

        // Then all of the reports should be shown
        expect(results.recentReports.length).toBe(_.size(REPORTS));

        // Then pinned report should be listed first even though it is the oldest
        expect(results.recentReports[0].login).toBe('reedrichards@expensify.com');

        // When we filter again but provide a searchValue
        results = OptionsListUtils.getSearchOptions(REPORTS, PERSONAL_DETAILS, {}, 0, 'spider');

        // Then only one option should be returned and it's the one matching the search value
        expect(results.recentReports.length).toBe(1);
        expect(results.recentReports[0].login).toBe('peterparker@expensify.com');

        // When we filter again but provide a searchValue that should match multiple times
        results = OptionsListUtils.getSearchOptions(REPORTS, PERSONAL_DETAILS, {}, 0, 'fantastic');

        // Then we get both values with the pinned value still on top
        expect(results.recentReports.length).toBe(2);
        expect(results.recentReports[0].text).toBe('Mister Fantastic');
    });

    it('getNewChatOptions()', () => {
        // When we call getNewChatOptions() with no search value
        let results = OptionsListUtils.getNewChatOptions(REPORTS, PERSONAL_DETAILS, {}, 0, '');

        // Then no reports should be returned, only personalDetails and all the personalDetails should be returned
        // minus the currently logged in user
        expect(results.recentReports.length).toBe(0);
        expect(results.personalDetails.length).toBe(_.size(PERSONAL_DETAILS) - 1);

        // Then the result which has an existing report should also have the reportID attached
        const personalDetailWithExistingReport = _.find(
            results.personalDetails,
            personalDetail => personalDetail.login === 'reedrichards@expensify.com',
        );
        expect(personalDetailWithExistingReport.reportID).toBe(3);

        // When we provide a search value that does not match any personal details
        results = OptionsListUtils.getNewChatOptions(REPORTS, PERSONAL_DETAILS, {}, 0, 'magneto');

        // Then no options will be returned
        expect(results.personalDetails.length).toBe(0);

        // When we provide a search value that matches an email
        results = OptionsListUtils.getNewChatOptions(REPORTS, PERSONAL_DETAILS, {}, 0, 'peterparker@expensify.com');

        // Then one option will be returned and it will be the correct option
        expect(results.personalDetails.length).toBe(1);
        expect(results.personalDetails[0].text).toBe('Spider-Man');

        // When we provide a search value that matches a partial display name or email
        results = OptionsListUtils.getNewChatOptions(REPORTS, PERSONAL_DETAILS, {}, 0, 'man');

        // Then several options will be returned and they will be each have the search string in their email or name
        // even though the currently logged in user matches they should not show.
        expect(results.personalDetails.length).toBe(3);
        expect(results.personalDetails[0].text).toBe('Spider-Man');
        expect(results.personalDetails[1].text).toBe('Invisible Woman');
        expect(results.personalDetails[2].login).toBe('natasharomanoff@expensify.com');
    });

    it('getNewGroupOptions()', () => {
        // When we call getNewGroupOptions() with no search value
        let results = OptionsListUtils.getNewGroupOptions(REPORTS, PERSONAL_DETAILS, {}, 0, '');

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
        results = OptionsListUtils.getNewGroupOptions(REPORTS, PERSONAL_DETAILS, {}, 0, 'hulk');

        // Then reports should return no results
        expect(results.recentReports.length).toBe(0);

        // And personalDetails should show just one option and it will be the one we expect
        expect(results.personalDetails.length).toBe(1);
        expect(results.personalDetails[0].login).toBe('brucebanner@expensify.com');

        // When we search for an option that matches things in both personalDetails and reports
        results = OptionsListUtils.getNewGroupOptions(REPORTS, PERSONAL_DETAILS, {}, 0, 'man');

        // Then all single participant reports that match will show up in the recentReports array
        expect(results.recentReports.length).toBe(2);
        expect(results.recentReports[0].text).toBe('Invisible Woman');
        expect(results.recentReports[1].text).toBe('Spider-Man');

        // And logins with no single participant reports will show up in personalDetails
        expect(results.personalDetails.length).toBe(1);
        expect(results.personalDetails[0].login).toBe('natasharomanoff@expensify.com');

        // When we provide no selected options to getNewGroupOptions()
        results = OptionsListUtils.getNewGroupOptions(REPORTS, PERSONAL_DETAILS, {}, 0, '', []);

        // Then one of our older report options (not in our five most recent) should appear in the personalDetails
        // but not in recentReports
        expect(_.every(results.recentReports, option => option.login !== 'peterparker@expensify.com')).toBe(true);
        expect(_.every(results.personalDetails, option => option.login !== 'peterparker@expensify.com')).toBe(false);

        // When we provide a "selected" option to getNewGroupOptions()
        results = OptionsListUtils.getNewGroupOptions(
            REPORTS,
            PERSONAL_DETAILS,
            {},
            0,
            '',
            [{login: 'peterparker@expensify.com'}],
        );

        // Then the option should not appear anywhere in either list
        expect(_.every(results.recentReports, option => option.login !== 'peterparker@expensify.com')).toBe(true);
        expect(_.every(results.personalDetails, option => option.login !== 'peterparker@expensify.com')).toBe(true);
    });

    it('getSidebarOptions()', () => {
        // When we call getSidebarOptions() with no search value
        const results = OptionsListUtils.getSidebarOptions(REPORTS, PERSONAL_DETAILS, {}, 0);

        // Then expect all of the reports to be shown both multiple and single participant
        expect(results.recentReports.length).toBe(_.size(REPORTS));

        // That no personalDetails are shown
        expect(results.personalDetails.length).toBe(0);

        // And the pinned report is first in the list of reports
        expect(results.recentReports[0].login).toBe('reedrichards@expensify.com');
    });
});
