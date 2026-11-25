/**
 * The modal a form that needs a connection shows when the user presses Next or Confirm offline. It offers to leave and fill the form out later, since the answers
 * are already kept, or to try again, which goes on once the connection is back and asks again while it is not.
 */
import {ModalActions} from '@components/Modal/Global/ModalContext';

import useDecisionModal from '@hooks/useDecisionModal';
import useLocalize from '@hooks/useLocalize';

import Log from '@libs/Log';
import {refreshAndCheckIsOffline} from '@libs/NetworkState';

import {useEffect, useRef} from 'react';

type ContinueOfflineModalOptions = {
    /** Leaves the form. Nothing is saved here, since the form keeps the answers as the user gives them. */
    onSaveForLater: () => void;

    /** Goes on with what the press would have done, once Try again finds the connection back */
    onContinue: () => void;
};

function useContinueOfflineModal() {
    const {translate} = useLocalize();
    const {showDecisionModal} = useDecisionModal();

    // A second press while the modal is up or Try again is checking the connection, such as a double tap on Confirm, would stack a second modal that acts on
    // the form after the first one left it
    const isAttemptRunningRef = useRef(false);

    // The modal outlives the page, so its answer is ignored once the page is gone, such as after a deep link or sign-out while it was up
    const isMountedRef = useRef(true);
    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    const showContinueOfflineModal = ({onSaveForLater, onContinue}: ContinueOfflineModalOptions) => {
        if (isAttemptRunningRef.current) {
            return;
        }
        isAttemptRunningRef.current = true;

        showDecisionModal({
            title: translate('dynamicForm.continueOffline.title'),
            prompt: translate('dynamicForm.continueOffline.prompt'),
            firstOptionText: translate('dynamicForm.continueOffline.saveForLater'),
            secondOptionText: translate('common.tryAgain'),
            // A tap outside or Escape only closes the modal, while Try again checks the connection
            shouldReportDismiss: true,
        })
            .then(({action}) => {
                // Try again keeps the attempt running until the connection check answers, so a press during the check cannot open a second modal
                if (action === ModalActions.CLOSE && isMountedRef.current) {
                    return (
                        refreshAndCheckIsOffline()
                            // A failed check cannot show the connection is back, so it is treated as still offline and logged, since the user only sees the modal again
                            .catch((error: unknown) => {
                                Log.warn('[DynamicForm] The connection check of Try again failed', {error: error instanceof Error ? error.message : String(error)});
                                return true;
                            })
                            .then((isStillOffline) => {
                                isAttemptRunningRef.current = false;
                                if (!isMountedRef.current) {
                                    return;
                                }
                                if (isStillOffline) {
                                    showContinueOfflineModal({onSaveForLater, onContinue});
                                    return;
                                }
                                onContinue();
                            })
                    );
                }
                isAttemptRunningRef.current = false;
                if (!isMountedRef.current) {
                    return;
                }
                if (action === ModalActions.CONFIRM) {
                    onSaveForLater();
                }
            })
            // The modal can be pressed again, and a failure in leaving or going on is logged, since the user only sees the form stay where it was
            .catch((error: unknown) => {
                isAttemptRunningRef.current = false;
                Log.warn('[DynamicForm] The continue offline modal failed', {error: error instanceof Error ? error.message : String(error)});
            });
    };

    return {showContinueOfflineModal};
}

export default useContinueOfflineModal;
