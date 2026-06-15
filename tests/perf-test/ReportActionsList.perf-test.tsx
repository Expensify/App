import {NavigationContainer} from '@react-navigation/native';
import {act, screen} from '@testing-library/react-native';
import {useCallback} from 'react';
import Onyx from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import {measureRenders} from 'reassure';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import useOnyx from '@hooks/useOnyx';
import type Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';
import {setHasRadio} from '@libs/NetworkState';
import {getSortedReportActionsForDisplay} from '@libs/ReportActionsUtils';
import ReportActionsList from '@pages/inbox/report/ReportActionsList';
import {ActionListContext, ReactionListContext} from '@pages/inbox/ReportScreenContext';
import {AttachmentModalContextProvider} from '@pages/media/AttachmentModalScreen/AttachmentModalContext';
import ComposeProviders from '@src/components/ComposeProviders';
import {LocaleContextProvider} from '@src/components/LocaleContextProvider';
import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList, ReportAction, ReportActions} from '@src/types/onyx';
import createRandomReportAction from '../utils/collections/reportActions';
import {createRandomReport} from '../utils/collections/reports';
import * as ReportTestUtils from '../utils/ReportTestUtils';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import wrapOnyxWithWaitForBatchedUpdates from '../utils/wrapOnyxWithWaitForBatchedUpdates';

const REPORT_ACTIONS_LIST_ID = 'perf-test-list';

const mockedNavigate = jest.fn();

jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual<typeof Navigation>('@react-navigation/native');
    return {
        ...actualNav,
        useRoute: () => mockedNavigate,
        useIsFocused: () => true,
    };
});

beforeAll(() =>
    Onyx.init({
        keys: ONYXKEYS,
        evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
    }),
);

const mockOnLayout = jest.fn();
const mockOnScroll = jest.fn();
const mockLoadChats = jest.fn();
const mockRef = {current: null, flatListRef: null, scrollPositionRef: {current: {}}, scrollOffsetRef: {current: 0}};
const mockReactionListContextValue = {
    showReactionList: () => {},
    hideReactionList: () => {},
    isActiveReportAction: () => false,
};

const TEST_USER_ACCOUNT_ID = 1;
const TEST_USER_LOGIN = 'test@test.com';

const signUpWithTestUser = () => {
    TestHelper.signInWithTestUser(TEST_USER_ACCOUNT_ID, TEST_USER_LOGIN);
};

const report = createRandomReport(1, undefined);
report.chatReportID = report.reportID;

const parentReportAction = createRandomReportAction(1);

// getFakeReportAction sets actorAccountID = index, so the 500 mocked actions have actors 1..500
const ACTOR_PERSONAL_DETAILS: PersonalDetailsList = Object.fromEntries(
    Array.from({length: 500}, (_, i) => {
        const accountID = i + 1;
        return [
            accountID,
            {
                accountID,
                login: `user${accountID}@test.com`,
                avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/avatar_7.png',
                avatarThumbnail: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/avatar_7.png',
                displayName: `User ${accountID}`,
                firstName: 'User',
                lastName: `${accountID}`,
                pronouns: '',
                timezone: CONST.DEFAULT_TIME_ZONE,
                phoneNumber: '',
            },
        ];
    }),
);

const INITIAL_REPORT_ACTIONS = ReportTestUtils.getMockedSortedReportActions(500);
const INITIAL_REPORT_ACTIONS_MAP = Object.fromEntries(INITIAL_REPORT_ACTIONS.map((action) => [action.reportActionID, action]));
const EMPTY_REPORT_ACTIONS: ReportAction[] = [];

beforeEach(async () => {
    // Initialize the network key for OfflineWithFeedback
    setHasRadio(true);
    wrapOnyxWithWaitForBatchedUpdates(Onyx);
    // Pre-seed the locale so LocaleContextProvider's mount effect is a no-op (setLocale/IntlStore.load
    // early-return), avoiding post-mount Onyx writes that re-render outside act().
    await act(async () => {
        signUpWithTestUser();
        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, ACTOR_PERSONAL_DETAILS);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, INITIAL_REPORT_ACTIONS_MAP);
        await Onyx.merge(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.DEFAULT);
        await IntlStore.load(CONST.LOCALES.DEFAULT);
        await waitForBatchedUpdates();
    });
});

