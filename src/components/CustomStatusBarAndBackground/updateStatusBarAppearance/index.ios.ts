import StatusBar from '@libs/StatusBar';
import type UpdateStatusBarAppearanceProps from './types';

// eslint-disable-next-line @typescript-eslint/naming-convention
export default function updateStatusBarAppearance({statusBarStyle}: UpdateStatusBarAppearanceProps) {
    if (!statusBarStyle) {
        return;
    }
    StatusBar.setBarStyle(statusBarStyle, true);
}
