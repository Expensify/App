import type {PolicyConnectionName} from './Policy';

/** Record of normalized policy vendors, indexed by externalID. */
type PolicyVendors = Record<
    string,
    {
        /** The vendor identifier scoped to its active accounting connection. */
        externalID: string;

        /** The accounting-system display name. */
        name: string;

        /** Whether the policy preference permits this vendor to be selected. */
        enabled: boolean;

        /** The active accounting connection that supplied this vendor. */
        origin?: PolicyConnectionName;
    }
>;

export default PolicyVendors;
