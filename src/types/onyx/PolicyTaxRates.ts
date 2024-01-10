type PolicyTaxRate = {
    /** Name of a tax */
    name: string;

    /** The value of a tax */
    value: string;

    /** Whether the tax is disabled */
    isDisabled?: boolean;

    defaultExternalID: string;

    taxes: PolicyTaxRates;
};

type PolicyTaxRates = Record<string, PolicyTaxRate>;
export default PolicyTaxRate;
export type {PolicyTaxRates};
