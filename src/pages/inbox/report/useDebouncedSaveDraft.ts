import useDebounce from '@hooks/useDebounce';

import CONST from '@src/CONST';

import type {RefObject} from 'react';

import {useRef} from 'react';

type UseDebouncedSaveDraftResult = {
    saveDraft: (...args: unknown[]) => void;
    isSavePending: RefObject<boolean>;
};

/**
 * Non-generic implementation so OXC's React Compiler can memoize the hook.
 * OXC bails on type params inside hooks ("Unsupported declaration type for hoisting").
 */
function useDebouncedSaveDraftImpl(saveDraftFn: (...args: unknown[]) => void, wait = CONST.TIMING.DRAFT_SAVE_DEBOUNCE_TIME): UseDebouncedSaveDraftResult {
    const isSavePending = useRef(false);

    const debouncedSaveDraft = useDebounce(
        (...args: unknown[]) => {
            saveDraftFn(...args);
            isSavePending.current = false;
        },
        wait,
        {shouldExecuteOnUnmount: true},
    );

    const saveDraft = (...args: unknown[]) => {
        isSavePending.current = true;
        debouncedSaveDraft(...args);
    };

    return {
        saveDraft,
        isSavePending,
    };
}

/**
 * Debounces a function to save a draft for a report comment or report action draft.
 * @param saveDraft - The function to save the draft. It will be called with the arguments passed to the triggerSaveDraft function.
 * @returns An object containing the debounced save draft function, the trigger save draft function, and the is save pending ref.
 * @property {Function} debouncedSaveDraft - The debounced save draft function.
 * @property {Function} triggerSaveDraft - The trigger save draft function.
 * @property {Ref<boolean>} isSavePending - The ref to check whether the save is pending.
 */
function useDebouncedSaveDraft<SaveDraftArgs extends unknown[]>(saveDraftFn: (...args: SaveDraftArgs) => void, wait = CONST.TIMING.DRAFT_SAVE_DEBOUNCE_TIME) {
    return useDebouncedSaveDraftImpl(saveDraftFn as (...args: unknown[]) => void, wait) as {
        saveDraft: (...args: SaveDraftArgs) => void;
        isSavePending: RefObject<boolean>;
    };
}

export default useDebouncedSaveDraft;
