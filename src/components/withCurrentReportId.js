import React, {createContext, forwardRef} from 'react';
import PropTypes from 'prop-types';

import getComponentDisplayName from '../libs/getComponentDisplayName';
import Navigation from '../libs/Navigation/Navigation';

const CurrentReportIDContext = createContext(null);

const withCurrentReportIDPropTypes = {
    /** Actual content wrapped by this component */
    children: PropTypes.node.isRequired,
};

class CurrentReportIDContextProvider extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            currentReportID: '',
        };
    }

    /**
     * The context this component exposes to child components
     * @returns {Object} currentReportID to share between central pane and LHN
     */
    getContextValue() {
        return {
            updateCurrentReportID: this.updateCurrentReportID.bind(this),
            currentReportID: this.state.currentReportID,
        };
    }

    /**
     * @param {Object} state
     * @returns {String}
     */
    updateCurrentReportID(state) {
        return this.setState({currentReportID: Navigation.getTopmostReportId(state)});
    }

    render() {
        return <CurrentReportIDContext.Provider value={this.getContextValue()}>{this.props.children}</CurrentReportIDContext.Provider>;
    }
}

CurrentReportIDContextProvider.propTypes = withCurrentReportIDPropTypes;

export default function withCurrentReportID(WrappedComponent) {
    const WithCurrentReportID = forwardRef((props, ref) => (
        <CurrentReportIDContext.Consumer>
            {(translateUtils) => (
                <WrappedComponent
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...translateUtils}
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

export {withCurrentReportIDPropTypes, CurrentReportIDContextProvider};
