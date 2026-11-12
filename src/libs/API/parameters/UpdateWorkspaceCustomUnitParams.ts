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
    // A targeted rate deletion sends customUnitRateUpdates, customUnitRateIDs, or both in one request.
    | {
          customUnit?: never;
          customUnitID: string;
          customUnitRate?: never;

          /** JSON array of complete `Rate` objects. Each one replaces the destination with the same `customUnitRateID`. */
          customUnitRateUpdates: string;

          /** JSON array of `customUnitRateID` strings whose destinations are removed */
          customUnitRateIDs?: string;
          deleteAllRates?: never;
      }
    | {
          customUnit?: never;
          customUnitID: string;
          customUnitRate?: never;

          /** JSON array of complete `Rate` objects. Each one replaces the destination with the same `customUnitRateID`. */
          customUnitRateUpdates?: string;

          /** JSON array of `customUnitRateID` strings whose destinations are removed */
          customUnitRateIDs: string;
          deleteAllRates?: never;
      }
    | {
          customUnit?: never;
          customUnitID: string;
          customUnitRate?: never;
          customUnitRateUpdates?: never;
          customUnitRateIDs?: never;

          /** Removes every destination of the custom unit while keeping the custom unit itself, so rates can be imported again */
          deleteAllRates: true;
      }
);

export default UpdateWorkspaceCustomUnitParams;
