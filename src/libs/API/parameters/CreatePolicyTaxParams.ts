import type {TaxRate} from '@src/types/onyx/Policy';

type CreatePolicyTaxParams = {
    policyID: string;
    taxFields: Pick<TaxRate, 'name' | 'value'> & {
        enabled: true;
        taxCode: string;
    };
};

export default CreatePolicyTaxParams;
