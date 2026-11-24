import Icon from '@components/Icon';
import SupportalSwitcherPopover from '@components/Navigation/SupportalSwitcher/SupportalSwitcherPopover';
import useSupportalSwitcherAnchor from '@components/Navigation/SupportalSwitcher/useSupportalSwitcherAnchor';
import useSupportalSwitcherVisibility from '@components/Navigation/SupportalSwitcher/useSupportalSwitcherVisibility';
import {PressableWithoutFeedback} from '@components/Pressable';
import Tooltip from '@components/Tooltip';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

type SupportalSwitcherButtonProps = {
    /** Whether the pointer is currently over the navigation sidebar */
    isSidebarHovered: boolean;
};

function SupportalSwitcherButton({isSidebarHovered}: SupportalSwitcherButtonProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const theme = useTheme();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['UserSearch']);

    const {isSupportAgent, isSwitcherVisible, showSwitcher, hideSwitcher} = useSupportalSwitcherVisibility();
    const {anchorRef, anchorPosition, openSwitcher} = useSupportalSwitcherAnchor(showSwitcher);

    if (!isSupportAgent) {
        return null;
    }

    return (
        <>
            {(isSidebarHovered || isSwitcherVisible) && (
                <Tooltip text={translate('supportalSwitcher.title')}>
                    <PressableWithoutFeedback
                        ref={anchorRef}
                        // The FAB below adds 16 of its own top padding, so pull back 4 to match its 12 gap.
                        style={[styles.navigationTabBarFABItem, styles.mbn1]}
                        accessibilityLabel={translate('supportalSwitcher.title')}
                        role={CONST.ROLE.BUTTON}
                        onPress={openSwitcher}
                        testID="supportal-switcher-button"
                        sentryLabel={CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.SUPPORTAL_SWITCHER_BUTTON}
                    >
                        {({hovered}) => (
                            <View
                                style={[
                                    styles.floatingActionButton,
                                    styles.floatingActionButtonSmall,
                                    StyleUtils.getBackgroundColorStyle(hovered ? theme.buttonHoveredBG : theme.buttonDefaultBG),
                                ]}
                            >
                                <Icon
                                    src={icons.UserSearch}
                                    fill={theme.icon}
                                    width={variables.iconSizeSmall}
                                    height={variables.iconSizeSmall}
                                />
                            </View>
                        )}
                    </PressableWithoutFeedback>
                </Tooltip>
            )}
            <SupportalSwitcherPopover
                isVisible={isSwitcherVisible}
                anchorRef={anchorRef}
                anchorPosition={anchorPosition}
                onClose={hideSwitcher}
            />
        </>
    );
}

SupportalSwitcherButton.displayName = 'SupportalSwitcherButton';

export default SupportalSwitcherButton;
