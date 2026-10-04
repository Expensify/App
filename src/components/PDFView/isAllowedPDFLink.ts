import prefixes from '@libs/Navigation/linkingConfig/prefixes';

import 'react-native-url-polyfill/auto';

const appLinkHostnames = new Set(prefixes.filter((prefix) => prefix.startsWith('https://')).map((prefix) => new URL(prefix).hostname.toLowerCase()));

/**
 * PDF annotations are untrusted and must not launch custom schemes or navigate back into the app.
 */
function isAllowedPDFLink(url: string): boolean {
    try {
        const {protocol, hostname} = new URL(url);
        const normalizedProtocol = protocol.toLowerCase();
        if (normalizedProtocol !== 'https:' && normalizedProtocol !== 'http:') {
            return false;
        }

        return !appLinkHostnames.has(hostname.toLowerCase().replace(/\.$/, ''));
    } catch {
        return false;
    }
}

export default isAllowedPDFLink;
