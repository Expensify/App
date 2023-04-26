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
import * as StyleUtils from '../styles/StyleUtils';

const propTypes = {
    ...headerWithCloseButtonPropTypes,

    /** The background color to apply in the upper half of the screen. */
    backgroundColor: PropTypes.string.isRequired,

    /** The illustration to display in the header. Can be either an SVG component or a JSON object representing a Lottie animation. */
    illustration: PropTypes.oneOfType([PropTypes.func, PropTypes.object]).isRequired,

    /** The size of the illustration in the page header. */
    illustrationSize: PropTypes.shape({
        width: PropTypes.number,
        height: PropTypes.number,
    }).isRequired,
};

const defaultProps = {
    ...headerWithCloseButtonDefaultProps,
};

const IllustratedHeaderPageLayout = (props) => {
    const propsToPassToHeader = _.omit(props, ['illustration', 'illustrationSize']);
    return (
        <ScreenWrapper includeSafeAreaPaddingBottom={false} style={[StyleUtils.getBackgroundColorStyle(props.backgroundColor)]}>
            {({safeAreaPaddingBottomStyle}) => (
                <>
                    <View style={styles.illustratedPageHeader}>
                        {/* eslint-disable-next-line react/jsx-props-no-spreading */}
                        <HeaderWithCloseButton {...propsToPassToHeader} />
                        <View
                            style={[styles.centerContent]}
                        >
                            {_.isFunction(props.illustration)
                                ? props.illustration()
                                : <Lottie source={props.illustration} style={props.illustrationSize} autoPlay loop />}
                        </View>
                    </View>
                    <View style={[styles.illustratedPageBody]}>
                        <ScrollView contentContainerStyle={styles.illustratedPageScrollView(safeAreaPaddingBottomStyle)}>
                            {props.children}
                        </ScrollView>
                    </View>
                </>
            )}
        </ScreenWrapper>
    );
};

IllustratedHeaderPageLayout.propTypes = propTypes;
IllustratedHeaderPageLayout.defaultProps = defaultProps;
IllustratedHeaderPageLayout.displayName = 'IllustratedHeaderPageLayout';

export default IllustratedHeaderPageLayout;
