import React from 'react';
import type {ReactNode} from 'react';
import {MultifactorAuthenticationContextProvider} from './Main';
import MultifactorAuthenticationStateProvider from './State';

type MultifactorAuthenticationProviderProps = {
    children: ReactNode;
};

function MultifactorAuthenticationContextProviders({children}: MultifactorAuthenticationProviderProps) {
    return (
        <MultifactorAuthenticationStateProvider>
            <MultifactorAuthenticationContextProvider>{children}</MultifactorAuthenticationContextProvider>
        </MultifactorAuthenticationStateProvider>
    );
}

MultifactorAuthenticationContextProviders.displayName = 'MultifactorAuthenticationContextProviders';

export default MultifactorAuthenticationContextProviders;
