import type {OnyxEntry, OnyxInputValue} from 'react-native-onyx';

type OnyxInputOrEntry<TOnyxValue> = OnyxEntry<TOnyxValue> | OnyxInputValue<TOnyxValue>;

export default OnyxInputOrEntry;
