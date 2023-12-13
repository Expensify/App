import {DimensionValue} from 'react-native';
import {EdgeInsets} from 'react-native-safe-area-context';

type SafeAreaChildrenProps = {
    paddingTop?: DimensionValue;
    paddingBottom?: DimensionValue;
    insets?: EdgeInsets;
    safeAreaPaddingBottomStyle: {
        paddingBottom?: DimensionValue;
    };
};

type SafeAreaConsumerProps = {
    children: React.FC<SafeAreaChildrenProps>;
};

export default SafeAreaConsumerProps;

export type {SafeAreaChildrenProps};
