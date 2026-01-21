import React from 'react';
import {SectionList} from 'react-native';
import Animated from 'react-native-reanimated';
import useBottomSafeSafeAreaPaddingStyle from '@hooks/useBottomSafeSafeAreaPaddingStyle';
import type {SectionListProps} from './types';

const AnimatedSectionList = Animated.createAnimatedComponent(SectionList);

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
