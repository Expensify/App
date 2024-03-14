import {rand} from '@ngneat/falso';
import type * as NativeNavigation from '@react-navigation/native';
import Onyx from 'react-native-onyx';
import {measureFunction} from 'reassure';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetails} from '@src/types/onyx';
import type Policy from '@src/types/onyx/Policy';
import type Report from '@src/types/onyx/Report';
import type ReportAction from '@src/types/onyx/ReportAction';
import createCollection from '../utils/collections/createCollection';
import createPersonalDetails from '../utils/collections/personalDetails';
import createRandomPolicy from '../utils/collections/policies';
import createRandomReportAction, {getRandomDate} from '../utils/collections/reportActions';
import createRandomReport from '../utils/collections/reports';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const REPORTS_COUNT = 15000;
const PERSONAL_DETAILS_LIST_COUNT = 1000;

const allReports = createCollection<Report>(
    (item) => `${ONYXKEYS.COLLECTION.REPORT}${item.reportID}`,
    (index) => ({
        ...createRandomReport(index),
        type: rand(Object.values(CONST.REPORT.TYPE)),
        lastVisibleActionCreated: getRandomDate(),
    }),
    REPORTS_COUNT,
);

// const reportActions = createCollection<ReportAction>(
//     (item) => `${item.reportActionID}`,
//     (index) => createRandomReportAction(index),
// );

const personalDetails = createCollection<PersonalDetails>(
    (item) => item.accountID,
    (index) => createPersonalDetails(index),
    PERSONAL_DETAILS_LIST_COUNT,
);

// const policies = createCollection<Policy>(
//     (item) => `${ONYXKEYS.COLLECTION.POLICY}${item.id}`,
//     (index) => createRandomPolicy(index),
// );

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

describe('SidebarUtils', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
            safeEvictionKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
        });

        Onyx.multiSet({
            [ONYXKEYS.PERSONAL_DETAILS_LIST]: personalDetails,
        });
    });

    afterAll(() => {
        Onyx.clear();
    });

    test.only('[OptionsListUtils] getSearchOptions with test search value', async () => {
        const SEARCH_VALUE = 'testingvalue';
        await waitForBatchedUpdates();
        await measureFunction(() => OptionsListUtils.getSearchOptions(allReports, personalDetails, SEARCH_VALUE, mockedBetas), {runs: 1});
    });

    test.only('[OptionsListUtils] getSearchOptions with empty search value', async () => {
        const SEARCH_VALUE = '';
        await waitForBatchedUpdates();
        await measureFunction(() => OptionsListUtils.getSearchOptions(allReports, personalDetails, SEARCH_VALUE, mockedBetas), {runs: 1});
    });
});
