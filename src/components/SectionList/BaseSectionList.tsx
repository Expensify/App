import React from 'react';
import useBottomSafeSafeAreaPaddingStyle from '@hooks/useBottomSafeSafeAreaPaddingStyle';
import AnimatedSectionList from './AnimatedSectionList';
import type {SectionListProps} from './types';

function BaseSectionList<ItemT, SectionT>({
    addBottomSafeAreaPadding,
    addOfflineIndicatorBottomSafeAreaPadding,
    contentContainerStyle: contentContainerStyleProp,
    ref,
    ...restProps
}: SectionListProps<ItemT, SectionT>) {
    const contentContainerStyle = useBottomSafeSafeAreaPaddingStyle({addBottomSafeAreaPadding, addOfflineIndicatorBottomSafeAreaPadding, style: contentContainerStyleProp});

    return (
        <AnimatedSectionList
            contentContainerStyle={contentContainerStyle}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...restProps}
            ref={ref}
        />
    );
}

export default BaseSectionList;
