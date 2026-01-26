import {act, renderHook} from '@testing-library/react-native';
import React from 'react';
import type {OnyxMultiSetInput} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import {CurrentReportIDContextProvider} from '@hooks/useCurrentReportID';
import {SidebarOrderedReportsContextProvider, useSidebarOrderedReports} from '@hooks/useSidebarOrderedReports';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

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
                [ONYXKEYS.NVP_PREFERRED_LOCALE]: CONST.LOCALES.DEFAULT,
                [ONYXKEYS.COLLECTION.REPORT]: {},
                [ONYXKEYS.COLLECTION.POLICY]: {},
                [ONYXKEYS.COLLECTION.TRANSACTION]: {},
                [ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS]: {},
                [ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS]: {},
                [ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT]: {},
                [ONYXKEYS.BETAS]: [],
                [ONYXKEYS.DERIVED.REPORT_ATTRIBUTES]: {reports: {}, locale: null},
                [ONYXKEYS.DERIVED.ORDERED_REPORTS_FOR_LHN]: {
                    reportsToDisplay: {},
                    orderedReportIDs: [],
                    currentReportID: undefined,
                    locale: null,
                },
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

    it('should return empty arrays when no reports are available', async () => {
        const {result} = renderHook(() => useSidebarOrderedReports(), {
            wrapper: TestWrapper,
        });

        await waitForBatchedUpdatesWithAct();

        expect(result.current.orderedReports).toEqual([]);
        expect(result.current.orderedReportIDs).toEqual([]);
    });

    it('should return ordered reports when they are available in the derived value', async () => {
        const reports = createMockReports({
            report1: {reportName: 'Chat 1'},
            report2: {reportName: 'Chat 2'},
        });

        await act(async () => {
            await Onyx.multiSet({
                [`${ONYXKEYS.COLLECTION.REPORT}1`]: reports['1'],
                [`${ONYXKEYS.COLLECTION.REPORT}2`]: reports['2'],
                [ONYXKEYS.DERIVED.ORDERED_REPORTS_FOR_LHN]: {
                    reportsToDisplay: {
                        [`${ONYXKEYS.COLLECTION.REPORT}1`]: reports['1'],
                        [`${ONYXKEYS.COLLECTION.REPORT}2`]: reports['2'],
                    },
                    orderedReportIDs: ['1', '2'],
                    currentReportID: '1',
                    locale: CONST.LOCALES.DEFAULT,
                },
            } as unknown as OnyxMultiSetInput);
        });

        await waitForBatchedUpdatesWithAct();

        const {result} = renderHook(() => useSidebarOrderedReports(), {
            wrapper: TestWrapper,
        });

        await waitForBatchedUpdatesWithAct();

        expect(result.current.orderedReportIDs).toEqual(['1', '2']);
        expect(result.current.orderedReports).toHaveLength(2);
        expect(result.current.orderedReports.at(0)?.reportID).toBe('1');
        expect(result.current.orderedReports.at(1)?.reportID).toBe('2');
    });

    it('should handle when reports content changes in the derived value', async () => {
        const initialReports = createMockReports({
            report1: {reportName: 'Chat 1'},
            report2: {reportName: 'Chat 2'},
        });

        await act(async () => {
            await Onyx.multiSet({
                [`${ONYXKEYS.COLLECTION.REPORT}1`]: initialReports['1'],
                [`${ONYXKEYS.COLLECTION.REPORT}2`]: initialReports['2'],
                [ONYXKEYS.DERIVED.ORDERED_REPORTS_FOR_LHN]: {
                    reportsToDisplay: {
                        [`${ONYXKEYS.COLLECTION.REPORT}1`]: initialReports['1'],
                        [`${ONYXKEYS.COLLECTION.REPORT}2`]: initialReports['2'],
                    },
                    orderedReportIDs: ['1', '2'],
                    currentReportID: '1',
                    locale: CONST.LOCALES.DEFAULT,
                },
            } as unknown as OnyxMultiSetInput);
        });

        await waitForBatchedUpdatesWithAct();

        const {result} = renderHook(() => useSidebarOrderedReports(), {
            wrapper: TestWrapper,
        });

        await waitForBatchedUpdatesWithAct();

        expect(result.current.orderedReportIDs).toEqual(['1', '2']);

        // Update reports - simulating what the derived value would do
        const updatedReports = createMockReports({
            report1: {reportName: 'Chat 1 Updated'},
            report2: {reportName: 'Chat 2'},
            report3: {reportName: 'Chat 3'},
        });

        await act(async () => {
            await Onyx.multiSet({
                [`${ONYXKEYS.COLLECTION.REPORT}1`]: updatedReports['1'],
                [`${ONYXKEYS.COLLECTION.REPORT}2`]: updatedReports['2'],
                [`${ONYXKEYS.COLLECTION.REPORT}3`]: updatedReports['3'],
                [ONYXKEYS.DERIVED.ORDERED_REPORTS_FOR_LHN]: {
                    reportsToDisplay: {
                        [`${ONYXKEYS.COLLECTION.REPORT}1`]: updatedReports['1'],
                        [`${ONYXKEYS.COLLECTION.REPORT}2`]: updatedReports['2'],
                        [`${ONYXKEYS.COLLECTION.REPORT}3`]: updatedReports['3'],
                    },
                    orderedReportIDs: ['1', '2', '3'],
                    currentReportID: '1',
                    locale: CONST.LOCALES.DEFAULT,
                },
            } as unknown as OnyxMultiSetInput);
        });

        await waitForBatchedUpdatesWithAct();

        expect(result.current.orderedReportIDs).toEqual(['1', '2', '3']);
        expect(result.current.orderedReports).toHaveLength(3);
        expect(result.current.orderedReports.at(0)?.reportName).toBe('Chat 1 Updated');
    });

    it('should handle empty reports correctly', async () => {
        const {result} = renderHook(() => useSidebarOrderedReports(), {
            wrapper: TestWrapper,
        });

        await waitForBatchedUpdatesWithAct();

        expect(result.current.orderedReports).toEqual([]);
        expect(result.current.orderedReportIDs).toEqual([]);

        // Update with empty derived value
        await act(async () => {
            await Onyx.set(ONYXKEYS.DERIVED.ORDERED_REPORTS_FOR_LHN, {
                reportsToDisplay: {},
                orderedReportIDs: [],
                currentReportID: undefined,
                locale: CONST.LOCALES.DEFAULT,
            });
        });

        await waitForBatchedUpdatesWithAct();

        expect(result.current.orderedReports).toEqual([]);
        expect(result.current.orderedReportIDs).toEqual([]);
    });

    it('should maintain stability when derived value has same content', async () => {
        const reports = createMockReports({
            report1: {reportName: 'Stable Chat'},
        });

        await act(async () => {
            await Onyx.multiSet({
                [`${ONYXKEYS.COLLECTION.REPORT}1`]: reports['1'],
                [ONYXKEYS.DERIVED.ORDERED_REPORTS_FOR_LHN]: {
                    reportsToDisplay: {
                        [`${ONYXKEYS.COLLECTION.REPORT}1`]: reports['1'],
                    },
                    orderedReportIDs: ['1'],
                    currentReportID: '1',
                    locale: CONST.LOCALES.DEFAULT,
                },
            } as unknown as OnyxMultiSetInput);
        });

        await waitForBatchedUpdatesWithAct();

        const {result, rerender} = renderHook(() => useSidebarOrderedReports(), {
            wrapper: TestWrapper,
        });

        await waitForBatchedUpdatesWithAct();

        const firstRenderIDs = result.current.orderedReportIDs;

        // Re-render without changing data
        rerender({});
        await waitForBatchedUpdatesWithAct();

        // Should maintain same reference
        expect(result.current.orderedReportIDs).toBe(firstRenderIDs);
    });

    it('should handle priority mode changes via the derived value', async () => {
        const reports = createMockReports({
            report1: {reportName: 'Chat A'},
            report2: {reportName: 'Chat B'},
        });

        await act(async () => {
            await Onyx.multiSet({
                [`${ONYXKEYS.COLLECTION.REPORT}1`]: reports['1'],
                [`${ONYXKEYS.COLLECTION.REPORT}2`]: reports['2'],
                [ONYXKEYS.DERIVED.ORDERED_REPORTS_FOR_LHN]: {
                    reportsToDisplay: {
                        [`${ONYXKEYS.COLLECTION.REPORT}1`]: reports['1'],
                        [`${ONYXKEYS.COLLECTION.REPORT}2`]: reports['2'],
                    },
                    orderedReportIDs: ['1', '2'],
                    currentReportID: '1',
                    locale: CONST.LOCALES.DEFAULT,
                },
            } as unknown as OnyxMultiSetInput);
        });

        await waitForBatchedUpdatesWithAct();

        const {result} = renderHook(() => useSidebarOrderedReports(), {
            wrapper: TestWrapper,
        });

        await waitForBatchedUpdatesWithAct();

        expect(result.current.orderedReportIDs).toEqual(['1', '2']);

        // Change priority mode - the derived value would recompute and potentially change the order
        await act(async () => {
            await Onyx.multiSet({
                [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.GSD,
                // Simulate the derived value recomputing with new priority mode
                [ONYXKEYS.DERIVED.ORDERED_REPORTS_FOR_LHN]: {
                    reportsToDisplay: {
                        [`${ONYXKEYS.COLLECTION.REPORT}2`]: reports['2'],
                        [`${ONYXKEYS.COLLECTION.REPORT}1`]: reports['1'],
                    },
                    orderedReportIDs: ['2', '1'], // Order changed due to priority mode
                    currentReportID: '1',
                    locale: CONST.LOCALES.DEFAULT,
                },
            } as unknown as OnyxMultiSetInput);
        });

        await waitForBatchedUpdatesWithAct();

        // The hook should reflect the new order from the derived value
        expect(result.current.orderedReportIDs).toEqual(['2', '1']);
    });

    it('should handle clearLHNCache correctly', async () => {
        const reports = createMockReports({
            report1: {reportName: 'Chat 1'},
        });

        await act(async () => {
            await Onyx.multiSet({
                [`${ONYXKEYS.COLLECTION.REPORT}1`]: reports['1'],
                [ONYXKEYS.DERIVED.ORDERED_REPORTS_FOR_LHN]: {
                    reportsToDisplay: {
                        [`${ONYXKEYS.COLLECTION.REPORT}1`]: reports['1'],
                    },
                    orderedReportIDs: ['1'],
                    currentReportID: '1',
                    locale: CONST.LOCALES.DEFAULT,
                },
            } as unknown as OnyxMultiSetInput);
        });

        await waitForBatchedUpdatesWithAct();

        const {result} = renderHook(() => useSidebarOrderedReports(), {
            wrapper: TestWrapper,
        });

        await waitForBatchedUpdatesWithAct();

        expect(result.current.orderedReportIDs).toEqual(['1']);

        // Clear the cache
        await act(async () => {
            result.current.clearLHNCache();
        });

        await waitForBatchedUpdatesWithAct();

        // The derived value should be cleared (set to null)
        // This will trigger a full recomputation
        expect(result.current.orderedReportIDs).toEqual([]);
    });
});
