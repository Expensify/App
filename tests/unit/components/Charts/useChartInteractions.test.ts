import {renderHook} from '@testing-library/react-native';
import {useSharedValue} from 'react-native-reanimated';
import {findClosestPoint, useChartInteractions} from '@components/Charts/hooks/useChartInteractions';

/**
 * findClosestPoint — binary search for the nearest canvas-x index
 */
describe('findClosestPoint', () => {
    describe('empty and degenerate arrays', () => {
        it('returns -1 for an empty array', () => {
            expect(findClosestPoint([], 50)).toBe(-1);
        });

        it('returns 0 for a single-element array regardless of targetX', () => {
            expect(findClosestPoint([100], 0)).toBe(0);
            expect(findClosestPoint([100], 100)).toBe(0);
            expect(findClosestPoint([100], 999)).toBe(0);
        });
    });

    describe('exact matches', () => {
        it('returns the exact index when targetX matches a value', () => {
            expect(findClosestPoint([10, 20, 30, 40], 20)).toBe(1);
            expect(findClosestPoint([10, 20, 30, 40], 30)).toBe(2);
        });

        it('returns 0 when targetX matches the first element', () => {
            expect(findClosestPoint([10, 20, 30], 10)).toBe(0);
        });

        it('returns last index when targetX matches the last element', () => {
            expect(findClosestPoint([10, 20, 30], 30)).toBe(2);
        });
    });

    describe('clamping at boundaries', () => {
        it('returns 0 when targetX is below all values', () => {
            expect(findClosestPoint([10, 20, 30], -5)).toBe(0);
            expect(findClosestPoint([10, 20, 30], 0)).toBe(0);
        });

        it('returns last index when targetX is above all values', () => {
            expect(findClosestPoint([10, 20, 30], 100)).toBe(2);
            expect(findClosestPoint([10, 20, 30], 30)).toBe(2);
        });
    });

    describe('nearest-neighbor selection', () => {
        it('picks the closer neighbor when targetX falls between two values', () => {
            const xs = [0, 100, 200, 300];
            // 40 is closer to 0 (distance 40) than to 100 (distance 60)
            expect(findClosestPoint(xs, 40)).toBe(0);
            // 60 is closer to 100 (distance 40) than to 0 (distance 60)
            expect(findClosestPoint(xs, 60)).toBe(1);
        });

        it('breaks ties in favour of the higher index (right neighbor)', () => {
            // Exactly at the midpoint: distance to both neighbors is equal.
            // The implementation returns the right neighbor when distances are equal.
            const xs = [0, 100];
            expect(findClosestPoint(xs, 50)).toBe(1);
        });

        it('handles non-uniform spacing correctly', () => {
            const xs = [0, 10, 110, 120];
            // 9 is closer to 10 (distance 1) than to 0 (distance 9)
            expect(findClosestPoint(xs, 9)).toBe(1);
        });
    });

    describe('real-world chart-like inputs', () => {
        it('resolves correctly for evenly spaced monthly ticks', () => {
            // 12 monthly ticks spaced 50px apart starting at 25px
            const xs = Array.from({length: 12}, (_, i) => 25 + i * 50);

            // cursor at 24px — left of the first tick → clamp to 0
            expect(findClosestPoint(xs, 24)).toBe(0);

            // cursor exactly at tick 6 (index 6 = 325px)
            expect(findClosestPoint(xs, 325)).toBe(6);

            // cursor between tick 3 (175) and tick 4 (225): midpoint = 200 → ties right (4)
            expect(findClosestPoint(xs, 200)).toBe(4);

            // cursor at 590px — right of the last tick (575px) → clamp to 11
            expect(findClosestPoint(xs, 590)).toBe(11);
        });
    });
});

/**
 * useChartInteractions hook
 */
describe('useChartInteractions', () => {
    const noop = () => undefined;
    const alwaysFalse = () => false;

    const defaultProps = {
        handlePress: noop,
        checkIsOver: alwaysFalse,
    };

    it('returns a customGestures object', () => {
        const {result} = renderHook(() => useChartInteractions(defaultProps));

        expect(result.current.customGestures).toBeTruthy();
    });

    it('returns a setPointPositions function', () => {
        const {result} = renderHook(() => useChartInteractions(defaultProps));

        expect(typeof result.current.setPointPositions).toBe('function');
    });

    it('starts with matchedIndex of -1 and isTooltipActive false', () => {
        const {result} = renderHook(() => useChartInteractions(defaultProps));

        expect(result.current.matchedIndex.get()).toBe(-1);
        expect(result.current.isTooltipActive.get()).toBe(false);
    });

    it('setPointPositions does not throw for typical canvas coordinates', () => {
        const {result} = renderHook(() => useChartInteractions(defaultProps));

        expect(() => {
            result.current.setPointPositions([10, 60, 110, 160, 210], [80, 60, 100, 40, 90]);
        }).not.toThrow();
    });

    it('setPointPositions accepts empty arrays', () => {
        const {result} = renderHook(() => useChartInteractions(defaultProps));

        expect(() => {
            result.current.setPointPositions([], []);
        }).not.toThrow();
    });

    it('accepts optional chartBottom and yZero shared values', () => {
        const {result} = renderHook(() => {
            const chartBottom = useSharedValue(200);
            const yZero = useSharedValue(200);
            return useChartInteractions({...defaultProps, chartBottom, yZero});
        });

        expect(result.current.isTooltipActive.get()).toBe(false);
    });

    it('accepts optional isCursorOverLabel and resolveLabelTouchX', () => {
        const {result} = renderHook(() =>
            useChartInteractions({
                ...defaultProps,
                isCursorOverLabel: () => false,
                resolveLabelTouchX: (x: number) => x,
            }),
        );

        expect(result.current.customGestures).toBeTruthy();
    });
});
