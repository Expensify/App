import type {RefObject} from 'react';
import React, {useCallback, useRef, useState} from 'react';
import {View} from 'react-native';
import type {GestureResponderEvent} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import AddPaymentMethodMenu from '@components/AddPaymentMethodMenu';
import ConfirmModal from '@components/ConfirmModal';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import Popover from '@components/Popover';
import Section from '@components/Section';
import useLocalize from '@hooks/useLocalize';
import usePaymentMethodState from '@hooks/usePaymentMethodState';
import type {FormattedSelectedPaymentMethod, FormattedSelectedPaymentMethodIcon} from '@hooks/usePaymentMethodState/types';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import getClickedTargetLocation from '@libs/getClickedTargetLocation';
<<<<<<< HEAD
import * as PaymentUtils from '@libs/PaymentUtils';
import PaymentMethodList from '@pages/settings/Wallet/PaymentMethodList';
=======
import Navigation from '@libs/Navigation/Navigation';
import * as PaymentUtils from '@libs/PaymentUtils';
import PaymentMethodList from '@pages/settings/Wallet/PaymentMethodList';
import type {FormattedSelectedPaymentMethodIcon} from '@pages/settings/Wallet/WalletPage/types';
>>>>>>> be90481835 (integrate bank accounts logic)
import variables from '@styles/variables';
import * as BankAccounts from '@userActions/BankAccounts';
import * as PaymentMethods from '@userActions/PaymentMethods';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
<<<<<<< HEAD
import type {AccountData} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
=======
import ROUTES from '@src/ROUTES';
import type {AccountData} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type FormattedSelectedPaymentMethod = {
    title: string;
    icon?: FormattedSelectedPaymentMethodIcon;
    description?: string;
    type?: string;
};

type PaymentMethodState = {
    isSelectedPaymentMethodDefault: boolean;
    selectedPaymentMethod: AccountData;
    formattedSelectedPaymentMethod: FormattedSelectedPaymentMethod;
    methodID: string | number;
    selectedPaymentMethodType: string;
};
>>>>>>> be90481835 (integrate bank accounts logic)

type WorkspaceInvoiceVBASectionProps = {
    /** The policy ID currently being configured */
    policyID: string;
};

