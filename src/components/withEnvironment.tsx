import type {ReactElement, ReactNode} from 'react';
import React, {createContext, useEffect, useMemo, useState} from 'react';
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
};

const EnvironmentContext = createContext<EnvironmentContextValue>({
    environment: CONST.ENVIRONMENT.PRODUCTION,
    environmentURL: CONST.NEW_EXPENSIFY_URL,
});

function EnvironmentProvider({children}: EnvironmentProviderProps): ReactElement {
    const [environment, setEnvironment] = useState<EnvironmentValue>(CONST.ENVIRONMENT.PRODUCTION);
    const [environmentURL, setEnvironmentURL] = useState(CONST.NEW_EXPENSIFY_URL);

    useEffect(() => {
        getEnvironment().then(setEnvironment);
        getEnvironmentURL().then(setEnvironmentURL);
    }, []);

    const contextValue = useMemo(
        (): EnvironmentContextValue => ({
            environment,
            environmentURL,
        }),
        [environment, environmentURL],
    );

    return <EnvironmentContext.Provider value={contextValue}>{children}</EnvironmentContext.Provider>;
}

EnvironmentProvider.displayName = 'EnvironmentProvider';

export {EnvironmentContext, EnvironmentProvider};
export type {EnvironmentContextValue};
