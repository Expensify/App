import React from 'react';
import {Text, View} from 'react-native';
import styles from '../../../styles/styles';
import CONST from '../../../CONST';
import TextLink from '../../../components/TextLink';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';

const TermsOnly = ({translate}) => (
    <View style={[styles.mt6, styles.flexRow, styles.flexWrap]}>
        <Text style={[styles.loginTermsText]}>
            {translate('termsOfUse.phrase1')}
            {' '}
        </Text>
        <TextLink style={[styles.loginTermsText]} href={CONST.TERMS_URL}>
            {translate('termsOfUse.phrase2')}
        </TextLink>
        <Text style={[styles.loginTermsText]}>
            {' '}
            {translate('termsOfUse.phrase3')}
            {' '}
        </Text>
        <TextLink style={[styles.loginTermsText]} href={CONST.PRIVACY_URL}>
            {translate('termsOfUse.phrase4')}
        </TextLink>
        <Text style={[styles.loginTermsText]}>.</Text>
    </View>
);

TermsOnly.propTypes = {...withLocalizePropTypes};

export default withLocalize(TermsOnly);
