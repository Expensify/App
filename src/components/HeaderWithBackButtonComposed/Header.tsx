import useIsInLandscapeMode from '@hooks/useIsInLandscapeMode';

import {Keyboard, View} from 'react-native';

import type HeaderProps from './types';

import {HeaderContext} from './context';
import useHeaderStyles from './styles';

/** Composed counterpart of `HeaderWithBackButton` — content is composed from `Header.Left`/`Center`/`Right` zones and blocks (see the barrel for a full example). */
function Header({children, shouldShowBorderBottom = false, shouldUseHeadlineHeader = false, shouldOverlay = false, iconFill, style}: HeaderProps) {
    const isInLandscapeMode = useIsInLandscapeMode();
    const {containerStyle, innerRowStyle} = useHeaderStyles({shouldUseHeadlineHeader, shouldShowBorderBottom, shouldOverlay, style});

    return (
        <View
            style={containerStyle}
            onTouchStart={isInLandscapeMode ? () => Keyboard.dismiss() : undefined}
        >
            <View style={innerRowStyle}>
                <HeaderContext.Provider
                    value={{
                        iconFill,
                        shouldUseHeadlineHeader,
                    }}
                >
                    {children}
                </HeaderContext.Provider>
            </View>
        </View>
    );
}

export default Header;
