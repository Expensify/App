import type {ValueOf} from 'type-fest';
import ONYXKEYS from '@src/ONYXKEYS';
import reportAttributesConfig from './configs/reportAttributes';
import type {OnyxDerivedValueConfig} from './types';

/**
 * Global map of derived configs.
 * This object holds our derived value configurations.
 */
const ONYX_DERIVED_VALUES = {
    [ONYXKEYS.DERIVED.REPORT_ATTRIBUTES]: reportAttributesConfig,
} as const satisfies {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [Key in ValueOf<typeof ONYXKEYS.DERIVED>]: OnyxDerivedValueConfig<Key, any>;
};

export default ONYX_DERIVED_VALUES;
