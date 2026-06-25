import {useCallback, useEffect, useRef, useState} from 'react';
import type {TableData, TableRow} from '@components/Table/types';
import durationHighlightItem from '@libs/Navigation/helpers/getDurationHighlightItem';
import type {Middleware, MiddlewareHookResult} from './types';

type HighlightingMethods = {
    /** Animate rows as highlighted by their keyForList values. */
    highlightItems: (itemKeys: string[], highlightDuration?: number) => void;
};

function useHighlighting<DataType extends TableData>(): MiddlewareHookResult<TableRow<DataType>, HighlightingMethods> {
    const highlightTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [highlightedRowKeys, setHighlightedRowKeys] = useState<Set<string> | null>(null);

    const clearHighlightedRows = useCallback(() => {
        setHighlightedRowKeys(null);
        highlightTimeoutRef.current = null;
    }, []);

    const highlightItems: HighlightingMethods['highlightItems'] = useCallback(
        (itemKeys) => {
            if (highlightTimeoutRef.current) {
                clearTimeout(highlightTimeoutRef.current);
                highlightTimeoutRef.current = null;
            }

            if (!itemKeys.length) {
                setHighlightedRowKeys(null);
                return;
            }

            setHighlightedRowKeys(new Set(itemKeys));
            highlightTimeoutRef.current = setTimeout(clearHighlightedRows, durationHighlightItem);
        },
        [clearHighlightedRows],
    );

    useEffect(() => {
        return () => {
            if (!highlightTimeoutRef.current) {
                return;
            }

            clearTimeout(highlightTimeoutRef.current);
        };
    }, []);

    const middleware: Middleware<TableRow<DataType>> = (data) => {
        if (!highlightedRowKeys) {
            return data;
        }

        return data.map((item) => ({
            ...item,
            shouldAnimateInHighlight: highlightedRowKeys.has(item.keyForList),
        }));
    };

    return {middleware, methods: {highlightItems}};
}

export default useHighlighting;
export type {HighlightingMethods};
