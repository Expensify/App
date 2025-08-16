import type {ScrollViewProps} from 'react-native';

type ActionSheetAwareScrollViewProps = ScrollViewProps & {
    isInitialData?: boolean;
};

export default ActionSheetAwareScrollViewProps;
