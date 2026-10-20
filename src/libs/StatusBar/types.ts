// eslint-disable-next-line no-restricted-imports
import {StatusBar as StatusBarRN} from 'react-native';

// React Native 0.88 removed `setBackgroundColor` and `setTranslucent` (Android is always edge-to-edge), so they are
// part of this wrapper's API now and every platform file provides its own implementation.
type StatusBarExtended = typeof StatusBarRN & {
    getBackgroundColor(): string | null;
    setBackgroundColor(color: string, animated?: boolean): void;
    setTranslucent(translucent: boolean): void;
};

const StatusBar = StatusBarRN as StatusBarExtended;

export default StatusBar;
