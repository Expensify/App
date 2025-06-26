import isEmpty from 'lodash/isEmpty';
import truncate from 'lodash/truncate';
import React, {useCallback, useContext, useEffect, useMemo, useRef} from 'react';
import type {GestureResponderEvent} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {TupleToUnion} from 'type-fest';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import * as Expensicons from '@components/Icon/Expensicons';
import KYCWall from '@components/KYCWall';
import type {PaymentMethod} from '@components/KYCWall/types';
import {LockedAccountContext} from '@components/LockedAccountModalProvider';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import {isCurrencySupportedForDirectReimbursement} from '@libs/actions/Policy/Policy';
import {getCurrentUserAccountID} from '@libs/actions/Report';
import {getLastPolicyBankAccountID, getLastPolicyPaymentMethod} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import {formatPaymentMethods} from '@libs/PaymentUtils';
import getPolicyEmployeeAccountIDs from '@libs/PolicyEmployeeListUtils';
import {getActiveAdminWorkspaces, hasVBBA} from '@libs/PolicyUtils';
import {hasRequestFromCurrentAccount} from '@libs/ReportActionsUtils';
import {
    doesReportBelongToWorkspace,
    isBusinessInvoiceRoom,
    isExpenseReport as isExpenseReportUtil,
    isIndividualInvoiceRoom as isIndividualInvoiceRoomUtil,
    isInvoiceReport as isInvoiceReportUtil,
    isIOUReport,
} from '@libs/ReportUtils';
import {shouldRestrictUserBillableActions} from '@libs/SubscriptionUtils';
import {setPersonalBankAccountContinueKYCOnSuccess} from '@userActions/BankAccounts';
import {approveMoneyRequest, savePreferredPaymentMethod as savePreferredPaymentMethodIOU} from '@userActions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {AccountData, BankAccount, LastPaymentMethodType, Policy} from '@src/types/onyx';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import type SettlementButtonProps from './types';

type KYCFlowEvent = GestureResponderEvent | KeyboardEvent | undefined;

type TriggerKYCFlow = (event: KYCFlowEvent, iouPaymentType: PaymentMethodType, paymentMethod?: PaymentMethod, policy?: Policy) => void;

type CurrencyType = TupleToUnion<typeof CONST.DIRECT_REIMBURSEMENT_CURRENCIES>;

