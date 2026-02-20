import type {RefObject} from 'react';
import type {NativeMethods} from 'react-native';

type FocusTarget = number | NativeMethods | HTMLOrSVGElement | RefObject<unknown>;
type MoveAccessibilityFocus = (focusTarget?: FocusTarget | null) => void;

export type {FocusTarget};
export default MoveAccessibilityFocus;
