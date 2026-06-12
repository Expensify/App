import {act, renderHook} from '@testing-library/react-native';
import React from 'react';
import type {OnyxMultiSetInput} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import {CurrentReportIDContextProvider} from '@hooks/useCurrentReportID';
import {SidebarOrderedReportsContextProvider, useSidebarOrderedReports} from '@hooks/useSidebarOrderedReports';
import SidebarUtils from '@libs/SidebarUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@libs/SidebarUtils', () => ({
    sortReportsToDisplayInLHN: jest.fn(() => []),
    getReportsToDisplayInLHN: jest.fn(() => ({})),
    updateReportsToDisplayInLHN: jest.fn(({displayedReports}: {displayedReports: unknown}) => displayedReports),
}));
jest.mock('@libs/Navigation/Navigation', () => ({
    getActiveRouteWithoutParams: jest.fn(() => ''),
    isNavigationReady: jest.fn(() => Promise.resolve()),
    getTopmostReportId: jest.fn(),
}));
jest.mock('@libs/ReportUtils', () => ({
    parseReportRouteParams: jest.fn(() => ({reportID: undefined})),
    getReportIDFromLink: jest.fn(() => ''),
}));

const mockSidebarUtils = SidebarUtils as jest.Mocked<typeof SidebarUtils>;

function makeReport(id: string, overrides: Partial<Report> = {}): Report {
    return {
        reportID: id,
        reportName: `Report ${id}`,
        lastVisibleActionCreated: '2024-01-01 10:00:00',
        type: CONST.REPORT.TYPE.CHAT,
        ...overrides,
    } as Report;
}

describe('useSidebarOrderedReports', () => {
    beforeAll(async () => {
        Onyx.init({keys: ONYXKEYS});
        await act(async () => {
            await Onyx.set(ONYXKEYS.SESSION, {
                accountID: 12345,
                email: 'test@example.com',
                authTokenType: CONST.AUTH_TOKEN_TYPES.ANONYMOUS,
            });
        });
        return waitForBatchedUpdatesWithAct();
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        mockSidebarUtils.sortReportsToDisplayInLHN.mockReturnValue([]);
        mockSidebarUtils.getReportsToDisplayInLHN.mockReturnValue({});
        mockSidebarUtils.updateReportsToDisplayInLHN.mockImplementation(({displayedReports}) => displayedReports);

        await act(async () => {
            await Onyx.clear();
            await Onyx.multiSet({
                [ONYXKEYS.SESSION]: {accountID: 12345, email: 'test@example.com', authTokenType: CONST.AUTH_TOKEN_TYPES.ANONYMOUS},
                [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.DEFAULT,
                [ONYXKEYS.COLLECTION.REPORT]: {},
                [ONYXKEYS.COLLECTION.POLICY]: {},
                [ONYXKEYS.COLLECTION.TRANSACTION]: {},
                [ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS]: {},
                [ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS]: {},
                [ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT]: {},
                [ONYXKEYS.BETAS]: [],
                [ONYXKEYS.DERIVED.REPORT_ATTRIBUTES]: {reports: {}},
                [ONYXKEYS.DERIVED.RAM_ONLY_SIDEBAR_ORDERED_REPORTS]: {reportsToDisplay: {}, orderedReportIDs: []},
            } as unknown as OnyxMultiSetInput);
        });
        await waitForBatchedUpdatesWithAct();
    });

    afterAll(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        await waitForBatchedUpdatesWithAct();
    });

    let currentReportIDForTest: string | undefined;

    function TestWrapper({children}: {children: React.ReactNode}) {
        return (
            <OnyxListItemProvider>
                <CurrentReportIDContextProvider>
                    <SidebarOrderedReportsContextProvider currentReportIDForTests={currentReportIDForTest}>{children}</SidebarOrderedReportsContextProvider>
                </CurrentReportIDContextProvider>
            </OnyxListItemProvider>
        );
    }

    it('surfaces orderedReportIDs from the derived Onyx value', async () => {
        currentReportIDForTest = '1';
        const report1 = makeReport('1');
        const report2 = makeReport('2');
        await act(async () => {
            await Onyx.multiSet({
                [`${ONYXKEYS.COLLECTION.REPORT}1`]: report1,
                [`${ONYXKEYS.COLLECTION.REPORT}2`]: report2,
                [ONYXKEYS.DERIVED.RAM_ONLY_SIDEBAR_ORDERED_REPORTS]: {
                    reportsToDisplay: {[`${ONYXKEYS.COLLECTION.REPORT}1`]: report1, [`${ONYXKEYS.COLLECTION.REPORT}2`]: report2},
                    orderedReportIDs: ['2', '1'],
                },
            } as unknown as OnyxMultiSetInput);
        });
        await waitForBatchedUpdatesWithAct();

        const {result} = renderHook(() => useSidebarOrderedReports(), {wrapper: TestWrapper});
        await waitForBatchedUpdatesWithAct();

        expect(result.current.orderedReportIDs).toEqual(['2', '1']);
        expect(result.current.currentReportID).toBe('1');
    });

    it('does not call SidebarUtils when the current report is already in the derived list', async () => {
        currentReportIDForTest = '1';
        const report1 = makeReport('1');
        await act(async () => {
            await Onyx.multiSet({
                [`${ONYXKEYS.COLLECTION.REPORT}1`]: report1,
                [ONYXKEYS.DERIVED.RAM_ONLY_SIDEBAR_ORDERED_REPORTS]: {
                    reportsToDisplay: {[`${ONYXKEYS.COLLECTION.REPORT}1`]: report1},
                    orderedReportIDs: ['1'],
                },
            } as unknown as OnyxMultiSetInput);
        });
        await waitForBatchedUpdatesWithAct();

        renderHook(() => useSidebarOrderedReports(), {wrapper: TestWrapper});
        await waitForBatchedUpdatesWithAct();

        expect(mockSidebarUtils.updateReportsToDisplayInLHN).not.toHaveBeenCalled();
        expect(mockSidebarUtils.sortReportsToDisplayInLHN).not.toHaveBeenCalled();
    });

    it('injects the current report via updateReportsToDisplayInLHN when missing from the derived list', async () => {
        currentReportIDForTest = '2';
        await act(async () => {
            await Onyx.multiSet({
                [ONYXKEYS.DERIVED.RAM_ONLY_SIDEBAR_ORDERED_REPORTS]: {reportsToDisplay: {}, orderedReportIDs: []},
            } as unknown as OnyxMultiSetInput);
        });
        await waitForBatchedUpdatesWithAct();

        mockSidebarUtils.sortReportsToDisplayInLHN.mockReturnValue(['2']);

        const {result} = renderHook(() => useSidebarOrderedReports(), {wrapper: TestWrapper});
        await waitForBatchedUpdatesWithAct();

        expect(mockSidebarUtils.updateReportsToDisplayInLHN).toHaveBeenCalledWith(
            expect.objectContaining({
                currentReportId: '2',
                updatedReportsKeys: [`${ONYXKEYS.COLLECTION.REPORT}2`],
            }),
        );
        expect(mockSidebarUtils.sortReportsToDisplayInLHN).toHaveBeenCalled();
        expect(result.current.orderedReportIDs).toEqual(['2']);
    });
});
