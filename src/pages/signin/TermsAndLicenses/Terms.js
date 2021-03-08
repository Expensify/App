import React from 'react';
import {Text} from 'react-native';
import styles from '../../../styles/styles';
import CONST from '../../../CONST';
import openURLInNewTab from '../../../libs/openURLInNewTab';

const Terms = () => (
    <>
        <Text style={[styles.chatItemMessageHeaderTimestamp]}>
            By logging in, you agree to the
            {' '}
            <Text
                style={[styles.chatItemMessageHeaderTimestamp, styles.link]}
                onPress={() => openURLInNewTab(CONST.TERMS_URL)}
            >
                terms of service
            </Text>
            {' '}
            and
            {' '}
            <Text
                style={[styles.chatItemMessageHeaderTimestamp, styles.link]}
                onPress={() => openURLInNewTab(CONST.PRIVACY_URL)}
            >
                privacy policy
            </Text>
            .
        </Text>
    </>
);

export default Terms;
