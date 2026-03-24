import type {RefObject} from 'react';
import type {HostInstance} from 'react-native';

type FocusTarget = number | HostInstance | HTMLOrSVGElement | RefObject<unknown>;
type MoveAccessibilityFocus = (focusTarget?: FocusTarget | null) => void;

export type {FocusTarget};
export default MoveAccessibilityFocus;
