import {PortalProvider} from '@gorhom/portal';
import React from 'react';
import Onyx from 'react-native-onyx';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import type {Parameters} from 'storybook/internal/types';
import ComposeProviders from '@src/components/ComposeProviders';
import HTMLEngineProvider from '@src/components/HTMLEngineProvider';
import {LocaleContextProvider} from '@src/components/LocaleContextProvider';
import OnyxProvider from '@src/components/OnyxProvider';
import {EnvironmentProvider} from '@src/components/withEnvironment';
import {KeyboardStateProvider} from '@src/components/withKeyboardState';
import ONYXKEYS from '@src/ONYXKEYS';
import './fonts.css';

Onyx.init({
    keys: ONYXKEYS,
    initialKeyStates: {
        [ONYXKEYS.NETWORK]: {isOffline: false},
    },
});

const decorators = [
    (Story: React.ElementType) => (
        <ComposeProviders components={[OnyxProvider, LocaleContextProvider, HTMLEngineProvider, SafeAreaProvider, PortalProvider, EnvironmentProvider, KeyboardStateProvider]}>
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
