import type {Ref} from 'react';

import {LegendList as BaseLegendList} from '@legendapp/list/react-native';

import type {LegendListProps, LegendListRef} from './types';

type Props<TItem> = LegendListProps<TItem> & {
    /** Ref forwarded to the underlying LegendList. */
    ref?: Ref<LegendListRef>;
};

function LegendList<TItem = unknown>(props: Props<TItem>) {
    return <BaseLegendList<TItem> {...props} />;
}

export default LegendList;
