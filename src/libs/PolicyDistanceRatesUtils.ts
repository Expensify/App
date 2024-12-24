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

function validateRateValue(
    values: FormOnyxValues<RateValueForm>,
    customUnitRates: Record<string, Rate>,
    toLocaleDigit: (arg: string) => string,
    currentRateValue?: number,
): FormInputErrors<RateValueForm> {
    const errors: FormInputErrors<RateValueForm> = {};
    const parsedRate = MoneyRequestUtils.replaceAllDigits(values.rate, toLocaleDigit);
    const decimalSeparator = toLocaleDigit('.');
    const ratesList = Object.values(customUnitRates)
        .filter((rate) => currentRateValue !== rate.rate)
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        .map((r) => ({...r, rate: parseFloat(Number(r.rate || 0).toFixed(10))}));
    // The following logic replicates the backend's handling of rates:
    // - Multiply the rate by 100 (CUSTOM_UNIT_RATE_BASE_OFFSET) to scale it, ensuring precision.
    // - This ensures rates are converted as follows:
    //   12       -> 1200
    //   12.1     -> 1210
    //   12.01    -> 1201
    //   12.001   -> 1200.1
    //   12.0001  -> 1200.01
    // - Using parseFloat and toFixed(10) retains the necessary precision.
    const convertedRate = parseFloat((Number(values.rate || 0) * CONST.POLICY.CUSTOM_UNIT_RATE_BASE_OFFSET).toFixed(10));

    // Allow one more decimal place for accuracy
    const rateValueRegex = RegExp(String.raw`^-?\d{0,8}([${getPermittedDecimalSeparator(decimalSeparator)}]\d{0,${CONST.MAX_TAX_RATE_DECIMAL_PLACES}})?$`, 'i');
    if (!rateValueRegex.test(parsedRate) || parsedRate === '') {
        errors.rate = Localize.translateLocal('common.error.invalidRateError');
    } else if (ratesList.some((r) => r.rate === convertedRate)) {
        errors.rate = Localize.translateLocal('workspace.perDiem.errors.existingRateError', {rate: Number(values.rate)});
    } else if (NumberUtils.parseFloatAnyLocale(parsedRate) <= 0) {
        errors.rate = Localize.translateLocal('common.error.lowRateError');
    }
    return errors;
}

function validateTaxClaimableValue(values: FormOnyxValues<TaxReclaimableForm>, rate: Rate | undefined): FormInputErrors<TaxReclaimableForm> {
    const errors: FormInputErrors<TaxReclaimableForm> = {};

    if (rate?.rate && Number(values.taxClaimableValue) > rate.rate / 100) {
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
