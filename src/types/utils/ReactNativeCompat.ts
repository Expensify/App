/**
 * Stand-ins for root type exports the RN Strict TypeScript API removes.
 * Derived from FlatList props so the same aliases typecheck on 0.86 and the Strict API.
 * The generic is phantom under the Strict API: VirtualizedListProps is not generic there (`Item = any`),
 * so `T` is ignored and `viewableItems[].item` widens from `unknown` to `any` after the flip.
 */
import type {FlatListProps} from 'react-native';

type ViewableItemsChanged = NonNullable<FlatListProps<unknown>['onViewableItemsChanged']>;

type ViewToken = Parameters<ViewableItemsChanged>[0]['viewableItems'][number];

type ViewabilityConfig = NonNullable<FlatListProps<unknown>['viewabilityConfig']>;

type CellRendererProps<T> = NonNullable<FlatListProps<T>['CellRendererComponent']> extends React.ComponentType<infer P> ? P : never;

export type {CellRendererProps, ViewabilityConfig, ViewableItemsChanged, ViewToken};
