import type TextInput from '@components/TextInput';

/**
 * Returns props that suppress autocorrect, spellcheck, autocomplete, and autocapitalize
 * for TextInput components.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getTextInputAutocorrectProps(inputComponent: typeof TextInput) {
    return {
        autoCorrect: false,
        spellCheck: false,
        autoComplete: 'off' as const,
        autoCapitalize: 'none' as const,
    };
}

export default getTextInputAutocorrectProps;
