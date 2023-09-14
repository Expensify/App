// eslint-disable-next-line no-restricted-imports
import {StatusBar as StatusBarRN} from 'react-native';

class StatusBar extends StatusBarRN {
    // Only has custom web implementation
    static getBackgroundColor(): string | symbol | null {
        return null;
    }
}

export default StatusBar;
