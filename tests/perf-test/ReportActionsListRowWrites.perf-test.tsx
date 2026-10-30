import {act, screen} from '@testing-library/react-native';

import OnyxListItemProvider from '@components/OnyxListItemProvider';

import type Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';
import {setHasRadio} from '@libs/NetworkState';

import {ActionListContext} from '@pages/inbox/ActionListContext';
import {ReactionListContext} from '@pages/inbox/ReactionListContext';
import ReportActionsList from '@pages/inbox/report/ReportActionsList';
import {AttachmentModalContextProvider} from '@pages/media/AttachmentModalScreen/AttachmentModalContext';

import ComposeProviders from '@src/components/ComposeProviders';
import {LocaleContextProvider} from '@src/components/LocaleContextProvider';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction, ReportActions} from '@src/types/onyx';

import {NavigationContainer} from '@react-navigation/native';
import Onyx from 'react-native-onyx';
import {measureRenders} from 'reassure';

import * as ReportTestUtils from '../utils/ReportTestUtils';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import wrapOnyxWithWaitForBatchedUpdates from '../utils/wrapOnyxWithWaitForBatchedUpdates';

const mockedNavigate = jest.fn();

jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual<typeof Navigation>('@react-navigation/native');
    return {
        ...actualNav,
        useRoute: () => mockedNavigate,
        useIsFocused: () => true,
    };
});

beforeAll(() => {
    Onyx.init({
        keys: ONYXKEYS,
        evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
    });
    // Required lazily so the navigation mock is registered before the engine's imports load it
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    require('@userActions/OnyxDerived').default();
});

const mockOnLayout = jest.fn();
// Built via a function so the value isn't an inline literal the context-split lint rule would flag. These are all refs/accessors with no re-render concern.
function buildActionListContextValue() {
    return {scrollOffsetRef: {current: 0}, getScrollOffset: () => 0, registerListRef: () => {}, getListRef: () => null};
}
const actionListContextValue = buildActionListContextValue();
const mockReactionListContextValue = {
    showReactionList: () => {},
    hideReactionList: () => {},
    isActiveReportAction: () => false,
};

const TEST_USER_ACCOUNT_ID = 1;
const TEST_USER_LOGIN = 'test@test.com';
const REPORT_ID = '1';

const signUpWithTestUser = () => {
    TestHelper.signInWithTestUser(TEST_USER_ACCOUNT_ID, TEST_USER_LOGIN);
};

const sortedReportActions = ReportTestUtils.getMockedSortedReportActions(500);
const reportActions: ReportActions = Object.fromEntries(sortedReportActions.map((action: ReportAction) => [action.reportActionID, action]));
const POLICY_ID = 'P1';
const report = ReportTestUtils.createMockReport({reportID: REPORT_ID, policyID: POLICY_ID, lastVisibleActionCreated: sortedReportActions.at(0)?.created});
const WRITES_PER_SCENARIO = 10;

// All mock actions share one timestamp, so the initial window is ordered by reportActionID as a string and starts at action 1, then 10..
const VISIBLE_ACTION_ID = '10';

