import React, {useCallback, useRef} from 'react';
import type {GestureResponderEvent, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import * as BankAccounts from '@libs/actions/BankAccounts';
import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import * as PaymentUtils from '@libs/PaymentUtils';
import * as ReportUtils from '@libs/ReportUtils';
import * as Policy from '@userActions/Policy/Policy';
import * as Wallet from '@userActions/Wallet';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {BankAccountList, FundList, ReimbursementAccount, UserWallet, WalletTerms} from '@src/types/onyx';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import viewRef from '@src/types/utils/viewRef';
import type {KYCWallProps, PaymentMethod} from './types';

type BaseKYCWallOnyxProps = {
    /** The user's wallet */
    userWallet: OnyxEntry<UserWallet>;

    /** Information related to the last step of the wallet activation flow */
    walletTerms: OnyxEntry<WalletTerms>;

    /** List of user's cards */
    fundList: OnyxEntry<FundList>;

    /** List of bank accounts */
    bankAccountList: OnyxEntry<BankAccountList>;

    /** The reimbursement account linked to the Workspace */
    reimbursementAccount: OnyxEntry<ReimbursementAccount>;
};

type BaseKYCWallProps = KYCWallProps & BaseKYCWallOnyxProps;

// This component allows us to block various actions by forcing the user to first add a default payment method and successfully make it through our Know Your Customer flow
// before continuing to take whatever action they originally intended to take. It requires a button as a child and a native event so we can get the coordinates and use it
// to render the AddPaymentMethodMenu in the correct location.
function KYCWall({
    addBankAccountRoute,
    addDebitCardRoute,
    bankAccountList = {},
    chatReportID = '',
    children,
    enablePaymentsRoute,
    fundList,
    iouReport,
    onSelectPaymentMethod = () => {},
    onSuccessfulKYC,
    reimbursementAccount,
    shouldIncludeDebitCard = true,
    source,
    userWallet,
    walletTerms,
}: BaseKYCWallProps) {
    const anchorRef = useRef<HTMLDivElement | View>(null);
    const transferBalanceButtonRef = useRef<HTMLDivElement | View | null>(null);

    const selectPaymentMethod = useCallback(
        (paymentMethod: PaymentMethod) => {
            onSelectPaymentMethod(paymentMethod);

            if (paymentMethod === CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT) {
                BankAccounts.openPersonalBankAccountSetupView();
            } else if (paymentMethod === CONST.PAYMENT_METHODS.DEBIT_CARD) {
                Navigation.navigate(addDebitCardRoute);
            } else if (paymentMethod === CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT) {
                if (iouReport && ReportUtils.isIOUReport(iouReport)) {
                    const {policyID, workspaceChatReportID, reportPreviewReportActionID} = Policy.createWorkspaceFromIOUPayment(iouReport) ?? {};
                    if (workspaceChatReportID) {
                        Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(workspaceChatReportID, reportPreviewReportActionID));
                    }

                    // Navigate to the bank account set up flow for this specific policy
                    Navigation.navigate(ROUTES.BANK_ACCOUNT_WITH_STEP_TO_OPEN.getRoute('', policyID));

                    return;
                }
                Navigation.navigate(addBankAccountRoute);
            }
        },
        [addBankAccountRoute, addDebitCardRoute, iouReport, onSelectPaymentMethod],
    );

    /**
     * Take the position of the button that calls this method and show the Add Payment method menu when the user has no valid payment method.
     * If they do have a valid payment method they are navigated to the "enable payments" route to complete KYC checks.
     * If they are already KYC'd we will continue whatever action is gated behind the KYC wall.
     *
     */
    const continueAction = useCallback(
        (event?: GestureResponderEvent | KeyboardEvent, iouPaymentType?: PaymentMethodType) => {
            const currentSource = walletTerms?.source ?? source;

            /**
             * Set the source, so we can tailor the process according to how we got here.
             * We do not want to set this on mount, as the source can change upon completing the flow, e.g. when upgrading the wallet to Gold.
             */
            Wallet.setKYCWallSource(source, chatReportID);

            // Use event target as fallback if anchorRef is null for safety
            const targetElement = anchorRef.current ?? (event?.currentTarget as HTMLDivElement);

            transferBalanceButtonRef.current = targetElement;

            const isExpenseReport = ReportUtils.isExpenseReport(iouReport);
            const paymentCardList = fundList ?? {};

            // Check to see if user has a valid payment method on file and display the add payment popover if they don't
            if (
                (isExpenseReport && reimbursementAccount?.achData?.state !== CONST.BANK_ACCOUNT.STATE.OPEN) ||
                (!isExpenseReport && bankAccountList !== null && !PaymentUtils.hasExpensifyPaymentMethod(paymentCardList, bankAccountList, shouldIncludeDebitCard))
            ) {
                Log.info('[KYC Wallet] User does not have valid payment method');

                if (!shouldIncludeDebitCard) {
                    selectPaymentMethod(CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT);
                    return;
                }

                switch (iouPaymentType) {
                    case CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT:
                        selectPaymentMethod(CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT);
                        break;
                    case CONST.PAYMENT_METHODS.DEBIT_CARD:
                        selectPaymentMethod(CONST.PAYMENT_METHODS.DEBIT_CARD);
                        break;
                    case CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT:
                        selectPaymentMethod(CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT);
                        break;
                    default:
                        break;
                }

                return;
            }
            if (!isExpenseReport) {
                // Ask the user to upgrade to a gold wallet as this means they have not yet gone through our Know Your Customer (KYC) checks
                const hasActivatedWallet = userWallet?.tierName && [CONST.WALLET.TIER_NAME.GOLD, CONST.WALLET.TIER_NAME.PLATINUM].some((name) => name === userWallet.tierName);

                if (!hasActivatedWallet) {
                    Log.info('[KYC Wallet] User does not have active wallet');

                    Navigation.navigate(enablePaymentsRoute);

                    return;
                }
            }

            Log.info('[KYC Wallet] User has valid payment method and passed KYC checks or did not need them');

            onSuccessfulKYC(iouPaymentType, currentSource);
        },
        [
            bankAccountList,
            chatReportID,
            enablePaymentsRoute,
            fundList,
            iouReport,
            onSuccessfulKYC,
            reimbursementAccount?.achData?.state,
            selectPaymentMethod,
            shouldIncludeDebitCard,
            source,
            userWallet?.tierName,
            walletTerms?.source,
        ],
    );

    return <>{children(continueAction, viewRef(anchorRef))}</>;
}

KYCWall.displayName = 'BaseKYCWall';

export default withOnyx<BaseKYCWallProps, BaseKYCWallOnyxProps>({
    userWallet: {
        key: ONYXKEYS.USER_WALLET,
    },
    walletTerms: {
        key: ONYXKEYS.WALLET_TERMS,
    },
    fundList: {
        key: ONYXKEYS.FUND_LIST,
    },
    bankAccountList: {
        key: ONYXKEYS.BANK_ACCOUNT_LIST,
    },
    // @ts-expect-error: ONYXKEYS.REIMBURSEMENT_ACCOUNT is conflicting with ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM
    reimbursementAccount: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
    },
})(KYCWall);
