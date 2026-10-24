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
const POLICY_ID = 'LHN_POLICY';
const POLICY_KEY = `${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}` as const;

const reports: ReportCollectionDataSet = Object.fromEntries(
    Array.from({length: REPORT_COUNT}, () => {
        const report = {...LHNTestUtils.getFakeReport([1, 2], 1, true), lastMessageText: 'hey', policyID: POLICY_ID};
        return [`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report];
    }),
);
const firstReportID = Object.values(reports).at(0)?.reportID;
const firstReportKey = `${ONYXKEYS.COLLECTION.REPORT}${firstReportID}` as const;

describe('SidebarLinks on row field writes', () => {
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

        // Given 500 LHN reports that all belong to one workspace
        await Onyx.multiSet({
            [ONYXKEYS.PERSONAL_DETAILS_LIST]: LHNTestUtils.fakePersonalDetails,
            [ONYXKEYS.BETAS]: [CONST.BETAS.DEFAULT_ROOMS],
            [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.GSD,
            [ONYXKEYS.IS_LOADING_REPORT_DATA]: false,
            [POLICY_KEY]: {id: POLICY_ID, name: 'Workspace', type: CONST.POLICY.TYPE.TEAM},
            ...reports,
        });
        await waitForBatchedUpdates();
    });

    afterEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    test('[SidebarLinks] should re-render when a report field the row does not show is written', async () => {
        // Reassure runs the scenario several times against one seeded Onyx, so every run writes a value that doesn't exist yet
        let run = 0;
        const scenario = async () => {
            await screen.findByTestId('lhn-options-list');

            // When the description of a DM changes, which the LHN row never displays
            for (let index = 0; index < WRITES_PER_SCENARIO; index++) {
                await Onyx.merge(firstReportKey, {description: `Description ${run}-${index}`});
                await waitForBatchedUpdates();
            }
            run++;
        };

        // Then reassure measures what a write the row can ignore costs the LHN
        await measureRenders(<LHNTestUtils.MockedSidebarLinks />, {scenario});
    });

    test('[SidebarLinks] should re-render when the visible name of one report changes', async () => {
        let run = 0;
        const scenario = async () => {
            await screen.findByTestId('lhn-options-list');

            // When one report is renamed, which the row must show
            for (let index = 0; index < WRITES_PER_SCENARIO; index++) {
                await Onyx.merge(firstReportKey, {reportName: `Renamed ${run}-${index}`});
                await waitForBatchedUpdates();
            }
            run++;
        };

        // Then reassure measures the cost of a write that does change one row
        await measureRenders(<LHNTestUtils.MockedSidebarLinks />, {scenario});
    });

    test('[SidebarLinks] should re-render when a report action is added to one report', async () => {
        let run = 0;
        const scenario = async () => {
            await screen.findByTestId('lhn-options-list');

            // When one report receives new comments
            for (let index = 0; index < WRITES_PER_SCENARIO; index++) {
                const action = {...LHNTestUtils.getFakeReportAction('email2@test.com'), actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT, reportActionID: `poc-${run}-${index}`};
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${firstReportID}`, {[action.reportActionID]: action});
                await waitForBatchedUpdates();
            }
            run++;
        };

        // Then reassure measures the cost of new actions on one row
        await measureRenders(<LHNTestUtils.MockedSidebarLinks />, {scenario});
    });

    test('[SidebarLinks] should re-render when the workspace of the LHN reports gets a field the rows do not show', async () => {
        let run = 0;
        const scenario = async () => {
            await screen.findByTestId('lhn-options-list');

            // When the workspace description changes, which no row displays
            for (let index = 0; index < WRITES_PER_SCENARIO; index++) {
                await Onyx.merge(POLICY_KEY, {description: `Workspace ${run}-${index}`});
                await waitForBatchedUpdates();
            }
            run++;
        };

        // Then reassure measures what a shared policy write costs every row of that workspace
        await measureRenders(<LHNTestUtils.MockedSidebarLinks />, {scenario});
    });
});
