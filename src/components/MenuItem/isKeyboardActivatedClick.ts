import type {GestureResponderEvent} from 'react-native';

/** Enter on a link fires a click with no click count, unlike a mouse click */
function isKeyboardActivatedClick(event: GestureResponderEvent | KeyboardEvent): boolean {
    return event.type === 'click' && 'detail' in event && event.detail === 0;
}

export default isKeyboardActivatedClick;
