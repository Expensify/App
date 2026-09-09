import type {AnimatedLegendListProps} from '@legendapp/list/reanimated';
import type {Ref} from 'react';

import {AnimatedLegendList as BaseAnimatedLegendList} from '@legendapp/list/reanimated';

import type {LegendListRef} from './types';

type Props<TItem> = AnimatedLegendListProps<TItem> & {
    /** Ref forwarded to the underlying animated LegendList. */
    ref?: Ref<LegendListRef>;
};

function AnimatedLegendList<TItem = unknown>(props: Props<TItem>) {
    return <BaseAnimatedLegendList<TItem> {...props} />;
}

export default AnimatedLegendList;
