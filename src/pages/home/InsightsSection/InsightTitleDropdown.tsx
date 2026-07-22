import Icon from '@components/Icon';
import type {ExpensifyIconName} from '@components/Icon/ExpensifyIconLoader';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import PopoverMenu from '@components/PopoverMenu';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import Text from '@components/Text';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import usePopoverPosition from '@hooks/usePopoverPosition';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import type {SearchKey, SearchTypeMenuItem} from '@libs/SearchUIUtils';

import type {AnchorPosition} from '@styles/index';
import variables from '@styles/variables';

import CONST from '@src/CONST';
import type IconAsset from '@src/types/utils/IconAsset';

import React, {useRef, useState} from 'react';
import {View} from 'react-native';

type InsightTitleDropdownProps = {
    /** The insight options to list in the dropdown, in display order */
    configs: SearchTypeMenuItem[];

    /** The currently selected insight key */
    selectedKey: SearchKey;

    /** Called with the newly selected insight key */
    onSelect: (key: SearchKey) => void;
};

const ANCHOR_ALIGNMENT = {
    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
} as const;

function InsightTitleDropdown({configs, selectedKey, onSelect}: InsightTitleDropdownProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['DownArrow', 'UpArrow', 'CalendarSolid', 'User', 'Folder', 'Basket']);
    const iconByName: Partial<Record<ExpensifyIconName, IconAsset>> = icons;
    const {calculatePopoverPosition} = usePopoverPosition();

    const triggerRef = useRef<View>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [menuPosition, setMenuPosition] = useState<AnchorPosition>({horizontal: 0, vertical: 0});

    const selectedConfig = configs.find((config) => config.key === selectedKey) ?? configs.at(0);
    const title = selectedConfig ? translate(selectedConfig.translationPath) : '';

    const openMenu = () => {
        if (!triggerRef.current) {
            return;
        }
        calculatePopoverPosition(triggerRef, ANCHOR_ALIGNMENT).then((position) => {
            setMenuPosition(position);
            setIsMenuOpen(true);
        });
    };
    const closeMenu = () => setIsMenuOpen(false);

    const menuItems: PopoverMenuItem[] = configs.map((config) => ({
        text: translate(config.translationPath),
        icon: iconByName[config.icon],
        isSelected: config.key === selectedKey,
        onSelected: () => onSelect(config.key),
    }));

    return (
        <View style={styles.alignSelfStart}>
            <PressableWithFeedback
                ref={triggerRef}
                onPress={openMenu}
                role={CONST.ROLE.BUTTON}
                accessibilityLabel={title}
                sentryLabel="InsightTitleDropdown"
                style={[styles.flexRow, styles.alignItemsCenter, styles.gap1]}
            >
                <Text style={styles.getWidgetContainerTitleStyle(theme.text)}>{title}</Text>
                <Icon
                    src={isMenuOpen ? icons.UpArrow : icons.DownArrow}
                    fill={theme.icon}
                    width={variables.iconSizeSmall}
                    height={variables.iconSizeSmall}
                />
            </PressableWithFeedback>
            <PopoverMenu
                isVisible={isMenuOpen}
                onClose={closeMenu}
                onItemSelected={closeMenu}
                menuItems={menuItems}
                anchorRef={triggerRef}
                anchorPosition={menuPosition}
                anchorAlignment={ANCHOR_ALIGNMENT}
                shouldShowRadioButton
            />
        </View>
    );
}

export default InsightTitleDropdown;
