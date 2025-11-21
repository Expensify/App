import type {RefObject} from 'react';
import React, {useCallback, useRef, useState} from 'react';
import {View} from 'react-native';
import ConfirmModal from '@components/ConfirmModal';
import MenuItem from '@components/MenuItem';
import Popover from '@components/Popover';
import Section from '@components/Section';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePaymentMethodState from '@hooks/usePaymentMethodState';
import type {FormattedSelectedPaymentMethod} from '@hooks/usePaymentMethodState/types';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import {navigateToBankAccountRoute} from '@libs/actions/ReimbursementAccount';
import getClickedTargetLocation from '@libs/getClickedTargetLocation';
import {formatPaymentMethods, getPaymentMethodDescription} from '@libs/PaymentUtils';
import PaymentMethodList from '@pages/settings/Wallet/PaymentMethodList';
import type {PaymentMethodPressHandlerParams} from '@pages/settings/Wallet/WalletPage/types';
import variables from '@styles/variables';
import {deletePaymentBankAccount} from '@userActions/BankAccounts';
import {close as closeModal} from '@userActions/Modal';
import {setInvoicingTransferBankAccount} from '@userActions/PaymentMethods';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type WorkspaceInvoiceVBASectionProps = {
    /** The policy ID currently being configured */
    policyID: string;
};

// TODO: can be refactored to use ThreeDotsMenu component instead handling the popover and positioning
function WorkspaceInvoiceVBASection({policyID}: WorkspaceInvoiceVBASectionProps) {
    const icons = useMemoizedLazyExpensifyIcons(['Star', 'Trashcan'] as const);
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {windowWidth} = useWindowDimensions();
    const {translate} = useLocalize();
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {canBeMissing: true});
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST, {canBeMissing: true});
    const {paymentMethod, setPaymentMethod, resetSelectedPaymentMethodData} = usePaymentMethodState();
    const paymentMethodButtonRef = useRef<HTMLDivElement | null>(null);
    const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
    const [shouldShowDefaultDeleteMenu, setShouldShowDefaultDeleteMenu] = useState(false);
    const [anchorPosition, setAnchorPosition] = useState({
        anchorPositionHorizontal: 0,
        anchorPositionVertical: 0,
        anchorPositionTop: 0,
        anchorPositionRight: 0,
    });
    const hasBankAccount = !isEmptyObject(bankAccountList);
    const shouldShowEmptyState = !hasBankAccount;
    // Determines whether or not the modal popup is mounted from the bottom of the screen instead of the side mount on Web or Desktop screens
    const isPopoverBottomMount = anchorPosition.anchorPositionTop === 0 || shouldUseNarrowLayout;
    const shouldShowMakeDefaultButton = !paymentMethod.isSelectedPaymentMethodDefault;
    const transferBankAccountID = policy?.invoice?.bankAccount?.transferBankAccountID ?? CONST.DEFAULT_NUMBER_ID;

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
    const paymentMethodPressed = ({event, accountData, accountType, methodID, icon, description}: PaymentMethodPressHandlerParams) => {
        if (shouldShowDefaultDeleteMenu) {
            setShouldShowDefaultDeleteMenu(false);
            return;
        }
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
            setShouldShowDefaultDeleteMenu(true);
            setMenuPosition();
        }
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
            deletePaymentBankAccount(bankAccountID);
        }
    }, [paymentMethod.selectedPaymentMethod.bankAccountID, paymentMethod.selectedPaymentMethodType]);

    const makeDefaultPaymentMethod = useCallback(() => {
        // Find the previous default payment method so we can revert if the MakeDefaultPaymentMethod command errors
        const paymentMethods = formatPaymentMethods(bankAccountList ?? {}, {}, styles, translate);
        const previousPaymentMethod = paymentMethods.find((method) => !!method.isDefault);
        const currentPaymentMethod = paymentMethods.find((method) => method.methodID === paymentMethod.methodID);
        if (paymentMethod.selectedPaymentMethodType === CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT) {
            setInvoicingTransferBankAccount(currentPaymentMethod?.methodID ?? CONST.DEFAULT_NUMBER_ID, policyID, previousPaymentMethod?.methodID ?? CONST.DEFAULT_NUMBER_ID);
        }
    }, [bankAccountList, styles, translate, paymentMethod.selectedPaymentMethodType, paymentMethod.methodID, policyID]);

    const onAddBankAccountPress = () => {
        if (shouldShowDefaultDeleteMenu) {
            setShouldShowDefaultDeleteMenu(false);
            return;
        }
        navigateToBankAccountRoute(policyID, ROUTES.WORKSPACE_INVOICES.getRoute(policyID));
    };

    return (
        <Section
            title={translate('common.bankAccounts')}
            subtitle={translate('workspace.invoices.bankAccountsSubtitle')}
            isCentralPane
            titleStyles={styles.accountSettingsSectionTitle}
            subtitleMuted
        >
            <PaymentMethodList
                onPress={paymentMethodPressed}
                onAddBankAccountPress={onAddBankAccountPress}
                invoiceTransferBankAccountID={transferBankAccountID}
                activePaymentMethodID={transferBankAccountID}
                actionPaymentMethodType={shouldShowDefaultDeleteMenu ? paymentMethod.selectedPaymentMethodType : ''}
                style={[styles.mt5, shouldUseNarrowLayout ? styles.mhn5 : styles.mhn8]}
                listItemStyle={shouldUseNarrowLayout ? styles.ph5 : styles.ph8}
                policyID={policyID}
                filterType={CONST.BANK_ACCOUNT.TYPE.BUSINESS}
            />
            <Popover
                isVisible={shouldShowDefaultDeleteMenu}
                onClose={hideDefaultDeleteMenu}
                anchorPosition={{
                    top: anchorPosition.anchorPositionTop,
                    right: anchorPosition.anchorPositionRight,
                }}
                anchorRef={paymentMethodButtonRef as RefObject<View | null>}
            >
                {!showConfirmDeleteModal && (
                    <View
                        style={[
                            !shouldUseNarrowLayout
                                ? {
                                      ...styles.sidebarPopover,
                                      ...styles.pv4,
                                  }
                                : styles.pt5,
                        ]}
                    >
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
                                icon={icons.Star}
                                onPress={() => {
                                    makeDefaultPaymentMethod();
                                    setShouldShowDefaultDeleteMenu(false);
                                }}
                                wrapperStyle={[styles.pv3, styles.ph5, !shouldUseNarrowLayout ? styles.sidebarPopover : {}]}
                            />
                        )}
                        <MenuItem
                            title={translate('common.delete')}
                            icon={icons.Trashcan}
                            onPress={() => closeModal(() => setShowConfirmDeleteModal(true))}
                            wrapperStyle={[styles.pv3, styles.ph5, !shouldUseNarrowLayout ? styles.sidebarPopover : {}]}
                        />
                    </View>
                )}
            </Popover>
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
        </Section>
    );
}

WorkspaceInvoiceVBASection.displayName = 'WorkspaceInvoiceVBASection';

export default WorkspaceInvoiceVBASection;
