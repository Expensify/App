type UpdateWorkspaceCustomUnitParams = {
    policyID: string;
} & (
    | {
          customUnit: string;
          customUnitID?: never;
          customUnitRate?: never;
          customUnitRateUpdates?: never;
          customUnitRateIDs?: never;
          deleteAllRates?: never;
      }
    | {
          customUnit?: never;
          customUnitID: string;
          customUnitRate: string;
          customUnitRateUpdates?: never;
          customUnitRateIDs?: never;
          deleteAllRates?: never;
      }
    | {
          customUnit?: never;
          customUnitID: string;
          customUnitRate?: never;
          customUnitRateUpdates: string;
          customUnitRateIDs?: string;
          deleteAllRates?: never;
      }
    | {
          customUnit?: never;
          customUnitID: string;
          customUnitRate?: never;
          customUnitRateUpdates?: string;
          customUnitRateIDs: string;
          deleteAllRates?: never;
      }
    | {
          customUnit?: never;
          customUnitID: string;
          customUnitRate?: never;
          customUnitRateUpdates?: never;
          customUnitRateIDs?: never;
          deleteAllRates: true;
      }
);

export default UpdateWorkspaceCustomUnitParams;
