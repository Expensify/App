import StatusBar from '@libs/StatusBar';
import type UpdateStatusBarAppearanceProps from './types';

export default function updateStatusBarAppearance({statusBarStyle}: UpdateStatusBarAppearanceProps) {
    if (!statusBarStyle) {
        return;
    }
    StatusBar.setBarStyle(statusBarStyle, true);
}
