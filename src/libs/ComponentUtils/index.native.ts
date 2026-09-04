import type {Component} from 'react';
import type {NativeMethods} from 'react-native';
import type {AnimatedRef} from 'react-native-reanimated';

import {dispatchCommand} from 'react-native-reanimated';

import type AccessibilityRoleForm from './types';

const ACCESSIBILITY_ROLE_FORM: AccessibilityRoleForm = 'none';

/**
 * Clears a text input on the UI thread using a custom clear command
 * that bypasses the event count check.
 */
function forceClearInput(animatedInputRef: AnimatedRef<Component> | AnimatedRef<NativeMethods>) {
    'worklet';

    dispatchCommand(animatedInputRef as AnimatedRef<Component>, 'clear');
}

export {ACCESSIBILITY_ROLE_FORM, forceClearInput};
