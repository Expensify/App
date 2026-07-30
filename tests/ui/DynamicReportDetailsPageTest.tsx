import {act, render, screen} from '@testing-library/react-native';

import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import isReportTopmostSplitNavigator from '@libs/Navigation/helpers/isReportTopmostSplitNavigator';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReportDetailsNavigatorParamList} from '@libs/Navigation/types';

import DynamicReportDetailsPage from '@pages/DynamicReportDetailsPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {Report} from '@src/types/onyx';

import {useIsFocused, useRoute} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import createRandomReportAction from '../utils/collections/reportActions';
import {createRandomReport} from '../utils/collections/reports';
import createRandomTransaction from '../utils/collections/transaction';
import {translateLocal} from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@src/components/ConfirmedRoute.tsx');

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
const mockUseIsFocused = jest.mocked(useIsFocused);
const mockUseRoute = jest.mocked(useRoute);

const navigationMock = {} as PlatformStackScreenProps<ReportDetailsNavigatorParamList, typeof SCREENS.REPORT_DETAILS.DYNAMIC_ROOT>['navigation'];
const getRouteMock = (reportID: string) => ({params: {reportID}}) as PlatformStackScreenProps<ReportDetailsNavigatorParamList, typeof SCREENS.REPORT_DETAILS.DYNAMIC_ROOT>['route'];

describe('DynamicReportDetailsPage', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
            evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
        });
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
        const submitText = translateLocal('actionableMentionTrackExpense.submit');
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

    it('does not show the NotFound page for an invoice while a delete-transaction navigation is in flight', async () => {
        // Deleting an invoice removes the whole IOU report and navigates back to the invoice room, which does not
        // synchronously unfocus this details RHP. Keep the page focused so suppression must come from the in-flight
        // delete-back URL rather than from `!isFocused`, reproducing the "Not here" flash from issue #97399.
        mockUseIsFocused.mockReturnValue(true);
        // NotFoundPage reads the current route; without a value it would crash instead of rendering, masking the assertion.
        mockUseRoute.mockReturnValue({key: 'not-found-test', name: 'not-found-test'} as ReturnType<typeof useRoute>);

        const invoiceReportID = '20';
        const invoiceReport: Report = {
            ...createRandomReport(Number(invoiceReportID)),
            type: CONST.REPORT.TYPE.INVOICE,
        };
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${invoiceReportID}`, invoiceReport);
            // Report data has finished loading, so once the report is deleted the guard resolves to the NotFound page
            // (not the loading indicator) — this is the state in which the "Not here" flash happens.
            await Onyx.set(ONYXKEYS.IS_LOADING_REPORT_DATA, false);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}${invoiceReportID}`, {isLoadingInitialReportActions: false});
        });

        const {rerender} = render(
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
        // The details page content renders first, so `contentShown` is set before the report is deleted.
        await screen.findByTestId('DynamicReportDetailsPage');

        // Start the delete-transaction navigation, then simulate the invoice report being removed from Onyx.
        await act(async () => {
            await Onyx.set(ONYXKEYS.NVP_DELETE_TRANSACTION_NAVIGATE_BACK_URL, `r/${invoiceReportID}`);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${invoiceReportID}`, null);
        });

        rerender(
            <OnyxListItemProvider>
                <LocaleContextProvider>
                    <DynamicReportDetailsPage
                        betas={[]}
                        isLoadingReportData={false}
                        navigation={navigationMock}
                        policy={undefined}
                        // The report prop is overridden by withReportOrNotFound, which reads the (now-deleted) report from Onyx.
                        report={invoiceReport}
                        reportMetadata={undefined}
                        reportLoadingState={undefined}
                        route={getRouteMock(invoiceReportID)}
                    />
                </LocaleContextProvider>
            </OnyxListItemProvider>,
        );
        await waitForBatchedUpdatesWithAct();

        // The deleted invoice report must not surface the NotFound ("Not here") page while navigating back to the room.
        expect(screen.queryByTestId('NotFoundPage')).toBeNull();
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
});
