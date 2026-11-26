import BaseSelectionListWithSections from '@components/SelectionList/SelectionListWithSections/BaseSelectionListWithSections';
import type {ListItem, SelectionListWithSectionsProps} from '@components/SelectionList/SelectionListWithSections/types';

import React from 'react';
import {Keyboard} from 'react-native';

function SelectionListBody<TItem extends ListItem>(props: SelectionListWithSectionsProps<TItem>) {
    return (
        <BaseSelectionListWithSections
            // Props spreading is necessary here to pass through all SelectionList props while adding native-specific behavior

            {...props}
            onScrollBeginDrag={Keyboard.dismiss}
        />
    );
}

export default SelectionListBody;
