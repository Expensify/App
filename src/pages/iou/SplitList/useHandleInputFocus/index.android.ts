import {useCallback} from 'react';
import type {SplitListItemType} from '@components/SelectionList/ListItem/types';
import useIsInLandscapeMode from '@hooks/useIsInLandscapeMode';
import type UseHandleInputFocusProps from './types';

function useHandleInputFocus({listRef}: UseHandleInputFocusProps) {
    const isInLandscapeMode = useIsInLandscapeMode();

    return useCallback(
        (item: SplitListItemType) => {
            if (!listRef.current || isInLandscapeMode) {
                return;
            }
            listRef.current?.scrollToFocusedInput(item);
        },
        [listRef, isInLandscapeMode],
    );
}

export default useHandleInputFocus;
