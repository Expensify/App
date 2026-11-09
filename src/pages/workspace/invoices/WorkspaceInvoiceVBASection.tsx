import {ModalActions} from '@components/Modal/Global/ModalContext';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import Section from '@components/Section';

import useConfirmModal from '@hooks/useConfirmModal';
import useLayoutSpacing from '@hooks/useLayoutSpacing';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePaymentMethodState from '@hooks/usePaymentMethodState';
import type {FormattedSelectedPaymentMethod} from '@hooks/usePaymentMethodState/types';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useVerifyAccountAndResume from '@hooks/useVerifyAccountAndResume';

import {isCurrencySupportedForGlobalReimbursement} from '@libs/actions/Policy/Policy';
import {navigateToBankAccountRoute} from '@libs/actions/ReimbursementAccount';
import Navigation from '@libs/Navigation/Navigation';
import {getPaymentMethodDescription} from '@libs/PaymentUtils';
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

import type {TupleToUnion} from 'type-fest';

import React, {useRef} from 'react';

type WorkspaceInvoiceVBASectionProps = {
    /** The policy ID currently being configured */
    policyID: string;

    /** Whether the current user can edit miscellaneous settings. */
    canWriteMoreFeatures: boolean;

    /** Shows the read-only access modal. */
    showReadOnlyModal: () => void;
};

type CurrencyType = TupleToUnion<typeof CONST.DIRECT_REIMBURSEMENT_CURRENCIES>;

