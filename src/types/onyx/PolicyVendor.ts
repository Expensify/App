/** An imported vendor normalized by Auth from the active accounting connection. */
type PolicyVendor = {
    /** The vendor identifier scoped to its active accounting connection. */
    externalID: string;

    /** The accounting-system display name. */
    name: string;

    /** Whether the workspace preference permits this vendor to be selected. */
    enabled: boolean;

    /** The active accounting connection that supplied this vendor. */
    origin?: string;
};

/** Record of normalized policy vendors, indexed by externalID. */
type PolicyVendors = Record<string, PolicyVendor>;

export type {PolicyVendor, PolicyVendors};
