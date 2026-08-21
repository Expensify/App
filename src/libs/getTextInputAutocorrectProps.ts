/**
 * Returns props that suppress autocorrect, spellcheck, autocomplete, and autocapitalize
 * for TextInput components.
 */
function getTextInputAutocorrectProps() {
    return {
        autoCorrect: false,
        spellCheck: false,
        autoComplete: 'off' as const,
        autoCapitalize: 'none' as const,
    };
}

export default getTextInputAutocorrectProps;
