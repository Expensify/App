import {screen} from '@testing-library/react-native';

import {setHasRadio} from '@libs/NetworkState';
import OnyxSubscriptionCounter from '@libs/telemetry/onyxSubscriptionCounter';
import type {OnyxSubscriptionCounts} from '@libs/telemetry/onyxSubscriptionCounter';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList} from '@src/types/onyx';

import {writeFileSync} from 'fs';
import Onyx from 'react-native-onyx';
import {measureRenders} from 'reassure';

import * as LHNTestUtils from '../utils/LHNTestUtils';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import wrapOnyxWithWaitForBatchedUpdates from '../utils/wrapOnyxWithWaitForBatchedUpdates';

/**
 * Baseline for what one personal-details member change costs the read side, as a function of how many members
 * the account has.
 *
 * The member written here is deliberately one that **nothing on screen displays**. The LHN shows reports whose
 * participants are accountIDs 1 and 2; the write targets a filler member far outside that set. So every render
 * and every selector run this test records is pure waste — work a per-member collection subscription would not
 * do at all. That makes it the cleanest number to compare a collection against, and it is why the counts here
 * should be read as "cost of an unrelated member changing", not "cost of updating the LHN".
 *
 * Reassure gives render count and duration. `OnyxSubscriptionCounter` gives the two counts that explain them and
 * that are platform-independent: how many subscribing hooks re-ran, and how many selectors executed.
 */

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
    getState: () => ({routes: [{name: 'Report'}]}),
    getRootState: () => ({routes: []}),
    addListener: () => () => {},
    isReady: () => true,
}));

jest.mock('@react-navigation/native');

/** Member counts spanning a small account up to a large domain. */
const SIZES = [1000, 5000, 20000];

const REPORT_COUNT = 100;

/** Participants of every mocked report, so these are the only members the LHN actually displays. */
const DISPLAYED_ACCOUNT_IDS = [1, 2];

/** Counts from the first measured run of each size. They are deterministic, so one run is enough. */
const countsBySize = new Map<number, OnyxSubscriptionCounts | undefined>();

const COUNTS_OUTPUT_PATH = '.reassure/personal-details-subscription-counts.json';

function buildMembers(size: number): PersonalDetailsList {
    const members: PersonalDetailsList = {};
    for (let accountID = 1; accountID <= size; accountID++) {
        members[accountID] = {
            accountID,
            login: `email${accountID}@test.com`,
            displayName: `Email ${accountID}`,
            avatar: 'none',
            firstName: `First${accountID}`,
        };
    }
    return members;
}

/**
 * Built once and reused for every size, so the only thing varying across tests is the member count.
 * Reusing also avoids a trap: `getFakeReport` assigns reportIDs from a module-level counter, so calling it again
 * per test produces reports whose `reportID` no longer matches the collection key they are stored under, and the
 * LHN silently renders its empty state.
 */
const mockedReports = Object.fromEntries(
    Array.from({length: REPORT_COUNT}, () => {
        const report = {...LHNTestUtils.getFakeReport(DISPLAYED_ACCOUNT_IDS, 1, true), lastMessageText: 'hey'};
        return [`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report];
    }),
);

describe('PersonalDetailsSubscriptionCost', () => {
    beforeAll(async () => {
        Onyx.init({keys: ONYXKEYS, evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS]});
        global.fetch = TestHelper.getGlobalFetchMock();
        wrapOnyxWithWaitForBatchedUpdates(Onyx);
        setHasRadio(true);
        await TestHelper.signInWithTestUser(1, 'email1@test.com', undefined, undefined, 'One');
        await waitForBatchedUpdates();
    });

    // Deliberately no `Onyx.clear()` between sizes. Clearing wipes the session and reports, and the LHN then renders
    // its empty state for every size after the first — which measures fine and just reports a smaller number.
    // Sizes run ascending and `multiSet` replaces `personalDetailsList` wholesale, so each test still sees exactly
    // `size` members.
    afterEach(() => {
        OnyxSubscriptionCounter.stop();
    });

    // Written to a file rather than logged, because Reassure's runner swallows console output from its child process.
    afterAll(() => {
        const summary = Object.fromEntries([...countsBySize.entries()].map(([size, counts]) => [size, {hookRuns: counts?.hookRuns ?? 0, selectorRuns: counts?.selectorRuns ?? 0}]));
        writeFileSync(COUNTS_OUTPUT_PATH, JSON.stringify(summary, null, 2));
    });

    describe.each(SIZES)('with %d members', (size) => {
        test(`[LHN] merging one undisplayed member of ${size}`, async () => {
            // The member being written is outside DISPLAYED_ACCOUNT_IDS, so nothing on screen depends on it.
            const unrelatedAccountID = size;

            await Onyx.multiSet({
                [ONYXKEYS.PERSONAL_DETAILS_LIST]: buildMembers(size),
                [ONYXKEYS.BETAS]: [CONST.BETAS.DEFAULT_ROOMS],
                [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.GSD,
                [ONYXKEYS.IS_LOADING_REPORT_DATA]: false,
                ...mockedReports,
            });
            await waitForBatchedUpdates();

            let iteration = 0;
            const scenario = async () => {
                iteration++;

                // Guard, not a convenience: an empty LHN still measures fine and just reports a smaller number, so
                // without this a broken setup looks like a performance win. The empty state does not render this
                // testID, so its absence is what catches a bad setup.
                await screen.findByTestId('lhn-options-list');

                OnyxSubscriptionCounter.start();
                await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {[unrelatedAccountID]: {firstName: `Changed${iteration}`}});
                await waitForBatchedUpdates();
                const counts = OnyxSubscriptionCounter.stop();

                if (!countsBySize.has(size)) {
                    countsBySize.set(size, counts[ONYXKEYS.PERSONAL_DETAILS_LIST]);
                }
            };

            await measureRenders(<LHNTestUtils.MockedSidebarLinks />, {scenario});
        });
    });
});
