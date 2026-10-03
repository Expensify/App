import type * as WebChartCanvasPropsModule from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/getChartCanvasProps/index.ts';

const getChartCanvasProps = jest.requireActual<typeof WebChartCanvasPropsModule>(
    '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/getChartCanvasProps/index.ts',
).default;

describe('getChartCanvasProps (web)', () => {
    it('should render a CSS-scaled inline chart at its painted pixel density', () => {
        // Given an inline chart painted at 75% of its design width on a 2x display
        // When its canvas props are built
        const canvasProps = getChartCanvasProps(false, 0.75, 2);

        // Then the backing store is sized for the painted chart, not its layout box, so the browser doesn't resample it
        expect(canvasProps).toEqual({pixelDensity: 1.5});
    });

    it('should leave the pixel density to Skia when the chart is not scaled', () => {
        // Given an inline chart shown at its design width
        // When its canvas props are built
        const canvasProps = getChartCanvasProps(false, 1, 2);

        // Then no density is passed, so Skia keeps following the display density and browser zoom on its own
        expect(canvasProps).toEqual({});
    });

    it('should keep the static canvas for the expanded chart', () => {
        // Given the expanded chart, which renders into a static bitmap and is not CSS-scaled
        // When its canvas props are built
        const canvasProps = getChartCanvasProps(true, 1, 2);

        // Then only the static canvas flag is set, as before
        // eslint-disable-next-line @typescript-eslint/naming-convention -- prop name is defined by react-native-skia
        expect(canvasProps).toEqual({__destroyWebGLContextAfterRender: true});
    });
});
