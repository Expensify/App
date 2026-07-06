import {computeDynamicChartHeight} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/computeDynamicChartHeight';

describe('computeDynamicChartHeight', () => {
    const horizontalChartPadding = {top: 92, bottom: 84, left: 150, right: 32};
    const designHeight = 464;

    it('returns the design height for non-horizontal charts', () => {
        expect(
            computeDynamicChartHeight({
                designHeight,
                isHorizontal: false,
                itemCount: 2,
                padding: horizontalChartPadding,
            }),
        ).toBe(designHeight);
    });

    it('returns the design height when item count matches the reference row count', () => {
        expect(
            computeDynamicChartHeight({
                designHeight,
                isHorizontal: true,
                itemCount: 5,
                padding: horizontalChartPadding,
            }),
        ).toBe(designHeight);
    });

    it('returns the design height when item count exceeds the reference row count', () => {
        expect(
            computeDynamicChartHeight({
                designHeight,
                isHorizontal: true,
                itemCount: 6,
                padding: horizontalChartPadding,
            }),
        ).toBe(designHeight);
    });

    it('returns the design height when item count is zero', () => {
        expect(
            computeDynamicChartHeight({
                designHeight,
                isHorizontal: true,
                itemCount: 0,
                padding: horizontalChartPadding,
            }),
        ).toBe(designHeight);
    });

    it('returns undefined when design height is undefined', () => {
        expect(
            computeDynamicChartHeight({
                designHeight: undefined,
                isHorizontal: true,
                itemCount: 2,
                padding: horizontalChartPadding,
            }),
        ).toBeUndefined();
    });

    it('shrinks the height for horizontal charts with fewer rows than the reference count', () => {
        expect(
            computeDynamicChartHeight({
                designHeight,
                isHorizontal: true,
                itemCount: 2,
                padding: horizontalChartPadding,
            }),
        ).toBe(291);
    });

    it('uses default horizontal bar padding when padding is missing', () => {
        expect(
            computeDynamicChartHeight({
                designHeight,
                isHorizontal: true,
                itemCount: 2,
                padding: undefined,
            }),
        ).toBe(291);
    });

    it('never returns a height greater than the design height', () => {
        expect(
            computeDynamicChartHeight({
                designHeight: 300,
                isHorizontal: true,
                itemCount: 2,
                padding: horizontalChartPadding,
            }),
        ).toBe(291);
    });

    it('caps the computed height at the provided design height', () => {
        expect(
            computeDynamicChartHeight({
                designHeight: 250,
                isHorizontal: true,
                itemCount: 2,
                padding: horizontalChartPadding,
            }),
        ).toBe(250);
    });
});
