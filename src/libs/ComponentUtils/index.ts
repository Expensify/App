import {AccessibilityRoleForm, NewPasswordAutocompleteType, PasswordAutocompleteType} from './types';

/**
 * Web password field needs `current-password` as autocomplete type which is not supported on native
 */
const PASSWORD_AUTOCOMPLETE_TYPE: PasswordAutocompleteType = 'current-password';
const NEW_PASSWORD_AUTOCOMPLETE_TYPE: NewPasswordAutocompleteType = 'new-password';
const ACCESSIBILITY_ROLE_FORM: AccessibilityRoleForm = 'form';

export {PASSWORD_AUTOCOMPLETE_TYPE, ACCESSIBILITY_ROLE_FORM, NEW_PASSWORD_AUTOCOMPLETE_TYPE};
