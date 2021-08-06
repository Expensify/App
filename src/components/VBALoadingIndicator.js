import React from 'react';
import PropTypes from 'prop-types';
import {Image, StyleSheet, View} from 'react-native';
import styles from '../styles/styles';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import Text from './Text';
import compose from '../libs/compose';

const propTypes = {
    /** Controls whether the loader is mounted and displayed */
    visible: PropTypes.bool,

    ...withLocalizePropTypes,
};

const defaultProps = {
    visible: true,
};

/**
 * Loading indication component intended be shown between the steps of VBA flow
 *
 * @returns {JSX.Element}
 */
const VBALoadingIndicator = ({translate, visible}) => visible && (
    <View style={[StyleSheet.absoluteFillObject, styles.fullScreenLoading]}>
        <Image
            source={{uri: 'https://d2k5nsl2zxldvw.cloudfront.net/images/icons/emptystates/emptystate_reviewing.gif'}}
            style={[
                styles.loadingVBAAnimation,
            ]}
        />
        <View style={[styles.ph6, styles.textAlignCenter]}>
            <Text style={[styles.textStrong, styles.h3, styles.mb4, styles.mt4]}>
                {translate('vbaLoadingAnimation.oneMoment')}
            </Text>
            <Text>
                {translate('vbaLoadingAnimation.explanationLine')}
            </Text>
        </View>
    </View>
);

VBALoadingIndicator.propTypes = propTypes;
VBALoadingIndicator.defaultProps = defaultProps;

export default compose(
    withLocalize,
)(VBALoadingIndicator);
