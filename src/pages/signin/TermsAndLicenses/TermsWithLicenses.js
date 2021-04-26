import React from 'react';
import {Text, View} from 'react-native';
import styles from '../../../styles/styles';
import CONST from '../../../CONST';
import openURLInNewTab from '../../../libs/openURLInNewTab';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';

const TermsWithLicenses = ({translations}) => (
    <View style={[styles.mt6]}>
        <Text style={[styles.loginTermsText]}>
            {translations.translate('termsOfUse')[0]}
            {' '}
            <Text
                style={[styles.loginTermsText, styles.link]}
                onPress={() => openURLInNewTab(CONST.TERMS_URL)}
            >
                {translations.translate('termsOfUse')[1]}
            </Text>
            {' '}
            {translations.translate('termsOfUse')[2]}
            {' '}
            <Text
                style={[styles.loginTermsText, styles.link]}
                onPress={() => openURLInNewTab(CONST.PRIVACY_URL)}
            >
                {translations.translate('termsOfUse')[3]}
            </Text>
            {translations.translate('termsOfUse')[4]}
            {' '}
            <Text
                style={[styles.loginTermsText, styles.link]}
                onPress={() => openURLInNewTab(CONST.LICENSES_URL)}
            >
                {translations.translate('termsOfUse')[5]}
            </Text>
            {translations.translate('termsOfUse')[6]}
        </Text>
    </View>
);

TermsWithLicenses.propTypes = {...withLocalizePropTypes};

export default withLocalize(TermsWithLicenses);
