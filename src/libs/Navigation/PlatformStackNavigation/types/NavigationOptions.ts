import type {NativeStackNavigationOptions} from '@react-navigation/native-stack';
import type {StackNavigationOptions} from '@react-navigation/stack';
import type Animations from '@libs/Navigation/PlatformStackNavigation/navigationOptions/animation';
import type Presentation from '@libs/Navigation/PlatformStackNavigation/navigationOptions/presentation';
import type CommonProperties from '@src/types/utils/CommonProperties';

// Navigation properties that are only available in web or native stack navigations.
type WebOnlyNavigationOptions = StackNavigationOptions;
type NativeOnlyNavigationOptions = NativeStackNavigationOptions;

// Common navigation options merged from both stack and native-stack navigations.
type CommonStackNavigationOptions = CommonProperties<StackNavigationOptions, NativeStackNavigationOptions>;

type GeneralPlatformStackNavigationOptions = {
    web?: WebOnlyNavigationOptions;
    native?: NativeOnlyNavigationOptions;

    keyboardHandlingEnabled?: boolean;
    animation?: (typeof Animations)[keyof typeof Animations];
    presentation?: (typeof Presentation)[keyof typeof Presentation];
};

// Combines common and general platform-specific options for PlatformStackNavigation.
type PlatformStackNavigationOptions = CommonStackNavigationOptions & GeneralPlatformStackNavigationOptions;

// Used to represent navigation options specific to the native implementation/platform (`stack` or `native-stack`).
type PlatformSpecificNavigationOptions = StackNavigationOptions | NativeStackNavigationOptions;

export type {
    WebOnlyNavigationOptions,
    NativeOnlyNavigationOptions,
    CommonStackNavigationOptions,
    GeneralPlatformStackNavigationOptions,
    PlatformStackNavigationOptions,
    PlatformSpecificNavigationOptions,
};
