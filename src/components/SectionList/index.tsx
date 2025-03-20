import React, {forwardRef} from 'react';
import BaseSectionList from './BaseSectionList';
import type {SectionListProps, SectionListRef} from './types';

function SectionList<ItemT, SectionT>(props: SectionListProps<ItemT, SectionT>, ref: SectionListRef<ItemT, SectionT>) {
    return (
        <BaseSectionList
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            ref={ref}
        />
    );
}

SectionList.displayName = 'SectionList';

export default forwardRef(SectionList);
