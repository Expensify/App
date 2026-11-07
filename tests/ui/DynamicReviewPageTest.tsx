import {act, render, screen} from '@testing-library/react-native';

import ActivityIndicator from '@components/ActivityIndicator';
import ComposeProviders from '@components/ComposeProviders';
import {CurrentUserPersonalDetailsContext} from '@components/CurrentUserPersonalDetailsProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import useNetwork from '@hooks/useNetwork';

import navigationRef from '@libs/Navigation/navigationRef';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';

import DynamicReviewPage from '@pages/TransactionDuplicate/DynamicReviewPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {Report} from '@src/types/onyx';

import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import * as LHNTestUtils from '../utils/LHNTestUtils';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const ACCOUNT_ID = 1;
const THREAD_REPORT_ID = 'threadOfDraftExpense';
const DRAFT_REPORT_ID = 'draftReport';
const OTHER_REPORT_ID = 'otherReport';
const IOU_ACTION_ID = 'iouActionOfDraftExpense';
const DRAFT_TRANSACTION_ID = 'draftTransaction';
const OTHER_TRANSACTION_ID = 'otherTransaction';

const LOADING_FLAG_KEY = `${ONYXKEYS.COLLECTION.RAM_ONLY_IS_LOADING_DUPLICATE_TRANSACTION_DETAILS}${DRAFT_TRANSACTION_ID}` as const;

const OPEN_REPORT_STATE = {stateNum: CONST.REPORT.STATE_NUM.OPEN, statusNum: CONST.REPORT.STATUS_NUM.OPEN};
const PAID_REPORT_STATE = {stateNum: CONST.REPORT.STATE_NUM.APPROVED, statusNum: CONST.REPORT.STATUS_NUM.REIMBURSED};

jest.mock('@hooks/useDynamicBackPath', () => jest.fn(() => ''));
jest.mock('@hooks/useNetwork', () => jest.fn(() => ({isOffline: false})));

// The page's loading state is driven from Onyx below, so the request itself isn't sent
jest.mock('@libs/actions/Transaction', () => ({
    ...jest.requireActual<Record<string, unknown>>('@libs/actions/Transaction'),
    getDuplicateTransactionDetails: jest.fn(),
}));

// The rows are irrelevant to which actions the page offers, so they are rendered as a lightweight probe
jest.mock('@pages/TransactionDuplicate/DuplicateTransactionsList', () => {
    const RN = jest.requireActual<Record<string, React.ComponentType<{testID?: string}>>>('react-native');
    return () => <RN.View testID="duplicate-transactions-list" />;
});

const Stack = createPlatformStackNavigator<Record<string, {reportID: string}>>();

TestHelper.setupGlobalFetchMock();

const buildExpense = (transactionID: string, reportID: string) => ({
    transactionID,
    reportID,
    amount: -1000,
    currency: CONST.CURRENCY.USD,
    created: '2026-10-01',
    merchant: 'Ramen',
    comment: {},
});

const buildExpenseReport = (reportID: string, reportState: Pick<Report, 'stateNum' | 'statusNum'>) => ({
    reportID,
    type: CONST.REPORT.TYPE.EXPENSE,
    ownerAccountID: ACCOUNT_ID,
    ...reportState,
});

// What GetDuplicateTransactionDetails writes when it responds: the other duplicate, its report, and the finished flag
const finishLoadingOtherDuplicate = async (reportState: Pick<Report, 'stateNum' | 'statusNum'>) => {
    await act(async () => {
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${OTHER_TRANSACTION_ID}`, buildExpense(OTHER_TRANSACTION_ID, OTHER_REPORT_ID));
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${OTHER_REPORT_ID}`, buildExpenseReport(OTHER_REPORT_ID, reportState));
        await Onyx.set(LOADING_FLAG_KEY, false);
    });
    await waitForBatchedUpdatesWithAct();
};

const renderPage = async () => {
    render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <CurrentUserPersonalDetailsContext.Provider value={{accountID: ACCOUNT_ID}}>
                <NavigationContainer ref={navigationRef}>
                    <Stack.Navigator>
                        <Stack.Screen
                            name={SCREENS.TRANSACTION_DUPLICATE.DYNAMIC_REVIEW}
                            component={DynamicReviewPage}
                            initialParams={{reportID: THREAD_REPORT_ID}}
                        />
                    </Stack.Navigator>
                </NavigationContainer>
            </CurrentUserPersonalDetailsContext.Provider>
        </ComposeProviders>,
    );
    await waitForBatchedUpdatesWithAct();
};

const keepAllLabel = () => TestHelper.translateLocal('iou.keepAll');
const keepSelectedLabel = () => TestHelper.translateLocal('iou.keepSelected');

