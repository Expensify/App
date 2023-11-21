import {DEFAULT_MAX_ZOOM_SCALE, DEFAULT_MIN_ZOOM_SCALE} from '@components/MultiGestureCanvas/Constants';

const modalZoomRange = {
    min: DEFAULT_MIN_ZOOM_SCALE,
    max: DEFAULT_MAX_ZOOM_SCALE * 1.135, // => 22.7; tested to be the same perceived zoom scale compared to the attachment carousel on Android
};

const carouselZoomRange = {
    min: DEFAULT_MIN_ZOOM_SCALE,
    max: DEFAULT_MAX_ZOOM_SCALE,
};

export {modalZoomRange, carouselZoomRange};
