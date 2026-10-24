import {screen} from '@testing-library/react-native';

import {setHasRadio} from '@libs/NetworkState';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportCollectionDataSet} from '@src/types/onyx/Report';

import Onyx from 'react-native-onyx';
import {measureRenders} from 'reassure';

import * as LHNTestUtils from '../utils/LHNTestUtils';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import wrapOnyxWithWaitForBatchedUpdates from '../utils/wrapOnyxWithWaitForBatchedUpdates';

jest.mock('@libs/Permissions');
jest.mock('../../src/libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    isActiveRoute: jest.fn(),
    getTopmostReportId: jest.fn(),
    getActiveRoute: jest.fn(),
    getTopmostReportActionId: jest.fn(),
    isNavigationReady: jest.fn(() => Promise.resolve()),
    isDisplayedInModal: jest.fn(() => false),
    getActiveRouteWithoutParams: jest.fn(() => ''),
}));
jest.mock('../../src/libs/Navigation/navigationRef', () => ({
    getState: () => ({
        routes: [{name: 'Report'}],
    }),
    getRootState: () => ({
        routes: [],
    }),
    addListener: () => () => {},
    isReady: () => true,
}));

jest.mock('@react-navigation/native');

const REPORT_COUNT = 500;
const CURRENT_USER_ACCOUNT_ID = 1;
const OTHER_USER_ACCOUNT_ID = 2;
const WRITES_PER_SCENARIO = 10;
const HIDDEN_REPORT_ID = '999999001';
const HIDDEN_REPORT_KEY = `${ONYXKEYS.COLLECTION.REPORT}${HIDDEN_REPORT_ID}` as const;
const UNRELATED_TRANSACTION_KEY = `${ONYXKEYS.COLLECTION.TRANSACTION}999999002` as const;

