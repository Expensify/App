import type * as OnyxCommon from './OnyxCommon';

/** Model of plaid data */
type DuplicateWorkspace = {
    /** New policy ID */
    policyID?: string;

    /** New workspace name */
    name?: string;

    /** Workspace avatar */
    fileURI?: string;

    /** Whether the data is being fetched from server */
    isLoading?: boolean;

    /** Error messages to show in UI */
    errors?: OnyxCommon.Errors;
};

export default DuplicateWorkspace;
