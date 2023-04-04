import React, {createContext, forwardRef} from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';

import getComponentDisplayName from '../libs/getComponentDisplayName';
import ONYXKEYS from '../ONYXKEYS';
import Navigation from '../libs/Navigation/Navigation';

import compose from '../libs/compose';
import withCurrentUserPersonalDetails from './withCurrentUserPersonalDetails';

const CurrentReportIdContext = createContext(null);

const withCurrentReportIdPropTypes = {
    /** Actual content wrapped by this component */
    children: PropTypes.node.isRequired,
};

const currentReportIdDefaultProps = {};

class CurrentReportIdContextProvider extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            currentReportId: '',
        };
    }

    /**
     * The context this component exposes to child components
     * @returns {object} translation util functions and locale
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
        return (
            <CurrentReportIdContext.Provider value={this.getContextValue()}>
                {this.props.children}
            </CurrentReportIdContext.Provider>
        );
    }
}

CurrentReportIdContextProvider.propTypes = withCurrentReportIdPropTypes;
CurrentReportIdContextProvider.defaultProps = currentReportIdDefaultProps;

const Provider = compose(
    withCurrentUserPersonalDetails,
    withOnyx({
        preferredLocale: {
            key: ONYXKEYS.NVP_PREFERRED_LOCALE,
        },
    }),
)(CurrentReportIdContextProvider);

Provider.displayName = 'withOnyx(CurrentReportIdContextProvider)';

export default function withCurrentReportId(WrappedComponent) {
    const WithCurrentReportId = forwardRef((props, ref) => (
        <CurrentReportIdContext.Consumer>
            {/* eslint-disable-next-line react/jsx-props-no-spreading */}
            {translateUtils => <WrappedComponent {...translateUtils} {...props} ref={ref} />}
        </CurrentReportIdContext.Consumer>
    ));

    WithCurrentReportId.displayName = `withCurrentReportId(${getComponentDisplayName(WrappedComponent)})`;

    return WithCurrentReportId;
}

export {
    withCurrentReportIdPropTypes,
    Provider as CurrentReportIdContextProvider,
};
