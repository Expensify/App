import {useLayoutEffect, useRef, useState} from 'react';
import type {View} from 'react-native';

/**
 * Returns a ref to attach to a container View and its measured width (minus an optional offset).
 * Used by skeleton components that need the container width for SVG layout calculations.
 */
function useContainerWidth(offset = 0): {containerRef: React.RefObject<View | null>; containerWidth: number} {
    const containerRef = useRef<View>(null);
    const [containerWidth, setContainerWidth] = useState(0);

    useLayoutEffect(() => {
        containerRef.current?.measure((_x, _y, width) => {
            setContainerWidth(width - offset);
        });
    }, [offset]);

    return {containerRef, containerWidth};
}

export default useContainerWidth;
