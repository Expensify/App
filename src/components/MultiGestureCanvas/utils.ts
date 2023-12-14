import {defaultZoomRange} from './constants';
import {ContentSizeProp, ZoomRangeProp} from './types';

type GetCanvasFitScale = (props: {
    canvasSize: {
        width: number;
        height: number;
    };
    contentSize: {
        width: number;
        height: number;
    };
}) => {scaleX: number; scaleY: number; minScale: number; maxScale: number};

const getCanvasFitScale: GetCanvasFitScale = ({canvasSize, contentSize}) => {
    const scaleX = canvasSize.width / contentSize.width;
    const scaleY = canvasSize.height / contentSize.height;

    const minScale = Math.min(scaleX, scaleY);
    const maxScale = Math.max(scaleX, scaleY);

    return {scaleX, scaleY, minScale, maxScale};
};

function clamp(value: number, lowerBound: number, upperBound: number) {
    'worklet';

    return Math.min(Math.max(lowerBound, value), upperBound);
}

type Props = {
    contentSize?: ContentSizeProp;
    zoomRange?: ZoomRangeProp;
};
type PropsWithDefault = {
    contentSize: ContentSizeProp;
    zoomRange: Required<ZoomRangeProp>;
};
const getDeepDefaultProps = ({contentSize: contentSizeProp, zoomRange: zoomRangeProp}: Props): PropsWithDefault => {
    const contentSize = {
        width: contentSizeProp?.width ?? 1,
        height: contentSizeProp?.height ?? 1,
    };

    const zoomRange = {
        min: zoomRangeProp?.min ?? defaultZoomRange.min,
        max: zoomRangeProp?.max ?? defaultZoomRange.max,
    };

    return {contentSize, zoomRange};
};

export {getCanvasFitScale, clamp, getDeepDefaultProps};
