import React from 'react';
import {Keyboard} from 'react-native';
import BaseSelectionList from './BaseSelectionList';
import type {ListItem, SelectionListProps} from './types';

function SelectionList<TItem extends ListItem>({ref, ...props}: SelectionListProps<TItem>) {
    return (
        <BaseSelectionList
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            ref={ref}
            onScrollBeginDrag={() => {
                Keyboard.dismiss();
            }}
        />
    );
}

export default SelectionList;
