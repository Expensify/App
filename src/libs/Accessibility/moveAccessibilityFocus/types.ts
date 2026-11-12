import type {ComponentRef, RefObject} from 'react';
import type {HostComponent, View} from 'react-native';

type AccessibilityFocusTarget = ComponentRef<HostComponent<unknown>> & RefObject<HTMLOrSVGElement | null>;

/** An input's focus target, or a view itself, such as a button the caller holds a ref to */
type MoveAccessibilityFocus = (target?: AccessibilityFocusTarget | ComponentRef<typeof View> | null) => void;

export type {AccessibilityFocusTarget};
export default MoveAccessibilityFocus;
