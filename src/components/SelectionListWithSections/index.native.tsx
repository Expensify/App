import React from 'react';
import {Keyboard} from 'react-native';
import BaseSelectionList from './BaseSelectionListWithSections';
import type {ListItem, SelectionListProps} from './types';

function SelectionListWithSections<TItem extends ListItem>({shouldHideKeyboardOnScroll = true, ref, ...props}: SelectionListProps<TItem>) {
    return (
        <BaseSelectionList
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            ref={ref}
            onScrollBeginDrag={() => {
                if (!shouldHideKeyboardOnScroll) {
                    return;
                }
                Keyboard.dismiss();
            }}
            isRowMultilineSupported
        />
    );
}

SelectionListWithSections.displayName = 'SelectionListWithSections';

export default SelectionListWithSections;
