import React from 'react';
import PropTypes from 'prop-types';
import {ScrollView, View} from 'react-native';
import Lottie from 'lottie-react-native';
import headerWithBackButtonPropTypes from './HeaderWithBackButton/headerWithBackButtonPropTypes';
import HeaderWithBackButton from './HeaderWithBackButton';
import ScreenWrapper from './ScreenWrapper';
import styles from '../styles/styles';
import themeColors from '../styles/themes/default';
import * as StyleUtils from '../styles/StyleUtils';
import useWindowDimensions from '../hooks/useWindowDimensions';

const propTypes = {
    ...headerWithBackButtonPropTypes,

    children: PropTypes.node.isRequired,

    /** The background color to apply in the upper half of the screen. */
    backgroundColor: PropTypes.string.isRequired,

    /** The illustration to display in the header. Can be either an SVG component or a JSON object representing a Lottie animation. */
    illustration: PropTypes.oneOfType([PropTypes.func, PropTypes.object]).isRequired,
};

function IllustratedHeaderPageLayout({backgroundColor, children, illustration, ...propsToPassToHeader}) {
    const {windowHeight} = useWindowDimensions();
    return (
        <ScreenWrapper
            style={[StyleUtils.getBackgroundColorStyle(backgroundColor)]}
            shouldEnablePickerAvoiding={false}
            includeSafeAreaPaddingBottom={false}
        >
            {({safeAreaPaddingBottomStyle}) => (
                <>
                    {/* eslint-disable-next-line react/jsx-props-no-spreading */}
                    <HeaderWithBackButton {...propsToPassToHeader} />
                    <View style={[styles.flex1, StyleUtils.getBackgroundColorStyle(themeColors.appBG)]}>
                        <ScrollView
                            style={[styles.shiftUpOnePixel]}
                            contentContainerStyle={safeAreaPaddingBottomStyle}
                            showsVerticalScrollIndicator={false}
                        >
                            <View style={styles.overscrollSpacer(backgroundColor, windowHeight)} />
                            <View style={[styles.alignItemsCenter, styles.justifyContentEnd, StyleUtils.getBackgroundColorStyle(backgroundColor)]}>
                                <Lottie
                                    source={illustration}
                                    style={styles.w100}
                                    autoPlay
                                    loop
                                />
                            </View>
                            <View style={[styles.pt5]}>{children}</View>
                        </ScrollView>
                    </View>
                </>
            )}
        </ScreenWrapper>
    );
}

IllustratedHeaderPageLayout.propTypes = propTypes;
IllustratedHeaderPageLayout.displayName = 'IllustratedHeaderPageLayout';

export default IllustratedHeaderPageLayout;
