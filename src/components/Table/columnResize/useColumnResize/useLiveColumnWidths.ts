/** Widths painted mid-drag straight onto the DOM, ahead of React, and handed back once React renders them. */
import {getColumnWidthVariableName} from '@components/Table/columnResize/columnWidthExpressions';

import type {RefObject} from 'react';

import {useLayoutEffect, useRef} from 'react';

type UseLiveColumnWidthsParams = {
    /** What a column paints while it has no live width. A new object means React rendered new widths, so live widths are cleared. */
    resolvedColumnWidths: Record<string, number>;

    /** Active drag. Live widths survive it so a width stored elsewhere can't yank the column. */
    dragRef: RefObject<unknown>;
};

type LiveColumnWidths = {
    /** Element holding the width custom properties. */
    scopeElementRef: RefObject<HTMLElement | null>;

    setScopeElement: (element: HTMLElement | null) => void;

    writeColumnWidth: (columnKey: string, width: number) => void;

    /** Currently painted width, ahead of React mid-gesture. `undefined` rather than zero, so a column never collapses. */
    readColumnWidth: (columnKey: string) => number | undefined;

    /** Hands every column back to React's fallback. */
    clearLiveWidths: () => void;
};

/** Widths written mid-gesture as CSS custom properties. None at rest, so they never need syncing with resolved widths. */
function useLiveColumnWidths({resolvedColumnWidths, dragRef}: UseLiveColumnWidthsParams): LiveColumnWidths {
    const scopeElementRef = useRef<HTMLElement | null>(null);
    const liveWidthsRef = useRef<Record<string, number>>({});

    const setScopeElement = (element: HTMLElement | null) => {
        scopeElementRef.current = element;

        // The properties live on the element, so a new one starts out with none of them.
        liveWidthsRef.current = {};
    };

    const writeColumnWidth = (columnKey: string, width: number) => {
        scopeElementRef.current?.style.setProperty(getColumnWidthVariableName(columnKey), `${width}px`);
        liveWidthsRef.current[columnKey] = width;
    };

    const readColumnWidth = (columnKey: string): number | undefined => liveWidthsRef.current[columnKey] ?? resolvedColumnWidths[columnKey];

    const clearLiveWidths = () => {
        for (const columnKey of Object.keys(liveWidthsRef.current)) {
            scopeElementRef.current?.style.removeProperty(getColumnWidthVariableName(columnKey));
        }

        liveWidthsRef.current = {};
    };

    // React now renders the committed width as the fallback, so drop live widths before paint.
    useLayoutEffect(() => {
        // The drag's own commit clears later.
        if (dragRef.current) {
            return;
        }

        clearLiveWidths();
    }, [resolvedColumnWidths, dragRef]);

    return {scopeElementRef, setScopeElement, writeColumnWidth, readColumnWidth, clearLiveWidths};
}

export default useLiveColumnWidths;
