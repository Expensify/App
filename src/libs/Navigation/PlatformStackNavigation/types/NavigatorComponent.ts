import type {EventMapBase, ParamListBase, StackActionHelpers} from '@react-navigation/native';
import type {
    PlatformSpecificEventMap,
    PlatformSpecificNavigationOptions,
    PlatformStackNavigationOptions,
    PlatformStackNavigationState,
    PlatformStackRouterFactory,
    PlatformStackRouterOptions,
} from '.';
import type {PlatformNavigationBuilderDescriptors, PlatformNavigationBuilderNavigation} from './NavigationBuilder';

// Represents a route in the search context within the navigation state.
type SearchRoute = PlatformStackNavigationState<ParamListBase>['routes'][number];

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
    searchRoute?: SearchRoute;
};

// Props for the custom state hook.
type CustomStateHookProps<ParamList extends ParamListBase = ParamListBase> = CustomCodeProps<PlatformSpecificNavigationOptions, PlatformSpecificEventMap & EventMapBase, ParamList>;

// Defines a hook function type for transforming the navigation state based on props, and returning the transformed state and search route.
type CustomStateHook<ParamList extends ParamListBase = ParamListBase> = (props: CustomStateHookProps<ParamList>) => {
    stateToRender?: PlatformStackNavigationState<ParamList>;
    searchRoute?: SearchRoute;
};

// Props for the custom effects hook.
type CustomEffectsHookProps<ParamList extends ParamListBase = ParamListBase> = CustomCodeProps<PlatformSpecificNavigationOptions, PlatformSpecificEventMap & EventMapBase, ParamList>;

// Defines a hook function type for creating custom effects in the navigator.
type CustomEffectsHook<ParamList extends ParamListBase = ParamListBase> = (props: CustomEffectsHookProps<ParamList>) => void;

// Props for the ExtraContent component.
type ExtraContentProps = CustomCodeProps<PlatformSpecificNavigationOptions, PlatformSpecificEventMap & EventMapBase>;

// A React component that renders extra content within the navigator, like a header or footer.
type ExtraContent = (props: ExtraContentProps) => React.ReactElement | null;

// Props for the NavigationContentWrapper component.
type NavigationContentWrapperProps = React.PropsWithChildren<CustomCodeProps<PlatformSpecificNavigationOptions, PlatformSpecificEventMap & EventMapBase, ParamListBase>>;

// A React component that renders extra content within the navigator, like a header or footer.
type NavigationContentWrapper = (props: NavigationContentWrapperProps) => React.ReactElement | null;

// Options for creating the PlatformStackNavigator using createPlatformStackNavigatorComponent.
type CreatePlatformStackNavigatorComponentOptions<RouterOptions extends PlatformStackRouterOptions = PlatformStackRouterOptions, ParamList extends ParamListBase = ParamListBase> = {
    createRouter?: PlatformStackRouterFactory<ParamList, RouterOptions>;
    defaultScreenOptions?: PlatformStackNavigationOptions;
    useCustomState?: CustomStateHook<ParamList>;
    useCustomEffects?: CustomEffectsHook<ParamList>;
    ExtraContent?: ExtraContent;
    NavigationContentWrapper?: NavigationContentWrapper;
};

export type {
    CustomCodeProps,
    CustomStateHookProps,
    CustomStateHook,
    CustomEffectsHookProps,
    CustomEffectsHook,
    ExtraContentProps,
    ExtraContent,
    NavigationContentWrapperProps,
    NavigationContentWrapper,
    CreatePlatformStackNavigatorComponentOptions,
};
