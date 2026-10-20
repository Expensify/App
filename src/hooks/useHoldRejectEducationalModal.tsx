import HoldOrRejectEducationalModalContent from '@components/HoldOrRejectEducationalModalContent';
import HoldSubmitterEducationalModalContent from '@components/HoldSubmitterEducationalModalContent';

import variables from '@styles/variables';

import type CONST from '@src/CONST';

import type {ReactNode} from 'react';
import type {ValueOf} from 'type-fest';

import React, {useEffect, useId, useRef} from 'react';

import useFeatureTrainingModal from './useFeatureTrainingModal';
import useThemeStyles from './useThemeStyles';

/** The action the user picked before the hold/reject educational modal was shown, which decides what runs once they dismiss it */
type RejectModalAction = ValueOf<
    | typeof CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.HOLD
    | typeof CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.REJECT
    | typeof CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.REJECT_BULK
    | typeof CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.REJECT_REPORT
>;

type HoldSubmitterEducationalModalOptions = {
    /** Whether the expense is from a DM (direct message) report */
    isDM?: boolean;
};

type UseHoldRejectEducationalModalParams = {
    /** Runs once the user dismisses the hold/reject educational modal, with the action that opened it */
    onHoldOrRejectModalDismiss?: (action: RejectModalAction) => void;

    /** Runs once the user dismisses the hold submitter educational modal */
    onHoldSubmitterModalDismiss?: () => void;
};

/**
 * Opens the hold/reject educational modals on the global modal stack.
 *
 * Closing and confirming run the same dismiss handler, matching how every caller treated both before the modals moved
 * to the global stack. The handler is read when the modal is dismissed rather than when it is opened, so it acts on the
 * data the caller has at that point.
 */
const useHoldRejectEducationalModal = ({onHoldOrRejectModalDismiss, onHoldSubmitterModalDismiss}: UseHoldRejectEducationalModalParams) => {
    const styles = useThemeStyles();
    const {showFeatureTrainingModal, closeFeatureTrainingModal} = useFeatureTrainingModal();
    const instanceID = useId();
    const holdOrRejectModalID = `holdOrRejectEducationalModal${instanceID}`;
    const holdSubmitterModalID = `holdSubmitterEducationalModal${instanceID}`;

    const openModalIDsRef = useRef(new Set<string>());
    const isMountedRef = useRef(false);

    const dismissHandlersRef = useRef({onHoldOrRejectModalDismiss, onHoldSubmitterModalDismiss});
    useEffect(() => {
        dismissHandlersRef.current = {onHoldOrRejectModalDismiss, onHoldSubmitterModalDismiss};
    }, [onHoldOrRejectModalDismiss, onHoldSubmitterModalDismiss]);

    // Read through a ref so the unmount cleanup below can be registered once. The close function takes a new identity
    // whenever the modal stack changes, and an effect that listed it as a dependency would close the modal as soon
    // as it opened.
    const closeFeatureTrainingModalRef = useRef(closeFeatureTrainingModal);
    useEffect(() => {
        closeFeatureTrainingModalRef.current = closeFeatureTrainingModal;
    }, [closeFeatureTrainingModal]);

    useEffect(() => {
        isMountedRef.current = true;
        const openModalIDs = openModalIDsRef.current;
        return () => {
            // The modals live on the global modal stack, so they would outlive the screen that opened them. Close
            // them with it, without running the dismiss handler, which belongs to a screen that is no longer there.
            isMountedRef.current = false;
            for (const modalID of openModalIDs) {
                closeFeatureTrainingModalRef.current(modalID);
            }
            openModalIDs.clear();
        };
    }, []);

    const openModal = (modalID: string, children: ReactNode, onDismiss: () => void) => {
        // A second tap while the modal is open must not run the dismiss handler twice
        if (openModalIDsRef.current.has(modalID)) {
            return;
        }
        openModalIDsRef.current.add(modalID);
        showFeatureTrainingModal({
            id: modalID,
            width: variables.holdEducationModalWidth,
            modalInnerContainerStyle: styles.pt0,
            shouldCloseOnConfirm: false,
            shouldUseScrollView: true,
            children,
        }).then(() => {
            openModalIDsRef.current.delete(modalID);
            if (!isMountedRef.current) {
                return;
            }
            onDismiss();
        });
    };

    const showHoldOrRejectEducationalModal = (action: RejectModalAction) => {
        openModal(holdOrRejectModalID, <HoldOrRejectEducationalModalContent />, () => dismissHandlersRef.current.onHoldOrRejectModalDismiss?.(action));
    };

    const showHoldSubmitterEducationalModal = (options?: HoldSubmitterEducationalModalOptions) => {
        openModal(holdSubmitterModalID, <HoldSubmitterEducationalModalContent isDM={options?.isDM} />, () => dismissHandlersRef.current.onHoldSubmitterModalDismiss?.());
    };

    return {showHoldOrRejectEducationalModal, showHoldSubmitterEducationalModal};
};

export default useHoldRejectEducationalModal;
export type {RejectModalAction};
