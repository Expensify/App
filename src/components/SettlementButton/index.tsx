import truncate from 'lodash/truncate';
import React, {useMemo} from 'react';
import type {GestureResponderEvent} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import * as Expensicons from '@components/Icon/Expensicons';
import KYCWall from '@components/KYCWall';
import {PaymentMethod} from '@components/KYCWall/types';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import {getCurrentUserAccountID} from '@libs/actions/Report';
import Navigation from '@libs/Navigation/Navigation';
import getPolicyEmployeeAccountIDs from '@libs/PolicyEmployeeListUtils';
import {getActiveAdminWorkspaces, getPolicy} from '@libs/PolicyUtils';
import {
    doesReportBelongToWorkspace,
    isExpenseReport as isExpenseReportUtil,
    isIndividualInvoiceRoom as isIndividualInvoiceRoomUtil,
    isInvoiceReport as isInvoiceReportUtil,
} from '@libs/ReportUtils';
import {shouldRestrictUserBillableActions} from '@libs/SubscriptionUtils';
import {setPersonalBankAccountContinueKYCOnSuccess} from '@userActions/BankAccounts';
import * as BankAccounts from '@userActions/BankAccounts';
import {approveMoneyRequest, savePreferredPaymentMethod as savePreferredPaymentMethodIOU} from '@userActions/IOU';
import {moveIOUToExistingPolicy} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {LastPaymentMethodType} from '@src/types/onyx';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type SettlementButtonProps from './types';

type KYCFlowEvent = GestureResponderEvent | KeyboardEvent | undefined;

