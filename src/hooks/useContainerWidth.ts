import isHTMLElement from '@libs/isHTMLElement';

import type {RefObject} from 'react';
import type {LayoutChangeEvent, View} from 'react-native';

import {useCallback, useLayoutEffect, useRef, useState} from 'react';

/**
 * Returns a ref, an onLayout handler and the measured container width (minus an optional offset).
 * The width updates automatically when the container resizes.
 *
 * Attach the returned ref to the container as well when its first frame draws from the width: on web, onLayout
 * reports only after the browser has painted once, so without the ref that first frame is drawn at width 0.
 */
function useContainerWidth(offset = 0): {ref: RefObject<View | null>; onLayout: (event: LayoutChangeEvent) => void; containerWidth: number} {
    const ref = useRef<View>(null);
    const [containerWidth, setContainerWidth] = useState(0);

    useLayoutEffect(() => {
        const node: unknown = ref.current;
        if (!isHTMLElement(node)) {
            return;
        }
        setContainerWidth(node.getBoundingClientRect().width - offset);
    }, [offset]);

    const onLayout = useCallback(
        (event: LayoutChangeEvent) => {
            setContainerWidth(event.nativeEvent.layout.width - offset);
        },
        [offset],
    );

    return {ref, onLayout, containerWidth};
}

export default useContainerWidth;
