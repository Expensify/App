import type {LocaleContextProps} from '@components/LocaleContextProvider';

import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type {CollectDepositAccountForm} from '@src/types/form';
import INPUT_IDS from '@src/types/form/CollectDepositAccountForm';

import type {BankAccountFieldsMap} from './BankAccountFields/types';

import {addErrorMessage} from './ErrorUtils';

// The only fields carrying a length or format validator, so the rest never reach the mismatch message.
const INVALID_VALUE_MESSAGES: Record<string, TranslationPaths> = {
    [INPUT_IDS.ROUTING_NUMBER]: 'bankAccount.error.routingNumber',
    [INPUT_IDS.ACCOUNT_NUMBER]: 'bankAccount.error.accountNumber',
};

/** Validates against the mapping's regexes, which are the same ones the API applies to local submissions. */
function getValidationErrors(values: CollectDepositAccountForm, fieldsMap: BankAccountFieldsMap, translate: LocaleContextProps['translate']): Record<string, string> {
    const errors: Record<string, string> = {};

    for (const [fieldName, field] of Object.entries(fieldsMap)) {
        const value = values[fieldName] ?? '';
        const matchesValidator = new RegExp(`^(?:${field.validator})$`);

        if (!value) {
            // A validator that accepts an empty string marks the field optional, like the IRC on a wire transfer.
            if (!matchesValidator.test('')) {
                addErrorMessage(errors, fieldName, translate('common.error.fieldRequired'));
            }
            continue;
        }

        if (!matchesValidator.test(value)) {
            addErrorMessage(errors, fieldName, field.errorMessage || translate(INVALID_VALUE_MESSAGES[fieldName] ?? 'common.error.invalidCharacter'));
        }
    }

    return errors;
}

/** Account and routing numbers go top level. The rest, plus country, currency and fields type, go in additionalData. */
function getSubmitParameters(values: CollectDepositAccountForm, fieldsMap: BankAccountFieldsMap, fieldsType: string, shouldConfirm = false) {
    const additionalData: Record<string, string> = {
        country: values[INPUT_IDS.BANK_COUNTRY] ?? '',
        currency: values[INPUT_IDS.BANK_CURRENCY] ?? '',
        fieldsType,
    };

    for (const fieldName of Object.keys(fieldsMap)) {
        if (fieldName === INPUT_IDS.ROUTING_NUMBER || fieldName === INPUT_IDS.ACCOUNT_NUMBER) {
            continue;
        }
        additionalData[fieldName] = values[fieldName] ?? '';
    }

    // addressName is left out because the API names the account after the holder, and every mapping collects a name.
    return {
        routingNumber: values[INPUT_IDS.ROUTING_NUMBER] ?? '',
        accountNumber: values[INPUT_IDS.ACCOUNT_NUMBER] ?? '',
        additionalData: JSON.stringify(additionalData),
        setupType: CONST.BANK_ACCOUNT.SETUP_TYPE.MANUAL,
        confirm: shouldConfirm,
    };
}

export {getSubmitParameters, getValidationErrors};
