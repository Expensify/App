import React from 'react';
import Onyx from 'react-native-onyx';
import '../assets/css/fonts.css';
import ComposeProviders from '../src/components/ComposeProviders';
import OnyxProvider from '../src/components/OnyxProvider';
import {LocaleContextProvider} from '../src/components/withLocalize';
import HTMLEngineProvider from '../src/components/HTMLEngineProvider';
import ONYXKEYS from '../src/ONYXKEYS';

Onyx.init({
    keys: ONYXKEYS,
});

const decorators = [
    Story => (
        <ComposeProviders
            components={[
                OnyxProvider,
                LocaleContextProvider,
                HTMLEngineProvider,
            ]}
        >
            <Story />
        </ComposeProviders>
    ),
];

export {
    // eslint-disable-next-line import/prefer-default-export
    decorators,
};
