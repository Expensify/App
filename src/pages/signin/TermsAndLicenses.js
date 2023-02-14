import React from 'react';

import {View} from 'react-native';
import styles from '../../styles/styles';

import CONST from '../../CONST';
import Text from '../../components/Text';
import TextLink from '../../components/TextLink';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';

import LocalePicker from '../../components/LocalePicker';

const currentYear = new Date().getFullYear();
const linkStyles = [styles.textExtraSmallSupporting, styles.link];

const TermsAndLicenses = props => (
    <>
        <Text style={[styles.textExtraSmallSupporting, styles.mb4]}>
            {`© ${currentYear} Expensify`}
        </Text>
        <Text style={[styles.textExtraSmallSupporting, styles.mb4]}>
            {props.translate('termsOfUse.phrase1')}
            <TextLink style={linkStyles} href={CONST.TERMS_URL}>
                {' '}
                {props.translate('termsOfUse.phrase2')}
                {' '}
            </TextLink>
            {props.translate('termsOfUse.phrase3')}
            <TextLink style={linkStyles} href={CONST.PRIVACY_URL}>
                {' '}
                {props.translate('termsOfUse.phrase4')}
            </TextLink>
            {'. '}
        </Text>
        <Text style={[styles.textExtraSmallSupporting]}>
            {props.translate('termsOfUse.phrase5')}
            <TextLink style={linkStyles} href={CONST.LICENSES_URL}>
                {' '}
                {props.translate('termsOfUse.phrase6')}
            </TextLink>
            .
        </Text>
        <View style={[styles.mt4, styles.alignItemsCenter, styles.mb2, styles.flexRow, styles.justifyContentBetween]}>
            <LocalePicker size="small" />
        </View>
    </>
);

TermsAndLicenses.propTypes = {...withLocalizePropTypes};
TermsAndLicenses.displayName = 'TermsAndLicenses';

export default withLocalize(TermsAndLicenses);
