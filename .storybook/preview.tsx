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

import type {Parameters} from 'storybook/internal/types';

import {PortalProvider} from '@gorhom/portal';
import React from 'react';
import Onyx from 'react-native-onyx';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import currencyList from '../tests/unit/currencyList.json';
import './fonts.css';

registerMiddlewares();

Onyx.init({
    keys: ONYXKEYS,
    initialKeyStates: {[ONYXKEYS.CURRENCY_LIST]: currencyList},
});

IntlStore.load(CONST.LOCALES.EN);

const STORY_FRAME_INSET = '2rem';

const decorators = [
    (Story: React.ElementType) => (
        <ComposeProviders
            components={[
                OnyxListItemProvider,
                LocaleContextProvider,
                CurrencyListContextProvider,
                HTMLEngineProvider,
                SafeAreaProvider,
                PortalProvider,
                KeyboardProvider,
                ModalProvider,
                EnvironmentProvider,
                KeyboardStateProvider,
                SearchContextProvider,
            ]}
        >
            <ScreenWrapperStatusContext.Provider value={{didScreenTransitionEnd: true, isSafeAreaTopPaddingApplied: false, isSafeAreaBottomPaddingApplied: false}}>
                {/* Screens size to their window, so a story gets the viewport as its frame */}
                <div style={{display: 'flex', flexDirection: 'column', height: `calc(100vh - ${STORY_FRAME_INSET})`}}>
                    <Story />
                </div>
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
