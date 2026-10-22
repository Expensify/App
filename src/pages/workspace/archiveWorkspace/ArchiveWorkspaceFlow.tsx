import {ModalActions} from '@components/Modal/Global/ModalContext';
import RenderHTML from '@components/RenderHTML';

import useCardFeeds from '@hooks/useCardFeeds';
import useConfirmModal from '@hooks/useConfirmModal';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePrevious from '@hooks/usePrevious';
import useThemeStyles from '@hooks/useThemeStyles';

import {close as closeVisibleModal} from '@libs/actions/Modal';
import {archivePolicy, dismissWorkspaceError} from '@libs/actions/Policy/Policy';
import {filterInactiveCards} from '@libs/CardUtils';
import {getLatestErrorMessage} from '@libs/ErrorUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import {useIsFocused} from '@react-navigation/native';
import React, {useCallback, useEffect, useRef} from 'react';
import {View} from 'react-native';

type ArchiveWorkspaceFlowProps = {
    /** ID of the workspace being archived */
    policyID: string;

    /** Called when the flow is finished or abandoned, so the parent can unmount this component */
    onDismiss: () => void;

    /** Called when the workspace has been archived (optimistically while offline, or after a successful online archive) */
    onArchiveComplete?: () => void;
};

/**
 * Self-contained workspace archive flow. It is mounted only while an archive is in progress, so all of the
 * Onyx data needed to archive a workspace (policy, card feeds, etc.) is subscribed to only for the lifetime
 * of the flow instead of re-rendering the workspaces list in the background.
 *
 * On mount (once the data is ready) it shows the archive confirmation modal. Unlike deleting, archiving doesn't
 * change the subscription or bill the user, so none of the delete flow's billing pre-checks apply here.
 */
function ArchiveWorkspaceFlow({policyID, onDismiss, onArchiveComplete}: ArchiveWorkspaceFlowProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const isFocused = useIsFocused();
    const {showConfirmModal, closeModal} = useConfirmModal();

    const [policy, policyResult] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);

    const workspaceAccountID = policy?.policyAccountID ?? CONST.DEFAULT_NUMBER_ID;
    const [cardFeeds, cardFeedsResult] = useCardFeeds(policyID);
    const [cardsList, cardsListResult] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${workspaceAccountID}_${CONST.EXPENSIFY_CARD.BANK}`, {
        selector: filterInactiveCards,
    });

    const isLoadingData = isLoadingOnyxValue(policyResult, cardFeedsResult, cardsListResult);

    const hasCardFeedOrExpensifyCard =
        !isEmptyObject(cardFeeds) ||
        !isEmptyObject(cardsList) ||
        // both flags are `boolean | undefined`, so we need a logical OR here; `??` would stop at an explicit `false` and never check the second flag
        ((policy?.areExpensifyCardsEnabled || policy?.areCompanyCardsEnabled) && policy?.policyAccountID);
    const hasExpensifyCardsEnabledOnWorkspace = !!policy?.areExpensifyCardsEnabled && !!policy?.policyAccountID;

    const policyLatestErrorMessage = getLatestErrorMessage(policy);
    const isPendingArchive = !!policy?.archivedDate && !!policy?.pendingAction;
    const prevIsPendingArchive = usePrevious(isPendingArchive);

    const hideArchiveErrorModal = useCallback(() => {
        dismissWorkspaceError(policyID, policy?.pendingAction);
    }, [policyID, policy?.pendingAction]);

    const dismissArchiveFlow = useCallback(() => {
        hideArchiveErrorModal();
        onDismiss();
    }, [hideArchiveErrorModal, onDismiss]);

    const showGenericArchiveErrorModal = useCallback(
        (errorMessage: string) => {
            if (!isFocused) {
                dismissArchiveFlow();
                return;
            }

            const prompt = CONST.HTML_TAG_REGEX.test(errorMessage) ? (
                <View style={[styles.renderHTML, styles.flexRow]}>
                    <RenderHTML
                        html={errorMessage}
                        onConciergeLinkPress={() => {
                            closeModal();
                            dismissArchiveFlow();
                        }}
                    />
                </View>
            ) : (
                errorMessage
            );

            showConfirmModal({
                title: translate('workspace.common.archive'),
                prompt,
                confirmText: translate('common.buttonConfirm'),
                shouldShowCancelButton: false,
                shouldHandleNavigationBack: false,
            }).then(() => {
                dismissArchiveFlow();
            });
        },
        [closeModal, dismissArchiveFlow, isFocused, showConfirmModal, styles.flexRow, styles.renderHTML, translate],
    );

    const getArchiveConfirmationPrompt = () => {
        if (hasExpensifyCardsEnabledOnWorkspace) {
            return translate('workspace.common.archiveWithExpensifyCardsConfirmation');
        }
        if (hasCardFeedOrExpensifyCard) {
            return translate('workspace.common.archiveWithThirdPartyCardsConfirmation');
        }
        return translate('workspace.common.archiveConfirmation');
    };

    const continueArchiveWorkspace = () => {
        const policyName = policy?.name;

        showConfirmModal({
            title: translate('workspace.common.archive'),
            prompt: getArchiveConfirmationPrompt(),
            confirmText: translate('workspace.common.archive'),
            cancelText: translate('common.cancel'),
            buttonVariant: CONST.BUTTON_VARIANT.DANGER,
            isConfirmLoading: isPendingArchive,
        }).then((result) => {
            if (result.action !== ModalActions.CONFIRM) {
                onDismiss();
                return;
            }

            archivePolicy({
                policyID,
                policyName,
            });

            if (isOffline) {
                closeModal();
                onArchiveComplete?.();
                onDismiss();
            }
        });
    };

    const hasStartedRef = useRef(false);
    useEffect(() => {
        if (hasStartedRef.current || isLoadingData) {
            return;
        }
        hasStartedRef.current = true;
        continueArchiveWorkspace();
    });

    useEffect(() => {
        if (isOffline) {
            return;
        }

        if (!prevIsPendingArchive || isPendingArchive) {
            return;
        }

        if (!policyLatestErrorMessage) {
            closeModal();
            onArchiveComplete?.();
            onDismiss();
            return;
        }

        closeVisibleModal(() => {
            showGenericArchiveErrorModal(policyLatestErrorMessage);
        }, false);
    }, [isOffline, isPendingArchive, prevIsPendingArchive, policyLatestErrorMessage, closeModal, onArchiveComplete, onDismiss, showGenericArchiveErrorModal]);

    // Every modal this flow shows is owned by the global modal stack, so the flow itself renders nothing.
    return null;
}

export default ArchiveWorkspaceFlow;
