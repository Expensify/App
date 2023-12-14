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

function clamp(value, lowerBound, upperBound) {
    'worklet';

    return Math.min(Math.max(lowerBound, value), upperBound);
}

function getDeepDefaultProps({contentSize: contentSizeProp = {}, zoomRange: zoomRangeProp = {}}) {
    const contentSize = {
        width: contentSizeProp.width == null ? 1 : contentSizeProp.width,
        height: contentSizeProp.height == null ? 1 : contentSizeProp.height,
    };

    const zoomRange = {
        min: zoomRangeProp.min == null ? defaultZoomRange.min : zoomRangeProp.min,
        max: zoomRangeProp.max == null ? defaultZoomRange.max : zoomRangeProp.max,
    };

    return {contentSize, zoomRange};
}

export {getCanvasFitScale, clamp, getDeepDefaultProps};
