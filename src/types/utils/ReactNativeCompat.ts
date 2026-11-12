/**
 * Stand-ins for type exports the RN Strict TypeScript API removes or hides behind deep imports.
 * Each one is derived from a public prop or API signature so the same alias typechecks on 0.86 and the Strict API.
 * The FlatList generic is phantom under the Strict API: VirtualizedListProps is not generic there (`Item = any`),
 * so `T` is ignored and `viewableItems[].item` widens from `unknown` to `any` after the flip.
 */
import type {BackHandler, FlatListProps, TextInputProps, ViewProps} from 'react-native';

type ViewableItemsChanged = NonNullable<FlatListProps<unknown>['onViewableItemsChanged']>;

type ViewToken = Parameters<ViewableItemsChanged>[0]['viewableItems'][number];

type ViewabilityConfig = NonNullable<FlatListProps<unknown>['viewabilityConfig']>;

type CellRendererProps<T> = NonNullable<FlatListProps<T>['CellRendererComponent']> extends React.ComponentType<infer P> ? P : never;

type TextInputScrollEvent = Parameters<NonNullable<TextInputProps['onScroll']>>[0];

/** Only reachable through `react-native/Libraries/Utilities/BackHandler`, which the Strict API blocks */
type HardwareBackPressEvent = Parameters<Parameters<typeof BackHandler.addEventListener>[1]>[0];

/**
 * The key down and click events a View or Pressable receives. On the current types they come from react-native-web, which passes
 * the DOM event. Under the Strict API they are React Native's own `KeyDownEvent` and `PointerEvent`, which carry the key, modifiers and
 * pointer position in `nativeEvent`. The DOM event carries them there too, so handlers read them from `nativeEvent`.
 */
type ViewKeyDownEvent = Parameters<NonNullable<ViewProps['onKeyDown']>>[0];

type ViewClickEvent = Parameters<NonNullable<ViewProps['onClick']>>[0];

export type {CellRendererProps, HardwareBackPressEvent, TextInputScrollEvent, ViewabilityConfig, ViewableItemsChanged, ViewClickEvent, ViewKeyDownEvent, ViewToken};