// TODO: can be refactored to use ThreeDotsMenu component instead handling the popover and positioning
function WorkspaceInvoiceVBASection({policyID, canWriteMoreFeatures, showReadOnlyModal}: WorkspaceInvoiceVBASectionProps) {
    const icons = useMemoizedLazyExpensifyIcons(['Star', 'Trashcan']);
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {cardPaddingHorizontal, cardEdgeToEdge} = useLayoutSpacing();
    const {translate} = useLocalize();
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [personalPolicyID] = useOnyx(ONYXKEYS.PERSONAL_POLICY_ID);
    const {paymentMethod, setPaymentMethod, resetSelectedPaymentMethodData} = usePaymentMethodState();
    const paymentMethodButtonRef = useRef<HTMLDivElement | null>(null);
    const {showConfirmModal} = useConfirmModal();
    // Determines whether or not the modal popup is mounted from the bottom of the screen instead of the side mount on Web screen
    const isPopoverBottomMount = shouldUseNarrowLayout;
    const transferBankAccountID = policy?.invoice?.bankAccount?.transferBankAccountID ?? CONST.DEFAULT_NUMBER_ID;
    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);

    const eligibleBusinessBankAccounts = getEligibleExistingBusinessBankAccounts(bankAccountList, policy?.outputCurrency);
    const hasValidExistingAccounts = eligibleBusinessBankAccounts.length > 0;
    const availableBankAccounts = eligibleBusinessBankAccounts.filter((account) => account.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
    const getAvailableBankAccountID = (bankAccountID: number | string) =>
        availableBankAccounts.find((account) => account.accountData?.bankAccountID === bankAccountID)?.accountData?.bankAccountID;
    // The backend saves no invoice default when an account is added and keeps it after that account is deleted, so the first available account stands in.
    const invoiceDefaultBankAccountID = getAvailableBankAccountID(transferBankAccountID) ?? availableBankAccounts.at(0)?.accountData?.bankAccountID ?? CONST.DEFAULT_NUMBER_ID;
    // The invoice default can change while a menu is open, so the menu and Make default check the current accounts, not the values captured when the menu opened.
    const selectedAvailableBankAccountID = getAvailableBankAccountID(paymentMethod.methodID);
    const shouldShowMakeDefaultButton = selectedAvailableBankAccountID !== undefined && selectedAvailableBankAccountID !== invoiceDefaultBankAccountID;
    const isSupportedGlobalReimbursement = isCurrencySupportedForGlobalReimbursement((policy?.outputCurrency ?? '') as CurrencyType);

    const isNonUSDWorkspace = policy?.outputCurrency !== CONST.CURRENCY.USD;
    const achData = reimbursementAccount?.achData;

    const shouldShowContinueModal = hasInProgressVBBA(achData, isNonUSDWorkspace, policyID);

    const confirmCurrencyChangeAndHideModal = () => {
        if (!policy) {
            return;
        }

        Navigation.navigate(ROUTES.WORKSPACE_OVERVIEW_CURRENCY.getRoute(policy.id, {isForcedToChangeCurrency: true}));
    };

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
                isSelectedPaymentMethodDefault: invoiceDefaultBankAccountID === methodID,
                selectedPaymentMethod: accountData ?? {},
                selectedPaymentMethodType: accountType,
                formattedSelectedPaymentMethod,
                methodID: methodID ?? CONST.DEFAULT_NUMBER_ID,
            });
        }
    };

    const deletePaymentMethod = () => {
        const bankAccountID = paymentMethod.selectedPaymentMethod.bankAccountID;
        if (paymentMethod.selectedPaymentMethodType !== CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT || !bankAccountID) {
            return;
        }

        const remainingAvailableBankAccountID = availableBankAccounts.find((account) => account.accountData?.bankAccountID !== bankAccountID)?.accountData?.bankAccountID;
        if (transferBankAccountID === bankAccountID && remainingAvailableBankAccountID) {
            setInvoicingTransferBankAccount(remainingAvailableBankAccountID, policyID, bankAccountID);
        }

        deletePaymentBankAccount(bankAccountID, personalPolicyID);
    };

    const makeDefaultPaymentMethod = () => {
        if (paymentMethod.selectedPaymentMethodType === CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT && selectedAvailableBankAccountID !== undefined) {
            setInvoicingTransferBankAccount(selectedAvailableBankAccountID, policyID, transferBankAccountID);
        }
        resetSelectedPaymentMethodData();
    };

    const onBankAccountRowPressed = ({accountData}: PaymentMethodPressHandlerParams) => {
        const accountPolicyID = accountData?.additionalData?.policyID;

        if (accountPolicyID) {
            navigateToBankAccountRoute({policyID: accountPolicyID, backTo: ROUTES.WORKSPACE_INVOICES.getRoute(policyID)});
        }
    };

    const continueAddBankAccountFlow = () => {
        if (hasValidExistingAccounts && !shouldShowContinueModal) {
            Navigation.navigate(ROUTES.BANK_ACCOUNT_CONNECT_EXISTING_BUSINESS_BANK_ACCOUNT.getRoute(policyID, ROUTES.WORKSPACE_INVOICES.getRoute(policyID)));
            return;
        }
        navigateToBankAccountRoute({policyID, backTo: ROUTES.WORKSPACE_INVOICES.getRoute(policyID)});
    };

    const {isUserValidated, verifyAccountAndResume} = useVerifyAccountAndResume(() => continueAddBankAccountFlow());

    const onAddBankAccountPress = () => {
        if (!canWriteMoreFeatures) {
            showReadOnlyModal();
            return;
        }

        if (!isSupportedGlobalReimbursement) {
            showConfirmModal({
                buttonVariant: CONST.BUTTON_VARIANT.DANGER,
                title: translate('workspace.bankAccount.workspaceCurrency'),
                prompt: translate('workspace.bankAccount.updateCurrencyPrompt'),
                confirmText: translate('workspace.bankAccount.updateToUSD'),
                cancelText: translate('common.cancel'),
                shouldShowCancelButton: true,
            }).then((result) => {
                if (result.action !== ModalActions.CONFIRM) {
                    resetSelectedPaymentMethodData();
                    return;
                }

                confirmCurrencyChangeAndHideModal();
            });
            return;
        }

        if (!isUserValidated) {
            verifyAccountAndResume(undefined);
            return;
        }

        continueAddBankAccountFlow();
    };

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
            closeModal(() => {
                showConfirmModal({
                    buttonVariant: CONST.BUTTON_VARIANT.DANGER,
                    title: translate('walletPage.deleteAccount'),
                    prompt: translate('walletPage.deleteConfirmation'),
                    confirmText: translate('common.delete'),
                    cancelText: translate('common.cancel'),
                    shouldShowCancelButton: true,
                    onModalHide: resetSelectedPaymentMethodData,
                }).then((result) => {
                    if (result.action !== ModalActions.CONFIRM) {
                        return;
                    }
                    deletePaymentMethod();
                });
            });
        },
    });
    const threeDotsMenuItems = items;

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
                shouldSkipDefaultAccountValidation
                invoiceTransferBankAccountID={invoiceDefaultBankAccountID}
                activePaymentMethodID={transferBankAccountID}
                threeDotsMenuItems={canWriteMoreFeatures ? threeDotsMenuItems : undefined}
                addBankAccountItemStyle={!canWriteMoreFeatures ? styles.buttonOpacityDisabled : undefined}
                style={[styles.mt5, cardEdgeToEdge]}
                listItemStyle={cardPaddingHorizontal}
                filterType={CONST.BANK_ACCOUNT.TYPE.BUSINESS}
            />
        </Section>
    );
}

export default WorkspaceInvoiceVBASection;
