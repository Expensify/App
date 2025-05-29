import type {OnyxMultiSetInput} from 'react-native-onyx';

type AfterSignOutRedirect = (onyxSetParams: OnyxMultiSetInput, hasSwitchedAccountInHybridMode: boolean, shouldRedirectToClassicHomepage?: boolean) => void;

export default AfterSignOutRedirect;
