import type {RefObject} from 'react';
import type {NativeMethods} from 'react-native';

type AccessibilityFocusable = NativeMethods | HTMLOrSVGElement;

type AccessibilityFocusableRef = RefObject<AccessibilityFocusable | null>;

type MoveAccessibilityFocus = (ref?: AccessibilityFocusable | AccessibilityFocusableRef) => void;

export default MoveAccessibilityFocus;
