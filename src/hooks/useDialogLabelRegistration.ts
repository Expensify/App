import type {ReactNode} from 'react';
import {useContext, useEffect} from 'react';
import {useDialogLabelActions, useDialogLabelData} from '@components/DialogLabelContext';
import ScreenWrapperStatusContext from '@components/ScreenWrapper/ScreenWrapperStatusContext';

/** Registers and manages a dialog label in the DialogLabelContext for the lifetime of the calling component. */
function useDialogLabelRegistration(title: ReactNode) {
    const {isInsideDialog, containerRef} = useDialogLabelData();
    const {pushLabel, popLabel, claimInitialFocus} = useDialogLabelActions();
    const screenWrapperStatus = useContext(ScreenWrapperStatusContext);

    useEffect(() => {
        if (!isInsideDialog || typeof title !== 'string' || !title) {
            return;
        }
        const id = pushLabel(title);
        return () => popLabel(id);
    }, [isInsideDialog, title, pushLabel, popLabel]);

    const isTransitionReady = !!isInsideDialog && !!screenWrapperStatus?.didScreenTransitionEnd;

    return {isTransitionReady, claimInitialFocus, containerRef};
}

export default useDialogLabelRegistration;
