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

// How a screen behaves while another screen of its navigator covers it. With 'freeze' it is suspended via
// react-freeze, with 'activity' it is wrapped in React <Activity> and keeps updating at background priority, and
// with 'none' it renders as is.
type NonTopScreenBehavior = 'none' | 'freeze' | 'activity';

type GeneralPlatformStackNavigationOptions = {
    web?: WebOnlyNavigationOptions;
    native?: NativeOnlyNavigationOptions;

    keyboardHandlingEnabled?: boolean;
    animation?: (typeof Animations)[keyof typeof Animations];
    presentation?: (typeof Presentation)[keyof typeof Presentation];

    // Set it on a navigator (screenOptions) or on a single screen. The underlying stack ignores it, and the
    // navigator reads it back from the screen's descriptor.
    nonTopScreenBehavior?: NonTopScreenBehavior;
};

// Combines common and general platform-specific options for PlatformStackNavigation.
type PlatformStackNavigationOptions = CommonStackNavigationOptions & GeneralPlatformStackNavigationOptions;

// Used to represent navigation options specific to the native implementation/platform (`stack` or `native-stack`).
type PlatformSpecificNavigationOptions = StackNavigationOptions | NativeStackNavigationOptions;

export type {CommonStackNavigationOptions, NonTopScreenBehavior, PlatformStackNavigationOptions, PlatformSpecificNavigationOptions};
