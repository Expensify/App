/**
 * Represents a form field with validation rules.
 */
type CorpayFormField = {
    /** Error message for the form field */
    errorMessage: string;
    /** Unique identifier for the form field */
    id: string;
    /** Indicates if the field is required */
    isRequired: boolean;
    /** Indicates if the field is required in the value set */
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
    }>;
    /** Contains possible list of values for dropdown field (only for Canada region fields) */
    links?: Array<{
        /** Contains possible list of values for dropdown field (only for Canada region fields) */
        content: {
            /** Whether the list of values complete */
            isCompleteList: boolean;
            /** The list of regions */
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
    /** Country of the bank */
    bankCountry: string;
    /** Currency of the bank */
    bankCurrency: string;
    /** Classification of the bank */
    classification: string;
    /** Destination country of the bank */
    destinationCountry: string;
    /** Possible payment methods */
    paymentMethods: string[];
    /** Preferred method for the bank */
    preferredMethod: string;
    /** Form fields for the Corpay form */
    formFields: CorpayFormField[];
    /** Indicates if the fields are loading */
    isLoading: boolean;
    /** Indicates if the fields loaded successfully */
    isSuccess: boolean;
};

/** CorpayFieldsMap */
type CorpayFieldsMap = Record<string, CorpayFormField>;

export type {CorpayFields, CorpayFormField, CorpayFieldsMap};
