import React from 'react';
import Accessibility from '@libs/Accessibility';
import BaseSelectionList from './BaseSelectionList';
import useWebSelectionListBehavior from './hooks/useWebSelectionListBehavior';
import type {ListItem, SelectionListProps} from './types';

function SelectionList<TItem extends ListItem>({ref, ...props}: SelectionListProps<TItem>) {
    const {shouldIgnoreFocus, shouldDebounceScrolling, shouldDisableHoverStyle, setShouldDisableHoverStyle} = useWebSelectionListBehavior({
        shouldTrackHoverStyle: true,
    });
    const isScreenReaderEnabled = Accessibility.useScreenReaderStatus();

    return (
        <BaseSelectionList
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            ref={ref}
            // Ignore the focus if it's caused by a touch event on mobile chrome.
            // For example, a long press will trigger a focus event on mobile chrome.
            shouldIgnoreFocus={shouldIgnoreFocus || isScreenReaderEnabled}
            shouldDebounceScrolling={shouldDebounceScrolling}
            shouldDisableHoverStyle={shouldDisableHoverStyle}
            setShouldDisableHoverStyle={setShouldDisableHoverStyle}
        />
    );
}

export default SelectionList;
