import HoldOrRejectEducationalModal from '@components/HoldOrRejectEducationalModal';
import HoldSubmitterEducationalModal from '@components/HoldSubmitterEducationalModal';
import {useModal} from '@components/Modal/Global/ModalContext';
import {dismissRejectUseExplanation} from '@libs/actions/IOU';
import {setNameValuePair} from '@libs/actions/User';
import ONYXKEYS from '@src/ONYXKEYS';
import useOnyx from './useOnyx';

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
            component: HoldSubmitterEducationalModal,
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
            component: HoldOrRejectEducationalModal,
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
    };
};

export default useHoldEducationalModal;
