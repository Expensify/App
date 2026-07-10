import {useDialogLabelActions, useDialogLabelData} from '@components/DialogLabelContext';
import ScreenWrapperStatusContext from '@components/ScreenWrapper/ScreenWrapperStatusContext';

import type {ReactNode} from 'react';

import {useIsFocused} from '@react-navigation/native';
import {useContext, useEffect} from 'react';

/** Registers and manages a dialog label in the DialogLabelContext for the lifetime of the calling component. */
function useDialogLabelRegistration(title: ReactNode) {
    const {isInsideDialog, containerRef} = useDialogLabelData();
    const {pushLabel, popLabel, claimInitialFocus} = useDialogLabelActions();
    const screenWrapperStatus = useContext(ScreenWrapperStatusContext);
    // `didScreenTransitionEnd` is one-way — without `isFocused` a kept-alive background screen would steal focus from the active one.
    const isFocused = useIsFocused();

    useEffect(() => {
        if (!isInsideDialog || typeof title !== 'string' || !title) {
            return;
        }
        const id = pushLabel(title);
        return () => popLabel(id);
    }, [isInsideDialog, title, pushLabel, popLabel]);

    const isTransitionReady = !!isInsideDialog && !!screenWrapperStatus?.didScreenTransitionEnd && isFocused;

    return {isTransitionReady, claimInitialFocus, containerRef};
}

export default useDialogLabelRegistration;
