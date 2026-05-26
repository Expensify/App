import TextInput from '@components/TextInput';

/**
 * Returns props that suppress autocorrect, spellcheck, autocomplete, and autocapitalize
 * when the input component is a TextInput. Returns an empty object for non-TextInput components
 * (e.g., ValuePicker, AddressSearch) so these props don't leak to unsupported components.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getTextInputAutocorrectProps(InputComponent: React.ComponentType<any>): Record<string, unknown> {
    if (InputComponent !== TextInput) {
        return {};
    }
    return {
        autoCorrect: false,
        spellCheck: false,
        autoComplete: 'off' as const,
        autoCapitalize: 'none' as const,
    };
}

export default getTextInputAutocorrectProps;
