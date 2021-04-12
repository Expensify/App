import _ from 'underscore';
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {getPathFromState, NavigationContainer} from '@react-navigation/native';
import {navigationRef} from './Navigation';
import linkingConfig from './linkingConfig';
import AppNavigator from './AppNavigator';
import ROUTES from '../../ROUTES';
import {updateCurrentlyViewedReportID} from '../actions/Report';
import {setCurrentURL} from '../actions/App';
import FullScreenLoadingIndicator from '../../components/FullscreenLoadingIndicator';

const propTypes = {
    // Whether the current user is logged in with an authToken
    authenticated: PropTypes.bool.isRequired,
};

class NavigationRoot extends Component {
    constructor(props) {
        super(props);

        this.handleStateChange = this.handleStateChange.bind(this);
    }

    /**
     * Intercept state changes and perform different logic
     * @param {NavigationState} state
     */
    handleStateChange(state) {
        if (!state) {
            return;
        }

        const path = getPathFromState(state, linkingConfig.config);
        if (path.includes(ROUTES.REPORT)) {
            const reportID = Number(_.last(path.split('/')));
            if (reportID && !_.isNaN(reportID)) {
                updateCurrentlyViewedReportID(reportID);
            }
        }

        setCurrentURL(path);
    }

    render() {
        return (
            <NavigationContainer
                fallback={<FullScreenLoadingIndicator visible />}
                onStateChange={this.handleStateChange}
                ref={navigationRef}
                linking={linkingConfig}
                documentTitle={{
                    formatter: () => 'Expensify.cash',
                }}
            >
                <AppNavigator authenticated={this.props.authenticated} />
            </NavigationContainer>
        );
    }
}

NavigationRoot.propTypes = propTypes;
export default NavigationRoot;
