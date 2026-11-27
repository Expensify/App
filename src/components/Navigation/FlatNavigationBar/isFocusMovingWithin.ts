import isHTMLElement from '@libs/isHTMLElement';

import type {NativeSyntheticEvent, TargetedEvent} from 'react-native';

// On web the native event is a DOM FocusEvent, whose relatedTarget is the element receiving focus.
function isFocusMovingWithin(event: NativeSyntheticEvent<TargetedEvent>) {
    const currentTarget = event.currentTarget;
    const relatedTarget = 'relatedTarget' in event.nativeEvent ? event.nativeEvent.relatedTarget : null;
    return isHTMLElement(currentTarget) && isHTMLElement(relatedTarget) && currentTarget.contains(relatedTarget);
}

export default isFocusMovingWithin;
