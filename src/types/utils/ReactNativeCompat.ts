/**
 * Stand-ins for type exports the RN Strict TypeScript API removes or hides behind deep imports.
 * Each one is derived from a public prop or API signature so the same alias typechecks on 0.86 and the Strict API.
 * The FlatList generic is phantom under the Strict API: VirtualizedListProps is not generic there (`Item = any`),
 * so `T` is ignored and `viewableItems[].item` widens from `unknown` to `any` after the flip.
 */
import type {BackHandler, FlatListProps, TextInputProps} from 'react-native';

type ViewableItemsChanged = NonNullable<FlatListProps<unknown>['onViewableItemsChanged']>;

type ViewToken = Parameters<ViewableItemsChanged>[0]['viewableItems'][number];

type ViewabilityConfig = NonNullable<FlatListProps<unknown>['viewabilityConfig']>;

type CellRendererProps<T> = NonNullable<FlatListProps<T>['CellRendererComponent']> extends React.ComponentType<infer P> ? P : never;

type TextInputScrollEvent = Parameters<NonNullable<TextInputProps['onScroll']>>[0];

/** Only reachable through `react-native/Libraries/Utilities/BackHandler`, which the Strict API blocks */
type HardwareBackPressEvent = Parameters<Parameters<typeof BackHandler.addEventListener>[1]>[0];

export type {CellRendererProps, HardwareBackPressEvent, TextInputScrollEvent, ViewabilityConfig, ViewableItemsChanged, ViewToken};
