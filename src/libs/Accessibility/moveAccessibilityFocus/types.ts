import type {ElementRef, RefObject} from 'react';
import type {HostComponent, TextInput, View} from 'react-native';

type MoveAccessibilityFocus = (ref?: (ElementRef<HostComponent<unknown>> & RefObject<HTMLOrSVGElement>) | TextInput | View | null) => void;

export default MoveAccessibilityFocus;
