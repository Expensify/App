import type {Policy} from '@src/types/onyx';

type EnablePolicyTaxesParams = {
    policyID: string;
    enabled: boolean;
    taxFields?: Partial<Policy>;
};

export default EnablePolicyTaxesParams;
