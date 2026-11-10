import type {PaymentActionParams} from '@components/SettlementButton/types';

import Log from '@libs/Log';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';

import {hasInvoicingDetails} from '@userActions/Policy/Policy';

import CONST from '@src/CONST';
import type {IOUType} from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';

import type {OnyxEntry} from 'react-native-onyx';

import type {ValidationResult} from './hooks/useConfirmationValidation';

type BuildConfirmActionParams = {
    /** IOU type being confirmed (submit / split / track / pay / invoice) */
    iouType: IOUType;

    /** Policy the IOU belongs to, used to detect missing invoice company info */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** Transaction being confirmed, when one exists */
    transactionID: string | undefined;

    /** Truthy when the route to the confirmation page has a known error */
    routeError: string | null | undefined;

    /** Current form-level error key, or '' when no error is set */
    formError: TranslationPaths | '';

    /** Whether the current user is a delegate without permission to pay */
    isDelegateAccessRestricted: boolean;

    /** Returns the first check that blocks confirming, `{errorKey: null}` when none does, or null when validation can't run yet */
    validate: (paymentType?: PaymentMethodType) => ValidationResult | null;

    /** Sets the form error for a check that blocks confirming */
    setConfirmError: (error: TranslationPaths) => void;

    /** Drops the form error the last confirm set, since validation checks it again on the next confirm */
    clearConfirmError: () => void;

    /** Shows the errors of the amount, date and merchant fields, which render on the fields rather than in the form error */
    revealFieldErrors: () => void;

    /** Setter for the "user already confirmed split" flag */
    setDidConfirmSplit: (value: boolean) => void;

    /** Shows the modal that explains delegate-no-access restrictions */
    showDelegateNoAccessModal: () => void;

    /** Caller-provided confirm handler for non-pay flows */
    onConfirm?: () => void;

    /** Caller-provided send-money handler for pay flows */
    onSendMoney?: (paymentMethod: PaymentMethodType | undefined) => void;
};

/**
 * Owns the click-confirm action for the Money Request confirmation flow.
 *
 * Validation always runs first. A field error is revealed on its field, dropping a form error an earlier confirm
 * set, and any other failure becomes the form error. Past validation there are three branches: (1) invoice-without-company-info routes to the
 * company info step; (2) non-PAY types invoke `onConfirm`; (3) PAY types run delegate-access gating and
 * invoke `onSendMoney` with the chosen payment method.
 */
function buildConfirmAction({
    iouType,
    policy,
    transactionID,
    routeError,
    formError,
    isDelegateAccessRestricted,
    validate,
    setConfirmError,
    clearConfirmError,
    revealFieldErrors,
    setDidConfirmSplit,
    showDelegateNoAccessModal,
    onConfirm,
    onSendMoney,
}: BuildConfirmActionParams) {
    return ({paymentType: paymentMethod}: PaymentActionParams = {}) => {
        const result = validate(paymentMethod);
        if (!result) {
            return;
        }

        if ('isFieldError' in result) {
            clearConfirmError();
            revealFieldErrors();
            return;
        }

        if (result.errorKey) {
            if (result.shouldSetDidConfirmSplit) {
                setDidConfirmSplit(true);
            }
            setConfirmError(result.errorKey);
            return;
        }

        if (iouType === CONST.IOU.TYPE.INVOICE && !hasInvoicingDetails(policy) && transactionID && !routeError) {
            Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.MONEY_REQUEST_STEP_COMPANY_INFO.path));
            return;
        }

        if (iouType !== CONST.IOU.TYPE.PAY) {
            if (formError) {
                return;
            }
            onConfirm?.();
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
