import * as KeyboardShortcuts from '../../../../libs/actions/KeyboardShortcuts';
import * as Expensicons from '../../../../components/Icon/Expensicons';

export default (isSmallScreenWidth) => {
    if (isSmallScreenWidth) {
        return [];
    }
    return [
        {
            translationKey: 'initialSettingsPage.aboutPage.viewKeyboardShortcuts',
            icon: Expensicons.Keyboard,
            action: KeyboardShortcuts.showKeyboardShortcutModal,
        },
    ];
};