beforeEach(async () => {
    // Initialize the network key for OfflineWithFeedback
    setHasRadio(true);
    wrapOnyxWithWaitForBatchedUpdates(Onyx);
    // Pre-seed the locale so LocaleContextProvider's mount effect is a no-op (setLocale early-returns),
    // avoiding post-mount Onyx writes that would re-render outside act().
    await act(async () => {
        signUpWithTestUser();
        await Onyx.merge(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.DEFAULT);

        // Seed the report under test: the report, its 500 actions, and a settled loading state.
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {
            id: POLICY_ID,
            name: 'Policy',
            type: CONST.POLICY.TYPE.TEAM,
            role: CONST.POLICY.ROLE.ADMIN,
            owner: TEST_USER_LOGIN,
            outputCurrency: CONST.CURRENCY.USD,
        });
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`, reportActions);
        await Onyx.set(`${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}${REPORT_ID}`, {
            isLoadingInitialReportActions: false,
            hasOnceLoadedReportActions: true,
            isLoadingOlderReportActions: false,
            hasLoadingOlderReportActionsError: false,
            isLoadingNewerReportActions: false,
            hasLoadingNewerReportActionsError: false,
        });
        await waitForBatchedUpdates();
    });
});

afterEach(async () => {
    // Await the clear so its broadcasts settle in teardown instead of leaking into the next test.
    await Onyx.clear();
    await waitForBatchedUpdates();
});

// Mirror the production data flow (usePaginatedReportActions): the body reads REPORT_ACTIONS from Onyx and
// sorts inside a useOnyx selector, then runs it through the real continuous-chain pagination and the
// visibility filter.
function ReportActionsListWrapper() {
    return (
        <NavigationContainer ref={navigationRef}>
            <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, AttachmentModalContextProvider]}>
                <ReactionListContext.Provider value={mockReactionListContextValue}>
                    <ActionListContext.Provider value={actionListContextValue}>
                        <ReportActionsList
                            reportID={REPORT_ID}
                            conciergeChat={undefined}
                            onLayout={mockOnLayout}
                        />
                    </ActionListContext.Provider>
                </ReactionListContext.Provider>
            </ComposeProviders>
        </NavigationContainer>
    );
}

async function measureWrites(write: (run: number, index: number) => Promise<unknown>) {
    // Reassure runs the scenario several times against one seeded Onyx, so every run writes a value that doesn't exist yet
    let run = 0;
    const scenario = async () => {
        await screen.findByTestId('report-actions-list');
        const currentRun = run;
        for (let index = 0; index < WRITES_PER_SCENARIO; index++) {
            await act(async () => {
                await write(currentRun, index);
                await waitForBatchedUpdates();
            });
        }
        run++;
    };
    await waitForBatchedUpdates();
    await measureRenders(<ReportActionsListWrapper />, {scenario});
}

const getTime = (run: number, index: number) => `2030-01-01 00:${String(run % 60).padStart(2, '0')}:${String(index).padStart(2, '0')}.000`;

test('[ReportActionsList] should re-render when one visible action is edited', async () => {
    // Given 500 actions in the report, when the message of one visible action is edited repeatedly
    // Then reassure measures what an edit of one action costs the list
    await measureWrites((run, index) =>
        Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`, {[VISIBLE_ACTION_ID]: {message: [{type: 'TEXT', html: `edited ${run}-${index}`, text: `edited ${run}-${index}`}]}}),
    );
});

test('[ReportActionsList] should re-render when only a heartbeat field of the report changes', async () => {
    // Given 500 actions in the report, when only lastReadTime of the report changes
    // Then reassure measures what a field the rows don't display costs the list
    await measureWrites((run, index) => Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {lastReadTime: getTime(run, index)}));
});

test('[ReportActionsList] should re-render when an unrelated report is written', async () => {
    // Given 500 actions in the report, when another report in the account is created or updated
    // Then reassure measures what a write outside the open report costs the list
    await measureWrites((run, index) => Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}unrelated${run}_${index}`, {reportID: `unrelated${run}_${index}`, reportName: 'Unrelated'}));
});

test('[ReportActionsList] should re-render when an unrelated transaction is written', async () => {
    // Given 500 actions in the report, when a transaction of another report changes
    // Then reassure measures what a write outside the open report costs the list
    await measureWrites((run, index) => Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}T1`, {transactionID: 'T1', reportID: 'unrelated', amount: run * 100 + index}));
});

test('[ReportActionsList] should re-render when the report name changes', async () => {
    // Given 500 actions in the report, when a field every row reads through the stable report changes
    // Then reassure measures the cost of a write that legitimately re-renders all rows
    await measureWrites((run, index) => Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {reportName: `Renamed ${run}-${index}`}));
});