afterEach(async () => {
    // Await the clear so its broadcasts settle in teardown instead of leaking into the next test.
    await Onyx.clear();
    await waitForBatchedUpdates();
});

// Mirror the production data flow (usePaginatedReportActions): the wrapper plays the role of the parent
// (ReportActionsView) — it reads REPORT_ACTIONS from Onyx and sorts inside a useOnyx selector, instead of
// holding the actions in local state. "Sending a message" is then an Onyx.merge into REPORT_ACTIONS
// (exactly like addActions' optimistic update), so the list updates through the real subscription/selector
// path rather than prop injection.
function ReportActionsListWrapper() {
    const sortedReportActionsSelector = useCallback((actions: OnyxEntry<ReportActions>) => getSortedReportActionsForDisplay(actions, true, true, undefined, report.reportID), []);
    const [reportActions = EMPTY_REPORT_ACTIONS] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {selector: sortedReportActionsSelector});
    return (
        <NavigationContainer ref={navigationRef}>
            <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, AttachmentModalContextProvider]}>
                <ReactionListContext.Provider value={mockReactionListContextValue}>
                    <ActionListContext.Provider value={mockRef}>
                        <ReportActionsList
                            parentReportAction={parentReportAction}
                            parentReportActionForTransactionThread={undefined}
                            sortedReportActions={reportActions}
                            sortedVisibleReportActions={reportActions}
                            report={report}
                            onLayout={mockOnLayout}
                            onScroll={mockOnScroll}
                            listID={REPORT_ACTIONS_LIST_ID}
                            loadOlderChats={mockLoadChats}
                            loadNewerChats={mockLoadChats}
                            hasNewerActions={false}
                            sortedAllReportActionsForPagination={reportActions}
                            reportActionPages={undefined}
                            treatAsNoPaginationAnchor={false}
                            setTreatAsNoPaginationAnchor={() => {}}
                            transactionThreadReport={report}
                        />
                    </ActionListContext.Provider>
                </ReactionListContext.Provider>
            </ComposeProviders>
        </NavigationContainer>
    );
}

test('[ReportActionsList] should render ReportActionsList with 500 reportActions stored', async () => {
    const scenario = async () => {
        await screen.findByTestId('report-actions-list');
    };
    await waitForBatchedUpdates();
    await measureRenders(<ReportActionsListWrapper />, {scenario});
});

/**
 * Each scenario iteration simulates sending one message exactly as addActions does:
 *  - the new report action is merged into REPORT_ACTIONS, AND
 *  - the report's chat "heartbeat" fields (last*) are merged.
 * Both writes flow through Onyx, so the list updates via its real subscription rather than prop injection.
 */
test('[ReportActionsList] should render cheaply when sending 10 new messages', async () => {
    await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);
    await waitForBatchedUpdates();

    // Monotonic across reassure's repeated scenario runs so every merge writes a new value (Onyx skips no-ops).
    let messageTick = 0;

    const scenario = async () => {
        await screen.findByTestId('report-actions-list');

        // Send 10 messages back-to-back to accumulate a measurable, low-noise render duration.
        for (let i = 0; i < 10; i++) {
            messageTick++;
            const tick = messageTick;
            const stamp = `2026-06-15 00:00:00.${String(tick).padStart(3, '0')}`;
            const newAction = ReportTestUtils.getFakeReportAction(100000 + tick, {
                actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                created: stamp,
                actorAccountID: TEST_USER_ACCOUNT_ID,
            });
            await act(async () => {
                // New message: merge the action into REPORT_ACTIONS AND update the report's last* fields, as a real send does.
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {[newAction.reportActionID]: newAction});
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, {
                    lastMessageText: `message ${tick}`,
                    lastMessageHtml: `<comment>message ${tick}</comment>`,
                    lastVisibleActionCreated: stamp,
                    lastReadTime: stamp,
                    lastActorAccountID: TEST_USER_ACCOUNT_ID,
                });
                await waitForBatchedUpdates();
            });
        }
    };

    await waitForBatchedUpdates();
    await measureRenders(<ReportActionsListWrapper />, {scenario});
});
