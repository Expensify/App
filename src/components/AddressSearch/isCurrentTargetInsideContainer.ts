import type {RefObject} from 'react';
import type {NativeSyntheticEvent, TextInputFocusEventData, View} from 'react-native';

function isCurrentTargetInsideContainer(event: FocusEvent | NativeSyntheticEvent<TextInputFocusEventData>, containerRef: RefObject<View | HTMLElement>): boolean {
    if (containerRef.current && 'relatedTarget' in event && 'contains' in containerRef.current) {
        return !!(event.target && containerRef.current.contains(event.relatedTarget as Node));
    }

    return false;
}

export default isCurrentTargetInsideContainer;
