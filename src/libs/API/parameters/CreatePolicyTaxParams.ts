import type {TaxRate} from '@src/types/onyx/Policy';

type CreateWorkspaceTaxParams = {
    policyID: string;
    taxFields: Pick<TaxRate, 'name' | 'value'> & {
        enabled: true;
        taxCode: string;
    };
};

export default CreateWorkspaceTaxParams;
