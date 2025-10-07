// Represents the options passed to useNavigationBuilder for creating a custom navigation builder,
import type {
    DefaultNavigatorOptions,
    Descriptor,
    EventMapBase,
    NavigationHelpers,
    NavigationListBase,
    NavigationProp,
    ParamListBase,
    RouteProp,
    StackActionHelpers,
} from '@react-navigation/native';
import type {PlatformSpecificEventMap, PlatformSpecificNavigationOptions, PlatformStackNavigationState, PlatformStackRouterOptions} from '.';

// Represents the options passed to useNavigationBuilder for creating a custom navigation builder,
// using the abstracted and custom types from PlatformStackNavigation.
type PlatformNavigationBuilderOptions<
    NavigationOptions extends PlatformSpecificNavigationOptions,
    EventMap extends PlatformSpecificEventMap & EventMapBase,
    ParamList extends ParamListBase = ParamListBase,
    RouterOptions extends PlatformStackRouterOptions = PlatformStackRouterOptions,
> = DefaultNavigatorOptions<ParamList, string | undefined, PlatformStackNavigationState<ParamList>, NavigationOptions, EventMap, NavigationListBase<ParamList>, keyof ParamList> &
    RouterOptions & {
        persistentScreens?: Array<Extract<keyof ParamList, string>>;
        defaultCentralScreen?: Extract<keyof ParamList, string>;
        sidebarScreen?: Extract<keyof ParamList, string>;
        parentRoute?: RouteProp<ParamList>;
    };

// Represents the type of the navigation object returned by useNavigationBuilder
type PlatformNavigationBuilderNavigation<
    EventMap extends PlatformSpecificEventMap & EventMapBase,
    ParamList extends ParamListBase = ParamListBase,
    ActionHelpers extends StackActionHelpers<ParamList> = StackActionHelpers<ParamList>,
> = NavigationHelpers<ParamList, EventMap> & ActionHelpers;

// Represents the type of a single descriptor returned by useNavigationBuilder
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

export type {PlatformNavigationBuilderOptions, PlatformNavigationBuilderNavigation, PlatformNavigationBuilderDescriptors};
