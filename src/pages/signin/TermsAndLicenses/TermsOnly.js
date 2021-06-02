import React from 'react';
import {Text, View} from 'react-native';
import styles from '../../../styles/styles';
import CONST from '../../../CONST';
import ExternalLink from '../../../components/ExternalLink';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';

const TermsOnly = ({translate}) => (
    <View style={[styles.mt6]}>
        <Text style={[styles.loginTermsText]}>
            {translate('termsOfUse.phrase1')}
            {' '}
            <ExternalLink
                style={[styles.loginTermsText, styles.link]}
                href={CONST.TERMS_URL}
            >
                {translate('termsOfUse.phrase2')}
            </ExternalLink>
            {' '}
            {translate('termsOfUse.phrase3')}
            {' '}
            <ExternalLink
                style={[styles.loginTermsText, styles.link]}
                href={CONST.PRIVACY_URL}
            >
                {translate('termsOfUse.phrase4')}
            </ExternalLink>
            .
        </Text>
    </View>
);

TermsOnly.propTypes = {...withLocalizePropTypes};

export default withLocalize(TermsOnly);
