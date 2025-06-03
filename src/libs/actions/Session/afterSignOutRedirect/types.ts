import type {OnyxMultiSetInput} from 'react-native-onyx';

type AfterSignOutRedirect = (onyxSetParams: OnyxMultiSetInput, hasSwitchedAccountInHybridMode: boolean, accountID?: number, shouldRedirectToClassicHomepage?: boolean) => void;

export default AfterSignOutRedirect;