function WorkspaceInvoiceVBASection({policyID}: WorkspaceInvoiceVBASectionProps) {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {windowWidth} = useWindowDimensions();
    const {translate} = useLocalize();
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
<<<<<<< HEAD
    const {paymentMethod, setPaymentMethod, resetSelectedPaymentMethodData} = usePaymentMethodState();
=======
    const [cardList] = useOnyx(ONYXKEYS.CARD_LIST);
    const [userWallet] = useOnyx(ONYXKEYS.USER_WALLET);
    const [fundList] = useOnyx(ONYXKEYS.FUND_LIST);
>>>>>>> be90481835 (integrate bank accounts logic)
    const addPaymentMethodAnchorRef = useRef(null);
    const paymentMethodButtonRef = useRef<HTMLDivElement | null>(null);
    const [shouldShowAddPaymentMenu, setShouldShowAddPaymentMenu] = useState(false);
    const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
    const [shouldShowDefaultDeleteMenu, setShouldShowDefaultDeleteMenu] = useState(false);
<<<<<<< HEAD
=======
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethodState>({
        isSelectedPaymentMethodDefault: false,
        selectedPaymentMethod: {},
        formattedSelectedPaymentMethod: {
            title: '',
        },
        methodID: '',
        selectedPaymentMethodType: '',
    });
>>>>>>> be90481835 (integrate bank accounts logic)
    const [anchorPosition, setAnchorPosition] = useState({
        anchorPositionHorizontal: 0,
        anchorPositionVertical: 0,
        anchorPositionTop: 0,
        anchorPositionRight: 0,
    });
<<<<<<< HEAD
    const hasBankAccount = !isEmptyObject(bankAccountList);
    const shouldShowEmptyState = !hasBankAccount;
    // Determines whether or not the modal popup is mounted from the bottom of the screen instead of the side mount on Web or Desktop screens
    const isPopoverBottomMount = anchorPosition.anchorPositionTop === 0 || shouldUseNarrowLayout;
    const shouldShowMakeDefaultButton = !paymentMethod.isSelectedPaymentMethodDefault;
    const transferBankAccountID = policy?.invoice?.bankAccount?.transferBankAccountID;
=======
    const hasBankAccount = !isEmptyObject(bankAccountList) || !isEmptyObject(fundList);
    const hasWallet = !isEmptyObject(userWallet);
    const hasAssignedCard = !isEmptyObject(cardList);
    const shouldShowEmptyState = !hasBankAccount && !hasWallet && !hasAssignedCard;
    // Determines whether or not the modal popup is mounted from the bottom of the screen instead of the side mount on Web or Desktop screens
    const isPopoverBottomMount = anchorPosition.anchorPositionTop === 0 || shouldUseNarrowLayout;
    const shouldShowMakeDefaultButton =
        !paymentMethod.isSelectedPaymentMethodDefault &&
        !(paymentMethod.formattedSelectedPaymentMethod.type === CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT && paymentMethod.selectedPaymentMethod.type === CONST.BANK_ACCOUNT.TYPE.BUSINESS);
>>>>>>> be90481835 (integrate bank accounts logic)

    /**
     * Set position of the payment menu
     */
    const setMenuPosition = useCallback(() => {
        if (!paymentMethodButtonRef.current) {
            return;
        }

        const position = getClickedTargetLocation(paymentMethodButtonRef.current);

        setAnchorPosition({
            anchorPositionTop: position.top + position.height - variables.bankAccountActionPopoverTopSpacing,
            // We want the position to be 23px to the right of the left border
            anchorPositionRight: windowWidth - position.right + variables.bankAccountActionPopoverRightSpacing,
            anchorPositionHorizontal: position.x + (shouldShowEmptyState ? -variables.addPaymentMethodLeftSpacing : variables.addBankAccountLeftSpacing),
            anchorPositionVertical: position.y,
        });
    }, [shouldShowEmptyState, windowWidth]);

    /**
     * Display the delete/default menu, or the add payment method menu
     */
    const paymentMethodPressed = (
        nativeEvent?: GestureResponderEvent | KeyboardEvent,
        accountType?: string,
        account?: AccountData,
        icon?: FormattedSelectedPaymentMethodIcon,
        isDefault?: boolean,
        methodID?: string | number,
    ) => {
        if (shouldShowAddPaymentMenu) {
            setShouldShowAddPaymentMenu(false);
            return;
        }

        if (shouldShowDefaultDeleteMenu) {
            setShouldShowDefaultDeleteMenu(false);
            return;
        }
        paymentMethodButtonRef.current = nativeEvent?.currentTarget as HTMLDivElement;

        // The delete/default menu
        if (accountType) {
            let formattedSelectedPaymentMethod: FormattedSelectedPaymentMethod = {
                title: '',
            };
            if (accountType === CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT) {
                formattedSelectedPaymentMethod = {
                    title: account?.addressName ?? '',
                    icon,
                    description: PaymentUtils.getPaymentMethodDescription(accountType, account),
                    type: CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT,
                };
            }
            setPaymentMethod({
<<<<<<< HEAD
                isSelectedPaymentMethodDefault: transferBankAccountID === methodID,
=======
                isSelectedPaymentMethodDefault: !!isDefault,
>>>>>>> be90481835 (integrate bank accounts logic)
                selectedPaymentMethod: account ?? {},
                selectedPaymentMethodType: accountType,
                formattedSelectedPaymentMethod,
                methodID: methodID ?? '-1',
            });
            setShouldShowDefaultDeleteMenu(true);
            setMenuPosition();
            return;
        }
        setShouldShowAddPaymentMenu(true);
        setMenuPosition();
    };

    /**
     * Hide the add payment modal
     */
    const hideAddPaymentMenu = () => {
        setShouldShowAddPaymentMenu(false);
    };

    /**
     * Hide the default / delete modal
     */
    const hideDefaultDeleteMenu = useCallback(() => {
        setShouldShowDefaultDeleteMenu(false);
        setShowConfirmDeleteModal(false);
    }, [setShouldShowDefaultDeleteMenu, setShowConfirmDeleteModal]);

    const deletePaymentMethod = useCallback(() => {
        const bankAccountID = paymentMethod.selectedPaymentMethod.bankAccountID;
        if (paymentMethod.selectedPaymentMethodType === CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT && bankAccountID) {
            BankAccounts.deletePaymentBankAccount(bankAccountID);
        }
    }, [paymentMethod.selectedPaymentMethod.bankAccountID, paymentMethod.selectedPaymentMethodType]);

    const makeDefaultPaymentMethod = useCallback(() => {
<<<<<<< HEAD
        // Find the previous default payment method so we can revert if the MakeDefaultPaymentMethod command errors
        const paymentMethods = PaymentUtils.formatPaymentMethods(bankAccountList ?? {}, {}, styles);
        const previousPaymentMethod = paymentMethods.find((method) => !!method.isDefault);
        const currentPaymentMethod = paymentMethods.find((method) => method.methodID === paymentMethod.methodID);
        if (paymentMethod.selectedPaymentMethodType === CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT) {
            PaymentMethods.setInvoicingTransferBankAccount(currentPaymentMethod?.methodID ?? -1, policyID, previousPaymentMethod?.methodID ?? -1);
        }
    }, [bankAccountList, styles, paymentMethod.selectedPaymentMethodType, paymentMethod.methodID, policyID]);
=======
        const paymentCardList = fundList ?? {};
        // Find the previous default payment method so we can revert if the MakeDefaultPaymentMethod command errors
        const paymentMethods = PaymentUtils.formatPaymentMethods(bankAccountList ?? {}, paymentCardList, styles);

        const previousPaymentMethod = paymentMethods.find((method) => !!method.isDefault);
        const currentPaymentMethod = paymentMethods.find((method) => method.methodID === paymentMethod.methodID);
        if (paymentMethod.selectedPaymentMethodType === CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT) {
            PaymentMethods.makeDefaultPaymentMethod(paymentMethod.selectedPaymentMethod.bankAccountID ?? -1, 0, previousPaymentMethod, currentPaymentMethod);
        } else if (paymentMethod.selectedPaymentMethodType === CONST.PAYMENT_METHODS.DEBIT_CARD) {
            PaymentMethods.makeDefaultPaymentMethod(0, paymentMethod.selectedPaymentMethod.fundID ?? -1, previousPaymentMethod, currentPaymentMethod);
        }
    }, [
        paymentMethod.methodID,
        paymentMethod.selectedPaymentMethod.bankAccountID,
        paymentMethod.selectedPaymentMethod.fundID,
        paymentMethod.selectedPaymentMethodType,
        bankAccountList,
        fundList,
        styles,
    ]);

    const resetSelectedPaymentMethodData = useCallback(() => {
        // Reset to same values as in the constructor
        setPaymentMethod({
            isSelectedPaymentMethodDefault: false,
            selectedPaymentMethod: {},
            formattedSelectedPaymentMethod: {
                title: '',
            },
            methodID: '',
            selectedPaymentMethodType: '',
        });
    }, [setPaymentMethod]);
