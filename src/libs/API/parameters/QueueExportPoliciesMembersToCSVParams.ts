// TODO: Placeholder until the backend command lands. Update to match its final parameters.
type QueueExportPoliciesMembersToCSVParams = {
    /** CSV list of the workspace IDs the action applies to */
    policyIDList: string;

    /** ID of the export record the backend updates once the file is ready */
    exportID: string;
};

export default QueueExportPoliciesMembersToCSVParams;
