import type {Errors} from './OnyxCommon';

/**
 * Which step of the copy is happening in the backend
 * - `loading`: copy in progress
 * - `complete`: backend finished
 * - null: copy hasn't started yet (e.g. user is still selecting features)
 */
type CopyPolicySettingsStep = 'loading' | 'complete' | null;

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
     * - null: copy hasn't started yet (e.g. user is still selecting features)
     */
    currentStep?: CopyPolicySettingsStep;

    /** Which step had a notification request */
    notificationRequestedForStep?: CopyPolicySettingsStep;

    /** Error state */
    errors?: Errors;
};

export default CopyPolicySettings;
