import type {SplitListItemType} from '@components/SelectionList/ListItem/types';
import type UseHandleInputFocusProps from './types';

function useHandleInputFocus({listRef}: UseHandleInputFocusProps) {
    return (item: SplitListItemType) => {
        if (!listRef.current) {
            return;
        }
        listRef.current?.scrollToFocusedInput(item);
    };
}

export default useHandleInputFocus;
