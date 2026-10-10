import {act, render, screen} from '@testing-library/react-native';

import OnyxListItemProvider from '@components/OnyxListItemProvider';
import ReportOrNotFoundGuard from '@components/ReportOrNotFoundGuard';
import Text from '@components/Text';

import {openReport} from '@libs/actions/Report';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReportDetailsNavigatorParamList} from '@libs/Navigation/types';

import type {WithReportOrNotFoundProps} from '@pages/inbox/report/withReportOrNotFound';
import withReportOrNotFound from '@pages/inbox/report/withReportOrNotFound';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {Report} from '@src/types/onyx';

import {useIsFocused} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import {createRandomReport} from '../../utils/collections/reports';
import createMock from '../../utils/createMock';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

jest.mock('@libs/actions/Report', () => ({
    ...jest.requireActual<Record<string, unknown>>('@libs/actions/Report'),
    openReport: jest.fn(),
}));
jest.mock('@components/FullscreenLoadingIndicator', () => {
    const {View} = jest.requireActual<Record<string, React.FC<Record<string, unknown>>>>('react-native');
    return () => <View testID="loading" />;
});
jest.mock('@pages/ErrorPage/NotFoundPage', () => {
    const {View} = jest.requireActual<Record<string, React.FC<Record<string, unknown>>>>('react-native');
    return () => <View testID="notFound" />;
});
jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<Record<string, unknown>>('@react-navigation/native'),
    useIsFocused: jest.fn(() => true),
}));

const mockOpenReport = jest.mocked(openReport);
const mockUseIsFocused = jest.mocked(useIsFocused);

type ScreenProps = PlatformStackScreenProps<ReportDetailsNavigatorParamList, typeof SCREENS.REPORT_DETAILS.DYNAMIC_ROOT>;

const reportID = '100';
const report: Report = {...createRandomReport(Number(reportID), CONST.REPORT.CHAT_TYPE.GROUP), reportName: 'From Onyx', errorFields: undefined};
const callerReport: Report = {...report, reportName: 'From caller props'};

function Content() {
    return <Text testID="content">guarded</Text>;
}

function ForwardedReportName({report: forwardedReport}: WithReportOrNotFoundProps) {
    return <Text testID="content">{forwardedReport.reportName}</Text>;
}

const WrappedContent = withReportOrNotFound()(ForwardedReportName);

function renderWithHOC() {
    render(
        <OnyxListItemProvider>
            <WrappedContent
                navigation={createMock<ScreenProps['navigation']>({})}
                route={createMock<ScreenProps['route']>({params: {reportID}})}
                report={callerReport}
                policy={undefined}
                reportMetadata={undefined}
                reportLoadingState={undefined}
                isLoadingReportData={false}
            />
        </OnyxListItemProvider>,
    );
}

function renderWithGuard() {
    render(
        <OnyxListItemProvider>
            <ReportOrNotFoundGuard reportID={reportID}>
                <Content />
            </ReportOrNotFoundGuard>
        </OnyxListItemProvider>,
    );
}

