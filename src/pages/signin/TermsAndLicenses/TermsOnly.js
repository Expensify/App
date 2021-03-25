import React from 'react';
import {Text, View} from 'react-native';
import styles from '../../../styles/styles';
import CONST from '../../../CONST';
import openURLInNewTab from '../../../libs/openURLInNewTab';

const TermsOnly = () => (
    <View style={[styles.mt6]}>
        <Text style={[styles.loginTermsText]}>
            By logging in, you agree to the
            {' '}
            <Text
                style={[styles.loginTermsText, styles.link]}
                onPress={() => openURLInNewTab(CONST.TERMS_URL)}
            >
                terms of service
            </Text>
            {' '}
            and
            {' '}
            <Text
                style={[styles.loginTermsText, styles.link]}
                onPress={() => openURLInNewTab(CONST.PRIVACY_URL)}
            >
                privacy policy
            </Text>
            .
        </Text>
    </View>
);

export default TermsOnly;