describe('Reviewing duplicates that load late', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.mocked(useNetwork).mockReturnValue({isOffline: false});
        await act(async () => {
            await Onyx.clear();
            await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.EN);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${DRAFT_REPORT_ID}`, buildExpenseReport(DRAFT_REPORT_ID, OPEN_REPORT_STATE));
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${THREAD_REPORT_ID}`, {
                ...LHNTestUtils.getFakeReport(),
                reportID: THREAD_REPORT_ID,
                parentReportID: DRAFT_REPORT_ID,
                parentReportActionID: IOU_ACTION_ID,
            });
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${DRAFT_REPORT_ID}`, {
                [IOU_ACTION_ID]: {
                    ...LHNTestUtils.getFakeReportAction(),
                    reportActionID: IOU_ACTION_ID,
                    reportID: DRAFT_REPORT_ID,
                    actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                    actorAccountID: ACCOUNT_ID,
                    childReportID: THREAD_REPORT_ID,
                    message: {
                        type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                        IOUTransactionID: DRAFT_TRANSACTION_ID,
                        IOUReportID: DRAFT_REPORT_ID,
                        amount: 1000,
                        currency: CONST.CURRENCY.USD,
                        text: '',
                    },
                },
            });
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${DRAFT_TRANSACTION_ID}`, buildExpense(DRAFT_TRANSACTION_ID, DRAFT_REPORT_ID));
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${DRAFT_TRANSACTION_ID}`, [
                {name: CONST.VIOLATIONS.DUPLICATED_TRANSACTION, type: CONST.VIOLATION_TYPES.WARNING, data: {duplicates: [OTHER_TRANSACTION_ID]}},
            ]);
        });
        await waitForBatchedUpdatesWithAct();
    });

    it('shows a loader instead of a partial list while the other duplicate is loading', async () => {
        // Given the request for the other duplicate is in flight and only this expense is in Onyx
        await act(async () => {
            await Onyx.set(LOADING_FLAG_KEY, true);
        });

        // When the review opens
        await renderPage();

        // Then only the loader shows, because neither action is safe to offer on a partial list
        expect(screen.UNSAFE_queryByType(ActivityIndicator)).not.toBeNull();
        expect(screen.queryByTestId('duplicate-transactions-list')).not.toBeOnTheScreen();
        expect(screen.queryByText(keepAllLabel())).not.toBeOnTheScreen();
        expect(screen.queryByText(keepSelectedLabel())).not.toBeOnTheScreen();
    });

    it('shows a loader on the first render, before the request has set the flag', async () => {
        // Given the flag has never been set, which is the state before the page's effect sends the request

        // When the review opens
        await renderPage();

        // Then the loader shows, so Keep selected doesn't appear for the frames before the request starts
        expect(screen.UNSAFE_queryByType(ActivityIndicator)).not.toBeNull();
        expect(screen.queryByText(keepSelectedLabel())).not.toBeOnTheScreen();
    });

    it('offers only Keep all once the other duplicate turns out to be paid', async () => {
        // Given the review is waiting on the other duplicate
        await act(async () => {
            await Onyx.set(LOADING_FLAG_KEY, true);
        });
        await renderPage();

        // When the response brings a duplicate on a paid report
        await finishLoadingOtherDuplicate(PAID_REPORT_STATE);

        // Then Keep selected stays hidden, because merging into a paid report fails server-side
        expect(screen.UNSAFE_queryByType(ActivityIndicator)).toBeNull();
        expect(screen.getByText(keepAllLabel())).toBeOnTheScreen();
        expect(screen.getByText(TestHelper.translateLocal('iou.someDuplicatesArePaid'))).toBeOnTheScreen();
        expect(screen.queryByText(keepSelectedLabel())).not.toBeOnTheScreen();
    });

    it('offers Keep selected once the other duplicate turns out to be on an open report', async () => {
        // Given the review is waiting on the other duplicate
        await act(async () => {
            await Onyx.set(LOADING_FLAG_KEY, true);
        });
        await renderPage();

        // When the response brings a duplicate on an open report
        await finishLoadingOtherDuplicate(OPEN_REPORT_STATE);

        // Then both actions show, because every duplicate is known to be mergeable
        expect(screen.UNSAFE_queryByType(ActivityIndicator)).toBeNull();
        expect(screen.getByText(keepAllLabel())).toBeOnTheScreen();
        expect(screen.getByText(keepSelectedLabel())).toBeOnTheScreen();
    });

    it('stops loading but hides Keep selected when the request finishes without the other duplicate', async () => {
        // Given the request has finished and the other duplicate never arrived
        await act(async () => {
            await Onyx.set(LOADING_FLAG_KEY, false);
        });

        // When the review opens
        await renderPage();

        // Then the user isn't stuck on the loader, and Keep selected stays hidden because the duplicate could be paid
        expect(screen.UNSAFE_queryByType(ActivityIndicator)).toBeNull();
        expect(screen.getByText(keepAllLabel())).toBeOnTheScreen();
        expect(screen.queryByText(keepSelectedLabel())).not.toBeOnTheScreen();
    });

    it('hides Keep selected when the other duplicate is loaded but its report is not', async () => {
        // Given the other duplicate is cached without its report, as happens after the report is evicted from Onyx
        await act(async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${OTHER_TRANSACTION_ID}`, buildExpense(OTHER_TRANSACTION_ID, OTHER_REPORT_ID));
            await Onyx.set(LOADING_FLAG_KEY, false);
        });

        // When the review opens
        await renderPage();

        // Then Keep selected stays hidden, because the missing report could be approved or paid
        expect(screen.getByText(keepAllLabel())).toBeOnTheScreen();
        expect(screen.queryByText(keepSelectedLabel())).not.toBeOnTheScreen();
    });

    it('skips the loader offline, because the request cannot finish', async () => {
        // Given the user is offline and the other duplicate isn't in Onyx
        jest.mocked(useNetwork).mockReturnValue({isOffline: true});

        // When the review opens
        await renderPage();

        // Then what's available is shown, with Keep selected hidden because the other duplicate's state is unknown
        expect(screen.UNSAFE_queryByType(ActivityIndicator)).toBeNull();
        expect(screen.getByText(keepAllLabel())).toBeOnTheScreen();
        expect(screen.queryByText(keepSelectedLabel())).not.toBeOnTheScreen();
    });
});
