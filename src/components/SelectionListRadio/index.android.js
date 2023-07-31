import React, {forwardRef} from 'react';
import {Keyboard} from 'react-native';
import BaseSelectionListRadio from './BaseSelectionListRadio';

const SelectionListRadio = forwardRef((props, ref) => (
    <BaseSelectionListRadio
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        ref={ref}
        shouldDelayFocus
        onScrollBeginDrag={() => Keyboard.dismiss()}
    />
));

SelectionListRadio.displayName = 'SelectionListRadio';

export default SelectionListRadio;
