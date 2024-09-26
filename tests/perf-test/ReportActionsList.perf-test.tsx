import {fireEvent, screen} from '@testing-library/react-native';
import type {ComponentType} from 'react';
import Onyx from 'react-native-onyx';
import {measurePerformance} from 'reassure';
import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';
import type Navigation from '@libs/Navigation/Navigation';
import ComposeProviders from '@src/components/ComposeProviders';
import {LocaleContextProvider} from '@src/components/LocaleContextProvider';
import OnyxProvider from '@src/components/OnyxProvider';
import * as Localize from '@src/libs/Localize';
import ONYXKEYS from '@src/ONYXKEYS';
import ReportActionsList from '@src/pages/home/report/ReportActionsList';
import {ReportAttachmentsProvider} from '@src/pages/home/report/ReportAttachmentsContext';
import {ActionListContext, ReactionListContext} from '@src/pages/home/ReportScreenContext';
import variables from '@src/styles/variables';
import type {PersonalDetailsList} from '@src/types/onyx';
import createRandomReportAction from '../utils/collections/reportActions';
import * as LHNTestUtilsModule from '../utils/LHNTestUtils';
import * as ReportTestUtils from '../utils/ReportTestUtils';
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
        safeEvictionKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
    }),
);

const mockOnLayout = jest.fn();
const mockOnScroll = jest.fn();
const mockLoadChats = jest.fn();
const mockRef = {current: null, flatListRef: null, scrollPosition: null, setScrollPosition: () => {}};

beforeEach(() => {
    // Initialize the network key for OfflineWithFeedback
    Onyx.merge(ONYXKEYS.NETWORK, {isOffline: false});
    wrapOnyxWithWaitForBatchedUpdates(Onyx);
    Onyx.clear().then(waitForBatchedUpdates);
});

function ReportActionsListWrapper() {
    return (
        <ComposeProviders components={[OnyxProvider, LocaleContextProvider, ReportAttachmentsProvider]}>
            <ReactionListContext.Provider value={mockRef}>
                <ActionListContext.Provider value={mockRef}>
                    <ReportActionsList
                        parentReportAction={createRandomReportAction(1)}
                        parentReportActionForTransactionThread={undefined}
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

test('[ReportActionsList] should render ReportActionsList with 500 reportActions stored', async () => {
    const scenario = async () => {
        await screen.findByTestId('report-actions-list');
    };
    await waitForBatchedUpdates();

    Onyx.multiSet({
        [ONYXKEYS.PERSONAL_DETAILS_LIST]: LHNTestUtilsModule.fakePersonalDetails,
    });

    await measurePerformance(<ReportActionsListWrapper />, {scenario});
});

test('[ReportActionsList] should render list items', async () => {
    const scenario = async () => {
        const hintText = Localize.translateLocal('accessibilityHints.chatMessage');
        await screen.findAllByLabelText(hintText);
    };

    await waitForBatchedUpdates();

    Onyx.multiSet({
        [ONYXKEYS.PERSONAL_DETAILS_LIST]: LHNTestUtilsModule.fakePersonalDetails,
    });

    await measurePerformance(<ReportActionsListWrapper />, {scenario});
});

test('[ReportActionsList] should scroll through list of items', async () => {
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
    };
    await waitForBatchedUpdates();

    Onyx.multiSet({
        [ONYXKEYS.PERSONAL_DETAILS_LIST]: LHNTestUtilsModule.fakePersonalDetails,
    });

    await measurePerformance(<ReportActionsListWrapper />, {scenario});
});
