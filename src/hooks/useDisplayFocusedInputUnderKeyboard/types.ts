import type { SelectionListHandle } from "@components/SelectionList/types";
import type { View } from "react-native";
import type SplitListItem from "@components/SelectionList/SplitListItem";



type UseDisplayFocusedInputUnderKeyboardType = {
    listRef?: React.RefObject<SelectionListHandle>;
    inputIndexIsFocused?: number;
    viewRef?: React.RefObject<View>;
    footerHeight?: React.MutableRefObject<number>;
    bottomOffset?: React.MutableRefObject<number>;
    scrollToFocusedInput: () => void;
    SplitListItem: typeof SplitListItem;
};


export default UseDisplayFocusedInputUnderKeyboardType;