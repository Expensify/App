import React from 'react';
import {Text, View} from 'react-native';
import styles from '../../../styles/styles';
import CONST from '../../../CONST';
import ExternalLink from '../../../components/ExternalLink';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';

const TermsWithLicenses = ({translate}) => (
    <View style={[styles.mt6, styles.flexRow, styles.flexWrap]}>
        <Text style={[styles.loginTermsText]}>
            {translate('termsOfUse.phrase1')}
            {' '}
        </Text>
        <ExternalLink
            style={[styles.loginTermsText, styles.link]}
            href={CONST.TERMS_URL}
        >
            {translate('termsOfUse.phrase2')}
        </ExternalLink>
        <Text style={[styles.loginTermsText]}>
            {' '}
            {translate('termsOfUse.phrase3')}
            {' '}
        </Text>
        <ExternalLink
            style={[styles.loginTermsText, styles.link]}
            href={CONST.PRIVACY_URL}
        >
            {translate('termsOfUse.phrase4')}
        </ExternalLink>
        <Text style={[styles.loginTermsText]}>
            {translate('termsOfUse.phrase5')}
        </Text>
        <ExternalLink
            style={[styles.loginTermsText, styles.link]}
            href={CONST.LICENSES_URL}
        >
            {translate('termsOfUse.phrase6')}
        </ExternalLink>
        <Text style={[styles.loginTermsText]}>.</Text>
    </View>
);

TermsWithLicenses.propTypes = {...withLocalizePropTypes};

export default withLocalize(TermsWithLicenses);
