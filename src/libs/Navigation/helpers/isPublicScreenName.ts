import type {TupleToUnion} from 'type-fest';
import SCREENS from '@src/SCREENS';

// Screens that are part of the PublicScreens navigator
const PUBLIC_SCREENS = [
    SCREENS.HOME,
    SCREENS.TRANSITION_BETWEEN_APPS,
    SCREENS.VALIDATE_LOGIN,
    SCREENS.CONNECTION_COMPLETE,
    SCREENS.BANK_CONNECTION_COMPLETE,
    SCREENS.UNLINK_LOGIN,
    SCREENS.SAML_SIGN_IN,
] as const;

/**
 * Check if a screen name is a public screen (part of PublicScreens navigator)
 */
function isPublicScreenName(routeName?: string): boolean {
    if (!routeName) {
        return false;
    }
    return PUBLIC_SCREENS.includes(routeName as TupleToUnion<typeof PUBLIC_SCREENS>);
}

export default isPublicScreenName;
