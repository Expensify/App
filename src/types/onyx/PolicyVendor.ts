import type * as OnyxCommon from './OnyxCommon';
import type {PolicyConnectionName} from './Policy';

type PolicyVendor = OnyxCommon.OnyxValueWithOfflineFeedback<{
    /** The vendor identifier scoped to its active accounting connection. */
    externalID: string;

    /** The accounting-system display name. */
    name: string;

    /** Whether the policy preference permits this vendor to be selected. */
    enabled: boolean;

    /** The active accounting connection that supplied this vendor. */
    origin?: PolicyConnectionName;
}>;

/** Record of normalized policy vendors, indexed by externalID. */
type PolicyVendors = Record<string, PolicyVendor>;

export default PolicyVendors;
export type {PolicyVendor};
