/**
 * This component is the email preview analog of App.tsx.
 * It's the top-level component rendered in the server to compose providers, set defaults, hook up Onyx, etc...
 */
import React, {ReactNode} from 'react';
import ComposeProviders from '@components/ComposeProviders';
import HTMLEngineProvider from '@components/HTMLEngineProvider';
import {LocaleContextProvider} from '../../src/components/LocaleContextProvider';
import OnyxProvider from '../../src/components/OnyxProvider';
import ThemeIllustrationsProvider from '../../src/components/ThemeIllustrationsProvider';
import ThemeProvider from '../../src/components/ThemeProvider';
import ThemeStylesProvider from '../../src/components/ThemeStylesProvider';

type EmailWrapperProps = {
    children: ReactNode;
};

const EmailPreview = ({children}: EmailWrapperProps) => {
    return (
        <ComposeProviders components={[OnyxProvider, ThemeProvider, ThemeStylesProvider, ThemeIllustrationsProvider, LocaleContextProvider, HTMLEngineProvider]}>{children}</ComposeProviders>
    );
};

EmailPreview.displayName = 'EmailPreview';

export default EmailPreview;
