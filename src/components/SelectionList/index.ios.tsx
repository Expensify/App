import React, {forwardRef} from 'react';
import type {ForwardedRef} from 'react';
import {Keyboard} from 'react-native';
import type {TextInput} from 'react-native';
import BaseSelectionList from './BaseSelectionList';
import type {BaseSelectionListProps} from './types';

function SelectionList(props: BaseSelectionListProps, ref: ForwardedRef<TextInput>) {
    return (
        <BaseSelectionList
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            ref={ref}
            onScrollBeginDrag={() => Keyboard.dismiss()}
        />
    );
}

SelectionList.displayName = 'SelectionList';

export default forwardRef(SelectionList);
