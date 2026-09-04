import {useLockedAccountActions, useLockedAccountState} from '@components/LockedAccountModalProvider';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import type {PopoverMenuItem} from '@components/PopoverMenu';

import useConfirmModal from '@hooks/useConfirmModal';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDelegateAccountID from '@hooks/useDelegateAccountID';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePaymentMethodState from '@hooks/usePaymentMethodState';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';
import {formatPaymentMethods} from '@libs/PaymentUtils';
import {hasEligibleBankAccountShareRecipient} from '@libs/PolicyUtils';

import {deletePaymentBankAccount, pressLockedBankAccount} from '@userActions/BankAccounts';
import {close as closeModal} from '@userActions/Modal';
import {deletePaymentCard, makeDefaultPaymentMethod as makeDefaultPaymentMethodPaymentMethods} from '@userActions/PaymentMethods';
import {navigateToConciergeChat} from '@userActions/Report';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import {getEmptyObject} from '@src/types/utils/EmptyObject';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import {hasSeenTourSelector} from '@selectors/Onboarding';
import {useState} from 'react';

import type {PaymentMethodPressHandlerParams} from './types';

import useSelectedPaymentMethodMenuHeader from './useSelectedPaymentMethodMenuHeader';
import {
    getFormattedSelectedPaymentMethod,
    getNextDefaultBankAccountID,
    shouldShowEnableGlobalReimbursementsButton,
    shouldShowMakeDefaultButton,
    shouldShowShareBankAccountButton,
    shouldShowUnshareBankAccountButton,
} from './utils';

const fundListSelector = (allFunds: OnyxEntry<OnyxTypes.FundList>) =>
    Object.fromEntries(Object.entries(allFunds ?? {}).filter(([, item]) => item.accountData?.additionalData?.isP2PDebitCard === true));

const walletLinkedAccountIDSelector = (userWallet: OnyxEntry<OnyxTypes.UserWallet>) => userWallet?.walletLinkedAccountID;

/**
 * Owns the selection state and actions of the three-dots menu shown on bank account rows:
 * make default, share, unshare, delete and enable global reimbursements.
 */