type TriggerKYCFlow = (event: KYCFlowEvent, iouPaymentType: PaymentMethodType, paymentMethod?: PaymentMethod) => void;

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
}: SettlementButtonProps) {
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    // The app would crash due to subscribing to the entire report collection if chatReportID is an empty string. So we should have a fallback ID here.
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${chatReportID || CONST.DEFAULT_NUMBER_ID}`);
    const [isUserValidated] = useOnyx(ONYXKEYS.USER, {selector: (user) => !!user?.validated});
    const policyEmployeeAccountIDs = policyID ? getPolicyEmployeeAccountIDs(policyID) : [];
    const reportBelongsToWorkspace = policyID ? doesReportBelongToWorkspace(chatReport, policyEmployeeAccountIDs, policyID) : false;
    const policyIDKey = reportBelongsToWorkspace ? policyID : CONST.POLICY.ID_FAKE;
    const lastPaymentMethodSelector = policyIDKey === CONST.POLICY.ID_FAKE && iouReport?.reportID ? iouReport?.reportID : policyIDKey;
    const [lastPaymentMethod, lastPaymentMethodResult] = useOnyx(ONYXKEYS.NVP_LAST_PAYMENT_METHOD, {
        selector: (paymentMethod) => {
            if (typeof paymentMethod?.[lastPaymentMethodSelector] === 'string') {
                return paymentMethod?.[lastPaymentMethodSelector];
            }
            return (paymentMethod?.[lastPaymentMethodSelector] as LastPaymentMethodType)?.lastUsed;
        },
    });

    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const currentUserAccountID = getCurrentUserAccountID().toString();
    const activeAdminPolicies = getActiveAdminWorkspaces(policies, currentUserAccountID).sort((a, b) => (a.name || '').localeCompare(b.name || ''));

    const hasPreferredPaymentMethod = !!lastPaymentMethod;
    const isLoadingLastPaymentMethod = isLoadingOnyxValue(lastPaymentMethodResult);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const isLastPaymentPolicy = !Object.values({...CONST.PAYMENT_METHODS, ...CONST.IOU.PAYMENT_TYPE}).includes(lastPaymentMethod as PaymentMethod);
    const lastPaymentPolicy = isLastPaymentPolicy ? getPolicy(lastPaymentMethod) : undefined;

    const hasSinglePolicy = !policy && activeAdminPolicies.length === 1;
    const hasMultiplePolicies = !policy && activeAdminPolicies.length > 1;
    const isInvoiceReport = (!isEmptyObject(iouReport) && isInvoiceReportUtil(iouReport)) || false;
    const shouldShowPaywithExpensifyOption = !shouldHidePaymentOptions;
    const shouldShowPayElsewhereOption = !shouldHidePaymentOptions && !isInvoiceReport;
    const paymentButtonOptions = useMemo(() => {
        const buttonOptions = [];
        const isExpenseReport = isExpenseReportUtil(iouReport);
        const paymentMethods = {
            [CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT]: {
                text: translate('iou.settlePersonal', {formattedAmount: ''}),
                icon: Expensicons.User,
                value: CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT,
            },
            [CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT]: {
                text: translate('iou.settleBusiness', {formattedAmount: ''}),
                icon: Expensicons.Building,
                value: CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT,
            },
            [CONST.IOU.PAYMENT_TYPE.ELSEWHERE]: {
                text: translate('iou.payElsewhere', {formattedAmount: ''}),
                icon: Expensicons.CheckCircle,
                value: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
            },
        };

        const approveButtonOption = {
            text: translate('iou.approve'),
            icon: Expensicons.ThumbsUp,
            value: CONST.IOU.REPORT_ACTION_TYPE.APPROVE,
            disabled: !!shouldDisableApproveButton,
        };
        const canUseWallet = !isExpenseReport && !isInvoiceReport && (CONST.DIRECT_REIMBURSEMENT_CURRENCIES as readonly string[]).includes(currency);

        // Only show the Approve button if the user cannot pay the expense
        if (shouldHidePaymentOptions && shouldShowApproveButton) {
            return [approveButtonOption];
        }

        if (onlyShowPayElsewhere) {
            return [paymentMethods[CONST.IOU.PAYMENT_TYPE.ELSEWHERE]];
        }

        // To achieve the one tap pay experience we need to choose the correct payment type as default.
        if (canUseWallet) {
            buttonOptions.push(paymentMethods[CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT]);
            if (activeAdminPolicies.length === 0) {
                buttonOptions.push(paymentMethods[CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT]);
            }
        }
        if (isExpenseReport && shouldShowPaywithExpensifyOption) {
            buttonOptions.push(paymentMethods[CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT]);
        }

        console.log(hasMultiplePolicies, hasSinglePolicy, policyID, activeAdminPolicies, 'hasMultiplePolicies, hasSinglePolicy');

        if (hasMultiplePolicies || hasSinglePolicy) {
            activeAdminPolicies.forEach((policy) => {
                const policyName = policy?.name;
                buttonOptions.push({
                    text: translate('iou.payWithPolicy', {policyName: truncate(policyName, {length: 20}), formattedAmount: ''}),
                    icon: Expensicons.Building,
                    value: policy.id,
                    onSelected: () => {
                        moveIOUToExistingPolicy(policy, iouReport);
                        savePreferredPaymentMethodIOU(iouReport?.reportID ?? '', policy.id, 'lastUsed');
                        // Navigate to the bank account set up flow for this specific policy
                        Navigation.navigate(ROUTES.BANK_ACCOUNT_WITH_STEP_TO_OPEN.getRoute(policy.id));
                    },
                    shouldUpdateSelectedIndex: true,
                });
            });
        }

        if (shouldShowPayElsewhereOption) {
            buttonOptions.push(paymentMethods[CONST.IOU.PAYMENT_TYPE.ELSEWHERE]);
        }

        if (isInvoiceReport) {
            if (isIndividualInvoiceRoomUtil(chatReport)) {
                buttonOptions.push({
                    text: translate('iou.settlePersonal', {formattedAmount}),
                    icon: Expensicons.User,
                    value: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
                    backButtonText: translate('iou.individual'),
                    subMenuItems: [
                        {
                            text: translate('iou.payElsewhere', {formattedAmount: ''}),
                            icon: Expensicons.Cash,
                            value: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
                            onSelected: () => onPress(CONST.IOU.PAYMENT_TYPE.ELSEWHERE),
                        },
                    ],
                });
            }

            buttonOptions.push({
                text: translate('iou.settleBusiness', {formattedAmount}),
                icon: Expensicons.Building,
                value: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
                backButtonText: translate('iou.business'),
                subMenuItems: [
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

        // Put the preferred payment method to the front of the array, so it's shown as default. We assume their last payment method is their preferred.
        if (lastPaymentMethod) {
            return buttonOptions.sort((method) => (method.value === lastPaymentMethod ? -1 : 0));
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
        shouldShowPaywithExpensifyOption,
        shouldShowPayElsewhereOption,
        chatReport,
        onPress,
        onlyShowPayElsewhere,
    ]);

    const selectPaymentType = (event: KYCFlowEvent, iouPaymentType: PaymentMethodType, triggerKYCFlow: TriggerKYCFlow) => {
        if (policy && shouldRestrictUserBillableActions(policy.id)) {
            Navigation.navigate(ROUTES.RESTRICTED_ACTION.getRoute(policy.id));
            return;
        }

        if (iouPaymentType === CONST.IOU.PAYMENT_TYPE.EXPENSIFY || iouPaymentType === CONST.IOU.PAYMENT_TYPE.VBBA) {
            if (!isUserValidated) {
                Navigation.navigate(ROUTES.SETTINGS_WALLET_VERIFY_ACCOUNT.getRoute(Navigation.getActiveRoute()));
                return;
            }
            triggerKYCFlow(event, iouPaymentType);
            setPersonalBankAccountContinueKYCOnSuccess(ROUTES.ENABLE_PAYMENTS);
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

        onPress(iouPaymentType);
    };

    const selectPaymentMethod = (event: KYCFlowEvent, triggerKYCFlow: TriggerKYCFlow, paymentMethod: PaymentMethod) => {
        if (!isUserValidated) {
            Navigation.navigate(ROUTES.SETTINGS_WALLET_VERIFY_ACCOUNT.getRoute(Navigation.getActiveRoute()));
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

        if (lastPaymentPolicy) {
            moveIOUToExistingPolicy(lastPaymentPolicy, iouReport);
            onPress(paymentType, undefined, lastPaymentPolicy?.id);
            return;
        }

        triggerKYCFlow(event, paymentType, paymentMethod);

        BankAccounts.setPersonalBankAccountContinueKYCOnSuccess(ROUTES.ENABLE_PAYMENTS);
    };

    const savePreferredPaymentMethod = (id: string, value: string) => {
        savePreferredPaymentMethodIOU(id, value, undefined);
    };

    const getCustomText = () => {
        if (shouldUseShortForm) {
            return translate('iou.pay');
        }
        
        if (isInvoiceReport || !hasPreferredPaymentMethod) {
            return translate('iou.settlePayment', {formattedAmount});
        }

        return undefined;
    };

    const getSecondLineText = (): string | undefined => {
        if (shouldUseShortForm) {
            return undefined;
        }

        if (lastPaymentPolicy) {
            return lastPaymentPolicy.name;
        }

        if (lastPaymentMethod === CONST.IOU.PAYMENT_TYPE.EXPENSIFY) {
            return translate('common.wallet');
        }

        return undefined;
    };

    return (
        <KYCWall
            onSuccessfulKYC={(paymentType) => onPress(paymentType)}
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
                    shouldAlwaysShowDropdownMenu={isInvoiceReport}
                    customText={getCustomText()}
                    menuHeaderText={isInvoiceReport ? translate('workspace.invoices.paymentMethods.chooseInvoiceMethod') : undefined}
                    isSplitButton={(!isInvoiceReport && hasPreferredPaymentMethod) || !!lastPaymentPolicy}
                    isDisabled={isDisabled}
                    isLoading={isLoading}
                    defaultSelectedIndex={lastPaymentPolicy ? paymentButtonOptions.findIndex((option) => option.value === lastPaymentPolicy.id) : 0}
                    onPress={(event, iouPaymentType) =>{
                        (Object.values(CONST.PAYMENT_METHODS).includes(iouPaymentType as PaymentMethod) || lastPaymentPolicy)
                        ? selectPaymentMethod(event, triggerKYCFlow, iouPaymentType as PaymentMethod)
                        : selectPaymentType(event, iouPaymentType as PaymentMethodType, triggerKYCFlow)   
                    }
                    }
                    secondLineText={getSecondLineText()}
                    pressOnEnter={pressOnEnter}
                    options={paymentButtonOptions}
                    onOptionSelected={(option) => {
                        if (Object.values(CONST.PAYMENT_METHODS).includes(option.value as PaymentMethod)) {
                            selectPaymentMethod(undefined, triggerKYCFlow, option.value as PaymentMethod);
                        }

                        savePreferredPaymentMethod(policyIDKey, option.value);
                    }}
                    style={style}
                    wrapperStyle={wrapperStyle}
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
