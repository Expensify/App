import {rand} from '@ngneat/falso';
import type * as NativeNavigation from '@react-navigation/native';
import {measureFunction} from 'reassure';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetails} from '@src/types/onyx';
import type Report from '@src/types/onyx/Report';
import type {OptionData} from '@libs/ReportUtils';
import createCollection from '../utils/collections/createCollection';
import createPersonalDetails from '../utils/collections/personalDetails';
import {getRandomDate} from '../utils/collections/reportActions';
import createRandomReport from '../utils/collections/reports';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import {formatSectionsFromSearchTerm} from '../../src/libs/OptionsListUtils';

const REPORTS_COUNT = 5000;
const PERSONAL_DETAILS_LIST_COUNT = 1000;
const SEARCH_VALUE = 'TestingValue';

const PERSONAL_DETAILS_COUNT = 1000;
const SELECTED_OPTIONS_COUNT = 1000;
const RECENT_REPORTS_COUNT = 100;

const reports = createCollection<Report>(
    (item) => `${ONYXKEYS.COLLECTION.REPORT}${item.reportID}`,
    (index) => ({
        ...createRandomReport(index),
        type: rand(Object.values(CONST.REPORT.TYPE)),
        lastVisibleActionCreated: getRandomDate(),
    }),
    REPORTS_COUNT,
);

const personalDetails = createCollection<PersonalDetails>(
    (item) => item.accountID,
    (index) => createPersonalDetails(index),
    PERSONAL_DETAILS_LIST_COUNT,
);

const mockedBetas = Object.values(CONST.BETAS);

jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual('@react-navigation/native');
    return {
        ...actualNav,
        createNavigationContainerRef: () => ({
            getState: () => jest.fn(),
        }),
    } as typeof NativeNavigation;
});

/* GetOption is the private function and is never called directly, we are testing the functions which call getOption with different params */
describe('OptionsListUtils', () => {
    /* Testing getSearchOptions */
    test('[OptionsListUtils] getSearchOptions with search value', async () => {
        await waitForBatchedUpdates();
        await measureFunction(() => OptionsListUtils.getSearchOptions(reports, personalDetails, SEARCH_VALUE, mockedBetas));
    });

    /* Testing getShareLogOptions */
    test('[OptionsListUtils] getShareLogOptions with search value', async () => {
        await waitForBatchedUpdates();
        await measureFunction(() => OptionsListUtils.getShareLogOptions(reports, personalDetails, SEARCH_VALUE, mockedBetas));
    });

    /* Testing getFilteredOptions */
    test('[OptionsListUtils] getFilteredOptions with search value', async () => {
        await waitForBatchedUpdates();
        await measureFunction(() => OptionsListUtils.getFilteredOptions(reports, personalDetails, mockedBetas, SEARCH_VALUE));
    });

    /* Testing getShareDestinationOptions */
    test('[OptionsListUtils] getShareDestinationOptions with search value', async () => {
        await waitForBatchedUpdates();
        await measureFunction(() => OptionsListUtils.getShareDestinationOptions(reports, personalDetails, mockedBetas, SEARCH_VALUE));
    });

    /* Testing getMemberInviteOptions */
    test('[OptionsListUtils] getMemberInviteOptions with search value', async () => {
        await waitForBatchedUpdates();
        await measureFunction(() => OptionsListUtils.getMemberInviteOptions(personalDetails, mockedBetas, SEARCH_VALUE));
    });
});

/* formatSectionsFromSearchTerm performance tests */
describe('formatSectionsFromSearchTerm', () => {
    test('[OptionsListUtils] formatSectionsFromSearchTerm with an empty search term and a large number of selectedOptions', async () => {
        const selectedOptions: ReportUtils.OptionData[] = Array.from({length: SELECTED_OPTIONS_COUNT}, (_, i) => ({
            login: `user${i}@example.com`,
            searchText: `Option ${i}`,
            reportID: `report_${i}`,
        }));
        await measureFunction(() =>
            formatSectionsFromSearchTerm('', selectedOptions, [], [], false, 0, personalDetails, false),
        );
    });

    test('[OptionsListUtils] formatSectionsFromSearchTerm with a search term that matches a subset of a large selectedOptions array', async () => {
        const selectedOptions: ReportUtils.OptionData[] = Array.from({length: SELECTED_OPTIONS_COUNT}, (_, i) => ({
            login: `user${i}@example.com`,
            searchText: i % 2 === 0 ? 'John Smith' : `Option ${i}`,
            reportID: `report_${i}`,
        }));
        await measureFunction(() =>
            formatSectionsFromSearchTerm('john', selectedOptions, [], [], false, 0, personalDetails, false),
        );
    });

    test('[OptionsListUtils] formatSectionsFromSearchTerm with a search term that matches recent reports but not personal details', async () => {
        const selectedOptions: ReportUtils.OptionData[] = [];
        const filteredRecentReports: ReportUtils.OptionData[] = Array.from({length: RECENT_REPORTS_COUNT}, (_, i) => ({
            login: `user${i}@example.com`,
            searchText: `Recent Report ${i}`,
            reportID: `report_${i}`,
        }));
        const filteredPersonalDetails: ReportUtils.OptionData[] = [];
        
        await measureFunction(() =>
            formatSectionsFromSearchTerm('recent', selectedOptions, filteredRecentReports, filteredPersonalDetails, false, 0, personalDetails, false),
        );
    });

    test('OptionsListUtils] formatSectionsFromSearchTerm with a search term that matches personal details but not recent reports', async () => {
        const selectedOptions: ReportUtils.OptionData[] = [];
        const filteredRecentReports: ReportUtils.OptionData[] = [];
        const filteredPersonalDetails: ReportUtils.OptionData[] = Array.from({length: PERSONAL_DETAILS_COUNT}, (_, i) => ({
            login: `user${i}@example.com`,
            searchText: `Personal Detail ${i}`,
            reportID: `report_${i}`,
        }));
        
        await measureFunction(() =>
            formatSectionsFromSearchTerm('personal', selectedOptions, filteredRecentReports, filteredPersonalDetails, false, 0, personalDetails, false),
        );
    });

    test('[OptionsListUtils] formatSectionsFromSearchTerm with a search term that matches neither recent reports nor personal details', async () => {
        const selectedOptions: ReportUtils.OptionData[] = Array.from({length: 10}, (_, i) => ({
            login: `user${i}@example.com`,
            searchText: `Option ${i}`,
            reportID: `report_${i}`,
        }));
        const filteredRecentReports: ReportUtils.OptionData[] = Array.from({length: RECENT_REPORTS_COUNT}, (_, i) => ({
            login: `user${i + 10}@example.com`,
            searchText: `Recent Report ${i}`,
            reportID: `report_${i + 10}`,
        }));
        const filteredPersonalDetails: ReportUtils.OptionData[] = Array.from({length: PERSONAL_DETAILS_COUNT}, (_, i) => ({
            login: `user${i + 110}@example.com`,
            searchText: `Personal Detail ${i}`,
            reportID: `report_${i + 110}`,
        }));
        
        await measureFunction(() =>
            formatSectionsFromSearchTerm('unmatched', selectedOptions, filteredRecentReports, filteredPersonalDetails, false, 0, personalDetails, false),
        );
    });
});
