import type {OnyxMultiSetInput} from 'react-native-onyx';

type AfterSignOutRedirect = (onyxSetParams: OnyxMultiSetInput, hasSwitchedAccountInHybridMode: boolean, accountID?: number, isTransitioning?: boolean) => void;

export default AfterSignOutRedirect;
