import type {CanvasProps} from '@shopify/react-native-skia';

type ChartCanvasProps = Pick<CanvasProps, '__destroyWebGLContextAfterRender' | 'pixelDensity'> | undefined;

type GetChartCanvasProps = (shouldUseStaticCanvas: boolean | undefined, layoutScale: number, devicePixelRatio: number) => ChartCanvasProps;

export default GetChartCanvasProps;
