import type {View} from 'react-native';
import type SplitListItem from '@components/SelectionListWithSections/SplitListItem';
import type {SelectionListHandle} from '@components/SelectionListWithSections/types';

type UseDisplayFocusedInputUnderKeyboardType = {
    listRef: React.RefObject<SelectionListHandle | null>;
    viewRef: React.RefObject<View | null>;
    footerRef: React.RefObject<View | null>;
    bottomOffset: React.RefObject<number>;
    scrollToFocusedInput: () => void;
    SplitListItem: typeof SplitListItem;
};

export default UseDisplayFocusedInputUnderKeyboardType;
