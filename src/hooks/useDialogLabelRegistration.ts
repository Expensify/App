import {useDialogLabelActions, useDialogLabelData} from '@components/DialogLabelContext';
import ScreenWrapperStatusContext from '@components/ScreenWrapper/ScreenWrapperStatusContext';

import type {ReactNode} from 'react';

import {useContext, useLayoutEffect} from 'react';

import useIsScreenFocused from './useIsScreenFocused';

/** Registers and manages a dialog label in the DialogLabelContext for the lifetime of the calling component. */
function useDialogLabelRegistration(title: ReactNode) {
    const {isInsideDialog, containerRef, dialogAriaLabel} = useDialogLabelData();
    const {pushLabel, popLabel, claimInitialFocus} = useDialogLabelActions();
    const screenWrapperStatus = useContext(ScreenWrapperStatusContext);
    const isFocused = useIsScreenFocused();

    const shouldRegisterLabel = !!isInsideDialog && typeof title === 'string' && !!title;

    // useLayoutEffect so the dialog name is in React state before paint — JAWS virtual buffer misses post-paint setAttribute.
    useLayoutEffect(() => {
        if (!shouldRegisterLabel || typeof title !== 'string') {
            return;
        }
        const id = pushLabel(title);
        return () => popLabel(id);
    }, [shouldRegisterLabel, title, pushLabel, popLabel]);

    // Focus after transition (APG). Untitled RHPs never get dialogAriaLabel — do not block forever on it.
    // When a title is registered, still wait so aria-label exists before focus (JAWS named-dialog timing).
    const isTransitionReady = !!isInsideDialog && !!screenWrapperStatus?.didScreenTransitionEnd && isFocused && (!shouldRegisterLabel || !!dialogAriaLabel);

    return {
        isTransitionReady,
        claimInitialFocus,
        containerRef,
    };
}

export default useDialogLabelRegistration;
