import {useFocusEffect} from '@react-navigation/native';
import {useCallback} from 'react';
import type {ValueOf} from 'type-fest';
import {flushDeferredWrite, hasDeferredWrite} from '@libs/deferredLayoutWrite';
// eslint-disable-next-line no-restricted-imports -- No higher-level Navigation API for waiting on transitions without navigating
import TransitionTracker from '@libs/Navigation/TransitionTracker';
import type CONST from '@src/CONST';

type DeferredLayoutWriteKey = ValueOf<typeof CONST.DEFERRED_LAYOUT_WRITE_KEYS>;

/**
 * Flushes the given deferred-write channel when the host screen gains focus.
 *
 * Empty deps: the callback identity is stable but useFocusEffect runs it on
 * every focus gain (not just mount). On narrow layout, the modal dismiss/restore
 * cycle always triggers a new focus event. On wide layout, the fast-path handlers
 * use TransitionTracker as a fallback since the screen may already be focused.
 * The 5s safety timeout in deferredLayoutWrite also covers edge cases.
 */
function useFlushDeferredWriteOnFocus(key: DeferredLayoutWriteKey) {
    useFocusEffect(
        useCallback(() => {
            if (!hasDeferredWrite(key)) {
                return;
            }
            const handle = TransitionTracker.runAfterTransitions({
                callback: () => flushDeferredWrite(key),
            });
            return () => handle.cancel();
        }, [key]),
    );
}

export default useFlushDeferredWriteOnFocus;
