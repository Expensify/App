/**
 * Web password field needs `current-password` as autocomplete type which is not supported on native
 */
const PASSWORD_AUTOCOMPLETE_TYPE = 'current-password';
const NEW_PASSWORD_AUTOCOMPLETE_TYPE = 'new-password';
const ACCESSIBILITY_ROLE_FORM = 'form';

export {
    PASSWORD_AUTOCOMPLETE_TYPE,
    ACCESSIBILITY_ROLE_FORM,
    NEW_PASSWORD_AUTOCOMPLETE_TYPE,
};
