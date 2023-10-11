import React, {ComponentType, RefAttributes, ReactNode, createContext, useState, useEffect, forwardRef, useContext, useMemo} from 'react';
import {ValueOf} from 'type-fest';
import * as Environment from '../libs/Environment/Environment';
import CONST from '../CONST';
import getComponentDisplayName from '../libs/getComponentDisplayName';

type EnvironmentProviderProps = {
    /** Actual content wrapped by this component */
    children: ReactNode;
};

type EnvironmentContextValue = {
    /** The string value representing the current environment */
    environment: ValueOf<typeof CONST.ENVIRONMENT>;

    /** The string value representing the URL of the current environment */
    environmentURL: string;
};

const EnvironmentContext = createContext<EnvironmentContextValue | null>(null);

function EnvironmentProvider({children}: EnvironmentProviderProps) {
    const [environment, setEnvironment] = useState<ValueOf<typeof CONST.ENVIRONMENT>>(CONST.ENVIRONMENT.PRODUCTION);
    const [environmentURL, setEnvironmentURL] = useState(CONST.NEW_EXPENSIFY_URL);

    useEffect(() => {
        Environment.getEnvironment().then(setEnvironment);
        Environment.getEnvironmentURL().then(setEnvironmentURL);
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

// eslint-disable-next-line @typescript-eslint/naming-convention
export default function withEnvironment<TComponentProps extends EnvironmentContextValue>(WrappedComponent: ComponentType<TComponentProps>) {
    const WithEnvironment: ComponentType<TComponentProps & RefAttributes<ComponentType<TComponentProps>>> = forwardRef((props, ref) => {
        const {environment, environmentURL} = useContext(EnvironmentContext) ?? {};
        return (
            <WrappedComponent
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
                ref={ref}
                environment={environment}
                environmentURL={environmentURL}
            />
        );
    });

    WithEnvironment.displayName = `withEnvironment(${getComponentDisplayName(WrappedComponent as ComponentType)})`;

    return WithEnvironment;
}

export {EnvironmentContext, EnvironmentProvider};
export type {EnvironmentContextValue};
