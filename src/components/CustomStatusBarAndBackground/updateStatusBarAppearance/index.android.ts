import StatusBar from '@libs/StatusBar';
import type UpdateStatusBarAppearanceProps from './types';

export default function updateStatusBarAppearance({statusBarStyle}: UpdateStatusBarAppearanceProps) {
    StatusBar.setBackgroundColor('transparent');
    StatusBar.setTranslucent(true);
    if (statusBarStyle) {
        StatusBar.setBarStyle(statusBarStyle, true);
    }
}
