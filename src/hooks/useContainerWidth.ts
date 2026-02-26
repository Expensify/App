import {useCallback, useState} from 'react';
import type {LayoutChangeEvent} from 'react-native';

/**
 * Returns an onLayout handler and the measured container width (minus an optional offset).
 * Used by skeleton components that need the container width for SVG layout calculations.
 * The width updates automatically when the container resizes.
 */
function useContainerWidth(offset = 0): {onLayout: (event: LayoutChangeEvent) => void; containerWidth: number} {
    const [containerWidth, setContainerWidth] = useState(0);

    const onLayout = useCallback(
        (event: LayoutChangeEvent) => {
            setContainerWidth(event.nativeEvent.layout.width - offset);
        },
        [offset],
    );

    return {onLayout, containerWidth};
}

export default useContainerWidth;
