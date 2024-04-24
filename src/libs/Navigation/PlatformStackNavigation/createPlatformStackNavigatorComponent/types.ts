import type {DefaultNavigatorOptions, EventMapBase, NavigationBuilderOptions, ParamListBase, StackActionHelpers, useNavigationBuilder} from '@react-navigation/native';
import type WindowDimensions from '@hooks/useWindowDimensions/types';
import type {
    PlatformNavigationBuilderNavigation,
    PlatformSpecificEventMap,
    PlatformSpecificNavigationOptions,
    PlatformStackNavigationDescriptor,
    PlatformStackNavigationDescriptors,
    PlatformStackNavigationOptions,
    PlatformStackNavigationState,
    PlatformStackRouterFactory,
    PlatformStackRouterOptions,
} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ThemeStyles} from '@styles/index';

type PlatformNavigationBuilderOptions<
    NavigationOptions extends PlatformSpecificNavigationOptions,
    EventMap extends PlatformSpecificEventMap & EventMapBase,
    ParamList extends ParamListBase = ParamListBase,
    RouterOptions extends PlatformStackRouterOptions = PlatformStackRouterOptions,
> = DefaultNavigatorOptions<ParamList, PlatformStackNavigationState<ParamList>, NavigationOptions, EventMap> & NavigationBuilderOptions<NavigationOptions> & RouterOptions;

type PlatformNavigationBuilderResult<
    NavigationOptions extends PlatformSpecificNavigationOptions,
    EventMap extends PlatformSpecificEventMap & EventMapBase,
    ParamList extends ParamListBase = ParamListBase,
    RouterOptions extends PlatformStackRouterOptions = PlatformStackRouterOptions,
    ActionHelpers extends StackActionHelpers<ParamList> = StackActionHelpers<ParamList>,
> = ReturnType<typeof useNavigationBuilder<PlatformStackNavigationState<ParamList>, RouterOptions, ActionHelpers, PlatformStackNavigationOptions, EventMap, NavigationOptions>>;

type CustomCodeProps<
    NavigationOptions extends PlatformSpecificNavigationOptions,
    EventMap extends PlatformSpecificEventMap & EventMapBase,
    ParamList extends ParamListBase = ParamListBase,
    ActionHelpers extends StackActionHelpers<ParamList> = StackActionHelpers<ParamList>,
> = {
    state: PlatformStackNavigationState<ParamListBase>;
    navigation: PlatformNavigationBuilderNavigation<EventMap, ParamList, ActionHelpers>;
    descriptors: PlatformStackNavigationDescriptors<NavigationOptions, EventMap, ParamList>;
    displayName: string;
};

type CustomCodePropsWithTransformedState<
    NavigationOptions extends PlatformSpecificNavigationOptions,
    EventMap extends PlatformSpecificEventMap & EventMapBase,
    ParamList extends ParamListBase = ParamListBase,
    ActionHelpers extends StackActionHelpers<ParamList> = StackActionHelpers<ParamList>,
> = CustomCodeProps<NavigationOptions, EventMap, ParamList, ActionHelpers> & TransformStateExtraResult;

type SearchRoute = PlatformStackNavigationState<ParamListBase>['routes'][number];

type CustomCodeDisplayProps = {
    styles: ThemeStyles;
    windowDimensions: WindowDimensions;
};

type TransformStateProps<
    NavigationOptions extends PlatformSpecificNavigationOptions,
    EventMap extends PlatformSpecificEventMap & EventMapBase,
    ParamList extends ParamListBase = ParamListBase,
> = CustomCodeProps<NavigationOptions, EventMap, ParamList> & CustomCodeDisplayProps;
type TransformStateExtraResult = {
    searchRoute?: SearchRoute;
};
type TransformState<
    NavigationOptions extends PlatformSpecificNavigationOptions,
    EventMap extends PlatformSpecificEventMap & EventMapBase,
    ParamList extends ParamListBase = ParamListBase,
> = (props: TransformStateProps<NavigationOptions, EventMap, ParamList>) => TransformStateExtraResult & {
    stateToRender: PlatformStackNavigationState<ParamListBase>;
};

type OnWindowDimensionsChangeProps<
    NavigationOptions extends PlatformSpecificNavigationOptions,
    EventMap extends PlatformSpecificEventMap & EventMapBase,
    ParamList extends ParamListBase = ParamListBase,
> = CustomCodeProps<NavigationOptions, EventMap, ParamList> & {
    windowDimensions: WindowDimensions;
};

type OnWindowDimensionsChange<
    NavigationOptions extends PlatformSpecificNavigationOptions,
    EventMap extends PlatformSpecificEventMap & EventMapBase,
    ParamList extends ParamListBase = ParamListBase,
> = (props: OnWindowDimensionsChangeProps<NavigationOptions, EventMap, ParamList>) => void;

type ExtraContent<NavigationOptions extends PlatformSpecificNavigationOptions, EventMap extends PlatformSpecificEventMap & EventMapBase, ParamList extends ParamListBase = ParamListBase> = (
    props: CustomCodePropsWithTransformedState<NavigationOptions, EventMap, ParamList>,
) => React.ReactElement | null;

type NavigationContentWrapperProps<
    NavigationOptions extends PlatformSpecificNavigationOptions,
    EventMap extends PlatformSpecificEventMap & EventMapBase,
    ParamList extends ParamListBase = ParamListBase,
> = React.PropsWithChildren<CustomCodePropsWithTransformedState<NavigationOptions, EventMap, ParamList>>;
type NavigationContentWrapper<
    NavigationOptions extends PlatformSpecificNavigationOptions,
    EventMap extends PlatformSpecificEventMap & EventMapBase,
    ParamList extends ParamListBase = ParamListBase,
> = (props: NavigationContentWrapperProps<NavigationOptions, EventMap, ParamList>) => React.ReactElement | null;

type CreatePlaformStackNavigatorOptions<
    RouterOptions extends PlatformStackRouterOptions = PlatformStackRouterOptions,
    NavigationOptions extends PlatformSpecificNavigationOptions = PlatformSpecificNavigationOptions,
    EventMap extends PlatformSpecificEventMap & EventMapBase = PlatformSpecificEventMap & EventMapBase,
    ParamList extends ParamListBase = ParamListBase,
> = {
    createRouter?: PlatformStackRouterFactory<ParamList, RouterOptions>;
    defaultScreenOptions?: NavigationOptions;
    transformState?: TransformState<NavigationOptions, EventMap, ParamList>;
    onWindowDimensionsChange?: OnWindowDimensionsChange<NavigationOptions, EventMap, ParamList>;
    ExtraContent?: ExtraContent<NavigationOptions, EventMap, ParamList>;
    NavigationContentWrapper?: NavigationContentWrapper<NavigationOptions, EventMap, ParamList>;
};

export type {
    PlatformNavigationBuilderOptions,
    PlatformNavigationBuilderResult,
    PlatformStackNavigationDescriptor,
    TransformStateExtraResult,
    TransformStateProps,
    TransformState,
    OnWindowDimensionsChangeProps,
    OnWindowDimensionsChange,
    CustomCodePropsWithTransformedState,
    ExtraContent,
    NavigationContentWrapperProps,
    NavigationContentWrapper,
    CreatePlaformStackNavigatorOptions,
};
