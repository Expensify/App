import type {ComponentRef, RefObject} from 'react';
import type {HostComponent} from 'react-native';

type AccessibilityFocusTarget = ComponentRef<HostComponent<unknown>> & RefObject<HTMLOrSVGElement | null>;

type MoveAccessibilityFocus = (ref?: AccessibilityFocusTarget) => void;

export type {AccessibilityFocusTarget};
export default MoveAccessibilityFocus;
