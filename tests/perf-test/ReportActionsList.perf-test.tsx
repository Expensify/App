import {screen} from '@testing-library/react-native';
import type {ComponentType} from 'react';
import Onyx from 'react-native-onyx';
import {measureRenders} from 'reassure';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';
import type Navigation from '@libs/Navigation/Navigation';
import {AttachmentModalContextProvider} from '@pages/media/AttachmentModalScreen/AttachmentModalContext';
import ComposeProviders from '@src/components/ComposeProviders';
import {LocaleContextProvider} from '@src/components/LocaleContextProvider';
import ONYXKEYS from '@src/ONYXKEYS';
import ReportActionsList from '@src/pages/home/report/ReportActionsList';
import {ActionListContext, ReactionListContext} from '@src/pages/home/ReportScreenContext';
import type {PersonalDetailsList} from '@src/types/onyx';
import createRandomReportAction from '../utils/collections/reportActions';
import {createRandomReport} from '../utils/collections/reports';
import * as ReportTestUtils from '../utils/ReportTestUtils';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import wrapOnyxWithWaitForBatchedUpdates from '../utils/wrapOnyxWithWaitForBatchedUpdates';

type LazyLoadLHNTestUtils = {
    fakePersonalDetails: PersonalDetailsList;
};

const mockedNavigate = jest.fn();

jest.mock('@components/withCurrentUserPersonalDetails', () => {
    // Lazy loading of LHNTestUtils
    const lazyLoadLHNTestUtils = () => require<LazyLoadLHNTestUtils>('../utils/LHNTestUtils');

    return <TProps extends WithCurrentUserPersonalDetailsProps>(Component: ComponentType<TProps>) => {
        function WrappedComponent(props: Omit<TProps, keyof WithCurrentUserPersonalDetailsProps>) {
            const currentUserAccountID = 5;
            const LHNTestUtils = lazyLoadLHNTestUtils(); // Load LHNTestUtils here

            return (
                <Component
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...(props as TProps)}
                    currentUserPersonalDetails={LHNTestUtils.fakePersonalDetails[currentUserAccountID]}
                />
            );
        }

        WrappedComponent.displayName = 'WrappedComponent';

        return WrappedComponent;
    };
});

jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual<typeof Navigation>('@react-navigation/native');
    return {
        ...actualNav,
        useRoute: () => mockedNavigate,
        useIsFocused: () => true,
    };
});

jest.mock('@src/components/ConfirmedRoute.tsx');

beforeAll(() =>
    Onyx.init({
        keys: ONYXKEYS,
        evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
    }),
);

const mockOnLayout = jest.fn();
const mockOnScroll = jest.fn();
const mockLoadChats = jest.fn();
const mockRef = {current: null, flatListRef: null, scrollPosition: null, setScrollPosition: () => {}};

const TEST_USER_ACCOUNT_ID = 1;
const TEST_USER_LOGIN = 'test@test.com';

const signUpWithTestUser = () => {
    TestHelper.signInWithTestUser(TEST_USER_ACCOUNT_ID, TEST_USER_LOGIN);
};

const report = createRandomReport(1, undefined);
const parentReportAction = createRandomReportAction(1);

beforeEach(() => {
    // Initialize the network key for OfflineWithFeedback
    Onyx.merge(ONYXKEYS.NETWORK, {isOffline: false});
    wrapOnyxWithWaitForBatchedUpdates(Onyx);
    signUpWithTestUser();
});

afterEach(() => {
    Onyx.clear();
});

function ReportActionsListWrapper() {
    const reportActions = ReportTestUtils.getMockedSortedReportActions(500);
    return (
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, AttachmentModalContextProvider]}>
            <ReactionListContext.Provider value={mockRef}>
                <ActionListContext.Provider value={mockRef}>
                    <ReportActionsList
                        parentReportAction={parentReportAction}
                        parentReportActionForTransactionThread={undefined}
                        sortedReportActions={reportActions}
                        sortedVisibleReportActions={reportActions}
                        report={report}
                        onLayout={mockOnLayout}
                        onScroll={mockOnScroll}
                        listID={1}
                        loadOlderChats={mockLoadChats}
                        loadNewerChats={mockLoadChats}
                        transactionThreadReport={report}
                    />
                </ActionListContext.Provider>
            </ReactionListContext.Provider>
        </ComposeProviders>
    );
}

test('[ReportActionsList] should render ReportActionsList with 500 reportActions stored', async () => {
    const scenario = async () => {
        await screen.findByTestId('report-actions-list');
    };
    await waitForBatchedUpdates();
    await measureRenders(<ReportActionsListWrapper />, {scenario});
});
