/**
 * Validation and sanitization for workspace per diem destination, subrate, and amount fields.
 * Shared by the RHP edit forms and inline table editing so both surfaces reject the same values.
 */
import type {LocaleContextProps} from '@components/LocaleContextProvider';

import CONST from '@src/CONST';

import {convertToBackendAmount} from './CurrencyUtils';

/** The reason a proposed per diem destination or subrate name is invalid. */
type PerDiemNameError = 'required' | 'tooLong';

/** The reason a proposed per diem amount is invalid. Shared by the RHP edit form and inline table editing. */
type PerDiemAmountError = 'required';

/** Normalizes a per diem destination or subrate name by converting non-breaking spaces and trimming. */
function sanitizePerDiemName(name: string): string {
    return name.replaceAll(CONST.REGEX.NON_BREAKING_SPACE, ' ').trim();
}

/**
 * Validates a per diem destination or subrate name against the same rules as the RHP edit forms
 * (required and max length). Returns an error code, or undefined when the name is valid.
 */
function getPerDiemNameError(newName: string): PerDiemNameError | undefined {
    const sanitized = sanitizePerDiemName(newName);

    if (!sanitized) {
        return 'required';
    }

    // Spread to count Unicode code points rather than UTF-16 code units.
    if ([...sanitized].length > CONST.MAX_LENGTH_256) {
        return 'tooLong';
    }

    return undefined;
}

/** Translates a {@link PerDiemNameError} into a user-facing message for the given name. */
function getPerDiemNameErrorMessage(translate: LocaleContextProps['translate'], error: PerDiemNameError, name: string): string {
    switch (error) {
        case 'required':
            return translate('common.error.fieldRequired');
        case 'tooLong':
        default:
            return translate('common.error.characterLimitExceedCounter', [...sanitizePerDiemName(name)].length, CONST.MAX_LENGTH_256);
    }
}

/**
 * Validates a per diem amount against the same rules as the RHP edit form (required, not zero,
 * and not a lone minus sign). Negatives are allowed. Returns an error code, or undefined when
 * the amount is valid.
 */
function getPerDiemAmountError(amount: string): PerDiemAmountError | undefined {
    const trimmed = amount.trim();
    if (!trimmed || trimmed === '-') {
        return 'required';
    }

    const numeric = Number(trimmed);
    if (Number.isNaN(numeric) || convertToBackendAmount(numeric) === 0) {
        return 'required';
    }

    return undefined;
}

/** Translates a {@link PerDiemAmountError} into a user-facing message. */
function getPerDiemAmountErrorMessage(translate: LocaleContextProps['translate'], error: PerDiemAmountError): string {
    switch (error) {
        case 'required':
        default:
            return translate('common.error.fieldRequired');
    }
}

export {sanitizePerDiemName, getPerDiemNameError, getPerDiemNameErrorMessage, getPerDiemAmountError, getPerDiemAmountErrorMessage};
export type {PerDiemNameError, PerDiemAmountError};
