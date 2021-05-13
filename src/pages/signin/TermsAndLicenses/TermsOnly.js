import React from 'react';
import {Text, View} from 'react-native';
import styles from '../../../styles/styles';
import CONST from '../../../CONST';
import openURLInNewTab from '../../../libs/openURLInNewTab';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';

const TermsOnly = ({translate}) => (
    <View style={[styles.mt6]}>
        <Text style={[styles.loginTermsText]}>
            {translate('termsOfUse.phrase1')}
            {' '}
            <Text
                style={[styles.loginTermsText, styles.link]}
                onPress={() => openURLInNewTab(CONST.TERMS_URL)}
            >
                {translate('termsOfUse.phrase2')}
            </Text>
            {' '}
            {translate('termsOfUse.phrase3')}
            {' '}
            <Text
                style={[styles.loginTermsText, styles.link]}
                onPress={() => openURLInNewTab(CONST.PRIVACY_URL)}
            >
                {translate('termsOfUse.phrase4')}
            </Text>
            .
        </Text>
    </View>
);

TermsOnly.propTypes = {...withLocalizePropTypes};

export default withLocalize(TermsOnly);
