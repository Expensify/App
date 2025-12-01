import {isUserValidatedSelector} from '@selectors/Account';
import isEmpty from 'lodash/isEmpty';
import truncate from 'lodash/truncate';
import React, {useCallback, useContext, useMemo} from 'react';
import type {GestureResponderEvent} from 'react-native';
import type {TupleToUnion} from 'type-fest';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
// eslint-disable-next-line no-restricted-imports
import * as Expensicons from '@components/Icon/Expensicons';
// eslint-disable-next-line no-restricted-imports
import {Bank} from '@components/Icon/Expensicons';
import KYCWall from '@components/KYCWall';
import {KYCWallContext} from '@components/KYCWall/KYCWallContext';
import type {ContinueActionParams, PaymentMethod} from '@components/KYCWall/types';
import {LockedAccountContext} from '@components/LockedAccountModalProvider';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import {createWorkspace, isCurrencySupportedForDirectReimbursement} from '@libs/actions/Policy/Policy';
import {navigateToBankAccountRoute} from '@libs/actions/ReimbursementAccount';
import {getLastPolicyBankAccountID, getLastPolicyPaymentMethod} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import {formatPaymentMethods, getActivePaymentType} from '@libs/PaymentUtils';
import {getActiveAdminWorkspaces, getPolicyEmployeeAccountIDs, isPaidGroupPolicy, isPolicyAdmin} from '@libs/PolicyUtils';
import {hasRequestFromCurrentAccount} from '@libs/ReportActionsUtils';
import {
    doesReportBelongToWorkspace,
    hasViolations as hasViolationsReportUtils,
    isBusinessInvoiceRoom,
    isExpenseReport as isExpenseReportUtil,
    isIndividualInvoiceRoom as isIndividualInvoiceRoomUtil,
    isInvoiceReport as isInvoiceReportUtil,
    isIOUReport,
} from '@libs/ReportUtils';
import {getSettlementButtonPaymentMethods, handleUnvalidatedUserNavigation} from '@libs/SettlementButtonUtils';
import {shouldRestrictUserBillableActions} from '@libs/SubscriptionUtils';
import {setPersonalBankAccountContinueKYCOnSuccess} from '@userActions/BankAccounts';
import {approveMoneyRequest} from '@userActions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {AccountData, BankAccount, LastPaymentMethodType, Policy} from '@src/types/onyx';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import type SettlementButtonProps from './types';

type KYCFlowEvent = GestureResponderEvent | KeyboardEvent | undefined;

type TriggerKYCFlow = (params: ContinueActionParams) => void;

type CurrencyType = TupleToUnion<typeof CONST.DIRECT_REIMBURSEMENT_CURRENCIES>;

