import {useEffect, useRef} from 'react';
import useDebounce from '@hooks/useDebounce';
import CONST from '@src/CONST';

/**
 * Debounces a function to save a draft for a report comment or report action draft.
 * @param saveDraft - The function to save the draft. It will be called with the arguments passed to the triggerSaveDraft function.
 * @returns An object containing the debounced save draft function, the trigger save draft function, and the is save pending ref.
 * @property {Function} debouncedSaveDraft - The debounced save draft function.
 * @property {Function} triggerSaveDraft - The trigger save draft function.
 * @property {Ref<boolean>} isSavePending - The ref to check whether the save is pending.
 */
function useDebouncedSaveDraft<SaveDraftArgs extends unknown[]>(saveDraftFn: (...args: SaveDraftArgs) => void, wait = CONST.TIMING.DRAFT_SAVE_DEBOUNCE_TIME) {
    const isSavePending = useRef(false);

    const debouncedSaveDraft = useDebounce((...args: SaveDraftArgs) => {
        saveDraftFn(...args);
        isSavePending.current = false;
    }, wait);

    const saveDraft = (...args: SaveDraftArgs) => {
        isSavePending.current = true;
        debouncedSaveDraft(...args);
    };

    // Cancel the debounced save draft on unmount
    useEffect(
        () => () => {
            isSavePending.current = false;
        },
        [debouncedSaveDraft],
    );

    return {
        saveDraft,
        isSavePending,
    };
}

export default useDebouncedSaveDraft;
