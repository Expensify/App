type UpdateWorkspaceCustomUnitParams = {
    policyID: string;
} & (
    | {
          customUnit: string;
          customUnitID?: never;
          customUnitRate?: never;
      }
    | {
          customUnit?: never;
          customUnitID: string;
          customUnitRate: string;
      }
);

export default UpdateWorkspaceCustomUnitParams;
