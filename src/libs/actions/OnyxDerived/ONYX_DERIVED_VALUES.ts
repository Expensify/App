import type {OnyxEntry} from 'react-native-onyx';
import type {OnyxDerivedKey, OnyxDerivedValuesMapping} from '@src/ONYXKEYS';
import ONYXKEYS from '@src/ONYXKEYS';
import type AssertTypesEqual from '@src/types/utils/AssertTypesEqual';
import type SymmetricDifference from '@src/types/utils/SymmetricDifference';
import conciergeChatReportIDConfig from './configs/conciergeChatReportID';

/**
 * Global map of derived configs.
 * This object holds our derived value configurations.
 */
const ONYX_DERIVED_VALUES = {
    [ONYXKEYS.DERIVED.CONCIERGE_CHAT_REPORT_ID]: conciergeChatReportIDConfig,
} as const;

export default ONYX_DERIVED_VALUES;

// Note: we can't use `as const satisfies...` for ONYX_DERIVED_VALUES without losing type specificity.
// So these type assertions are here to help enforce that ONYX_DERIVED_VALUES has all the keys and the correct types,
// according to the type definitions for derived keys in ONYXKEYS.ts.
type MismatchedDerivedKeysError =
    `Error: ONYX_DERIVED_VALUES does not match ONYXKEYS.DERIVED or OnyxDerivedValuesMapping. The following keys are present in one or the other, but not both: ${SymmetricDifference<
        keyof typeof ONYX_DERIVED_VALUES,
        OnyxDerivedKey
    >}`;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type KeyAssertion = AssertTypesEqual<keyof typeof ONYX_DERIVED_VALUES, OnyxDerivedKey, MismatchedDerivedKeysError>;

type ExpectedDerivedValueComputeReturnTypes = {
    [Key in keyof OnyxDerivedValuesMapping]: OnyxEntry<OnyxDerivedValuesMapping[Key]>;
};
type ActualDerivedValueComputeReturnTypes = {
    [Key in keyof typeof ONYX_DERIVED_VALUES]: ReturnType<(typeof ONYX_DERIVED_VALUES)[Key]['compute']>;
};
type MismatchedDerivedValues = {
    [Key in keyof ExpectedDerivedValueComputeReturnTypes]: ExpectedDerivedValueComputeReturnTypes[Key] extends ActualDerivedValueComputeReturnTypes[Key] ? never : Key;
}[keyof ExpectedDerivedValueComputeReturnTypes];
type MismatchedDerivedValuesError =
    `Error: ONYX_DERIVED_VALUES does not match OnyxDerivedValuesMapping. The following configs have compute functions that do not return the correct type according to OnyxDerivedValuesMapping: ${MismatchedDerivedValues}`;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type ComputeReturnTypeAssertion = AssertTypesEqual<MismatchedDerivedValues, never, MismatchedDerivedValuesError>;
