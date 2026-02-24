import type {ReactNode} from 'react';
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
    children: (props: SafeAreaChildrenProps) => ReactNode;
};

export default SafeAreaConsumerProps;