function SettlementButton({
    addDebitCardRoute = ROUTES.IOU_SEND_ADD_DEBIT_CARD,
    addBankAccountRoute = '',
    kycWallAnchorAlignment = {
        horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT, // button is at left, so horizontal anchor is at LEFT
        vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP, // we assume that popover menu opens below the button, anchor is at TOP
    },
    paymentMethodDropdownAnchorAlignment = {
        horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT, // caret for dropdown is at right, so horizontal anchor is at RIGHT
        vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP, // we assume that popover menu opens below the button, anchor is at TOP
    },
    buttonSize = CONST.DROPDOWN_BUTTON_SIZE.MEDIUM,
    chatReportID = '',
    currency = CONST.CURRENCY.USD,
    enablePaymentsRoute,
    iouReport,
    isDisabled = false,
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
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    // The app would crash due to subscribing to the entire report collection if chatReportID is an empty string. So we should have a fallback ID here.
    // eslint-disable-next-line rulesdir/no-default-id-values
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${chatReportID || CONST.DEFAULT_NUMBER_ID}`, {canBeMissing: true});
    const [isUserValidated] = useOnyx(ONYXKEYS.ACCOUNT, {selector: (account) => account?.validated, canBeMissing: true});
    const policyEmployeeAccountIDs = policyID ? getPolicyEmployeeAccountIDs(policyID) : [];
    const reportBelongsToWorkspace = policyID ? doesReportBelongToWorkspace(chatReport, policyEmployeeAccountIDs, policyID) : false;
    const policyIDKey = reportBelongsToWorkspace ? policyID : (iouReport?.policyID ?? CONST.POLICY.ID_FAKE);
    const [userWallet] = useOnyx(ONYXKEYS.USER_WALLET, {canBeMissing: true});
    const hasActivatedWallet = ([CONST.WALLET.TIER_NAME.GOLD, CONST.WALLET.TIER_NAME.PLATINUM] as string[]).includes(userWallet?.tierName ?? '');

    const [lastPaymentMethod, lastPaymentMethodResult] = useOnyx(ONYXKEYS.NVP_LAST_PAYMENT_METHOD, {
        canBeMissing: true,
        selector: (paymentMethod) => getLastPolicyPaymentMethod(policyIDKey, paymentMethod, iouReport?.type as keyof LastPaymentMethodType, isIOUReport(iouReport)),
    });

    const lastBankAccountID = getLastPolicyBankAccountID(policyIDKey, iouReport?.type as keyof LastPaymentMethodType);
    const [fundList = {}] = useOnyx(ONYXKEYS.FUND_LIST, {canBeMissing: true});
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true});
    const currentUserAccountID = getCurrentUserAccountID().toString();
    const activeAdminPolicies = getActiveAdminWorkspaces(policies, currentUserAccountID).sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    const reportID = iouReport?.reportID;

    const hasPreferredPaymentMethod = !!lastPaymentMethod;
    const isLoadingLastPaymentMethod = isLoadingOnyxValue(lastPaymentMethodResult);
    const policy = policies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`];
    const isLastPaymentPolicy = !Object.values({...CONST.PAYMENT_METHODS, ...CONST.IOU.PAYMENT_TYPE}).includes(lastPaymentMethod as PaymentMethod);
    const lastPaymentPolicy = isLastPaymentPolicy ? policies?.[`${ONYXKEYS.COLLECTION.POLICY}${lastPaymentMethod}`] : undefined;
    const [bankAccountList = {}] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST, {canBeMissing: true});
    const bankAccount = bankAccountList[lastBankAccountID ?? CONST.DEFAULT_NUMBER_ID];
    // whether the user has single policy and the expense isn't inside a workspace
    const hasSinglePolicy = !policy && activeAdminPolicies.length === 1;
    const hasMultiplePolicies = !policy && activeAdminPolicies.length > 1;
    const lastPaymentMethodRef = useRef(lastPaymentMethod);
    const formattedPaymentMethods = formatPaymentMethods(bankAccountList, fundList, styles);
    const hasIntentToPay = formattedPaymentMethods.length === 1 && !lastPaymentMethod;

    useEffect(() => {
        if (isLoadingLastPaymentMethod) {
            return;
        }
        lastPaymentMethodRef.current = lastPaymentMethod;
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [isLoadingLastPaymentMethod]);

    const isInvoiceReport = (!isEmptyObject(iouReport) && isInvoiceReportUtil(iouReport)) || false;
    const {isAccountLocked, showLockedAccountModal} = useContext(LockedAccountContext);
    const shouldShowPayWithExpensifyOption = !shouldHidePaymentOptions;
    const shouldShowPayElsewhereOption = !shouldHidePaymentOptions && !isInvoiceReport;

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
                        onPress(CONST.IOU.PAYMENT_TYPE.EXPENSIFY, payAsBusiness, formattedPaymentMethod.methodID, formattedPaymentMethod.accountType, undefined);
                    },
                    iconStyles: formattedPaymentMethod?.iconStyles,
                    iconHeight: formattedPaymentMethod?.iconSize,
                    iconWidth: formattedPaymentMethod?.iconSize,
                    value: CONST.IOU.PAYMENT_TYPE.EXPENSIFY,
                }));
        },
        [formattedPaymentMethods, onPress],
    );

    function getLatestBankAccountItem() {
        if (!hasVBBA(policy?.id)) {
            return;
        }
        const policyBankAccounts = formattedPaymentMethods.filter((method) => method.methodID === policy?.achAccount?.bankAccountID);

        return policyBankAccounts.map((formattedPaymentMethod) => ({
            text: formattedPaymentMethod?.title ?? '',
            description: formattedPaymentMethod?.description ?? '',
            icon: formattedPaymentMethod?.icon,
            onSelected: () => onPress(CONST.IOU.PAYMENT_TYPE.EXPENSIFY, true, undefined),
            methodID: formattedPaymentMethod?.methodID,
            value: CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT,
        }));
    }

    function getLatestPersonalBankAccount() {
        return formattedPaymentMethods.filter((ba) => (ba.accountData as AccountData)?.type === CONST.BANK_ACCOUNT.TYPE.PERSONAL);
    }

    const getLastPaymentMethodType = () => {
        if (isInvoiceReport) {
            return CONST.LAST_PAYMENT_METHOD.INVOICE;
        }

        if (policy) {
            return CONST.LAST_PAYMENT_METHOD.EXPENSE;
        }

        return CONST.LAST_PAYMENT_METHOD.IOU;
    };

    const savePreferredPaymentMethod = (id: string, value: string) => {
        savePreferredPaymentMethodIOU(id, value, getLastPaymentMethodType());
    };

    const personalBankAccountList = getLatestPersonalBankAccount();
    const latestBankItem = getLatestBankAccountItem();

    const paymentButtonOptions = useMemo(() => {
        const buttonOptions = [];
        const isExpenseReport = isExpenseReportUtil(iouReport);
        const paymentMethods = {
            [CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT]: {
                text: hasActivatedWallet ? translate('iou.settleWallet', {formattedAmount: ''}) : translate('iou.settlePersonal', {formattedAmount: ''}),
                icon: Expensicons.User,
                value: CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT,
                shouldUpdateSelectedIndex: false,
            },
            [CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT]: {
                text: translate('iou.settleBusiness', {formattedAmount: ''}),
                icon: Expensicons.Building,
                value: CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT,
                shouldUpdateSelectedIndex: false,
            },
            [CONST.IOU.PAYMENT_TYPE.ELSEWHERE]: {
                text: translate('iou.payElsewhere', {formattedAmount: onlyShowPayElsewhere ? formattedAmount : ''}),
                icon: Expensicons.CheckCircle,
                value: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
                shouldUpdateSelectedIndex: false,
            },
        };

        const approveButtonOption = {
            text: translate('iou.approve', {formattedAmount}),
            icon: Expensicons.ThumbsUp,
            value: CONST.IOU.REPORT_ACTION_TYPE.APPROVE,
            disabled: !!shouldDisableApproveButton,
        };

        const canUseWallet = !isExpenseReport && !isInvoiceReport && currency === CONST.CURRENCY.USD;
        const canUseBusinessBankAccount = isExpenseReport || (isIOUReport(iouReport) && reportID && !hasRequestFromCurrentAccount(reportID, Number(currentUserAccountID) ?? -1));

        const canUsePersonalBankAccount = shouldShowPersonalBankAccountOption || isIOUReport;

        const isPersonalOnlyOption = canUsePersonalBankAccount && !canUseBusinessBankAccount;

        // Only show the Approve button if the user cannot pay the expense
        if (shouldHidePaymentOptions && shouldShowApproveButton) {
            return [approveButtonOption];
        }

        if (onlyShowPayElsewhere) {
            return [paymentMethods[CONST.IOU.PAYMENT_TYPE.ELSEWHERE]];
        }

        // To achieve the one tap pay experience we need to choose the correct payment type as default.
        if (canUseWallet) {
            if (personalBankAccountList.length && canUsePersonalBankAccount) {
                buttonOptions.push({
                    text: translate('iou.settleWallet', {formattedAmount: ''}),
                    value: CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT,
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
                    value: CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT,
                    description: latestBankItem.at(0)?.description,
                });
            } else {
                buttonOptions.push(paymentMethods[CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT]);
            }
        }

        if ((hasMultiplePolicies || hasSinglePolicy) && canUseWallet && !isPersonalOnlyOption) {
            activeAdminPolicies.forEach((activePolicy) => {
                const policyName = activePolicy.name;
                buttonOptions.push({
                    text: translate('iou.payWithPolicy', {policyName: truncate(policyName, {length: 20}), formattedAmount: ''}),
                    icon: Expensicons.Building,
                    value: activePolicy.id,
                    shouldUpdateSelectedIndex: false,
                });
            });
        }

        if (shouldShowPayElsewhereOption) {
            buttonOptions.push(paymentMethods[CONST.IOU.PAYMENT_TYPE.ELSEWHERE]);
        }

        if (isInvoiceReport) {
            const isCurrencySupported = isCurrencySupportedForDirectReimbursement(currency as CurrencyType);
            const getInvoicesOptions = (payAsBusiness: boolean) => {
                return [
                    ...(isCurrencySupported ? getPaymentSubitems(payAsBusiness) : []),
                    {
                        text: translate('workspace.invoices.paymentMethods.addBankAccount'),
                        icon: Expensicons.Bank,
                        onSelected: () => Navigation.navigate(addBankAccountRoute),
                        value: CONST.IOU.PAYMENT_TYPE.EXPENSIFY,
                    },
                    {
                        text: translate('iou.payElsewhere', {formattedAmount: ''}),
                        icon: Expensicons.Cash,
                        value: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
                        shouldUpdateSelectedIndex: true,
                        onSelected: () => {
                            onPress(CONST.IOU.PAYMENT_TYPE.ELSEWHERE, payAsBusiness, undefined);
                            savePreferredPaymentMethod(policyIDKey, CONST.IOU.PAYMENT_TYPE.ELSEWHERE);
                        },
                    },
                ];
            };

            if (isIndividualInvoiceRoomUtil(chatReport) || shouldUseShortForm) {
                buttonOptions.push({
                    text: translate('iou.settlePersonal', {formattedAmount}),
                    icon: Expensicons.User,
                    value: hasIntentToPay ? CONST.IOU.PAYMENT_TYPE.EXPENSIFY : (lastPaymentMethod ?? CONST.IOU.PAYMENT_TYPE.ELSEWHERE),
                    backButtonText: translate('iou.individual'),
                    subMenuItems: getInvoicesOptions(false),
                });
                buttonOptions.push({
                    text: translate('iou.settleBusiness', {formattedAmount}),
                    icon: Expensicons.Building,
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
    ]);

    const selectPaymentType = (event: KYCFlowEvent, iouPaymentType: PaymentMethodType) => {
        if (policy && shouldRestrictUserBillableActions(policy.id)) {
            Navigation.navigate(ROUTES.RESTRICTED_ACTION.getRoute(policy.id));
            return;
        }

        if (iouPaymentType === CONST.IOU.REPORT_ACTION_TYPE.APPROVE) {
            if (confirmApproval) {
                confirmApproval();
            } else {
                approveMoneyRequest(iouReport);
            }
            return;
        }
        if (isInvoiceReport) {
            // if user has intent to pay, we should get the only bank account information to pay the invoice.
            if (hasIntentToPay) {
                const currentBankInformation = formattedPaymentMethods.at(0) as BankAccount;
                onPress(
                    CONST.IOU.PAYMENT_TYPE.EXPENSIFY,
                    currentBankInformation.accountType !== CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT,
                    currentBankInformation.methodID,
                    currentBankInformation.accountType,
                    undefined,
                );
                return;
            }

            const isBusinessInvoice = isBusinessInvoiceRoom(chatReport);
            if (iouPaymentType === CONST.IOU.PAYMENT_TYPE.ELSEWHERE) {
                onPress(iouPaymentType, isBusinessInvoice);
                return;
            }
            onPress(
                iouPaymentType,
                isBusinessInvoice,
                lastBankAccountID,
                isBusinessInvoice ? CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT : CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT,
                policyIDKey,
            );
        } else {
            onPress(iouPaymentType, false);
        }
    };

    const selectPaymentMethod = (event: KYCFlowEvent, triggerKYCFlow: TriggerKYCFlow, paymentMethod?: PaymentMethod, selectedPolicy?: Policy) => {
        if (!isUserValidated) {
            Navigation.navigate(ROUTES.SETTINGS_CONTACT_METHOD_VERIFY_ACCOUNT.getRoute(Navigation.getActiveRoute()));
            return;
        }

        if (policy && shouldRestrictUserBillableActions(policy.id)) {
            Navigation.navigate(ROUTES.RESTRICTED_ACTION.getRoute(policy.id));
            return;
        }

        let paymentType;
        switch (paymentMethod) {
            case CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT:
                paymentType = CONST.IOU.PAYMENT_TYPE.EXPENSIFY;
                break;
            case CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT:
                paymentType = CONST.IOU.PAYMENT_TYPE.VBBA;
                break;
            default:
                paymentType = CONST.IOU.PAYMENT_TYPE.ELSEWHERE;
        }
        triggerKYCFlow(event, paymentType, paymentMethod, selectedPolicy ?? lastPaymentPolicy);
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
        if (lastPaymentMethod === CONST.IOU.PAYMENT_TYPE.EXPENSIFY || (hasIntentToPay && isInvoiceReportUtil(iouReport))) {
            if (bankAccountToDisplay && isInvoiceReportUtil(iouReport)) {
                const translationKey = bankAccountToDisplay.accountData?.type === CONST.BANK_ACCOUNT.TYPE.BUSINESS ? 'iou.invoiceBusinessBank' : 'iou.invoicePersonalBank';
                return translate(translationKey, {lastFour: bankAccountToDisplay?.accountData?.accountNumber?.slice(-4) ?? ''});
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
        triggerKYCFlow: (event: GestureResponderEvent | KeyboardEvent | undefined, method?: PaymentMethodType) => void,
    ) => {
        if (isAccountLocked) {
            showLockedAccountModal();
            return;
        }

        const isPaymentMethod = Object.values(CONST.PAYMENT_METHODS).includes(selectedOption as PaymentMethod);
        const shouldSelectPaymentMethod = (isPaymentMethod ?? lastPaymentPolicy ?? !isEmpty(latestBankItem)) && !shouldShowApproveButton && !shouldHidePaymentOptions;
        const selectedPolicy = activeAdminPolicies.find((activePolicy) => activePolicy.id === selectedOption);

        if (!!selectedPolicy || shouldSelectPaymentMethod) {
            selectPaymentMethod(event, triggerKYCFlow, selectedOption as PaymentMethod, selectedPolicy);
            return;
        }

        selectPaymentType(event, selectedOption as PaymentMethodType);
    };

    const customText = getCustomText();
    const secondaryText = getSecondaryText();

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

    const shouldUseSplitButton = hasPreferredPaymentMethod || !!lastPaymentPolicy || ((isInvoiceReport || isExpenseReportUtil(iouReport)) && hasIntentToPay);

    return (
        <KYCWall
            onSuccessfulKYC={(paymentType) => onPress(paymentType, undefined, undefined)}
            enablePaymentsRoute={enablePaymentsRoute}
            addBankAccountRoute={addBankAccountRoute}
            addDebitCardRoute={addDebitCardRoute}
            isDisabled={isOffline}
            source={CONST.KYC_WALL_SOURCE.REPORT}
            chatReportID={chatReportID}
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
                    isLoading={isLoading}
                    defaultSelectedIndex={defaultSelectedIndex !== -1 ? defaultSelectedIndex : 0}
                    onPress={(event, iouPaymentType) => handlePaymentSelection(event, iouPaymentType, triggerKYCFlow)}
                    success={!hasOnlyHeldExpenses}
                    secondLineText={secondaryText}
                    pressOnEnter={pressOnEnter}
                    options={paymentButtonOptions}
                    onOptionSelected={(option) => handlePaymentSelection(undefined, option.value, triggerKYCFlow)}
                    style={style}
                    shouldPopoverUseScrollView={paymentButtonOptions.length > 5}
                    containerStyles={paymentButtonOptions.length > 5 ? styles.settlementButtonListContainer : {}}
                    wrapperStyle={[wrapperStyle, shouldUseShortForm && shouldUseSplitButton ? {minWidth: 90} : {}]}
                    disabledStyle={disabledStyle}
                    buttonSize={buttonSize}
                    anchorAlignment={paymentMethodDropdownAnchorAlignment}
                    enterKeyEventListenerPriority={enterKeyEventListenerPriority}
                    useKeyboardShortcuts={useKeyboardShortcuts}
                />
            )}
        </KYCWall>
    );
}

SettlementButton.displayName = 'SettlementButton';

export default SettlementButton;
