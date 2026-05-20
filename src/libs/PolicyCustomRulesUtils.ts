import type {OnyxEntry} from 'react-native-onyx';
import type {Policy} from '@src/types/onyx';

/**
 * Returns custom rules as displayable text.
 */
function getPolicyCustomRulesText(policy: OnyxEntry<Policy>): string {
    return String(policy?.customRules ?? '');
}

export {getPolicyCustomRulesText};
