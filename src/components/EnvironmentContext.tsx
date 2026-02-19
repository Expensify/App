import {DomUtils, parseDocument} from 'htmlparser2';
import type {ReactElement, ReactNode} from 'react';
import React, {createContext, useCallback, useEffect, useMemo, useState} from 'react';
import type {ValueOf} from 'type-fest';
import {getEnvironmentURL} from '@libs/Environment/Environment';
import getEnvironment from '@libs/Environment/getEnvironment';
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
    const [environmentURLWithoutTrailingSlash] = useMemo(() => [environmentURL.replaceAll(/\/+$/g, '')], [environmentURL]);

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

            try {
                const dom = parseDocument(html);
                const anchorTags = DomUtils.findAll((el) => el.name?.toLowerCase() === 'a', dom);

                let adjustedHtml = html;

                for (const anchorTag of anchorTags) {
                    const href = anchorTag.attribs?.href;
                    if (href?.startsWith('https://new.expensify.com')) {
                        const newHref = href.replace('https://new.expensify.com', environmentURLWithoutTrailingSlash);

                        const oldSnippet = `href="${href}"`;
                        const newSnippet = `href="${newHref}"`;

                        adjustedHtml = adjustedHtml.replace(oldSnippet, newSnippet);
                    }
                }

                return adjustedHtml;
            } catch {
                return html;
            }
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

export {EnvironmentContext, EnvironmentProvider};
export type {EnvironmentContextValue};
