import type {Component} from 'react';
import type {AnimatedRef} from 'react-native-reanimated';
import type AccessibilityRoleForm from './types';

/**
 * Web password field needs `current-password` as autocomplete type which is not supported on native
 */
const ACCESSIBILITY_ROLE_FORM: AccessibilityRoleForm = 'form';

function forceClearInput(animatedInputRef: AnimatedRef<Component>) {
    'worklet';

    const input = animatedInputRef.current;
    if (input && 'clear' in input && typeof input.clear === 'function') {
        input.clear();
    }
}

export {ACCESSIBILITY_ROLE_FORM, forceClearInput};
