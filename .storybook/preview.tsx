import EnvironmentProvider from '@components/EnvironmentContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import ScreenWrapperStatusContext from '@components/ScreenWrapper/ScreenWrapperStatusContext';
import {SearchContextProvider} from '@components/Search/SearchContextProvider';

import colors from '@styles/theme/colors';

import ComposeProviders from '@src/components/ComposeProviders';
import HTMLEngineProvider from '@src/components/HTMLEngineProvider';
import {LocaleContextProvider} from '@src/components/LocaleContextProvider';
import {KeyboardStateProvider} from '@src/components/withKeyboardState';
import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';

import type {Parameters} from 'storybook/internal/types';

import {PortalProvider} from '@gorhom/portal';
import React from 'react';
import Onyx from 'react-native-onyx';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import './fonts.css';

Onyx.init({
    keys: ONYXKEYS,
});

IntlStore.load(CONST.LOCALES.EN);

const decorators = [
    (Story: React.ElementType) => (
        <ComposeProviders
            components={[
                OnyxListItemProvider,
                LocaleContextProvider,
                HTMLEngineProvider,
                SafeAreaProvider,
                PortalProvider,
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
