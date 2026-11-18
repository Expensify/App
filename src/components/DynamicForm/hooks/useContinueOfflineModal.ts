/**
 * The modal a form that needs a connection shows when the user presses Next or Confirm offline. It offers to leave and fill the form out later, since the answers
 * are already kept, or to try again, which goes on once the connection is back and asks again while it is not.
 */
import {ModalActions} from '@components/Modal/Global/ModalContext';

import useDecisionModal from '@hooks/useDecisionModal';
import useLocalize from '@hooks/useLocalize';

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

    // A second press while the modal is up, such as a double tap on Confirm, would stack a second modal that acts on the form after the first one left it
    const isModalOpenRef = useRef(false);

    // The modal outlives the page, so its answer is ignored once the page is gone, such as after a deep link or sign-out while it was up
    const isMountedRef = useRef(true);
    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    const showContinueOfflineModal = ({onSaveForLater, onContinue}: ContinueOfflineModalOptions) => {
        if (isModalOpenRef.current) {
            return;
        }
        isModalOpenRef.current = true;

        showDecisionModal({
            title: translate('dynamicForm.continueOffline.title'),
            prompt: translate('dynamicForm.continueOffline.prompt'),
            firstOptionText: translate('dynamicForm.continueOffline.saveForLater'),
            secondOptionText: translate('common.tryAgain'),
            // A tap outside or Escape only closes the modal, while Try again checks the connection
            shouldReportDismiss: true,
        })
            .then(({action}) => {
                isModalOpenRef.current = false;
                if (!isMountedRef.current) {
                    return;
                }
                if (action === ModalActions.CONFIRM) {
                    onSaveForLater();
                    return;
                }
                if (action !== ModalActions.CLOSE) {
                    return;
                }
                return (
                    refreshAndCheckIsOffline()
                        // A failed check cannot show the connection is back, so it is treated as still offline
                        .catch(() => true)
                        .then((isStillOffline) => {
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
            })
            .catch(() => {
                isModalOpenRef.current = false;
            });
    };

    return {showContinueOfflineModal};
}

export default useContinueOfflineModal;
export type {ContinueOfflineModalOptions};
