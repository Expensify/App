import React from 'react';
import {Text, View} from 'react-native';
import styles from '../../../styles/styles';
import CONST from '../../../CONST';
import TextLink from '../../../components/TextLink';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import LogoWordmark from '../../../../assets/images/expensify-wordmark.svg';

const TermsWithLicenses = ({translate}) => (
    <View>
        <View style={[styles.mt1, styles.alignItemsCenter]}>
            <LogoWordmark height={30} width={80} />
        </View>
        <View>
            <Text style={[styles.flexColumn, styles.textAlignCenter, styles.alignItemsCenter]}>
                <Text style={[styles.loginTermsText]}>
                    {translate('termsOfUse.phrase1')}
                    {' '}
                </Text>
                <TextLink style={[styles.loginTermsText, {marginVertical: -4}]} href={CONST.TERMS_URL}>
                    {translate('termsOfUse.phrase2')}
                </TextLink>
                <Text style={[styles.loginTermsText]}>
                    {' '}
                    {translate('termsOfUse.phrase3')}
                    {' '}
                </Text>
                <TextLink style={[styles.loginTermsText, {marginVertical: -4}]} href={CONST.PRIVACY_URL}>
                    {translate('termsOfUse.phrase4')}
                </TextLink>
                <Text style={[styles.loginTermsText]}>.</Text>
            </Text>
        </View>
        <View>
            <Text style={[styles.flexColumn, styles.textAlignCenter]}>
                <Text style={[styles.loginTermsText]}>
                    {translate('termsOfUse.phrase5')}
                    {' '}
                </Text>
                <TextLink style={[styles.loginTermsText, {marginVertical: -4}]} href={CONST.LICENSES_URL}>
                    {translate('termsOfUse.phrase6')}
                </TextLink>
                <Text style={[styles.loginTermsText]}>.</Text>
            </Text>
        </View>
    </View>
);

TermsWithLicenses.propTypes = {...withLocalizePropTypes};

export default withLocalize(TermsWithLicenses);
