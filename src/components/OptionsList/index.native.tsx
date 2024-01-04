import React, {forwardRef} from 'react';
import type {ForwardedRef} from 'react';
import {Keyboard} from 'react-native';
import BaseOptionsList from './BaseOptionsList';
import type {OptionsListProps, OptionsList as OptionsListType} from './types';

const OptionsList = forwardRef((props: OptionsListProps, ref: ForwardedRef<OptionsListType>) => (
    <BaseOptionsList
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        ref={ref}
        onScrollBeginDrag={() => Keyboard.dismiss()}
    />
));

export default OptionsList;
