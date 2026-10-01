import {getColumnWidthVariableName} from '@components/Table/columnResize/columnWidthExpressions';
import type {ColumnWidthOverrides} from '@components/Table/columnResize/types';

import type {RefObject} from 'react';

import {useLayoutEffect, useRef} from 'react';

type UseLiveColumnWidthsParams = {
    /** What each column resolved to, which is what a column paints while it has no live width. */
    resolvedColumnWidths: Record<string, number>;

    /** Stored widths. A change means React has rendered them as the columns' fallbacks, so the live widths step aside. */
    columnWidthOverrides: ColumnWidthOverrides | undefined;

    /** The active drag, if any. Live widths are kept while it lasts, so a width stored from elsewhere can't yank the column. */
    dragRef: RefObject<unknown>;
};

type LiveColumnWidths = {
    /** Element holding the width custom properties. */
    scopeElementRef: RefObject<HTMLElement | null>;

    setScopeElement: (element: HTMLElement | null) => void;

    writeColumnWidth: (columnKey: string, width: number) => void;

    /** Column's currently painted width (ahead of React mid-gesture). `undefined` if it has none, never zero, to avoid collapsing it. */
    readColumnWidth: (columnKey: string) => number | undefined;

    /** Hands every column back to the fallback React rendered. */
    clearLiveWidths: () => void;
};

/**
 * Column widths written mid-gesture as CSS custom properties, ahead of React. At rest there are none and every column
 * paints the fallback React rendered, so the custom properties never have to be kept in sync with the resolved widths.
 */
function useLiveColumnWidths({resolvedColumnWidths, columnWidthOverrides, dragRef}: UseLiveColumnWidthsParams): LiveColumnWidths {
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

    // A committed width has now been rendered as the columns' fallbacks, so the live widths step aside before paint. The
    // payers land where the drag left them because the resolver splits the width the same way.
    useLayoutEffect(() => {
        // The drag's own commit clears later.
        if (dragRef.current) {
            return;
        }

        clearLiveWidths();
    }, [columnWidthOverrides, dragRef]);

    return {scopeElementRef, setScopeElement, writeColumnWidth, readColumnWidth, clearLiveWidths};
}

export default useLiveColumnWidths;
