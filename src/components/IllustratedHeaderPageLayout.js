import _ from 'underscore';
import React from 'react';
import PropTypes from 'prop-types';
import {ScrollView, View} from 'react-native';
import Lottie from 'lottie-react-native';
import {
    propTypes as headerWithCloseButtonPropTypes,
    defaultProps as headerWithCloseButtonDefaultProps,
} from './HeaderWithCloseButton/headerWithCloseButtonPropTypes';
import HeaderWithCloseButton from './HeaderWithCloseButton';
import ScreenWrapper from './ScreenWrapper';
import styles from '../styles/styles';
import themeColors from '../styles/themes/default';
import * as StyleUtils from '../styles/StyleUtils';

const propTypes = {
    ...headerWithCloseButtonPropTypes,

    /** The background color to apply in the upper half of the screen. */
    backgroundColor: PropTypes.string.isRequired,

    /** The illustration to display in the header. Can be either an SVG component or a JSON object representing a Lottie animation. */
    illustration: PropTypes.oneOfType([PropTypes.func, PropTypes.object]).isRequired,
};

const defaultProps = {
    ...headerWithCloseButtonDefaultProps,
};

const IllustratedHeaderPageLayout = (props) => {
    const propsToPassToHeader = _.omit(props, 'illustration');
    return (
        <ScreenWrapper includeSafeAreaPaddingBottom={false} style={[StyleUtils.getBackgroundColorStyle(props.backgroundColor)]}>
            {({safeAreaPaddingBottomStyle}) => (
                <>
                    <HeaderWithCloseButton {...propsToPassToHeader} />
                    <View
                        style={[styles.illustratedPageHeader, StyleUtils.getBackgroundColorStyle(props.backgroundColor)]}>
                        {_.isFunction(props.illustration)
                            ? props.illustration()
                            : <Lottie source={props.illustration} style={{width: 250, height: 250}} autoPlay loop />
                        }
                    </View>
                    <View style={[styles.flex1, StyleUtils.getBackgroundColorStyle(themeColors.appBG)]}>
                        <ScrollView contentContainerStyle={styles.illustratedPageBottomHalf(safeAreaPaddingBottomStyle)}>
                            {props.children}
                        </ScrollView>
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
