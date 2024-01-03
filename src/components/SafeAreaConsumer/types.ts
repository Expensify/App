import {DimensionValue} from 'react-native';
import {EdgeInsets} from 'react-native-safe-area-context';

type ChildrenProps = {
    paddingTop?: DimensionValue;
    paddingBottom?: DimensionValue;
    insets?: EdgeInsets;
    safeAreaPaddingBottomStyle: {
        paddingBottom?: DimensionValue;
    };
};

type SafeAreaConsumerProps = {
    children: React.FC<ChildrenProps>;
};

export default SafeAreaConsumerProps;
