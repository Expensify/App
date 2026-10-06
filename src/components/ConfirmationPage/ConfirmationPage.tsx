import useThemeStyles from '@hooks/useThemeStyles';

import type {StyleProp, ViewStyle} from 'react-native';

import {View} from 'react-native';

function ConfirmationPage({children, style}: {children: React.ReactNode; style?: StyleProp<ViewStyle>}) {
    const styles = useThemeStyles();

    return <View style={[styles.flex1, style]}>{children}</View>;
}

export default ConfirmationPage;
