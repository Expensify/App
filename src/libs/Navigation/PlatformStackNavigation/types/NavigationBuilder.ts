// Represents the options passed to useNavigationBuilder for creating a custom navigation builder,
import type {
    DefaultNavigatorOptions,
    Descriptor,
    EventMapBase,
    NavigationBuilderOptions,
    NavigationHelpers,
    NavigationProp,
    ParamListBase,
    RouteProp,
    StackActionHelpers,
    useNavigationBuilder,
} from '@react-navigation/native';
import type {PlatformSpecificEventMap, PlatformSpecificNavigationOptions, PlatformStackNavigationOptions, PlatformStackNavigationState, PlatformStackRouterOptions} from '.';

// Represents the options passed to useNavigationBuilder for creating a custom navigation builder,
// using the abstracted and custom types from PlatformStackNavigation.
type PlatformNavigationBuilderOptions<
    NavigationOptions extends PlatformSpecificNavigationOptions,
    EventMap extends PlatformSpecificEventMap & EventMapBase,
    ParamList extends ParamListBase = ParamListBase,
    RouterOptions extends PlatformStackRouterOptions = PlatformStackRouterOptions,
> = DefaultNavigatorOptions<ParamList, PlatformStackNavigationState<ParamList>, NavigationOptions, EventMap> & NavigationBuilderOptions<NavigationOptions> & RouterOptions;

// Represents the return type of the useNavigationBuilder function using the types from PlatformStackNavigation.
type PlatformNavigationBuilderResult<
    NavigationOptions extends PlatformSpecificNavigationOptions,
    EventMap extends PlatformSpecificEventMap & EventMapBase,
    ParamList extends ParamListBase = ParamListBase,
    RouterOptions extends PlatformStackRouterOptions = PlatformStackRouterOptions,
    ActionHelpers extends StackActionHelpers<ParamList> = StackActionHelpers<ParamList>,
> = ReturnType<typeof useNavigationBuilder<PlatformStackNavigationState<ParamList>, RouterOptions, ActionHelpers, PlatformStackNavigationOptions, EventMap, NavigationOptions>>;

// Represents the type of the navigation object returned by useNavigationBuilder
type PlatformNavigationBuilderNavigation<
    EventMap extends PlatformSpecificEventMap & EventMapBase,
    ParamList extends ParamListBase = ParamListBase,
    ActionHelpers extends StackActionHelpers<ParamList> = StackActionHelpers<ParamList>,
> = NavigationHelpers<ParamList, EventMap> & ActionHelpers;

// Represents the type of a single descripter returned by useNavigationBuilder
type PlatformNavigationBuilderDescriptor<
    NavigationOptions extends PlatformSpecificNavigationOptions,
    EventMap extends PlatformSpecificEventMap & EventMapBase,
    ParamList extends ParamListBase = ParamListBase,
> = Descriptor<
    NavigationOptions,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    NavigationProp<ParamList, keyof ParamList, any, PlatformStackNavigationState<ParamList>, NavigationOptions, EventMap>,
    RouteProp<ParamList, keyof ParamList>
>;

// Represents the type of the descriptors object returned by useNavigationBuilder
type PlatformNavigationBuilderDescriptors<
    NavigationOptions extends PlatformSpecificNavigationOptions,
    EventMap extends PlatformSpecificEventMap & EventMapBase,
    ParamList extends ParamListBase = ParamListBase,
> = Record<string, PlatformNavigationBuilderDescriptor<NavigationOptions, EventMap, ParamList>>;

export type {
    PlatformNavigationBuilderOptions,
    PlatformNavigationBuilderResult,
    PlatformNavigationBuilderNavigation,
    PlatformNavigationBuilderDescriptor,
    PlatformNavigationBuilderDescriptors,
};
