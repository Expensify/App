import type {View} from 'react-native';
import type SplitListItem from '@components/SelectionList/SplitListItem';
import type {SelectionListHandle} from '@components/SelectionList/types';

type UseDisplayFocusedInputUnderKeyboardType = {
    listRef: React.RefObject<SelectionListHandle | null>;
    viewRef: React.RefObject<View | null>;
    footerRef: React.RefObject<View | null>;
    bottomOffset: React.RefObject<number>;
    scrollToFocusedInput: () => void;
    SplitListItem: typeof SplitListItem;
};

export default UseDisplayFocusedInputUnderKeyboardType;