>>>>>>> be90481835 (integrate bank accounts logic)

    /**
     * Navigate to the appropriate payment type addition screen
     */
    const addPaymentMethodTypePressed = (paymentType: string) => {
        hideAddPaymentMenu();
<<<<<<< HEAD
=======

        if (paymentType === CONST.PAYMENT_METHODS.DEBIT_CARD) {
            Navigation.navigate(ROUTES.SETTINGS_ADD_DEBIT_CARD);
            return;
        }
>>>>>>> be90481835 (integrate bank accounts logic)
        if (paymentType === CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT || paymentType === CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT) {
            BankAccounts.openPersonalBankAccountSetupView();
            return;
        }

        throw new Error('Invalid payment method type selected');
    };

    return (
        <Section
            title={translate('common.bankAccounts')}
            subtitle={translate('workspace.invoices.bankAccountsSubtitle')}
            isCentralPane
            titleStyles={styles.accountSettingsSectionTitle}
        >
            <PaymentMethodList
                shouldShowAddBankAccountButton={!hasBankAccount}
                shouldShowAddPaymentMethodButton={false}
                shouldShowEmptyListMessage={false}
                onPress={paymentMethodPressed}
<<<<<<< HEAD
                invoiceTransferBankAccountID={transferBankAccountID}
                activePaymentMethodID={transferBankAccountID}
=======
                activePaymentMethodID={policy?.invoice?.bankAccount?.transferBankAccountID ?? ''}
>>>>>>> be90481835 (integrate bank accounts logic)
                actionPaymentMethodType={shouldShowDefaultDeleteMenu ? paymentMethod.selectedPaymentMethodType : ''}
                buttonRef={addPaymentMethodAnchorRef}
                shouldEnableScroll={false}
                style={[styles.mt5, hasBankAccount && [shouldUseNarrowLayout ? styles.mhn5 : styles.mhn8]]}
                listItemStyle={shouldUseNarrowLayout ? styles.ph5 : styles.ph8}
            />
<<<<<<< HEAD
=======

>>>>>>> be90481835 (integrate bank accounts logic)
            <Popover
                isVisible={shouldShowDefaultDeleteMenu}
                onClose={hideDefaultDeleteMenu}
                anchorPosition={{
                    top: anchorPosition.anchorPositionTop,
                    right: anchorPosition.anchorPositionRight,
                }}
                anchorRef={paymentMethodButtonRef as RefObject<View>}
            >
                {!showConfirmDeleteModal && (
                    <View style={[styles.mv5, !shouldUseNarrowLayout ? styles.sidebarPopover : {}]}>
                        {isPopoverBottomMount && (
                            <MenuItem
                                title={paymentMethod.formattedSelectedPaymentMethod.title}
                                icon={paymentMethod.formattedSelectedPaymentMethod.icon?.icon}
                                iconHeight={paymentMethod.formattedSelectedPaymentMethod.icon?.iconHeight ?? paymentMethod.formattedSelectedPaymentMethod.icon?.iconSize}
                                iconWidth={paymentMethod.formattedSelectedPaymentMethod.icon?.iconWidth ?? paymentMethod.formattedSelectedPaymentMethod.icon?.iconSize}
                                iconStyles={paymentMethod.formattedSelectedPaymentMethod.icon?.iconStyles}
                                description={paymentMethod.formattedSelectedPaymentMethod.description}
                                wrapperStyle={[styles.mb4, styles.ph5, styles.pv0]}
                                interactive={false}
                                displayInDefaultIconColor
                            />
                        )}
                        {shouldShowMakeDefaultButton && (
                            <MenuItem
                                title={translate('walletPage.setDefaultConfirmation')}
                                icon={Expensicons.Mail}
                                onPress={() => {
                                    makeDefaultPaymentMethod();
                                    setShouldShowDefaultDeleteMenu(false);
                                }}
                                wrapperStyle={[styles.pv3, styles.ph5, !shouldUseNarrowLayout ? styles.sidebarPopover : {}]}
                            />
                        )}
                        <MenuItem
                            title={translate('common.delete')}
                            icon={Expensicons.Trashcan}
                            onPress={() => setShowConfirmDeleteModal(true)}
                            wrapperStyle={[styles.pv3, styles.ph5, !shouldUseNarrowLayout ? styles.sidebarPopover : {}]}
                        />
                    </View>
                )}
                <ConfirmModal
                    isVisible={showConfirmDeleteModal}
                    onConfirm={() => {
                        deletePaymentMethod();
                        hideDefaultDeleteMenu();
                    }}
                    onCancel={hideDefaultDeleteMenu}
                    title={translate('walletPage.deleteAccount')}
                    prompt={translate('walletPage.deleteConfirmation')}
                    confirmText={translate('common.delete')}
                    cancelText={translate('common.cancel')}
                    shouldShowCancelButton
                    danger
                    onModalHide={resetSelectedPaymentMethodData}
                />
            </Popover>
<<<<<<< HEAD
=======

>>>>>>> be90481835 (integrate bank accounts logic)
            <AddPaymentMethodMenu
                isVisible={shouldShowAddPaymentMenu}
                onClose={hideAddPaymentMenu}
                anchorPosition={{
                    horizontal: anchorPosition.anchorPositionHorizontal,
                    vertical: anchorPosition.anchorPositionVertical - CONST.MODAL.POPOVER_MENU_PADDING,
                }}
                onItemSelected={(method: string) => addPaymentMethodTypePressed(method)}
                anchorRef={addPaymentMethodAnchorRef}
                shouldShowPersonalBankAccountOption
            />
        </Section>
    );
}

WorkspaceInvoiceVBASection.displayName = 'WorkspaceInvoiceVBASection';

export default WorkspaceInvoiceVBASection;
