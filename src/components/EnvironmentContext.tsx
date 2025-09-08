import render from 'dom-serializer';
import {DomUtils, parseDocument} from 'htmlparser2';
import type {ReactElement, ReactNode} from 'react';
import React, {createContext, useCallback, useEffect, useMemo, useState} from 'react';
import type {ValueOf} from 'type-fest';
import {getEnvironment, getEnvironmentURL} from '@libs/Environment/Environment';
import CONST from '@src/CONST';

type EnvironmentProviderProps = {
    /** Actual content wrapped by this component */
    children: ReactNode;
};

type EnvironmentValue = ValueOf<typeof CONST.ENVIRONMENT>;

type EnvironmentContextValue = {
    /** The string value representing the current environment */
    environment: EnvironmentValue;

    /** The string value representing the URL of the current environment */
    environmentURL: string;

    /** Adjusts Expensify links in the given HTML content to point to the current environment URL */
    adjustExpensifyLinksForEnv: (html: string) => string;
};

const EnvironmentContext = createContext<EnvironmentContextValue>({
    environment: CONST.ENVIRONMENT.PRODUCTION,
    environmentURL: CONST.NEW_EXPENSIFY_URL,
    adjustExpensifyLinksForEnv: () => '',
});

function EnvironmentProvider({children}: EnvironmentProviderProps): ReactElement {
    const [environment, setEnvironment] = useState<EnvironmentValue>(CONST.ENVIRONMENT.PRODUCTION);
    const [environmentURL, setEnvironmentURL] = useState(CONST.NEW_EXPENSIFY_URL);
    const [environmentURLWithoutTrailingSlash] = useMemo(() => [environmentURL.replace(/\/+$/, '')], [environmentURL]);

    useEffect(() => {
        getEnvironment().then(setEnvironment);
        getEnvironmentURL().then(setEnvironmentURL);
    }, []);

    /**
     * Adjusts Expensify links in HTML content to use the current environment URL
     * instead of the production URL (new.expensify.com).
     */
    const adjustExpensifyLinksForEnv = useCallback(
        (html: string): string => {
            if (!environmentURLWithoutTrailingSlash || !html) {
                return html;
            }

            // Fast-path: if there are no production URLs, avoid any processing
            if (!html.includes('https://new.expensify.com')) {
                return html;
            }

            // Use a conservative regex replace on href attributes only, to avoid
            // re-parsing and re-serializing message HTML (which can be fragile with custom tags like <mention-user>).
            return html.replace(/href=(['"])https:\/\/new\.expensify\.com/gi, (_m, quote: string) => `href=${quote}${environmentURLWithoutTrailingSlash}`);
        },
        [environmentURLWithoutTrailingSlash],
    );

    const contextValue = useMemo(
        (): EnvironmentContextValue => ({
            environment,
            environmentURL,
            adjustExpensifyLinksForEnv,
        }),
        [environment, environmentURL, adjustExpensifyLinksForEnv],
    );

    return <EnvironmentContext.Provider value={contextValue}>{children}</EnvironmentContext.Provider>;
}

EnvironmentProvider.displayName = 'EnvironmentProvider';

export {EnvironmentContext, EnvironmentProvider};
export type {EnvironmentContextValue};
