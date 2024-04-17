import React from 'react';
import {Image} from 'react-native';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeIllustrations from '@hooks/useThemeIllustrations';
import useWindowDimensions from '@hooks/useWindowDimensions';
import variables from '@styles/variables';
import CONST from '@src/CONST';

function AnimatedEmptyStateBackground() {
    const StyleUtils = useStyleUtils();
    const {windowWidth, isSmallScreenWidth} = useWindowDimensions();
    const illustrations = useThemeIllustrations();

    // If window width is greater than the max background width, repeat the background image
    const maxBackgroundWidth = variables.sideBarWidth + CONST.EMPTY_STATE_BACKGROUND.ASPECT_RATIO * CONST.EMPTY_STATE_BACKGROUND.WIDE_SCREEN.IMAGE_HEIGHT;

    return (
        <Image
            source={illustrations.EmptyStateBackgroundImage}
            style={StyleUtils.getReportWelcomeBackgroundImageStyle(isSmallScreenWidth)}
            resizeMode={windowWidth > maxBackgroundWidth ? 'repeat' : 'cover'}
        />
    );
}

AnimatedEmptyStateBackground.displayName = 'AnimatedEmptyStateBackground';
export default AnimatedEmptyStateBackground;
