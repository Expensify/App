import {screen} from '@testing-library/react-native';

import {setHasRadio} from '@libs/NetworkState';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList} from '@src/types/onyx';

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
const GUIDE_ACCOUNT_ID = 50;
const UNRELATED_ACCOUNT_ID = 60;

const reports = Object.fromEntries(
    Array.from({length: REPORT_COUNT}, (value, index) => {
        const report = {...LHNTestUtils.getFakeReport([1, 2], 1, true), lastMessageText: 'hey'};
        return [`${ONYXKEYS.COLLECTION.REPORT}${index + 1}`, report];
    }),
);

const personalDetails: PersonalDetailsList = {
    ...LHNTestUtils.fakePersonalDetails,
    [GUIDE_ACCOUNT_ID]: {accountID: GUIDE_ACCOUNT_ID, login: `guide@${CONST.EMAIL.GUIDES_DOMAIN}`, displayName: 'Guide'},
    [UNRELATED_ACCOUNT_ID]: {accountID: UNRELATED_ACCOUNT_ID, login: 'unrelated@test.com', displayName: 'Unrelated'},
};

describe('SidebarLinks on personal details writes', () => {
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
    });

    afterEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    test('[SidebarLinks] should re-render when a user outside the LHN is renamed', async () => {
        // Given 500 reports in the LHN, a guide, and a user who is in none of the reports
        await Onyx.multiSet({
            [ONYXKEYS.PERSONAL_DETAILS_LIST]: personalDetails,
            [ONYXKEYS.BETAS]: [CONST.BETAS.DEFAULT_ROOMS],
            [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.GSD,
            [ONYXKEYS.IS_LOADING_REPORT_DATA]: false,
            ...reports,
        });
        await waitForBatchedUpdates();

        // Reassure runs the scenario several times against one seeded Onyx, so every run writes a name that doesn't exist yet
        let run = 0;
        const scenario = async () => {
            await screen.findByTestId('lhn-options-list');

            // When that user is renamed repeatedly, which makes the derived engine recompute the guide accountIDs to the same content
            for (let index = 0; index < WRITES_PER_SCENARIO; index++) {
                await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {[UNRELATED_ACCOUNT_ID]: {displayName: `Unrelated ${run}-${index}`}});
                await waitForBatchedUpdates();
            }
            run++;
        };

        // Then reassure measures what the unrelated writes cost the LHN
        await measureRenders(<LHNTestUtils.MockedSidebarLinks />, {scenario});
    });
});
