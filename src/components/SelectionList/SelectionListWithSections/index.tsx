import React from 'react';
import useWebSelectionListBehavior from '@components/SelectionList/hooks/useWebSelectionListBehavior';
import BaseSelectionList from './BaseSelectionListWithSections';
import type {ListItem, SelectionListWithSectionsProps} from './types';

function SelectionList<TItem extends ListItem>({shouldHideKeyboardOnScroll = true, ref, ...props}: SelectionListWithSectionsProps<TItem>) {
    const {shouldIgnoreFocus, shouldDebounceScrolling, onScroll} = useWebSelectionListBehavior({shouldHideKeyboardOnScroll});

    return (
        <BaseSelectionList
            // Props spreading is necessary here to pass through all SelectionList props while adding web-specific behavior
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            ref={ref}
            onScroll={onScroll}
            // Ignore the focus if it's caused by a touch event on mobile chrome.
            // For example, a long press will trigger a focus event on mobile chrome.
            shouldIgnoreFocus={shouldIgnoreFocus}
            shouldDebounceScrolling={shouldDebounceScrolling}
        />
    );
}

export default SelectionList;
