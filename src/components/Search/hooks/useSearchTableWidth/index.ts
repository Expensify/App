import type {ComponentRef} from 'react';
import type {LayoutChangeEvent, View} from 'react-native';

import {useLayoutEffect, useRef, useState} from 'react';

/**
 * Measures the width of the Search table's container so the free-text columns can be sized from it.
 *
 * On web the first measurement is taken synchronously in a layout effect, before the browser paints. Without it the
 * table paints once with unmeasured columns — the free-text columns sharing the row as `flex:1` and the Status column
 * pinned to its fixed fallback width — and then snaps to its measured widths a frame later once `onLayout` resolves.
 * That snap reads as the columns (the Status column especially) jumping sideways every time a new list mounts, e.g.
 * when switching between the Spend page's sidebar links.
 *
 * `onLayout` keeps the width current afterwards (window resize, sidebar collapse), which is also native's only source.
 */
function useSearchTableWidth() {
    const tableWidthRef = useRef<ComponentRef<typeof View> | null>(null);
    const [tableWidth, setTableWidth] = useState(0);

    useLayoutEffect(() => {
        // Only the initial measurement has to beat the first paint; onLayout owns every change after that, so this
        // returns once the width is known rather than re-measuring on later renders.
        if (tableWidth > 0) {
            return;
        }

        const node = tableWidthRef.current;

        if (!node) {
            return;
        }

        const width = node.getBoundingClientRect().width;

        if (width > 0) {
            setTableWidth(width);
        }
    }, [tableWidth]);

    const onTableLayout = (event: LayoutChangeEvent) => {
        setTableWidth(event.nativeEvent.layout.width);
    };

    return {tableWidthRef, tableWidth, onTableLayout};
}

export default useSearchTableWidth;
