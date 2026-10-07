/** One input to collect for a bank account */
type BankAccountField = {
    /** Label shown above the input */
    label: string;

    /** Regex the value must match, as a string so it can live in JSON */
    validator: string;

    /** Hint shown inside the input, empty when there is none */
    placeholder: string;

    /** Message shown when the value fails the validator, empty to use the generic one */
    errorMessage: string;
};

/** Inputs for one country and currency, keyed by the parameter name the API expects */
type BankAccountFieldsMap = Record<string, BankAccountField>;

/** Field mappings for one country */
type BankAccountCountry = {
    /** ISO code, or `default` in the international mapping */
    countryISO: string;

    /** Display name of the country */
    countryName: string;

    /** Fields keyed by currency, or by `default` when the country has a single mapping */
    currenciesFields: Record<string, BankAccountFieldsMap>;
};

/** Country field mappings, keyed by country ISO */
type BankAccountCountries = Record<string, BankAccountCountry>;

export type {BankAccountFieldsMap, BankAccountCountries};
