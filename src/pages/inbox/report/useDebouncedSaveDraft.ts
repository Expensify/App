import useDebounce from '@hooks/useDebounce';

import CONST from '@src/CONST';

import {useRef} from 'react';

/**
 * Debounces a function to save a draft for a report comment or report action draft.
 * @param saveDraftFn - The function to save the draft. It will be called with the arguments passed to saveDraft.
 * @returns An object containing the debounced save draft function and the is-save-pending ref.
 * @property saveDraft - The debounced save draft function.
 * @property isSavePending - The ref to check whether the save is pending.
 */
function useDebouncedSaveDraft<SaveDraftArgs extends unknown[]>(saveDraftFn: (...args: SaveDraftArgs) => void, wait = CONST.TIMING.DRAFT_SAVE_DEBOUNCE_TIME) {
    const isSavePending = useRef(false);

    const debouncedSaveDraft = useDebounce(
        (...args: SaveDraftArgs) => {
            saveDraftFn(...args);
            isSavePending.current = false;
        },
        wait,
        {shouldExecuteOnUnmount: true},
    );

    const saveDraft = (...args: SaveDraftArgs) => {
        isSavePending.current = true;
        debouncedSaveDraft(...args);
    };

    return {
        saveDraft,
        isSavePending,
    };
}

export default useDebouncedSaveDraft;
