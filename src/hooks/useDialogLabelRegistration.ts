import {useDialogLabelActions, useDialogLabelData} from '@components/DialogLabelContext';
import ScreenWrapperStatusContext from '@components/ScreenWrapper/ScreenWrapperStatusContext';

import type {ReactNode} from 'react';

import {useContext, useId, useLayoutEffect} from 'react';

import useIsScreenFocused from './useIsScreenFocused';

/** Registers and manages a dialog label in the DialogLabelContext for the lifetime of the calling component. */
function useDialogLabelRegistration(title: ReactNode) {
    const {isInsideDialog, containerRef} = useDialogLabelData();
    const {pushLabel, popLabel, claimInitialFocus} = useDialogLabelActions();
    const screenWrapperStatus = useContext(ScreenWrapperStatusContext);
    const isFocused = useIsScreenFocused();
    // Stable DOM id for aria-labelledby → visible title (APG dialog pattern).
    const titleNativeID = useId();

    const shouldRegisterLabel = !!isInsideDialog && typeof title === 'string' && !!title;

    // useLayoutEffect so the dialog name is in React state before paint — JAWS virtual buffer misses post-paint setAttribute.
    useLayoutEffect(() => {
        if (!shouldRegisterLabel || typeof title !== 'string') {
            return;
        }
        const id = pushLabel(title, titleNativeID);
        return () => popLabel(id);
    }, [shouldRegisterLabel, title, titleNativeID, pushLabel, popLabel]);

    const isTransitionReady = !!isInsideDialog && !!screenWrapperStatus?.didScreenTransitionEnd && isFocused;

    return {
        isTransitionReady,
        claimInitialFocus,
        containerRef,
        titleNativeID: shouldRegisterLabel ? titleNativeID : undefined,
    };
}

export default useDialogLabelRegistration;
