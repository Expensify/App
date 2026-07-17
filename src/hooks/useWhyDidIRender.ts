import {useEffect, useRef} from 'react';

/**
 * DEV-ONLY re-render diagnostic (fragile PoC instrument — remove before merge).
 *
 * Logs, on every commit, which of the provided named values changed identity (`Object.is`) since the
 * previous render. Use it to find *why* a component re-renders: pass the reactive inputs you suspect
 * (props, Onyx subscriptions, derived memos) as a named map and watch the console for the ones that flip.
 *
 * Values are summarized (arrays -> length, objects -> key count) so large collections like reportActions
 * don't flood the console. A render where nothing tracked changed is logged too — that points at a
 * parent/context/state-driven re-render rather than one of the tracked inputs.
 */
function summarize(value: unknown): string {
    if (value === null) {
        return 'null';
    }
    if (value === undefined) {
        return 'undefined';
    }
    if (Array.isArray(value)) {
        return `Array(len=${value.length})`;
    }
    switch (typeof value) {
        case 'function':
            return 'fn';
        case 'object':
            return `Object(keys=${Object.keys(value).length})`;
        case 'string':
            return value;
        case 'number':
        case 'boolean':
            return `${value}`;
        case 'symbol':
        case 'bigint':
            return value.toString();
        default:
            return 'unknown';
    }
}

function useWhyDidIRender(label: string, trackedValues: Record<string, unknown>) {
    const prevRef = useRef<Record<string, unknown> | null>(null);
    const renderCountRef = useRef(0);

    useEffect(() => {
        renderCountRef.current += 1;
        const count = renderCountRef.current;
        const prev = prevRef.current;
        prevRef.current = trackedValues;

        if (!prev) {
            // eslint-disable-next-line no-console
            console.log(`[WDYR:${label}] render #${count} (initial mount)`);
            return;
        }

        const changed = Object.keys(trackedValues).filter((key) => !Object.is(prev[key], trackedValues[key]));
        if (changed.length === 0) {
            // eslint-disable-next-line no-console
            console.log(`[WDYR:${label}] render #${count} — no tracked value changed (parent/context/state re-render)`);
            return;
        }

        const diff = changed.map((key) => `${key}: ${summarize(prev[key])} -> ${summarize(trackedValues[key])}`);
        // eslint-disable-next-line no-console
        console.log(`[WDYR:${label}] render #${count} changed [${changed.join(', ')}]`, diff);
    });
}

export default useWhyDidIRender;
