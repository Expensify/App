type TaxRate = {
    /** Name of a tax */
    name: string;

    /** The value of a tax */
    value: string;

    /** Whether the tax is disabled */
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

export default TaxRate;
export type {TaxRates, PolicyTaxRates};
