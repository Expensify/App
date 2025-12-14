import type {PreventTextInputFocusOnFirstResponderOnce} from './types';

/**
 * This will prevent the composer's text input from focusing the next time it becomes the
 * first responder in the UIResponder chain. (iOS only, no-op on Android and web)
 */
const preventTextInputFocusOnFirstResponderOnce: PreventTextInputFocusOnFirstResponderOnce = (composerRef) => {
    composerRef.current?.preventFocusOnFirstResponderOnce();
};

export default preventTextInputFocusOnFirstResponderOnce;
