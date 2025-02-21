import React, {forwardRef} from 'react';
import useContentContainerStyleWithBottomSafeAreaPadding from '@hooks/useContentContainerStyleWithBottomSafeAreaPadding';
import AnimatedSectionList from './AnimatedSectionList';
import type {SectionListProps, SectionListRef} from './types';

function BaseSectionList<ItemT, SectionT>(
    {addBottomSafeAreaPaddingToContent = false, contentContainerStyle: contentContainerStyleProp, ...restProps}: SectionListProps<ItemT, SectionT>,
    ref: SectionListRef<ItemT, SectionT>,
) {
    const contentContainerStyle = useContentContainerStyleWithBottomSafeAreaPadding(addBottomSafeAreaPaddingToContent, contentContainerStyleProp);

    return (
        <AnimatedSectionList
            contentContainerStyle={contentContainerStyle}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...restProps}
            ref={ref}
        />
    );
}

BaseSectionList.displayName = 'SectionList';

export default forwardRef(BaseSectionList);
