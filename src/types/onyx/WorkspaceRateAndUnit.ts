type Unit = 'mi' | 'km';

type WorkspaceRateAndUnit = {
    /** policyID of the Workspace */
    policyID: string;

    /** Unit of the Workspace */
    unit?: Unit;

    /** Unit of the Workspace */
    rate?: string;
};

export default WorkspaceRateAndUnit;
