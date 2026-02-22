import {useEffect, useRef} from 'react';
import useArrowKeyFocusManager from './useArrowKeyFocusManager';
import useResetFocusOnBlur from './useResetFocusOnBlur';

type UseMultiListFocusManagerParams = {
    flatItems: Array<{isDisabled?: boolean}>;
    firstListLength: number;
    reorderDep: unknown;
};

function useMultiListFocusManager({flatItems, firstListLength, reorderDep}: UseMultiListFocusManagerParams) {
    const disabledIndexes = flatItems.flatMap((item, index) => (item.isDisabled ? [index] : []));

    const [focusedIndex, setFocusedIndex] = useArrowKeyFocusManager({
        initialFocusedIndex: -1,
        maxIndex: flatItems.length - 1,
        disabledIndexes,
        isActive: true,
        disableCyclicTraversal: true,
    });

    const pendingFocusIndexRef = useRef<number | null>(null);

    useEffect(() => {
        if (pendingFocusIndexRef.current === null) {
            return;
        }

        const targetIndex = pendingFocusIndexRef.current;
        pendingFocusIndexRef.current = null;

        const maxIndex = flatItems.length - 1;
        const clampedIndex = Math.min(targetIndex, maxIndex);

        for (let i = clampedIndex; i <= maxIndex; i++) {
            if (!flatItems.at(i)?.isDisabled) {
                setFocusedIndex(i);
                return;
            }
        }

        for (let i = clampedIndex - 1; i >= 0; i--) {
            if (!flatItems.at(i)?.isDisabled) {
                setFocusedIndex(i);
                return;
            }
        }

        setFocusedIndex(-1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reorderDep]);

    const listContainerRef = useResetFocusOnBlur(setFocusedIndex);

    const firstListFocusedIndex = focusedIndex >= 0 && focusedIndex < firstListLength ? focusedIndex : -1;
    const secondListFocusedIndex = focusedIndex >= firstListLength ? focusedIndex - firstListLength : -1;

    const scheduleRefocus = () => {
        pendingFocusIndexRef.current = focusedIndex;
        setFocusedIndex(-1);
    };

    return {focusedIndex, setFocusedIndex, firstListFocusedIndex, secondListFocusedIndex, listContainerRef, scheduleRefocus};
}

export default useMultiListFocusManager;
