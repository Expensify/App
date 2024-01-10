import type {RefObject} from 'react';
import type {NativeSyntheticEvent, TextInputFocusEventData, View} from 'react-native';

function isCurrentTargetInsideContainer(event: FocusEvent | NativeSyntheticEvent<TextInputFocusEventData>, containerRef: RefObject<View | HTMLElement>): boolean {
    if (!containerRef.current || !event.target || !('relatedTarget' in event) || !('contains' in containerRef.current)) {
        return false;
    }

    return !!containerRef.current.contains(event.relatedTarget as Node);
}

export default isCurrentTargetInsideContainer;
