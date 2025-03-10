import type {ValueOf} from 'type-fest';
import ONYXKEYS from '@src/ONYXKEYS';
import conciergeChatReportIDConfig from './configs/conciergeChatReportID';
import type {OnyxDerivedValueConfig} from './types';

/**
 * Global map of derived configs.
 * This object holds our derived value configurations.
 */
const ONYX_DERIVED_VALUES = {
    [ONYXKEYS.DERIVED.CONCIERGE_CHAT_REPORT_ID]: conciergeChatReportIDConfig,
} as const satisfies {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [Key in ValueOf<typeof ONYXKEYS.DERIVED>]: OnyxDerivedValueConfig<Key, any>;
};

export default ONYX_DERIVED_VALUES;
