import AddPaymentMethodMenu from '@components/AddPaymentMethodMenu';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useParentReportAction from '@hooks/useParentReportAction';
import useReportTransactions from '@hooks/useReportTransactions';

import {openPersonalBankAccountSetupView, setPersonalBankAccountContinueKYCOnSuccess} from '@libs/actions/BankAccounts';
import {completePaymentOnboarding, savePreferredPaymentMethod} from '@libs/actions/IOU/PayMoneyRequest';
import {navigateToBankAccountRoute} from '@libs/actions/ReimbursementAccount';
import {moveIOUReportToPolicy, moveIOUReportToPolicyAndInviteSubmitter} from '@libs/actions/Report';
import {isBankAccountPartiallySetup} from '@libs/BankAccountUtils';
import getClickedTargetLocation from '@libs/getClickedTargetLocation';
import Log from '@libs/Log';
import setNavigationActionToMicrotaskQueue from '@libs/Navigation/helpers/setNavigationActionToMicrotaskQueue';
import Navigation from '@libs/Navigation/Navigation';
import {hasExpensifyPaymentMethod} from '@libs/PaymentUtils';
import {getAllPolicyExpenseChatReportActions, getBankAccountRoute, getInvoiceReceiverPolicyID, isExpenseReport as isExpenseReportReportUtils, isIOUReport} from '@libs/ReportUtils';
import {getEligibleExistingBusinessBankAccounts, getOpenConnectedToPolicyBusinessBankAccounts} from '@libs/WorkflowUtils';

import {createWorkspaceFromIOUPayment} from '@userActions/Policy/Policy';
import {setKYCWallSource} from '@userActions/Wallet';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import {doesPersonalDetailExistSelector, personalDetailsLoginSelector} from '@src/selectors/PersonalDetails';
import {lastWorkspaceNumberSelector} from '@src/selectors/Policy';
import type {BankAccountList, Policy} from '@src/types/onyx';
import {getEmptyObject} from '@src/types/utils/EmptyObject';
import viewRef from '@src/types/utils/viewRef';

import type {EmitterSubscription, View} from 'react-native';

