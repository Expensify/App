import React from 'react';
import {Text, View} from 'react-native';
import styles from '../../../styles/styles';
import CONST from '../../../CONST';
import TextLink from '../../../components/TextLink';
import withLocalize, {
    withLocalizePropTypes,
} from '../../../components/withLocalize';
import LogoWordmark from '../../../../assets/images/expensify-wordmark.svg';

const TermsWithLicenses = ({translate}) => (
    <View>
        <View style={[styles.mt1, styles.alignItemsCenter, styles.mb3]}>
            <LogoWordmark height={30} width={80} />
        </View>
        <View
            style={[
                styles.dFlex,
                styles.flexWrap,
                styles.alignItemsCenter,
                styles.justifyContentCenter,
                styles.flexRow,
            ]}
        >
            <Text style={[styles.textAlignCenter, styles.loginTermsText]}>
                {translate('termsOfUse.phrase1')}
                {' '}
            </Text>
            <TextLink
                style={[styles.loginTermsText, styles.termsLink]}
                href={CONST.TERMS_URL}
            >
                {translate('termsOfUse.phrase2')}
            </TextLink>
            <Text style={[styles.textAlignCenter, styles.loginTermsText]}>
                {' '}
                {translate('termsOfUse.phrase3')}
                {' '}
            </Text>
            <TextLink
                style={[styles.loginTermsText, styles.termsLink]}
                href={CONST.PRIVACY_URL}
            >
                {translate('termsOfUse.phrase4')}
            </TextLink>
            <Text style={[styles.textAlignCenter, styles.loginTermsText]}>.</Text>
            <Text style={[styles.textAlignCenter, styles.loginTermsText]}>
                {translate('termsOfUse.phrase5')}
                {' '}
            </Text>
            <Text style={[styles.textAlignCenter, styles.loginTermsText]}>
                {translate('termsOfUse.phrase6')}
                {' '}
            </Text>
            <TextLink
                style={[styles.loginTermsText, styles.termsLink]}
                href={CONST.LICENSES_URL}
            >
                {translate('termsOfUse.phrase7')}
            </TextLink>
            <Text style={[styles.textAlignCenter, styles.loginTermsText]}>.</Text>
        </View>
    </View>
);

TermsWithLicenses.propTypes = {...withLocalizePropTypes};

export default withLocalize(TermsWithLicenses);
