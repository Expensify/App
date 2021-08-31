import React from 'react';
import {Text, View} from 'react-native';
import styles from '../../../styles/styles';
import CONST from '../../../CONST';
import TextLink from '../../../components/TextLink';
import withLocalize, {
    withLocalizePropTypes,
} from '../../../components/withLocalize';
import TermsAndLicensesFooter from './TermsAndLicensesFooter';

const TermsAndLicenses = ({translate}) => (
    <View>
        <Text style={[styles.loginTermsText]}>
            {translate('termsOfUse.phrase1')}
            {' '}
            <TextLink
                style={[styles.loginTermsText, styles.termsLink]}
                href={CONST.TERMS_URL}
            >
                {translate('termsOfUse.phrase2')}
            </TextLink>
            {' '}
            {translate('termsOfUse.phrase3')}
            {' '}
            <TextLink
                style={[styles.loginTermsText, styles.termsLink]}
                href={CONST.PRIVACY_URL}
            >
                {translate('termsOfUse.phrase4')}
            </TextLink>
            .
            {'\n'}
            {translate('termsOfUse.phrase5')}
            {' '}
            {translate('termsOfUse.phrase6')}
            {' '}
            <TextLink
                style={[styles.loginTermsText, styles.termsLink]}
                href={CONST.LICENSES_URL}
            >
                {translate('termsOfUse.phrase7')}
            </TextLink>
            .
        </Text>
        <TermsAndLicensesFooter />
    </View>
);

TermsAndLicenses.propTypes = {...withLocalizePropTypes};
TermsAndLicenses.displayName = 'TermsAndLicenses';

export default withLocalize(TermsAndLicenses);
