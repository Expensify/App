import {rand} from '@ngneat/falso';
import Onyx from 'react-native-onyx';
import type * as NativeNavigation from '@react-navigation/native';
import {measureFunction} from 'reassure';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetails} from '@src/types/onyx';
import type Report from '@src/types/onyx/Report';
import type * as ReportUtils from '@libs/ReportUtils';
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
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
        Onyx.merge(ONYXKEYS.PERSONAL_DETAILS, personalDetails);
    });

    afterAll(() => Onyx.clear());

    test('Test with an empty search term and a large number of selectedOptions', async () => {
        const selectedOptions = Array.from({length: SELECTED_OPTIONS_COUNT}, (_, i) => ({
            accountID: i.toString(),
            searchText: `Option ${i}`,
        }));
        await measureFunction(() =>
            formatSectionsFromSearchTerm('', selectedOptions, [], [], false),
        );
    });

    test('Test with a search term that matches a subset of a large selectedOptions array', async () => {
        const selectedOptions = Array.from({length: SELECTED_OPTIONS_COUNT}, (_, i) => ({
            accountID: i.toString(),
            searchText: i % 2 === 0 ? 'John Smith' : `Option ${i}`,
        }));
        await measureFunction(() =>
            formatSectionsFromSearchTerm('john', selectedOptions, [], [], false),
        );
    });

    test('Test with a search term that matches recent reports but not personal details', async () => {
        const selectedOptions: ReportUtils.OptionData[] = [];
        const filteredRecentReports = Array.from({length: RECENT_REPORTS_COUNT}, (_, i) => ({
            accountID: i.toString(),
            searchText: `Recent Report ${i}`,
        }));
        const filteredPersonalDetails: ReportUtils.OptionData[] = [];
        
        await measureFunction(() =>
            formatSectionsFromSearchTerm('recent', selectedOptions, filteredRecentReports, filteredPersonalDetails, false),
        );
    });

    test('Test with a search term that matches personal details but not recent reports', async () => {
        const selectedOptions: ReportUtils.OptionData[] = [];
        const filteredRecentReports: ReportUtils.OptionData[] = [];
        const filteredPersonalDetails = Array.from({length: PERSONAL_DETAILS_COUNT}, (_, i) => ({
            accountID: i.toString(),
            searchText: `Personal Detail ${i}`,
        }));
        
        await measureFunction(() =>
            formatSectionsFromSearchTerm('personal', selectedOptions, filteredRecentReports, filteredPersonalDetails, false),
        );
    });

    test('Test with a search term that matches neither recent reports nor personal details', async () => {
        const selectedOptions = Array.from({length: 10}, (_, i) => ({
            accountID: i.toString(),
            searchText: `Option ${i}`,
        }));
        const filteredRecentReports = Array.from({length: RECENT_REPORTS_COUNT}, (_, i) => ({
            accountID: (i + 10).toString(), 
            searchText: `Recent Report ${i}`,
        }));
        const filteredPersonalDetails = Array.from({length: PERSONAL_DETAILS_COUNT}, (_, i) => ({
            accountID: (i + 110).toString(),
            searchText: `Personal Detail ${i}`,  
        }));
        
        await measureFunction(() =>
            formatSectionsFromSearchTerm('unmatched', selectedOptions, filteredRecentReports, filteredPersonalDetails, false),
        );
    });
});
