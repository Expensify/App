import {hasSeenTourSelector} from '@selectors/Onboarding';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import type useSettlementData from '@hooks/useSettlementData';
import {createWorkspace, isCurrencySupportedForDirectReimbursement} from '@libs/actions/Policy/Policy';
import {navigateToBankAccountRoute} from '@libs/actions/ReimbursementAccount';
import Navigation from '@libs/Navigation/Navigation';
import {isPaidGroupPolicy, isPolicyAdmin} from '@libs/PolicyUtils';
import {isIndividualInvoiceRoom as isIndividualInvoiceRoomUtil} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {PaymentActionParams} from './types';

type InvoicePaymentOptionsParams = {
    data: ReturnType<typeof useSettlementData>;
    checkForNecessaryAction: () => boolean;
    onPress: (params: PaymentActionParams) => void;
    formattedAmount: string;
    lastPaymentMethod: string | undefined;
    hasIntentToPay: boolean;
};

/**
 * Builds invoice-specific payment options including individual/business submenus,
 * bank account sub-items, and the lazy getPolicyID for workspace creation.
 * Only produces options when the report is an invoice report.
 */
function useInvoicePaymentOptions({data, checkForNecessaryAction, onPress, formattedAmount, lastPaymentMethod, hasIntentToPay}: InvoicePaymentOptionsParams) {
    const {icons, translate, chatReport, showPayViaExpensifyOptions, getFilteredBankItems} = data;

    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [isSelfTourViewed] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector});
    const [betas] = useOnyx(ONYXKEYS.BETAS);

    const [personalPolicyID] = useOnyx(ONYXKEYS.PERSONAL_POLICY_ID);
    const invoiceReceiverPolicyID = chatReport?.invoiceReceiver && 'policyID' in chatReport.invoiceReceiver ? chatReport.invoiceReceiver.policyID : undefined;
    const invoiceReceiverPolicy = usePolicy(invoiceReceiverPolicyID);
    const activePolicy = usePolicy(activePolicyID);
    const personalPolicy = usePolicy(personalPolicyID);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();

    const buildInvoiceOptions = (): Array<DropdownOption<string>> => {
        const buttonOptions: Array<DropdownOption<string>> = [];

        const hasActivePolicyAsAdmin = !!activePolicy && isPolicyAdmin(activePolicy) && isPaidGroupPolicy(activePolicy);
        const isActivePolicyCurrencySupported = isCurrencySupportedForDirectReimbursement(activePolicy?.outputCurrency ?? '');
        const isUserCurrencySupported = isCurrencySupportedForDirectReimbursement(personalPolicy?.outputCurrency ?? CONST.CURRENCY.USD);
        const isInvoiceReceiverPolicyCurrencySupported = isCurrencySupportedForDirectReimbursement(invoiceReceiverPolicy?.outputCurrency ?? '');

        const canUseActivePolicy = hasActivePolicyAsAdmin && isActivePolicyCurrencySupported;
        // For business invoice receivers, we use the receiver policy to pay, so validate the receiver policy's currency
        // For individual receivers, allow if user has an active admin policy with supported currency OR user's local currency is supported
        const isPolicyCurrencySupported = invoiceReceiverPolicy ? isInvoiceReceiverPolicyCurrencySupported : canUseActivePolicy || isUserCurrencySupported;

        const getPaymentSubItems = (payAsBusiness: boolean) => {
            return getFilteredBankItems(payAsBusiness, (formattedPaymentMethod) => ({
                text: formattedPaymentMethod?.title ?? '',
                description: formattedPaymentMethod?.description ?? '',
                icon: formattedPaymentMethod?.icon,
                shouldUpdateSelectedIndex: true,
                onSelected: () => {
                    if (checkForNecessaryAction()) {
                        return;
                    }
                    onPress({
                        paymentType: CONST.IOU.PAYMENT_TYPE.EXPENSIFY,
                        payAsBusiness,
                        methodID: formattedPaymentMethod.methodID,
                        paymentMethod: formattedPaymentMethod.accountType,
                    });
                },
                iconStyles: formattedPaymentMethod?.iconStyles,
                iconHeight: formattedPaymentMethod?.iconSize,
                iconWidth: formattedPaymentMethod?.iconSize,
                value: CONST.IOU.PAYMENT_TYPE.EXPENSIFY,
            }));
        };

        // MUST remain lazy — called only in onSelected handlers. Eager evaluation causes createWorkspace() on every render (#79953).
        const getPolicyID = () => {
            if (chatReport?.invoiceReceiver?.type === CONST.REPORT.INVOICE_RECEIVER_TYPE.BUSINESS) {
                return chatReport?.invoiceReceiver?.policyID;
            }

            if (canUseActivePolicy) {
                return activePolicy.id;
            }

            return createWorkspace({
                introSelected,
                activePolicyID,
                currentUserAccountIDParam: currentUserPersonalDetails.accountID,
                currentUserEmailParam: currentUserPersonalDetails.email ?? '',
                betas,
                isSelfTourViewed,
            }).policyID;
        };

        const getInvoicesOptions = (payAsBusiness: boolean) => {
            const addBankAccountItem = {
                text: translate('bankAccount.addBankAccount'),
                icon: icons.Bank,
                onSelected: () => {
                    if (payAsBusiness) {
                        navigateToBankAccountRoute({policyID: getPolicyID()});
                    } else {
                        Navigation.navigate(ROUTES.SETTINGS_ADD_BANK_ACCOUNT.route);
                    }
                },
                value: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
            };
            return [
                ...(showPayViaExpensifyOptions ? getPaymentSubItems(payAsBusiness) : []),
                ...(showPayViaExpensifyOptions && isPolicyCurrencySupported ? [addBankAccountItem] : []),
                {
                    text: translate('iou.payElsewhere', ''),
                    icon: icons.Cash,
                    value: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
                    shouldUpdateSelectedIndex: true,
                    onSelected: () => {
                        if (checkForNecessaryAction()) {
                            return;
                        }
                        onPress({paymentType: CONST.IOU.PAYMENT_TYPE.ELSEWHERE, payAsBusiness});
                    },
                },
            ];
        };

        if (isIndividualInvoiceRoomUtil(chatReport)) {
            // Gate default so main split button never triggers Pay via Expensify when beta is off (or currency unsupported).
            let invoiceDefaultValue = lastPaymentMethod ?? CONST.IOU.PAYMENT_TYPE.ELSEWHERE;
            if (showPayViaExpensifyOptions && (hasIntentToPay || lastPaymentMethod === CONST.IOU.PAYMENT_TYPE.EXPENSIFY)) {
                invoiceDefaultValue = CONST.IOU.PAYMENT_TYPE.EXPENSIFY;
            } else if (lastPaymentMethod === CONST.IOU.PAYMENT_TYPE.EXPENSIFY) {
                invoiceDefaultValue = CONST.IOU.PAYMENT_TYPE.ELSEWHERE;
            }
            buttonOptions.push({
                text: translate('iou.settlePersonal', formattedAmount),
                icon: icons.User,
                value: invoiceDefaultValue,
                backButtonText: translate('iou.individual'),
                subMenuItems: getInvoicesOptions(false),
            });
            buttonOptions.push({
                text: translate('iou.settleBusiness', formattedAmount),
                icon: icons.Building,
                value: invoiceDefaultValue,
                backButtonText: translate('iou.business'),
                subMenuItems: getInvoicesOptions(true),
            });
        } else {
            // If there is pay as business option, we should show the submenu items instead.
            buttonOptions.push(...getInvoicesOptions(true));
        }

        return buttonOptions;
    };

    return {buildInvoiceOptions};
}

export default useInvoicePaymentOptions;
