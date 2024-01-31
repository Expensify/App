type TaxRate = {
    /** Name of the a tax rate. */
    name: string;

    /** The value of the tax rate. */
    value: string;

    /** The code associated with the tax rate. */
    code: string;

    /** This contains the tax name and tax value as one name */
    modifiedName: string;

    /** Indicates if the tax rate is disabled. */
    isDisabled?: boolean;
};

type TaxRates = Record<string, TaxRate>;
type PolicyTaxRates = {
    /** Name of the tax */
    name: string;

    /** Default policy tax ID */
    defaultExternalID: string;

    /** Default value of taxes */
    defaultValue: string;

    /** Default foreign policy tax ID */
    foreignTaxDefault: string;

    /** List of tax names and values */
    taxes: TaxRates;
};

export type {TaxRate, TaxRates, PolicyTaxRates};
