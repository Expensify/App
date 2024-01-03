import React, {ForwardedRef, forwardRef} from 'react';
import {Keyboard, SectionList as RNSectionList} from 'react-native';
import BaseOptionsList from './BaseOptionsList';
import { OptionsListProps } from './types';

const OptionsList = forwardRef((props: OptionsListProps, ref: ForwardedRef<RNSectionList>) => (
    <BaseOptionsList
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        ref={ref}
        onScrollBeginDrag={() => Keyboard.dismiss()}
    />
));

export default OptionsList;
