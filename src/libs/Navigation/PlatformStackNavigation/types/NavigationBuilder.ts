// Represents the options passed to useNavigationBuilder for creating a custom navigation builder,
import type {Descriptor, EventMapBase, NavigationHelpers, NavigationProp, ParamListBase, RouteProp, StackActionHelpers} from '@react-navigation/native';
import type {PlatformSpecificEventMap, PlatformSpecificNavigationOptions, PlatformStackNavigationState} from '.';

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

export type {PlatformNavigationBuilderNavigation, PlatformNavigationBuilderDescriptors};
