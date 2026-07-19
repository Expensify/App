/** Each NVP rides as its own `nameValuePairs[<name>]` form field so PHP's `$_REQUEST` parses it as an associative array (a single JSON-encoded string is read back as empty). An empty value deletes the NVP. */
type SetNameValuePairsParams = Record<`nameValuePairs[${string}]`, string>;

export default SetNameValuePairsParams;
