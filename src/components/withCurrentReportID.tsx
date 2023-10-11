import React, {createContext, forwardRef, useCallback, useState, useMemo} from 'react';
import PropTypes from 'prop-types';
import {NavigationState} from '@react-navigation/native';

import getComponentDisplayName from '../libs/getComponentDisplayName';
import Navigation from '../libs/Navigation/Navigation';

type CurrentReportIDContextType = {
    updateCurrentReportID: (state: NavigationState) => void;
    currentReportID: string;
};
type CurrentReportIDContextProviderProps = {
    children: React.ReactNode;
};
const CurrentReportIDContext = createContext<CurrentReportIDContextType | null>(null);

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
        () => ({
            updateCurrentReportID,
            currentReportID,
        }),
        [updateCurrentReportID, currentReportID],
    );

    return <CurrentReportIDContext.Provider value={contextValue}>{props.children}</CurrentReportIDContext.Provider>;
}

CurrentReportIDContextProvider.displayName = 'CurrentReportIDContextProvider';
CurrentReportIDContextProvider.propTypes = {
    /** Actual content wrapped by this component */
    children: PropTypes.node.isRequired,
};

// eslint-disable-next-line @typescript-eslint/naming-convention
export default function withCurrentReportID(WrappedComponent: React.ComponentType) {
    const WithCurrentReportID = forwardRef((props, ref) => (
        <CurrentReportIDContext.Consumer>
            {(currentReportIDUtils) => (
                <WrappedComponent
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...currentReportIDUtils}
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...props}
                    ref={ref}
                />
            )}
        </CurrentReportIDContext.Consumer>
    ));

    (WithCurrentReportID as React.FC).displayName = `withCurrentReportID(${getComponentDisplayName(WrappedComponent)})`;

    return WithCurrentReportID;
}

export {withCurrentReportIDPropTypes, withCurrentReportIDDefaultProps, CurrentReportIDContextProvider, CurrentReportIDContext};
