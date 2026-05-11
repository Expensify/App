import type {Errors} from './OnyxCommon';

/** Onyx state of the Copy Policy Settings (bulk workspace edits) flow */
type CopyPolicySettings = {
    /** The source policy ID we're copying settings FROM */
    sourcePolicyID?: string;

    /** The list of target policy IDs we're copying settings TO */
    targetPolicyIDs?: string[];

    /** Which feature parts are selected for copying */
    parts?: string[];

    /**
     * Which step of the copy is happening in the backend
     * - `loading`: copy in progress
     * - `complete`: backend finished
     * - undefined: copy hasn't started yet (e.g. user is still selecting features)
     */
    currentStep?: 'loading' | 'complete' | undefined;

    /** Error state */
    errors?: Errors;
};

export default CopyPolicySettings;
