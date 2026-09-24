/**
 * Represents a form field with validation rules.
 */
type CorpayFormField = {
    /** Error message for the form field */
    errorMessage: string;
    /** Unique identifier for the form field */
    id: string;
    isRequired: boolean;
    isRequiredInValueSet: boolean;
    /** Label for the form field */
    label: string;
    /** Regular expression for the form field */
    regEx: string;
    /** Validation rules for the form field */
    validationRules: Array<{
        /** Error message for the validation rule */
        errorMessage: string;
        /** Regular expression for the validation rule */
        regEx: string;
    }>;
    /** Contains possible list of values for dropdown field */
    valueSet?: Array<{
        /** Unique identifier for the form field value */
        id: string;
        /** Label for the form field value */
        text: string;
        /** Value */
        code: string;
    }>;
    /** Contains possible list of values for dropdown field (only for Canada region fields) */
    links?: Array<{
        /** Contains possible list of values for dropdown field (only for Canada region fields) */
        content: {
            isCompleteList: boolean;
            regions: Array<{
                /** Region code */
                code: string;
                /** Region country code */
                country: string;
                /** Region country name */
                countryName: string;
                /** Unique Region identifier */
                id: string;
                /** Region name */
                name: string;
            }>;
        };
    }>;
};

/** CorpayFields */
type CorpayFields = {
    bankCountry: string;
    bankCurrency: string;
    /** Classification of the bank */
    classification: string;
    /** Destination country of the bank */
    destinationCountry: string;
    paymentMethods: string[];
    /** Preferred method for the bank */
    preferredMethod: string;
    formFields: CorpayFormField[];
    isLoading: boolean;
    /** Indicates if the fields loaded successfully */
    isSuccess: boolean;
};

/** CorpayFieldsMap */
type CorpayFieldsMap = Record<string, CorpayFormField>;

export type {CorpayFields, CorpayFormField, CorpayFieldsMap};
