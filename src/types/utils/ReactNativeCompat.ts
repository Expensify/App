/**
 * Stand-ins for root type exports the RN Strict TypeScript API removes.
 * Derived from FlatList props so the same aliases typecheck on 0.86 and the Strict API.
 * The generic is phantom under the Strict API: VirtualizedListProps is not generic there (`Item = any`),
 * so `T` is ignored and `viewableItems[].item` widens from `unknown` to `any` after the flip.
 */
import type {FlatListProps, ViewProps} from 'react-native';

type ViewableItemsChanged = NonNullable<FlatListProps<unknown>['onViewableItemsChanged']>;

type ViewToken = Parameters<ViewableItemsChanged>[0]['viewableItems'][number];

type ViewabilityConfig = NonNullable<FlatListProps<unknown>['viewabilityConfig']>;

type CellRendererProps<T> = NonNullable<FlatListProps<T>['CellRendererComponent']> extends React.ComponentType<infer P> ? P : never;

/**
 * The key down and click events a View or Pressable receives. On the current types they come from react-native-web, which passes
 * the DOM event. Under the Strict API they are React Native's own `KeyDownEvent` and `PointerEvent`, which carry the key, modifiers and
 * pointer position in `nativeEvent`. The DOM event carries them there too, so handlers read them from `nativeEvent`.
 */
type ViewKeyDownEvent = Parameters<NonNullable<ViewProps['onKeyDown']>>[0];

type ViewClickEvent = Parameters<NonNullable<ViewProps['onClick']>>[0];

export type {CellRendererProps, ViewabilityConfig, ViewableItemsChanged, ViewClickEvent, ViewKeyDownEvent, ViewToken};
