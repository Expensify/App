import {useCallback} from 'react';
import type {SplitListItemType} from '@components/SelectionList/ListItem/types';
import type UseHandleInputFocusProps from './types';

function useHandleInputFocus({listRef}: UseHandleInputFocusProps) {
    return useCallback(
        (item: SplitListItemType) => {
            if (!listRef.current) {
                return;
            }
            listRef.current?.scrollToFocusedInput(item);
        },
        [listRef],
    );
}

export default useHandleInputFocus;