function useBankAccountThreeDotsMenu(bankAccountList: OnyxTypes.BankAccountList, allPolicies: OnyxCollection<OnyxTypes.Policy>) {
    const [fundList = getEmptyObject<OnyxTypes.FundList>()] = useOnyx(ONYXKEYS.FUND_LIST, {selector: fundListSelector});
    const [walletLinkedAccountID] = useOnyx(ONYXKEYS.USER_WALLET, {selector: walletLinkedAccountIDSelector});
    const [personalPolicyID] = useOnyx(ONYXKEYS.PERSONAL_POLICY_ID);
    const [lastUsedPaymentMethods] = useOnyx(ONYXKEYS.NVP_LAST_PAYMENT_METHOD);
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [isSelfTourViewed] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector});
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const delegateAccountID = useDelegateAccountID();
    const {login: currentUserLogin, email, accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const icons = useMemoizedLazyExpensifyIcons(['Star', 'UserPlus', 'UserMinus', 'Trashcan', 'Globe']);
    const {isAccountLocked} = useLockedAccountState();
    const {showLockedAccountModal} = useLockedAccountActions();
    const {showConfirmModal} = useConfirmModal();
    const {paymentMethod, setPaymentMethod, resetSelectedPaymentMethodData} = usePaymentMethodState();
    const [shouldShowShareButton, setShouldShowShareButton] = useState(false);
    const [shouldShowUnshareButton, setShouldShowUnshareButton] = useState(false);
    const menuHeaderItems = useSelectedPaymentMethodMenuHeader(paymentMethod.formattedSelectedPaymentMethod);

    const paymentMethods = formatPaymentMethods(bankAccountList, fundList, styles, translate);
    // Only leaf values of the selection state are read below so that re-selecting the same row keeps the menu items
    // array referentially stable and PaymentMethodList can skip re-rendering.
    const selectedPaymentMethod = paymentMethod.selectedPaymentMethod;
    const selectedType = paymentMethod.formattedSelectedPaymentMethod.type;
    const selectedBankAccountID = selectedPaymentMethod.bankAccountID;
    const hasEligibleShareRecipient = hasEligibleBankAccountShareRecipient(allPolicies, currentUserLogin, selectedBankAccountID?.toString());

    /**
     * Opens the delete/default menu for the pressed bank account or debit card. Locked accounts go to Concierge instead.
     */
    const onThreeDotsMenuPress = ({accountData, accountType, methodID, isDefault, icon, description}: PaymentMethodPressHandlerParams) => {
        if (accountData?.state === CONST.BANK_ACCOUNT.STATE.LOCKED && accountData?.bankAccountID) {
            pressLockedBankAccount(accountData.bankAccountID, translate, conciergeReportID ?? undefined, delegateAccountID);
            navigateToConciergeChat(conciergeReportID ?? undefined, introSelected, currentUserAccountID, isSelfTourViewed, betas);
            return;
        }

        if (!accountType) {
            return;
        }

        setShouldShowShareButton(shouldShowShareBankAccountButton(accountData));
        setShouldShowUnshareButton(shouldShowUnshareBankAccountButton(accountData, email));
        setPaymentMethod({
            isSelectedPaymentMethodDefault: !!isDefault,
            selectedPaymentMethod: accountData ?? {},
            selectedPaymentMethodType: accountType,
            formattedSelectedPaymentMethod: getFormattedSelectedPaymentMethod(accountType, accountData, icon, description, translate),
            methodID: methodID ?? CONST.DEFAULT_NUMBER_ID,
        });
    };

    const makeDefaultPaymentMethod = () => {
        // Find the previous default payment method so we can revert if the MakeDefaultPaymentMethod command errors
        const previousPaymentMethod = paymentMethods.find((method) => !!method.isDefault);
        const currentPaymentMethod = paymentMethods.find((method) => method.methodID === paymentMethod.methodID);
        if (paymentMethod.selectedPaymentMethodType === CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT) {
            makeDefaultPaymentMethodPaymentMethods(selectedBankAccountID ?? CONST.DEFAULT_NUMBER_ID, 0, previousPaymentMethod, currentPaymentMethod);
        } else if (paymentMethod.selectedPaymentMethodType === CONST.PAYMENT_METHODS.DEBIT_CARD) {
            makeDefaultPaymentMethodPaymentMethods(0, paymentMethod.selectedPaymentMethod.fundID ?? CONST.DEFAULT_NUMBER_ID, previousPaymentMethod, currentPaymentMethod);
        }
        resetSelectedPaymentMethodData();
    };

    const deletePaymentMethod = () => {
        const fundID = paymentMethod.selectedPaymentMethod.fundID;
        const newBankAccountID = paymentMethod.isSelectedPaymentMethodDefault ? getNextDefaultBankAccountID(paymentMethods, paymentMethod.methodID) : undefined;

        if (paymentMethod.selectedPaymentMethodType === CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT && selectedBankAccountID) {
            const bankAccount = bankAccountList?.[paymentMethod.methodID] ?? {};
            deletePaymentBankAccount(selectedBankAccountID, personalPolicyID, lastUsedPaymentMethods, bankAccount, newBankAccountID);
        } else if (paymentMethod.selectedPaymentMethodType === CONST.PAYMENT_METHODS.DEBIT_CARD && fundID) {
            deletePaymentCard(fundID);
        }
        resetSelectedPaymentMethodData();
    };

    const showDeleteAccountModal = async () => {
        const result = await showConfirmModal({
            title: translate('walletPage.deleteAccount'),
            prompt: translate('walletPage.deleteConfirmation'),
            confirmText: translate('common.delete'),
            cancelText: translate('common.cancel'),
            shouldShowCancelButton: true,
            buttonVariant: CONST.BUTTON_VARIANT.DANGER,
        });
        resetSelectedPaymentMethodData();
        if (result.action !== ModalActions.CONFIRM) {
            return;
        }
        deletePaymentMethod();
    };

    /** Every menu action is blocked behind the locked-account modal when the account is locked. */
    const runUnlessAccountLocked = (action: () => void) => () => {
        if (isAccountLocked) {
            closeModal(() => showLockedAccountModal());
            return;
        }
        action();
    };

    const threeDotsMenuItems: PopoverMenuItem[] = [
        ...menuHeaderItems,
        ...(shouldShowMakeDefaultButton(paymentMethods, selectedType, selectedPaymentMethod, walletLinkedAccountID)
            ? [
                  {
                      text: translate('walletPage.setDefaultConfirmation'),
                      icon: icons.Star,
                      onSelected: runUnlessAccountLocked(makeDefaultPaymentMethod),
                      numberOfLinesTitle: 0,
                  },
              ]
            : []),
        ...(shouldShowShareButton && hasEligibleShareRecipient
            ? [
                  {
                      text: translate('common.share'),
                      icon: icons.UserPlus,
                      onSelected: runUnlessAccountLocked(() => closeModal(() => Navigation.navigate(ROUTES.SETTINGS_WALLET_SHARE_BANK_ACCOUNT.getRoute(selectedBankAccountID)))),
                  },
              ]
            : []),
        ...(shouldShowUnshareButton
            ? [
                  {
                      text: translate('common.unshare'),
                      icon: icons.UserMinus,
                      onSelected: runUnlessAccountLocked(() => closeModal(() => Navigation.navigate(ROUTES.SETTINGS_WALLET_UNSHARE_BANK_ACCOUNT.getRoute(selectedBankAccountID)))),
                  },
              ]
            : []),
        {
            text: translate('common.delete'),
            icon: icons.Trashcan,
            onSelected: runUnlessAccountLocked(() => {
                closeModal(() => {
                    showDeleteAccountModal();
                });
            }),
        },
        ...(shouldShowEnableGlobalReimbursementsButton(selectedPaymentMethod)
            ? [
                  {
                      text: translate('common.enableGlobalReimbursements'),
                      icon: icons.Globe,
                      onSelected: runUnlessAccountLocked(() =>
                          closeModal(() =>
                              Navigation.navigate(
                                  ROUTES.SETTINGS_WALLET_ENABLE_GLOBAL_REIMBURSEMENTS_BUSINESS.getRoute(
                                      selectedBankAccountID,
                                      CONST.ENABLE_GLOBAL_REIMBURSEMENTS.PAGE_NAME.BUSINESS_INFO.REGISTRATION_NUMBER,
                                  ),
                              ),
                          ),
                      ),
                  },
              ]
            : []),
    ];

    return {threeDotsMenuItems, onThreeDotsMenuPress};
}

export default useBankAccountThreeDotsMenu;
