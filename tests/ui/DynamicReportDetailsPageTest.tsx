import {act, fireEvent, render, screen} from '@testing-library/react-native';

import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import isReportTopmostSplitNavigator from '@libs/Navigation/helpers/isReportTopmostSplitNavigator';
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReportDetailsNavigatorParamList} from '@libs/Navigation/types';

import DynamicReportDetailsPage from '@pages/DynamicReportDetailsPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Report, ReportAction} from '@src/types/onyx';

import type {NavigationState} from '@react-navigation/native';

import {useIsFocused, useRoute} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import createRandomReportAction from '../utils/collections/reportActions';
import {createRandomReport} from '../utils/collections/reports';
import createRandomTransaction from '../utils/collections/transaction';
import createMock from '../utils/createMock';
import getOnyxValue from '../utils/getOnyxValue';
import {translateLocal} from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@src/components/ConfirmedRoute.tsx');

// FullPageNotFoundView lazy-loads its illustration; stub it so the "Not here" view renders synchronously.
jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyIllustrations: () => ({}),
    useMemoizedLazyExpensifyIcons: () => ({}),
}));

// Auto-confirm the delete confirmation modal so pressing "Delete expense" runs the real navigate-back logic.
const mockShowConfirmModal = jest.fn(() => Promise.resolve({action: 'CONFIRM'}));
jest.mock('@hooks/useConfirmModal', () => ({
    __esModule: true,
    default: () => ({
        showConfirmModal: mockShowConfirmModal,
        closeModal: () => {},
    }),
}));

jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual<typeof Navigation>('@react-navigation/native');
    return {
        ...actualNav,
        useIsFocused: jest.fn(),
        useFocusEffect: jest.fn(),
        useRoute: jest.fn(),
        usePreventRemove: jest.fn(),
    };
});

jest.mock('@libs/Navigation/helpers/isReportTopmostSplitNavigator');
const mockIsReportTopmostSplitNavigator = jest.mocked(isReportTopmostSplitNavigator);

const navigationMock = createMock<PlatformStackScreenProps<ReportDetailsNavigatorParamList, typeof SCREENS.REPORT_DETAILS.DYNAMIC_ROOT>['navigation']>({});
const getRouteMock = (reportID: string) => createMock<PlatformStackScreenProps<ReportDetailsNavigatorParamList, typeof SCREENS.REPORT_DETAILS.DYNAMIC_ROOT>['route']>({params: {reportID}});

