/**
 *
 */
type CorpayFormField = {
    /**
     *
     */
    errorMessage: string;
    /**
     *
     */
    id: string;
    /**
     *
     */
    isRequired: boolean;
    /**
     *
     */
    isRequiredInValueSet: boolean;
    /**
     *
     */
    label: string;
    /**
     *
     */
    regEx: string;
    /**
     *
     */
    validationRules: Array<{
        /**
         *
         */
        errorMessage: string;
        /**
         *
         */
        regEx: string;
    }>;
    /**
     *
     */
    valueSet?: Array<{
        /**
         *
         */
        id: string;
        /**
         *
         */
        text: string;
    }>;
    /**
     *
     */
    links?: Array<{
        /**
         *
         */
        content: {
            /**
             *
             */
            isCompleteList: boolean;
            /**
             *
             */
            regions: Array<{
                /**
                 *
                 */
                code: string;
                /**
                 *
                 */
                country: string;
                /**
                 *
                 */
                countryName: string;
                /**
                 *
                 */
                id: string;
                /**
                 *
                 */
                name: string;
            }>;
        };
    }>;
};

/**
 *
 */
type CorpayFields = {
    /**
     *
     */
    bankCountry: string;
    /**
     *
     */
    bankCurrency: string;
    /**
     *
     */
    classification: string;
    /**
     *
     */
    destinationCountry: string;
    /**
     *
     */
    paymentMethods: string[];
    /**
     *
     */
    preferredMethod: string;
    /**
     *
     */
    formFields: CorpayFormField[];
};

/**
 *
 */
type CorpayFieldsMap = Record<string, CorpayFormField>;

export type {CorpayFields, CorpayFormField, CorpayFieldsMap};
