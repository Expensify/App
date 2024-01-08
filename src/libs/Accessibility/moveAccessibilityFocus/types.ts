import type {ElementRef, RefObject} from 'react';
import type {HostComponent} from 'react-native';

type MoveAccessibilityFocus = (ref?: ElementRef<HostComponent<unknown>> & RefObject<HTMLOrSVGElement>) => void;

export default MoveAccessibilityFocus;
