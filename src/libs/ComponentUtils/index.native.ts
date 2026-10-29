import type {ComposerRef} from '@components/Composer/types';

import type {HostInstance} from 'react-native';
import type {AnimatedRef} from 'react-native-reanimated';

import {dispatchCommand} from 'react-native-reanimated';

import type AccessibilityRoleForm from './types';

const ACCESSIBILITY_ROLE_FORM: AccessibilityRoleForm = 'none';

/**
 * Clears a text input on the UI thread using a custom clear command
 * that bypasses the event count check.
 */
function forceClearInput<TRef extends HostInstance | ComposerRef>(animatedInputRef: AnimatedRef<TRef>) {
    'worklet';

    dispatchCommand(animatedInputRef, 'clear');
}

export {ACCESSIBILITY_ROLE_FORM, forceClearInput};
