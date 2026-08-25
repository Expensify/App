import ConnectionStatusBadge from '@components/ConnectionStatusBadge';
import ConnectionStatusMessage from '@components/ConnectionStatusMessage';
import Hoverable from '@components/Hoverable';
import getBankIcon from '@components/Icon/BankIcons';
import type {BankName} from '@components/Icon/BankIconsUtils';
import {useLockedAccountActions, useLockedAccountState} from '@components/LockedAccountModalProvider';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import RenderHTML from '@components/RenderHTML';
import Text from '@components/Text';

import useConfirmModal from '@hooks/useConfirmModal';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDelegateAccountID from '@hooks/useDelegateAccountID';
import useIsGlobalReimbursementFXEnabled from '@hooks/useIsGlobalReimbursementFXEnabled';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePersonalDetailByLogin from '@hooks/usePersonalDetailByLogin';
import usePolicy from '@hooks/usePolicy';
import usePolicyFeatureWriteAccess from '@hooks/usePolicyFeatureWriteAccess';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearPolicyErrorField, isCurrencySupportedForDirectReimbursement, isCurrencySupportedForGlobalReimbursement, setWorkspaceReimbursement} from '@libs/actions/Policy/Policy';
import {getBankAccountConnectionStatus, isBankAccountPartiallySetup} from '@libs/BankAccountUtils';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getPaymentMethodDescription} from '@libs/PaymentUtils';
import {temporaryGetDisplayNameOrDefault} from '@libs/PersonalDetailsUtils';
import {isPolicyAdmin, isSubmitPolicy} from '@libs/PolicyUtils';
import {hasInProgressVBBA} from '@libs/ReimbursementAccountUtils';
import {getEligibleExistingBusinessBankAccounts} from '@libs/WorkflowUtils';

import {pressLockedBankAccount} from '@userActions/BankAccounts';
import {navigateToBankAccountRoute} from '@userActions/ReimbursementAccount';
import {navigateToConciergeChat} from '@userActions/Report';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import type {TupleToUnion} from 'type-fest';

import {hasSeenTourSelector} from '@selectors/Onboarding';
import React, {useCallback} from 'react';
import {View} from 'react-native';

import WorkflowsSectionCard from './WorkflowsSectionCard';

type CurrencyType = TupleToUnion<typeof CONST.DIRECT_REIMBURSEMENT_CURRENCIES>;

type WorkflowsPaymentsTabProps = {
    policyID: string;
};

