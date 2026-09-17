import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

/**
 * Updates whether the user has denied the contact import prompt.
 * This is used to prevent showing the prompt again after the user has explicitly denied it.
 */
function setHasDeniedContactImportPrompt(value: boolean) {
    Onyx.set(ONYXKEYS.HAS_DENIED_CONTACT_IMPORT_PROMPT, value);
}

export {
    // eslint-disable-next-line import/prefer-default-export
    setHasDeniedContactImportPrompt,
};
