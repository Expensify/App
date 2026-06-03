/** A map of pinned hostname to the list of accepted base64-encoded SHA-256 SPKI hashes for that host. */
type PinnedDomains = Record<string, string[]>;

export default PinnedDomains;
