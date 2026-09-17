import type {Dimensions} from '@src/types/utils/Layout';

import type {RefObject, SyntheticEvent} from 'react';
import type {GestureResponderEvent, View} from 'react-native';

type UseClickZoomPanParams = {
    /** The scrollable element the zoomed content overflows into */
    scrollableRef: RefObject<(View & HTMLDivElement) | null>;

    /** Size of the visible scroll area, used to center the clicked point after zooming */
    containerSize: Dimensions;

    /** Maps a click offset (reported in the pressed element's own coordinates) into zoomed-content coordinates */
    zoomFactor: number;
};

type UseClickZoomPanResult = {
    isZoomed: boolean;
    isDragging: boolean;
    onContainerPressIn: (e: GestureResponderEvent) => void;
    onContainerPress: (e?: GestureResponderEvent | KeyboardEvent | SyntheticEvent<Element, PointerEvent>) => void;

    /** Clears zoom/drag state, e.g. when the content reloads or its container closes */
    resetZoom: () => void;
};

type UseClickZoomPan = (params: UseClickZoomPanParams) => UseClickZoomPanResult;

export default UseClickZoomPan;
