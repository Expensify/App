import type {ReactNode} from 'react';
import {useContext, useEffect, useRef} from 'react';
import {useDialogLabelActions} from '@components/DialogLabelContext';
import ScreenWrapperStatusContext from '@components/ScreenWrapper/ScreenWrapperStatusContext';

/** Registers and manages a dialog label in the DialogLabelContext for the lifetime of the calling component. */
function useDialogLabelRegistration(title: ReactNode) {
    const {isInsideDialog, pushLabel, popLabel, updateLabel, markReady, claimInitialFocus} = useDialogLabelActions();
    const labelIdRef = useRef<number | undefined>(undefined);
    const screenWrapperStatus = useContext(ScreenWrapperStatusContext);

    useEffect(() => {
        if (!isInsideDialog || typeof title !== 'string' || !title) {
            return;
        }
        if (labelIdRef.current === undefined) {
            labelIdRef.current = pushLabel(title);
        } else {
            updateLabel(labelIdRef.current, title);
        }
    }, [isInsideDialog, title, pushLabel, updateLabel]);

    useEffect(() => {
        if (!isInsideDialog || labelIdRef.current === undefined || !screenWrapperStatus?.didScreenTransitionEnd) {
            return;
        }
        markReady(labelIdRef.current);
    }, [isInsideDialog, screenWrapperStatus?.didScreenTransitionEnd, markReady]);

    useEffect(
        () => () => {
            if (labelIdRef.current === undefined) {
                return;
            }
            popLabel(labelIdRef.current);
            labelIdRef.current = undefined;
        },
        [popLabel],
    );

    const isTransitionReady = !!isInsideDialog && !!screenWrapperStatus?.didScreenTransitionEnd;

    return {isInsideDialog, isTransitionReady, claimInitialFocus};
}

export default useDialogLabelRegistration;
