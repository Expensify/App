import React, {forwardRef} from 'react';
import AnimatedSectionList from './AnimatedSectionList';
import type {SectionListProps, SectionListRef} from './types';

function SectionList<ItemT, SectionT>(props: SectionListProps<ItemT, SectionT>, ref: SectionListRef<ItemT, SectionT>) {
    return (
        <AnimatedSectionList
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            ref={ref}
        />
    );
}

SectionList.displayName = 'SectionList';

export default forwardRef(SectionList);
