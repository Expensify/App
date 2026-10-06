import {ModalActions} from '@components/Modal/Global/ModalContext';
import RenderHTML from '@components/RenderHTML';

import useCardFeeds from '@hooks/useCardFeeds';
import useConfirmModal from '@hooks/useConfirmModal';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useOutstandingBalanceGuard from '@hooks/useOutstandingBalanceGuard';
import usePayAndDowngrade from '@hooks/usePayAndDowngrade';
import usePrevious from '@hooks/usePrevious';
import useScreenBoundDynamicRoute from '@hooks/useScreenBoundDynamicRoute';
import useThemeStyles from '@hooks/useThemeStyles';

import {close as closeVisibleModal} from '@libs/actions/Modal';
import {archivePolicy, calculateBillNewDot, dismissWorkspaceError} from '@libs/actions/Policy/Policy';
import {filterInactiveCards} from '@libs/CardUtils';
import {getLatestErrorMessage} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {shouldBlockWorkspaceDeletionForInvoicifyUser} from '@libs/PolicyUtils';
import {isSubscriptionTypeOfInvoicing} from '@libs/SubscriptionUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import {canDowngradeSelector} from '@src/selectors/Account';
import {createOwnedPaidPoliciesCountsSelector} from '@src/selectors/Policy';
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
 * Onyx data needed to archive a workspace (full policy collection, card feeds, etc.)
 * is subscribed to only for the lifetime of the flow instead of re-rendering the workspaces list in the background.
 *
 * On mount (once the data is ready) it runs the pre-archive checks (Invoicify block, outstanding balance,
 * bill calculation for the last paid workspace) and then shows the archive confirmation modal.
 */
function ArchiveWorkspaceFlow({policyID, onDismiss, onArchiveComplete}: ArchiveWorkspaceFlowProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const isFocused = useIsFocused();
    const buildDynamicRoute = useScreenBoundDynamicRoute();
    const {showConfirmModal, closeModal} = useConfirmModal();

    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [policies, policiesResult] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [privateSubscription, privateSubscriptionResult] = useOnyx(ONYXKEYS.NVP_PRIVATE_SUBSCRIPTION);
    const [canDowngrade, accountResult] = useOnyx(ONYXKEYS.ACCOUNT, {selector: canDowngradeSelector});
    const [, amountOwedResult] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);
    const ownedPaidPoliciesCountsSelector = createOwnedPaidPoliciesCountsSelector(session?.accountID);
    const ownedPaidPoliciesCounts = ownedPaidPoliciesCountsSelector(policies);

    const policy = policies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`];

    const workspaceAccountID = policy?.policyAccountID ?? CONST.DEFAULT_NUMBER_ID;
    const [cardFeeds, cardFeedsResult] = useCardFeeds(policyID);
    const [cardsList, cardsListResult] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${workspaceAccountID}_${CONST.EXPENSIFY_CARD.BANK}`, {
        selector: filterInactiveCards,
    });

    const isLoadingData = isLoadingOnyxValue(policiesResult, accountResult, amountOwedResult, privateSubscriptionResult, cardFeedsResult, cardsListResult);

    const hasCardFeedOrExpensifyCard =
        !isEmptyObject(cardFeeds) ||
        !isEmptyObject(cardsList) ||
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- both flags are `boolean | undefined`, so we need a logical OR here; `??` would stop at an explicit `false` and never check the second flag
        ((policy?.areExpensifyCardsEnabled || policy?.areCompanyCardsEnabled) && policy?.policyAccountID);
    const hasExpensifyCardsEnabledOnWorkspace = !!policy?.areExpensifyCardsEnabled && !!policy?.policyAccountID;

    const policyLatestErrorMessage = getLatestErrorMessage(policy);
    const isPendingArchive = !!policy?.archivedDate && !!policy?.pendingAction;
    const prevIsPendingArchive = usePrevious(isPendingArchive);

    const shouldCalculateBillNewDot = !!canDowngrade && ownedPaidPoliciesCounts?.total === 1;
    const {shouldBlockDeletion} = useOutstandingBalanceGuard({ownedPaidPoliciesCount: ownedPaidPoliciesCounts?.active ?? 0, isArchiving: true, onModalDismissed: onDismiss});

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

    const {setIsDeletingPaidWorkspace} = usePayAndDowngrade(continueArchiveWorkspace);

    const hasStartedRef = useRef(false);
    useEffect(() => {
        if (hasStartedRef.current || isLoadingData) {
            return;
        }
        hasStartedRef.current = true;

        if (shouldBlockWorkspaceDeletionForInvoicifyUser(isSubscriptionTypeOfInvoicing(privateSubscription?.type), policies, policyID, session?.accountID)) {
            Navigation.navigate(buildDynamicRoute(DYNAMIC_ROUTES.SUBSCRIPTION_DOWNGRADE_BLOCKED.path));
            onDismiss();
            return;
        }

        if (shouldBlockDeletion()) {
            return;
        }

        if (shouldCalculateBillNewDot) {
            setIsDeletingPaidWorkspace(true);
            calculateBillNewDot();
            return;
        }

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
