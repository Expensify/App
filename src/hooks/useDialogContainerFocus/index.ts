import {useEffect} from 'react';
import {InteractionManager} from 'react-native';
import type UseDialogContainerFocus from './types';

/** Moves focus to the dialog heading after the RHP transition, unless another element already has focus. */
const useDialogContainerFocus: UseDialogContainerFocus = (ref, isReady, claimInitialFocus) => {
    useEffect(() => {
        if (!isReady || !claimInitialFocus?.()) {
            return;
        }
        let cancelled = false;
        let frameId: number;
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        const interactionHandle = InteractionManager.runAfterInteractions(() => {
            if (cancelled) {
                return;
            }
            frameId = requestAnimationFrame(() => {
                if (cancelled || (document.activeElement && document.activeElement !== document.body)) {
                    return;
                }
                (ref.current as unknown as HTMLElement)?.focus({preventScroll: true});
            });
        });
        return () => {
            cancelled = true;
            interactionHandle.cancel();
            cancelAnimationFrame(frameId);
        };
    }, [isReady, ref, claimInitialFocus]);
};

export default useDialogContainerFocus;
