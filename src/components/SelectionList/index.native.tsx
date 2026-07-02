import React from 'react';
import {Keyboard} from 'react-native';
import BaseSelectionList from './BaseSelectionList';
import type {ListItem, SelectionListProps} from './types';

function SelectionList<TItem extends ListItem>({ref, ...props}: SelectionListProps<TItem>) {
    return (
        <BaseSelectionList
            {...props}
            ref={ref}
            onScrollBeginDrag={() => {
                Keyboard.dismiss();
            }}
        />
    );
}

export default SelectionList;
