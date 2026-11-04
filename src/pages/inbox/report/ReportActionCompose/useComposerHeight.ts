/** Keeps the height used while clearing the composer from outliving the clear render. */
import {useEffect, useRef, useState} from 'react';

function useComposerHeight() {
    const [composerHeightAfterClear, setComposerHeightAfterClear] = useState<number | null>(null);
    const emptyComposerHeightRef = useRef<number | null>(null);

    useEffect(() => {
        if (composerHeightAfterClear === null) {
            return;
        }

        // Keep the measured height for the clear render to prevent cursor flashing, but do not
        // depend on a content size event: applying the same height may not produce one.
        const frame = requestAnimationFrame(() => setComposerHeightAfterClear(null));
        return () => cancelAnimationFrame(frame);
    }, [composerHeightAfterClear]);

    const clearComposerHeight = () => {
        setComposerHeightAfterClear(null);
    };

    const resetHeight = () => {
        setComposerHeightAfterClear(emptyComposerHeightRef.current);
    };

    const updateEmptyComposerHeight = (inputHeight: number, value: string) => {
        // A restored draft can wrap without containing a newline, so only measure an empty input.
        if (emptyComposerHeightRef.current !== null || inputHeight <= 0 || value !== '') {
            return;
        }
        emptyComposerHeightRef.current = inputHeight;
    };

    return {composerHeightAfterClear, clearComposerHeight, resetHeight, updateEmptyComposerHeight};
}

export default useComposerHeight;
