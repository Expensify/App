import {fireEvent, screen} from '@testing-library/react-native';
import type {ComponentType} from 'react';
import Onyx from 'react-native-onyx';
import {measurePerformance} from 'reassure';
import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';
import type Navigation from '@libs/Navigation/Navigation';
import ComposeProviders from '@src/components/ComposeProviders';
import {LocaleContextProvider} from '@src/components/LocaleContextProvider';
import OnyxProvider from '@src/components/OnyxProvider';
import {WindowDimensionsProvider} from '@src/components/withWindowDimensions';
import * as Localize from '@src/libs/Localize';
import ONYXKEYS from '@src/ONYXKEYS';
import ReportActionsList from '@src/pages/home/report/ReportActionsList';
import {ReportAttachmentsProvider} from '@src/pages/home/report/ReportAttachmentsContext';
import {ActionListContext, ReactionListContext} from '@src/pages/home/ReportScreenContext';
import variables from '@src/styles/variables';
import type {PersonalDetailsList} from '@src/types/onyx';
import createRandomReportAction from '../utils/collections/reportActions';
import * as LHNTestUtilsModule from '../utils/LHNTestUtils';
import PusherHelper from '../utils/PusherHelper';
import * as ReportTestUtils from '../utils/ReportTestUtils';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import wrapOnyxWithWaitForBatchedUpdates from '../utils/wrapOnyxWithWaitForBatchedUpdates';

type LHNTestUtilsProps = {
    fakePersonalDetails: PersonalDetailsList;
};

const mockedNavigate = jest.fn();

jest.mock('@components/withCurrentUserPersonalDetails', () => {
    // Lazy loading of LHNTestUtils
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    const lazyLoadLHNTestUtils = () => require('../utils/LHNTestUtils');

    return <TProps extends WithCurrentUserPersonalDetailsProps>(Component: ComponentType<TProps>) => {
        function WrappedComponent(props: Omit<TProps, keyof WithCurrentUserPersonalDetailsProps>) {
            const currentUserAccountID = 5;
            const LHNTestUtils: LHNTestUtilsProps = lazyLoadLHNTestUtils(); // Load LHNTestUtils here

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
    const actualNav = jest.requireActual('@react-navigation/native');
    return {
        ...actualNav,
        useRoute: () => mockedNavigate,
        useIsFocused: () => true,
    } as typeof Navigation;
});

jest.mock('@src/components/ConfirmedRoute.tsx');

beforeAll(() =>
    Onyx.init({
        keys: ONYXKEYS,
        safeEvictionKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
    }),
);

afterAll(() => {
    jest.clearAllMocks();
});

const mockOnLayout = jest.fn();
const mockOnScroll = jest.fn();
const mockLoadChats = jest.fn();
const mockRef = {current: null, flatListRef: null, scrollPosition: null, setScrollPosition: () => {}};

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

function ReportActionsListWrapper() {
    return (
        <ComposeProviders components={[OnyxProvider, LocaleContextProvider, WindowDimensionsProvider, ReportAttachmentsProvider]}>
            <ReactionListContext.Provider value={mockRef}>
                <ActionListContext.Provider value={mockRef}>
                    <ReportActionsList
                        parentReportAction={createRandomReportAction(1)}
                        parentReportActionForTransactionThread={null}
                        sortedReportActions={ReportTestUtils.getMockedSortedReportActions(500)}
                        report={LHNTestUtilsModule.getFakeReport()}
                        onLayout={mockOnLayout}
                        onScroll={mockOnScroll}
                        onContentSizeChange={() => {}}
                        listID={1}
                        loadOlderChats={mockLoadChats}
                        loadNewerChats={mockLoadChats}
                        transactionThreadReport={LHNTestUtilsModule.getFakeReport()}
                        reportActions={ReportTestUtils.getMockedSortedReportActions(500)}
                    />
                </ActionListContext.Provider>
            </ReactionListContext.Provider>
        </ComposeProviders>
    );
}

test('[ReportActionsList] should render ReportActionsList with 500 reportActions stored', () => {
    const scenario = async () => {
        await screen.findByTestId('report-actions-list');
        const hintText = Localize.translateLocal('accessibilityHints.chatMessage');
        // Ensure that the list of items is rendered
        await screen.findAllByLabelText(hintText);
    };

    return waitForBatchedUpdates()
        .then(() =>
            Onyx.multiSet({
                [ONYXKEYS.PERSONAL_DETAILS_LIST]: LHNTestUtilsModule.fakePersonalDetails,
            }),
        )
        .then(() => measurePerformance(<ReportActionsListWrapper />, {scenario}));
});

test('[ReportActionsList] should scroll and click some of the reports', () => {
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
        fireEvent.scroll(reportActionsList, eventData);

        const hintText = Localize.translateLocal('accessibilityHints.chatMessage');
        const reportItems = await screen.findAllByLabelText(hintText);

        fireEvent.press(reportItems[0], 'onLongPress');
    };

    return waitForBatchedUpdates()
        .then(() =>
            Onyx.multiSet({
                [ONYXKEYS.PERSONAL_DETAILS_LIST]: LHNTestUtilsModule.fakePersonalDetails,
            }),
        )
        .then(() => measurePerformance(<ReportActionsListWrapper />, {scenario}));
});
