import React, {useCallback, useMemo, useRef, useState} from 'react';
import type {TupleToUnion} from 'type-fest';
import ConfirmModal from '@components/ConfirmModal';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import Section from '@components/Section';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePaymentMethodState from '@hooks/usePaymentMethodState';
import type {FormattedSelectedPaymentMethod} from '@hooks/usePaymentMethodState/types';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {isCurrencySupportedForGlobalReimbursement} from '@libs/actions/Policy/Policy';
import {navigateToBankAccountRoute} from '@libs/actions/ReimbursementAccount';
import Navigation from '@libs/Navigation/Navigation';
import {formatPaymentMethods, getPaymentMethodDescription} from '@libs/PaymentUtils';
import {hasInProgressVBBA} from '@libs/ReimbursementAccountUtils';
import {getEligibleExistingBusinessBankAccounts} from '@libs/WorkflowUtils';
import PaymentMethodList from '@pages/settings/Wallet/PaymentMethodList';
import type {PaymentMethodPressHandlerParams} from '@pages/settings/Wallet/WalletPage/types';
import {deletePaymentBankAccount} from '@userActions/BankAccounts';
import {close as closeModal} from '@userActions/Modal';
import {setInvoicingTransferBankAccount} from '@userActions/PaymentMethods';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

type WorkspaceInvoiceVBASectionProps = {
    /** The policy ID currently being configured */
    policyID: string;
};

type CurrencyType = TupleToUnion<typeof CONST.DIRECT_REIMBURSEMENT_CURRENCIES>;