const reports: ReportCollectionDataSet = Object.fromEntries(
    Array.from({length: REPORT_COUNT}, (_, index) => {
        const report = {
            ...LHNTestUtils.getFakeReport([CURRENT_USER_ACCOUNT_ID, OTHER_USER_ACCOUNT_ID], 1, true),
            lastMessageText: 'hey',
            lastVisibleActionCreated: `2025-01-01 00:00:${String(index % 60).padStart(2, '0')}.${String(index).padStart(3, '0')}`,
        };
        return [`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report];
    }),
);
const reportIDs = Object.values(reports).flatMap((report) => (report?.reportID ? [report.reportID] : []));

const hiddenReport = {
    ...LHNTestUtils.getFakeReport([CURRENT_USER_ACCOUNT_ID, OTHER_USER_ACCOUNT_ID], 1, false),
    reportID: HIDDEN_REPORT_ID,
    participants: {
        [CURRENT_USER_ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN},
        [OTHER_USER_ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN},
    },
};

function getRotatingReportID(run: number, index: number): string {
    return reportIDs.at((run * WRITES_PER_SCENARIO + index) % REPORT_COUNT) ?? HIDDEN_REPORT_ID;
}

describe('SidebarLinks ordering writes', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
            evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
        });
        // Required lazily so LHNTestUtils registers its @react-navigation/native mock before the engine's imports load it
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        require('@userActions/OnyxDerived').default();
    });

    beforeEach(async () => {
        global.fetch = TestHelper.getGlobalFetchMock();
        wrapOnyxWithWaitForBatchedUpdates(Onyx);
        setHasRadio(true);
        await TestHelper.signInWithTestUser(CURRENT_USER_ACCOUNT_ID, 'email1@test.com', undefined, undefined, 'One');
        await waitForBatchedUpdates();

        // Given 500 reports in the LHN sorted by most recent activity, one report hidden from the LHN and an unrelated transaction
        await Onyx.multiSet({
            [ONYXKEYS.PERSONAL_DETAILS_LIST]: LHNTestUtils.fakePersonalDetails,
            [ONYXKEYS.BETAS]: [CONST.BETAS.DEFAULT_ROOMS],
            [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.DEFAULT,
            [ONYXKEYS.IS_LOADING_REPORT_DATA]: false,
            [HIDDEN_REPORT_KEY]: hiddenReport,
            [UNRELATED_TRANSACTION_KEY]: {transactionID: '999999002', reportID: '999999003', amount: 100, currency: CONST.CURRENCY.USD},
            ...reports,
        });
        await waitForBatchedUpdates();
    });

    afterEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    test('should re-render when a report moves to the top of the list', async () => {
        // Reassure runs the scenario several times against one seeded Onyx, so every write uses a newer timestamp and another report
        let run = 0;
        const scenario = async () => {
            await screen.findByTestId('lhn-options-list');

            // When a report receives newer activity, which moves it to the top of the LHN
            for (let index = 0; index < WRITES_PER_SCENARIO; index++) {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${getRotatingReportID(run, index)}`, {
                    lastVisibleActionCreated: `2026-01-01 00:${String(run % 60).padStart(2, '0')}:${String(index).padStart(2, '0')}.000`,
                });
                await waitForBatchedUpdates();
            }
            run++;
        };

        // Then reassure measures what a reorder costs the LHN
        await measureRenders(<LHNTestUtils.MockedSidebarLinks />, {scenario});
    });

    test('should re-render when a report field that does not affect the order changes', async () => {
        let run = 0;
        const scenario = async () => {
            await screen.findByTestId('lhn-options-list');

            // When a displayed report gets a new last message text, which changes neither its position nor its visibility
            for (let index = 0; index < WRITES_PER_SCENARIO; index++) {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${getRotatingReportID(run, index)}`, {lastMessageText: `hey ${run}-${index}`});
                await waitForBatchedUpdates();
            }
            run++;
        };

        // Then reassure measures what an order-neutral write costs the LHN
        await measureRenders(<LHNTestUtils.MockedSidebarLinks />, {scenario});
    });

    test('should re-render when a report hidden from the LHN changes', async () => {
        let run = 0;
        const scenario = async () => {
            await screen.findByTestId('lhn-options-list');

            // When a report the user has hidden from the LHN is written
            for (let index = 0; index < WRITES_PER_SCENARIO; index++) {
                await Onyx.merge(HIDDEN_REPORT_KEY, {lastMessageText: `hidden ${run}-${index}`});
                await waitForBatchedUpdates();
            }
            run++;
        };

        // Then reassure measures what a write outside the LHN costs it
        await measureRenders(<LHNTestUtils.MockedSidebarLinks />, {scenario});
    });

    test('should re-render when an unrelated transaction changes', async () => {
        let run = 0;
        const scenario = async () => {
            await screen.findByTestId('lhn-options-list');

            // When a transaction of a report outside the LHN changes its amount
            for (let index = 0; index < WRITES_PER_SCENARIO; index++) {
                await Onyx.merge(UNRELATED_TRANSACTION_KEY, {amount: 100 + run * WRITES_PER_SCENARIO + index});
                await waitForBatchedUpdates();
            }
            run++;
        };

        // Then reassure measures what an unrelated transaction write costs the LHN
        await measureRenders(<LHNTestUtils.MockedSidebarLinks />, {scenario});
    });

    test('should re-render when a draft comment is added to a report', async () => {
        let run = 0;
        const scenario = async () => {
            await screen.findByTestId('lhn-options-list');

            // When the user starts a draft on another report, which moves it into the drafts group
            for (let index = 0; index < WRITES_PER_SCENARIO; index++) {
                await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${getRotatingReportID(run, index)}`, `draft ${run}-${index}`);
                await waitForBatchedUpdates();
            }
            run++;
        };

        // Then reassure measures what a draft write costs the LHN
        await measureRenders(<LHNTestUtils.MockedSidebarLinks />, {scenario});
    });
});
