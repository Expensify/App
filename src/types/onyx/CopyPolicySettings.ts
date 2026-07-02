import type {ValueOf} from 'type-fest';
import type {Part} from '@libs/actions/Policy/CopyPolicySettings';
import type CONST from '@src/CONST';
import type {Errors} from './OnyxCommon';

/** Onyx state of the Copy Policy Settings (bulk workspace edits) flow */
type CopyPolicySettings = {
    /** The source policy ID we're copying settings FROM */
    sourcePolicyID?: string;

    /** The list of target policy IDs we're copying settings TO */
    targetPolicyIDs?: string[];

    /** Which feature parts are selected for copying */
    parts?: Part[];

    /**
     * Current step of the copy progress modal (UI state, not backend state)
     * - `loading`: showing "Copy in progress" with option to request notification
     * - `complete`: user requested notification, showing "Concierge will let you know"
     * - null: modal is hidden (copy hasn't started or was dismissed)
     *
     * Note: This is distinct from `NVP_BULK_POLICY_COPY_SETTINGS.state` which tracks
     * the actual backend copy progress ('in-progress' | 'complete').
     */
    currentStep?: ValueOf<typeof CONST.POLICY.COPY_SETTINGS_MODAL_STEP> | null;

    /** Error state */
    errors?: Errors;
};

export default CopyPolicySettings;
