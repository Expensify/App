type PolicyTaxRate = {
    /** The name of the tax rate. */
    name: string;

    /** The value of the tax rate. */
    value: string;

    /** The code associated with the tax rate. */
    code: string;

    /** This contains the tax name and tax value as one name */
    modifiedName: string;

    /** Indicates if the tax rate is disabled. */
    isDisabled?: boolean;

    /** Default policy tax ID */
    defaultExternalID: string;

    /** List of tax names and values */
    taxes: PolicyTaxRates;
};

type PolicyTaxRates = Record<string, PolicyTaxRate>;

export type {PolicyTaxRates, PolicyTaxRate};