function WorkflowsPaymentsTab({policyID}: WorkflowsPaymentsTabProps) {
    const {translate, formatPhoneNumber} = useLocalize();
    const styles = useThemeStyles();
    const policy = usePolicy(policyID);
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['DotIndicator', 'Plus']);
    const {showConfirmModal} = useConfirmModal();
    const {isOffline} = useNetwork();
    const {isBetaEnabled} = usePermissions();
    const isGlobalReimbursementFXEnabled = useIsGlobalReimbursementFXEnabled();
    const isWalletConnectionStatusBetaEnabled = isBetaEnabled(CONST.BETAS.WALLET_CONNECTION_STATUS);

    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [isSelfTourViewed] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {
        selector: hasSeenTourSelector,
    });

    const delegateAccountID = useDelegateAccountID();
    const {accountID: currentUserAccountID, login: currentUserLogin = ''} = useCurrentUserPersonalDetails();
    const isUserReimburser = account?.primaryLogin !== undefined && (policy?.achAccount?.reimburser ?? policy?.owner) === account?.primaryLogin;
    const {
        canWrite: canWritePayments,
        showReadOnlyModal,
        withReadOnlyFallback: withPaymentsReadOnlyFallback,
    } = usePolicyFeatureWriteAccess(policy, CONST.POLICY.POLICY_FEATURE.WORKFLOWS_PAYMENTS);
    const {isAccountLocked} = useLockedAccountState();
    const {showLockedAccountModal} = useLockedAccountActions();

    const isSubmitPolicyWorkspace = isSubmitPolicy(policy);
    const hasValidExistingAccounts = getEligibleExistingBusinessBankAccounts(bankAccountList, policy?.outputCurrency, true).length > 0;

    const policyReimburserEmail = policy?.achAccount?.reimburser ?? policy?.owner;
    const displayNameForAuthorizedPayer = usePersonalDetailByLogin(policyReimburserEmail, (details) =>
        temporaryGetDisplayNameOrDefault({
            passedPersonalDetails: details,
            defaultValue: policyReimburserEmail,
            translate,
            formatPhoneNumber,
        }),
    );

    const isNonUSDWorkspace = policy?.outputCurrency !== CONST.CURRENCY.USD;
    const achData = reimbursementAccount?.achData;
    const shouldShowContinueModal = hasInProgressVBBA(achData, isNonUSDWorkspace, policy?.id);

    const showAddBankAccountPermissionModal = useCallback(() => {
        showConfirmModal({
            title: translate('workspace.bankAccount.workspaceCurrencyNotSupported'),
            prompt: translate('workspace.bankAccount.notAllowedToAddBankAccount'),
            confirmText: translate('common.buttonConfirm'),
            shouldShowCancelButton: false,
        });
    }, [showConfirmModal, translate]);

    const confirmCurrencyChangeAndHideModal = useCallback(() => {
        if (!policy) {
            return;
        }
        Navigation.navigate(ROUTES.WORKSPACE_OVERVIEW_CURRENCY.getRoute(policy.id, true));
    }, [policy]);

    const workflowsBackTo = ROUTES.WORKSPACE_WORKFLOWS.getRoute(policyID);

    const isBankAccountFullySetup = policy?.achAccount && (policy?.achAccount.state === CONST.BANK_ACCOUNT.STATE.OPEN || policy?.achAccount.state === CONST.BANK_ACCOUNT.STATE.LOCKED);
    const bankAccountConnectedToWorkspace = Object.values(bankAccountList ?? {}).find((bankAccount) => bankAccount?.accountData?.additionalData?.policyID === policy?.id);
    const bankName = isBankAccountFullySetup ? (policy?.achAccount?.bankName ?? '') : (bankAccountConnectedToWorkspace?.accountData?.additionalData?.bankName ?? '');
    const addressName = isBankAccountFullySetup ? (policy?.achAccount?.addressName ?? '') : (bankAccountConnectedToWorkspace?.accountData?.addressName ?? '');
    const accountData = isBankAccountFullySetup ? policy?.achAccount : bankAccountConnectedToWorkspace?.accountData;
    const bankTitle = addressName.includes(CONST.MASKED_PAN_PREFIX) ? bankName : addressName;
    const bankAccountID = isBankAccountFullySetup ? policy?.achAccount?.bankAccountID : bankAccountConnectedToWorkspace?.methodID;
    const state = isBankAccountFullySetup ? (policy?.achAccount?.state ?? '') : (bankAccountConnectedToWorkspace?.accountData?.state ?? '');
    const isAccountInSetupState = isBankAccountPartiallySetup(state);
    const isBusinessBankAccountLocked = state === CONST.BANK_ACCOUNT.STATE.LOCKED;
    const canChangePayer = canWritePayments && !isAccountInSetupState;
    const hasOtherEligibleExistingAccounts = getEligibleExistingBusinessBankAccounts(bankAccountList, policy?.outputCurrency, true, bankAccountID).length > 0;

    const shouldShowBankAccount = (!!isBankAccountFullySetup || !!bankAccountConnectedToWorkspace) && policy?.reimbursementChoice !== CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO;
    const shouldShowPayer = shouldShowBankAccount || policy?.reimbursementChoice === CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_MANUAL;
    const bankAccountPendingAction = bankAccountConnectedToWorkspace?.pendingAction;
    const isBankAccountPendingDelete = bankAccountPendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;

    const bankIcon = getBankIcon({
        bankName: bankName as BankName,
        isCard: false,
        styles,
    });

    const hasReimburserError = !!policy?.errorFields?.reimburser;
    const getBadgeText = (accountState: string | undefined) => {
        switch (accountState) {
            case CONST.BANK_ACCOUNT.STATE.SETUP:
                return translate('common.actionRequired');
            case CONST.BANK_ACCOUNT.STATE.LOCKED:
                return translate('common.locked');
            default:
                return undefined;
        }
    };
    // `||` not `??`: bankCurrency can be an empty string, which should fall through to additionalData.
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const bankAccountCurrency = bankAccountConnectedToWorkspace?.bankCurrency || bankAccountConnectedToWorkspace?.accountData?.additionalData?.currency;
    const bankConnectionStatus = isWalletConnectionStatusBetaEnabled ? getBankAccountConnectionStatus(state, bankAccountCurrency) : undefined;
    const bankConnectionBrickRoadIndicator = bankConnectionStatus?.brickRoadIndicator ?? (hasReimburserError ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined);
    const bankConnectionStatusAddon = bankConnectionStatus ? (
        <ConnectionStatusBadge
            text={translate(bankConnectionStatus.labelKey)}
            tone={bankConnectionStatus.tone}
            tooltipText={bankConnectionStatus.tooltipKey ? translate(bankConnectionStatus.tooltipKey) : undefined}
        />
    ) : undefined;
    const bankConnectionMessage = bankConnectionStatus?.messageKey ? translate(bankConnectionStatus.messageKey) : undefined;
    const bankConnectionActionText = bankConnectionStatus?.actionKey ? translate(bankConnectionStatus.actionKey) : undefined;
    const canInteractWithBankAccountRow = canWritePayments && !isOffline && !isBankAccountPendingDelete;
    // Only the reimburser can send the unlock request, so a locked account offers no action to anyone else rather than
    // an Unlock button that would instead start connecting a different bank account.
    const canPerformBankAccountAction = !isBusinessBankAccountLocked || isUserReimburser;

    const updateWorkspaceCurrencyPrompt = (
        <View style={[styles.renderHTML, styles.flexRow]}>
            <RenderHTML html={translate('workspace.bankAccount.yourWorkspace')} />
        </View>
    );

    const handleBankAccountPress = () => {
        if (isAccountLocked) {
            showLockedAccountModal();
            return;
        }
        // User who is reimburser can initiate unlocking process
        if (state === CONST.BANK_ACCOUNT.STATE.LOCKED && bankAccountID && isUserReimburser) {
            pressLockedBankAccount(bankAccountID, translate, conciergeReportID ?? undefined, delegateAccountID);
            navigateToConciergeChat(conciergeReportID ?? undefined, introSelected, currentUserAccountID, isSelfTourViewed, betas);
            return;
        }

        // A non-reimburser can't edit or unlock the workspace's connected account, so if they have another
        // eligible existing account and no setup in progress, let them link it (change the workspace's account).
        if (!isUserReimburser && hasOtherEligibleExistingAccounts && !shouldShowContinueModal) {
            Navigation.navigate(ROUTES.BANK_ACCOUNT_CONNECT_EXISTING_BUSINESS_BANK_ACCOUNT.getRoute(policyID));
            return;
        }

        navigateToBankAccountRoute({
            policyID,
            backTo: workflowsBackTo,
        });
    };

    let bankAccountMenuItemOnPress: React.ComponentProps<typeof MenuItem>['onPress'];
    if (isWalletConnectionStatusBetaEnabled) {
        bankAccountMenuItemOnPress = canInteractWithBankAccountRow ? handleBankAccountPress : undefined;
    } else {
        bankAccountMenuItemOnPress = canWritePayments ? handleBankAccountPress : undefined;
    }

    const bankAccountMenuItemProps: React.ComponentProps<typeof MenuItem> = {
        title: bankTitle,
        description: getPaymentMethodDescription(CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT, accountData, translate),
        onPress: bankAccountMenuItemOnPress,
        displayInDefaultIconColor: true,
        icon: bankIcon.icon,
        iconHeight: bankIcon.iconHeight ?? bankIcon.iconSize,
        iconWidth: bankIcon.iconWidth ?? bankIcon.iconSize,
        iconStyles: bankIcon.iconStyles,
        titleStyle: isBankAccountPendingDelete ? styles.offlineFeedbackDeleted : undefined,
        descriptionTextStyle: isBankAccountPendingDelete ? styles.offlineFeedbackDeleted : undefined,
        sentryLabel: CONST.SENTRY_LABEL.WORKSPACE.WORKFLOWS.BANK_ACCOUNT,
        shouldGreyOutWhenDisabled: !policy?.pendingFields?.reimbursementChoice,
        ...(isWalletConnectionStatusBetaEnabled
            ? {
                  disabled: isOffline || !canWritePayments || isBankAccountPendingDelete,
                  shouldShowRightIcon: canWritePayments && !isBankAccountPendingDelete,
                  interactive: canWritePayments && !isBankAccountPendingDelete,
                  descriptionAddon: bankConnectionStatusAddon,
                  shouldRemoveBackground: true,
                  shouldRemoveHoverBackground: true,
                  wrapperStyle: styles.ph0,
                  brickRoadIndicator: bankConnectionMessage ? undefined : bankConnectionBrickRoadIndicator,
              }
            : {
                  disabled: isOffline || !canWritePayments,
                  shouldShowRightIcon: canWritePayments,
                  interactive: canWritePayments,
                  badgeIcon: isAccountInSetupState || (isBusinessBankAccountLocked && canWritePayments) ? expensifyIcons.DotIndicator : undefined,
                  badgeText: getBadgeText(accountData?.state),
                  isBadgeSuccess: isAccountInSetupState,
                  isBadgeError: isBusinessBankAccountLocked && canWritePayments,
                  wrapperStyle: [styles.sectionMenuItemTopDescription, styles.mt3, styles.mbn3],
                  brickRoadIndicator: hasReimburserError ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
              }),
    };
    const bankAccountMenuItem = <MenuItem {...bankAccountMenuItemProps} />;

    return (
        <WorkflowsSectionCard
            title={translate('workflowsPage.makeOrTrackPaymentsTitle')}
            subtitle={translate('workflowsPage.makeOrTrackPaymentsDescription')}
            switchAccessibilityLabel={translate('workflowsPage.makeOrTrackPaymentsDescription')}
            onToggle={(isEnabled: boolean) => {
                if (!canWritePayments) {
                    showReadOnlyModal();
                    return;
                }
                if (isEnabled && isSubmitPolicyWorkspace) {
                    Navigation.navigate(ROUTES.WORKSPACE_UPGRADE.getRoute(policyID, CONST.UPGRADE_FEATURE_INTRO_MAPPING.payments.alias, workflowsBackTo));
                    return;
                }
                let newReimbursementChoice;
                if (!isEnabled) {
                    newReimbursementChoice = CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO;
                } else if ((!isBankAccountFullySetup && !bankAccountConnectedToWorkspace) || !isCurrencySupportedForDirectReimbursement(policy?.outputCurrency ?? '')) {
                    newReimbursementChoice = CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_MANUAL;
                } else {
                    newReimbursementChoice = CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES;
                }

                const newReimburserEmail = policy?.achAccount?.reimburser ?? policy?.owner;
                setWorkspaceReimbursement({
                    policyID,
                    currentAchAccount: policy?.achAccount,
                    currentReimbursementChoice: policy?.reimbursementChoice,
                    reimbursementChoice: newReimbursementChoice,
                    reimburserEmail: newReimburserEmail ?? '',
                    bankAccountID: policy?.achAccount?.bankAccountID,
                    accountNumber: policy?.achAccount?.accountNumber,
                    addressName: policy?.achAccount?.addressName,
                    bankName: policy?.achAccount?.bankName,
                    state: policy?.achAccount?.state,
                });
            }}
            subMenuItems={
                <>
                    {shouldShowBankAccount ? (
                        <OfflineWithFeedback pendingAction={bankAccountPendingAction}>
                            <View style={[styles.sectionMenuItemTopDescription, styles.mt5, styles.pb1, styles.pt1]}>
                                <Text style={[styles.textLabelSupportingNormal, styles.colorMuted]}>{translate('workflowsPayerPage.paymentAccount')}</Text>
                            </View>
                            {isWalletConnectionStatusBetaEnabled ? (
                                <Hoverable>
                                    {(isHovered) => (
                                        <View style={[styles.sectionMenuItemTopDescription, styles.mt3, styles.mbn3, isHovered && styles.hoveredComponentBG]}>
                                            {bankAccountMenuItem}
                                            {!!bankConnectionMessage && (
                                                <View style={styles.mb2}>
                                                    <ConnectionStatusMessage
                                                        message={bankConnectionMessage}
                                                        actionText={bankConnectionActionText}
                                                        onActionPress={canWritePayments && canPerformBankAccountAction ? handleBankAccountPress : undefined}
                                                        isActionDisabled={!canInteractWithBankAccountRow}
                                                        statusTone="danger"
                                                        shouldIncludeHorizontalPadding={false}
                                                    />
                                                </View>
                                            )}
                                        </View>
                                    )}
                                </Hoverable>
                            ) : (
                                bankAccountMenuItem
                            )}
                        </OfflineWithFeedback>
                    ) : (
                        canWritePayments && (
                            <MenuItem
                                title={translate('bankAccount.addBankAccount')}
                                titleStyle={styles.textStrong}
                                onPress={() => {
                                    if (isAccountLocked) {
                                        showLockedAccountModal();
                                        return;
                                    }
                                    if (!isCurrencySupportedForGlobalReimbursement((policy?.outputCurrency ?? '') as CurrencyType)) {
                                        if (!isPolicyAdmin(policy, currentUserLogin)) {
                                            showAddBankAccountPermissionModal();
                                            return;
                                        }
                                        showConfirmModal({
                                            title: translate('workspace.bankAccount.workspaceCurrencyNotSupported'),
                                            prompt: updateWorkspaceCurrencyPrompt,
                                            confirmText: translate('workspace.bankAccount.updateWorkspaceCurrency'),
                                            cancelText: translate('common.cancel'),
                                        }).then((result) => {
                                            if (result.action !== ModalActions.CONFIRM) {
                                                return;
                                            }
                                            confirmCurrencyChangeAndHideModal();
                                        });

                                        return;
                                    }
                                    if (!shouldShowBankAccount && hasValidExistingAccounts && !shouldShowContinueModal) {
                                        Navigation.navigate(ROUTES.BANK_ACCOUNT_CONNECT_EXISTING_BUSINESS_BANK_ACCOUNT.getRoute(policyID, workflowsBackTo));
                                        return;
                                    }
                                    navigateToBankAccountRoute({
                                        policyID,
                                        backTo: workflowsBackTo,
                                    });
                                }}
                                icon={expensifyIcons.Plus}
                                iconHeight={20}
                                iconWidth={20}
                                shouldShowRightIcon
                                disabled={isOffline || !canWritePayments}
                                shouldGreyOutWhenDisabled={!policy?.pendingFields?.reimbursementChoice}
                                sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.WORKFLOWS.ADD_BANK_ACCOUNT}
                                wrapperStyle={[styles.sectionMenuItemTopDescription, styles.mt3, styles.mbn3]}
                                brickRoadIndicator={hasReimburserError ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                            />
                        )
                    )}
                    {shouldShowPayer && (
                        <OfflineWithFeedback
                            pendingAction={policy?.pendingFields?.reimburser}
                            shouldDisableOpacity={isOffline && !!policy?.pendingFields?.reimbursementChoice && !!policy?.pendingFields?.reimburser}
                            errors={getLatestErrorField(policy ?? {}, CONST.POLICY.COLLECTION_KEYS.REIMBURSER)}
                            onClose={() => clearPolicyErrorField(policy?.id, CONST.POLICY.COLLECTION_KEYS.REIMBURSER)}
                            errorRowStyles={[styles.ml7]}
                        >
                            <MenuItemWithTopDescription
                                title={displayNameForAuthorizedPayer ?? ''}
                                titleStyle={styles.textNormalThemeText}
                                descriptionTextStyle={styles.textLabelSupportingNormal}
                                description={translate('workflowsPayerPage.payer')}
                                onPress={canChangePayer ? () => Navigation.navigate(ROUTES.WORKSPACE_WORKFLOWS_PAYER.getRoute(policyID)) : undefined}
                                sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.WORKFLOWS.AUTHORIZED_PAYER}
                                shouldShowRightIcon={canChangePayer}
                                interactive={canChangePayer}
                                wrapperStyle={[styles.sectionMenuItemTopDescription, styles.mt3, styles.mbn3]}
                                brickRoadIndicator={hasReimburserError ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                            />
                        </OfflineWithFeedback>
                    )}
                    {policy?.reimbursementChoice === CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES && canWritePayments && isGlobalReimbursementFXEnabled && (
                        <OfflineWithFeedback
                            pendingAction={policy?.pendingFields?.globalReimbursementFXPreferCompany}
                            errors={getLatestErrorField(policy ?? {}, CONST.POLICY.COLLECTION_KEYS.GLOBAL_REIMBURSEMENT_FX_PREFER_COMPANY)}
                            onClose={() => clearPolicyErrorField(policy?.id, CONST.POLICY.COLLECTION_KEYS.GLOBAL_REIMBURSEMENT_FX_PREFER_COMPANY)}
                            errorRowStyles={[styles.mt3]}
                        >
                            <MenuItemWithTopDescription
                                title={
                                    policy?.globalReimbursementFXPreferCompany
                                        ? translate('workflowsCurrencyConversionFeesPage.companyPays')
                                        : translate('workflowsCurrencyConversionFeesPage.employeePays')
                                }
                                titleStyle={styles.textNormalThemeText}
                                descriptionTextStyle={styles.textLabelSupportingNormal}
                                description={translate('workflowsCurrencyConversionFeesPage.title')}
                                onPress={() => Navigation.navigate(ROUTES.WORKSPACE_WORKFLOWS_CURRENCY_CONVERSION_FEES.getRoute(policyID))}
                                sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.WORKFLOWS.CURRENCY_CONVERSION_FEES}
                                shouldShowRightIcon
                                wrapperStyle={[styles.sectionMenuItemTopDescription, styles.mt3, styles.mbn3]}
                            />
                        </OfflineWithFeedback>
                    )}
                </>
            }
            isActive={policy?.reimbursementChoice !== CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO}
            pendingAction={policy?.pendingFields?.reimbursementChoice}
            errors={getLatestErrorField(policy ?? {}, CONST.POLICY.COLLECTION_KEYS.REIMBURSEMENT_CHOICE)}
            onCloseError={() => clearPolicyErrorField(policyID, CONST.POLICY.COLLECTION_KEYS.REIMBURSEMENT_CHOICE)}
            disabled={!canWritePayments}
            disabledAction={withPaymentsReadOnlyFallback()}
            showLockIcon={!canWritePayments}
        />
    );
}

export default WorkflowsPaymentsTab;
