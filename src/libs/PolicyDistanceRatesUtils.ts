import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import CONST from '@src/CONST';
import type ONYXKEYS from '@src/ONYXKEYS';
import type {Rate} from '@src/types/onyx/Policy';
import getPermittedDecimalSeparator from './getPermittedDecimalSeparator';
import * as Localize from './Localize';
import * as MoneyRequestUtils from './MoneyRequestUtils';
import * as NumberUtils from './NumberUtils';

type RateValueForm = typeof ONYXKEYS.FORMS.POLICY_CREATE_DISTANCE_RATE_FORM | typeof ONYXKEYS.FORMS.POLICY_DISTANCE_RATE_EDIT_FORM;

type TaxReclaimableForm = typeof ONYXKEYS.FORMS.POLICY_DISTANCE_RATE_TAX_RECLAIMABLE_ON_EDIT_FORM;

function validateRateValue(values: FormOnyxValues<RateValueForm>, currency: string, toLocaleDigit: (arg: string) => string): FormInputErrors<RateValueForm> {
    const errors: FormInputErrors<RateValueForm> = {};
    const parsedRate = MoneyRequestUtils.replaceAllDigits(values.rate, toLocaleDigit);
    const decimalSeparator = toLocaleDigit('.');

    // Allow one more decimal place for accuracy
    const rateValueRegex = RegExp(String.raw`^-?\d{0,8}([${getPermittedDecimalSeparator(decimalSeparator)}]\d{0,4})?$`, 'i');
    if (!rateValueRegex.test(parsedRate) || parsedRate === '') {
        errors.rate = Localize.translateLocal('common.error.invalidRateError');
    } else if (NumberUtils.parseFloatAnyLocale(parsedRate) <= 0) {
        errors.rate = Localize.translateLocal('common.error.lowRateError');
    }
    return errors;
}

function validateTaxClaimableValue(values: FormOnyxValues<TaxReclaimableForm>, rate: Rate): FormInputErrors<TaxReclaimableForm> {
    const errors: FormInputErrors<TaxReclaimableForm> = {};

    if (rate.rate && Number(values.taxClaimableValue) > rate.rate / 100) {
        errors.taxClaimableValue = Localize.translateLocal('workspace.taxes.error.updateTaxClaimableFailureMessage');
    }
    return errors;
}

/**
 * Get the optimistic rate name in a way that matches BE logic
 * @param rates
 */
function getOptimisticRateName(rates: Record<string, Rate>): string {
    const existingRatesWithSameName = Object.values(rates ?? {}).filter((rate) => (rate.name ?? '').startsWith(CONST.CUSTOM_UNITS.DEFAULT_RATE));
    return existingRatesWithSameName.length ? `${CONST.CUSTOM_UNITS.DEFAULT_RATE} ${existingRatesWithSameName.length}` : CONST.CUSTOM_UNITS.DEFAULT_RATE;
}

export {validateRateValue, getOptimisticRateName, validateTaxClaimableValue};
