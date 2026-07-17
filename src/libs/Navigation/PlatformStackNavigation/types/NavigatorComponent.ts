import type {EventMapBase, ParamListBase, RouteProp, StackActionHelpers} from '@react-navigation/native';

import type {
    PlatformSpecificEventMap,
    PlatformSpecificNavigationOptions,
    PlatformStackNavigationOptions,
    PlatformStackNavigationState,
    PlatformStackRouterFactory,
    PlatformStackRouterOptions,
} from '.';
import type {PlatformNavigationBuilderDescriptors, PlatformNavigationBuilderNavigation} from './NavigationBuilder';

// Props that custom code receives when passed to the createPlatformStackNavigatorComponent generator function.
// Custom logic like "transformState", "onWindowDimensionsChange" and custom components like "NavigationContentWrapper" and "ExtraContent" will receive these props
type CustomCodeProps<
    NavigationOptions extends PlatformSpecificNavigationOptions,
    EventMap extends PlatformSpecificEventMap & EventMapBase,
    ParamList extends ParamListBase = ParamListBase,
    ActionHelpers extends StackActionHelpers<ParamList> = StackActionHelpers<ParamList>,
> = {
    state: PlatformStackNavigationState<ParamListBase>;
    navigation: PlatformNavigationBuilderNavigation<EventMap, ParamList, ActionHelpers>;
    descriptors: PlatformNavigationBuilderDescriptors<NavigationOptions, EventMap, ParamList>;
    displayName: string;
    parentRoute?: RouteProp<ParamListBase>;
};

// Props for getCustomState. shouldUseNarrowLayout is provided by PlatformNavigatorImpl so transforms stay pure (no hooks).
type CustomStateHookProps<ParamList extends ParamListBase = ParamListBase> = CustomCodeProps<PlatformSpecificNavigationOptions, PlatformSpecificEventMap & EventMapBase, ParamList> & {
    shouldUseNarrowLayout: boolean;
};

// Plain function that transforms navigation state. Must not call React hooks.
type GetCustomState<ParamList extends ParamListBase = ParamListBase> = (props: CustomStateHookProps<ParamList>) => PlatformStackNavigationState<ParamList> | undefined;

// Props for the Effects component (same shape as ExtraContent custom code props).
type CustomEffectsHookProps<ParamList extends ParamListBase = ParamListBase> = CustomCodeProps<PlatformSpecificNavigationOptions, PlatformSpecificEventMap & EventMapBase, ParamList>;

// A React component that runs navigator side effects (hooks) and renders nothing.
type NavigatorEffects<ParamList extends ParamListBase = ParamListBase> = (props: CustomEffectsHookProps<ParamList>) => React.ReactElement | null;

// Props for the ExtraContent component.
type ExtraContentProps = CustomCodeProps<PlatformSpecificNavigationOptions, PlatformSpecificEventMap & EventMapBase>;

// A React component that renders extra content within the navigator, like a header or footer.
type ExtraContent = (props: ExtraContentProps) => React.ReactElement | null;

// Props for the NavigationContentWrapper component.
type NavigationContentWrapperProps = React.PropsWithChildren<CustomCodeProps<PlatformSpecificNavigationOptions, PlatformSpecificEventMap & EventMapBase, ParamListBase>>;

// A React component that renders extra content within the navigator, like a header or footer.
type NavigationContentWrapper = (props: NavigationContentWrapperProps) => React.ReactElement | null;

// Determines how non-top screens are wrapped to avoid re-render work while they are covered.
// With 'freeze' the screen is suspended via react-freeze and processes no updates at all.
// With 'activity' the screen is wrapped in React <Activity>, which defers updates to background priority
// and runs effect cleanups while the screen is hidden.
type NonTopScreensBehavior = 'freeze' | 'activity';

// Options for creating the PlatformStackNavigator using createPlatformStackNavigatorComponent.
type CreatePlatformStackNavigatorComponentOptions<RouterOptions extends PlatformStackRouterOptions = PlatformStackRouterOptions, ParamList extends ParamListBase = ParamListBase> = {
    createRouter?: PlatformStackRouterFactory<ParamList, RouterOptions>;
    defaultScreenOptions?: PlatformStackNavigationOptions;
    getCustomState?: GetCustomState<ParamList>;
    Effects?: NavigatorEffects<ParamList>;
    ExtraContent?: ExtraContent;
    NavigationContentWrapper?: NavigationContentWrapper;
    nonTopScreensBehavior?: NonTopScreensBehavior;
};

export type {CustomCodeProps, CustomStateHookProps, CustomEffectsHookProps, CreatePlatformStackNavigatorComponentOptions, ExtraContentProps, NonTopScreensBehavior};
