import {useEffect} from 'react';
import usePrevious from '@hooks/usePrevious';
import {turnOffMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import type {ListItem} from '@components/SelectionList/types';

const useAutoTurnSelectionModeOffWhenHasNoActiveOption = (listItem: ListItem[]) => {
    const hasActiveOption = listItem.some((item) => !item.isDisabled);

    const prevHasActiveOption = usePrevious(hasActiveOption);
    useEffect(() => {
        if (hasActiveOption || !prevHasActiveOption) {
            return;
        }
        turnOffMobileSelectionMode();
    }, [hasActiveOption, prevHasActiveOption]);
};

export default useAutoTurnSelectionModeOffWhenHasNoActiveOption;
