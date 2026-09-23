import type {CanvasProps} from '@shopify/react-native-skia';

type StaticChartCanvasProps = Pick<CanvasProps, '__destroyWebGLContextAfterRender'> | undefined;

type GetStaticChartCanvasProps = () => StaticChartCanvasProps;

export default GetStaticChartCanvasProps;
