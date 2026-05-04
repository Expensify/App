import type {OnyxEntry} from 'react-native-onyx';
import type {PaymentActionParams} from '@components/SettlementButton/types';
import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import {hasInvoicingDetails} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import type {IOUType} from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';

type BuildConfirmActionParams = {
    /** IOU type being confirmed (submit / split / track / pay / invoice) */
    iouType: IOUType;

    /** Policy the IOU belongs to, used to detect missing invoice company info */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** Transaction being confirmed, when one exists */
    transactionID: string | undefined;

    /** Report the IOU is being created on */
    reportID: string;

    /** Truthy when the route to the confirmation page has a known error */
    routeError: string | null | undefined;

    /** Current form-level error key, or '' when no error is set */
    formError: TranslationPaths | '';

    /** Participants selected for this IOU */
    selectedParticipants: Participant[];

    /** Whether the current user is a delegate without permission to pay */
    isDelegateAccessRestricted: boolean;

    /** Pure validator that returns the first failing translation key, or null on success */
    validate: (paymentType?: PaymentMethodType) => {errorKey: TranslationPaths; shouldSetDidConfirmSplit?: boolean} | {errorKey: null} | null;

    /** Setter for the form-level error key */
    setFormError: (error: TranslationPaths | '') => void;

    /** Setter for the "user already confirmed split" flag */
    setDidConfirmSplit: (value: boolean) => void;

    /** Shows the modal that explains delegate-no-access restrictions */
    showDelegateNoAccessModal: () => void;

    /** Caller-provided confirm handler for non-pay flows */
    onConfirm?: (selectedParticipants: Participant[]) => void;

    /** Caller-provided send-money handler for pay flows */
    onSendMoney?: (paymentMethod: PaymentMethodType | undefined) => void;
};

/**
 * Owns the click-confirm action for the Money Request confirmation flow.
 *
 * Handles three branches: (1) invoice-without-company-info routes to the company info
 * step before validation; (2) non-PAY types invoke `onConfirm`; (3) PAY types run
 * delegate-access gating and invoke `onSendMoney` with the chosen payment method.
 * Validation results drive form-error state.
 */
function buildConfirmAction({
    iouType,
    policy,
    transactionID,
    reportID,
    routeError,
    formError,
    selectedParticipants,
    isDelegateAccessRestricted,
    validate,
    setFormError,
    setDidConfirmSplit,
    showDelegateNoAccessModal,
    onConfirm,
    onSendMoney,
}: BuildConfirmActionParams) {
    return ({paymentType: paymentMethod}: PaymentActionParams) => {
        // Routing short-circuit: invoices without company info go to the company info step before we validate anything.
        if (iouType === CONST.IOU.TYPE.INVOICE && !hasInvoicingDetails(policy) && transactionID && !routeError) {
            Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_COMPANY_INFO.getRoute(iouType, transactionID, reportID, Navigation.getActiveRoute()));
            return;
        }

        const result = validate(paymentMethod);
        if (!result) {
            return;
        }

        if (result.errorKey) {
            if (result.shouldSetDidConfirmSplit) {
                setDidConfirmSplit(true);
            }
            setFormError(result.errorKey);
            return;
        }

        if (iouType !== CONST.IOU.TYPE.PAY) {
            if (formError) {
                return;
            }
            onConfirm?.(selectedParticipants);
            return;
        }

        // PAY branch side effects.
        if (!paymentMethod) {
            return;
        }
        if (isDelegateAccessRestricted) {
            showDelegateNoAccessModal();
            return;
        }
        if (formError) {
            return;
        }
        Log.info(`[IOU] Sending money via: ${paymentMethod}`);
        onSendMoney?.(paymentMethod);
    };
}

export default buildConfirmAction;
