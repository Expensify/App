/** Model of BillingGraceEndPeriod's Shared NVP record */
type BillingGraceEndPeriod = {
    /** The name of the NVP key. */
    name: string;

    /** The permission associated with the NVP key. */
    permissions: string;

    /** The grace period end date (epoch timestamp) of the workspace's owner where the user is a member of. */
    value: number;
};

export default BillingGraceEndPeriod;
