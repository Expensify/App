/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
import {renderHook} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import {CurrentReportIDContextProvider} from '@hooks/useCurrentReportID';
import {SidebarOrderedReportsContextProvider, useSidebarOrderedReports} from '@hooks/useSidebarOrderedReports';
import SidebarUtils from '@libs/SidebarUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

// Mock dependencies
jest.mock('@libs/SidebarUtils', () => ({
    sortReportsToDisplayInLHN: jest.fn(),
    getReportsToDisplayInLHN: jest.fn(),
    updateReportsToDisplayInLHN: jest.fn(),
}));
jest.mock('@libs/Navigation/Navigation', () => ({
    getTopmostReportId: jest.fn(),
}));
jest.mock('@libs/ReportUtils', () => ({
    parseReportRouteParams: jest.fn(() => ({reportID: undefined})),
    getReportIDFromLink: jest.fn(() => ''),
}));

const mockSidebarUtils = SidebarUtils as any;

describe('useSidebarOrderedReports', () => {
    beforeAll(async () => {
        Onyx.init({keys: ONYXKEYS});
        // Set up basic session data
        await Onyx.set(ONYXKEYS.SESSION, {
            accountID: 12345,
            email: 'test@example.com',
            authTokenType: CONST.AUTH_TOKEN_TYPES.ANONYMOUS,
        });
        return waitForBatchedUpdates();
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        Onyx.clear();

        // Set up basic session data for each test
        await Onyx.set(ONYXKEYS.SESSION, {
            accountID: 12345,
            email: 'test@example.com',
            authTokenType: CONST.AUTH_TOKEN_TYPES.ANONYMOUS,
        });

        // Set up required Onyx data that the hook depends on
        await Onyx.multiSet({
            [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.DEFAULT,
            [ONYXKEYS.COLLECTION.REPORT]: {},
            [ONYXKEYS.COLLECTION.POLICY]: {},
            [ONYXKEYS.COLLECTION.TRANSACTION]: {},
            [ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS]: {},
            [ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS]: {},
            [ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT]: {},
            [ONYXKEYS.BETAS]: [],
            [ONYXKEYS.DERIVED.REPORT_ATTRIBUTES]: {reports: {}},
        } as any);

        // Default mock implementations
        mockSidebarUtils.getReportsToDisplayInLHN.mockReturnValue({});
        mockSidebarUtils.updateReportsToDisplayInLHN.mockReturnValue({});
        mockSidebarUtils.sortReportsToDisplayInLHN.mockReturnValue([]);

        return waitForBatchedUpdates();
    });

    afterAll(async () => {
        Onyx.clear();
        await waitForBatchedUpdates();
    });

    const createMockReports = (reports: Record<string, Partial<Report>>) => {
        const mockReports: Record<string, Report> = {};
        Object.entries(reports).forEach(([key, report]) => {
            const reportId = key.replace('report', '');
            mockReports[reportId] = {
                reportID: reportId,
                reportName: `Report ${reportId}`,
                lastVisibleActionCreated: '2024-01-01 10:00:00',
                type: CONST.REPORT.TYPE.CHAT,
                ...report,
            } as Report;
        });
        return mockReports;
    };

    function TestWrapper({children}: {children: React.ReactNode}) {
        return (
            <OnyxListItemProvider>
                <CurrentReportIDContextProvider>
                    <SidebarOrderedReportsContextProvider>{children}</SidebarOrderedReportsContextProvider>
                </CurrentReportIDContextProvider>
            </OnyxListItemProvider>
        );
    }

    it('should prevent unnecessary re-renders when reports have same content but different references', () => {
        // Given reports with same content but different object references
        const reportsContent = {
            report1: {reportName: 'Chat 1', lastVisibleActionCreated: '2024-01-01 10:00:00'},
            report2: {reportName: 'Chat 2', lastVisibleActionCreated: '2024-01-01 11:00:00'},
        };

        // When the initial reports are set
        const initialReports = createMockReports(reportsContent);
        mockSidebarUtils.getReportsToDisplayInLHN.mockReturnValue(initialReports);

        // When the hook is rendered
        const {rerender} = renderHook(() => useSidebarOrderedReports(), {
            wrapper: TestWrapper,
        });

        // Then the mock calls are cleared
        mockSidebarUtils.sortReportsToDisplayInLHN.mockClear();

        // When the reports are updated
        const newReportsWithSameContent = createMockReports(reportsContent);
        mockSidebarUtils.getReportsToDisplayInLHN.mockReturnValue(newReportsWithSameContent);

        rerender({});

        // Then sortReportsToDisplayInLHN should not be called again since deep comparison shows no change
        expect(mockSidebarUtils.sortReportsToDisplayInLHN).not.toHaveBeenCalled();
    });

    it('should trigger re-render when reports content actually changes', async () => {
        // Given the initial reports are set
        const initialReports = createMockReports({
            report1: {reportName: 'Chat 1'},
            report2: {reportName: 'Chat 2'},
        });

        // When the reports are updated
        const updatedReports = createMockReports({
            report1: {reportName: 'Chat 1 Updated'}, // Content changed
            report2: {reportName: 'Chat 2'},
            report3: {reportName: 'Chat 3'}, // New report added
        });

        // Then the initial reports are set
        await Onyx.multiSet({
            [`${ONYXKEYS.COLLECTION.REPORT}1`]: initialReports['1'],
            [`${ONYXKEYS.COLLECTION.REPORT}2`]: initialReports['2'],
        } as any);

        // When the mock is updated
        mockSidebarUtils.getReportsToDisplayInLHN.mockReturnValue(initialReports);

        // When the hook is rendered
        const {rerender} = renderHook(() => useSidebarOrderedReports(), {
            wrapper: TestWrapper,
        });

        await waitForBatchedUpdates();

        // Then the mock calls are cleared
        mockSidebarUtils.sortReportsToDisplayInLHN.mockClear();

        // When the mock is updated
        mockSidebarUtils.getReportsToDisplayInLHN.mockReturnValue(updatedReports);

        // When the priority mode is changed
        await Onyx.set(ONYXKEYS.NVP_PRIORITY_MODE, CONST.PRIORITY_MODE.GSD);

        rerender({});

        await waitForBatchedUpdates();

        // Then sortReportsToDisplayInLHN should be called with the updated reports
        expect(mockSidebarUtils.sortReportsToDisplayInLHN).toHaveBeenCalledWith(
            updatedReports,
            expect.any(String), // priorityMode
            expect.any(Function), // localeCompare
            expect.any(Object), // reportNameValuePairs
            expect.any(Object), // reportAttributes
        );
    });

    it('should optimize performance by avoiding unnecessary sorting when only report order changes', () => {
        // Given the initial reports are set
        const reports = createMockReports({
            report1: {reportName: 'Chat A'},
            report2: {reportName: 'Chat B'},
            report3: {reportName: 'Chat C'},
        });

        // When the initial reports are set
        mockSidebarUtils.getReportsToDisplayInLHN.mockReturnValue(reports);
        mockSidebarUtils.sortReportsToDisplayInLHN.mockReturnValue(['1', '2', '3']);

        // When the hook is rendered
        const {rerender} = renderHook(() => useSidebarOrderedReports(), {
            wrapper: TestWrapper,
        });

        // Then the mock calls are cleared
        expect(mockSidebarUtils.sortReportsToDisplayInLHN).toHaveBeenCalledTimes(1);

        // When the mock is updated
        mockSidebarUtils.sortReportsToDisplayInLHN.mockClear();

        // When the mock is updated
        mockSidebarUtils.getReportsToDisplayInLHN.mockReturnValue(reports);

        rerender({});

        // Then sorting should not be called again since deep comparison shows no change
        expect(mockSidebarUtils.sortReportsToDisplayInLHN).not.toHaveBeenCalled();
    });

    it('should handle empty reports correctly with deep comparison', async () => {
        // Given the initial reports are set
        mockSidebarUtils.getReportsToDisplayInLHN.mockReturnValue({});

        // When the hook is rendered
        const {rerender} = renderHook(() => useSidebarOrderedReports(), {
            wrapper: TestWrapper,
        });

        await waitForBatchedUpdates();

        // Then the mock calls are cleared
        mockSidebarUtils.sortReportsToDisplayInLHN.mockClear();

        // When the mock is updated
        mockSidebarUtils.getReportsToDisplayInLHN.mockReturnValue({});

        // When the priority mode is changed
        await Onyx.set(ONYXKEYS.NVP_PRIORITY_MODE, CONST.PRIORITY_MODE.GSD);

        rerender({});

        await waitForBatchedUpdates();

        // Then sortReportsToDisplayInLHN should be called when priority mode changes, even with same content
        expect(mockSidebarUtils.sortReportsToDisplayInLHN).toHaveBeenCalledWith({}, expect.any(String), expect.any(Function), expect.any(Object), expect.any(Object));
    });

    it('should maintain referential stability across multiple renders with same content', () => {
        // Given the initial reports are set
        const reportsContent = {
            report1: {reportName: 'Stable Chat'},
        };

        // When the initial reports are set
        const initialReports = createMockReports(reportsContent);
        mockSidebarUtils.getReportsToDisplayInLHN.mockReturnValue(initialReports);

        const {rerender} = renderHook(() => useSidebarOrderedReports(), {
            wrapper: TestWrapper,
        });

        // When the mock is updated
        const newReportsWithSameContent = createMockReports(reportsContent);
        mockSidebarUtils.getReportsToDisplayInLHN.mockReturnValue(newReportsWithSameContent);

        rerender({});

        // When the mock is updated
        const thirdReportsWithSameContent = createMockReports(reportsContent);
        mockSidebarUtils.getReportsToDisplayInLHN.mockReturnValue(thirdReportsWithSameContent);

        rerender({});

        // Then sortReportsToDisplayInLHN should be called only once (initial render)
        expect(mockSidebarUtils.sortReportsToDisplayInLHN).toHaveBeenCalledTimes(1);
    });

    it('should handle priority mode changes correctly with deep comparison', async () => {
        // Given the initial reports are set
        const reports = createMockReports({
            report1: {reportName: 'Chat A'},
            report2: {reportName: 'Chat B'},
        });

        mockSidebarUtils.getReportsToDisplayInLHN.mockReturnValue(reports);

        // When the hook is rendered
        const {rerender} = renderHook(() => useSidebarOrderedReports(), {
            wrapper: TestWrapper,
        });

        await waitForBatchedUpdates();

        // Then the mock calls are cleared
        mockSidebarUtils.sortReportsToDisplayInLHN.mockClear();

        // When the priority mode is changed
        await Onyx.set(ONYXKEYS.NVP_PRIORITY_MODE, CONST.PRIORITY_MODE.GSD);

        rerender({});

        await waitForBatchedUpdates();

        // Then sortReportsToDisplayInLHN should be called when priority mode changes
        expect(mockSidebarUtils.sortReportsToDisplayInLHN).toHaveBeenCalled();
    });
});
