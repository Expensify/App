import React from 'react';
import {View} from 'react-native';
import {webViewStyles} from '../../style/StyleSheet';

export default ({children}) => (
    <View style={[webViewStyles.codeTagStyle, {marginBottom: -5}]}>
        {children}
    </View>
);
