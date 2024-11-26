import {rand} from '@ngneat/falso';
import type * as NativeNavigation from '@react-navigation/native';
import Onyx from 'react-native-onyx';
import {measureFunction} from 'reassure';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import type {OptionData} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetails} from '@src/types/onyx';
import type Report from '@src/types/onyx/Report';
import {formatSectionsFromSearchTerm} from '../../src/libs/OptionsListUtils';
import createCollection from '../utils/collections/createCollection';
import createRandomOptionData from '../utils/collections/optionData';
import createPersonalDetails from '../utils/collections/personalDetails';
import {getRandomDate} from '../utils/collections/reportActions';
import createRandomReport from '../utils/collections/reports';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

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

const getMockedReports = (length = 500) =>
    createCollection<Report>(
        (item) => `${ONYXKEYS.COLLECTION.REPORT}${item.reportID}`,
        (index) => ({
            ...createRandomReport(index),
            type: rand(Object.values(CONST.REPORT.TYPE)),
            lastVisibleActionCreated: getRandomDate(),
        }),
        length,
    );

const getMockedPersonalDetails = (length = 500) =>
    createCollection<PersonalDetails>(
        (item) => item.accountID,
        (index) => createPersonalDetails(index),
        length,
    );

const mockedReportsMap = getMockedReports(REPORTS_COUNT) as Record<`${typeof ONYXKEYS.COLLECTION.REPORT}`, Report>;
const mockedPersonalDetailsMap = getMockedPersonalDetails(PERSONAL_DETAILS_LIST_COUNT);

const mockedBetas = Object.values(CONST.BETAS);

jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual<typeof NativeNavigation>('@react-navigation/native');
    return {
        ...actualNav,
        createNavigationContainerRef: () => ({
            getState: () => jest.fn(),
        }),
    };
});

const options = OptionsListUtils.createOptionList(personalDetails, reports);

/* GetOption is the private function and is never called directly, we are testing the functions which call getOption with different params */
describe('OptionsListUtils', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });

        Onyx.multiSet({
            ...mockedReportsMap,
            ...mockedPersonalDetailsMap,
        });
    });

    afterAll(() => {
        Onyx.clear();
    });

    /* Testing getSearchOptions */
    test('[OptionsListUtils] getSearchOptions', async () => {
        await waitForBatchedUpdates();
        await measureFunction(() => OptionsListUtils.getSearchOptions(options, mockedBetas));
    });

    /* Testing getShareLogOptions */
    test('[OptionsListUtils] getShareLogOptions', async () => {
        await waitForBatchedUpdates();
        await measureFunction(() => OptionsListUtils.getShareLogOptions(options, mockedBetas));
    });

    /* Testing getFilteredOptions */
    test('[OptionsListUtils] getFilteredOptions with search value', async () => {
        await waitForBatchedUpdates();
        await measureFunction(() => {
            const formattedOptions = OptionsListUtils.getValidOptions({reports: options.reports, personalDetails: options.personalDetails}, {betas: mockedBetas});
            OptionsListUtils.filterAndOrderOptions(formattedOptions, SEARCH_VALUE);
        });
    });

    /* Testing getShareDestinationOptions */
    test('[OptionsListUtils] getShareDestinationOptions', async () => {
        await waitForBatchedUpdates();
        await measureFunction(() => OptionsListUtils.getShareDestinationOptions(options.reports, options.personalDetails, mockedBetas));
    });

    /* Testing getMemberInviteOptions */
    test('[OptionsListUtils] getMemberInviteOptions', async () => {
        await waitForBatchedUpdates();
        await measureFunction(() => OptionsListUtils.getMemberInviteOptions(options.personalDetails, mockedBetas));
    });

    test('[OptionsListUtils] worst case scenario with a search term that matches a subset of selectedOptions, filteredRecentReports, and filteredPersonalDetails', async () => {
        const SELECTED_OPTION_TEXT = 'Selected Option';
        const RECENT_REPORT_TEXT = 'Recent Report';
        const PERSONAL_DETAIL_TEXT = 'Personal Detail';

        const SELECTED_OPTIONS_MATCH_FREQUENCY = 2;
        const RECENT_REPORTS_MATCH_FREQUENCY = 3;
        const PERSONAL_DETAILS_MATCH_FREQUENCY = 5;

        const selectedOptions = createCollection<OptionData>(
            (item) => item.reportID,
            (index) => ({
                ...createRandomOptionData(index),
                searchText: index % SELECTED_OPTIONS_MATCH_FREQUENCY === 0 ? SEARCH_VALUE : `${SELECTED_OPTION_TEXT} ${index}`,
            }),
            SELECTED_OPTIONS_COUNT,
        );
        const filteredRecentReports = createCollection<OptionData>(
            (item) => item.reportID,
            (index) => ({
                ...createRandomOptionData(index + SELECTED_OPTIONS_COUNT),
                searchText: index % RECENT_REPORTS_MATCH_FREQUENCY === 0 ? SEARCH_VALUE : `${RECENT_REPORT_TEXT} ${index}`,
            }),
            RECENT_REPORTS_COUNT,
        );
        const filteredPersonalDetails = createCollection<OptionData>(
            (item) => item.reportID,
            (index) => ({
                ...createRandomOptionData(index + SELECTED_OPTIONS_COUNT + RECENT_REPORTS_COUNT),
                searchText: index % PERSONAL_DETAILS_MATCH_FREQUENCY === 0 ? SEARCH_VALUE : `${PERSONAL_DETAIL_TEXT} ${index}`,
            }),
            PERSONAL_DETAILS_COUNT,
        );

        const mockedPersonalDetails = getMockedPersonalDetails(PERSONAL_DETAILS_COUNT);

        await measureFunction(() =>
            formatSectionsFromSearchTerm(
                SEARCH_VALUE,
                Object.values(selectedOptions),
                Object.values(filteredRecentReports),
                Object.values(filteredPersonalDetails),
                mockedPersonalDetails,
                true,
            ),
        );
    });

    test('[OptionsListUtils] empty search term with selected options and mocked personal details', async () => {
        const selectedOptions = createCollection<OptionData>((item) => item.reportID, createRandomOptionData, SELECTED_OPTIONS_COUNT);

        const mockedPersonalDetails = getMockedPersonalDetails(PERSONAL_DETAILS_COUNT);

        await waitForBatchedUpdates();
        await measureFunction(() => formatSectionsFromSearchTerm('', Object.values(selectedOptions), [], [], mockedPersonalDetails, true));
    });
});
