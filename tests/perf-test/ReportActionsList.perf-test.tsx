import {NavigationContainer} from '@react-navigation/native';
import {act, screen} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import {measureRenders} from 'reassure';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import type Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';
import {setHasRadio} from '@libs/NetworkState';
import ReportActionsList from '@pages/inbox/report/ReportActionsList';
import {ActionListContext, ReactionListContext} from '@pages/inbox/ReportScreenContext';
import {AttachmentModalContextProvider} from '@pages/media/AttachmentModalScreen/AttachmentModalContext';
import ComposeProviders from '@src/components/ComposeProviders';
import {LocaleContextProvider} from '@src/components/LocaleContextProvider';
import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList, ReportAction, ReportActions} from '@src/types/onyx';
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

beforeAll(() =>
    Onyx.init({
        keys: ONYXKEYS,
        evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
    }),
);

const mockOnLayout = jest.fn();
const mockRef = {current: null, flatListRef: null, scrollPositionRef: {current: {}}, scrollOffsetRef: {current: 0}};
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

// Seed 500 report actions through Onyx (keyed by reportActionID, as production stores them) so the
// hook-driven body fetches and runs the real pagination + visibility pipeline — instead of receiving a
// pre-sorted array via props as the previous harness did. This is strictly more production-faithful, so
// the measured number is a fresh baseline and is not comparable to the pre-PR-6 figure.
const sortedReportActions = ReportTestUtils.getMockedSortedReportActions(500);
const reportActions: ReportActions = Object.fromEntries(sortedReportActions.map((action: ReportAction) => [action.reportActionID, action]));
const report = ReportTestUtils.createMockReport({reportID: REPORT_ID, lastVisibleActionCreated: sortedReportActions.at(0)?.created});

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

beforeEach(async () => {
    // Initialize the network key for OfflineWithFeedback
    setHasRadio(true);
    wrapOnyxWithWaitForBatchedUpdates(Onyx);
    // Pre-seed the locale so LocaleContextProvider's mount effect is a no-op (setLocale/IntlStore.load
    // early-return), avoiding post-mount Onyx writes that re-render outside act(). Personal details back
    // the 500 actors so avatars/display names resolve through the real selectors.
    await act(async () => {
        signUpWithTestUser();
        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, ACTOR_PERSONAL_DETAILS);
        await Onyx.merge(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.DEFAULT);
        await IntlStore.load(CONST.LOCALES.DEFAULT);

        // Seed the report under test: the report, its 500 actions, and a settled loading state.
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
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

// Mirror the production data flow (usePaginatedReportActions): the wrapper plays the role of the parent
// (ReportActionsView) — it reads REPORT_ACTIONS from Onyx and sorts inside a useOnyx selector, instead of
// holding the actions in local state. "Sending a message" is then an Onyx.merge into REPORT_ACTIONS
// (exactly like addActions' optimistic update), so the list updates through the real subscription/selector
// path rather than prop injection.
function ReportActionsListWrapper() {
    return (
        <NavigationContainer ref={navigationRef}>
            <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, AttachmentModalContextProvider]}>
                <ReactionListContext.Provider value={mockReactionListContextValue}>
                    <ActionListContext.Provider value={mockRef}>
                        <ReportActionsList
                            reportID={REPORT_ID}
                            onLayout={mockOnLayout}
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
