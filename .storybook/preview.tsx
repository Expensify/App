import {PortalProvider} from '@gorhom/portal';
import React from 'react';
import Onyx from 'react-native-onyx';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import type {Parameters} from 'storybook/internal/types';
import {EnvironmentProvider} from '@components/EnvironmentContext';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import {SearchContextProvider} from '@components/Search/SearchContext';
import ComposeProviders from '@src/components/ComposeProviders';
import HTMLEngineProvider from '@src/components/HTMLEngineProvider';
import {LocaleContextProvider} from '@src/components/LocaleContextProvider';
import {KeyboardStateProvider} from '@src/components/withKeyboardState';
import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import './fonts.css';

Onyx.init({
    keys: ONYXKEYS,
    initialKeyStates: {
        [ONYXKEYS.NETWORK]: {isOffline: false},
    },
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
            <Story />
        </ComposeProviders>
    ),
];

const parameters: Parameters = {
    controls: {
        matchers: {
            color: /(background|color)$/i,
        },
    },
};

export {decorators, parameters};
