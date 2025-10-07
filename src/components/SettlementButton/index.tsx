import {isUserValidatedSelector} from '@selectors/Account';
import isEmpty from 'lodash/isEmpty';
import truncate from 'lodash/truncate';
import React, {useContext, useEffect, useMemo, useRef} from 'react';
import type {GestureResponderEvent} from 'react-native';
import type {TupleToUnion} from 'type-fest';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import * as Expensicons from '@components/Icon/Expensicons';
import {Bank} from '@components/Icon/Expensicons';
import KYCWall from '@components/KYCWall';
import type {ContinueActionParams, PaymentMethod} from '@components/KYCWall/types';
import {LockedAccountContext} from '@components/LockedAccountModalProvider';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import {isCurrencySupportedForDirectReimbursement} from '@libs/actions/Policy/Policy';
import {getLastPolicyBankAccountID, getLastPolicyPaymentMethod} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import {formatPaymentMethods, getActivePaymentType} from '@libs/PaymentUtils';
import {getActiveAdminWorkspaces, getPolicyEmployeeAccountIDs} from '@libs/PolicyUtils';
import {hasRequestFromCurrentAccount} from '@libs/ReportActionsUtils';
import {
    doesReportBelongToWorkspace,
    getBankAccountRoute,
    isExpenseReport as isExpenseReportUtil,
    isIndividualInvoiceRoom as isIndividualInvoiceRoomUtil,
    isInvoiceReport as isInvoiceReportUtil,
    isIOUReport,
} from '@libs/ReportUtils';
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
    const {translate, localeCompare} = useLocalize();
    const {isOffline} = useNetwork();
    const policy = usePolicy(policyID);
    const {accountID} = useCurrentUserPersonalDetails();

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
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true});

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
    const lastPaymentMethodRef = useRef(lastPaymentMethod);
    const formattedPaymentMethods = formatPaymentMethods(bankAccountList ?? {}, fundList ?? {}, styles);
    const hasIntentToPay = ((formattedPaymentMethods.length === 1 && isIOUReport(iouReport)) || !!policy?.achAccount) && !lastPaymentMethod;

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

    function getLatestBankAccountItem() {
        if (!policy?.achAccount?.bankAccountID) {
            return;
        }
        const policyBankAccounts = formattedPaymentMethods.filter((method) => method.methodID === policy?.achAccount?.bankAccountID);

        return policyBankAccounts.map((formattedPaymentMethod) => {
            const {icon, title, description, methodID} = formattedPaymentMethod ?? {};

            return {
                text: title ?? '',
                description: description ?? '',
                icon: typeof icon === 'number' ? Bank : icon,
                onSelected: () => onPress(CONST.IOU.PAYMENT_TYPE.EXPENSIFY, true, undefined),
                methodID,
                value: CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT,
            };
        });
    }

    function getLatestPersonalBankAccount() {
        return formattedPaymentMethods.filter((ba) => (ba.accountData as AccountData)?.type === CONST.BANK_ACCOUNT.TYPE.PERSONAL);
    }

    const personalBankAccountList = getLatestPersonalBankAccount();
    const latestBankItem = getLatestBankAccountItem();

    const paymentButtonOptions = useMemo(() => {
        const buttonOptions = [];
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
                text: translate('iou.payElsewhere', {formattedAmount: ''}),
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
        const canUseBusinessBankAccount = isExpenseReport || (isIOUReport(iouReport) && reportID && !hasRequestFromCurrentAccount(reportID, accountID ?? CONST.DEFAULT_NUMBER_ID));

        const canUsePersonalBankAccount = shouldShowPersonalBankAccountOption || isIOUReport(iouReport);

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
                    text: translate('iou.payWithPolicy', {policyName: truncate(policyName, {length: CONST.ADDITIONAL_ALLOWED_CHARACTERS}), formattedAmount: ''}),
                    icon: Expensicons.Building,
                    value: activePolicy.id,
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
            const isCurrencySupported = isCurrencySupportedForDirectReimbursement(currency as CurrencyType);
            const getPaymentSubitems = (payAsBusiness: boolean) =>
                formattedPaymentMethods.map((formattedPaymentMethod) => ({
                    text: formattedPaymentMethod?.title ?? '',
                    description: formattedPaymentMethod?.description ?? '',
                    icon: formattedPaymentMethod?.icon,
                    onSelected: () => onPress(CONST.IOU.PAYMENT_TYPE.EXPENSIFY, payAsBusiness, formattedPaymentMethod.methodID, formattedPaymentMethod.accountType),
                    iconStyles: formattedPaymentMethod?.iconStyles,
                    iconHeight: formattedPaymentMethod?.iconSize,
                    iconWidth: formattedPaymentMethod?.iconSize,
                }));

            const addBankAccountItem = {
                text: translate('bankAccount.addBankAccount'),
                icon: Expensicons.Bank,
                onSelected: () => {
                    const bankAccountRoute = getBankAccountRoute(chatReport);
                    Navigation.navigate(bankAccountRoute);
                },
            };

            if (isIndividualInvoiceRoomUtil(chatReport)) {
                buttonOptions.push({
                    text: translate('iou.settlePersonal', {formattedAmount}),
                    icon: Expensicons.User,
                    value: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
                    backButtonText: translate('iou.individual'),
                    subMenuItems: [
                        ...(isCurrencySupported ? getPaymentSubitems(false) : []),
                        {
                            text: translate('iou.payElsewhere', {formattedAmount: ''}),
                            icon: Expensicons.Cash,
                            value: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
                            onSelected: () => onPress(CONST.IOU.PAYMENT_TYPE.ELSEWHERE),
                        },
                        ...(isCurrencySupported ? [addBankAccountItem] : []),
                    ],
                });
            }

            buttonOptions.push({
                text: translate('iou.settleBusiness', {formattedAmount}),
                icon: Expensicons.Building,
                value: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
                backButtonText: translate('iou.business'),
                subMenuItems: [
                    ...(isCurrencySupported ? getPaymentSubitems(true) : []),
                    ...(isCurrencySupported ? [addBankAccountItem] : []),
                    {
                        text: translate('iou.payElsewhere', {formattedAmount: ''}),
                        icon: Expensicons.Cash,
                        value: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
                        onSelected: () => onPress(CONST.IOU.PAYMENT_TYPE.ELSEWHERE, true),
                    },
                ],
            });
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
    ]);

    const selectPaymentType = (event: KYCFlowEvent, iouPaymentType: PaymentMethodType) => {
        if (iouPaymentType === CONST.IOU.REPORT_ACTION_TYPE.APPROVE) {
            if (confirmApproval) {
                confirmApproval();
            } else {
                approveMoneyRequest(iouReport);
            }
            return;
        }

        onPress(iouPaymentType, false);
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

        if (lastPaymentMethod === CONST.IOU.PAYMENT_TYPE.ELSEWHERE && !isInvoiceReport) {
            return translate('iou.payElsewhere', {formattedAmount});
        }

        return translate('iou.settlePayment', {formattedAmount});
    };

    const getSecondaryText = (): string | undefined => {
        if (
            shouldUseShortForm ||
            isInvoiceReport ||
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
        if (isAccountLocked) {
            showLockedAccountModal();
            return;
        }

        if (!isUserValidated) {
            Navigation.navigate(ROUTES.SETTINGS_CONTACT_METHOD_VERIFY_ACCOUNT.getRoute(Navigation.getActiveRoute()));
            return;
        }

        if (policy && shouldRestrictUserBillableActions(policy.id)) {
            Navigation.navigate(ROUTES.RESTRICTED_ACTION.getRoute(policy.id));
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

    const shouldUseSplitButton = hasPreferredPaymentMethod || !!lastPaymentPolicy || (isExpenseReportUtil(iouReport) && hasIntentToPay);
    const shouldLimitWidth = shouldUseShortForm && shouldUseSplitButton && !paymentButtonOptions.length;

    return (
        <KYCWall
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
                    isSplitButton={shouldUseSplitButton && !isInvoiceReport}
                    isDisabled={isDisabled}
                    isLoading={isLoading}
                    defaultSelectedIndex={defaultSelectedIndex !== -1 ? defaultSelectedIndex : 0}
                    onPress={(event, iouPaymentType) => handlePaymentSelection(event, iouPaymentType, triggerKYCFlow)}
                    success={!hasOnlyHeldExpenses}
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
