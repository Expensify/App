import React from 'react';
import {Text, View} from 'react-native';
import styles from '../../../styles/styles';
import CONST from '../../../CONST';
import TextLink from '../../../components/TextLink';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import LogoWordmark from '../../../../assets/images/expensify-wordmark.svg';

const TermsWithLicenses = ({translate}) => (
    <View>
        <View style={[styles.mt1, styles.alignItemsCenter, styles.mb3]}>
            <LogoWordmark height={30} width={80} />
        </View>
        <Text style={[styles.textAlignCenter, styles.loginTermsText]}>
            {translate('termsOfUse.phrase1')}
            {' '}
            <TextLink style={[styles.loginTermsText, styles.termsLink]} href={CONST.TERMS_URL}>
                {translate('termsOfUse.phrase2')}
            </TextLink>
            {' '}
            {translate('termsOfUse.phrase3')}
            {' '}
            <TextLink style={[styles.loginTermsText, styles.termsLink]} href={CONST.PRIVACY_URL}>
                {translate('termsOfUse.phrase4')}
            </TextLink>
            .
            {' '}
            {translate('termsOfUse.phrase5')}
            {' '}
            <TextLink style={[styles.loginTermsText, styles.termsLink]} href={CONST.LICENSES_URL}>
                {translate('termsOfUse.phrase6')}
            </TextLink>
            .
        </Text>

    </View>
);

TermsWithLicenses.propTypes = {...withLocalizePropTypes};

export default withLocalize(TermsWithLicenses);
