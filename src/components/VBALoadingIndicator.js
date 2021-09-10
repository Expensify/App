import React from 'react';
import {Image, StyleSheet, View} from 'react-native';
import styles from '../styles/styles';
import CONST from '../CONST';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import Text from './Text';
import HeaderWithCloseButton from './HeaderWithCloseButton';
import Navigation from '../libs/Navigation/Navigation';
import ScreenWrapper from './ScreenWrapper';

const propTypes = {
    ...withLocalizePropTypes,
};

const VBALoadingIndicator = ({translate}) => (
    <ScreenWrapper style={[StyleSheet.absoluteFillObject, styles.vbaFullScreenLoading]}>
        <HeaderWithCloseButton
            title={translate('vbaLoadingAnimation.oneMoment')}
            onCloseButtonPress={Navigation.dismissModal}
        />
        <View style={[styles.pageWrapper]}>
            <Image
                source={{uri: `${CONST.CLOUDFRONT_URL}/images/icons/emptystates/emptystate_reviewing.gif`}}
                style={[
                    styles.loadingVBAAnimation,
                ]}
            />
            <View style={[styles.ph6]}>
                <Text style={[styles.textAlignCenter]}>
                    {translate('vbaLoadingAnimation.explanationLine')}
                </Text>
            </View>
        </View>
    </ScreenWrapper>
);

VBALoadingIndicator.propTypes = propTypes;

export default withLocalize(VBALoadingIndicator);
