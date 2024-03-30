import {rand} from '@ngneat/falso';
import type * as NativeNavigation from '@react-navigation/native';
import {measureFunction} from 'reassure';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetails} from '@src/types/onyx';
import type Report from '@src/types/onyx/Report';
import type {OptionData} from '@libs/ReportUtils';
import createRandomOptionData from 'tests/utils/collections/optionData';
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


    /* formatSectionsFromSearchTerm performance tests */
    test('[OptionsListUtils] formatSectionsFromSearchTerm with an empty search term and a large number of selectedOptions', async () => {
        const selectedOptions = createCollection<OptionData>(
            (item) => item.reportID,
            createRandomOptionData,
            SELECTED_OPTIONS_COUNT,
        );
        
        await measureFunction(() =>
            formatSectionsFromSearchTerm('john', Object.values(selectedOptions), [], [], false, 0, personalDetails, false),
        );
    });

    test('[OptionsListUtils] formatSectionsFromSearchTerm with a search term that matches a subset of a large selectedOptions array', async () => {
        const selectedOptions = createCollection<OptionData>(
            (item) => item.reportID,
            (index) => ({
                ...createRandomOptionData(index),
                searchText: index % 2 === 0 ? 'John Smith' : `Option ${index}`,
            }),
            SELECTED_OPTIONS_COUNT,
        );
        await measureFunction(() =>
            formatSectionsFromSearchTerm('john', Object.values(selectedOptions), [], [], false, 0, personalDetails, false),
        );
    });

    test('[OptionsListUtils] formatSectionsFromSearchTerm with a search term that matches recent reports but not personal details', async () => {
        const filteredRecentReports = createCollection<OptionData>(
            (item) => item.reportID,
            (index) => ({
                ...createRandomOptionData(index),
                searchText: `Recent Report ${index}`,
            }),
            RECENT_REPORTS_COUNT,
        );
        
        await measureFunction(() =>
            formatSectionsFromSearchTerm('recent', Object.values(filteredRecentReports), Object.values(filteredRecentReports), Object.values(filteredPersonalDetails), false, 0, personalDetails, false),
        );
    });

    test('OptionsListUtils] formatSectionsFromSearchTerm with a search term that matches personal details but not recent reports', async () => {
        const filteredPersonalDetails = createCollection<OptionData>(
            (item) => item.reportID,
            (index) => ({
                ...createRandomOptionData(index),
                searchText: `Personal Detail ${index}`,
            }),
            PERSONAL_DETAILS_COUNT,
        );
        
        await measureFunction(() =>
            formatSectionsFromSearchTerm('personal', [], [], Object.values(filteredPersonalDetails), false, 0, personalDetails, false),
        );
    });

    test('[OptionsListUtils] formatSectionsFromSearchTerm with a search term that matches neither recent reports nor personal details', async () => {
        const selectedOptions = createCollection<OptionData>(
            (item) => item.reportID,
            createRandomOptionData,
            10,
        );
        const filteredRecentReports = createCollection<OptionData>(
            (item) => item.reportID,
            (index) => ({
                ...createRandomOptionData(index + 10),
                searchText: `Recent Report ${index}`,
            }),
            RECENT_REPORTS_COUNT,
        );
        const filteredPersonalDetails = createCollection<OptionData>(
            (item) => item.reportID,
            (index) => ({
                ...createRandomOptionData(index + 110),
                searchText: `Personal Detail ${index}`,
            }),
            PERSONAL_DETAILS_COUNT,
        );
        
        await measureFunction(() =>
            formatSectionsFromSearchTerm('unmatched', Object.values(selectedOptions), Object.values(filteredRecentReports), Object.values(filteredPersonalDetails), false, 0, personalDetails, false),
        );
    });

    test('[OptionsListUtils] worst case scenario with a search term that matches a subset of selectedOptions, filteredRecentReports, and filteredPersonalDetails', async () => {
        const selectedOptions = createCollection<OptionData>(
            (item) => item.reportID,
            (index) => ({
                ...createRandomOptionData(index),
                searchText: index % 2 === 0 ? 'John Smith' : `Option ${index}`,
            }),
            SELECTED_OPTIONS_COUNT,
        );
        const filteredRecentReports = createCollection<OptionData>(
            (item) => item.reportID,
            (index) => ({
                ...createRandomOptionData(index + SELECTED_OPTIONS_COUNT),
                searchText: index % 3 === 0 ? 'John Smith' : `Recent Report ${index}`,
            }),
            RECENT_REPORTS_COUNT,
        );
        const filteredPersonalDetails = createCollection<OptionData>(
            (item) => item.reportID,
            (index) => ({
                ...createRandomOptionData(index + SELECTED_OPTIONS_COUNT + RECENT_REPORTS_COUNT),
                searchText: index % 5 === 0 ? 'John Smith' : `Personal Detail ${index}`,
            }),
            PERSONAL_DETAILS_COUNT,
        );

        await measureFunction(() => 
            formatSectionsFromSearchTerm('john', Object.values(selectedOptions),  Object.values(filteredRecentReports),  Object.values(filteredPersonalDetails), false, 0, personalDetails, true)
        );
    });

    test('[OptionsListUtils] with a large number of selectedOptions and shouldGetOptionDetails set to true', async () => {
        const selectedOptions = createCollection<OptionData>(
            (item) => item.reportID,
            createRandomOptionData,
            SELECTED_OPTIONS_COUNT,
        );

        await measureFunction(() =>
            formatSectionsFromSearchTerm('', Object.values(selectedOptions), [], [], true, 0, personalDetails, true)
        );
    });

    test('[OptionsListUtils] with a search term that matches selectedOptions and maxOptionsSelected set to true', async () => {
        const selectedOptions = createCollection<OptionData>(
            (item) => item.reportID,
            (index) => ({
                ...createRandomOptionData(index),
                searchText: index % 2 === 0 ? 'John Smith' : `Option ${index}`,
            }),
            SELECTED_OPTIONS_COUNT,
        );

        await measureFunction(() =>
            formatSectionsFromSearchTerm('john', Object.values(selectedOptions), [], [], true, 0, personalDetails, false)  
        );
    });
});