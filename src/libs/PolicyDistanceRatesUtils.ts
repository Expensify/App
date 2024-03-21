import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import type ONYXKEYS from '@src/ONYXKEYS';
import * as CurrencyUtils from './CurrencyUtils';
import getPermittedDecimalSeparator from './getPermittedDecimalSeparator';
import * as MoneyRequestUtils from './MoneyRequestUtils';
import * as NumberUtils from './NumberUtils';

type RateValueForm = typeof ONYXKEYS.FORMS.WORKSPACE_RATE_AND_UNIT_FORM | typeof ONYXKEYS.FORMS.POLICY_CREATE_DISTANCE_RATE_FORM;

function validateRateValue(values: FormOnyxValues<RateValueForm>, currency: string, toLocaleDigit: (arg: string) => string): FormInputErrors<RateValueForm> {
    const errors: FormInputErrors<RateValueForm> = {};
    const parsedRate = MoneyRequestUtils.replaceAllDigits(values.rate, toLocaleDigit);
    const decimalSeparator = toLocaleDigit('.');

    // Allow one more decimal place for accuracy
    const rateValueRegex = RegExp(String.raw`^-?\d{0,8}([${getPermittedDecimalSeparator(decimalSeparator)}]\d{1,${CurrencyUtils.getCurrencyDecimals(currency) + 1}})?$`, 'i');
    if (!rateValueRegex.test(parsedRate) || parsedRate === '') {
        errors.rate = 'workspace.reimburse.invalidRateError';
    } else if (NumberUtils.parseFloatAnyLocale(parsedRate) <= 0) {
        errors.rate = 'workspace.reimburse.lowRateError';
    }
    return errors;
}

export default validateRateValue;
