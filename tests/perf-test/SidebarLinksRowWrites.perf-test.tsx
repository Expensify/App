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
const WRITES_PER_SCENARIO = 10;
const UNRELATED_POLICY_ID = 'UNRELATED_POLICY';
const UNRELATED_POLICY_KEY = `${ONYXKEYS.COLLECTION.POLICY}${UNRELATED_POLICY_ID}` as const;

const reports: ReportCollectionDataSet = Object.fromEntries(
    Array.from({length: REPORT_COUNT}, () => {
        const report = {...LHNTestUtils.getFakeReport([1, 2], 1, true), lastMessageText: 'hey'};
        return [`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report];
    }),
);
const firstReportID = Object.values(reports).at(0)?.reportID;

describe('SidebarLinks on single-key writes', () => {
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

        // Given 500 reports in the LHN and a policy that none of them belongs to
        await Onyx.multiSet({
            [ONYXKEYS.PERSONAL_DETAILS_LIST]: LHNTestUtils.fakePersonalDetails,
            [ONYXKEYS.BETAS]: [CONST.BETAS.DEFAULT_ROOMS],
            [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.GSD,
            [ONYXKEYS.IS_LOADING_REPORT_DATA]: false,
            [UNRELATED_POLICY_KEY]: {id: UNRELATED_POLICY_ID, name: 'Unrelated', type: CONST.POLICY.TYPE.TEAM},
            ...reports,
        });
        await waitForBatchedUpdates();
    });

    afterEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    test('[SidebarLinks] should re-render when one report is written', async () => {
        // Reassure runs the scenario several times against one seeded Onyx, so every run writes a value that doesn't exist yet
        let run = 0;
        const scenario = async () => {
            await screen.findByTestId('lhn-options-list');

            // When a single report gets a field update that does not change the LHN order
            for (let index = 0; index < WRITES_PER_SCENARIO; index++) {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${firstReportID}`, {lastReadTime: `2026-01-01 00:${String(run % 60).padStart(2, '0')}:${String(index).padStart(2, '0')}.000`});
                await waitForBatchedUpdates();
            }
            run++;
        };

        // Then reassure measures what a write to one report costs the LHN
        await measureRenders(<LHNTestUtils.MockedSidebarLinks />, {scenario});
    });

    test('[SidebarLinks] should re-render when an unrelated policy is written', async () => {
        let run = 0;
        const scenario = async () => {
            await screen.findByTestId('lhn-options-list');

            // When a policy that no LHN report belongs to is renamed
            for (let index = 0; index < WRITES_PER_SCENARIO; index++) {
                await Onyx.merge(UNRELATED_POLICY_KEY, {name: `Unrelated ${run}-${index}`});
                await waitForBatchedUpdates();
            }
            run++;
        };

        // Then reassure measures what the unrelated policy writes cost the LHN
        await measureRenders(<LHNTestUtils.MockedSidebarLinks />, {scenario});
    });
});
