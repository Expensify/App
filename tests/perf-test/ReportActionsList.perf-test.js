import {measurePerformance} from 'reassure';
import Onyx from 'react-native-onyx';
import {screen, fireEvent} from '@testing-library/react-native';
import ReportActionsList from '../../src/pages/home/report/ReportActionsList';
import ComposeProviders from '../../src/components/ComposeProviders';
import OnyxProvider from '../../src/components/OnyxProvider';
import {ReportAttachmentsProvider} from '../../src/pages/home/report/ReportAttachmentsContext';
import {WindowDimensionsProvider} from '../../src/components/withWindowDimensions';
import {LocaleContextProvider} from '../../src/components/LocaleContextProvider';
import * as LHNTestUtils from '../utils/LHNTestUtils';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import wrapOnyxWithWaitForBatchedUpdates from '../utils/wrapOnyxWithWaitForBatchedUpdates';
import PusherHelper from '../utils/PusherHelper';
import variables from '../../src/styles/variables';
import {ActionListContext, ReactionListContext} from '../../src/pages/home/ReportScreenContext';
import ONYXKEYS from '../../src/ONYXKEYS';
import * as Localize from '../../src/libs/Localize';

jest.setTimeout(60000);

const mockedNavigate = jest.fn();

jest.mock('../../src/components/withNavigationFocus', () => (Component) => {
    function WithNavigationFocus(props) {
        return (
            <Component
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
                isFocused={false}
            />
        );
    }

    WithNavigationFocus.displayName = 'WithNavigationFocus';

    return WithNavigationFocus;
});

jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual('@react-navigation/native');
    return {
        ...actualNav,
        useRoute: () => mockedNavigate,
    };
});

beforeAll(() =>
    Onyx.init({
        keys: ONYXKEYS,
        safeEvictionKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
        registerStorageEventListener: () => {},
    }),
);

afterAll(() => {
    jest.clearAllMocks();
});

const mockOnLayout = jest.fn();
const mockOnScroll = jest.fn();
const mockLoadMoreChats = jest.fn();
const mockRef = {current: null};

// Initialize the network key for OfflineWithFeedback
beforeEach(() => {
    PusherHelper.setup();
    wrapOnyxWithWaitForBatchedUpdates(Onyx);
    return Onyx.merge(ONYXKEYS.NETWORK, {isOffline: false});
});

// Clear out Onyx after each test so that each test starts with a clean slate
afterEach(() => {
    Onyx.clear();
    PusherHelper.teardown();
});

const getFakeReportAction = (index) => ({
    actionName: 'ADDCOMMENT',
    actorAccountID: index,
    automatic: false,
    avatar: '',
    created: '2023-09-12 16:27:35.124',
    isAttachment: true,
    isFirstItem: false,
    lastModified: '2021-07-14T15:00:00Z',
    message: [
        {
            html: 'hey',
            isDelatedParentAction: false,
            isEdited: false,
            reactions: [],
            text: 'test',
            type: 'TEXT',
            whisperedTo: [],
        },
    ],
    originalMessage: {
        html: 'hey',
        lastModified: '2021-07-14T15:00:00Z',
    },
    pendingAction: null,
    person: [
        {
            type: 'TEXT',
            style: 'strong',
            text: 'email@test.com',
        },
    ],
    previousReportActionID: '1',
    reportActionID: index.toString(),
    reportActionTimestamp: 1696243169753,
    sequenceNumber: 2,
    shouldShow: true,
    timestamp: 1696243169,
    whisperedToAccountIDs: [],
});

const getMockedSortedReportActions = (length = 100) => Array.from({length}, (__, i) => getFakeReportAction(i));

const currentUserAccountID = 5;

function ReportActionsListWrapper() {
    return (
        <ComposeProviders components={[OnyxProvider, LocaleContextProvider, WindowDimensionsProvider, ReportAttachmentsProvider]}>
            <ReactionListContext.Provider value={mockRef}>
                <ActionListContext.Provider value={mockRef}>
                    <ReportActionsList
                        sortedReportActions={getMockedSortedReportActions(500)}
                        report={LHNTestUtils.getFakeReport()}
                        onLayout={mockOnLayout}
                        onScroll={mockOnScroll}
                        loadMoreChats={mockLoadMoreChats}
                        currentUserPersonalDetails={LHNTestUtils.fakePersonalDetails[currentUserAccountID]}
                    />
                </ActionListContext.Provider>
            </ReactionListContext.Provider>
        </ComposeProviders>
    );
}

test('should render ReportActionsList with 500 reportActions stored', () => {
    const scenario = async () => {
        await screen.findByTestId('report-actions-list');
        const hintText = Localize.translateLocal('accessibilityHints.chatMessage');
        // Ensure that the list of items is rendered
        await screen.findAllByLabelText(hintText);
    };

    return waitForBatchedUpdates()
        .then(() =>
            Onyx.multiSet({
                [ONYXKEYS.PERSONAL_DETAILS_LIST]: LHNTestUtils.fakePersonalDetails,
            }),
        )
        .then(() => measurePerformance(<ReportActionsListWrapper />, {scenario}));
});

test('should scroll and click some of the reports', () => {
    const eventData = {
        nativeEvent: {
            contentOffset: {
                y: variables.optionRowHeight * 5,
            },
            contentSize: {
                // Dimensions of the scrollable content
                height: variables.optionRowHeight * 10,
                width: 100,
            },
            layoutMeasurement: {
                // Dimensions of the device
                height: variables.optionRowHeight * 5,
                width: 100,
            },
        },
    };

    const scenario = async () => {
        const reportActionsList = await screen.findByTestId('report-actions-list');
        expect(reportActionsList).toBeDefined();

        fireEvent.scroll(reportActionsList, eventData);

        const hintText = Localize.translateLocal('accessibilityHints.chatMessage');
        const reportItems = await screen.findAllByLabelText(hintText);

        fireEvent.press(reportItems[0], 'onLongPress');
    };

    return waitForBatchedUpdates()
        .then(() =>
            Onyx.multiSet({
                [ONYXKEYS.PERSONAL_DETAILS_LIST]: LHNTestUtils.fakePersonalDetails,
            }),
        )
        .then(() => measurePerformance(<ReportActionsListWrapper />, {scenario}));
});
