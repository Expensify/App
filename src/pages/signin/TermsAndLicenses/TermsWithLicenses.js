import React from 'react';
import {Text, View} from 'react-native';
import styles from '../../../styles/styles';
import CONST from '../../../CONST';
import openURLInNewTab from '../../../libs/openURLInNewTab';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';

const TermsWithLicenses = ({translate}) => (
    <View style={[styles.mv3, styles.alignItemsCenter]}>
        <Text style={[styles.h1, {letterSpacing: -1}, styles.mb3]}>Expensify</Text>
        <Text style={[styles.loginTermsText, styles.textAlignCenter]}>
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
            {translate('termsOfUse.phrase5')}
            {' '}
            <Text
                style={[styles.loginTermsText, styles.link]}
                onPress={() => openURLInNewTab(CONST.LICENSES_URL)}
            >
                {translate('termsOfUse.phrase6')}
            </Text>
            .
        </Text>
    </View>
);

TermsWithLicenses.propTypes = {...withLocalizePropTypes};

export default withLocalize(TermsWithLicenses);
