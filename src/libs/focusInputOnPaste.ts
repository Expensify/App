import type {MutableRefObject} from 'react';
import type {TextInput} from 'react-native';

function focusInputOnPaste(textInputRef: MutableRefObject<TextInput | (HTMLTextAreaElement & TextInput) | null>, event: ClipboardEvent) {
    if (textInputRef.current === event.target) {
        return;
    }

    // To make sure the text input does not capture paste events from other inputs, we check where the event originated
    // If it did originate in another input, we return early to prevent the text input from handling the paste
    const target = event.target as HTMLInputElement;
    const isTargetInput = (target && target.nodeName === 'INPUT') || target.nodeName === 'TEXTAREA' || target.contentEditable === 'true';

    if (isTargetInput) {
        return;
    }

    textInputRef.current?.focus();
}

export default focusInputOnPaste;
