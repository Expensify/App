import React, {forwardRef} from 'react';
import type {ForwardedRef} from 'react';
import {SectionList as RNSectionList} from 'react-native';
import type {SectionListProps} from 'react-native';

// eslint-disable-next-line react/function-component-definition
function SectionListWithRef<ItemT, SectionT>(props: SectionListProps<ItemT, SectionT>, ref: ForwardedRef<RNSectionList<ItemT, SectionT>>) {
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
