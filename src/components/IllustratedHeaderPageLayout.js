import _ from 'underscore';
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
import FixedFooter from './FixedFooter';

const propTypes = {
    ...headerWithBackButtonPropTypes,

    /** Children to display in the lower half of the page (below the header section w/ an animation) */
    children: PropTypes.node.isRequired,

    /** The illustration to display in the header. Can be either an SVG component or a JSON object representing a Lottie animation. */
    illustration: PropTypes.oneOfType([PropTypes.func, PropTypes.object]).isRequired,

    /** The background color to apply in the upper half of the screen. */
    backgroundColor: PropTypes.string,

    /** A fixed footer to display at the bottom of the page. */
    footer: PropTypes.node,
};

const defaultProps = {
    backgroundColor: themeColors.appBG,
    footer: null,
};

function IllustratedHeaderPageLayout({backgroundColor, children, illustration, footer, ...propsToPassToHeader}) {
    const {windowHeight} = useWindowDimensions();
    return (
        <ScreenWrapper
            style={[StyleUtils.getBackgroundColorStyle(backgroundColor)]}
            shouldEnablePickerAvoiding={false}
            includeSafeAreaPaddingBottom={false}
            offlineIndicatorStyle={[StyleUtils.getBackgroundColorStyle(themeColors.appBG)]}
        >
            {({safeAreaPaddingBottomStyle}) => (
                <>
                    <HeaderWithBackButton
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        {...propsToPassToHeader}
                        titleColor={backgroundColor === themeColors.appBG ? undefined : themeColors.textColorfulBackground}
                        iconFill={backgroundColor === themeColors.appBG ? undefined : themeColors.iconColorfulBackground}
                    />
                    <View style={[styles.flex1, StyleUtils.getBackgroundColorStyle(themeColors.appBG)]}>
                        <ScrollView
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
                        {!_.isNull(footer) && <FixedFooter>{footer}</FixedFooter>}
                    </View>
                </>
            )}
        </ScreenWrapper>
    );
}

IllustratedHeaderPageLayout.propTypes = propTypes;
IllustratedHeaderPageLayout.defaultProps = defaultProps;
IllustratedHeaderPageLayout.displayName = 'IllustratedHeaderPageLayout';

export default IllustratedHeaderPageLayout;
