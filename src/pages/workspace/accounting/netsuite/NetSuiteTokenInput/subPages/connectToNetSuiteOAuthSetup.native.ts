import Navigation from '@libs/Navigation/Navigation';

import ROUTES from '@src/ROUTES';
import type Session from '@src/types/onyx/Session';

import type {OnyxEntry} from 'react-native-onyx';

/** On native the NetSuite OAuth setup loads inside an in-app WebView screen. */
// `environmentURL` and `session` are unused on native but kept so this matches the web variant's signature.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function connectToNetSuiteOAuthSetup(policyID: string, accountID: string, environmentURL: string, session: OnyxEntry<Session>) {
    Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NETSUITE_SETUP.getRoute(policyID, accountID));
}

export default connectToNetSuiteOAuthSetup;
