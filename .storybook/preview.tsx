import {CurrencyListContextProvider} from '@components/CurrencyListContextProvider';
import EnvironmentProvider from '@components/EnvironmentContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import ScreenWrapperStatusContext from '@components/ScreenWrapper/ScreenWrapperStatusContext';
import {SearchContextProvider} from '@components/Search/SearchContextProvider';

import registerMiddlewares from '@libs/Middleware/register';

import colors from '@styles/theme/colors';

import ComposeProviders from '@src/components/ComposeProviders';
import HTMLEngineProvider from '@src/components/HTMLEngineProvider';
import KeyboardProvider from '@src/components/KeyboardProvider';
import {LocaleContextProvider} from '@src/components/LocaleContextProvider';
import {ModalProvider} from '@src/components/Modal/Global/ModalContext';
import {KeyboardStateProvider} from '@src/components/withKeyboardState';
import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import {clearDeviceMode, getDeviceMode, subscribeToDeviceMode} from '@src/stories/mocks/deviceMode';

import type {ReactNode} from 'react';
import type {Parameters, StoryContext} from 'storybook/internal/types';

import {PortalProvider} from '@gorhom/portal';
import React, {useEffect, useSyncExternalStore} from 'react';
import Onyx from 'react-native-onyx';
// The insets context is provided directly to override the measured insets for every story, see ZeroSafeAreaInsetsProvider
// eslint-disable-next-line no-restricted-imports
import {SafeAreaInsetsContext, SafeAreaProvider} from 'react-native-safe-area-context';

import currencyList from '../tests/unit/currencyList.json';
import './fonts.css';

registerMiddlewares();

Onyx.init({
    keys: ONYXKEYS,
    initialKeyStates: {[ONYXKEYS.CURRENCY_LIST]: currencyList},
});

IntlStore.load(CONST.LOCALES.EN);

const ZERO_SAFE_AREA_INSETS = {top: 0, right: 0, bottom: 0, left: 0};

/**
 * Story previews run in a desktop browser with no device safe areas. The web SafeAreaProvider reports the part of a story
 * taller than the viewport as a bottom inset (e.g. after zooming in), which screens with `addBottomSafeAreaPadding` would add
 * as empty space below their content, so the insets are pinned to zero.
 */
function ZeroSafeAreaInsetsProvider({children}: {children: ReactNode}) {
    return <SafeAreaInsetsContext.Provider value={ZERO_SAFE_AREA_INSETS}>{children}</SafeAreaInsetsContext.Provider>;
}

/**
 * The device mode mocks (src/stories/mocks/deviceMode.ts) apply to the whole preview bundle, so a mode a story picked would leak
 * into every story rendered after it. Stories that use the device mode set the `usesDeviceMode` parameter, and any other story
 * clears a leftover mode first. Touch support is read once per module, so a leftover touch mode also reloads the preview.
 */
function DeviceModeScope({usesDeviceMode, children}: {usesDeviceMode: boolean; children: ReactNode}) {
    const storedDeviceMode = useSyncExternalStore(subscribeToDeviceMode, getDeviceMode);
    const hasLeftoverDeviceMode = !usesDeviceMode && storedDeviceMode !== undefined;

    useEffect(() => {
        if (!hasLeftoverDeviceMode || !clearDeviceMode()) {
            return;
        }
        window.location.reload();
    }, [hasLeftoverDeviceMode]);

    // Rendering a story under the leftover mode would flash its touch layout before the clean-up lands
    return hasLeftoverDeviceMode ? null : children;
}

const decorators = [
    (Story: React.ElementType, context: StoryContext) => (
        <DeviceModeScope usesDeviceMode={!!context.parameters.usesDeviceMode}>
            <Story />
        </DeviceModeScope>
    ),
    (Story: React.ElementType) => (
        <ComposeProviders
            components={[
                OnyxListItemProvider,
                LocaleContextProvider,
                CurrencyListContextProvider,
                HTMLEngineProvider,
                SafeAreaProvider,
                ZeroSafeAreaInsetsProvider,
                PortalProvider,
                KeyboardProvider,
                ModalProvider,
                EnvironmentProvider,
                KeyboardStateProvider,
                SearchContextProvider,
            ]}
        >
            <ScreenWrapperStatusContext.Provider value={{didScreenTransitionEnd: true, isSafeAreaTopPaddingApplied: false, isSafeAreaBottomPaddingApplied: false}}>
                <Story />
            </ScreenWrapperStatusContext.Provider>
        </ComposeProviders>
    ),
];

const parameters: Parameters = {
    controls: {
        matchers: {
            color: /(background|color)$/i,
        },
    },
    backgrounds: {
        options: {
            dark: {name: 'Dark', value: colors.productDark100},
            light: {name: 'Light', value: colors.productLight100},
        },
    },
};

const initialGlobals = {
    backgrounds: {value: 'dark'},
};

export {decorators, parameters, initialGlobals};
