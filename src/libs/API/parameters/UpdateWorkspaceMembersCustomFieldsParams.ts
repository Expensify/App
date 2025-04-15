import type {CustomFieldType} from '@src/types/onyx/PolicyEmployee';

type UpdateWorkspaceMembersCustomFieldsParams = {
    policyID: string;
    employees: Array<{email: string; customField1?: string; customField2?: CustomFieldType}>;
};

export default UpdateWorkspaceMembersCustomFieldsParams;
