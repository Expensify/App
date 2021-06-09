import React from 'react';
import {Text, View} from 'react-native';
import styles from '../../../styles/styles';
import CONST from '../../../CONST';
import TextLink from '../../../components/TextLink';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import LogoWordmark from '../../../../assets/images/expensify-wordmark.svg';

const TermsWithLicenses = ({translate}) => (
    <View style={[styles.mt3, styles.alignItemsCenter]}>
        <View style={[styles.mb1]}>
            <LogoWordmark height={30} width={80} />
        </View>
        <View style={[styles.alignItemsCenter, styles.flexRow, styles.flexWrap, styles.justifyContentCenter]}>
            <Text style={[styles.loginTermsText, styles.textAlignCenter]}>
                <Text style={[styles.loginTermsText, styles.textAlignCenter]}>
                    {translate('termsOfUse.phrase1')}
                    {' '}
                </Text>
                <TextLink href={CONST.TERMS_URL}>
                    {translate('termsOfUse.phrase2')}
                </TextLink>
                <Text>
                    {' '}
                    {translate('termsOfUse.phrase3')}
                    {' '}
                </Text>
                <TextLink href={CONST.PRIVACY_URL}>
                    {translate('termsOfUse.phrase4')}
                </TextLink>
                {translate('termsOfUse.phrase5')}
                {' '}
                <TextLink href={CONST.LICENSES_URL}>
                    {translate('termsOfUse.phrase6')}
                </TextLink>
                <Text>.</Text>
            </Text>
        </View>
    </View>
);

TermsWithLicenses.propTypes = {...withLocalizePropTypes};

export default withLocalize(TermsWithLicenses);
