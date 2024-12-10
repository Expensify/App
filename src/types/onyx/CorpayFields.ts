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
};

/** CorpayFormFields */
type CorpayFormFields = {
    /** Country of the bank */
    bankCountry: string;
    /** Currency of the bank */
    bankCurrency: string;
    /** Classification of the bank */
    classification: string;
    /** Destination country of the bank */
    destinationCountry: string;
    /** Form fields for the Corpay form */
    formFields: CorpayFormField[];
    /** Preferred method for the bank */
    preferredMethod: string;
    /** Indicates if the fields are loading */
    isLoading: boolean;
    /** Indicates if the fields loaded successfully */
    isSuccess: boolean;
};

export default CorpayFormFields;

export type {CorpayFormField};
