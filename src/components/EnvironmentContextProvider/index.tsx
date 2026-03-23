import {DomUtils, parseDocument} from 'htmlparser2';
import type {ReactElement, ReactNode} from 'react';
import React, {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import {getEnvironmentURL} from '@libs/Environment/Environment';
import getEnvironment from '@libs/Environment/getEnvironment';
import {defaultEnvironmentActionsContextValue, defaultEnvironmentStateContextValue} from './default';
import type {EnvironmentActionsContextType, EnvironmentStateContextType, EnvironmentValue} from './types';

type EnvironmentProviderProps = {
    /** Actual content wrapped by this component */
    children: ReactNode;
};

const EnvironmentStateContext = createContext<EnvironmentStateContextType>(defaultEnvironmentStateContextValue);
const EnvironmentActionsContext = createContext<EnvironmentActionsContextType>(defaultEnvironmentActionsContextValue);

function EnvironmentProvider({children}: EnvironmentProviderProps): ReactElement {
    const [environment, setEnvironment] = useState<EnvironmentValue>(defaultEnvironmentStateContextValue.environment);
    const [environmentURL, setEnvironmentURL] = useState(defaultEnvironmentStateContextValue.environmentURL);
    const environmentURLWithoutTrailingSlash = useMemo(() => environmentURL.replaceAll(/\/+$/g, ''), [environmentURL]);

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

    const stateValue = useMemo(
        () => ({
            environment,
            environmentURL,
        }),
        [environment, environmentURL],
    );

    const actionsValue = useMemo(
        () => ({
            adjustExpensifyLinksForEnv,
        }),
        [adjustExpensifyLinksForEnv],
    );

    return (
        <EnvironmentStateContext.Provider value={stateValue}>
            <EnvironmentActionsContext.Provider value={actionsValue}>{children}</EnvironmentActionsContext.Provider>
        </EnvironmentStateContext.Provider>
    );
}

function useEnvironmentState() {
    return useContext(EnvironmentStateContext);
}

function useEnvironmentActions() {
    return useContext(EnvironmentActionsContext);
}

export default EnvironmentProvider;
export {EnvironmentStateContext, EnvironmentActionsContext, useEnvironmentState, useEnvironmentActions};
export type {EnvironmentStateContextType, EnvironmentActionsContextType};
