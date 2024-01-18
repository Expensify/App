import React, {forwardRef} from 'react';
import {Keyboard} from 'react-native';
import BaseSelectionList from './BaseSelectionList';

const SelectionList = forwardRef((props, ref) => (
    <BaseSelectionList
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        ref={ref}
        onScrollBeginDrag={() => Keyboard.dismiss()}
    />
));

SelectionList.displayName = 'SelectionList';

export default SelectionList;