async function seedFinishedLoading() {
    await act(async () => {
        await Onyx.merge(ONYXKEYS.IS_LOADING_REPORT_DATA, false);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}${reportID}`, {isLoadingInitialReportActions: false});
    });
}

async function seedReport() {
    await act(async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
    });
}

async function removeReport() {
    await act(async () => {
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, null);
    });
    await waitForBatchedUpdatesWithAct();
}

describe('withReportOrNotFound and ReportOrNotFoundGuard', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => {
        mockOpenReport.mockClear();
        mockUseIsFocused.mockReturnValue(true);
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
    });

    describe.each([
        ['withReportOrNotFound', renderWithHOC],
        ['ReportOrNotFoundGuard', renderWithGuard],
    ])('%s', (_, renderSubject) => {
        it('should render the loading indicator while the report is missing and report data is still loading', async () => {
            // Given no report in Onyx and no finished OpenReport call

            // When the screen renders
            renderSubject();
            await waitForBatchedUpdatesWithAct();

            // Then the loading indicator shows instead of the content
            expect(screen.getByTestId('loading')).toBeTruthy();
            expect(screen.queryByTestId('content')).toBeNull();
        });

        it('should render the not found page when loading finished without a report', async () => {
            // Given loading has finished and the report never arrived
            await seedFinishedLoading();

            // When the screen renders
            renderSubject();
            await waitForBatchedUpdatesWithAct();

            // Then the not found page shows
            expect(screen.getByTestId('notFound')).toBeTruthy();
            expect(screen.queryByTestId('content')).toBeNull();
        });

        it('should render the content once the report is in Onyx', async () => {
            // Given the report is loaded
            await seedFinishedLoading();
            await seedReport();

            // When the screen renders
            renderSubject();
            await waitForBatchedUpdatesWithAct();

            // Then the content shows
            expect(screen.getByTestId('content')).toBeTruthy();
        });

        it('should render nothing when a shown report disappears while the screen is unfocused', async () => {
            // Given the content was shown and the screen then lost focus, as when navigating away from a deleted report
            await seedFinishedLoading();
            await seedReport();
            renderSubject();
            await waitForBatchedUpdatesWithAct();
            expect(screen.getByTestId('content')).toBeTruthy();
            mockUseIsFocused.mockReturnValue(false);

            // When the report is removed
            await removeReport();

            // Then neither the not found page nor the loading indicator flashes during the transition
            expect(screen.queryByTestId('content')).toBeNull();
            expect(screen.queryByTestId('notFound')).toBeNull();
            expect(screen.queryByTestId('loading')).toBeNull();
        });

        it('should render the not found page when a shown report disappears while the screen stays focused', async () => {
            // Given the content was shown and the screen keeps focus with no delete navigation in flight
            await seedFinishedLoading();
            await seedReport();
            renderSubject();
            await waitForBatchedUpdatesWithAct();
            expect(screen.getByTestId('content')).toBeTruthy();

            // When the report is removed
            await removeReport();

            // Then the suppression does not apply and the not found page shows
            expect(screen.getByTestId('notFound')).toBeTruthy();
        });

        it('should render nothing when a shown report disappears while a delete-transaction navigation is in flight', async () => {
            // Given the content was shown and the screen keeps focus while a delete-transaction navigation is pending, as when deleting an invoice
            await seedFinishedLoading();
            await seedReport();
            renderSubject();
            await waitForBatchedUpdatesWithAct();
            expect(screen.getByTestId('content')).toBeTruthy();
            await act(async () => {
                await Onyx.set(ONYXKEYS.NVP_DELETE_TRANSACTION_NAVIGATE_BACK_URL, 'r/1');
            });

            // When the report is removed
            await removeReport();

            // Then the not found page does not flash before the navigation completes
            expect(screen.queryByTestId('content')).toBeNull();
            expect(screen.queryByTestId('notFound')).toBeNull();
            expect(screen.queryByTestId('loading')).toBeNull();
        });

        it('should call OpenReport when the report is missing and has not been fetched yet', async () => {
            // Given a deep link to a report that is not in Onyx and has no finished OpenReport call

            // When the screen renders
            renderSubject();
            await waitForBatchedUpdatesWithAct();

            // Then the report is requested from the server
            expect(mockOpenReport).toHaveBeenCalledWith(expect.objectContaining({reportID}));
        });

        it('should not call OpenReport when the report is already loaded', async () => {
            // Given the report is already in Onyx
            await seedReport();

            // When the screen renders
            renderSubject();
            await waitForBatchedUpdatesWithAct();

            // Then no request is made
            expect(mockOpenReport).not.toHaveBeenCalled();
        });
    });

    it('should forward the report read from Onyx rather than the one passed by the caller', async () => {
        // Given a report in Onyx that differs from the one the caller passes as a prop
        await seedFinishedLoading();
        await seedReport();

        // When the wrapped screen renders
        renderWithHOC();
        await waitForBatchedUpdatesWithAct();

        // Then the wrapper overrides the caller's report with its own Onyx read
        expect(screen.getByTestId('content')).toHaveTextContent('From Onyx');
        expect(screen.queryByText('From caller props')).toBeNull();
    });
});