function SettlementButton({
    addDebitCardRoute = ROUTES.IOU_SEND_ADD_DEBIT_CARD,
    kycWallAnchorAlignment = {
        horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT, // button is at left, so horizontal anchor is at LEFT
        vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP, // we assume that popover menu opens below the button, anchor is at TOP
    },
    paymentMethodDropdownAnchorAlignment = {
        horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT, // caret for dropdown is at right, so horizontal anchor is at RIGHT
        vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP, // we assume that popover menu opens below the button, anchor is at TOP
    },
    buttonSize = CONST.DROPDOWN_BUTTON_SIZE.MEDIUM,
    extraSmall = false,
    chatReportID = '',
    currency = CONST.CURRENCY.USD,
    enablePaymentsRoute,
    iouReport,
    isDisabled = false,
    shouldStayNormalOnDisable = false,
    isLoading = false,
    formattedAmount = '',
    onPress,
    pressOnEnter = false,
    policyID = '-1',
    shouldHidePaymentOptions = false,
    shouldShowApproveButton = false,
    shouldDisableApproveButton = false,
    style,
    disabledStyle,
    shouldShowPersonalBankAccountOption = false,
    enterKeyEventListenerPriority = 0,
    confirmApproval,
    useKeyboardShortcuts = false,
    onPaymentOptionsShow,
    onPaymentOptionsHide,
    onlyShowPayElsewhere,
    wrapperStyle,
    shouldUseShortForm = false,
    hasOnlyHeldExpenses = false,
}: SettlementButtonProps) {
    const icons = useMemoizedLazyExpensifyIcons(['Building', 'User'] as const);
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();
    const {isOffline} = useNetwork();
    const policy = usePolicy(policyID);
    const {accountID, email, localCurrencyCode} = useCurrentUserPersonalDetails();

    // The app would crash due to subscribing to the entire report collection if chatReportID is an empty string. So we should have a fallback ID here.
    // eslint-disable-next-line rulesdir/no-default-id-values
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${chatReportID || CONST.DEFAULT_NUMBER_ID}`, {canBeMissing: true});
    const [isUserValidated] = useOnyx(ONYXKEYS.ACCOUNT, {selector: isUserValidatedSelector, canBeMissing: true});
    const policyEmployeeAccountIDs = getPolicyEmployeeAccountIDs(policy, accountID);
    const reportBelongsToWorkspace = policyID ? doesReportBelongToWorkspace(chatReport, policyEmployeeAccountIDs, policyID) : false;
    const policyIDKey = reportBelongsToWorkspace ? policyID : (iouReport?.policyID ?? CONST.POLICY.ID_FAKE);
    const [userWallet] = useOnyx(ONYXKEYS.USER_WALLET, {canBeMissing: true});
    const hasActivatedWallet = ([CONST.WALLET.TIER_NAME.GOLD, CONST.WALLET.TIER_NAME.PLATINUM] as string[]).includes(userWallet?.tierName ?? '');
    const [lastPaymentMethods, lastPaymentMethodResult] = useOnyx(ONYXKEYS.NVP_LAST_PAYMENT_METHOD, {canBeMissing: true});

    const lastPaymentMethod = useMemo(() => {
        if (!iouReport?.type) {
            return;
        }

        return getLastPolicyPaymentMethod(policyIDKey, lastPaymentMethods, iouReport?.type as keyof LastPaymentMethodType, isIOUReport(iouReport));
    }, [policyIDKey, iouReport, lastPaymentMethods]);

    const lastBankAccountID = getLastPolicyBankAccountID(policyIDKey, lastPaymentMethods, iouReport?.type as keyof LastPaymentMethodType);
    const [fundList] = useOnyx(ONYXKEYS.FUND_LIST, {canBeMissing: true});
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID, {canBeMissing: true});
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true});
    const invoiceReceiverPolicyID = chatReport?.invoiceReceiver && 'policyID' in chatReport.invoiceReceiver ? chatReport.invoiceReceiver.policyID : undefined;
    const invoiceReceiverPolicy = usePolicy(invoiceReceiverPolicyID);
    const activePolicy = usePolicy(activePolicyID);
    const activeAdminPolicies = getActiveAdminWorkspaces(policies, accountID.toString()).sort((a, b) => localeCompare(a.name || '', b.name || ''));
    const reportID = iouReport?.reportID;

    const hasPreferredPaymentMethod = !!lastPaymentMethod;
    const isLoadingLastPaymentMethod = isLoadingOnyxValue(lastPaymentMethodResult);
    const lastPaymentPolicy = usePolicy(lastPaymentMethod);

    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST, {canBeMissing: true});
    const bankAccount = bankAccountList?.[lastBankAccountID ?? CONST.DEFAULT_NUMBER_ID];
    const isExpenseReport = isExpenseReportUtil(iouReport);
    // whether the user has single policy and the expense is p2p
    const hasSinglePolicy = !isExpenseReport && activeAdminPolicies.length === 1;
    const hasMultiplePolicies = !isExpenseReport && activeAdminPolicies.length > 1;
    const formattedPaymentMethods = formatPaymentMethods(bankAccountList ?? {}, fundList ?? {}, styles, translate);
    const hasIntentToPay = ((formattedPaymentMethods.length === 1 && isIOUReport(iouReport)) || !!policy?.achAccount) && !lastPaymentMethod;
    const {isBetaEnabled} = usePermissions();
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, {canBeMissing: true});
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const hasViolations = hasViolationsReportUtils(iouReport?.reportID, transactionViolations);

    const isInvoiceReport = (!isEmptyObject(iouReport) && isInvoiceReportUtil(iouReport)) || false;

    const {isAccountLocked, showLockedAccountModal} = useContext(LockedAccountContext);
    const kycWallRef = useContext(KYCWallContext);
    const shouldShowPayWithExpensifyOption = !shouldHidePaymentOptions;
    const shouldShowPayElsewhereOption = !shouldHidePaymentOptions && !isInvoiceReport;

    function getLatestBankAccountItem() {
        if (!policy?.achAccount?.bankAccountID) {
            return;
        }
        const policyBankAccounts = formattedPaymentMethods.filter((method) => method.methodID === policy?.achAccount?.bankAccountID);

        return policyBankAccounts.map((formattedPaymentMethod) => {
            const {icon, iconStyles, iconSize, title, description, methodID} = formattedPaymentMethod ?? {};

            return {
                text: title ?? '',
                description: description ?? '',
                icon: typeof icon === 'number' ? Bank : icon,
                iconStyles: typeof icon === 'number' ? undefined : iconStyles,
                iconSize: typeof icon === 'number' ? undefined : iconSize,
                onSelected: () => onPress(CONST.IOU.PAYMENT_TYPE.EXPENSIFY, true, undefined),
                methodID,
                value: CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT,
            };
        });
    }

    function getLatestPersonalBankAccount() {
        return formattedPaymentMethods.filter((ba) => (ba.accountData as AccountData)?.type === CONST.BANK_ACCOUNT.TYPE.PERSONAL);
    }

    const checkForNecessaryAction = useCallback(() => {
        if (isAccountLocked) {
            showLockedAccountModal();
            return true;
        }

        if (!isUserValidated) {
            handleUnvalidatedUserNavigation(chatReportID, reportID);
            return true;
        }

        if (policy && shouldRestrictUserBillableActions(policy.id)) {
            Navigation.navigate(ROUTES.RESTRICTED_ACTION.getRoute(policy.id));
            return true;
        }

        return false;
    }, [policy, isAccountLocked, isUserValidated, chatReportID, reportID, showLockedAccountModal]);

    const getPaymentSubitems = useCallback(
        (payAsBusiness: boolean) => {
            const requiredAccountType = payAsBusiness ? CONST.BANK_ACCOUNT.TYPE.BUSINESS : CONST.BANK_ACCOUNT.TYPE.PERSONAL;

            return formattedPaymentMethods
                .filter((method) => {
                    const accountData = method?.accountData as AccountData;
                    return accountData?.type === requiredAccountType;
                })
                .map((formattedPaymentMethod) => ({
                    text: formattedPaymentMethod?.title ?? '',
                    description: formattedPaymentMethod?.description ?? '',
                    icon: formattedPaymentMethod?.icon,
                    shouldUpdateSelectedIndex: true,
                    onSelected: () => {
                        if (checkForNecessaryAction()) {
                            return;
                        }
                        onPress(CONST.IOU.PAYMENT_TYPE.EXPENSIFY, payAsBusiness, formattedPaymentMethod.methodID, formattedPaymentMethod.accountType, undefined);
                    },
                    iconStyles: formattedPaymentMethod?.iconStyles,
                    iconHeight: formattedPaymentMethod?.iconSize,
                    iconWidth: formattedPaymentMethod?.iconSize,
                    value: CONST.IOU.PAYMENT_TYPE.EXPENSIFY,
                }));
        },
        [formattedPaymentMethods, onPress, checkForNecessaryAction],
    );

    const personalBankAccountList = getLatestPersonalBankAccount();
    const latestBankItem = getLatestBankAccountItem();

    const paymentButtonOptions = useMemo(() => {
        const buttonOptions = [];
        const paymentMethods = getSettlementButtonPaymentMethods(icons, hasActivatedWallet, translate);

        const shortFormPayElsewhereButton = {
            text: translate('iou.pay'),
            icon: Expensicons.CheckCircle,
            value: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
            shouldUpdateSelectedIndex: false,
        };

        const approveButtonOption = {
            text: translate('iou.approve', {formattedAmount}),
            icon: Expensicons.ThumbsUp,
            value: CONST.IOU.REPORT_ACTION_TYPE.APPROVE,
            disabled: !!shouldDisableApproveButton,
        };

        const canUseWallet = !isExpenseReport && !isInvoiceReport && currency === CONST.CURRENCY.USD;
        const canUseBusinessBankAccount = isExpenseReport || (isIOUReport(iouReport) && reportID && !hasRequestFromCurrentAccount(reportID, accountID ?? CONST.DEFAULT_NUMBER_ID));

        const canUsePersonalBankAccount = shouldShowPersonalBankAccountOption || isIOUReport(iouReport);

        const isPersonalOnlyOption = canUsePersonalBankAccount && !canUseBusinessBankAccount;

        // Only show the Approve button if the user cannot pay the expense
        if (shouldHidePaymentOptions && shouldShowApproveButton) {
            return [approveButtonOption];
        }

        if (onlyShowPayElsewhere) {
            return [shouldUseShortForm ? shortFormPayElsewhereButton : paymentMethods[CONST.IOU.PAYMENT_TYPE.ELSEWHERE]];
        }

        // To achieve the one tap pay experience we need to choose the correct payment type as default.
        if (canUseWallet) {
            if (personalBankAccountList.length && canUsePersonalBankAccount) {
                buttonOptions.push({
                    text: translate('iou.settleWallet', {formattedAmount: ''}),
                    value: CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT,
                    icon: Expensicons.Wallet,
                });
            } else if (canUsePersonalBankAccount) {
                buttonOptions.push(paymentMethods[CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT]);
            }

            if (activeAdminPolicies.length === 0 && !isPersonalOnlyOption) {
                buttonOptions.push(paymentMethods[CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT]);
            }
        }

        const shouldShowBusinessBankAccountOptions = isExpenseReport && shouldShowPayWithExpensifyOption && !isPersonalOnlyOption;

        if (shouldShowBusinessBankAccountOptions) {
            if (!isEmpty(latestBankItem) && latestBankItem) {
                buttonOptions.push({
                    text: latestBankItem.at(0)?.text ?? '',
                    icon: latestBankItem.at(0)?.icon,
                    iconStyles: latestBankItem.at(0)?.iconStyles,
                    iconWidth: latestBankItem.at(0)?.iconSize,
                    iconHeight: latestBankItem.at(0)?.iconSize,
                    value: CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT,
                    description: latestBankItem.at(0)?.description,
                });
            } else {
                buttonOptions.push(paymentMethods[CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT]);
            }
        }

        if ((hasMultiplePolicies || hasSinglePolicy) && canUseWallet && !isPersonalOnlyOption) {
            // eslint-disable-next-line unicorn/no-array-for-each
            activeAdminPolicies.forEach((p) => {
                const policyName = p.name;
                buttonOptions.push({
                    text: translate('iou.payWithPolicy', {policyName: truncate(policyName, {length: CONST.ADDITIONAL_ALLOWED_CHARACTERS}), formattedAmount: ''}),
                    icon: icons.Building,
                    value: p.id,
                    shouldUpdateSelectedIndex: false,
                });
            });
        }

        if (shouldShowPayElsewhereOption) {
            buttonOptions.push({
                ...paymentMethods[CONST.IOU.PAYMENT_TYPE.ELSEWHERE],
                ...(!buttonOptions.length && shouldUseShortForm ? {text: translate('iou.pay')} : {}),
            });
        }

        if (isInvoiceReport) {
            const hasActivePolicyAsAdmin = !!activePolicy && isPolicyAdmin(activePolicy) && isPaidGroupPolicy(activePolicy);

            const isCurrencySupported = isCurrencySupportedForDirectReimbursement(currency as CurrencyType);
            const isActivePolicyCurrencySupported = isCurrencySupportedForDirectReimbursement(activePolicy?.outputCurrency ?? '');
            const isUserCurrencySupported = isCurrencySupportedForDirectReimbursement(localCurrencyCode ?? '');
            const isInvoiceReceiverPolicyCurrencySupported = isCurrencySupportedForDirectReimbursement(invoiceReceiverPolicy?.outputCurrency ?? '');

            const canUseActivePolicy = hasActivePolicyAsAdmin && isActivePolicyCurrencySupported;
            // For business invoice receivers, we use the receiver policy to pay, so validate the receiver policy's currency
            // For individual receivers, allow if user has an active admin policy with supported currency OR user's local currency is supported
            const isPolicyCurrencySupported = invoiceReceiverPolicy ? isInvoiceReceiverPolicyCurrencySupported : canUseActivePolicy || isUserCurrencySupported;

            const getInvoicesOptions = (payAsBusiness: boolean) => {
                const getPolicyID = () => {
                    if (chatReport?.invoiceReceiver?.type === CONST.REPORT.INVOICE_RECEIVER_TYPE.BUSINESS) {
                        return chatReport?.invoiceReceiver?.policyID;
                    }

                    if (canUseActivePolicy) {
                        return activePolicy.id;
                    }

                    return createWorkspace().policyID;
                };
                const addBankAccountItem = {
                    text: translate('bankAccount.addBankAccount'),
                    icon: Expensicons.Bank,
                    onSelected: () => {
                        if (payAsBusiness) {
                            navigateToBankAccountRoute(getPolicyID());
                        } else {
                            Navigation.navigate(ROUTES.SETTINGS_ADD_BANK_ACCOUNT.route);
                        }
                    },
                    value: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
                };
                return [
                    ...(isCurrencySupported ? getPaymentSubitems(payAsBusiness) : []),
                    ...(isCurrencySupported && isPolicyCurrencySupported ? [addBankAccountItem] : []),
                    {
                        text: translate('iou.payElsewhere', {formattedAmount: ''}),
                        icon: Expensicons.Cash,
                        value: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
                        shouldUpdateSelectedIndex: true,
                        onSelected: () => {
                            if (checkForNecessaryAction()) {
                                return;
                            }
                            onPress(CONST.IOU.PAYMENT_TYPE.ELSEWHERE, payAsBusiness, undefined);
                        },
                    },
                ];
            };

            if (isIndividualInvoiceRoomUtil(chatReport)) {
                buttonOptions.push({
                    text: translate('iou.settlePersonal', {formattedAmount}),
                    icon: icons.User,
                    value: hasIntentToPay ? CONST.IOU.PAYMENT_TYPE.EXPENSIFY : (lastPaymentMethod ?? CONST.IOU.PAYMENT_TYPE.ELSEWHERE),
                    backButtonText: translate('iou.individual'),
                    subMenuItems: getInvoicesOptions(false),
                });
                buttonOptions.push({
                    text: translate('iou.settleBusiness', {formattedAmount}),
                    icon: icons.Building,
                    value: hasIntentToPay ? CONST.IOU.PAYMENT_TYPE.EXPENSIFY : (lastPaymentMethod ?? CONST.IOU.PAYMENT_TYPE.ELSEWHERE),
                    backButtonText: translate('iou.business'),
                    subMenuItems: getInvoicesOptions(true),
                });
            } else {
                // If there is pay as business option, we should show the submenu items instead.
                buttonOptions.push(...getInvoicesOptions(true));
            }
        }

        if (shouldShowApproveButton) {
            buttonOptions.push(approveButtonOption);
        }

        return buttonOptions;
        // We don't want to reorder the options when the preferred payment method changes while the button is still visible except for component initialization when the last payment method is not initialized yet.
        // We need to be sure that onPress should be wrapped in an useCallback to prevent unnecessary updates.
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [
        isLoadingLastPaymentMethod,
        iouReport,
        translate,
        formattedAmount,
        shouldDisableApproveButton,
        isInvoiceReport,
        currency,
        shouldHidePaymentOptions,
        shouldShowApproveButton,
        shouldShowPayWithExpensifyOption,
        shouldShowPayElsewhereOption,
        chatReport,
        onPress,
        onlyShowPayElsewhere,
        latestBankItem,
        activeAdminPolicies,
        checkForNecessaryAction,
    ]);

    const selectPaymentType = (event: KYCFlowEvent, iouPaymentType: PaymentMethodType) => {
        if (iouPaymentType === CONST.IOU.REPORT_ACTION_TYPE.APPROVE) {
            if (confirmApproval) {
                confirmApproval();
            } else {
                approveMoneyRequest(iouReport, policy, accountID, email ?? '', hasViolations, isASAPSubmitBetaEnabled, false);
            }
            return;
        }

        if (isInvoiceReport) {
            // if user has intent to pay, we should get the only bank account information to pay the invoice.
            if (hasIntentToPay) {
                const currentBankInformation = formattedPaymentMethods.at(0) as BankAccount;
                onPress(
                    CONST.IOU.PAYMENT_TYPE.EXPENSIFY,
                    currentBankInformation.accountData?.type === CONST.BANK_ACCOUNT.TYPE.BUSINESS,
                    currentBankInformation.methodID,
                    currentBankInformation.accountType,
                    undefined,
                );
                return;
            }

            const isBusinessInvoice = bankAccount?.accountData?.type === CONST.BANK_ACCOUNT.TYPE.BUSINESS || isBusinessInvoiceRoom(chatReport);
            if (iouPaymentType === CONST.IOU.PAYMENT_TYPE.ELSEWHERE) {
                onPress(iouPaymentType, isBusinessInvoice);
                return;
            }
            onPress(iouPaymentType, isBusinessInvoice, lastBankAccountID, CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT, policyIDKey);
        } else {
            onPress(iouPaymentType, false);
        }
    };
    const selectPaymentMethod = (event: KYCFlowEvent, paymentType: string, triggerKYCFlow: TriggerKYCFlow, paymentMethod?: PaymentMethod, selectedPolicy?: Policy) => {
        triggerKYCFlow({
            event,
            iouPaymentType: paymentType as PaymentMethodType,
            paymentMethod,
            policy: selectedPolicy ?? (event ? lastPaymentPolicy : undefined),
        });
        if (paymentType === CONST.IOU.PAYMENT_TYPE.EXPENSIFY || paymentType === CONST.IOU.PAYMENT_TYPE.VBBA) {
            setPersonalBankAccountContinueKYCOnSuccess(ROUTES.ENABLE_PAYMENTS);
        }
    };

    const getCustomText = () => {
        if (shouldUseShortForm) {
            return translate('iou.pay');
        }

        if (lastPaymentMethod === CONST.IOU.PAYMENT_TYPE.ELSEWHERE) {
            return translate('iou.payElsewhere', {formattedAmount});
        }

        return translate('iou.settlePayment', {formattedAmount});
    };

    const getSecondaryText = (): string | undefined => {
        if (
            shouldUseShortForm ||
            lastPaymentMethod === CONST.IOU.PAYMENT_TYPE.ELSEWHERE ||
            (paymentButtonOptions.length === 1 && paymentButtonOptions.every((option) => option.value === CONST.IOU.PAYMENT_TYPE.ELSEWHERE)) ||
            (shouldHidePaymentOptions && (shouldShowApproveButton || onlyShowPayElsewhere))
        ) {
            return undefined;
        }

        if (lastPaymentPolicy) {
            return lastPaymentPolicy.name;
        }

        const bankAccountToDisplay = hasIntentToPay ? (formattedPaymentMethods.at(0) as BankAccount) : bankAccount;

        if (lastPaymentMethod === CONST.IOU.PAYMENT_TYPE.EXPENSIFY || (hasIntentToPay && (isExpenseReport || isInvoiceReport))) {
            if (isInvoiceReport) {
                const isBusinessBankAccount = bankAccountToDisplay?.accountData?.type === CONST.BANK_ACCOUNT.TYPE.BUSINESS;
                return translate(isBusinessBankAccount ? 'iou.invoiceBusinessBank' : 'iou.invoicePersonalBank', {
                    lastFour: bankAccountToDisplay?.accountData?.accountNumber?.slice(-4) ?? '',
                });
            }
            if (!personalBankAccountList.length) {
                return;
            }

            return translate('common.wallet');
        }

        if ((lastPaymentMethod === CONST.IOU.PAYMENT_TYPE.VBBA || hasIntentToPay) && !!policy?.achAccount) {
            if (policy?.achAccount?.accountNumber) {
                return translate('paymentMethodList.bankAccountLastFour', {lastFour: policy?.achAccount?.accountNumber?.slice(-4)});
            }

            if (!bankAccountToDisplay?.accountData?.accountNumber) {
                return;
            }

            return translate('paymentMethodList.bankAccountLastFour', {lastFour: bankAccountToDisplay?.accountData?.accountNumber?.slice(-4)});
        }

        if (bankAccount?.accountData?.type === CONST.BANK_ACCOUNT.TYPE.BUSINESS && isExpenseReportUtil(iouReport)) {
            return translate('paymentMethodList.bankAccountLastFour', {lastFour: bankAccount?.accountData?.accountNumber?.slice(-4) ?? ''});
        }

        return undefined;
    };

    const handlePaymentSelection = (
        event: GestureResponderEvent | KeyboardEvent | undefined,
        selectedOption: PaymentMethodType | PaymentMethod,
        triggerKYCFlow: (params: ContinueActionParams) => void,
    ) => {
        if (checkForNecessaryAction()) {
            return;
        }

        const {paymentType, selectedPolicy, shouldSelectPaymentMethod} = getActivePaymentType(selectedOption, activeAdminPolicies, latestBankItem);

        if (!!selectedPolicy || shouldSelectPaymentMethod) {
            selectPaymentMethod(event, paymentType, triggerKYCFlow, selectedOption as PaymentMethod, selectedPolicy);
            return;
        }

        selectPaymentType(event, selectedOption as PaymentMethodType);
    };

    const customText = getCustomText();
    const secondaryText = truncate(getSecondaryText(), {length: CONST.FORM_CHARACTER_LIMIT});

    const defaultSelectedIndex = paymentButtonOptions.findIndex((paymentOption) => {
        if (lastPaymentMethod === CONST.IOU.PAYMENT_TYPE.ELSEWHERE) {
            return paymentOption.value === CONST.IOU.PAYMENT_TYPE.ELSEWHERE;
        }

        if (latestBankItem?.length) {
            return paymentOption.value === latestBankItem.at(0)?.value;
        }

        if (lastPaymentPolicy?.id) {
            return paymentOption.value === lastPaymentPolicy.id;
        }

        return false;
    });

    const shouldUseSplitButton = hasPreferredPaymentMethod || !!lastPaymentPolicy || ((isExpenseReport || isInvoiceReport) && hasIntentToPay);
    const shouldLimitWidth = shouldUseShortForm && shouldUseSplitButton && !paymentButtonOptions.length;

    return (
        <KYCWall
            ref={kycWallRef}
            onSuccessfulKYC={(paymentType) => onPress(paymentType, undefined, undefined)}
            enablePaymentsRoute={enablePaymentsRoute}
            addDebitCardRoute={addDebitCardRoute}
            isDisabled={isOffline}
            source={CONST.KYC_WALL_SOURCE.REPORT}
            chatReportID={chatReportID}
            addBankAccountRoute={isExpenseReport ? ROUTES.BANK_ACCOUNT_WITH_STEP_TO_OPEN.getRoute(iouReport?.policyID, undefined, Navigation.getActiveRoute()) : undefined}
            iouReport={iouReport}
            policy={lastPaymentPolicy}
            anchorAlignment={kycWallAnchorAlignment}
            shouldShowPersonalBankAccountOption={shouldShowPersonalBankAccountOption}
        >
            {(triggerKYCFlow, buttonRef) => (
                <ButtonWithDropdownMenu<PaymentMethodType | PaymentMethod>
                    onOptionsMenuShow={onPaymentOptionsShow}
                    onOptionsMenuHide={onPaymentOptionsHide}
                    buttonRef={buttonRef}
                    shouldAlwaysShowDropdownMenu={isInvoiceReport && !onlyShowPayElsewhere}
                    customText={customText}
                    menuHeaderText={isInvoiceReport ? translate('workspace.invoices.paymentMethods.chooseInvoiceMethod') : undefined}
                    isSplitButton={shouldUseSplitButton}
                    isDisabled={isDisabled}
                    shouldStayNormalOnDisable={shouldStayNormalOnDisable}
                    isLoading={isLoading}
                    defaultSelectedIndex={defaultSelectedIndex !== -1 ? defaultSelectedIndex : 0}
                    onPress={(event, iouPaymentType) => handlePaymentSelection(event, iouPaymentType, triggerKYCFlow)}
                    success={!hasOnlyHeldExpenses}
                    extraSmall={extraSmall}
                    secondLineText={secondaryText}
                    pressOnEnter={pressOnEnter}
                    options={paymentButtonOptions}
                    onOptionSelected={(option) => {
                        if (paymentButtonOptions.length === 1) {
                            return;
                        }

                        handlePaymentSelection(undefined, option.value, triggerKYCFlow);
                    }}
                    style={style}
                    shouldUseShortForm={shouldUseShortForm}
                    shouldPopoverUseScrollView={paymentButtonOptions.length > 5}
                    containerStyles={paymentButtonOptions.length > 5 ? styles.settlementButtonListContainer : {}}
                    wrapperStyle={[wrapperStyle, shouldLimitWidth ? styles.settlementButtonShortFormWidth : {}]}
                    disabledStyle={disabledStyle}
                    buttonSize={buttonSize}
                    anchorAlignment={paymentMethodDropdownAnchorAlignment}
                    enterKeyEventListenerPriority={enterKeyEventListenerPriority}
                    useKeyboardShortcuts={useKeyboardShortcuts}
                    shouldUseModalPaddingStyle={paymentButtonOptions.length <= 5}
                />
            )}
        </KYCWall>
    );
}

SettlementButton.displayName = 'SettlementButton';

export default SettlementButton;
