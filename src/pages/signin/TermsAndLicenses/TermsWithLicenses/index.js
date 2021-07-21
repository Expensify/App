import React from 'react';
import {Text, View} from 'react-native';
import styles from '../../../../styles/styles';
import CONST from '../../../../CONST';
import TextLink from '../../../../components/TextLink';
import withLocalize, {
    withLocalizePropTypes,
} from '../../../../components/withLocalize';
import LogoWordmark from '../../../../../assets/images/expensify-wordmark.svg';
import LocalePicker from '../../../../components/LocalePicker';

const TermsWithLicenses = ({translate}) => (
    <View>
        <Text style={[styles.textAlignCenter, styles.loginTermsText]}>
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
        <View style={[styles.mt4, styles.alignItemsCenter, styles.mb2, styles.flexRow, styles.justifyContentBetween]}>
            <LogoWordmark height={30} width={80} />
            <LocalePicker size="small" />
        </View>
    </View>
);

TermsWithLicenses.propTypes = {...withLocalizePropTypes};

export default withLocalize(TermsWithLicenses);
