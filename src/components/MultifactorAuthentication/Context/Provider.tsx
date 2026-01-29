import React from 'react';
import type {ReactNode} from 'react';
import MultifactorAuthenticationGuardsProvider from './Guards';
import {MultifactorAuthenticationContextProvider} from './Main';
import MultifactorAuthenticationStateProvider from './State';

type MultifactorAuthenticationProviderProps = {
    children: ReactNode;
};

function MultifactorAuthenticationContextProviders({children}: MultifactorAuthenticationProviderProps) {
    return (
        <MultifactorAuthenticationStateProvider>
            <MultifactorAuthenticationContextProvider>
                <MultifactorAuthenticationGuardsProvider>{children}</MultifactorAuthenticationGuardsProvider>
            </MultifactorAuthenticationContextProvider>
        </MultifactorAuthenticationStateProvider>
    );
}

MultifactorAuthenticationContextProviders.displayName = 'MultifactorAuthenticationContextProviders';

export default MultifactorAuthenticationContextProviders;
