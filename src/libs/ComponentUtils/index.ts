import type {Component} from 'react';
import type {AnimatedRef} from 'react-native-reanimated';
import ObjectUtils from '@src/types/utils/ObjectUtils';
import type AccessibilityRoleForm from './types';

/**
 * Web password field needs `current-password` as autocomplete type which is not supported on native
 */
const ACCESSIBILITY_ROLE_FORM: AccessibilityRoleForm = 'form';

function forceClearInput(animatedInputRef: AnimatedRef<Component>) {
    'worklet';

    const input = animatedInputRef.current;
    if (ObjectUtils.hasMethod(input, 'clear')) {
        input.clear();
    }
}

export {ACCESSIBILITY_ROLE_FORM, forceClearInput};
