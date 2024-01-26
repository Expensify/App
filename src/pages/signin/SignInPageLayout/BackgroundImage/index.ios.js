import {View} from "react-native";
import {Image} from 'expo-image';
import PropTypes from 'prop-types';
import React, {useMemo} from 'react';
import DesktopBackgroundImage from '@assets/images/home-background--desktop.svg';
import MobileBackgroundImage from '@assets/images/home-background--mobile-new.svg';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from "@hooks/useWindowDimensions";
import defaultPropTypes from './propTypes';

const defaultProps = {
    isSmallScreen: false,
};

const propTypes = {
    /** Is the window width narrow, like on a mobile device */
    isSmallScreen: PropTypes.bool,

    ...defaultPropTypes,
};
function BackgroundImage(props) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {windowHeight} = useWindowDimensions()
    const src = useMemo(() => (props.isSmallScreen ? MobileBackgroundImage : DesktopBackgroundImage), [props.isSmallScreen]);

    return (
        <View style={[styles.signInBackground, StyleUtils.getWidthStyle(props.width), {height: windowHeight}]}>
            <Image
                source={src}
                style={styles.signInBackgroundImage}
            />
        </View>

    );
}

BackgroundImage.displayName = 'BackgroundImage';
BackgroundImage.propTypes = propTypes;
BackgroundImage.defaultProps = defaultProps;

export default BackgroundImage;
