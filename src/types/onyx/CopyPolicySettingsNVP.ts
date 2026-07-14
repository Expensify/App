import type CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

/** Backend progress state for bulk copy settings. */
type CopyPolicySettingsNVPState = ValueOf<typeof CONST.POLICY.COPY_SETTINGS_NVP_STATE> | null;

/** NVP payload for bulk copy settings progress. */
type CopyPolicySettingsNVP = {
    /** Current backend state of the bulk copy job. */
    state?: CopyPolicySettingsNVPState;

    /** Whether the user requested a Concierge notification when the copy completes. */
    shouldSendToConcierge?: boolean;

    /** Whether the user should be notified via Concierge only if the copy fails (set when they dismiss the in-progress modal). */
    shouldSendToConciergeOnFailure?: boolean;

    /** Error message from the backend when state is 'failed'. */
    error?: string;
};

export default CopyPolicySettingsNVP;
