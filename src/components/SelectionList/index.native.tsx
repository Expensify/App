import React from 'react';
import {Keyboard} from 'react-native';

import type {ListItem, SelectionListProps} from './types';

import BaseSelectionList from './BaseSelectionList';

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
