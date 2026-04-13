import type {GestureResponderEvent} from 'react-native';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import type {ContinueActionParams, PaymentMethod} from '@components/KYCWall/types';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import type {BankAccountMenuItem} from '@components/Search/types';
import type {BusinessBankAccountOption} from '@libs/PaymentUtils';
import {getActivePaymentType} from '@libs/PaymentUtils';
import {setPersonalBankAccountContinueKYCOnSuccess} from '@userActions/BankAccounts';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Policy} from '@src/types/onyx';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';

type KYCFlowEvent = GestureResponderEvent | KeyboardEvent | undefined;
type TriggerKYCFlow = (params: ContinueActionParams) => void;

function getCustomText(shouldUseShortForm: boolean, lastPaymentMethod: string | undefined, formattedAmount: string, translate: LocaleContextProps['translate']): string {
    if (shouldUseShortForm) {
        return translate('iou.pay');
    }
    if (lastPaymentMethod === CONST.IOU.PAYMENT_TYPE.ELSEWHERE) {
        return translate('iou.payElsewhere', formattedAmount);
    }
    return translate('iou.settlePayment', formattedAmount);
}

function getDefaultSelectedIndex(
    paymentButtonOptions: Array<DropdownOption<string>>,
    lastPaymentMethod: string | undefined,
    lastPaymentPolicy: Policy | undefined,
    businessBankAccountOptionList: BusinessBankAccountOption[],
): number {
    return paymentButtonOptions.findIndex((paymentOption) => {
        if (lastPaymentMethod === CONST.IOU.PAYMENT_TYPE.ELSEWHERE) {
            return paymentOption.value === CONST.IOU.PAYMENT_TYPE.ELSEWHERE;
        }

        if (lastPaymentMethod === CONST.IOU.PAYMENT_TYPE.VBBA && businessBankAccountOptionList.length) {
            return paymentOption.value === CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT;
        }

        if (lastPaymentPolicy?.id) {
            return paymentOption.value === lastPaymentPolicy.id;
        }

        return false;
    });
}

function buildHandlePaymentSelection({
    checkForNecessaryAction,
    activeAdminPolicies,
    businessBankAccountOptions,
    policyIDKey,
    lastPaymentPolicy,
    selectPaymentType,
}: {
    checkForNecessaryAction: (paymentMethodType?: PaymentMethodType) => boolean;
    activeAdminPolicies: Policy[];
    businessBankAccountOptions: BankAccountMenuItem[] | undefined;
    policyIDKey: string;
    lastPaymentPolicy: Policy | undefined;
    selectPaymentType: (event: KYCFlowEvent, iouPaymentType: PaymentMethodType) => void;
}) {
    return (event: GestureResponderEvent | KeyboardEvent | undefined, selectedOption: string, triggerKYCFlow: (params: ContinueActionParams) => void) => {
        const {paymentType, policyFromPaymentMethod, policyFromContext, shouldSelectPaymentMethod} = getActivePaymentType(
            selectedOption,
            activeAdminPolicies,
            businessBankAccountOptions,
            policyIDKey,
        );

        if (checkForNecessaryAction(paymentType as PaymentMethodType)) {
            return;
        }
        const isPayingWithMethod = paymentType !== CONST.IOU.PAYMENT_TYPE.ELSEWHERE;

        if ((!!policyFromPaymentMethod || shouldSelectPaymentMethod) && (isPayingWithMethod || !!policyFromPaymentMethod)) {
            triggerKYCFlow({
                event,
                iouPaymentType: paymentType as PaymentMethodType,
                paymentMethod: selectedOption as PaymentMethod,
                policy: policyFromPaymentMethod ?? policyFromContext ?? (event ? lastPaymentPolicy : undefined),
            });
            if (paymentType === CONST.IOU.PAYMENT_TYPE.EXPENSIFY || paymentType === CONST.IOU.PAYMENT_TYPE.VBBA) {
                setPersonalBankAccountContinueKYCOnSuccess(ROUTES.ENABLE_PAYMENTS);
            }
            return;
        }

        selectPaymentType(event, selectedOption as PaymentMethodType);
    };
}

export {getCustomText, getDefaultSelectedIndex, buildHandlePaymentSelection};
export type {KYCFlowEvent, TriggerKYCFlow};
