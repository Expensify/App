import React from 'react';
import {Keyboard} from 'react-native';
import BaseSelectionList from './BaseSelectionListWithSections';
import type {ListItem, SelectionListWithSectionsProps} from './types';

function SelectionList<TItem extends ListItem>(props: SelectionListWithSectionsProps<TItem>) {
    return (
        <BaseSelectionList
            // Props spreading is necessary here to pass through all SelectionList props while adding native-specific behavior
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            onScrollBeginDrag={Keyboard.dismiss}
        />
    );
}

export default SelectionList;
