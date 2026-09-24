import CONST from '@src/CONST';

import type {BankAccountCountries, BankAccountFieldsMap} from './types';

import internationalFieldsJSON from './internationalFields.json';
import localFieldsJSON from './localFields.json';

/** Fields to collect when the employer banks in the account's country, so the transfer is domestic. */
const localFields = localFieldsJSON as BankAccountCountries;

/** Fields to collect when the money arrives from abroad. Holds a `default` wire mapping plus per-country overrides. */
const internationalFields = internationalFieldsJSON as BankAccountCountries;

/** Key the mappings use for countries that define one set of fields rather than one per currency. */
const DEFAULT_KEY = 'default';

/**
 * Returns the fields to collect for a country and currency, or an empty map when the country is not mapped.
 * The local mapping is keyed by currency because a country can hold accounts in several; the international one is not.
 */
function getBankAccountFields(countryISO: string, currency: string, fieldsType: string): BankAccountFieldsMap {
    if (fieldsType === CONST.BANK_ACCOUNT.FIELDS_TYPE.LOCAL) {
        return localFields[countryISO]?.currenciesFields?.[currency] ?? {};
    }

    const {currenciesFields} = internationalFields[countryISO] ?? internationalFields[DEFAULT_KEY] ?? {};

    return currenciesFields?.[currency] ?? currenciesFields?.[DEFAULT_KEY] ?? {};
}

/** Currencies a country can hold a local account in, so the flow can offer them on the country step. */
function getLocalCurrencies(countryISO: string): string[] {
    return Object.keys(localFields[countryISO]?.currenciesFields ?? {});
}

export {getBankAccountFields, getLocalCurrencies};
