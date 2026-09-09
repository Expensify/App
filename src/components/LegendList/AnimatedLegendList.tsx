import type {AnimatedLegendListProps} from '@legendapp/list/reanimated';
import type {Ref} from 'react';

import {AnimatedLegendList as BaseAnimatedLegendList} from '@legendapp/list/reanimated';

import type {LegendListRef} from './types';

type Props<TItem> = AnimatedLegendListProps<TItem> & {
    ref?: Ref<LegendListRef>;
};

function AnimatedLegendList<TItem = unknown>({maintainVisibleContentPosition = false, recycleItems = false, ref, ...rest}: Props<TItem>) {
    return (
        <BaseAnimatedLegendList<TItem>
            ref={ref}
            maintainVisibleContentPosition={maintainVisibleContentPosition}
            recycleItems={recycleItems}
            {...rest}
        />
    );
}

export default AnimatedLegendList;
