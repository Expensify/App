import {render, screen} from '@testing-library/react-native';

import {setHasRadio} from '@libs/NetworkState';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportCollectionDataSet} from '@src/types/onyx/Report';

import Onyx from 'react-native-onyx';
import {measureAsyncFunction, measureRenders} from 'reassure';

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

const WRITES_PER_SCENARIO = 10;
const OFFSCREEN_ROOM_ID = '999999101';
const OFFSCREEN_ROOM_KEY = `${ONYXKEYS.COLLECTION.REPORT}${OFFSCREEN_ROOM_ID}` as const;
const OUTSIDE_ACCOUNT_ID = 999999;

function buildReports(count: number): ReportCollectionDataSet {
    return Object.fromEntries(
        Array.from({length: count}, (_, index) => {
            const report = {
                ...LHNTestUtils.getFakeReport([1, 2], 1, true),
                lastMessageText: 'hey',
                lastVisibleActionCreated: `2025-01-01 00:00:${String(index % 60).padStart(2, '0')}.${String(index % 1000).padStart(3, '0')}`,
            };
            return [`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report];
        }),
    );
}

describe.each([500, 5000])('SidebarLinks write path with %i reports', (reportCount) => {
    const reports = buildReports(reportCount);
    const firstReportKey = `${ONYXKEYS.COLLECTION.REPORT}${Object.values(reports).at(59)?.reportID}` as const;

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
        await TestHelper.signInWithTestUser(1, 'email1@test.com', undefined, undefined, 'One');
        await waitForBatchedUpdates();

        // Given many reports sorted by recent activity and a room older than all of them, so it sits below the rendered window
        await Onyx.multiSet({
            [ONYXKEYS.PERSONAL_DETAILS_LIST]: LHNTestUtils.fakePersonalDetails,
            [ONYXKEYS.BETAS]: [CONST.BETAS.DEFAULT_ROOMS],
            [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.DEFAULT,
            [ONYXKEYS.IS_LOADING_REPORT_DATA]: false,
            [OFFSCREEN_ROOM_KEY]: {
                ...LHNTestUtils.getFakeReport([1, 2], 1, false),
                reportID: OFFSCREEN_ROOM_ID,
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM,
                reportName: '#offscreen',
                lastVisibleActionCreated: '2020-01-01 00:00:00.000',
            },
            ...reports,
        });
        await waitForBatchedUpdates();
    });

    afterEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    test('should re-render when a report below the rendered window is renamed', async () => {
        let run = 0;
        const scenario = async () => {
            await screen.findByTestId('lhn-options-list');

            // When a room no visible row shows gets a new name
            for (let index = 0; index < WRITES_PER_SCENARIO; index++) {
                await Onyx.merge(OFFSCREEN_ROOM_KEY, {reportName: `#offscreen-${run}-${index}`});
                await waitForBatchedUpdates();
            }
            run++;
        };

        // Then reassure measures what the rename costs the visible rows
        await measureRenders(<LHNTestUtils.MockedSidebarLinks />, {scenario});
    });

    test('should take wall time to write one visible report', async () => {
        // Given a mounted LHN, so the measurement covers subscribers, selectors, comparisons and renders together
        render(<LHNTestUtils.MockedSidebarLinks />);
        await screen.findByTestId('lhn-options-list');
        let run = 0;

        // When one visible report gets a field update that does not change the order
        await measureAsyncFunction(async () => {
            for (let index = 0; index < WRITES_PER_SCENARIO; index++) {
                await Onyx.merge(firstReportKey, {lastMessageText: `hey ${run}-${index}`});
                await waitForBatchedUpdates();
            }
            run++;
        });
    });

    test('should take wall time to rename a report below the rendered window', async () => {
        render(<LHNTestUtils.MockedSidebarLinks />);
        await screen.findByTestId('lhn-options-list');
        let run = 0;

        // When a room no visible row shows gets a new name
        await measureAsyncFunction(async () => {
            for (let index = 0; index < WRITES_PER_SCENARIO; index++) {
                await Onyx.merge(OFFSCREEN_ROOM_KEY, {reportName: `#offscreen-${run}-${index}`});
                await waitForBatchedUpdates();
            }
            run++;
        });
    });

    test('should take wall time to write personal details of a user outside the list', async () => {
        render(<LHNTestUtils.MockedSidebarLinks />);
        await screen.findByTestId('lhn-options-list');
        let run = 0;

        // When a user who is in no LHN report changes their display name
        await measureAsyncFunction(async () => {
            for (let index = 0; index < WRITES_PER_SCENARIO; index++) {
                await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {[OUTSIDE_ACCOUNT_ID]: {accountID: OUTSIDE_ACCOUNT_ID, displayName: `Outside ${run}-${index}`}});
                await waitForBatchedUpdates();
            }
            run++;
        });
    });
});
