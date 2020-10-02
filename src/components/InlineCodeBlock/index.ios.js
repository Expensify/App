import React from 'react';
import {View} from 'react-native';
import {webViewStyles, styles} from '../../style/StyleSheet';

export default ({children}) => (
    <View style={[webViewStyles.codeTagStyle, styles.mbn5]}>
        {children}
    </View>
);
