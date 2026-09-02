import Icon from '@components/Icon';
import PopoverMenu from '@components/PopoverMenu';
import {PressableWithoutFeedback} from '@components/Pressable';
import Tooltip from '@components/Tooltip';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import usePopoverPosition from '@hooks/usePopoverPosition';
import useSidePanelActions from '@hooks/useSidePanelActions';
import useSidePanelState from '@hooks/useSidePanelState';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';

import type {AnchorPosition} from '@styles/index';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import type {View} from 'react-native';

import React, {useRef, useState} from 'react';

import type SidePanelButtonProps from './types';

// Gap between the bottom of the icon's wrapper and the top of the menu.
const MENU_VERTICAL_OFFSET = 48;

function SidePanelButtonBase({style}: SidePanelButtonProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const {shouldHideHelpButton} = useSidePanelState();
    const {openSidePanel} = useSidePanelActions();
    const {QuestionMark, Sparkles} = useMemoizedLazyExpensifyIcons(['QuestionMark', 'Sparkles']);
    const {calculatePopoverPosition} = usePopoverPosition();

    const buttonRef = useRef<View | HTMLDivElement | null>(null);
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    // Measured from the button so the menu opens directly below it, rather than at a fixed position.
    const [popoverPosition, setPopoverPosition] = useState<AnchorPosition>();

    if (shouldHideHelpButton) {
        return null;
    }

    const openMenu = () => {
        calculatePopoverPosition(buttonRef, {
            horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
            vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
        }).then((position) => {
            setPopoverPosition({...position, vertical: position.vertical + MENU_VERTICAL_OFFSET});
            setIsMenuVisible(true);
        });
    };

    const menuItems = [
        {
            text: translate('initialSettingsPage.helpPage.askConcierge'),
            icon: Sparkles,
            onSelected: openSidePanel,
        },
        {
            text: translate('initialSettingsPage.helpPage.title'),
            icon: QuestionMark,
            onSelected: () => Navigation.navigate(ROUTES.SETTINGS_HELP),
        },
    ];

    return (
        <>
            <Tooltip text={translate('common.help')}>
                <PressableWithoutFeedback
                    ref={buttonRef}
                    sentryLabel={CONST.SENTRY_LABEL.SIDE_PANEL.HELP}
                    accessibilityLabel={translate('common.help')}
                    style={[styles.flexRow, styles.touchableButtonImage, style]}
                    onPress={openMenu}
                >
                    <Icon
                        src={QuestionMark}
                        fill={theme.icon}
                    />
                </PressableWithoutFeedback>
            </Tooltip>
            <PopoverMenu
                isVisible={isMenuVisible}
                onClose={() => setIsMenuVisible(false)}
                onItemSelected={() => setIsMenuVisible(false)}
                anchorRef={buttonRef}
                anchorPosition={popoverPosition ?? {horizontal: 0, vertical: 0}}
                anchorAlignment={{
                    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
                    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
                }}
                menuItems={menuItems}
            />
        </>
    );
}

export default SidePanelButtonBase;