import {hasSeenTourSelector} from '@selectors/Onboarding';
import React, {useCallback, useEffect, useImperativeHandle, useRef, useState} from 'react';
import {Dimensions} from 'react-native';

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
    getPersonalBankAccountOnSuccessFallbackRoute,
    onSuccessfulKYC,
    shouldIncludeDebitCard = true,
    shouldListenForResize = false,
    source,
    shouldShowPersonalBankAccountOption = false,
    ref,
}: KYCWallProps) {
    const [userWallet] = useOnyx(ONYXKEYS.USER_WALLET);
    const [walletTerms] = useOnyx(ONYXKEYS.WALLET_TERMS);
    const [fundList] = useOnyx(ONYXKEYS.FUND_LIST);
    const [bankAccountList = getEmptyObject<BankAccountList>()] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`);
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [isSelfTourViewed] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector});
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [employeeLogin] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {selector: personalDetailsLoginSelector(iouReport?.ownerAccountID)}, [iouReport?.ownerAccountID]);
    const [doesSubmitterPersonalDetailExist] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {selector: doesPersonalDetailExistSelector(iouReport?.ownerAccountID)}, [iouReport?.ownerAccountID]);

    const {translate} = useLocalize();
    const currentUserDetails = useCurrentUserPersonalDetails();
    const currentUserAccountID = currentUserDetails.accountID;
    const currentUserEmail = currentUserDetails.email ?? '';
    const localCurrency = currentUserDetails.localCurrencyCode ?? CONST.CURRENCY.USD;
    const reportPreviewAction = useParentReportAction(iouReport);
    const reportTransactions = useReportTransactions(iouReport?.reportID);
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const [allReportActions] = useOnyx(ONYXKEYS.COLLECTION.REPORT_ACTIONS);
    const anchorRef = useRef<HTMLDivElement | View>(null);
    const transferBalanceButtonRef = useRef<HTMLDivElement | View | null>(null);

    const [shouldShowAddPaymentMenu, setShouldShowAddPaymentMenu] = useState(false);
    // Holds the fallback route while the add-payment menu is open. When the user picks "Personal bank account" from the menu,
    // we pass this route into openPersonalBankAccountSetupView so the KYC flow can continue after the bank account is added.
    const [pendingPersonalBankAccountOnSuccessFallbackRoute, setPendingPersonalBankAccountOnSuccessFallbackRoute] = useState<Route | null>(null);

    const [anchorPosition, setAnchorPosition] = useState({
        anchorPositionVertical: 0,
        anchorPositionHorizontal: 0,
    });

    const [lastPaymentMethod] = useOnyx(ONYXKEYS.NVP_LAST_PAYMENT_METHOD);

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
        (paymentMethod?: PaymentMethod, policy?: Policy, personalBankAccountOnSuccessFallbackRoute?: Route) => {
            const canLinkExistingBusinessBankAccount = getEligibleExistingBusinessBankAccounts(bankAccountList, policy?.outputCurrency, true).length > 0;

            if (paymentMethod) {
                onSelectPaymentMethod(paymentMethod);
            }

            if (paymentMethod === CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT) {
                const onSuccessFallbackRoute = getPersonalBankAccountOnSuccessFallbackRoute?.(paymentMethod) ?? personalBankAccountOnSuccessFallbackRoute;

                openPersonalBankAccountSetupView({
                    shouldSetUpUSBankAccount: isIOUReport(iouReport),
                    onSuccessFallbackRoute,
                });
            } else if (paymentMethod === CONST.PAYMENT_METHODS.DEBIT_CARD) {
                Navigation.navigate(addDebitCardRoute ?? ROUTES.INBOX);
            } else if (paymentMethod === CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT || policy) {
                const filteredReportActions = getAllPolicyExpenseChatReportActions(allReports, allReportActions);
                if (iouReport && isIOUReport(iouReport)) {
                    const adminPolicy = policies?.[`${ONYXKEYS.COLLECTION.POLICY}${policy?.id}`];
                    if (adminPolicy) {
                        const inviteResult = moveIOUReportToPolicyAndInviteSubmitter(
                            iouReport,
                            adminPolicy,
                            filteredReportActions,
                            reportPreviewAction,
                            currentUserAccountID,
                            employeeLogin,
                            doesSubmitterPersonalDetailExist ?? false,
                            reportTransactions,
                        );
                        if (inviteResult?.policyExpenseChatReportID) {
                            setNavigationActionToMicrotaskQueue(() => {
                                Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(inviteResult.policyExpenseChatReportID));
                                if (adminPolicy?.achAccount?.bankAccountID) {
                                    return;
                                }
                                Navigation.navigate(ROUTES.BANK_ACCOUNT_WITH_STEP_TO_OPEN.getRoute({policyID: adminPolicy.id}));
                            });
                        } else {
                            const moveResult = moveIOUReportToPolicy(iouReport, adminPolicy, reportPreviewAction, true, reportTransactions);
                            savePreferredPaymentMethod(iouReport.policyID, adminPolicy.id, CONST.LAST_PAYMENT_METHOD.IOU, lastPaymentMethod?.[adminPolicy.id]);

                            if (moveResult?.policyExpenseChatReportID && !moveResult.useTemporaryOptimisticExpenseChatReportID) {
                                setNavigationActionToMicrotaskQueue(() => {
                                    Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(moveResult.policyExpenseChatReportID));
                                    if (adminPolicy?.achAccount?.bankAccountID) {
                                        return;
                                    }
                                    Navigation.navigate(ROUTES.BANK_ACCOUNT_WITH_STEP_TO_OPEN.getRoute({policyID: adminPolicy.id}));
                                });
                            }
                        }
                        return;
                    }

                    const lastWorkspaceNumber = lastWorkspaceNumberSelector(policies, currentUserEmail);
                    const {policyID, workspaceChatReportID, adminsChatReportID} =
                        createWorkspaceFromIOUPayment({
                            iouReport,
                            reportPreviewAction,
                            currentUserAccountID,
                            currentUserEmail,
                            iouReportOwnerEmail: employeeLogin ?? '',
                            currentUserLocalCurrency: localCurrency,
                            lastWorkspaceNumber,
                            localeTranslate: translate,
                            reportActionsList: filteredReportActions,
                            doesEmployeePersonalDetailExist: doesSubmitterPersonalDetailExist ?? false,
                        }) ?? {};
                    if (policyID && iouReport?.policyID) {
                        savePreferredPaymentMethod(iouReport.policyID, policyID, CONST.LAST_PAYMENT_METHOD.IOU, lastPaymentMethod?.[iouReport?.policyID]);
                    }
                    completePaymentOnboarding(CONST.PAYMENT_SELECTED.BBA, introSelected, isSelfTourViewed, betas, currentUserAccountID, adminsChatReportID, policyID);
                    const workspaceReportRoute = workspaceChatReportID ? ROUTES.REPORT_WITH_ID.getRoute(workspaceChatReportID) : undefined;

                    setNavigationActionToMicrotaskQueue(() => {
                        Navigation.navigate(ROUTES.BANK_ACCOUNT_WITH_STEP_TO_OPEN.getRoute({policyID, backTo: workspaceReportRoute}));
                    });
                    return;
                }

                // If user has a locked account we exit early
                if (policy !== undefined && policy?.achAccount?.state === CONST.BANK_ACCOUNT.STATE.LOCKED) {
                    return;
                }

                if (policy?.id !== undefined) {
                    const bankAccount = Object.values(bankAccountList).find((account) => account.accountData?.policyIDs?.includes(policy.id));
                    if (isBankAccountPartiallySetup(bankAccount?.accountData?.state)) {
                        navigateToBankAccountRoute({policyID: policy.id, policyCurrency: policy.outputCurrency, bankAccountState: bankAccount?.accountData?.state});
                        return;
                    }
                }

                // If user has existing bank accounts that he can connect we show the list of these accounts
                if (policy !== undefined && canLinkExistingBusinessBankAccount) {
                    Navigation.navigate(ROUTES.BANK_ACCOUNT_CONNECT_EXISTING_BUSINESS_BANK_ACCOUNT.getRoute(policy?.id));
                    return;
                }

                const invoiceReceiverPolicyID = getInvoiceReceiverPolicyID(chatReport);
                const invoiceReceiverPolicy = invoiceReceiverPolicyID ? policies?.[`${ONYXKEYS.COLLECTION.POLICY}${invoiceReceiverPolicyID}`] : undefined;
                const bankAccountRoute = addBankAccountRoute ?? getBankAccountRoute(chatReport, invoiceReceiverPolicy?.areInvoicesEnabled);
                Navigation.navigate(bankAccountRoute);
            }
        },
        [
            bankAccountList,
            getPersonalBankAccountOnSuccessFallbackRoute,
            onSelectPaymentMethod,
            iouReport,
            addDebitCardRoute,
            addBankAccountRoute,
            chatReport,
            policies,
            reportPreviewAction,
            currentUserAccountID,
            currentUserEmail,
            employeeLogin,
            doesSubmitterPersonalDetailExist,
            introSelected,
            translate,
            reportTransactions,
            allReports,
            allReportActions,
            lastPaymentMethod,
            isSelfTourViewed,
            betas,
            localCurrency,
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
            const {event, iouPaymentType, paymentMethod, policy, goBackRoute, personalBankAccountOnSuccessFallbackRoute} = params ?? {};
            const currentSource = walletTerms?.source ?? source;

            /**
             * Set the source, so we can tailor the process according to how we got here.
             * We do not want to set this on mount, as the source can change upon completing the flow, e.g. when upgrading the wallet to Gold.
             */
            setKYCWallSource(source, chatReportID);

            if (shouldShowAddPaymentMenu) {
                setShouldShowAddPaymentMenu(false);
                setPendingPersonalBankAccountOnSuccessFallbackRoute(null);
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
                    selectPaymentMethod(CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT, undefined, personalBankAccountOnSuccessFallbackRoute);
                    return;
                }

                if (paymentMethod || policy) {
                    setShouldShowAddPaymentMenu(false);
                    selectPaymentMethod(paymentMethod, policy, personalBankAccountOnSuccessFallbackRoute);
                    return;
                }

                if (iouPaymentType && isExpenseReport) {
                    setShouldShowAddPaymentMenu(false);
                    // Expense reports use a business bank account, so the personal bank account fallback route is not applicable.
                    selectPaymentMethod(CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT);
                    return;
                }

                const clickedElementLocation = getClickedTargetLocation(targetElement as HTMLDivElement);
                const position = getAnchorPosition(clickedElementLocation);

                setPositionAddPaymentMenu(position);
                setPendingPersonalBankAccountOnSuccessFallbackRoute(personalBankAccountOnSuccessFallbackRoute ?? null);
                setShouldShowAddPaymentMenu(true);

                return;
            }
            if (!isExpenseReport) {
                // Ask the user to upgrade to a gold wallet as this means they have not yet gone through our Know Your Customer (KYC) checks
                const hasActivatedWallet = userWallet?.tierName && [CONST.WALLET.TIER_NAME.GOLD, CONST.WALLET.TIER_NAME.PLATINUM].some((name) => name === userWallet.tierName);

                if (!hasActivatedWallet && !policy) {
                    Log.info('[KYC Wallet] User does not have active wallet');

                    // Save the fallback route so we can continue into KYC after the user adds a bank account on the enable payments screen
                    if (personalBankAccountOnSuccessFallbackRoute) {
                        setPersonalBankAccountContinueKYCOnSuccess(personalBankAccountOnSuccessFallbackRoute);
                    }

                    // If the goBackRoute is the enablePaymentsRoute there's no need to directly navigate to it here
                    if (goBackRoute !== enablePaymentsRoute) {
                        Navigation.navigate(enablePaymentsRoute);
                    }

                    return;
                }

                if (policy || (paymentMethod && (!hasActivatedWallet || paymentMethod !== CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT))) {
                    setShouldShowAddPaymentMenu(false);
                    selectPaymentMethod(paymentMethod, policy, personalBankAccountOnSuccessFallbackRoute);
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
                onClose={() => {
                    setShouldShowAddPaymentMenu(false);
                    setPendingPersonalBankAccountOnSuccessFallbackRoute(null);
                }}
                anchorRef={anchorRef}
                anchorPosition={{
                    vertical: anchorPosition.anchorPositionVertical,
                    horizontal: anchorPosition.anchorPositionHorizontal,
                }}
                anchorAlignment={anchorAlignment}
                onItemSelected={(item: PaymentMethod) => {
                    setShouldShowAddPaymentMenu(false);
                    selectPaymentMethod(item, undefined, pendingPersonalBankAccountOnSuccessFallbackRoute ?? undefined);
                    setPendingPersonalBankAccountOnSuccessFallbackRoute(null);
                }}
                shouldShowPersonalBankAccountOption={shouldShowPersonalBankAccountOption}
            />
            {children(continueAction, viewRef(anchorRef))}
        </>
    );
}

export default KYCWall;
