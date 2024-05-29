import type {EventMapBase, ParamListBase, StackActionHelpers} from '@react-navigation/native';
import type WindowDimensions from '@hooks/useWindowDimensions/types';
import type {ThemeStyles} from '@styles/index';
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
};

// Extension of CustomCodeProps to include the output from the "transformState" function.
type CustomCodePropsWithTransformedState<
    NavigationOptions extends PlatformSpecificNavigationOptions,
    EventMap extends PlatformSpecificEventMap & EventMapBase,
    ParamList extends ParamListBase = ParamListBase,
    ActionHelpers extends StackActionHelpers<ParamList> = StackActionHelpers<ParamList>,
> = CustomCodeProps<NavigationOptions, EventMap, ParamList, ActionHelpers> & TransformStateResult<ParamList>;

// Represents a route in the search context within the navigation state.
type SearchRoute = PlatformStackNavigationState<ParamListBase>['routes'][number];

// Since we cannot use hooks like useThemeStyles and useWindowDimensions in custom code functions,
// We need to run the hooks in the navigator and pass the results as props to the custom code functions.
type CustomCodeDisplayProps = {
    styles: ThemeStyles;
    windowDimensions: WindowDimensions;
};

// Props that are passed to the "transformState" function.
type TransformStateProps<
    NavigationOptions extends PlatformSpecificNavigationOptions,
    EventMap extends PlatformSpecificEventMap & EventMapBase,
    ParamList extends ParamListBase = ParamListBase,
> = CustomCodeProps<NavigationOptions, EventMap, ParamList> & CustomCodeDisplayProps;

// The result from the "transformState" function, which includes the transformed state and the search route.
type TransformStateResult<ParamList extends ParamListBase = ParamListBase> = {
    stateToRender: PlatformStackNavigationState<ParamList>;
    searchRoute?: SearchRoute;
};

// Defines a function type for transforming the navigation state based on props, and returning the transformed state and search route.
type TransformState<
    NavigationOptions extends PlatformSpecificNavigationOptions,
    EventMap extends PlatformSpecificEventMap & EventMapBase,
    ParamList extends ParamListBase = ParamListBase,
> = (props: TransformStateProps<NavigationOptions, EventMap, ParamList>) => TransformStateResult<ParamList>;

// Props that are passed to the "onWindowDimensionsChange" callback.
type OnIsSmallScreenWidthChangeProps<
    NavigationOptions extends PlatformSpecificNavigationOptions,
    EventMap extends PlatformSpecificEventMap & EventMapBase,
    ParamList extends ParamListBase = ParamListBase,
> = CustomCodeProps<NavigationOptions, EventMap, ParamList> & {
    windowDimensions: WindowDimensions;
};

// Defines a function type for handling changes in window dimensions within a navigation context.
type OnIsSmallScreenWidthChange<
    NavigationOptions extends PlatformSpecificNavigationOptions,
    EventMap extends PlatformSpecificEventMap & EventMapBase,
    ParamList extends ParamListBase = ParamListBase,
> = (props: OnIsSmallScreenWidthChangeProps<NavigationOptions, EventMap, ParamList>) => void;

// A React component that renders extra content within the navigator, like a header or footer.
type ExtraContent<NavigationOptions extends PlatformSpecificNavigationOptions, EventMap extends PlatformSpecificEventMap & EventMapBase, ParamList extends ParamListBase = ParamListBase> = (
    props: CustomCodePropsWithTransformedState<NavigationOptions, EventMap, ParamList>,
) => React.ReactElement | null;

// Props for the NavigationContentWrapper component.
type NavigationContentWrapperProps<
    NavigationOptions extends PlatformSpecificNavigationOptions,
    EventMap extends PlatformSpecificEventMap & EventMapBase,
    ParamList extends ParamListBase = ParamListBase,
> = React.PropsWithChildren<CustomCodePropsWithTransformedState<NavigationOptions, EventMap, ParamList>>;

// A React component that renders extra content within the navigator, like a header or footer.
type NavigationContentWrapper<
    NavigationOptions extends PlatformSpecificNavigationOptions,
    EventMap extends PlatformSpecificEventMap & EventMapBase,
    ParamList extends ParamListBase = ParamListBase,
> = (props: NavigationContentWrapperProps<NavigationOptions, EventMap, ParamList>) => React.ReactElement | null;

// Options for creating the PlatformStackNavigator using createPlatformStackNavigatorComponent.
type CreatePlatformStackNavigatorComponentOptions<
    RouterOptions extends PlatformStackRouterOptions = PlatformStackRouterOptions,
    NavigationOptions extends PlatformSpecificNavigationOptions = PlatformSpecificNavigationOptions,
    EventMap extends PlatformSpecificEventMap & EventMapBase = PlatformSpecificEventMap & EventMapBase,
    ParamList extends ParamListBase = ParamListBase,
> = {
    createRouter?: PlatformStackRouterFactory<ParamList, RouterOptions>;
    defaultScreenOptions?: PlatformStackNavigationOptions;
    transformState?: TransformState<NavigationOptions, EventMap, ParamList>;
    onIsSmallScreenWidthChange?: OnIsSmallScreenWidthChange<NavigationOptions, EventMap, ParamList>;
    ExtraContent?: ExtraContent<NavigationOptions, EventMap, ParamList>;
    NavigationContentWrapper?: NavigationContentWrapper<NavigationOptions, EventMap, ParamList>;
};

export type {
    TransformStateResult as TransformStateExtraResult,
    TransformStateProps,
    TransformState,
    OnIsSmallScreenWidthChangeProps,
    OnIsSmallScreenWidthChange,
    CustomCodeProps,
    CustomCodePropsWithTransformedState,
    ExtraContent,
    NavigationContentWrapperProps,
    NavigationContentWrapper,
    CreatePlatformStackNavigatorComponentOptions,
};
