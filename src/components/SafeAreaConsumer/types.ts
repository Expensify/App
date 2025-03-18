import type {ViewStyle} from 'react-native';
import type {EdgeInsets} from 'react-native-safe-area-context';

type SafeAreaChildrenProps = {
    paddingTop?: ViewStyle['paddingTop'];
    paddingBottom?: ViewStyle['paddingBottom'];
    insets?: EdgeInsets;
    safeAreaPaddingBottomStyle: {
        paddingBottom?: ViewStyle['paddingBottom'];
    };
};

type SafeAreaConsumerProps = {
    children: React.FC<SafeAreaChildrenProps>;
};

export default SafeAreaConsumerProps;

export type {SafeAreaChildrenProps};
