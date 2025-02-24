import React from 'react';
import {View} from 'react-native';
import Text from '@components/Text';
import type {ThemeStyles} from '@styles/index';

const getHelpContent = (styles: ThemeStyles, route: string): JSX.Element => {
    return (
        <View style={styles.ph5}>
            <Text style={[styles.textHeadlineH1, styles.mb4]}>Missing page for route</Text>
            <Text style={styles.textNormal}>{route}</Text>
        </View>
    );
};

export default getHelpContent;
