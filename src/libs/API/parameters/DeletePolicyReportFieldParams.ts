import type {PolicyReportField} from '@src/types/onyx';

type DeletePolicyReportFieldParams = {
    policyID: string;
    reportFields: {
        [k: string]: PolicyReportField;
    };
};

export default DeletePolicyReportFieldParams;
