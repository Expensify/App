import TransitionTracker from '@libs/Navigation/TransitionTracker';
import {flushWriteSession, hasPendingWrite} from '@libs/submitWriteSession';

import type CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

import {useFocusEffect} from '@react-navigation/native';
import {useCallback} from 'react';

type DeferredLayoutWriteKey = ValueOf<typeof CONST.DEFERRED_LAYOUT_WRITE_KEYS>;

/**
 * Flushes the given deferred-write channel when the host screen gains focus.
 *
 * Empty deps: the callback identity is stable but useFocusEffect runs it on
 * every focus gain (not just mount). On narrow layout, the modal dismiss/restore
 * cycle always triggers a new focus event. On wide layout, the fast-path handlers
 * use TransitionTracker as a fallback since the screen may already be focused.
 * The 5s safety timeout in submitWriteSession also covers edge cases.
 */
function useFlushDeferredWriteOnFocus(key: DeferredLayoutWriteKey) {
    useFocusEffect(
        useCallback(() => {
            if (!hasPendingWrite(key)) {
                return;
            }
            const handle = TransitionTracker.runAfterTransitions({
                callback: () => flushWriteSession(key),
            });
            return () => handle.cancel();
        }, [key]),
    );
}

export default useFlushDeferredWriteOnFocus;
