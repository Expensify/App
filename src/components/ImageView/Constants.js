const {DEFAULT_MIN_ZOOM_SCALE, DEFAULT_MAX_ZOOM_SCALE} = require('@components/ImageLightbox/Constants');

const modalZoomScale = {
    minZoomScale: DEFAULT_MIN_ZOOM_SCALE,
    maxZoomScale: DEFAULT_MAX_ZOOM_SCALE * 1.19, // equals to 23.8, which was tested to be the same perceived zoom scale compared to the attachment carousel
};

const carouselZoomScale = {
    minZoomScale: DEFAULT_MIN_ZOOM_SCALE,
    maxZoomScale: DEFAULT_MAX_ZOOM_SCALE,
};

export {modalZoomScale, carouselZoomScale};
