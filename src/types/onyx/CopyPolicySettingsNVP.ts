import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';

/** Backend progress state for bulk copy settings. */
type CopyPolicySettingsNVPState = ValueOf<typeof CONST.POLICY.COPY_SETTINGS_NVP_STATE> | null;

/** NVP payload for bulk copy settings progress. */
type CopyPolicySettingsNVP = {
    /** Current backend state of the bulk copy job. */
    state?: CopyPolicySettingsNVPState;

    /** Whether the user requested a Concierge notification. */
    shouldSendToConcierge?: boolean;
};

export default CopyPolicySettingsNVP;
