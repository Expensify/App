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

// How a screen is wrapped while it is covered by another screen of its navigator, to keep it off the critical path.
// With 'none' it is rendered as is and keeps updating.
// With 'freeze' it is suspended via react-freeze and processes no updates at all.
// With 'activity' it is wrapped in React <Activity>, which defers its updates to background priority and runs its
// effect cleanups while it is hidden.
type NonTopScreenBehavior = 'none' | 'freeze' | 'activity';

type GeneralPlatformStackNavigationOptions = {
    web?: WebOnlyNavigationOptions;
    native?: NativeOnlyNavigationOptions;

    keyboardHandlingEnabled?: boolean;
    animation?: (typeof Animations)[keyof typeof Animations];
    presentation?: (typeof Presentation)[keyof typeof Presentation];

    // Set it on a navigator (screenOptions) to pick the behavior for all of its screens, or on a single screen to
    // override that choice. The underlying stack does not consume it, it only travels along the platform specific
    // options so that the navigator can read it back from the screen's descriptor.
    nonTopScreenBehavior?: NonTopScreenBehavior;
};

// Combines common and general platform-specific options for PlatformStackNavigation.
type PlatformStackNavigationOptions = CommonStackNavigationOptions & GeneralPlatformStackNavigationOptions;

// Used to represent navigation options specific to the native implementation/platform (`stack` or `native-stack`).
type PlatformSpecificNavigationOptions = StackNavigationOptions | NativeStackNavigationOptions;

export type {CommonStackNavigationOptions, NonTopScreenBehavior, PlatformStackNavigationOptions, PlatformSpecificNavigationOptions};
