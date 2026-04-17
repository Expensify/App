import {PortalProvider} from '@gorhom/portal';
import {NavigationContext} from '@react-navigation/core';
import type {NavigationProp, ParamListBase} from '@react-navigation/native';
import React, {useMemo} from 'react';
import Onyx from 'react-native-onyx';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import type {Parameters} from 'storybook/internal/types';
import EnvironmentProvider from '@components/EnvironmentContextProvider';
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
});

IntlStore.load(CONST.LOCALES.EN);

function NavigationContextProvider({children}: {children: React.ReactNode}) {
    const value = useMemo(
        () =>
            ({
                isFocused: () => true,
                addListener: () => () => {},
                removeListener: () => {},
                navigate: () => {},
                getState: () => ({routes: []}),
                dispatch: () => {},
                setParams: () => {},
                goBack: () => {},
                reset: () => {},
                canGoBack: () => false,
                getParent: () => undefined,
                getId: () => undefined,
            }) as unknown as NavigationProp<ParamListBase>,
        [],
    );

    return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
}

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
                NavigationContextProvider,
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
