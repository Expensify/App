import type {PolicyReportField} from '@src/types/onyx';

type PolicyReportFields = {[key: string]: PolicyReportField};

type DeletePolicyReportFieldParams = {
    policyID: string;
} & PolicyReportFields;

export default DeletePolicyReportFieldParams;
