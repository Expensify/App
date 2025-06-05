import type {OnyxMultiSetInput} from 'react-native-onyx';

type AfterSignOutRedirect = (onyxSetParams: OnyxMultiSetInput, hasSwitchedAccountInHybridMode: boolean, accountID?: number) => void;

export default AfterSignOutRedirect;
