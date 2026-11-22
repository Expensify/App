import {act, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import {openReport} from '@libs/actions/Report';

import DynamicSplitBillDetailsPage from '@pages/iou/DynamicSplitBillDetailsPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction} from '@src/types/onyx';

import type * as ReactNative from 'react-native';

import React from 'react';
import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const CURRENT_USER_ACCOUNT_ID = 1;
const OTHER_USER_ACCOUNT_ID = 2;
const DM_REPORT_ID = 'dm';
const SPLIT_REPORT_ACTION_ID = 'splitAction';
const SPLIT_TRANSACTION_ID = 'splitTransaction';
const LOADING_TEXT = 'loading';
const NOT_FOUND_TEXT = 'not found';

jest.mock('@libs/actions/Report', () => ({
    ...jest.requireActual<Record<string, unknown>>('@libs/actions/Report'),
    openReport: jest.fn(),
}));

// The wrapper's own loading and not-found checks are not under test, so the page gets its report and action from props
jest.mock('@pages/inbox/report/withReportAndReportActionOrNotFound', () => (Component: React.ComponentType) => Component);

jest.mock('@components/FullscreenLoadingIndicator', () => {
    const {Text} = jest.requireActual<typeof ReactNative>('react-native');
    return () => <Text>loading</Text>;
});

jest.mock('@components/BlockingViews/FullPageNotFoundView', () => {
    const {Text} = jest.requireActual<typeof ReactNative>('react-native');
    function MockFullPageNotFoundView({shouldShow, children}: {shouldShow: boolean; children: React.ReactNode}) {
        return shouldShow ? <Text>not found</Text> : children;
    }
    return MockFullPageNotFoundView;
});

jest.mock('@components/MoneyRequestConfirmationList', () => () => null);
jest.mock('@components/HeaderWithBackButton', () => () => null);
jest.mock('@hooks/useDynamicBackPath', () => jest.fn(() => 'r/dm'));

jest.mock('@components/ScreenWrapper', () => {
    function MockScreenWrapper({children}: {children: React.ReactNode}) {
        return children;
    }
    return MockScreenWrapper;
});

jest.mock('@libs/Navigation/Navigation', () => ({
    goBack: jest.fn(),
    navigate: jest.fn(),
    dismissModal: jest.fn(),
}));

type SplitBillDetailsPageProps = React.ComponentProps<typeof DynamicSplitBillDetailsPage>;

const report: Report = {
    reportID: DM_REPORT_ID,
    type: CONST.REPORT.TYPE.CHAT,
    participants: {
        [CURRENT_USER_ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
        [OTHER_USER_ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
    },
};

const splitReportAction = createMock<ReportAction>({
    reportActionID: SPLIT_REPORT_ACTION_ID,
    actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
    actorAccountID: CURRENT_USER_ACCOUNT_ID,
    created: '2026-11-01 00:00:00.000',
    // eslint-disable-next-line @typescript-eslint/no-deprecated -- the backend still sends originalMessage on report actions
    originalMessage: {
        type: CONST.IOU.REPORT_ACTION_TYPE.SPLIT,
        IOUTransactionID: SPLIT_TRANSACTION_ID,
        amount: 100,
        currency: CONST.CURRENCY.USD,
        participantAccountIDs: [CURRENT_USER_ACCOUNT_ID, OTHER_USER_ACCOUNT_ID],
    },
});

function renderPage() {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <DynamicSplitBillDetailsPage
                route={createMock<SplitBillDetailsPageProps['route']>({params: {reportID: DM_REPORT_ID, reportActionID: SPLIT_REPORT_ACTION_ID}})}
                navigation={createMock<SplitBillDetailsPageProps['navigation']>({})}
                report={report}
                reportAction={splitReportAction}
                parentReport={undefined}
                parentReportAction={null}
            />
        </ComposeProviders>,
    );
}

function setReportLoading(isLoadingInitialReportActions: boolean) {
    return Onyx.merge(`${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}${DM_REPORT_ID}`, {isLoadingInitialReportActions});
}

describe('DynamicSplitBillDetailsPage', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.mocked(openReport).mockClear();
        await Onyx.clear();
        await Onyx.merge(ONYXKEYS.SESSION, {accountID: CURRENT_USER_ACCOUNT_ID});
        await waitForBatchedUpdatesWithAct();
    });

    it('waits for a chat load that is already running instead of fetching again', async () => {
        // Given the split's transaction is missing and the chat is already loading, as when the chat screen behind the page fetches it after a cache reset
        await setReportLoading(true);
        await waitForBatchedUpdatesWithAct();

        // When the split details open
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // Then the page shows the loader instead of not-found, and doesn't send a second OpenReport that would replace the running one
        expect(screen.getByText(LOADING_TEXT)).toBeOnTheScreen();
        expect(screen.queryByText(NOT_FOUND_TEXT)).not.toBeOnTheScreen();
        expect(openReport).not.toHaveBeenCalled();
    });

    it('fetches the chat without marking it read when nothing is loading it', async () => {
        // Given the split's transaction is missing and no load of the chat is running, as when the split opens from Search
        // When the split details open
        renderPage();
        await waitForBatchedUpdatesWithAct();

        // Then the page fetches the chat once, keeping its unread state because the user only views the split, and shows the loader meanwhile
        expect(openReport).toHaveBeenCalledTimes(1);
        expect(openReport).toHaveBeenCalledWith(expect.objectContaining({reportID: DM_REPORT_ID, shouldMarkAsRead: false, shouldKeepManualUnreadMarker: true}));
        expect(screen.getByText(LOADING_TEXT)).toBeOnTheScreen();
        expect(screen.queryByText(NOT_FOUND_TEXT)).not.toBeOnTheScreen();
    });

    it('shows not-found when the chat load finishes without the transaction', async () => {
        // Given the split details are open while the chat loads
        await setReportLoading(true);
        await waitForBatchedUpdatesWithAct();
        renderPage();
        await waitForBatchedUpdatesWithAct();
        expect(screen.getByText(LOADING_TEXT)).toBeOnTheScreen();

        // When that load finishes and still has no transaction for the split, as for a split that no longer exists
        await act(async () => {
            await setReportLoading(false);
        });
        await waitForBatchedUpdatesWithAct();

        // Then the page stops loading and shows not-found, so a missing split never spins forever
        expect(screen.getByText(NOT_FOUND_TEXT)).toBeOnTheScreen();
        expect(screen.queryByText(LOADING_TEXT)).not.toBeOnTheScreen();
    });
});
