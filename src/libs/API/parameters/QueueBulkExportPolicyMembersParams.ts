type QueueBulkExportPolicyMembersParams = {
    /** CSV list of the workspace IDs the action applies to */
    policyIDList: string;

    /** ID of the export record the backend updates once the file is ready */
    exportID: string;
};

export default QueueBulkExportPolicyMembersParams;
