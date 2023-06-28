import React, {createContext, forwardRef, useCallback, useState, useMemo} from 'react';
import PropTypes from 'prop-types';

import getComponentDisplayName from '../libs/getComponentDisplayName';
import Navigation from '../libs/Navigation/Navigation';

const CurrentReportIdContext = createContext(null);

const withCurrentReportIdPropTypes = {
    /** Function to update the state */
    updateCurrentReportId: PropTypes.func.isRequired,

    /** The top most report id */
    currentReportId: PropTypes.string,
};

function CurrentReportIdContextProvider(props) {
    const [currentReportId, setCurrentReportId] = useState('');

    /**
     * This function is used to update the currentReportId
     * @param {Object} state root navigation state
     */
    const updateCurrentReportId = useCallback(
        (state) => {
            setCurrentReportId(Navigation.getTopmostReportId(state));
        },
        [setCurrentReportId],
    );

    /**
     * The context this component exposes to child components
     * @returns {Object} currentReportId to share between central pane and LHN
     */
    const contextValue = useMemo(
        () => ({
            updateCurrentReportId,
            currentReportId,
        }),
        [updateCurrentReportId, currentReportId],
    );

    return <CurrentReportIdContext.Provider value={contextValue}>{props.children}</CurrentReportIdContext.Provider>;
}

CurrentReportIdContextProvider.displayName = 'CurrentReportIdContextProvider';
CurrentReportIdContextProvider.propTypes = {
    /** Actual content wrapped by this component */
    children: PropTypes.node.isRequired,
};

export default function withCurrentReportId(WrappedComponent) {
    const WithCurrentReportId = forwardRef((props, ref) => (
        <CurrentReportIdContext.Consumer>
            {(currentReportIdUtils) => (
                <WrappedComponent
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...currentReportIdUtils}
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...props}
                    ref={ref}
                />
            )}
        </CurrentReportIdContext.Consumer>
    ));

    WithCurrentReportId.displayName = `withCurrentReportId(${getComponentDisplayName(WrappedComponent)})`;

    return WithCurrentReportId;
}

export {withCurrentReportIdPropTypes, CurrentReportIdContextProvider};
