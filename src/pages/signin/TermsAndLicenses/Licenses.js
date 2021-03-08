import React from 'react';
import {Text} from 'react-native';
import styles from '../../../styles/styles';
import CONST from '../../../CONST';
import openURLInNewTab from '../../../libs/openURLInNewTab';

const Licenses = () => (
    <>
        <Text style={[styles.chatItemMessageHeaderTimestamp]}>
            Money transmission is provided by Expensify Payments LLC (NMLS ID:2017010) pursuant to its
            {' '}
            <Text
                style={[styles.chatItemMessageHeaderTimestamp, styles.link]}
                onPress={() => openURLInNewTab(CONST.LICENSES_URL)}
            >
                licenses
            </Text>
            .
        </Text>
    </>
);

export default Licenses;
