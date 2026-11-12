import type {AnimatedTextInputRef} from '@components/RNTextInput';

import type {BaseTextInputRef} from './types';

/**
 * Whether a `BaseTextInput` ref is the text input itself rather than the form element the type also allows, so it can be
 * handed to code that focuses a text input.
 */
function isTextInputRef(ref: BaseTextInputRef | null): ref is AnimatedTextInputRef {
    return !!ref && 'isFocused' in ref;
}

export default isTextInputRef;
