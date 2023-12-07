import React, {memo} from 'react';
import {View} from 'react-native';
import useThemeStyles from '@styles/useThemeStyles';
import HeaderGapComponent from './types';

// eslint-disable-next-line react/function-component-definition, react/prop-types
const HeaderGap: HeaderGapComponent = ({styles}) => {
    const themeStyles = useThemeStyles();
    return <View style={[themeStyles.headerGap, styles]} />;
};

HeaderGap.displayName = 'HeaderGap';

export default memo(HeaderGap);
