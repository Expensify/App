import useWebSelectionListBehavior from '@components/SelectionList/hooks/useWebSelectionListBehavior';
import BaseSelectionListWithSections from '@components/SelectionList/SelectionListWithSections/BaseSelectionListWithSections';
import type {ListItem, SelectionListWithSectionsProps} from '@components/SelectionList/SelectionListWithSections/types';

import React from 'react';

function SelectionListBody<TItem extends ListItem>({shouldHideKeyboardOnScroll = true, ref, ...props}: SelectionListWithSectionsProps<TItem>) {
    const {shouldIgnoreFocus, shouldDebounceScrolling, shouldDisableHoverStyle, setShouldDisableHoverStyle, onScroll} = useWebSelectionListBehavior({
        shouldTrackHoverStyle: true,
        shouldHideKeyboardOnScroll,
    });

    return (
        <BaseSelectionListWithSections
            // Props spreading is necessary here to pass through all SelectionList props while adding web-specific behavior

            {...props}
            ref={ref}
            onScroll={onScroll}
            // Ignore the focus if it's caused by a touch event on mobile chrome.
            // For example, a long press will trigger a focus event on mobile chrome.
            shouldIgnoreFocus={shouldIgnoreFocus}
            shouldDebounceScrolling={shouldDebounceScrolling}
            shouldDisableHoverStyle={shouldDisableHoverStyle}
            setShouldDisableHoverStyle={setShouldDisableHoverStyle}
        />
    );
}

export default SelectionListBody;
