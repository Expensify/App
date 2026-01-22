import {useModal} from '@components/Modal/Global/ModalContext';
import HoldOrRejectEducationalModalWrapper from '@components/Modal/Global/HoldOrRejectEducationalModalWrapper';
import HoldSubmitterEducationalModalWrapper from '@components/Modal/Global/HoldSubmitterEducationalModalWrapper';
import useOnyx from '@hooks/useOnyx';
import {dismissRejectUseExplanation} from '@libs/actions/IOU';
import {setNameValuePair} from '@libs/actions/User';
import ONYXKEYS from '@src/ONYXKEYS';

const useHoldEducationalModal = () => {
    const context = useModal();
    const [dismissedHoldUseExplanation] = useOnyx(ONYXKEYS.NVP_DISMISSED_HOLD_USE_EXPLANATION);
    const [dismissedRejectUseExplanation] = useOnyx(ONYXKEYS.NVP_DISMISSED_REJECT_USE_EXPLANATION);

    /**
     * Show the submitter educational modal (for users holding their own expense).
     * Checks NVP first - if already dismissed, resolves immediately.
     * Updates NVP after user confirms.
     */
    const showSubmitterEducationalModal = async () => {
        if (dismissedHoldUseExplanation) {
            return; // Already dismissed, no need to show
        }

        await context.showModal({
            component: HoldSubmitterEducationalModalWrapper,
            props: {},
        });

        // Update NVP after confirmation
        setNameValuePair(ONYXKEYS.NVP_DISMISSED_HOLD_USE_EXPLANATION, true, false, true);
    };

    /**
     * Show the approver educational modal (for approvers about to hold/reject).
     * Checks NVP first - if already dismissed, resolves immediately.
     * Updates NVP after user confirms.
     */
    const showApproverEducationalModal = async () => {
        if (dismissedRejectUseExplanation) {
            return; // Already dismissed, no need to show
        }

        await context.showModal({
            component: HoldOrRejectEducationalModalWrapper,
            props: {},
        });

        // Update NVP after confirmation
        dismissRejectUseExplanation();
    };

    /**
     * Unified method that selects the right modal based on context.
     * @param isReportSubmitter - Whether the current user is the report submitter
     * @param isParentChatReportDM - Whether the parent chat is a DM (skips modal)
     */
    const showEducationalModalIfNeeded = async (isReportSubmitter: boolean, isParentChatReportDM: boolean) => {
        if (isParentChatReportDM) {
            return; // No educational modal for DMs
        }

        if (isReportSubmitter) {
            await showSubmitterEducationalModal();
        } else {
            await showApproverEducationalModal();
        }
    };

    return {
        showSubmitterEducationalModal,
        showApproverEducationalModal,
        showEducationalModalIfNeeded,
        isDismissedHoldExplanation: dismissedHoldUseExplanation,
        isDismissedRejectExplanation: dismissedRejectUseExplanation,
    };
};

export default useHoldEducationalModal;
