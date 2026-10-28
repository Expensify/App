import type UseClickZoomPan from './types';

/** Click-to-zoom is a mouse interaction; touch platforms zoom with gestures (Lightbox / MultiGestureCanvas). */
const useClickZoomPan: UseClickZoomPan = () => ({
    isZoomed: false,
    isDragging: false,
    onContainerPressIn: () => {},
    onContainerPress: () => {},
    resetZoom: () => {},
});

export default useClickZoomPan;
