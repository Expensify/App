import type {DefaultNavigatorOptions, EventMapBase, NavigationBuilderOptions, ParamListBase, StackActionHelpers, useNavigationBuilder} from '@react-navigation/native';
import type WindowDimensions from '@hooks/useWindowDimensions/types';
import type {
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
> = ReturnType<
    typeof useNavigationBuilder<PlatformStackNavigationState<ParamList>, RouterOptions, StackActionHelpers<ParamList>, PlatformStackNavigationOptions, EventMap, NavigationOptions>
>;

type CustomCodeProps<
    NavigationOptions extends PlatformSpecificNavigationOptions,
    EventMap extends PlatformSpecificEventMap & EventMapBase,
    ParamList extends ParamListBase = ParamListBase,
> = {
    styles: ThemeStyles;
    windowDimensions: WindowDimensions;
    descriptors: PlatformStackNavigationDescriptors<NavigationOptions, EventMap, ParamList>;
};

type SearchRoute = PlatformStackNavigationState<ParamListBase>['routes'][number];
type TransformStateProps<
    NavigationOptions extends PlatformSpecificNavigationOptions,
    EventMap extends PlatformSpecificEventMap & EventMapBase,
    ParamList extends ParamListBase = ParamListBase,
> = CustomCodeProps<NavigationOptions, EventMap, ParamList> & {
    state: PlatformStackNavigationState<ParamListBase>;
};
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

type RenderExtraContentProps<
    NavigationOptions extends PlatformSpecificNavigationOptions,
    EventMap extends PlatformSpecificEventMap & EventMapBase,
    ParamList extends ParamListBase = ParamListBase,
> = CustomCodeProps<NavigationOptions, EventMap, ParamList> & TransformStateExtraResult;
type RenderExtraContent<
    NavigationOptions extends PlatformSpecificNavigationOptions,
    EventMap extends PlatformSpecificEventMap & EventMapBase,
    ParamList extends ParamListBase = ParamListBase,
> = (props: RenderExtraContentProps<NavigationOptions, EventMap, ParamList>) => React.ReactElement | null;

type CreatePlaformNavigatorOptions<
    NavigationOptions extends PlatformSpecificNavigationOptions,
    EventMap extends PlatformSpecificEventMap & EventMapBase,
    ParamList extends ParamListBase = ParamListBase,
    RouterOptions extends PlatformStackRouterOptions = PlatformStackRouterOptions,
> = {
    createRouter?: PlatformStackRouterFactory<ParamList, RouterOptions>;
    transformState?: TransformState<NavigationOptions, EventMap, ParamList>;
    renderExtraContent?: RenderExtraContent<NavigationOptions, EventMap, ParamList>;
};

export type {
    PlatformNavigationBuilderOptions,
    PlatformNavigationBuilderResult,
    PlatformStackNavigationDescriptor,
    TransformStateExtraResult,
    TransformStateProps,
    TransformState,
    RenderExtraContentProps,
    RenderExtraContent,
    CreatePlaformNavigatorOptions,
};
