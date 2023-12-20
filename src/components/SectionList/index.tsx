import React, {forwardRef} from 'react';
import {SectionList as RNSectionList} from 'react-native';
import ForwardedSectionList from './types';

// eslint-disable-next-line react/function-component-definition
const SectionList: ForwardedSectionList = (props, ref) => (
    <RNSectionList
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        ref={ref}
    />
);

SectionList.displayName = 'SectionList';

export default forwardRef(SectionList);
