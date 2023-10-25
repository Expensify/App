import {ElementRef, RefObject} from 'react';
import {HostComponent} from 'react-native';

type MoveAccessibilityFocus = (ref?: ElementRef<HostComponent<unknown>> & RefObject<HTMLOrSVGElement>) => void;

export default MoveAccessibilityFocus;
