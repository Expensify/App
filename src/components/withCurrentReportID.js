import React, {createContext, forwardRef, useCallback, useState, useMemo} from 'react';
import PropTypes from 'prop-types';

import getComponentDisplayName from '../libs/getComponentDisplayName';
import Navigation from '../libs/Navigation/Navigation';

const CurrentReportIDContext = createContext(null);

const withCurrentReportIDPropTypes = {
    /** Function to update the state */
    updateCurrentReportID: PropTypes.func.isRequired,

    /** The top most report id */
    currentReportID: PropTypes.string,
};

const withCurrentReportIDDefaultProps = {
    currentReportID: '',
};

function CurrentReportIDContextProvider(props) {
    const [currentReportID, setCurrentReportID] = useState('');

    /**
     * This function is used to update the currentReportID
     * @param {Object} state root navigation state
     */
    const updateCurrentReportID = useCallback(
        (state) => {
            setCurrentReportID(Navigation.getTopmostReportId(state));
        },
        [setCurrentReportID],
    );

    /**
     * The context this component exposes to child components
     * @returns {Object} currentReportID to share between central pane and LHN
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

export default function withCurrentReportID(WrappedComponent) {
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

    WithCurrentReportID.displayName = `withCurrentReportID(${getComponentDisplayName(WrappedComponent)})`;

    return WithCurrentReportID;
}

export {withCurrentReportIDPropTypes, withCurrentReportIDDefaultProps, CurrentReportIDContextProvider};
