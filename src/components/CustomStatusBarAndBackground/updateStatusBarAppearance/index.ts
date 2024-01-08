import StatusBar from '@libs/StatusBar';
import type UpdateStatusBarAppearanceProps from './types';

export default function updateStatusBarAppearance({backgroundColor, statusBarStyle}: UpdateStatusBarAppearanceProps) {
    if (backgroundColor) {
        StatusBar.setBackgroundColor(backgroundColor, true);
    }
    if (statusBarStyle) {
        StatusBar.setBarStyle(statusBarStyle, true);
    }
}
