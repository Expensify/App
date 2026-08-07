import ConfirmModal from '@components/ConfirmModal';
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
import useThemeStyles from '@hooks/useThemeStyles';

import {archivePolicy, calculateBillNewDot, dismissWorkspaceError} from '@libs/actions/Policy/Policy';
import {filterInactiveCards, getCardSettings} from '@libs/CardUtils';
import {getLatestErrorMessage} from '@libs/ErrorUtils';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import {isPendingDeletePolicy, shouldBlockWorkspaceDeletionForInvoicifyUser} from '@libs/PolicyUtils';
import {isSubscriptionTypeOfInvoicing} from '@libs/SubscriptionUtils';
import {getIsTravelInvoicingEnabled, getTravelInvoicingCardSettingsKey} from '@libs/TravelInvoicingUtils';

import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import {canDowngradeSelector} from '@src/selectors/Account';
import {createOwnedPaidPoliciesCountsSelector} from '@src/selectors/Policy';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import {useIsFocused} from '@react-navigation/native';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {View} from 'react-native';

type ArchiveWorkspaceFlowProps = {
    policyID: string;
    onDismiss: () => void;
    onArchiveComplete?: () => void;
};

function ArchiveWorkspaceFlow({policyID, onDismiss, onArchiveComplete}: ArchiveWorkspaceFlowProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const isFocused = useIsFocused();
    const {showConfirmModal, closeModal} = useConfirmModal();

    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [policies, policiesResult] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
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
    const [travelCardSettings, travelCardSettingsResult] = useOnyx(getTravelInvoicingCardSettingsKey(workspaceAccountID));

    const isLoadingData = isLoadingOnyxValue(policiesResult, accountResult, amountOwedResult, privateSubscriptionResult, cardFeedsResult, cardsListResult, travelCardSettingsResult);

    const hasCardFeedOrExpensifyCard =
        !isEmptyObject(cardFeeds) ||
        !isEmptyObject(cardsList) ||
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        ((policy?.areExpensifyCardsEnabled || policy?.areCompanyCardsEnabled) && policy?.policyAccountID);
    const hasExpensifyCardsEnabledOnWorkspace = !!policy?.areExpensifyCardsEnabled && !!policy?.policyAccountID;
    const hasThirdPartyCards = !isEmptyObject(cardFeeds) && !hasExpensifyCardsEnabledOnWorkspace;
    const hasTravelInvoicingEnabledOnWorkspace = getIsTravelInvoicingEnabled(getCardSettings(travelCardSettings, CONST.TRAVEL.PROGRAM_TRAVEL_US));
    const hasArchiveExpensifyCardsError = !!hasExpensifyCardsEnabledOnWorkspace && !isEmptyObject(cardsList) && !!isOffline;

    const policyLatestErrorMessage = getLatestErrorMessage(policy);
    const isPendingArchive = !!policy?.archivedDate && !!policy?.pendingAction;
    const prevIsPendingArchive = usePrevious(isPendingArchive);

    const shouldCalculateBillNewDot = !!canDowngrade && ownedPaidPoliciesCounts?.total === 1;
    const {shouldBlockDeletion, outstandingBalanceModal} = useOutstandingBalanceGuard(ownedPaidPoliciesCounts?.active ?? 0, onDismiss);

    const [archiveError, setArchiveError] = useState<{translationKey?: TranslationPaths; message?: string}>();

    const hideArchiveErrorModal = useCallback(() => {
        dismissWorkspaceError(policyID, policy?.pendingAction);
    }, [policyID, policy?.pendingAction]);

    const dismissArchiveFlow = useCallback(() => {
        hideArchiveErrorModal();
        onDismiss();
    }, [hideArchiveErrorModal, onDismiss]);

    const closeArchiveErrorModal = useCallback(() => {
        setArchiveError(undefined);
        dismissArchiveFlow();
    }, [dismissArchiveFlow]);

    const showArchiveErrorModal = useCallback(() => {
        if (!isFocused) {
            dismissArchiveFlow();
            return;
        }

        setArchiveError({translationKey: hasExpensifyCardsEnabledOnWorkspace ? 'workspace.common.deleteOpenExpensifyCardsError' : 'workspace.common.deleteTravelInvoicingError'});
    }, [dismissArchiveFlow, hasExpensifyCardsEnabledOnWorkspace, isFocused]);

    const didCompletePendingArchive = !isOffline && prevIsPendingArchive && !isPendingArchive;
    const shouldLatchArchiveErrorModal = didCompletePendingArchive && !!policyLatestErrorMessage && isFocused;

    if (shouldLatchArchiveErrorModal && !archiveError) {
        setArchiveError(
            hasExpensifyCardsEnabledOnWorkspace || hasTravelInvoicingEnabledOnWorkspace
                ? {translationKey: hasExpensifyCardsEnabledOnWorkspace ? 'workspace.common.deleteOpenExpensifyCardsError' : 'workspace.common.deleteTravelInvoicingError'}
                : {message: policyLatestErrorMessage},
        );
    }

    const archiveErrorMessage = archiveError?.translationKey ? translate(archiveError.translationKey) : archiveError?.message;

    const archiveErrorPrompt =
        !!archiveErrorMessage && CONST.HTML_TAG_REGEX.test(archiveErrorMessage) ? (
            <View style={[styles.renderHTML, styles.flexRow]}>
                <RenderHTML
                    html={archiveErrorMessage}
                    onConciergeLinkPress={closeArchiveErrorModal}
                />
            </View>
        ) : (
            archiveErrorMessage
        );

    const getArchiveConfirmationPrompt = () => {
        if (hasExpensifyCardsEnabledOnWorkspace) {
            return translate('workspace.common.archiveWithExpensifyCardsConfirmation');
        }
        if (hasThirdPartyCards || hasCardFeedOrExpensifyCard) {
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
            danger: true,
            ...(hasArchiveExpensifyCardsError ? {} : {isConfirmLoading: isPendingArchive}),
        }).then((result) => {
            if (!policyName || result.action !== ModalActions.CONFIRM) {
                onDismiss();
                return;
            }

            archivePolicy({
                policyID,
                policyName,
            });

            if (hasArchiveExpensifyCardsError) {
                showArchiveErrorModal();
            } else if (isOffline) {
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
            Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.SUBSCRIPTION_DOWNGRADE_BLOCKED.path));
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

        closeModal();

        if (policyLatestErrorMessage) {
            if (!isFocused) {
                dismissArchiveFlow();
            }
            return;
        }

        onArchiveComplete?.();
        onDismiss();
    }, [isOffline, isPendingArchive, prevIsPendingArchive, policyLatestErrorMessage, isFocused, closeModal, dismissArchiveFlow, onArchiveComplete, onDismiss]);

    return (
        <>
            {outstandingBalanceModal}
            {/* eslint-disable-next-line @typescript-eslint/no-deprecated -- Local modal avoids stacking issues with the global confirmation modal on mobile. */}
            <ConfirmModal
                title={translate('workspace.common.archive')}
                isVisible={!!archiveErrorMessage && isFocused}
                onConfirm={closeArchiveErrorModal}
                onCancel={closeArchiveErrorModal}
                prompt={archiveErrorPrompt}
                confirmText={translate('common.buttonConfirm')}
                shouldShowCancelButton={false}
                success={false}
                shouldHandleNavigationBack={false}
            />
        </>
    );
}

export default ArchiveWorkspaceFlow;
