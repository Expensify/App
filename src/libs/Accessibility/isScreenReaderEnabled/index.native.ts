import {AccessibilityInfo} from 'react-native';

function isScreenReaderEnabled(): Promise<boolean> {
    return AccessibilityInfo.isScreenReaderEnabled();
}

export default isScreenReaderEnabled;
