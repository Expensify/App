import {act, renderHook} from '@testing-library/react-native';

import OnyxListItemProvider from '@components/OnyxListItemProvider';

import {CurrentReportIDContextProvider} from '@hooks/useCurrentReportID';
import {SidebarOrderedReportsContextProvider, useSidebarOrderedReports} from '@hooks/useSidebarOrderedReports';

import SidebarUtils from '@libs/SidebarUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

import type {OnyxMultiSetInput} from 'react-native-onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

// Mock dependencies
jest.mock('@libs/SidebarUtils', () => ({
    sortReportsToDisplayInLHN: jest.fn(),
    getReportsToDisplayInLHN: jest.fn(),
    updateReportsToDisplayInLHN: jest.fn(),
    filterReportsForInboxTab: jest.fn((reportIDs: string[]) => reportIDs),
    getInboxTabCounts: jest.fn(() => ({})),
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

const mockSidebarUtils = jest.mocked(SidebarUtils);

describe('useSidebarOrderedReports', () => {
    beforeAll(async () => {
        Onyx.init({keys: ONYXKEYS});
        // Set up basic session data
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
        await act(async () => {
            await Onyx.clear();

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
                [ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS]: {},
                [ONYXKEYS.BETAS]: [],
                [ONYXKEYS.DERIVED.REPORT_ATTRIBUTES]: {reports: {}},
                [ONYXKEYS.DERIVED.GUIDE_ACCOUNT_IDS]: [],
            } satisfies OnyxMultiSetInput);
        });

        await waitForBatchedUpdatesWithAct();

        // Default mock implementations
        mockSidebarUtils.getReportsToDisplayInLHN.mockImplementation(() => ({}));
        mockSidebarUtils.updateReportsToDisplayInLHN.mockImplementation(({displayedReports}) => displayedReports);
        mockSidebarUtils.sortReportsToDisplayInLHN.mockReturnValue([]);

        await waitForBatchedUpdatesWithAct();
    });

    afterAll(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        await waitForBatchedUpdatesWithAct();
    });

    const createMockReports = (reports: Record<string, Partial<Report>>) => {
        const mockReports: Record<string, Report> = {};
        for (const [key, report] of Object.entries(reports)) {
            const reportId = key.replace('report', '');
            mockReports[reportId] = {
                reportID: reportId,
                reportName: `Report ${reportId}`,
                lastVisibleActionCreated: '2024-01-01 10:00:00',
                type: CONST.REPORT.TYPE.CHAT,
                ...report,
            } as Report;
        }
        return mockReports;
    };

    let currentReportIDForTestsValue: string | undefined;

    function TestWrapper({children}: {children: React.ReactNode}) {
        return (
            <OnyxListItemProvider>
                <CurrentReportIDContextProvider>
                    <SidebarOrderedReportsContextProvider currentReportIDForTests={currentReportIDForTestsValue}>{children}</SidebarOrderedReportsContextProvider>
                </CurrentReportIDContextProvider>
            </OnyxListItemProvider>
        );
    }

    it('should prevent unnecessary re-renders when reports have same content but different references', async () => {
        // Given reports with same content but different object references
        const reportsContent = {
            report1: {
                reportName: 'Chat 1',
                lastVisibleActionCreated: '2024-01-01 10:00:00',
            },
            report2: {
                reportName: 'Chat 2',
                lastVisibleActionCreated: '2024-01-01 11:00:00',
            },
        };

        // When the initial reports are set
        const initialReports = createMockReports(reportsContent);
        mockSidebarUtils.getReportsToDisplayInLHN.mockReturnValue(initialReports);
        mockSidebarUtils.updateReportsToDisplayInLHN.mockImplementation(({displayedReports}) => displayedReports);
        currentReportIDForTestsValue = '1';

        // When the hook is rendered
        const {rerender} = renderHook(() => useSidebarOrderedReports(), {
            wrapper: TestWrapper,
        });

        await waitForBatchedUpdatesWithAct();

        const fullScanCall = mockSidebarUtils.getReportsToDisplayInLHN.mock.calls.at(0);
        if (!fullScanCall) {
            throw new Error('SidebarUtils.getReportsToDisplayInLHN was not called');
        }
        const [{transactionViolations, draftComments}] = fullScanCall;
        expect(Object.keys(transactionViolations ?? {})).toHaveLength(0);
        expect(Object.keys(draftComments ?? {})).toHaveLength(0);

        // Then the mock calls are cleared
        mockSidebarUtils.sortReportsToDisplayInLHN.mockClear();

        // When the reports are updated
        const newReportsWithSameContent = createMockReports(reportsContent);
        mockSidebarUtils.getReportsToDisplayInLHN.mockReturnValue(newReportsWithSameContent);

        rerender({});

        await waitForBatchedUpdatesWithAct();

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
        await act(async () => {
            await Onyx.multiSet({
                [`${ONYXKEYS.COLLECTION.REPORT}1` as const]: initialReports['1'],
                [`${ONYXKEYS.COLLECTION.REPORT}2` as const]: initialReports['2'],
            } satisfies OnyxMultiSetInput);
        });

        await waitForBatchedUpdatesWithAct();

        // When the mock is updated
        mockSidebarUtils.getReportsToDisplayInLHN.mockReturnValue(initialReports);

        // When the hook is rendered
        const {rerender} = renderHook(() => useSidebarOrderedReports(), {
            wrapper: TestWrapper,
        });

        await waitForBatchedUpdatesWithAct();

        // Then the mock calls are cleared
        mockSidebarUtils.sortReportsToDisplayInLHN.mockClear();

        // When the mocks are updated to reflect the new content
        // getReportsToDisplayInLHN covers the full-scan path; updateReportsToDisplayInLHN covers
        // the incremental path (taken when priority mode changes and the cache is already populated).
        mockSidebarUtils.getReportsToDisplayInLHN.mockReturnValue(updatedReports);
        mockSidebarUtils.updateReportsToDisplayInLHN.mockReturnValue(updatedReports);

        // When the priority mode is changed
        await act(async () => {
            await Onyx.set(ONYXKEYS.NVP_PRIORITY_MODE, CONST.PRIORITY_MODE.GSD);
        });

        rerender({});

        await waitForBatchedUpdatesWithAct();

        // Then sortReportsToDisplayInLHN should be called with the updated reports
        expect(mockSidebarUtils.sortReportsToDisplayInLHN).toHaveBeenCalledWith(
            updatedReports,
            expect.any(String), // priorityMode
            expect.any(Function), // localeCompare
            expect.any(Object), // reportsDrafts
            expect.any(Object), // reportNameValuePairs
            expect.anything(), // reportAttributes
        );
    });

    it('should handle empty reports correctly with deep comparison', async () => {
        // Given the initial reports are set
        mockSidebarUtils.getReportsToDisplayInLHN.mockReturnValue({});

        // When the hook is rendered
        const {rerender} = renderHook(() => useSidebarOrderedReports(), {
            wrapper: TestWrapper,
        });

        await waitForBatchedUpdatesWithAct();

        // Then the mock calls are cleared
        mockSidebarUtils.sortReportsToDisplayInLHN.mockClear();

        // When the mock is updated
        mockSidebarUtils.getReportsToDisplayInLHN.mockReturnValue({});

        rerender({});

        await waitForBatchedUpdatesWithAct();

        // Then sortReportsToDisplayInLHN should not be called again since reports are empty
        expect(mockSidebarUtils.sortReportsToDisplayInLHN).not.toHaveBeenCalled();
    });

    it('should maintain referential stability across multiple renders with same content', async () => {
        // Given the initial reports are set
        const reportsContent = {
            report1: {reportName: 'Stable Chat'},
        };

        // When the initial reports are set
        const initialReports = createMockReports(reportsContent);
        mockSidebarUtils.getReportsToDisplayInLHN.mockReturnValue(initialReports);
        mockSidebarUtils.sortReportsToDisplayInLHN.mockReturnValue(['1']);
        currentReportIDForTestsValue = '1';

        const {rerender} = renderHook(() => useSidebarOrderedReports(), {
            wrapper: TestWrapper,
        });

        await waitForBatchedUpdatesWithAct();

        // When the mock is updated
        const newReportsWithSameContent = createMockReports(reportsContent);
        mockSidebarUtils.getReportsToDisplayInLHN.mockReturnValue(newReportsWithSameContent);

        rerender({});
        await waitForBatchedUpdatesWithAct();
        currentReportIDForTestsValue = '2';

        // When the mock is updated
        const thirdReportsWithSameContent = createMockReports(reportsContent);
        mockSidebarUtils.getReportsToDisplayInLHN.mockReturnValue(thirdReportsWithSameContent);

        rerender({});
        await waitForBatchedUpdatesWithAct();
        currentReportIDForTestsValue = '3';

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
        currentReportIDForTestsValue = '1';

        // When the hook is rendered
        const {rerender} = renderHook(() => useSidebarOrderedReports(), {
            wrapper: TestWrapper,
        });

        await waitForBatchedUpdatesWithAct();

        // Then the mock calls are cleared
        mockSidebarUtils.sortReportsToDisplayInLHN.mockClear();
        currentReportIDForTestsValue = '2';

        // When the priority mode is changed
        await act(async () => {
            await Onyx.set(ONYXKEYS.NVP_PRIORITY_MODE, CONST.PRIORITY_MODE.GSD);
        });

        await waitForBatchedUpdatesWithAct();

        rerender({});

        await waitForBatchedUpdatesWithAct();

        // Then sortReportsToDisplayInLHN should be called when priority mode changes
        expect(mockSidebarUtils.sortReportsToDisplayInLHN).toHaveBeenCalled();
    });

    it('should recompute all reports when guide accountIDs hydrate and guide emails become available', async () => {
        const guideAccountID = '8';
        const displayedReports = createMockReports({
            report1: {reportName: 'Chat A'},
        });
        const domainRoomReport = {
            reportID: '2',
            reportName: 'Domain Room',
            lastVisibleActionCreated: '2024-01-01 10:00:00',
            type: CONST.REPORT.TYPE.CHAT,
            chatType: CONST.REPORT.CHAT_TYPE.DOMAIN_ALL,
            participants: {
                [guideAccountID]: {
                    notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                },
            },
        } as Report;

        mockSidebarUtils.getReportsToDisplayInLHN.mockReturnValue(displayedReports);
        mockSidebarUtils.updateReportsToDisplayInLHN.mockImplementation(({displayedReports: reports}) => reports);

        await act(async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}1`, displayedReports['1']);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}2`, domainRoomReport);
            await Onyx.set(ONYXKEYS.DERIVED.GUIDE_ACCOUNT_IDS, []);
        });

        renderHook(() => useSidebarOrderedReports(), {
            wrapper: TestWrapper,
        });

        await waitForBatchedUpdatesWithAct();

        mockSidebarUtils.updateReportsToDisplayInLHN.mockClear();

        // The guide's personal details arriving is what turns the derived value from empty into a populated list.
        // Deriving that list from the personal details is covered by tests/unit/OnyxDerived/guideAccountIDsTest.ts.
        await act(async () => {
            await Onyx.set(ONYXKEYS.DERIVED.GUIDE_ACCOUNT_IDS, [Number(guideAccountID)]);
        });

        await waitForBatchedUpdatesWithAct();

        expect(mockSidebarUtils.updateReportsToDisplayInLHN).toHaveBeenCalledWith(
            expect.objectContaining({
                updatedReportsKeys: expect.arrayContaining([`${ONYXKEYS.COLLECTION.REPORT}1`, `${ONYXKEYS.COLLECTION.REPORT}2`]),
            }),
        );
    });

    it('should not recompute all reports when the guide accountIDs are recomputed to the same set', async () => {
        const participantAccountID = '8';
        const displayedReports = createMockReports({
            report1: {reportName: 'Chat A'},
        });

        mockSidebarUtils.getReportsToDisplayInLHN.mockReturnValue(displayedReports);
        mockSidebarUtils.updateReportsToDisplayInLHN.mockImplementation(({displayedReports: reports}) => reports);

        await act(async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}1`, {
                ...displayedReports['1'],
                participants: {
                    [participantAccountID]: {
                        notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                    },
                },
            });
            await Onyx.set(ONYXKEYS.DERIVED.GUIDE_ACCOUNT_IDS, [Number(participantAccountID)]);
        });

        renderHook(() => useSidebarOrderedReports(), {
            wrapper: TestWrapper,
        });

        await waitForBatchedUpdatesWithAct();

        mockSidebarUtils.updateReportsToDisplayInLHN.mockClear();

        // An unrelated personal-details change (a new avatar, a display name edit) recomputes the derived value to a
        // fresh but shallow-equal array. That must not look like guide hydration and force a full LHN re-scan.
        await act(async () => {
            await Onyx.set(ONYXKEYS.DERIVED.GUIDE_ACCOUNT_IDS, [Number(participantAccountID)]);
        });

        await waitForBatchedUpdatesWithAct();

        const updateCalls = mockSidebarUtils.updateReportsToDisplayInLHN.mock.calls;
        const fullRecomputeCall = updateCalls.find((call) => {
            const updatedReportsKeys = call[0]?.updatedReportsKeys ?? [];
            return updatedReportsKeys.length > 1;
        });

        expect(fullRecomputeCall).toBeUndefined();
    });
});
