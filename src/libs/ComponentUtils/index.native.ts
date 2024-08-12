import type {Component} from 'react';
import type {AnimatedRef} from 'react-native-reanimated';
import {dispatchCommand} from 'react-native-reanimated';
import type {AccessibilityRoleForm, NewPasswordAutocompleteType, PasswordAutocompleteType} from './types';

const PASSWORD_AUTOCOMPLETE_TYPE: PasswordAutocompleteType = 'password';
const NEW_PASSWORD_AUTOCOMPLETE_TYPE: NewPasswordAutocompleteType = 'password-new';
const ACCESSIBILITY_ROLE_FORM: AccessibilityRoleForm = 'none';

/**
 * Clears a text input on the UI thread using a custom clear command
 * that bypasses the event count check.
 */
function forceClearInput(animatedInputRef: AnimatedRef<Component>) {
    'worklet';

    dispatchCommand(animatedInputRef, 'clear');
}

export {PASSWORD_AUTOCOMPLETE_TYPE, ACCESSIBILITY_ROLE_FORM, NEW_PASSWORD_AUTOCOMPLETE_TYPE, forceClearInput};
