/* eslint-disable @typescript-eslint/naming-convention */
import type {OnyxCollection} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import DateUtils from '@libs/DateUtils';
import CONST from '@src/CONST';
import * as OptionsListUtils from '@src/libs/OptionsListUtils';
import * as ReportUtils from '@src/libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetails, Policy, PolicyCategories, Report} from '@src/types/onyx';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';
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

            // This indicates that the report is archived
            stateNum: 2,
            statusNum: 2,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            private_isArchived: DateUtils.getDBTime(),
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
        type: CONST.POLICY.TYPE.TEAM,
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
    let OPTIONS_WITH_WORKSPACE_ROOM: OptionsListUtils.OptionList;

    beforeEach(() => {
        OPTIONS = OptionsListUtils.createOptionList(PERSONAL_DETAILS, REPORTS);
        OPTIONS_WITH_CONCIERGE = OptionsListUtils.createOptionList(PERSONAL_DETAILS_WITH_CONCIERGE, REPORTS_WITH_CONCIERGE);
        OPTIONS_WITH_CHRONOS = OptionsListUtils.createOptionList(PERSONAL_DETAILS_WITH_CHRONOS, REPORTS_WITH_CHRONOS);
        OPTIONS_WITH_RECEIPTS = OptionsListUtils.createOptionList(PERSONAL_DETAILS_WITH_RECEIPTS, REPORTS_WITH_RECEIPTS);
        OPTIONS_WITH_WORKSPACE_ROOM = OptionsListUtils.createOptionList(PERSONAL_DETAILS, REPORTS_WITH_WORKSPACE_ROOMS);
    });

    it('getSearchOptions()', () => {
        // When we filter in the Search view without providing a searchValue
        const results = OptionsListUtils.getSearchOptions(OPTIONS, '', [CONST.BETAS.ALL]);

        // All 2 personalDetails (including those that have reports) should be returned
        // Filtering of personalDetails that have reports is done in filterOptions
        expect(results.personalDetails.length).toBe(9);

        // Then all of the reports should be shown including the archived rooms.
        expect(results.recentReports.length).toBe(Object.values(OPTIONS.reports).length);
    });

    it('getFilteredOptions()', () => {
        // maxRecentReportsToShow in src/libs/OptionsListUtils.js
        const MAX_RECENT_REPORTS = 5;

        // When we call getFilteredOptions() with no search value
        let results = OptionsListUtils.getFilteredOptions({reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails});

        // We should expect maximimum of 5 recent reports to be returned
        expect(results.recentReports.length).toBe(MAX_RECENT_REPORTS);

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
        results = OptionsListUtils.getFilteredOptions({personalDetails: OPTIONS.personalDetails});

        // We should expect personal details sorted alphabetically
        expect(results.personalDetails.at(0)?.text).toBe('Black Panther');
        expect(results.personalDetails.at(1)?.text).toBe('Black Widow');
        expect(results.personalDetails.at(2)?.text).toBe('Captain America');
        expect(results.personalDetails.at(3)?.text).toBe('Invisible Woman');

        // When we don't include personal detail to the result
        results = OptionsListUtils.getFilteredOptions({
            maxRecentReportsToShow: 0,
        });

        // Then no personal detail options will be returned
        expect(results.personalDetails.length).toBe(0);

        // Test for Concierge's existence in chat options

        results = OptionsListUtils.getFilteredOptions({reports: OPTIONS_WITH_CONCIERGE.reports, personalDetails: OPTIONS_WITH_CONCIERGE.personalDetails});

        // Concierge is included in the results by default. We should expect all the personalDetails to show
        // (minus the currently logged in user)
        // Filtering of personalDetails that have reports is done in filterOptions
        expect(results.personalDetails.length).toBe(Object.values(OPTIONS_WITH_CONCIERGE.personalDetails).length - 1);
        expect(results.recentReports).toEqual(expect.arrayContaining([expect.objectContaining({login: 'concierge@expensify.com'})]));

        // Test by excluding Concierge from the results
        results = OptionsListUtils.getFilteredOptions({
            reports: OPTIONS_WITH_CONCIERGE.reports,
            personalDetails: OPTIONS_WITH_CONCIERGE.personalDetails,
            excludeLogins: [CONST.EMAIL.CONCIERGE],
        });

        // All the personalDetails should be returned minus the currently logged in user and Concierge
        // Filtering of personalDetails that have reports is done in filterOptions
        expect(results.personalDetails.length).toBe(Object.values(OPTIONS_WITH_CONCIERGE.personalDetails).length - 2);
        expect(results.personalDetails).not.toEqual(expect.arrayContaining([expect.objectContaining({login: 'concierge@expensify.com'})]));

        // Test by excluding Chronos from the results
        results = OptionsListUtils.getFilteredOptions({reports: OPTIONS_WITH_CHRONOS.reports, personalDetails: OPTIONS_WITH_CHRONOS.personalDetails, excludeLogins: [CONST.EMAIL.CHRONOS]});

        // All the personalDetails should be returned minus the currently logged in user and Concierge
        // Filtering of personalDetails that have reports is done in filterOptions
        expect(results.personalDetails.length).toBe(Object.values(OPTIONS_WITH_CHRONOS.personalDetails).length - 2);
        expect(results.personalDetails).not.toEqual(expect.arrayContaining([expect.objectContaining({login: 'chronos@expensify.com'})]));

        // Test by excluding Receipts from the results
        results = OptionsListUtils.getFilteredOptions({
            reports: OPTIONS_WITH_RECEIPTS.reports,
            personalDetails: OPTIONS_WITH_RECEIPTS.personalDetails,
            excludeLogins: [CONST.EMAIL.RECEIPTS],
        });

        // All the personalDetails should be returned minus the currently logged in user and Concierge
        // Filtering of personalDetails that have reports is done in filterOptions
        expect(results.personalDetails.length).toBe(Object.values(OPTIONS_WITH_RECEIPTS.personalDetails).length - 2);
        expect(results.personalDetails).not.toEqual(expect.arrayContaining([expect.objectContaining({login: 'receipts@expensify.com'})]));
    });

    it('getFilteredOptions() for group Chat', () => {
        // When we call getFilteredOptions() with no search value
        let results = OptionsListUtils.getFilteredOptions({reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails});

        // Then we should expect only a maxmimum of 5 recent reports to be returned
        expect(results.recentReports.length).toBe(5);

        // And we should expect all the personalDetails to show except the currently logged in user
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

        // And none of our personalDetails should include any of the users with recent reports
        const reportLogins = results.recentReports.map((reportOption) => reportOption.login);
        const personalDetailsOverlapWithReports = results.personalDetails.every((personalDetailOption) => reportLogins.includes(personalDetailOption.login));
        expect(personalDetailsOverlapWithReports).toBe(false);

        // When we provide no selected options to getFilteredOptions()
        results = OptionsListUtils.getFilteredOptions({reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails});

        // Then one of our older report options (not in our five most recent) should appear in the personalDetails
        // but not in recentReports
        expect(results.recentReports.every((option) => option.login !== 'peterparker@expensify.com')).toBe(true);
        expect(results.personalDetails.every((option) => option.login !== 'peterparker@expensify.com')).toBe(false);

        // When we provide a "selected" option to getFilteredOptions()
        results = OptionsListUtils.getFilteredOptions({reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails, excludeLogins: ['peterparker@expensify.com']});

        // Then the option should not appear anywhere in either list
        expect(results.recentReports.every((option) => option.login !== 'peterparker@expensify.com')).toBe(true);
        expect(results.personalDetails.every((option) => option.login !== 'peterparker@expensify.com')).toBe(true);

        // Test Concierge's existence in new group options
        results = OptionsListUtils.getFilteredOptions({reports: OPTIONS_WITH_CONCIERGE.reports, personalDetails: OPTIONS_WITH_CONCIERGE.personalDetails});

        // Concierge is included in the results by default. We should expect all the personalDetails to show
        // (minus the currently logged in user)
        // Filtering of personalDetails that have reports is done in filterOptions
        expect(results.personalDetails.length).toBe(Object.values(OPTIONS_WITH_CONCIERGE.personalDetails).length - 1);
        expect(results.recentReports).toEqual(expect.arrayContaining([expect.objectContaining({login: 'concierge@expensify.com'})]));

        // Test by excluding Concierge from the results
        results = OptionsListUtils.getFilteredOptions({
            reports: OPTIONS_WITH_CONCIERGE.reports,
            personalDetails: OPTIONS_WITH_CONCIERGE.personalDetails,
            excludeLogins: [CONST.EMAIL.CONCIERGE],
        });

        // We should expect all the personalDetails to show (minus
        // the currently logged in user and Concierge)
        // Filtering of personalDetails that have reports is done in filterOptions
        expect(results.personalDetails.length).toBe(Object.values(OPTIONS_WITH_CONCIERGE.personalDetails).length - 2);
        expect(results.personalDetails).not.toEqual(expect.arrayContaining([expect.objectContaining({login: 'concierge@expensify.com'})]));
        expect(results.recentReports).not.toEqual(expect.arrayContaining([expect.objectContaining({login: 'concierge@expensify.com'})]));

        // Test by excluding Chronos from the results
        results = OptionsListUtils.getFilteredOptions({reports: OPTIONS_WITH_CHRONOS.reports, personalDetails: OPTIONS_WITH_CHRONOS.personalDetails, excludeLogins: [CONST.EMAIL.CHRONOS]});

        // We should expect all the personalDetails to show (minus
        // the currently logged in user and Concierge)
        // Filtering of personalDetails that have reports is done in filterOptions
        expect(results.personalDetails.length).toBe(Object.values(OPTIONS_WITH_CHRONOS.personalDetails).length - 2);
        expect(results.personalDetails).not.toEqual(expect.arrayContaining([expect.objectContaining({login: 'chronos@expensify.com'})]));
        expect(results.recentReports).not.toEqual(expect.arrayContaining([expect.objectContaining({login: 'chronos@expensify.com'})]));

        // Test by excluding Receipts from the results
        results = OptionsListUtils.getFilteredOptions({
            reports: OPTIONS_WITH_RECEIPTS.reports,
            personalDetails: OPTIONS_WITH_RECEIPTS.personalDetails,
            excludeLogins: [CONST.EMAIL.RECEIPTS],
        });

        // We should expect all the personalDetails to show (minus
        // the currently logged in user and Concierge)
        // Filtering of personalDetails that have reports is done in filterOptions
        expect(results.personalDetails.length).toBe(Object.values(OPTIONS_WITH_RECEIPTS.personalDetails).length - 2);
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

        // Filter current REPORTS_WITH_WORKSPACE_ROOMS as we do in the component, before getting share destination options
        const filteredReportsWithWorkspaceRooms = Object.values(OPTIONS_WITH_WORKSPACE_ROOM.reports).reduce<OptionsListUtils.OptionList['reports']>((filtered, option) => {
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
        expect(results.recentReports.length).toBe(Object.values(OPTIONS_WITH_WORKSPACE_ROOM.reports).length - 1);
    });

    it('getMemberInviteOptions()', () => {
        // When we only pass personal details
        const results = OptionsListUtils.getMemberInviteOptions(OPTIONS.personalDetails, [], '');

        // We should expect personal details to be sorted alphabetically
        expect(results.personalDetails.at(0)?.text).toBe('Black Panther');
        expect(results.personalDetails.at(1)?.text).toBe('Black Widow');
        expect(results.personalDetails.at(2)?.text).toBe('Captain America');
        expect(results.personalDetails.at(3)?.text).toBe('Invisible Woman');
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
                pendingAction: undefined,
            },
            Restaurant: {
                enabled: true,
                name: 'Restaurant',
                unencodedName: 'Restaurant',
                areCommentsRequired: false,
                'GL Code': '',
                externalID: '',
                origin: '',
                pendingAction: 'delete',
            },
            Food: {
                enabled: true,
                name: 'Food',
                unencodedName: 'Food',
                areCommentsRequired: false,
                'GL Code': '',
                externalID: '',
                origin: '',
                pendingAction: undefined,
            },
            'Food: Meat': {
                enabled: true,
                name: 'Food: Meat',
                unencodedName: 'Food: Meat',
                areCommentsRequired: false,
                'GL Code': '',
                externalID: '',
                origin: '',
                pendingAction: undefined,
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
                        pendingAction: undefined,
                    },
                    {
                        text: '    Meat',
                        keyForList: 'Food: Meat',
                        searchText: 'Food: Meat',
                        tooltipText: 'Meat',
                        isDisabled: false,
                        isSelected: false,
                        pendingAction: undefined,
                    },
                    {
                        text: 'Restaurant',
                        keyForList: 'Restaurant',
                        searchText: 'Restaurant',
                        tooltipText: 'Restaurant',
                        isDisabled: true,
                        isSelected: false,
                        pendingAction: 'delete',
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
                        pendingAction: undefined,
                    },
                    {
                        text: 'Food: Meat',
                        keyForList: 'Food: Meat',
                        searchText: 'Food: Meat',
                        tooltipText: 'Food: Meat',
                        isDisabled: false,
                        isSelected: false,
                        pendingAction: undefined,
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
                        isDisabled: true,
                        isSelected: true,
                        pendingAction: undefined,
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
                        pendingAction: undefined,
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
                        pendingAction: undefined,
                    },
                    {
                        text: '    Audi',
                        keyForList: 'Cars: Audi',
                        searchText: 'Cars: Audi',
                        tooltipText: 'Audi',
                        isDisabled: false,
                        isSelected: false,
                        pendingAction: undefined,
                    },
                    {
                        text: '    Mercedes-Benz',
                        keyForList: 'Cars: Mercedes-Benz',
                        searchText: 'Cars: Mercedes-Benz',
                        tooltipText: 'Mercedes-Benz',
                        isDisabled: false,
                        isSelected: false,
                        pendingAction: undefined,
                    },
                    {
                        text: 'Food',
                        keyForList: 'Food',
                        searchText: 'Food',
                        tooltipText: 'Food',
                        isDisabled: false,
                        isSelected: false,
                        pendingAction: undefined,
                    },
                    {
                        text: '    Meat',
                        keyForList: 'Food: Meat',
                        searchText: 'Food: Meat',
                        tooltipText: 'Meat',
                        isDisabled: false,
                        isSelected: false,
                        pendingAction: undefined,
                    },
                    {
                        text: '    Milk',
                        keyForList: 'Food: Milk',
                        searchText: 'Food: Milk',
                        tooltipText: 'Milk',
                        isDisabled: false,
                        isSelected: false,
                        pendingAction: undefined,
                    },
                    {
                        text: 'Restaurant',
                        keyForList: 'Restaurant',
                        searchText: 'Restaurant',
                        tooltipText: 'Restaurant',
                        isDisabled: false,
                        isSelected: false,
                        pendingAction: undefined,
                    },
                    {
                        text: 'Travel',
                        keyForList: 'Travel',
                        searchText: 'Travel',
                        tooltipText: 'Travel',
                        isDisabled: true,
                        isSelected: false,
                        pendingAction: undefined,
                    },
                    {
                        text: '    Meals',
                        keyForList: 'Travel: Meals',
                        searchText: 'Travel: Meals',
                        tooltipText: 'Meals',
                        isDisabled: false,
                        isSelected: false,
                        pendingAction: undefined,
                    },
                    {
                        text: '        Breakfast',
                        keyForList: 'Travel: Meals: Breakfast',
                        searchText: 'Travel: Meals: Breakfast',
                        tooltipText: 'Breakfast',
                        isDisabled: false,
                        isSelected: false,
                        pendingAction: undefined,
                    },
                    {
                        text: '        Lunch',
                        keyForList: 'Travel: Meals: Lunch',
                        searchText: 'Travel: Meals: Lunch',
                        tooltipText: 'Lunch',
                        isDisabled: false,
                        isSelected: false,
                        pendingAction: undefined,
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
                        pendingAction: undefined,
                    },
                    {
                        text: 'Food: Meat',
                        keyForList: 'Food: Meat',
                        searchText: 'Food: Meat',
                        tooltipText: 'Food: Meat',
                        isDisabled: false,
                        isSelected: false,
                        pendingAction: undefined,
                    },
                    {
                        text: 'Food: Milk',
                        keyForList: 'Food: Milk',
                        searchText: 'Food: Milk',
                        tooltipText: 'Food: Milk',
                        isDisabled: false,
                        isSelected: false,
                        pendingAction: undefined,
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
                        isDisabled: true,
                        isSelected: true,
                        pendingAction: undefined,
                    },
                ],
            },
        ];

        const smallResult = OptionsListUtils.getFilteredOptions({
            reports: OPTIONS.reports,
            personalDetails: OPTIONS.personalDetails,
            searchValue: emptySearch,
            includeP2P: false,
            includeCategories: true,
            categories: smallCategoriesList,
        });
        expect(smallResult.categoryOptions).toStrictEqual(smallResultList);

        const smallSearchResult = OptionsListUtils.getFilteredOptions({searchValue: search, includeP2P: false, includeCategories: true, categories: smallCategoriesList});
        expect(smallSearchResult.categoryOptions).toStrictEqual(smallSearchResultList);

        const smallWrongSearchResult = OptionsListUtils.getFilteredOptions({searchValue: wrongSearch, includeP2P: false, includeCategories: true, categories: smallCategoriesList});
        expect(smallWrongSearchResult.categoryOptions).toStrictEqual(smallWrongSearchResultList);

        const largeResult = OptionsListUtils.getFilteredOptions({
            searchValue: emptySearch,
            selectedOptions,
            includeP2P: false,
            includeCategories: true,
            categories: largeCategoriesList,
            recentlyUsedCategories,
        });
        expect(largeResult.categoryOptions).toStrictEqual(largeResultList);

        const largeSearchResult = OptionsListUtils.getFilteredOptions({
            searchValue: search,
            selectedOptions,

            includeP2P: false,
            includeCategories: true,
            categories: largeCategoriesList,
            recentlyUsedCategories,
        });
        expect(largeSearchResult.categoryOptions).toStrictEqual(largeSearchResultList);

        const largeWrongSearchResult = OptionsListUtils.getFilteredOptions({
            searchValue: wrongSearch,
            selectedOptions,
            includeP2P: false,
            includeCategories: true,
            categories: largeCategoriesList,
            recentlyUsedCategories,
        });
        expect(largeWrongSearchResult.categoryOptions).toStrictEqual(largeWrongSearchResultList);

        const emptyResult = OptionsListUtils.getFilteredOptions({searchValue: search, selectedOptions, includeP2P: false, includeCategories: true, categories: emptyCategoriesList});
        expect(emptyResult.categoryOptions).toStrictEqual(emptySelectedResultList);
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
                pendingAction: undefined,
            },
            {
                text: 'Restaurant',
                keyForList: 'Restaurant',
                searchText: 'Restaurant',
                tooltipText: 'Restaurant',
                isDisabled: false,
                isSelected: false,
                pendingAction: undefined,
            },
            {
                text: 'Food',
                keyForList: 'Food',
                searchText: 'Food',
                tooltipText: 'Food',
                isDisabled: false,
                isSelected: false,
                pendingAction: undefined,
            },
            {
                text: '    Meat',
                keyForList: 'Food: Meat',
                searchText: 'Food: Meat',
                tooltipText: 'Meat',
                isDisabled: false,
                isSelected: false,
                pendingAction: undefined,
            },
            {
                text: '    Milk',
                keyForList: 'Food: Milk',
                searchText: 'Food: Milk',
                tooltipText: 'Milk',
                isDisabled: false,
                isSelected: false,
                pendingAction: undefined,
            },
            {
                text: 'Cars',
                keyForList: 'Cars',
                searchText: 'Cars',
                tooltipText: 'Cars',
                isDisabled: true,
                isSelected: false,
                pendingAction: undefined,
            },
            {
                text: '    Audi',
                keyForList: 'Cars: Audi',
                searchText: 'Cars: Audi',
                tooltipText: 'Audi',
                isDisabled: false,
                isSelected: false,
                pendingAction: undefined,
            },
            {
                text: '    Mercedes-Benz',
                keyForList: 'Cars: Mercedes-Benz',
                searchText: 'Cars: Mercedes-Benz',
                tooltipText: 'Mercedes-Benz',
                isDisabled: false,
                isSelected: false,
                pendingAction: undefined,
            },
            {
                text: 'Travel',
                keyForList: 'Travel',
                searchText: 'Travel',
                tooltipText: 'Travel',
                isDisabled: true,
                isSelected: false,
                pendingAction: undefined,
            },
            {
                text: '    Meals',
                keyForList: 'Travel: Meals',
                searchText: 'Travel: Meals',
                tooltipText: 'Meals',
                isDisabled: false,
                isSelected: false,
                pendingAction: undefined,
            },
            {
                text: '        Breakfast',
                keyForList: 'Travel: Meals: Breakfast',
                searchText: 'Travel: Meals: Breakfast',
                tooltipText: 'Breakfast',
                isDisabled: false,
                isSelected: false,
                pendingAction: undefined,
            },
            {
                text: '        Lunch',
                keyForList: 'Travel: Meals: Lunch',
                searchText: 'Travel: Meals: Lunch',
                tooltipText: 'Lunch',
                isDisabled: false,
                isSelected: false,
                pendingAction: undefined,
            },
            {
                text: 'Plain',
                keyForList: 'Plain',
                searchText: 'Plain',
                tooltipText: 'Plain',
                isDisabled: false,
                isSelected: false,
                pendingAction: undefined,
            },
            {
                text: 'Audi',
                keyForList: 'Audi',
                searchText: 'Audi',
                tooltipText: 'Audi',
                isDisabled: false,
                isSelected: false,
                pendingAction: undefined,
            },
            {
                text: 'Health',
                keyForList: 'Health',
                searchText: 'Health',
                tooltipText: 'Health',
                isDisabled: false,
                isSelected: false,
                pendingAction: undefined,
            },
            {
                text: 'A',
                keyForList: 'A',
                searchText: 'A',
                tooltipText: 'A',
                isDisabled: true,
                isSelected: false,
                pendingAction: undefined,
            },
            {
                text: '    B',
                keyForList: 'A: B',
                searchText: 'A: B',
                tooltipText: 'B',
                isDisabled: true,
                isSelected: false,
                pendingAction: undefined,
            },
            {
                text: '        C',
                keyForList: 'A: B: C',
                searchText: 'A: B: C',
                tooltipText: 'C',
                isDisabled: false,
                isSelected: false,
                pendingAction: undefined,
            },
            {
                text: '            D',
                keyForList: 'A: B: C: D',
                searchText: 'A: B: C: D',
                tooltipText: 'D',
                isDisabled: true,
                isSelected: false,
                pendingAction: undefined,
            },
            {
                text: '                E',
                keyForList: 'A: B: C: D: E',
                searchText: 'A: B: C: D: E',
                tooltipText: 'E',
                isDisabled: false,
                isSelected: false,
                pendingAction: undefined,
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
                pendingAction: undefined,
            },
            {
                text: 'Restaurant',
                keyForList: 'Restaurant',
                searchText: 'Restaurant',
                tooltipText: 'Restaurant',
                isDisabled: false,
                isSelected: false,
                pendingAction: undefined,
            },
            {
                text: 'Food',
                keyForList: 'Food',
                searchText: 'Food',
                tooltipText: 'Food',
                isDisabled: false,
                isSelected: false,
                pendingAction: undefined,
            },
            {
                text: 'Food: Meat',
                keyForList: 'Food: Meat',
                searchText: 'Food: Meat',
                tooltipText: 'Food: Meat',
                isDisabled: false,
                isSelected: false,
                pendingAction: undefined,
            },
            {
                text: 'Food: Milk',
                keyForList: 'Food: Milk',
                searchText: 'Food: Milk',
                tooltipText: 'Food: Milk',
                isDisabled: false,
                isSelected: false,
                pendingAction: undefined,
            },
            {
                text: 'Cars: Audi',
                keyForList: 'Cars: Audi',
                searchText: 'Cars: Audi',
                tooltipText: 'Cars: Audi',
                isDisabled: false,
                isSelected: false,
                pendingAction: undefined,
            },
            {
                text: 'Cars: Mercedes-Benz',
                keyForList: 'Cars: Mercedes-Benz',
                searchText: 'Cars: Mercedes-Benz',
                tooltipText: 'Cars: Mercedes-Benz',
                isDisabled: false,
                isSelected: false,
                pendingAction: undefined,
            },
            {
                text: 'Travel: Meals',
                keyForList: 'Travel: Meals',
                searchText: 'Travel: Meals',
                tooltipText: 'Travel: Meals',
                isDisabled: false,
                isSelected: false,
                pendingAction: undefined,
            },
            {
                text: 'Travel: Meals: Breakfast',
                keyForList: 'Travel: Meals: Breakfast',
                searchText: 'Travel: Meals: Breakfast',
                tooltipText: 'Travel: Meals: Breakfast',
                isDisabled: false,
                isSelected: false,
                pendingAction: undefined,
            },
            {
                text: 'Travel: Meals: Lunch',
                keyForList: 'Travel: Meals: Lunch',
                searchText: 'Travel: Meals: Lunch',
                tooltipText: 'Travel: Meals: Lunch',
                isDisabled: false,
                isSelected: false,
                pendingAction: undefined,
            },
            {
                text: 'Plain',
                keyForList: 'Plain',
                searchText: 'Plain',
                tooltipText: 'Plain',
                isDisabled: false,
                isSelected: false,
                pendingAction: undefined,
            },
            {
                text: 'Audi',
                keyForList: 'Audi',
                searchText: 'Audi',
                tooltipText: 'Audi',
                isDisabled: false,
                isSelected: false,
                pendingAction: undefined,
            },
            {
                text: 'Health',
                keyForList: 'Health',
                searchText: 'Health',
                tooltipText: 'Health',
                isDisabled: false,
                isSelected: false,
                pendingAction: undefined,
            },
            {
                text: 'A: B: C',
                keyForList: 'A: B: C',
                searchText: 'A: B: C',
                tooltipText: 'A: B: C',
                isDisabled: false,
                isSelected: false,
                pendingAction: undefined,
            },
            {
                text: 'A: B: C: D: E',
                keyForList: 'A: B: C: D: E',
                searchText: 'A: B: C: D: E',
                tooltipText: 'A: B: C: D: E',
                isDisabled: false,
                isSelected: false,
                pendingAction: undefined,
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
                pendingAction: 'delete' as PendingAction,
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
                pendingAction: undefined,
            },
            {
                name: 'Taxi',
                enabled: false,
                pendingAction: undefined,
            },
            {
                name: 'Test',
                enabled: true,
                pendingAction: 'delete',
            },
            {
                name: 'Test: Test1',
                enabled: true,
                pendingAction: undefined,
            },
            {
                name: 'Test: Test1: Subtest1',
                enabled: true,
                pendingAction: undefined,
            },
            {
                name: 'Test: Test1: Subtest2',
                enabled: true,
                pendingAction: undefined,
            },
            {
                name: 'Test: Test1: Subtest3',
                enabled: false,
                pendingAction: undefined,
            },
            {
                name: 'Test: Test1: Subtest4',
                enabled: true,
                pendingAction: undefined,
            },
            {
                name: 'Test: Test2',
                enabled: true,
                pendingAction: undefined,
            },
            {
                name: 'Test: Test3: Subtest1',
                enabled: true,
                pendingAction: undefined,
            },
            {
                name: 'Test1',
                enabled: true,
                pendingAction: undefined,
            },
            {
                name: 'Test1: Subtest1',
                enabled: true,
                pendingAction: undefined,
            },
            {
                name: 'Test1: Subtest2',
                enabled: true,
                pendingAction: undefined,
            },
            {
                name: 'Test1: Subtest3',
                enabled: true,
                pendingAction: undefined,
            },
            {
                name: 'Travel',
                enabled: true,
                pendingAction: undefined,
            },
            {
                name: 'Travel: Nested-Travel',
                enabled: true,
                pendingAction: undefined,
            },
            {
                name: 'Utilities',
                enabled: true,
                pendingAction: undefined,
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
                pendingAction: undefined,
            },
            {
                enabled: false,
                name: 'Cars: BMW',
                pendingAction: undefined,
            },
            {
                enabled: true,
                name: 'Cars: Mercedes-Benz',
                pendingAction: undefined,
            },
            {
                enabled: true,
                name: 'Food',
                pendingAction: undefined,
            },
            {
                enabled: true,
                name: 'Food: Meat',
                pendingAction: undefined,
            },
            {
                enabled: true,
                name: 'Food: Milk',
                pendingAction: undefined,
            },
            {
                enabled: false,
                name: 'Food: Vegetables',
                pendingAction: undefined,
            },
            {
                enabled: false,
                name: 'Medical',
                pendingAction: undefined,
            },
            {
                enabled: true,
                name: 'Restaurant',
                pendingAction: undefined,
            },
            {
                enabled: false,
                name: 'Taxi',
                pendingAction: undefined,
            },
            {
                enabled: true,
                name: 'Travel: Meals',
                pendingAction: undefined,
            },
            {
                enabled: true,
                name: 'Travel: Meals: Breakfast',
                pendingAction: undefined,
            },
            {
                enabled: false,
                name: 'Travel: Meals: Dinner',
                pendingAction: undefined,
            },
            {
                enabled: true,
                name: 'Travel: Meals: Lunch',
                pendingAction: undefined,
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
                pendingAction: undefined,
            },
            {
                enabled: true,
                name: 'House, M.D.',
                pendingAction: undefined,
            },
            {
                enabled: true,
                name: 'Many.dots.on.the.way.',
                pendingAction: undefined,
            },
            {
                enabled: false,
                name: 'More.Many.dots.on.the.way.',
                pendingAction: undefined,
            },
            {
                enabled: true,
                name: 'Movies',
                pendingAction: undefined,
            },
            {
                enabled: true,
                name: 'Movies: Mr. Nobody',
                pendingAction: undefined,
            },
        ];

        expect(OptionsListUtils.sortCategories(categoriesIncorrectOrdering)).toStrictEqual(result);
        expect(OptionsListUtils.sortCategories(categoriesIncorrectOrdering2)).toStrictEqual(result2);
        expect(OptionsListUtils.sortCategories(categoriesIncorrectOrdering3)).toStrictEqual(result3);
    });

    it('formatMemberForList()', () => {
        const formattedMembers = Object.values(PERSONAL_DETAILS).map((personalDetail) => OptionsListUtils.formatMemberForList(personalDetail));

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

    describe('filterOptions', () => {
        it('should return all options when search is empty', () => {
            const options = OptionsListUtils.getSearchOptions(OPTIONS, '', [CONST.BETAS.ALL]);
            const filteredOptions = OptionsListUtils.filterOptions(options, '');

            expect(filteredOptions.recentReports.length + filteredOptions.personalDetails.length).toBe(12);
        });

        it('should return filtered options in correct order', () => {
            const searchText = 'man';
            const options = OptionsListUtils.getSearchOptions(OPTIONS, '', [CONST.BETAS.ALL]);

            const filteredOptions = OptionsListUtils.filterOptions(options, searchText, {sortByReportTypeInSearch: true});
            expect(filteredOptions.recentReports.length).toBe(4);
            expect(filteredOptions.recentReports.at(0)?.text).toBe('Invisible Woman');
            expect(filteredOptions.recentReports.at(1)?.text).toBe('Spider-Man');
            expect(filteredOptions.recentReports.at(2)?.text).toBe('Black Widow');
            expect(filteredOptions.recentReports.at(3)?.text).toBe('Mister Fantastic, Invisible Woman');
        });

        it('should filter users by email', () => {
            const searchText = 'mistersinister@marauders.com';
            const options = OptionsListUtils.getSearchOptions(OPTIONS, '', [CONST.BETAS.ALL]);

            const filteredOptions = OptionsListUtils.filterOptions(options, searchText);

            expect(filteredOptions.recentReports.length).toBe(1);
            expect(filteredOptions.recentReports.at(0)?.text).toBe('Mr Sinister');
        });

        it('should find archived chats', () => {
            const searchText = 'Archived';
            const options = OptionsListUtils.getSearchOptions(OPTIONS, '', [CONST.BETAS.ALL]);
            const filteredOptions = OptionsListUtils.filterOptions(options, searchText);

            expect(filteredOptions.recentReports.length).toBe(1);
            expect(!!filteredOptions.recentReports.at(0)?.private_isArchived).toBe(true);
        });

        it('should filter options by email if dot is skipped in the email', () => {
            const searchText = 'barryallen';
            const OPTIONS_WITH_PERIODS = OptionsListUtils.createOptionList(PERSONAL_DETAILS_WITH_PERIODS, REPORTS);
            const options = OptionsListUtils.getSearchOptions(OPTIONS_WITH_PERIODS, '', [CONST.BETAS.ALL]);

            const filteredOptions = OptionsListUtils.filterOptions(options, searchText, {sortByReportTypeInSearch: true});

            expect(filteredOptions.recentReports.length).toBe(1);
            expect(filteredOptions.recentReports.at(0)?.login).toBe('barry.allen@expensify.com');
        });

        it('should include workspace rooms in the search results', () => {
            const searchText = 'avengers';
            const options = OptionsListUtils.getSearchOptions(OPTIONS_WITH_WORKSPACE_ROOM, '', [CONST.BETAS.ALL]);

            const filteredOptions = OptionsListUtils.filterOptions(options, searchText);

            expect(filteredOptions.recentReports.length).toBe(1);
            expect(filteredOptions.recentReports.at(0)?.subtitle).toBe('Avengers Room');
        });

        it('should put exact match by login on the top of the list', () => {
            const searchText = 'reedrichards@expensify.com';
            const options = OptionsListUtils.getSearchOptions(OPTIONS, '', [CONST.BETAS.ALL]);

            const filteredOptions = OptionsListUtils.filterOptions(options, searchText);

            expect(filteredOptions.recentReports.length).toBe(1);
            expect(filteredOptions.recentReports.at(0)?.login).toBe(searchText);
        });

        it('should prioritize options with matching display name over chatrooms', () => {
            const searchText = 'spider';
            const OPTIONS_WITH_CHATROOMS = OptionsListUtils.createOptionList(PERSONAL_DETAILS, REPORTS_WITH_CHAT_ROOM);
            const options = OptionsListUtils.getSearchOptions(OPTIONS_WITH_CHATROOMS, '', [CONST.BETAS.ALL]);

            const filterOptions = OptionsListUtils.filterOptions(options, searchText);

            expect(filterOptions.recentReports.length).toBe(2);
            expect(filterOptions.recentReports.at(1)?.isChatRoom).toBe(true);
        });

        it('should put the item with latest lastVisibleActionCreated on top when search value match multiple items', () => {
            const searchText = 'fantastic';

            const options = OptionsListUtils.getSearchOptions(OPTIONS, '');
            const filteredOptions = OptionsListUtils.filterOptions(options, searchText);

            expect(filteredOptions.recentReports.length).toBe(2);
            expect(filteredOptions.recentReports.at(0)?.text).toBe('Mister Fantastic');
            expect(filteredOptions.recentReports.at(1)?.text).toBe('Mister Fantastic, Invisible Woman');
        });

        it('should return the user to invite when the search value is a valid, non-existent email', () => {
            const searchText = 'test@email.com';

            const options = OptionsListUtils.getSearchOptions(OPTIONS, '');
            const filteredOptions = OptionsListUtils.filterOptions(options, searchText);

            expect(filteredOptions.userToInvite?.login).toBe(searchText);
        });

        it('should not return any results if the search value is on an exluded logins list', () => {
            const searchText = 'admin@expensify.com';

            const options = OptionsListUtils.getFilteredOptions({reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails, excludeLogins: CONST.EXPENSIFY_EMAILS});
            const filterOptions = OptionsListUtils.filterOptions(options, searchText, {excludeLogins: CONST.EXPENSIFY_EMAILS});
            expect(filterOptions.recentReports.length).toBe(0);
        });

        it('should return the user to invite when the search value is a valid, non-existent email and the user is not excluded', () => {
            const searchText = 'test@email.com';

            const options = OptionsListUtils.getSearchOptions(OPTIONS, '');
            const filteredOptions = OptionsListUtils.filterOptions(options, searchText, {excludeLogins: CONST.EXPENSIFY_EMAILS});

            expect(filteredOptions.userToInvite?.login).toBe(searchText);
        });

        it('should return limited amount of recent reports if the limit is set', () => {
            const searchText = '';

            const options = OptionsListUtils.getSearchOptions(OPTIONS, '');
            const filteredOptions = OptionsListUtils.filterOptions(options, searchText, {maxRecentReportsToShow: 2});

            expect(filteredOptions.recentReports.length).toBe(2);
        });

        it('should not return any user to invite if email exists on the personal details list', () => {
            const searchText = 'natasharomanoff@expensify.com';
            const options = OptionsListUtils.getSearchOptions(OPTIONS, '', [CONST.BETAS.ALL]);

            const filteredOptions = OptionsListUtils.filterOptions(options, searchText);
            expect(filteredOptions.personalDetails.length).toBe(1);
            expect(filteredOptions.userToInvite).toBe(null);
        });

        it('should not return any options if search value does not match any personal details (getMemberInviteOptions)', () => {
            const options = OptionsListUtils.getMemberInviteOptions(OPTIONS.personalDetails, [], '');
            const filteredOptions = OptionsListUtils.filterOptions(options, 'magneto');
            expect(filteredOptions.personalDetails.length).toBe(0);
        });

        it('should return one personal detail if search value matches an email (getMemberInviteOptions)', () => {
            const options = OptionsListUtils.getMemberInviteOptions(OPTIONS.personalDetails, [], '');
            const filteredOptions = OptionsListUtils.filterOptions(options, 'peterparker@expensify.com');

            expect(filteredOptions.personalDetails.length).toBe(1);
            expect(filteredOptions.personalDetails.at(0)?.text).toBe('Spider-Man');
        });

        it('should not show any recent reports if a search value does not match the group chat name (getShareDestinationsOptions)', () => {
            // Filter current REPORTS as we do in the component, before getting share destination options
            const filteredReports = Object.values(OPTIONS.reports).reduce<OptionsListUtils.OptionList['reports']>((filtered, option) => {
                const report = option.item;
                if (ReportUtils.canUserPerformWriteAction(report) && ReportUtils.canCreateTaskInReport(report) && !ReportUtils.isCanceledTaskReport(report)) {
                    filtered.push(option);
                }
                return filtered;
            }, []);
            const options = OptionsListUtils.getShareDestinationOptions(filteredReports, OPTIONS.personalDetails, [], '');
            const filteredOptions = OptionsListUtils.filterOptions(options, 'mutants');

            expect(filteredOptions.recentReports.length).toBe(0);
        });

        it('should return a workspace room when we search for a workspace room(getShareDestinationsOptions)', () => {
            const filteredReportsWithWorkspaceRooms = Object.values(OPTIONS_WITH_WORKSPACE_ROOM.reports).reduce<OptionsListUtils.OptionList['reports']>((filtered, option) => {
                const report = option.item;
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                if (ReportUtils.canUserPerformWriteAction(report) || ReportUtils.isExpensifyOnlyParticipantInReport(report)) {
                    filtered.push(option);
                }
                return filtered;
            }, []);

            const options = OptionsListUtils.getShareDestinationOptions(filteredReportsWithWorkspaceRooms, OPTIONS.personalDetails, [], '');
            const filteredOptions = OptionsListUtils.filterOptions(options, 'Avengers Room');

            expect(filteredOptions.recentReports.length).toBe(1);
        });

        it('should not show any results if searching for a non-existing workspace room(getShareDestinationOptions)', () => {
            const filteredReportsWithWorkspaceRooms = Object.values(OPTIONS_WITH_WORKSPACE_ROOM.reports).reduce<OptionsListUtils.OptionList['reports']>((filtered, option) => {
                const report = option.item;
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                if (ReportUtils.canUserPerformWriteAction(report) || ReportUtils.isExpensifyOnlyParticipantInReport(report)) {
                    filtered.push(option);
                }
                return filtered;
            }, []);

            const options = OptionsListUtils.getShareDestinationOptions(filteredReportsWithWorkspaceRooms, OPTIONS.personalDetails, [], '');
            const filteredOptions = OptionsListUtils.filterOptions(options, 'Mutants Lair');

            expect(filteredOptions.recentReports.length).toBe(0);
        });

        it('should show the option from personal details when searching for personal detail with no existing report (getFilteredOptions)', () => {
            const options = OptionsListUtils.getFilteredOptions({reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails});
            const filteredOptions = OptionsListUtils.filterOptions(options, 'hulk');

            expect(filteredOptions.recentReports.length).toBe(0);

            expect(filteredOptions.personalDetails.length).toBe(1);
            expect(filteredOptions.personalDetails.at(0)?.login).toBe('brucebanner@expensify.com');
        });

        it('should return all matching reports and personal details (getFilteredOptions)', () => {
            const options = OptionsListUtils.getFilteredOptions({reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails});
            const filteredOptions = OptionsListUtils.filterOptions(options, '.com');

            expect(filteredOptions.recentReports.length).toBe(5);
            expect(filteredOptions.recentReports.at(0)?.text).toBe('Captain America');

            expect(filteredOptions.personalDetails.length).toBe(4);
            expect(filteredOptions.personalDetails.at(0)?.login).toBe('natasharomanoff@expensify.com');
        });

        it('should not return any options or user to invite if there are no search results and the string does not match a potential email or phone (getFilteredOptions)', () => {
            const options = OptionsListUtils.getFilteredOptions({reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails});
            const filteredOptions = OptionsListUtils.filterOptions(options, 'marc@expensify');

            expect(filteredOptions.recentReports.length).toBe(0);
            expect(filteredOptions.personalDetails.length).toBe(0);
            expect(filteredOptions.userToInvite).toBe(null);
        });

        it('should not return any options but should return an user to invite if no matching options exist and the search value is a potential email (getFilteredOptions)', () => {
            const options = OptionsListUtils.getFilteredOptions({reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails});
            const filteredOptions = OptionsListUtils.filterOptions(options, 'marc@expensify.com');

            expect(filteredOptions.recentReports.length).toBe(0);
            expect(filteredOptions.personalDetails.length).toBe(0);
            expect(filteredOptions.userToInvite).not.toBe(null);
        });

        it('should return user to invite when search term has a period with options for it that do not contain the period (getFilteredOptions)', () => {
            const options = OptionsListUtils.getFilteredOptions({reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails});
            const filteredOptions = OptionsListUtils.filterOptions(options, 'peter.parker@expensify.com');

            expect(filteredOptions.recentReports.length).toBe(0);
            expect(filteredOptions.userToInvite).not.toBe(null);
        });

        it('should not return options but should return an user to invite if no matching options exist and the search value is a potential phone number (getFilteredOptions)', () => {
            const options = OptionsListUtils.getFilteredOptions({reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails});
            const filteredOptions = OptionsListUtils.filterOptions(options, '5005550006');

            expect(filteredOptions.recentReports.length).toBe(0);
            expect(filteredOptions.personalDetails.length).toBe(0);
            expect(filteredOptions.userToInvite).not.toBe(null);
            expect(filteredOptions.userToInvite?.login).toBe('+15005550006');
        });

        it('should not return options but should return an user to invite if no matching options exist and the search value is a potential phone number with country code added (getFilteredOptions)', () => {
            const options = OptionsListUtils.getFilteredOptions({reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails});
            const filteredOptions = OptionsListUtils.filterOptions(options, '+15005550006');

            expect(filteredOptions.recentReports.length).toBe(0);
            expect(filteredOptions.personalDetails.length).toBe(0);
            expect(filteredOptions.userToInvite).not.toBe(null);
            expect(filteredOptions.userToInvite?.login).toBe('+15005550006');
        });

        it('should not return options but should return an user to invite if no matching options exist and the search value is a potential phone number with special characters added (getFilteredOptions)', () => {
            const options = OptionsListUtils.getFilteredOptions({reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails});
            const filteredOptions = OptionsListUtils.filterOptions(options, '+1 (800)324-3233');

            expect(filteredOptions.recentReports.length).toBe(0);
            expect(filteredOptions.personalDetails.length).toBe(0);
            expect(filteredOptions.userToInvite).not.toBe(null);
            expect(filteredOptions.userToInvite?.login).toBe('+18003243233');
        });

        it('should not return any options or user to invite if contact number contains alphabet characters (getFilteredOptions)', () => {
            const options = OptionsListUtils.getFilteredOptions({reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails});
            const filteredOptions = OptionsListUtils.filterOptions(options, '998243aaaa');

            expect(filteredOptions.recentReports.length).toBe(0);
            expect(filteredOptions.personalDetails.length).toBe(0);
            expect(filteredOptions.userToInvite).toBe(null);
        });

        it('should not return any options if search value does not match any personal details (getFilteredOptions)', () => {
            const options = OptionsListUtils.getFilteredOptions({reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails});
            const filteredOptions = OptionsListUtils.filterOptions(options, 'magneto');

            expect(filteredOptions.personalDetails.length).toBe(0);
        });

        it('should return one recent report and no personal details if a search value provides an email (getFilteredOptions)', () => {
            const options = OptionsListUtils.getFilteredOptions({reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails});
            const filteredOptions = OptionsListUtils.filterOptions(options, 'peterparker@expensify.com', {sortByReportTypeInSearch: true});
            expect(filteredOptions.recentReports.length).toBe(1);
            expect(filteredOptions.recentReports.at(0)?.text).toBe('Spider-Man');
            expect(filteredOptions.personalDetails.length).toBe(0);
        });

        it('should return all matching reports and personal details (getFilteredOptions)', () => {
            const options = OptionsListUtils.getFilteredOptions({reports: OPTIONS.reports, personalDetails: OPTIONS.personalDetails});
            const filteredOptions = OptionsListUtils.filterOptions(options, '.com');

            expect(filteredOptions.personalDetails.length).toBe(4);
            expect(filteredOptions.recentReports.length).toBe(5);
            expect(filteredOptions.personalDetails.at(0)?.login).toBe('natasharomanoff@expensify.com');
            expect(filteredOptions.recentReports.at(0)?.text).toBe('Captain America');
            expect(filteredOptions.recentReports.at(1)?.text).toBe('Mr Sinister');
            expect(filteredOptions.recentReports.at(2)?.text).toBe('Black Panther');
        });

        it('should return matching option when searching (getSearchOptions)', () => {
            const options = OptionsListUtils.getSearchOptions(OPTIONS, '');
            const filteredOptions = OptionsListUtils.filterOptions(options, 'spider');

            expect(filteredOptions.recentReports.length).toBe(1);
            expect(filteredOptions.recentReports.at(0)?.text).toBe('Spider-Man');
        });

        it('should return latest lastVisibleActionCreated item on top when search value matches multiple items (getSearchOptions)', () => {
            const options = OptionsListUtils.getSearchOptions(OPTIONS, '');
            const filteredOptions = OptionsListUtils.filterOptions(options, 'fantastic');

            expect(filteredOptions.recentReports.length).toBe(2);
            expect(filteredOptions.recentReports.at(0)?.text).toBe('Mister Fantastic');
            expect(filteredOptions.recentReports.at(1)?.text).toBe('Mister Fantastic, Invisible Woman');

            return waitForBatchedUpdates()
                .then(() => Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, PERSONAL_DETAILS_WITH_PERIODS))
                .then(() => {
                    const OPTIONS_WITH_PERIODS = OptionsListUtils.createOptionList(PERSONAL_DETAILS_WITH_PERIODS, REPORTS);
                    const results = OptionsListUtils.getSearchOptions(OPTIONS_WITH_PERIODS, '');
                    const filteredResults = OptionsListUtils.filterOptions(results, 'barry.allen@expensify.com', {sortByReportTypeInSearch: true});

                    expect(filteredResults.recentReports.length).toBe(1);
                    expect(filteredResults.recentReports.at(0)?.text).toBe('The Flash');
                });
        });
    });

    describe('canCreateOptimisticPersonalDetailOption', () => {
        const VALID_EMAIL = 'valid@email.com';
        it('should allow to create optimistic personal detail option if email is valid', () => {
            const canCreate = OptionsListUtils.canCreateOptimisticPersonalDetailOption({
                searchValue: VALID_EMAIL,
                recentReportOptions: OPTIONS.reports,
                personalDetailsOptions: OPTIONS.personalDetails,
                currentUserOption: null,
                excludeUnknownUsers: false,
            });

            expect(canCreate).toBe(true);
        });

        it('should not allow to create option if email is an email of current user', () => {
            const currentUserEmail = 'tonystark@expensify.com';
            const canCreate = OptionsListUtils.canCreateOptimisticPersonalDetailOption({
                searchValue: currentUserEmail,
                recentReportOptions: OPTIONS.reports,
                personalDetailsOptions: OPTIONS.personalDetails,
                currentUserOption: null,
                excludeUnknownUsers: false,
            });

            expect(canCreate).toBe(false);
        });
    });
});
