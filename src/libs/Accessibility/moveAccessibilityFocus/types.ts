import type {ElementRef, RefObject} from 'react';
import type {HostComponent, TextInput} from 'react-native';

type MoveAccessibilityFocus = (ref?: (ElementRef<HostComponent<unknown>> & RefObject<HTMLOrSVGElement>) | TextInput | null) => void;

export default MoveAccessibilityFocus;
