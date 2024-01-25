import React, {forwardRef} from 'react';
import {SectionList as RNSectionList} from 'react-native';
import type {SectionListProps, SectionListRef} from './types';

function SectionListWithRef<ItemT, SectionT>(props: SectionListProps<ItemT, SectionT>, ref: SectionListRef<ItemT, SectionT>) {
    return (
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
}

SectionListWithRef.displayName = 'SectionListWithRef';

export default forwardRef(SectionListWithRef);
