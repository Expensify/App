import React from 'react';

import {View} from 'react-native';
import styles from '../../styles/styles';

import defaultTheme from '../../styles/themes/default';
import CONST from '../../CONST';
import Text from '../../components/Text';
import TextLink from '../../components/TextLink';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';

import LogoWordmark from '../../../assets/images/expensify-wordmark.svg';
import LocalePicker from '../../components/LocalePicker';

const TermsAndLicenses = props => (
    <>
        <Text style={[styles.textExtraSmallSupporting, styles.mb2]}>
            {props.translate('termsOfUse.phrase0')}
        </Text>
        <Text style={[styles.textExtraSmallSupporting]}>
            {props.translate('termsOfUse.phrase1')}
            <TextLink style={[styles.textExtraSmallSupporting, styles.link]} href={CONST.TERMS_URL}>
                {' '}
                {props.translate('termsOfUse.phrase2')}
                {' '}
            </TextLink>
            {props.translate('termsOfUse.phrase3')}
            <TextLink style={[styles.textExtraSmallSupporting, styles.link]} href={CONST.PRIVACY_URL}>
                {' '}
                {props.translate('termsOfUse.phrase4')}
            </TextLink>
            {'. '}
            {props.translate('termsOfUse.phrase5')}
            <TextLink style={[styles.textExtraSmallSupporting, styles.link]} href={CONST.LICENSES_URL}>
                {' '}
                {props.translate('termsOfUse.phrase6')}
            </TextLink>
            .
        </Text>
        <View style={[styles.mt4, styles.alignItemsCenter, styles.mb2, styles.flexRow, styles.justifyContentBetween]}>
            <LogoWordmark height={30} width={80} fill={defaultTheme.textLight} />
            <LocalePicker size="small" />
        </View>
    </>
);

TermsAndLicenses.propTypes = {...withLocalizePropTypes};
TermsAndLicenses.displayName = 'TermsAndLicenses';

export default withLocalize(TermsAndLicenses);
