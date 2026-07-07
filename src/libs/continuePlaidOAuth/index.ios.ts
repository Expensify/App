import type {TurboModule} from 'react-native';

import {TurboModuleRegistry} from 'react-native';

type PlaidBridge = TurboModule & {
    continueFromRedirectUri: (urlString: string) => void;
};

const bridge = TurboModuleRegistry.get<PlaidBridge>('RNLinksdk');

function continuePlaidOAuth(url: string): void {
    bridge?.continueFromRedirectUri(url);
}

export default continuePlaidOAuth;
