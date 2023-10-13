import React, {createContext, forwardRef, useCallback, useState, useMemo, RefAttributes, ComponentType} from 'react';
import PropTypes from 'prop-types';
import {NavigationState} from '@react-navigation/native';

import getComponentDisplayName from '../libs/getComponentDisplayName';
import Navigation from '../libs/Navigation/Navigation';

type CurrentReportIDContextValue = {
    updateCurrentReportID: (state: NavigationState) => void;
    currentReportID: string;
};
type CurrentReportIDContextProviderProps = {
    children: React.ReactNode;
};

const CurrentReportIDContext = createContext<CurrentReportIDContextValue | null>(null);

// TODO: Remove when depended components are migrated to TypeScript.
const withCurrentReportIDPropTypes = {
    /** Function to update the state */
    updateCurrentReportID: PropTypes.func.isRequired,

    /** The top most report id */
    currentReportID: PropTypes.string,
};

const withCurrentReportIDDefaultProps = {
    currentReportID: '',
};

function CurrentReportIDContextProvider(props: CurrentReportIDContextProviderProps) {
    const [currentReportID, setCurrentReportID] = useState('');

    /**
     * This function is used to update the currentReportID
     * @param state root navigation state
     */
    const updateCurrentReportID = useCallback(
        (state: NavigationState) => {
            setCurrentReportID(Navigation.getTopmostReportId(state) ?? '');
        },
        [setCurrentReportID],
    );

    /**
     * The context this component exposes to child components
     * @returns  currentReportID to share between central pane and LHN
     */
    const contextValue = useMemo(
        (): CurrentReportIDContextValue => ({
            updateCurrentReportID,
            currentReportID,
        }),
        [updateCurrentReportID, currentReportID],
    );

    return <CurrentReportIDContext.Provider value={contextValue}>{props.children}</CurrentReportIDContext.Provider>;
}

CurrentReportIDContextProvider.displayName = 'CurrentReportIDContextProvider';

export default function withCurrentReportID<TComponentProps extends CurrentReportIDContextValue>(WrappedComponent: ComponentType<TComponentProps>) {
    const WithCurrentReportID: ComponentType<Omit<TComponentProps, keyof CurrentReportIDContextValue> & RefAttributes<ComponentType<TComponentProps>>> = forwardRef((props, ref) => (
        <CurrentReportIDContext.Consumer>
            {(currentReportIDUtils) => (
                <WrappedComponent
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...currentReportIDUtils}
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...(props as TComponentProps)}
                    ref={ref}
                />
            )}
        </CurrentReportIDContext.Consumer>
    ));

    WithCurrentReportID.displayName = `withCurrentReportID(${getComponentDisplayName(WrappedComponent)})`;

    return WithCurrentReportID;
}

export {withCurrentReportIDPropTypes, withCurrentReportIDDefaultProps, CurrentReportIDContextProvider, CurrentReportIDContext};
export type {CurrentReportIDContextValue};
