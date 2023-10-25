import React, {forwardRef} from 'react';
import {SectionList as RNSectionList} from 'react-native';
import ForwardedSectionList from './types';

// eslint-disable-next-line react/function-component-definition
const SectionListWithRef: ForwardedSectionList = (props, ref) => (
    <RNSectionList
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        ref={ref}
        // For Android we want to use removeClippedSubviews since it helps manage memory consumption. When we
        // run out memory images stop loading and appear as grey circles
        // eslint-disable-next-line react/jsx-props-no-multi-spaces
        removeClippedSubviews
    />
);

SectionListWithRef.displayName = 'SectionListWithRef';

export default forwardRef(SectionListWithRef);
