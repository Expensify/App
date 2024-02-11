import type {TextInputProps} from 'react-native';

function getCursorPosition(selection: TextInputProps['selection']) {
    return {
        x: selection?.cursorPosition?.end?.x ?? 0,
        y: selection?.cursorPosition?.end?.y ?? 0,
    };
}
export default getCursorPosition;
