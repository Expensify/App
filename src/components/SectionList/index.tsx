import React, {forwardRef} from 'react';
import {SectionList as RNSectionList} from 'react-native';
import Animated from 'react-native-reanimated';
import type {SectionListProps, SectionListRef} from './types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const AnimatedSectionList = Animated.createAnimatedComponent<SectionListProps<any, any>>(RNSectionList);

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
