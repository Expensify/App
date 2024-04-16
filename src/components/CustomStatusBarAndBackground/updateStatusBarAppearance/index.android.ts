import StatusBar from '@libs/StatusBar';
import type UpdateStatusBarAppearanceProps from './types';

// eslint-disable-next-line @typescript-eslint/naming-convention
export default function updateStatusBarAppearance({statusBarStyle}: UpdateStatusBarAppearanceProps) {
    StatusBar.setBackgroundColor('transparent');
    StatusBar.setTranslucent(true);
    if (statusBarStyle) {
        StatusBar.setBarStyle(statusBarStyle, true);
    }
}
