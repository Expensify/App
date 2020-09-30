import React from 'react';
import {Text} from 'react-native';
import {webViewStyles} from '../../style/StyleSheet';

export default ({children}) => (
    <Text style={[webViewStyles.codeTagStyle]}>
        {children}
    </Text>
);
