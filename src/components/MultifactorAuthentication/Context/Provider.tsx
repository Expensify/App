import React from 'react';
import type {ReactNode} from 'react';
import ComposeProviders from '@components/ComposeProviders';
import {MultifactorAuthenticationContextProvider} from './Main';
import MultifactorAuthenticationStateProvider from './State';

type MultifactorAuthenticationProviderProps = {
    children: ReactNode;
};

function MultifactorAuthenticationContextProviders({children}: MultifactorAuthenticationProviderProps) {
    return <ComposeProviders components={[MultifactorAuthenticationStateProvider, MultifactorAuthenticationContextProvider]}>{children}</ComposeProviders>;
}

MultifactorAuthenticationContextProviders.displayName = 'MultifactorAuthenticationContextProviders';

export default MultifactorAuthenticationContextProviders;
