import type {Ref} from 'react';

import {LegendList as BaseLegendList} from '@legendapp/list/react-native';

import type {LegendListProps, LegendListRef} from './types';

type Props<TItem> = LegendListProps<TItem> & {
    ref?: Ref<LegendListRef>;
};

function LegendList<TItem = unknown>({maintainVisibleContentPosition = false, recycleItems = false, ref, ...rest}: Props<TItem>) {
    return (
        <BaseLegendList<TItem>
            ref={ref}
            maintainVisibleContentPosition={maintainVisibleContentPosition}
            recycleItems={recycleItems}
            {...rest}
        />
    );
}

export default LegendList;
