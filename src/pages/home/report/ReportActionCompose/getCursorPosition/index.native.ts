import type {TextInputProps} from 'react-native';

function getCursorPosition(selection: TextInputProps['selection']) {
    return {
        x: selection?.cursorPosition?.end?.x,
        y: selection?.cursorPosition?.end?.y,
    };
}
export default getCursorPosition;
