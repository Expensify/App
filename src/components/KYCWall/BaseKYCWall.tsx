import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Dimensions} from 'react-native';
import type {EmitterSubscription, GestureResponderEvent, View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import AddPaymentMethodMenu from '@components/AddPaymentMethodMenu';
import * as BankAccounts from '@libs/actions/BankAccounts';
import getClickedTargetLocation from '@libs/getClickedTargetLocation';
import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import * as PaymentUtils from '@libs/PaymentUtils';
import * as ReportUtils from '@libs/ReportUtils';
import * as PaymentMethods from '@userActions/PaymentMethods';
import * as Policy from '@userActions/Policy/Policy';
import * as Wallet from '@userActions/Wallet';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import viewRef from '@src/types/utils/viewRef';
import type {AnchorPosition, DomRect, KYCWallProps, PaymentMethod} from './types';

// This sets the Horizontal anchor position offset for POPOVER MENU.
const POPOVER_MENU_ANCHOR_POSITION_HORIZONTAL_OFFSET = 20;

// This component allows us to block various actions by forcing the user to first add a default payment method and successfully make it through our Know Your Customer flow
// before continuing to take whatever action they originally intended to take. It requires a button as a child and a native event so we can get the coordinates and use it
// to render the AddPaymentMethodMenu in the correct location.
function KYCWall({
    addBankAccountRoute,
    addDebitCardRoute,
    anchorAlignment = {
        horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
        vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
    },
    chatReportID = '',
    children,
    enablePaymentsRoute,
    iouReport,
    onSelectPaymentMethod = () => {},
    onSuccessfulKYC,
    shouldIncludeDebitCard = true,
    shouldListenForResize = false,
    source,
    shouldShowPersonalBankAccountOption = false,
}: KYCWallProps) {
    const [userWallet] = useOnyx(ONYXKEYS.USER_WALLET);
    const [walletTerms] = useOnyx(ONYXKEYS.WALLET_TERMS);
    const [fundList] = useOnyx(ONYXKEYS.FUND_LIST);
    const [bankAccountList = {}] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);

    const anchorRef = useRef<HTMLDivElement | View>(null);
    const transferBalanceButtonRef = useRef<HTMLDivElement | View | null>(null);

    const [shouldShowAddPaymentMenu, setShouldShowAddPaymentMenu] = useState(false);

    const [anchorPosition, setAnchorPosition] = useState({
        anchorPositionVertical: 0,
        anchorPositionHorizontal: 0,
    });

    const getAnchorPosition = useCallback(
        (domRect: DomRect): AnchorPosition => {
            if (anchorAlignment.vertical === CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP) {
                return {
                    anchorPositionVertical: domRect.top + domRect.height + CONST.MODAL.POPOVER_MENU_PADDING,
                    anchorPositionHorizontal: domRect.left + POPOVER_MENU_ANCHOR_POSITION_HORIZONTAL_OFFSET,
                };
            }

            return {
                anchorPositionVertical: domRect.top - CONST.MODAL.POPOVER_MENU_PADDING,
                anchorPositionHorizontal: domRect.left,
            };
        },
        [anchorAlignment.vertical],
    );

    /**
     * Set position of the transfer payment menu
     */
    const setPositionAddPaymentMenu = ({anchorPositionVertical, anchorPositionHorizontal}: AnchorPosition) => {
        setAnchorPosition({
            anchorPositionVertical,
            anchorPositionHorizontal,
        });
    };

    const setMenuPosition = useCallback(() => {
        if (!transferBalanceButtonRef.current) {
            return;
        }

        const buttonPosition = getClickedTargetLocation(transferBalanceButtonRef.current as HTMLDivElement);
        const position = getAnchorPosition(buttonPosition);

        setPositionAddPaymentMenu(position);
    }, [getAnchorPosition]);

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

            if (shouldShowAddPaymentMenu) {
                setShouldShowAddPaymentMenu(false);
                return;
            }

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

                const clickedElementLocation = getClickedTargetLocation(targetElement as HTMLDivElement);
                const position = getAnchorPosition(clickedElementLocation);

                setPositionAddPaymentMenu(position);
                setShouldShowAddPaymentMenu(true);

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
            getAnchorPosition,
            iouReport,
            onSuccessfulKYC,
            reimbursementAccount?.achData?.state,
            selectPaymentMethod,
            shouldIncludeDebitCard,
            shouldShowAddPaymentMenu,
            source,
            userWallet?.tierName,
            walletTerms?.source,
        ],
    );

    useEffect(() => {
        let dimensionsSubscription: EmitterSubscription | null = null;

        PaymentMethods.kycWallRef.current = {continueAction};

        if (shouldListenForResize) {
            dimensionsSubscription = Dimensions.addEventListener('change', setMenuPosition);
        }

        return () => {
            if (shouldListenForResize && dimensionsSubscription) {
                dimensionsSubscription.remove();
            }

            PaymentMethods.kycWallRef.current = null;
        };
    }, [chatReportID, setMenuPosition, shouldListenForResize, continueAction]);

    return (
        <>
            <AddPaymentMethodMenu
                isVisible={shouldShowAddPaymentMenu}
                iouReport={iouReport}
                onClose={() => setShouldShowAddPaymentMenu(false)}
                anchorRef={anchorRef}
                anchorPosition={{
                    vertical: anchorPosition.anchorPositionVertical,
                    horizontal: anchorPosition.anchorPositionHorizontal,
                }}
                anchorAlignment={anchorAlignment}
                onItemSelected={(item: PaymentMethod) => {
                    setShouldShowAddPaymentMenu(false);
                    selectPaymentMethod(item);
                }}
                shouldShowPersonalBankAccountOption={shouldShowPersonalBankAccountOption}
            />
            {children(continueAction, viewRef(anchorRef))}
        </>
    );
}

KYCWall.displayName = 'BaseKYCWall';

export default KYCWall;
