import useIsInLandscapeMode from '@hooks/useIsInLandscapeMode';
import useThemeStyles from '@hooks/useThemeStyles';

/**
 * Header – a new Header built with composition API.
 *
 * Instead of a large flat props list (title, icon, shouldShowBackButton, …),
 * sub-components are composed as children:
 *
 * @example
 * ```tsx
 * import Header from '@components/HeaderWithBackButtonComposed';
 *
 * <Header shouldUseHeadlineHeader>
 *   <Header.BackButton onPress={goBack} />
 *   <Header.Title>Settings</Header.Title>
 *   <Header.Right>
 *     <Header.Actions>
 *       <Header.DownloadButton onPress={onDownload} />
 *     </Header.Actions>
 *   </Header.Right>
 * </Header>
 * ```
 *
 * The old `HeaderWithBackButton` component is not affected – migration can be gradual.
 */
import React from 'react';
import {Keyboard, View} from 'react-native';

import type HeaderProps from './types';

import HeaderContext from './context';
import HeaderBackButton from './primitives/HeaderBackButton';
import HeaderCloseButtonTooltip from './primitives/HeaderCloseButtonTooltip';
import HeaderDownloadButton from './primitives/HeaderDownloadButton';
import HeaderIcon from './primitives/HeaderIcon';
import HeaderMenuItemButtonTooltip from './primitives/HeaderMenuItemButtonTooltip';
import HeaderThreeDotsMenu from './primitives/HeaderThreeDotsMenu';
import HeaderTitle from './primitives/HeaderTitle';
import HeaderActions from './zones/HeaderActions';
import HeaderRight from './zones/HeaderRight';

/** Composed counterpart of `HeaderWithBackButton` — content is composed from `Header.Left`/`Center`/`Right` zones and blocks (see the barrel for a full example). */
function HeaderComponent({children, shouldUseHeadlineHeader = false, style}: HeaderProps) {
    const isInLandscapeMode = useIsInLandscapeMode();
    const styles = useThemeStyles();

    return (
        <View
            style={[styles.headerBar, shouldUseHeadlineHeader && styles.headerBarHeight, style]}
            onTouchStart={isInLandscapeMode ? () => Keyboard.dismiss() : undefined}
        >
            <View style={[styles.dFlex, styles.flexRow, styles.alignItemsCenter, styles.flexGrow1, styles.justifyContentBetween, styles.overflowHidden, styles.mr3]}>
                <HeaderContext.Provider
                    value={{
                        shouldUseHeadlineHeader,
                    }}
                >
                    {children}
                </HeaderContext.Provider>
            </View>
        </View>
    );
}

const Header = Object.assign(HeaderComponent, {
    BackButton: HeaderBackButton,
    Icon: HeaderIcon,
    Title: HeaderTitle,
    CloseButtonTooltip: HeaderCloseButtonTooltip,
    DownloadButton: HeaderDownloadButton,
    ThreeDotsMenu: HeaderThreeDotsMenu,
    MenuItemButtonTooltip: HeaderMenuItemButtonTooltip,
    Right: HeaderRight,
    Actions: HeaderActions,
});

export default Header;
