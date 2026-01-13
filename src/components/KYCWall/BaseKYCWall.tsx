import React, {useCallback, useEffect, useImperativeHandle, useRef, useState} from 'react';
import {Dimensions} from 'react-native';
import type {EmitterSubscription, View} from 'react-native';
import AddPaymentMethodMenu from '@components/AddPaymentMethodMenu';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useParentReportAction from '@hooks/useParentReportAction';
import {openPersonalBankAccountSetupView} from '@libs/actions/BankAccounts';
import {completePaymentOnboarding, savePreferredPaymentMethod} from '@libs/actions/IOU';
import {navigateToBankAccountRoute} from '@libs/actions/ReimbursementAccount';
import {moveIOUReportToPolicy, moveIOUReportToPolicyAndInviteSubmitter} from '@libs/actions/Report';
import {isBankAccountPartiallySetup} from '@libs/BankAccountUtils';
import getClickedTargetLocation from '@libs/getClickedTargetLocation';
import Log from '@libs/Log';
import setNavigationActionToMicrotaskQueue from '@libs/Navigation/helpers/setNavigationActionToMicrotaskQueue';
import Navigation from '@libs/Navigation/Navigation';
import {hasExpensifyPaymentMethod} from '@libs/PaymentUtils';
import {getBankAccountRoute, isExpenseReport as isExpenseReportReportUtils, isIOUReport} from '@libs/ReportUtils';
import {getEligibleExistingBusinessBankAccounts, getOpenConnectedToPolicyBusinessBankAccounts} from '@libs/WorkflowUtils';
import {createWorkspaceFromIOUPayment} from '@userActions/Policy/Policy';
import {setKYCWallSource} from '@userActions/Wallet';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {BankAccountList, Policy} from '@src/types/onyx';
import {getEmptyObject} from '@src/types/utils/EmptyObject';
import viewRef from '@src/types/utils/viewRef';
import type {AnchorPosition, ContinueActionParams, DomRect, KYCWallProps, PaymentMethod} from './types';

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
    ref,
    currency,
}: KYCWallProps) {
    const [userWallet] = useOnyx(ONYXKEYS.USER_WALLET, {canBeMissing: true});
    const [walletTerms] = useOnyx(ONYXKEYS.WALLET_TERMS, {canBeMissing: true});
    const [fundList] = useOnyx(ONYXKEYS.FUND_LIST, {canBeMissing: true});
    const [bankAccountList = getEmptyObject<BankAccountList>()] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST, {canBeMissing: true});
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`, {canBeMissing: true});
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true});
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {canBeMissing: true});
    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {canBeMissing: true});

    const {formatPhoneNumber} = useLocalize();
    const currentUserDetails = useCurrentUserPersonalDetails();
    const currentUserEmail = currentUserDetails.email ?? '';
    const reportPreviewAction = useParentReportAction(iouReport);
    const personalDetails = usePersonalDetails();
    const employeeEmail = personalDetails?.[iouReport?.ownerAccountID ?? CONST.DEFAULT_NUMBER_ID]?.login ?? '';
    const anchorRef = useRef<HTMLDivElement | View>(null);
    const transferBalanceButtonRef = useRef<HTMLDivElement | View | null>(null);

    const [shouldShowAddPaymentMenu, setShouldShowAddPaymentMenu] = useState(false);

    const [anchorPosition, setAnchorPosition] = useState({
        anchorPositionVertical: 0,
        anchorPositionHorizontal: 0,
    });

    const [lastPaymentMethod] = useOnyx(ONYXKEYS.NVP_LAST_PAYMENT_METHOD, {canBeMissing: true});

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

    const canLinkExistingBusinessBankAccount = getEligibleExistingBusinessBankAccounts(bankAccountList, currency, true).length > 0;

    const selectPaymentMethod = useCallback(
        (paymentMethod?: PaymentMethod, policy?: Policy) => {
            if (paymentMethod) {
                onSelectPaymentMethod(paymentMethod);
            }

            if (paymentMethod === CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT) {
                openPersonalBankAccountSetupView({shouldSetUpUSBankAccount: isIOUReport(iouReport)});
            } else if (paymentMethod === CONST.PAYMENT_METHODS.DEBIT_CARD) {
                Navigation.navigate(addDebitCardRoute ?? ROUTES.HOME);
            } else if (paymentMethod === CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT || policy) {
                if (iouReport && isIOUReport(iouReport)) {
                    const adminPolicy = policies?.[`${ONYXKEYS.COLLECTION.POLICY}${policy?.id}`];
                    if (adminPolicy) {
                        const inviteResult = moveIOUReportToPolicyAndInviteSubmitter(iouReport?.reportID, adminPolicy, formatPhoneNumber);
                        if (inviteResult?.policyExpenseChatReportID) {
                            setNavigationActionToMicrotaskQueue(() => {
                                Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(inviteResult.policyExpenseChatReportID));
                                if (adminPolicy?.achAccount) {
                                    return;
                                }
                                Navigation.navigate(ROUTES.BANK_ACCOUNT_WITH_STEP_TO_OPEN.getRoute(adminPolicy.id));
                            });
                        } else {
                            const moveResult = moveIOUReportToPolicy(iouReport?.reportID, adminPolicy, true);
                            savePreferredPaymentMethod(iouReport.policyID, adminPolicy.id, CONST.LAST_PAYMENT_METHOD.IOU, lastPaymentMethod?.[adminPolicy.id]);

                            if (moveResult?.policyExpenseChatReportID && !moveResult.useTemporaryOptimisticExpenseChatReportID) {
                                setNavigationActionToMicrotaskQueue(() => {
                                    Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(moveResult.policyExpenseChatReportID));
                                    if (adminPolicy?.achAccount) {
                                        return;
                                    }
                                    Navigation.navigate(ROUTES.BANK_ACCOUNT_WITH_STEP_TO_OPEN.getRoute(adminPolicy.id));
                                });
                            }
                        }
                        return;
                    }

                    const {policyID, workspaceChatReportID, reportPreviewReportActionID, adminsChatReportID} =
                        createWorkspaceFromIOUPayment(iouReport, reportPreviewAction, currentUserEmail, employeeEmail) ?? {};
                    if (policyID && iouReport?.policyID) {
                        savePreferredPaymentMethod(iouReport.policyID, policyID, CONST.LAST_PAYMENT_METHOD.IOU, lastPaymentMethod?.[iouReport?.policyID]);
                    }
                    completePaymentOnboarding(CONST.PAYMENT_SELECTED.BBA, introSelected, adminsChatReportID, policyID);
                    if (workspaceChatReportID) {
                        Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(workspaceChatReportID, reportPreviewReportActionID));
                    }

                    // Navigate to the bank account set up flow for this specific policy
                    Navigation.navigate(ROUTES.BANK_ACCOUNT_WITH_STEP_TO_OPEN.getRoute(policyID));
                    return;
                }

                // If user has a setup in progress for we redirect to the flow where setup can be finished
                // Setup is in progress in 2 cases:
                // - account already present on policy is partially setup
                // - account is being connected 'on the spot' while trying to pay for an expense (it won't be linked to policy yet but will appear as reimbursementAccount)
                if (policy !== undefined && (isBankAccountPartiallySetup(policy?.achAccount?.state) || isBankAccountPartiallySetup(reimbursementAccount?.achData?.state))) {
                    navigateToBankAccountRoute(policy.id);
                    return;
                }

                // If user has existing bank accounts that he can connect we show the list of these accounts
                if (policy !== undefined && canLinkExistingBusinessBankAccount) {
                    Navigation.navigate(ROUTES.BANK_ACCOUNT_CONNECT_EXISTING_BUSINESS_BANK_ACCOUNT.getRoute(policy?.id));
                    return;
                }

                const bankAccountRoute = addBankAccountRoute ?? getBankAccountRoute(chatReport);
                Navigation.navigate(bankAccountRoute);
            }
        },
        [
            onSelectPaymentMethod,
            iouReport,
            addDebitCardRoute,
            reimbursementAccount?.achData?.state,
            canLinkExistingBusinessBankAccount,
            addBankAccountRoute,
            chatReport,
            policies,
            introSelected,
            formatPhoneNumber,
            lastPaymentMethod,
            reportPreviewAction,
            currentUserEmail,
            employeeEmail,
        ],
    );

    /**
     * Take the position of the button that calls this method and show the Add Payment method menu when the user has no valid payment method.
     * If they do have a valid payment method they are navigated to the "enable payments" route to complete KYC checks.
     * If they are already KYC'd we will continue whatever action is gated behind the KYC wall.
     *
     */
    const continueAction = useCallback(
        (params?: ContinueActionParams) => {
            const {event, iouPaymentType, paymentMethod, policy, goBackRoute} = params ?? {};
            const currentSource = walletTerms?.source ?? source;

            /**
             * Set the source, so we can tailor the process according to how we got here.
             * We do not want to set this on mount, as the source can change upon completing the flow, e.g. when upgrading the wallet to Gold.
             */
            setKYCWallSource(source, chatReportID);

            if (shouldShowAddPaymentMenu) {
                setShouldShowAddPaymentMenu(false);
                return;
            }

            // Use event target as fallback if anchorRef is null for safety
            const targetElement = anchorRef.current ?? (event?.currentTarget as HTMLDivElement);

            transferBalanceButtonRef.current = targetElement;

            const isExpenseReport = isExpenseReportReportUtils(iouReport);
            const paymentCardList = fundList ?? {};
            const hasOpenConnectedBusinessBankAccount = getOpenConnectedToPolicyBusinessBankAccounts(bankAccountList, policy).length > 0;
            const hasValidPaymentMethod = hasExpensifyPaymentMethod(paymentCardList, bankAccountList, shouldIncludeDebitCard);
            const isFromWalletPage = source === CONST.KYC_WALL_SOURCE.ENABLE_WALLET || source === CONST.KYC_WALL_SOURCE.TRANSFER_BALANCE;

            // Check if the user needs to add or select a payment method before continuing.
            // - For expense reports: Proceeds if no accounts that are connected are valid and usable (`OPEN`)
            // - For other expenses: Proceeds if the user lacks a valid personal bank account or debit card
            if ((isExpenseReport && !hasOpenConnectedBusinessBankAccount) || (!isExpenseReport && bankAccountList !== null && !hasValidPaymentMethod)) {
                Log.info('[KYC Wallet] User does not have valid payment method');

                if (!shouldIncludeDebitCard || (isFromWalletPage && !hasValidPaymentMethod)) {
                    selectPaymentMethod(CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT);
                    return;
                }

                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                if (paymentMethod || policy) {
                    setShouldShowAddPaymentMenu(false);
                    selectPaymentMethod(paymentMethod, policy);
                    return;
                }

                if (iouPaymentType && isExpenseReport) {
                    setShouldShowAddPaymentMenu(false);
                    selectPaymentMethod(CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT);
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

                if (!hasActivatedWallet && !policy) {
                    Log.info('[KYC Wallet] User does not have active wallet');

                    // If the goBackRoute is the enablePaymentsRoute there's no need to directly navigate to it here
                    if (goBackRoute !== enablePaymentsRoute) {
                        Navigation.navigate(enablePaymentsRoute);
                    }

                    return;
                }

                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                if (policy || (paymentMethod && (!hasActivatedWallet || paymentMethod !== CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT))) {
                    setShouldShowAddPaymentMenu(false);
                    selectPaymentMethod(paymentMethod, policy);
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

        if (shouldListenForResize) {
            dimensionsSubscription = Dimensions.addEventListener('change', setMenuPosition);
        }

        return () => {
            if (!shouldListenForResize || !dimensionsSubscription) {
                return;
            }
            dimensionsSubscription.remove();
        };
    }, [chatReportID, setMenuPosition, shouldListenForResize]);

    useImperativeHandle(
        ref,
        () => ({
            continueAction,
        }),
        [continueAction],
    );

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

export default KYCWall;
