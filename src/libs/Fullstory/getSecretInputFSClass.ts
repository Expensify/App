/** The FullStory class a text input gets from being declared secret, so a revealed password or API key isn't recorded */
import CONST from '@src/CONST';

import type {FSClass} from './types';

/**
 * Masks an input declared with `secureTextEntry` unless the caller passed its own class. Pass the declared prop, not the one
 * that follows the eye toggle: that one turns false exactly when the value is shown in plain text.
 */
function getSecretInputFSClass(forwardedFSClass: FSClass | undefined, isDeclaredSecret: boolean | undefined): FSClass | undefined {
    return forwardedFSClass ?? (isDeclaredSecret ? CONST.FULLSTORY.CLASS.MASK : undefined);
}

export default getSecretInputFSClass;
