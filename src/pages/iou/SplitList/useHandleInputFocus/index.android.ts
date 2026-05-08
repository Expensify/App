import type {SplitListItemType} from '@components/SelectionList/ListItem/types';
import useIsInLandscapeMode from '@hooks/useIsInLandscapeMode';
import type UseHandleInputFocusProps from './types';

function useHandleInputFocus({listRef}: UseHandleInputFocusProps) {
    const isInLandscapeMode = useIsInLandscapeMode();

    return (item: SplitListItemType) => {
        if (!listRef.current || isInLandscapeMode) {
            return;
        }
        listRef.current?.scrollToFocusedInput(item);
    };
}

export default useHandleInputFocus;
