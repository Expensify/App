/**
 * Web password field needs `current-password` as autocomplete type which is not supported on native
 */
const passwordAutocompleteType = 'current-password';
const accessibilityRoleForm = 'form';

/**
 * Used to set attributes on underlying dom node that are only available on web and throws error on native platform.
 * @param {Object} element
 * @param {String} attribute
 * @param {String} value
 */
function setBrowserAttributes(element, attribute, value) {
    if (!element) {
        return;
    }
    element.setNativeProps({
        [attribute]: value,
    });
}

export {
    passwordAutocompleteType,
    accessibilityRoleForm,
    setBrowserAttributes,
};
