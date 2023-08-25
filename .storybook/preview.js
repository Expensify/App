import React from 'react';
import Onyx from 'react-native-onyx';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {PortalProvider} from '@gorhom/portal';
import './fonts.css';
import ComposeProviders from '../src/components/ComposeProviders';
import HTMLEngineProvider from '../src/components/HTMLEngineProvider';
import OnyxProvider from '../src/components/OnyxProvider';
import {LocaleContextProvider} from '../src/components/withLocalize';
import ONYXKEYS from '../src/ONYXKEYS';

Onyx.init({
    keys: ONYXKEYS,
});

const decorators = [
    (Story) => (
        <ComposeProviders components={[OnyxProvider, LocaleContextProvider, HTMLEngineProvider, SafeAreaProvider, PortalProvider]}>
            <Story />
        </ComposeProviders>
    ),
];

const parameters = {
    controls: {
        matchers: {
            color: /(background|color)$/i,
        },
    },
};

export {decorators, parameters};
