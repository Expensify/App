import {POLAR_CONTAINER_HEIGHT_RATIO} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/constants';
import computeExpandedChartLayout, {MAX_CANVAS_DIMENSION, MAX_ZOOM_HEADROOM} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/computeExpandedChartLayout';

const design = {designWidth: 680, designHeight: 340, borderRadius: 16, isPolar: false};

describe('computeExpandedChartLayout', () => {
    it('reports no layout until the area is measured or when design dimensions are missing', () => {
        expect(computeExpandedChartLayout(design, {width: 0, height: 0}).hasLayout).toBe(false);
        expect(computeExpandedChartLayout({...design, designWidth: undefined}, {width: 1000, height: 800}).hasLayout).toBe(false);
        expect(computeExpandedChartLayout({...design, designHeight: 0}, {width: 1000, height: 800}).hasLayout).toBe(false);
        expect(computeExpandedChartLayout(design, {width: 1000, height: 800}).hasLayout).toBe(true);
    });

    it('fits the design box into the available area using the limiting dimension', () => {
        // Width-limited: 1000 / 680
        const wide = computeExpandedChartLayout(design, {width: 1000, height: 800});
        expect(wide.fitScale).toBeCloseTo(1000 / 680);
        expect(wide.targetWidth).toBeCloseTo(1000);
        expect(wide.targetHeight).toBeCloseTo(500);

        // Height-limited: 300 / 340
        const short = computeExpandedChartLayout(design, {width: 1000, height: 300});
        expect(short.fitScale).toBeCloseTo(300 / 340);
    });

    it('gives full zoom headroom when the zoomed render stays under the canvas cap', () => {
        const layout = computeExpandedChartLayout(design, {width: 400, height: 800});
        expect(layout.zoomHeadroom).toBe(MAX_ZOOM_HEADROOM);
        expect(layout.renderWidth).toBeCloseTo(400 * MAX_ZOOM_HEADROOM);
        expect(layout.renderBorderRadius).toBeCloseTo(16 * layout.fitScale * MAX_ZOOM_HEADROOM);
    });

    it('reduces zoom headroom so the zoomed render never exceeds the canvas cap', () => {
        const layout = computeExpandedChartLayout(design, {width: 1200, height: 800});
        expect(layout.zoomHeadroom).toBeCloseTo(MAX_CANVAS_DIMENSION / 1200);
        expect(layout.renderWidth).toBeCloseTo(MAX_CANVAS_DIMENSION);
    });

    it('never shrinks the fitted render: headroom bottoms out at 1 on very large displays', () => {
        const layout = computeExpandedChartLayout(design, {width: 3000, height: 2000});
        expect(layout.zoomHeadroom).toBe(1);
        expect(layout.renderWidth).toBeCloseTo(layout.targetWidth);
        expect(layout.renderBorderRadius).toBeCloseTo(16 * layout.fitScale);
    });

    it('fits polar charts by their clipped height and reports the clipped sizes', () => {
        const layout = computeExpandedChartLayout({...design, designWidth: 400, designHeight: 400, isPolar: true}, {width: 1000, height: 360});
        expect(layout.fitScale).toBeCloseTo(360 / (400 * POLAR_CONTAINER_HEIGHT_RATIO));
        expect(layout.clippedTargetHeight).toBeCloseTo(360);
        expect(layout.targetHeight).toBeCloseTo(360 / POLAR_CONTAINER_HEIGHT_RATIO);
        expect(layout.clippedRenderHeight).toBeCloseTo(layout.clippedTargetHeight * layout.zoomHeadroom);
        expect(layout.isPolar).toBe(true);
    });

    it('passes an undefined border radius through', () => {
        expect(computeExpandedChartLayout({...design, borderRadius: undefined}, {width: 1000, height: 800}).renderBorderRadius).toBeUndefined();
    });
});
