import React, {forwardRef} from 'react';
import type {ForwardedRef} from 'react';
import {Keyboard} from 'react-native';
import BaseOptionsList from './BaseOptionsList';
import type {OptionsListProps, OptionsList as OptionsListType} from './types';

function OptionsList(props: OptionsListProps, ref: ForwardedRef<OptionsListType>) {
    return (
        <BaseOptionsList
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            ref={ref}
            onScrollBeginDrag={Keyboard.dismiss}
        />
    );
}

OptionsList.displayName = 'OptionsList';

export default forwardRef(OptionsList);
