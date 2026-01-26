import {renderHook} from '@testing-library/react-native';
import useReportWasDeleted from '@src/pages/home/hooks/useReportWasDeleted';
import type {Report} from '@src/types/onyx';

describe('useReportWasDeleted', () => {
    const createReport = (reportID: string, parentReportID?: string): Report =>
        ({
            reportID,
            parentReportID,
        }) as Report;

    describe('initial state', () => {
        it('should return wasDeleted as false initially', () => {
            // Given no report loaded yet
            const {result} = renderHook(() => useReportWasDeleted('123', undefined, false, false));

            // Then wasDeleted is false because nothing was deleted
            expect(result.current.wasDeleted).toBe(false);
            expect(result.current.parentReportID).toBeUndefined();
        });

        it('should return wasDeleted as false when report is provided initially', () => {
            // Given a loaded report
            const report = createReport('123', 'parent456');
            const {result} = renderHook(() => useReportWasDeleted('123', report, false, false));

            // Then wasDeleted is false because report exists
            expect(result.current.wasDeleted).toBe(false);
        });
    });

    describe('tracking report accessibility', () => {
        it('should store parentReportID when report becomes accessible', () => {
            // Given no report initially
            const {result, rerender} = renderHook(({report}) => useReportWasDeleted('123', report, false, false), {
                initialProps: {report: undefined as Report | undefined},
            });
            expect(result.current.parentReportID).toBeUndefined();

            // When report loads
            rerender({report: createReport('123', 'parent456')});

            // Then parentReportID is stored for navigation after deletion
            expect(result.current.parentReportID).toBe('parent456');
        });

        it('should not mark as accessible if reportID does not match reportIDFromRoute', () => {
            // Given report with different ID than route
            const {result} = renderHook(() => useReportWasDeleted('123', createReport('different-id', 'parent456'), false, false));

            // Then parentReportID not stored - wrong report
            expect(result.current.parentReportID).toBeUndefined();
        });

        it('should update parentReportID when it changes while report is accessible', () => {
            // Given report with parentReportID
            const {result, rerender} = renderHook(({report}) => useReportWasDeleted('123', report, false, false), {
                initialProps: {report: createReport('123', 'parent-old')},
            });
            expect(result.current.parentReportID).toBe('parent-old');

            // When parentReportID changes
            rerender({report: createReport('123', 'parent-new')});

            // Then stored value updates
            expect(result.current.parentReportID).toBe('parent-new');
        });
    });

    describe('detecting deletion', () => {
        it('should set wasDeleted to true when report becomes undefined after being accessible', () => {
            // Given loaded report
            const {result, rerender} = renderHook(({report}) => useReportWasDeleted('123', report, false, false), {
                initialProps: {report: createReport('123', 'parent456') as Report | undefined},
            });
            expect(result.current.wasDeleted).toBe(false);

            // When report is deleted
            rerender({report: undefined});

            // Then wasDeleted triggers redirect
            expect(result.current.wasDeleted).toBe(true);
            expect(result.current.parentReportID).toBe('parent456');
        });

        it('should not set wasDeleted if report was never accessible', () => {
            // Given report never loaded
            const {result, rerender} = renderHook(({report}) => useReportWasDeleted('123', report, false, false), {
                initialProps: {report: undefined as Report | undefined},
            });

            // When report stays undefined
            rerender({report: undefined});

            // Then wasDeleted stays false - nothing to delete
            expect(result.current.wasDeleted).toBe(false);
        });

        it('should not set wasDeleted if isOptimisticDelete is true', () => {
            // Given loaded report
            const {result, rerender} = renderHook(({report, isOptimisticDelete}) => useReportWasDeleted('123', report, isOptimisticDelete, false), {
                initialProps: {report: createReport('123', 'parent456') as Report | undefined, isOptimisticDelete: false},
            });

            // When optimistically deleted (may revert)
            rerender({report: undefined, isOptimisticDelete: true});

            // Then wasDeleted stays false - delete not confirmed
            expect(result.current.wasDeleted).toBe(false);
        });

        it('should not set wasDeleted if userLeavingStatus is true', () => {
            // Given loaded report
            const {result, rerender} = renderHook(({report, userLeavingStatus}) => useReportWasDeleted('123', report, false, userLeavingStatus), {
                initialProps: {report: createReport('123', 'parent456') as Report | undefined, userLeavingStatus: false},
            });

            // When user is actively leaving
            rerender({report: undefined, userLeavingStatus: true});

            // Then wasDeleted stays false - intentional leave
            expect(result.current.wasDeleted).toBe(false);
        });

        it('should keep wasDeleted true once set (sticky state)', () => {
            // Given deleted report
            const {result, rerender} = renderHook(({report}) => useReportWasDeleted('123', report, false, false), {
                initialProps: {report: createReport('123', 'parent456') as Report | undefined},
            });
            rerender({report: undefined});
            expect(result.current.wasDeleted).toBe(true);

            // When multiple rerenders
            rerender({report: undefined});
            rerender({report: undefined});

            // Then stays true
            expect(result.current.wasDeleted).toBe(true);
        });
    });

    describe('resetting on route change', () => {
        it('should reset all state when reportIDFromRoute changes', () => {
            // Given deleted report
            const {result, rerender} = renderHook(({reportIDFromRoute, report}) => useReportWasDeleted(reportIDFromRoute, report, false, false), {
                initialProps: {reportIDFromRoute: '123', report: createReport('123', 'parent456') as Report | undefined},
            });
            rerender({reportIDFromRoute: '123', report: undefined});
            expect(result.current.wasDeleted).toBe(true);

            // When navigating to different report
            rerender({reportIDFromRoute: '456', report: undefined});

            // Then state resets - tracking new report
            expect(result.current.wasDeleted).toBe(false);
            expect(result.current.parentReportID).toBeUndefined();
        });

        it('should not falsely detect deletion when navigating to new report that is not yet loaded', () => {
            // Given loaded report
            const {result, rerender} = renderHook(({reportIDFromRoute, report}) => useReportWasDeleted(reportIDFromRoute, report, false, false), {
                initialProps: {reportIDFromRoute: '123', report: createReport('123', 'parent456') as Report | undefined},
            });

            // When navigating to unloaded report
            rerender({reportIDFromRoute: '456', report: undefined});

            // Then wasDeleted false - new report never existed
            expect(result.current.wasDeleted).toBe(false);
        });

        it('should correctly track new report after route change', () => {
            // Given report 123
            const {result, rerender} = renderHook(({reportIDFromRoute, report}) => useReportWasDeleted(reportIDFromRoute, report, false, false), {
                initialProps: {reportIDFromRoute: '123', report: createReport('123', 'parent-A') as Report | undefined},
            });
            expect(result.current.parentReportID).toBe('parent-A');

            // When navigating to report 456
            rerender({reportIDFromRoute: '456', report: createReport('456', 'parent-B')});
            expect(result.current.parentReportID).toBe('parent-B');
            expect(result.current.wasDeleted).toBe(false);

            // When new report deleted
            rerender({reportIDFromRoute: '456', report: undefined});

            // Then wasDeleted with correct parent
            expect(result.current.wasDeleted).toBe(true);
            expect(result.current.parentReportID).toBe('parent-B');
        });

        it('should handle immediate accessibility after route change', () => {
            // Given report 123
            const {result, rerender} = renderHook(({reportIDFromRoute, report}) => useReportWasDeleted(reportIDFromRoute, report, false, false), {
                initialProps: {reportIDFromRoute: '123', report: createReport('123', 'parent-A') as Report | undefined},
            });

            // When navigating to cached report 456
            rerender({reportIDFromRoute: '456', report: createReport('456', 'parent-B')});

            // Then tracks new report immediately
            expect(result.current.wasDeleted).toBe(false);
            expect(result.current.parentReportID).toBe('parent-B');
        });
    });

    describe('edge cases', () => {
        it('should handle report with undefined parentReportID', () => {
            // Given report without parent
            const {result, rerender} = renderHook(({report}) => useReportWasDeleted('123', report, false, false), {
                initialProps: {report: createReport('123', undefined) as Report | undefined},
            });
            expect(result.current.parentReportID).toBeUndefined();

            // When deleted
            rerender({report: undefined});

            // Then wasDeleted true, parentReportID stays undefined
            expect(result.current.wasDeleted).toBe(true);
            expect(result.current.parentReportID).toBeUndefined();
        });

        it('should handle undefined reportIDFromRoute', () => {
            // Given no route ID
            const {result} = renderHook(() => useReportWasDeleted(undefined, undefined, false, false));

            // Then safe defaults
            expect(result.current.wasDeleted).toBe(false);
            expect(result.current.parentReportID).toBeUndefined();
        });

        it('should reset wasDeleted when report becomes accessible again after deletion', () => {
            // Given deleted report
            const report = createReport('123', 'parent456');
            const {result, rerender} = renderHook(({report: r}) => useReportWasDeleted('123', r, false, false), {
                initialProps: {report: report as Report | undefined},
            });
            rerender({report: undefined});
            expect(result.current.wasDeleted).toBe(true);

            // When report comes back (undo/sync)
            rerender({report});

            // Then wasDeleted resets
            expect(result.current.wasDeleted).toBe(false);
        });

        it('should handle rapid route changes', () => {
            // Given report 1
            const {result, rerender} = renderHook(({reportIDFromRoute, report}) => useReportWasDeleted(reportIDFromRoute, report, false, false), {
                initialProps: {reportIDFromRoute: '1', report: createReport('1', 'parent-1') as Report | undefined},
            });

            // When rapid navigation
            rerender({reportIDFromRoute: '2', report: createReport('2', 'parent-2')});
            rerender({reportIDFromRoute: '3', report: createReport('3', 'parent-3')});

            // Then tracks latest report
            expect(result.current.wasDeleted).toBe(false);
            expect(result.current.parentReportID).toBe('parent-3');
        });

        it('should handle report deletion after multiple parent changes', () => {
            // Given report with changing parent
            const {result, rerender} = renderHook(({report}) => useReportWasDeleted('123', report, false, false), {
                initialProps: {report: createReport('123', 'parent-1') as Report | undefined},
            });
            rerender({report: createReport('123', 'parent-2')});
            rerender({report: createReport('123', 'parent-3')});
            expect(result.current.parentReportID).toBe('parent-3');

            // When deleted
            rerender({report: undefined});

            // Then uses last known parent
            expect(result.current.wasDeleted).toBe(true);
            expect(result.current.parentReportID).toBe('parent-3');
        });
    });

    describe('memoization', () => {
        it('should return same object reference when values do not change', () => {
            // Given stable state
            const {result, rerender} = renderHook(({report}) => useReportWasDeleted('123', report, false, false), {
                initialProps: {report: createReport('123', 'parent456')},
            });
            const firstResult = result.current;

            // When rerender with same values
            rerender({report: createReport('123', 'parent456')});

            // Then same reference - prevents unnecessary rerenders
            expect(result.current).toBe(firstResult);
        });

        it('should return new object reference when wasDeleted changes', () => {
            // Given loaded report
            const {result, rerender} = renderHook(({report}) => useReportWasDeleted('123', report, false, false), {
                initialProps: {report: createReport('123', 'parent456') as Report | undefined},
            });
            const firstResult = result.current;

            // When deleted
            rerender({report: undefined});

            // Then new reference - triggers consumer update
            expect(result.current).not.toBe(firstResult);
            expect(result.current.wasDeleted).toBe(true);
        });
    });
});
