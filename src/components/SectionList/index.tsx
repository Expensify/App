import React, {type ForwardedRef, forwardRef} from 'react';
import {SectionList as RNSectionList, type SectionListProps} from 'react-native';

function SectionList<ItemT, SectionT>(props: SectionListProps<ItemT, SectionT>, ref: ForwardedRef<RNSectionList<ItemT, SectionT>>) {
    return (
        <RNSectionList
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            ref={ref}
        />
    );
}

SectionList.displayName = 'SectionList';

export default forwardRef(SectionList);
