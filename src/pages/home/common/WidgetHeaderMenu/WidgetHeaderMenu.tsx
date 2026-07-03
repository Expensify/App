import Icon from '@components/Icon';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import PopoverMenu from '@components/PopoverMenu';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import usePopoverPosition from '@hooks/usePopoverPosition';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import type {AnchorPosition} from '@styles/index';
import variables from '@styles/variables';

import CONST from '@src/CONST';

import type {View} from 'react-native';

import React, {useRef, useState} from 'react';

const ANCHOR_ALIGNMENT = {
    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
} as const;

type WidgetHeaderMenuProps = {
    /** Items shown in the popover opened by the three-dots trigger */
    menuItems: PopoverMenuItem[];

    /** Accessibility label for the trigger. Defaults to the shared "More" copy. */
    accessibilityLabel?: string;

    /** Test ID for the trigger */
    testID?: string;

    /** Sentry label for the trigger */
    sentryLabel?: string;
};

/**
 * Standardized widget header action: a Medium Ghost three-dots icon button that opens a popover menu.
 * The 40px trigger overflows the card header rather than growing it (see `widgetHeaderMenuButtonWrapper`),
 * so every card header keeps the same height whether or not it has a menu.
 */
function WidgetHeaderMenu({menuItems, accessibilityLabel, testID, sentryLabel}: WidgetHeaderMenuProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['ThreeDots']);
    const {calculatePopoverPosition} = usePopoverPosition();
    const buttonRef = useRef<View>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [position, setPosition] = useState<AnchorPosition>();

    const openMenu = () => {
        calculatePopoverPosition(buttonRef, ANCHOR_ALIGNMENT).then((nextPosition) => {
            setPosition(nextPosition);
            setIsVisible(true);
        });
    };

    return (
        <>
            <PressableWithFeedback
                ref={buttonRef}
                testID={testID}
                accessibilityLabel={accessibilityLabel ?? translate('common.more')}
                sentryLabel={sentryLabel}
                onPress={openMenu}
                wrapperStyle={styles.widgetHeaderMenuButtonWrapper}
                style={styles.widgetHeaderMenuButton}
                hoverStyle={styles.widgetHeaderMenuButtonHovered}
            >
                <Icon
                    src={icons.ThreeDots}
                    fill={theme.icon}
                    width={variables.iconSizeSmall}
                    height={variables.iconSizeSmall}
                />
            </PressableWithFeedback>
            <PopoverMenu
                isVisible={isVisible}
                anchorRef={buttonRef}
                anchorPosition={position ?? {horizontal: 0, vertical: 0}}
                anchorAlignment={ANCHOR_ALIGNMENT}
                onClose={() => setIsVisible(false)}
                onItemSelected={() => setIsVisible(false)}
                menuItems={menuItems}
            />
        </>
    );
}

export default WidgetHeaderMenu;
