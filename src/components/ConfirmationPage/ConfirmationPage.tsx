import useThemeStyles from '@hooks/useThemeStyles';

import type {StyleProp, ViewStyle} from 'react-native';

import {View} from 'react-native';

type ConfirmationPageProps = {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
};

function ConfirmationPage({children, style}: ConfirmationPageProps) {
    const styles = useThemeStyles();

    return <View style={[styles.flex1, style]}>{children}</View>;
}

export default ConfirmationPage;
