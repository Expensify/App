import React from 'react';
import {Image} from 'react-native';
import EmptyStateBackgroundImage from '../../assets/images/empty-state_background-fade.png';
import CONST from '../CONST';
import useWindowDimensions from '../hooks/useWindowDimensions';
import * as StyleUtils from '../styles/StyleUtils';
import variables from '../styles/variables';

export default function EmptyStateBackground() {
    const {isSmallScreenWidth, windowWidth} = useWindowDimensions();
    // If window width is greater than the max background width, repeat the background image
    const maxBackgroundWidth = variables.sideBarWidth + CONST.EMPTY_STATE_BACKGROUND.ASPECT_RATIO * CONST.EMPTY_STATE_BACKGROUND.WIDE_SCREEN.IMAGE_HEIGHT;

    return (
        <Image
            pointerEvents="none"
            source={EmptyStateBackgroundImage}
            style={StyleUtils.getReportWelcomeBackgroundImageStyle(isSmallScreenWidth)}
            resizeMode={windowWidth > maxBackgroundWidth ? 'repeat' : 'cover'}
        />
    );
}