// TODO: can be refactored to use ThreeDotsMenu component instead handling the popover and positioning
function WorkspaceInvoiceVBASection({policyID}: WorkspaceInvoiceVBASectionProps) {
    const icons = useMemoizedLazyExpensifyIcons(['Star', 'Trashcan']);
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {translate} = useLocalize();
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {canBeMissing: true});
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST, {canBeMissing: true});
    const [personalPolicyID] = useOnyx(ONYXKEYS.PERSONAL_POLICY_ID, {canBeMissing: true});
    const {paymentMethod, setPaymentMethod, resetSelectedPaymentMethodData} = usePaymentMethodState();
    const paymentMethodButtonRef = useRef<HTMLDivElement | null>(null);
    const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
    // Determines whether or not the modal popup is mounted from the bottom of the screen instead of the side mount on Web screen
    const isPopoverBottomMount = shouldUseNarrowLayout;
    const shouldShowMakeDefaultButton = !paymentMethod.isSelectedPaymentMethodDefault;
    const transferBankAccountID = policy?.invoice?.bankAccount?.transferBankAccountID ?? CONST.DEFAULT_NUMBER_ID;
    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {canBeMissing: true});
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT, {canBeMissing: true});
    const [isUpdateWorkspaceCurrencyModalOpen, setIsUpdateWorkspaceCurrencyModalOpen] = useState(false);

    const hasValidExistingAccounts = getEligibleExistingBusinessBankAccounts(bankAccountList, policy?.outputCurrency).length > 0;
    const isSupportedGlobalReimbursement = isCurrencySupportedForGlobalReimbursement((policy?.outputCurrency ?? '') as CurrencyType);

    const isNonUSDWorkspace = policy?.outputCurrency !== CONST.CURRENCY.USD;
    const achData = reimbursementAccount?.achData;
    const nonUSDCountryDraftValue = reimbursementAccountDraft?.country ?? '';

    const shouldShowContinueModal = useMemo(() => {
        return hasInProgressVBBA(achData, isNonUSDWorkspace, nonUSDCountryDraftValue);
    }, [achData, isNonUSDWorkspace, nonUSDCountryDraftValue]);

    const confirmCurrencyChangeAndHideModal = useCallback(() => {
        if (!policy) {
            return;
        }

        setIsUpdateWorkspaceCurrencyModalOpen(false);

        Navigation.navigate(ROUTES.WORKSPACE_OVERVIEW_CURRENCY.getRoute(policy.id, true));
    }, [policy]);

    /**
     * Display the delete/default menu, or the add payment method menu
     */
    const paymentMethodPressed = ({event, accountData, accountType, methodID, icon, description}: PaymentMethodPressHandlerParams) => {
        paymentMethodButtonRef.current = event?.currentTarget as HTMLDivElement;

        // The delete/default menu
        if (accountType) {
            let formattedSelectedPaymentMethod: FormattedSelectedPaymentMethod = {
                title: '',
            };
            if (accountType === CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT) {
                formattedSelectedPaymentMethod = {
                    title: accountData?.addressName ?? '',
                    icon,
                    description: description ?? getPaymentMethodDescription(accountType, accountData, translate),
                    type: CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT,
                };
            }
            setPaymentMethod({
                isSelectedPaymentMethodDefault: transferBankAccountID === methodID,
                selectedPaymentMethod: accountData ?? {},
                selectedPaymentMethodType: accountType,
                formattedSelectedPaymentMethod,
                methodID: methodID ?? CONST.DEFAULT_NUMBER_ID,
            });
        }
    };

    const hideDeleteModal = useCallback(() => {
        setShowConfirmDeleteModal(false);
    }, []);

    const deletePaymentMethod = useCallback(() => {
        const bankAccountID = paymentMethod.selectedPaymentMethod.bankAccountID;
        if (paymentMethod.selectedPaymentMethodType === CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT && bankAccountID) {
            deletePaymentBankAccount(bankAccountID, personalPolicyID);
        }
        hideDeleteModal();
    }, [paymentMethod.selectedPaymentMethod.bankAccountID, paymentMethod.selectedPaymentMethodType, personalPolicyID, hideDeleteModal]);

    const makeDefaultPaymentMethod = useCallback(() => {
        // Find the previous default payment method so we can revert if the MakeDefaultPaymentMethod command errors
        const paymentMethods = formatPaymentMethods(bankAccountList ?? {}, {}, styles, translate);
        const previousPaymentMethod = paymentMethods.find((method) => !!method.isDefault);
        const currentPaymentMethod = paymentMethods.find((method) => method.methodID === paymentMethod.methodID);
        if (paymentMethod.selectedPaymentMethodType === CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT) {
            setInvoicingTransferBankAccount(currentPaymentMethod?.methodID ?? CONST.DEFAULT_NUMBER_ID, policyID, previousPaymentMethod?.methodID ?? CONST.DEFAULT_NUMBER_ID);
        }
        resetSelectedPaymentMethodData();
    }, [bankAccountList, styles, translate, paymentMethod.selectedPaymentMethodType, paymentMethod.methodID, policyID, resetSelectedPaymentMethodData]);

    const onBankAccountRowPressed = ({accountData}: PaymentMethodPressHandlerParams) => {
        const accountPolicyID = accountData?.additionalData?.policyID;

        if (accountPolicyID) {
            navigateToBankAccountRoute(accountPolicyID, ROUTES.WORKSPACE_INVOICES.getRoute(policyID));
        }
    };

    const onAddBankAccountPress = () => {
        if (!isSupportedGlobalReimbursement) {
            setIsUpdateWorkspaceCurrencyModalOpen(true);
            return;
        }

        if (hasValidExistingAccounts && !shouldShowContinueModal) {
            Navigation.navigate(ROUTES.BANK_ACCOUNT_CONNECT_EXISTING_BUSINESS_BANK_ACCOUNT.getRoute(policyID));
            return;
        }
        navigateToBankAccountRoute(policyID, ROUTES.WORKSPACE_INVOICES.getRoute(policyID));
    };

    const threeDotsMenuItems = useMemo(() => {
        const items: PopoverMenuItem[] = [];

        if (isPopoverBottomMount) {
            items.push({
                text: paymentMethod.formattedSelectedPaymentMethod.title,
                icon: paymentMethod.formattedSelectedPaymentMethod.icon?.icon,
                numberOfLinesTitle: 0,
                iconHeight: paymentMethod.formattedSelectedPaymentMethod.icon?.iconHeight ?? paymentMethod.formattedSelectedPaymentMethod.icon?.iconSize,
                iconWidth: paymentMethod.formattedSelectedPaymentMethod.icon?.iconWidth ?? paymentMethod.formattedSelectedPaymentMethod.icon?.iconSize,
                iconStyles: paymentMethod.formattedSelectedPaymentMethod.icon?.iconStyles,
                description: paymentMethod.formattedSelectedPaymentMethod.description,
                wrapperStyle: [styles.mb1, styles.ph5, styles.pt5],
                interactive: false,
                displayInDefaultIconColor: true,
            });
        }

        if (shouldShowMakeDefaultButton) {
            items.push({
                text: translate('walletPage.setDefaultConfirmation'),
                icon: icons.Star,
                onSelected: () => {
                    makeDefaultPaymentMethod();
                },
                numberOfLinesTitle: 0,
            });
        }

        items.push({
            text: translate('common.delete'),
            icon: icons.Trashcan,
            onSelected: () => {
                closeModal(() => setShowConfirmDeleteModal(true));
            },
        });

        return items;
    }, [
        isPopoverBottomMount,
        paymentMethod.formattedSelectedPaymentMethod,
        shouldShowMakeDefaultButton,
        translate,
        icons.Star,
        icons.Trashcan,
        makeDefaultPaymentMethod,
        styles.mb1,
        styles.ph5,
        styles.pt5,
    ]);

    return (
        <Section
            title={translate('common.bankAccounts')}
            subtitle={translate('workspace.invoices.bankAccountsSubtitle')}
            isCentralPane
            titleStyles={styles.accountSettingsSectionTitle}
            subtitleMuted
        >
            <PaymentMethodList
                onPress={onBankAccountRowPressed}
                onAddBankAccountPress={onAddBankAccountPress}
                onThreeDotsMenuPress={paymentMethodPressed}
                shouldSkipDefaultAccountValidation={!isSupportedGlobalReimbursement}
                invoiceTransferBankAccountID={transferBankAccountID}
                activePaymentMethodID={transferBankAccountID}
                threeDotsMenuItems={threeDotsMenuItems}
                style={[styles.mt5, shouldUseNarrowLayout ? styles.mhn5 : styles.mhn8]}
                listItemStyle={shouldUseNarrowLayout ? styles.ph5 : styles.ph8}
                policyID={policyID}
                filterType={CONST.BANK_ACCOUNT.TYPE.BUSINESS}
            />
            <ConfirmModal
                isVisible={showConfirmDeleteModal}
                onConfirm={deletePaymentMethod}
                onCancel={hideDeleteModal}
                title={translate('walletPage.deleteAccount')}
                prompt={translate('walletPage.deleteConfirmation')}
                confirmText={translate('common.delete')}
                cancelText={translate('common.cancel')}
                shouldShowCancelButton
                danger
                onModalHide={resetSelectedPaymentMethodData}
            />
            <ConfirmModal
                title={translate('workspace.bankAccount.workspaceCurrency')}
                isVisible={isUpdateWorkspaceCurrencyModalOpen}
                onConfirm={confirmCurrencyChangeAndHideModal}
                onCancel={() => setIsUpdateWorkspaceCurrencyModalOpen(false)}
                prompt={translate('workspace.bankAccount.updateCurrencyPrompt')}
                confirmText={translate('workspace.bankAccount.updateToUSD')}
                cancelText={translate('common.cancel')}
                danger
            />
        </Section>
    );
}

export default WorkspaceInvoiceVBASection;