describe('DynamicReportDetailsPage', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
            evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
        });
    });

    beforeEach(() => {
        // Default the navigator check to false so a prior test's `mockReturnValue(true)` doesn't leak into the next
        // one (individual tests override this when they need it to be true).
        mockIsReportTopmostSplitNavigator.mockReturnValue(false);
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
    });

    it('self DM track options should disappear when report moved to workspace', async () => {
        const selfDMReportID = '1';
        const trackExpenseReportID = '2';
        const trackExpenseActionID = '123';
        const transactionID = '3';
        const transaction = createRandomTransaction(1);
        const trackExpenseReport: Report = {
            ...createRandomReport(Number(trackExpenseReportID), undefined),
            parentReportID: selfDMReportID,
            parentReportActionID: trackExpenseActionID,
        };
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${selfDMReportID}`, {
                ...createRandomReport(Number(selfDMReportID), CONST.REPORT.CHAT_TYPE.SELF_DM),
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${trackExpenseReportID}`, trackExpenseReport);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, transaction);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${selfDMReportID}`, {
                [trackExpenseActionID]: {
                    ...createRandomReportAction(Number(trackExpenseActionID)),
                    actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                    originalMessage: {
                        type: CONST.IOU.REPORT_ACTION_TYPE.TRACK,
                    },
                },
            });
        });

        const {rerender} = render(
            <OnyxListItemProvider>
                <LocaleContextProvider>
                    <DynamicReportDetailsPage
                        betas={[]}
                        isLoadingReportData={false}
                        navigation={navigationMock}
                        policy={undefined}
                        report={trackExpenseReport}
                        reportMetadata={undefined}
                        reportLoadingState={undefined}
                        route={getRouteMock(trackExpenseReportID)}
                    />
                </LocaleContextProvider>
            </OnyxListItemProvider>,
        );
        await waitForBatchedUpdatesWithAct();
        const submitText = translateLocal('actionableMentionTrackExpense.submitToEmployer');
        await screen.findByText(submitText);

        // Categorize and share are temporarily disabled
        // const categorizeText = translateLocal('actionableMentionTrackExpense.categorize');
        // const shareText = translateLocal('actionableMentionTrackExpense.share');
        // await screen.findByText(categorizeText);
        // await screen.findByText(shareText);

        const movedTrackExpenseReport = {
            ...trackExpenseReport,
            parentReportID: '3',
            parentReportActionID: '234',
        };
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${trackExpenseReportID}`, movedTrackExpenseReport);
        });

        rerender(
            <OnyxListItemProvider>
                <LocaleContextProvider>
                    <DynamicReportDetailsPage
                        betas={[]}
                        isLoadingReportData={false}
                        navigation={navigationMock}
                        policy={undefined}
                        report={movedTrackExpenseReport}
                        reportMetadata={undefined}
                        reportLoadingState={undefined}
                        route={getRouteMock(trackExpenseReportID)}
                    />
                </LocaleContextProvider>
            </OnyxListItemProvider>,
        );

        expect(screen.queryByText(submitText)).not.toBeVisible();

        // Categorize and share are temporarily disabled
        // expect(screen.queryByText(categorizeText)).not.toBeVisible();
        // expect(screen.queryByText(shareText)).not.toBeVisible();
    });

    describe('"Go to room" option visibility', () => {
        const roomReportID = '10';
        const policyRoom: Report = createRandomReport(Number(roomReportID), CONST.REPORT.CHAT_TYPE.POLICY_ROOM);

        const renderDetailsPage = () =>
            render(
                <OnyxListItemProvider>
                    <LocaleContextProvider>
                        <DynamicReportDetailsPage
                            betas={[]}
                            isLoadingReportData={false}
                            navigation={navigationMock}
                            policy={undefined}
                            report={policyRoom}
                            reportMetadata={undefined}
                            reportLoadingState={undefined}
                            route={getRouteMock(roomReportID)}
                        />
                    </LocaleContextProvider>
                </OnyxListItemProvider>,
            );

        afterEach(() => {
            jest.restoreAllMocks();
        });

        it('shows "Go to room" when the room is not the screen behind the Details page', async () => {
            mockIsReportTopmostSplitNavigator.mockReturnValue(false);
            jest.spyOn(Navigation, 'getTopmostReportId').mockReturnValue(undefined);
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${roomReportID}`, policyRoom);
            });

            renderDetailsPage();
            await waitForBatchedUpdatesWithAct();

            expect(await screen.findByText(translateLocal('reportDetailsPage.goToRoom'))).toBeVisible();
        });

        it('does not show "Go to room" when the Details page is on top of its own room', async () => {
            mockIsReportTopmostSplitNavigator.mockReturnValue(true);
            jest.spyOn(Navigation, 'getTopmostReportId').mockReturnValue(roomReportID);
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${roomReportID}`, policyRoom);
            });

            renderDetailsPage();
            await waitForBatchedUpdatesWithAct();

            expect(screen.queryByText(translateLocal('reportDetailsPage.goToRoom'))).toBeNull();
        });
    });

    // Regression test for issue #97399: deleting an invoice navigates back to the invoice room via
    // `deleteTransactionNavigateBackUrl` without synchronously removing focus from this details RHP, so the report is
    // nulled while the RHP is still focused. Without the delete-back-URL escape hatch, `withReportOrNotFound`
    // renders the "Not here" page on the RHP. It must stay suppressed while the delete navigation is in flight.
    describe('invoice deletion does not show the "Not here" page', () => {
        const invoiceRoomID = '30';
        const invoiceReportID = '31';
        const transactionID = '32';
        const iouActionID = '33';
        const transactionThreadReportID = '34';

        const invoiceRoom: Report = createRandomReport(Number(invoiceRoomID), CONST.REPORT.CHAT_TYPE.INVOICE);
        const invoiceReport: Report = {
            ...createRandomReport(Number(invoiceReportID), undefined),
            type: CONST.REPORT.TYPE.INVOICE,
            chatReportID: invoiceRoomID,
            // Owned by the current user (default accountID 0 in tests) and open, so the expense is deletable.
            ownerAccountID: 0,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
        };
        // The IOU action whose deletion triggers the navigate-back. `actorAccountID: 0` matches the test's default
        // current user so the delete option is offered. Its `childReportID` is the one-transaction thread.
        const iouAction = {
            ...createRandomReportAction(Number(iouActionID)),
            actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
            actorAccountID: 0,
            childReportID: transactionThreadReportID,
            originalMessage: {
                IOUReportID: invoiceReportID,
                IOUTransactionID: transactionID,
                type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                amount: 100,
                currency: CONST.CURRENCY.USD,
            },
            pendingAction: null,
        } as ReportAction;
        const transactionThreadReport: Report = {
            ...createRandomReport(Number(transactionThreadReportID), undefined),
            parentReportID: invoiceReportID,
            parentReportActionID: iouActionID,
        };
        // The transaction lives on the invoice report, so it's the last (only) transaction — deleting it deletes the
        // whole invoice report, which is the case where the navigate-back targets the invoice room.
        const transaction = {
            ...createRandomTransaction(Number(transactionID)),
            transactionID,
            reportID: invoiceReportID,
            cardID: undefined,
            managedCard: false,
            bank: '',
            comment: {liabilityType: CONST.TRANSACTION.LIABILITY_TYPE.ALLOW},
        };

        afterEach(() => {
            jest.restoreAllMocks();
        });

        const seedInvoice = () =>
            act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${invoiceRoomID}`, invoiceRoom);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${invoiceReportID}`, invoiceReport);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`, transactionThreadReport);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${invoiceReportID}`, {[iouActionID]: iouAction});
                await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, transaction);
                await Onyx.set(ONYXKEYS.IS_LOADING_REPORT_DATA, false);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}${invoiceReportID}`, {isLoadingInitialReportActions: false});
            });

        // Proves the fallback in `DynamicReportDetailsPage` actually runs: deleting the invoice through the page must
        // write the invoice-room back URL. Without the fallback, `iouReport` is undefined for invoices, no URL is
        // produced, and this assertion fails — which is exactly the bug that left the RHP on "Not here".
        it('writes the invoice-room back URL when the invoice is deleted through the page', async () => {
            jest.mocked(useIsFocused).mockReturnValue(true);
            jest.mocked(useRoute).mockReturnValue({key: 'report-details', name: 'Report_Details_Root', params: {reportID: invoiceReportID}} as ReturnType<typeof useRoute>);
            // navigateToTargetUrl reads the root navigation state; provide a minimal one so it reaches the URL builder.
            const rootStateMock: NavigationState = {
                key: 'root',
                index: 0,
                routeNames: ['Home'],
                routes: [{key: 'home', name: 'Home'}],
                type: 'stack',
                stale: false,
            };
            jest.spyOn(navigationRef, 'getRootState').mockReturnValue(rootStateMock);
            // Run the deferred navigate-back synchronously and no-op the actual navigation side effects.
            jest.spyOn(Navigation, 'setNavigationActionToMicrotaskQueue').mockImplementation((callback) => callback());
            jest.spyOn(Navigation, 'dismissModal').mockImplementation(() => {});
            jest.spyOn(Navigation, 'dismissToSuperWideRHP').mockImplementation(() => {});
            jest.spyOn(Navigation, 'isNavigationReady').mockResolvedValue(undefined);
            jest.spyOn(Navigation, 'goBack').mockImplementation(() => {});

            await seedInvoice();

            render(
                <OnyxListItemProvider>
                    <LocaleContextProvider>
                        <DynamicReportDetailsPage
                            betas={[]}
                            isLoadingReportData={false}
                            navigation={navigationMock}
                            policy={undefined}
                            report={invoiceReport}
                            reportMetadata={undefined}
                            reportLoadingState={undefined}
                            route={getRouteMock(invoiceReportID)}
                        />
                    </LocaleContextProvider>
                </OnyxListItemProvider>,
            );
            await waitForBatchedUpdatesWithAct();

            // Press "Delete expense" and confirm (the confirm modal is auto-confirmed via the useConfirmModal mock).
            const deleteLabel = translateLocal('reportActionContextMenu.deleteAction', iouAction);
            const deleteButton = await screen.findByRole(CONST.ROLE.BUTTON, {name: new RegExp(deleteLabel)});
            // MenuItem's onPress only runs when it receives a truthy press event, so pass one explicitly.
            fireEvent.press(deleteButton, {nativeEvent: {}});
            await waitForBatchedUpdatesWithAct();

            // The page's own fallback must have produced the invoice-room back URL.
            const backUrl = await getOnyxValue(ONYXKEYS.NVP_DELETE_TRANSACTION_NAVIGATE_BACK_URL);
            expect(backUrl).toBe(ROUTES.REPORT_WITH_ID.getRoute(invoiceRoomID));
        });

        it('keeps NotFound suppressed when the invoice report is removed while a delete-back navigation is in flight', async () => {
            jest.mocked(useIsFocused).mockReturnValue(true);
            // Give the mocked route a name so the NotFound page can render cleanly if the guard fails to suppress it,
            // making this an assertion failure rather than a crash inside NotFoundPage.
            jest.mocked(useRoute).mockReturnValue({key: 'report-details', name: 'Report_Details_Root', params: {reportID: invoiceReportID}} as ReturnType<typeof useRoute>);

            await seedInvoice();

            render(
                <OnyxListItemProvider>
                    <LocaleContextProvider>
                        <DynamicReportDetailsPage
                            betas={[]}
                            isLoadingReportData={false}
                            navigation={navigationMock}
                            policy={undefined}
                            report={invoiceReport}
                            reportMetadata={undefined}
                            reportLoadingState={undefined}
                            route={getRouteMock(invoiceReportID)}
                        />
                    </LocaleContextProvider>
                </OnyxListItemProvider>,
            );
            await waitForBatchedUpdatesWithAct();

            // The details content rendered first (contentShown), so the report was accessible.
            expect(screen.queryByTestId('FullPageNotFoundView')).toBeNull();

            // Simulate the invoice delete: set the delete-back URL to the invoice room, then null the invoice report
            // (the deferred optimistic delete) while this focused RHP is still mounted.
            await act(async () => {
                await Onyx.set(ONYXKEYS.NVP_DELETE_TRANSACTION_NAVIGATE_BACK_URL, ROUTES.REPORT_WITH_ID.getRoute(invoiceRoomID));
                await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${invoiceReportID}`, null);
            });
            await waitForBatchedUpdatesWithAct();

            // The "Not here" page must stay suppressed while the delete navigation is in flight.
            expect(screen.queryByTestId('FullPageNotFoundView')).toBeNull();
        });
    });
});
