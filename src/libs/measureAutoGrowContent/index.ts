/**
 * Measures the height of an auto-grow input container's content and reports it through the callback.
 */
import type {View} from 'react-native';

function measureAutoGrowContent(content: View | null, callback: (contentHeight: number) => void) {
    content?.measure((_x, _y, _width, contentHeight) => callback(contentHeight));
}

export default measureAutoGrowContent;
