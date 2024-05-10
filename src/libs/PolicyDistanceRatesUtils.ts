import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import CONST from '@src/CONST';
import type ONYXKEYS from '@src/ONYXKEYS';
import type {Rate} from '@src/types/onyx/Policy';
import * as CurrencyUtils from './CurrencyUtils';
import getPermittedDecimalSeparator from './getPermittedDecimalSeparator';
import * as MoneyRequestUtils from './MoneyRequestUtils';
import * as NumberUtils from './NumberUtils';

type RateValueForm = typeof ONYXKEYS.FORMS.WORKSPACE_RATE_AND_UNIT_FORM | typeof ONYXKEYS.FORMS.POLICY_CREATE_DISTANCE_RATE_FORM | typeof ONYXKEYS.FORMS.POLICY_DISTANCE_RATE_EDIT_FORM;

function validateRateValue(values: FormOnyxValues<RateValueForm>, currency: string, toLocaleDigit: (arg: string) => string): FormInputErrors<RateValueForm> {
    const errors: FormInputErrors<RateValueForm> = {};
    const parsedRate = MoneyRequestUtils.replaceAllDigits(values.rate, toLocaleDigit);
    const decimalSeparator = toLocaleDigit('.');

    // Allow one more decimal place for accuracy
    const rateValueRegex = RegExp(String.raw`^-?\d{0,8}([${getPermittedDecimalSeparator(decimalSeparator)}]\d{0,${CurrencyUtils.getCurrencyDecimals(currency) + 1}})?$`, 'i');
    if (!rateValueRegex.test(parsedRate) || parsedRate === '') {
        errors.rate = 'workspace.reimburse.invalidRateError';
    } else if (NumberUtils.parseFloatAnyLocale(parsedRate) <= 0) {
        errors.rate = 'workspace.reimburse.lowRateError';
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

export {validateRateValue, getOptimisticRateName};
