import type {ComponentRef, RefObject} from 'react';
import type {HostComponent} from 'react-native';

type MoveAccessibilityFocus = (ref?: ComponentRef<HostComponent<unknown>> & RefObject<HTMLOrSVGElement>) => void;

export default MoveAccessibilityFocus;
