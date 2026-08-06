import type Animations from '@libs/Navigation/PlatformStackNavigation/navigationOptions/animation';
import type Presentation from '@libs/Navigation/PlatformStackNavigation/navigationOptions/presentation';

import type CommonProperties from '@src/types/utils/CommonProperties';

import type {NativeStackNavigationOptions} from '@react-navigation/native-stack';
import type {StackNavigationOptions} from '@react-navigation/stack';

// Navigation properties that are only available in web or native stack navigations.
type WebOnlyNavigationOptions = StackNavigationOptions;
type NativeOnlyNavigationOptions = NativeStackNavigationOptions;

// Common navigation options merged from both stack and native-stack navigations.
type CommonStackNavigationOptions = CommonProperties<StackNavigationOptions, NativeStackNavigationOptions>;

// Determines how a screen is wrapped while it is not the top screen of its navigator, to avoid re-render work
// while it is covered.
// With 'none' the screen is rendered as is and keeps updating while it is covered.
// With 'freeze' the screen is suspended via react-freeze and processes no updates at all.
// With 'activity' the screen is wrapped in React <Activity>, which defers updates to background priority
// and runs effect cleanups while the screen is hidden.
type NonTopScreenBehavior = 'none' | 'freeze' | 'activity';

type GeneralPlatformStackNavigationOptions = {
    web?: WebOnlyNavigationOptions;
    native?: NativeOnlyNavigationOptions;

    keyboardHandlingEnabled?: boolean;
    animation?: (typeof Animations)[keyof typeof Animations];
    presentation?: (typeof Presentation)[keyof typeof Presentation];

    // Set it on a navigator (screenOptions) to pick the behavior for all of its screens, or on a single screen to
    // override that choice. It is not consumed by the underlying stack, it travels along the platform specific
    // options only so that the navigator can read it back from the screen's descriptor.
    nonTopScreenBehavior?: NonTopScreenBehavior;
};

// Combines common and general platform-specific options for PlatformStackNavigation.
type PlatformStackNavigationOptions = CommonStackNavigationOptions & GeneralPlatformStackNavigationOptions;

// Used to represent navigation options specific to the native implementation/platform (`stack` or `native-stack`).
type PlatformSpecificNavigationOptions = StackNavigationOptions | NativeStackNavigationOptions;

export type {CommonStackNavigationOptions, NonTopScreenBehavior, PlatformStackNavigationOptions, PlatformSpecificNavigationOptions};
