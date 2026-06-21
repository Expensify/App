import CONST from '@src/CONST';

type MenuItemRole = typeof CONST.ROLE.MENUITEM | typeof CONST.ROLE.MENUITEMRADIO | typeof CONST.ROLE.MENUITEMCHECKBOX;

type UseMenuItemInput = {
    role?: MenuItemRole;
    isSelected?: boolean;
    isDisabled?: boolean;
    accessibilityLabel?: string;
    onSelect?: () => void;
};

type UseMenuItemResult = {
    itemProps: {
        role: MenuItemRole;
        accessibilityState?: {checked?: boolean; disabled?: boolean};
        accessibilityLabel?: string;
        onPress: () => void;
    };
};

function useMenuItem({role = CONST.ROLE.MENUITEM, isSelected, isDisabled = false, accessibilityLabel, onSelect}: UseMenuItemInput = {}): UseMenuItemResult {
    const isRadio = role === CONST.ROLE.MENUITEMRADIO;
    const isCheckbox = role === CONST.ROLE.MENUITEMCHECKBOX;
    const supportsChecked = isRadio || isCheckbox;
    const accessibilityState = supportsChecked || isDisabled ? {checked: supportsChecked ? !!isSelected : undefined, disabled: isDisabled || undefined} : undefined;

    return {
        itemProps: {
            role,
            accessibilityState,
            accessibilityLabel,
            onPress: () => {
                if (isDisabled) {
                    return;
                }
                onSelect?.();
            },
        },
    };
}

export default useMenuItem;
export type {MenuItemRole, UseMenuItemInput, UseMenuItemResult};
