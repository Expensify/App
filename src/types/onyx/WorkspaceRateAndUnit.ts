/** Units of distance */
type Unit = 'mi' | 'km';

/** Model of workspace distance rate */
type WorkspaceRateAndUnit = {
    /** policyID of the Workspace */
    policyID: string;

    /** Unit of the Workspace */
    unit?: Unit;

    /** Distance rate of the Workspace */
    rate?: string;
};

export default WorkspaceRateAndUnit;
