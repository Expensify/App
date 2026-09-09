import type {LegendListRenderItemProps} from '@legendapp/list/react-native';
import type {ReactNode} from 'react';

type LegendListRenderItem<TItem> = (props: LegendListRenderItemProps<TItem>) => ReactNode;

export type {LegendListProps, LegendListRef, LegendListRenderItemProps, ViewToken} from '@legendapp/list/react-native';
export type {LegendListRenderItem};
