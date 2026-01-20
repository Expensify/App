import React from 'react';
import {Keyboard} from 'react-native';
import BaseSelectionList from './NewBaseSelectionListWithSections';
import type {ListItem, SelectionListWithSectionsProps} from './types';

function SelectionList<TItem extends ListItem>(props: SelectionListWithSectionsProps<TItem>) {
    return (
        <BaseSelectionList
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            onScrollBeginDrag={Keyboard.dismiss}
        />
    );
}

export default SelectionList;
