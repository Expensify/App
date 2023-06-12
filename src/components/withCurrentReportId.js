import React, {createContext, forwardRef, useState} from 'react';
import PropTypes from 'prop-types';

import getComponentDisplayName from '../libs/getComponentDisplayName';
import Navigation from '../libs/Navigation/Navigation';

const CurrentReportIdContext = createContext(null);

const withCurrentReportIdPropTypes = {
    /** Actual content wrapped by this component */
    children: PropTypes.node.isRequired,
};

function CurrentReportIdContextProvider ({children}) {
    const [currentReportId, setCurrentReportId] = useState('');

    const updateCurrentReportId = (state) => {
        setCurrentReportId(Navigation.getTopmostReportId(state));
    };

    const getContextValue = () => ({
            updateCurrentReportId,
            currentReportId,
        });

    return <CurrentReportIdContext.Provider value={getContextValue()}>{children}</CurrentReportIdContext.Provider>;
};

CurrentReportIdContextProvider.propTypes = withCurrentReportIdPropTypes;

export default function withCurrentReportId(WrappedComponent) {
    const WithCurrentReportId = forwardRef((props, ref) => (
        <CurrentReportIdContext.Consumer>
            {(translateUtils) => (
                <WrappedComponent
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...translateUtils}
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
