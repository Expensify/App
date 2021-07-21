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
        <View style={[styles.mt1, styles.alignItemsCenter, styles.mb3]}>
            <LogoWordmark height={30} width={80} />
        </View>
        <View
            style={[
                styles.dFlex,
                styles.flexRow,
                styles.flexWrap,
                styles.textAlignCenter,
                styles.alignItemsCenter,
                styles.justifyContentCenter,
            ]}
        >
            <Text style={[styles.textAlignCenter, styles.loginTermsText]}>
                {translate('termsOfUse.phrase1')}
            </Text>
            <TextLink
                style={[styles.loginTermsText, styles.termsLinkNative]}
                href={CONST.TERMS_URL}
            >
                {' '}
                {translate('termsOfUse.phrase2')}
                {' '}
            </TextLink>
            <Text style={[styles.textAlignCenter, styles.loginTermsText]}>
                {translate('termsOfUse.phrase3')}
            </Text>
            <TextLink
                style={[styles.loginTermsText, styles.termsLinkNative]}
                href={CONST.PRIVACY_URL}
            >
                {' '}
                {translate('termsOfUse.phrase4')}
            </TextLink>
            <Text style={[styles.textAlignCenter, styles.loginTermsText]}>.</Text>
            <Text style={[styles.textAlignCenter, styles.loginTermsText]}>
                {translate('termsOfUse.phrase5')}
                {' '}
            </Text>
            <Text style={[styles.textAlignCenter, styles.loginTermsText]}>
                {translate('termsOfUse.phrase6')}
            </Text>
            <TextLink
                style={[styles.loginTermsText, styles.termsLinkNative]}
                href={CONST.LICENSES_URL}
            >
                {' '}
                {translate('termsOfUse.phrase7')}
            </TextLink>
            <Text style={[styles.textAlignCenter, styles.loginTermsText]}>.</Text>
        </View>
        <View style={[
            styles.mt4, styles.alignItemsCenter, styles.mb2, styles.flexRow, styles.justifyContentBetween]}
        >
            <LogoWordmark height={30} width={80} />
            <LocalePicker size="small" />
        </View>
    </View>
);

TermsWithLicenses.propTypes = {...withLocalizePropTypes};

export default withLocalize(TermsWithLicenses);
