import React, {ReactNode} from 'react';
import ComposeProviders from '@components/ComposeProviders';
import HTMLEngineProvider from '@components/HTMLEngineProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxProvider from '@components/OnyxProvider';
import ThemeIllustrationsProvider from '@components/ThemeIllustrationsProvider';
import ThemeProvider from '@components/ThemeProvider';
import ThemeStylesProvider from '@components/ThemeStylesProvider';

type EmailRootProps = {
    children: ReactNode;
};

/**
 * This component is the email/ssr analog of App.tsx.
 * It's the top-level component rendered by the server/cli to set up all the contexts we'll need.
 */
function EmailRoot({children}: EmailRootProps) {
    return (
        <ComposeProviders components={[OnyxProvider, ThemeProvider, ThemeStylesProvider, ThemeIllustrationsProvider, LocaleContextProvider, HTMLEngineProvider]}>{children}</ComposeProviders>
    );
}

EmailRoot.displayName = 'EmailPreview';

export default EmailRoot;
