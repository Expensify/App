import React from 'react';
import {Image, StyleSheet, View} from 'react-native';
import styles from '../styles/styles';
import CONST from '../CONST';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import Text from './Text';

const propTypes = {
    ...withLocalizePropTypes,
};

const VBALoadingIndicator = ({translate}) => (
    <View style={[StyleSheet.absoluteFillObject, styles.vbaFullScreenLoading]}>
        <View style={[styles.pageWrapper]}>
            <Image
                source={{uri: `${CONST.CLOUDFRONT_URL}/images/icons/emptystates/emptystate_reviewing.gif`}}
                style={[
                    styles.loadingVBAAnimation,
                ]}
            />
            <View style={[styles.ph6]}>
                <Text style={[styles.textStrong, styles.h3, styles.mb4, styles.mt4, styles.textAlignCenter]}>
                    {translate('vbaLoadingAnimation.oneMoment')}
                </Text>
                <Text style={[styles.textAlignCenter]}>
                    {translate('vbaLoadingAnimation.explanationLine')}
                </Text>
            </View>
        </View>
    </View>
);

VBALoadingIndicator.propTypes = propTypes;

export default withLocalize(VBALoadingIndicator);
