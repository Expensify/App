import {useCallback, useEffect, useRef} from 'react';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';
import type {CompanyCardFeedWithDomainID} from '@src/types/onyx';
import useConfirmModal from './useConfirmModal';
import useLocalize from './useLocalize';

type UseDuplicateFeedDetectionParams = {
    policyID: string | undefined;
    isPlaid: boolean;
};

/**
 * Detects and handles duplicate Plaid feed connections by showing a confirmation modal.
 * Returns a function that should be called when a new feed connection is detected.
 * Returns `true` if a duplicate was detected and handled, so the caller should return early.
 */
function useDuplicateFeedDetection({policyID, isPlaid}: UseDuplicateFeedDetectionParams) {
    const hasEverDetectedNewFeed = useRef(false);
    const hasShownDuplicateModal = useRef(false);
    const {showConfirmModal} = useConfirmModal();
    const {translate} = useLocalize();
    const showConfirmModalRef = useRef(showConfirmModal);
    const translateRef = useRef(translate);

    useEffect(() => {
        showConfirmModalRef.current = showConfirmModal;
    }, [showConfirmModal]);

    useEffect(() => {
        translateRef.current = translate;
    }, [translate]);

    const checkForDuplicateFeed = useCallback(
        (newFeed: CompanyCardFeedWithDomainID | undefined) => {
            if (newFeed) {
                hasEverDetectedNewFeed.current = true;
            }

            const isDuplicateFeed = !newFeed && isPlaid && !hasEverDetectedNewFeed.current;
            if (isDuplicateFeed && !hasShownDuplicateModal.current) {
                hasShownDuplicateModal.current = true;
                Navigation.closeRHPFlow();
                Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARDS.getRoute(policyID), {forceReplace: true});
                showConfirmModalRef.current({
                    title: translateRef.current('workspace.companyCards.addNewCard.duplicateFeedModal.title'),
                    prompt: translateRef.current('workspace.companyCards.addNewCard.duplicateFeedModal.prompt'),
                    confirmText: translateRef.current('common.buttonConfirm'),
                    shouldShowCancelButton: false,
                    shouldHandleNavigationBack: false,
                });
                return true;
            }

            return false;
        },
        [isPlaid, policyID],
    );

    return {checkForDuplicateFeed};
}

export default useDuplicateFeedDetection;
