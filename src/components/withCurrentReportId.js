import React, {createContext, forwardRef} from 'react';
import PropTypes from 'prop-types';

import getComponentDisplayName from '../libs/getComponentDisplayName';
import Navigation from '../libs/Navigation/Navigation';

const CurrentReportIdContext = createContext(null);

const withCurrentReportIdPropTypes = {
    /** Actual content wrapped by this component */
    children: PropTypes.node.isRequired,
};

class CurrentReportIdContextProvider extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            currentReportId: '',
        };
    }

    /**
     * The context this component exposes to child components
     * @returns {Object} currentReportId to share between central pane and LHN
     */
    getContextValue() {
        return {
            updateCurrentReportId: this.updateCurrentReportId.bind(this),
            currentReportId: this.state.currentReportId,
        };
    }

    /**
     * @param {Object} state
     * @returns {String}
     */
    updateCurrentReportId(state) {
        return this.setState({currentReportId: Navigation.getTopmostReportId(state)});
    }

    render() {
        return <CurrentReportIdContext.Provider value={this.getContextValue()}>{this.props.children}</CurrentReportIdContext.Provider>;
    }
}

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
