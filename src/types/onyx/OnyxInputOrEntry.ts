import type {OnyxEntry, OnyxInputValue} from 'react-native-onyx';

/**
 * This type represents that can be either an Onyx entry or an Onyx input value.
 */
type OnyxInputOrEntry<TOnyxValue> = OnyxEntry<TOnyxValue> | OnyxInputValue<TOnyxValue>;

export default OnyxInputOrEntry;
