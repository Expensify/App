import React from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import styles from '../../styles/styles';
import ReportView from './report/ReportView';
import ScreenWrapper from '../../components/ScreenWrapper';
import HeaderView from './HeaderView';
import FullScreenLoadingIndicator from '../../components/FullscreenLoadingIndicator';

const propTypes = {
    /* Navigation api provided by react navigation */
    navigation: PropTypes.shape({
        /* Display the drawer programmatically */
        openDrawer: PropTypes.func.isRequired,
    }).isRequired,

    /* Navigation route context info provided by react navigation */
    route: PropTypes.shape({
        /* Route specific parameters used on this screen */
        params: PropTypes.shape({
            /* The ID of the report this screen should display */
            reportID: PropTypes.string,
        }).isRequired,
    }).isRequired,
};

class ReportScreen extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isLoading: true,
        };
    }

    componentDidMount() {
        this.prepareTransition();
    }

    componentDidUpdate(prevProps) {
        const reportChanged = this.props.route.params.reportID !== prevProps.route.params.reportID;

        if (reportChanged) {
            this.prepareTransition();
        }
    }

    componentWillUnmount() {
        clearTimeout(this.loadingTimerId);
    }

    /**
     * Get the currently viewed report ID as number
     *
     * @returns {Number}
     */
    getReportID() {
        const params = this.props.route.params;
        return Number.parseInt(params.reportID, 10);
    }

    /**
     * When reports change there's a brief time content is not ready to be displayed
     *
     * @returns {Boolean}
     */
    shouldShowLoader() {
        return this.state.isLoading || !this.getReportID();
    }

    /**
     * Configures a small loading transition of fixed time and proceeds with rendering available data
     */
    prepareTransition() {
        if (!this.getReportID()) { return; }

        this.setState({isLoading: true});

        clearTimeout(this.loadingTimerId);
        this.loadingTimerId = setTimeout(() => this.setState({isLoading: false}), 300);
    }

    render() {
        return (
            <ScreenWrapper
                style={[
                    styles.appContent,
                    styles.flex1,
                    styles.flexColumn,
                ]}
            >
                <HeaderView
                    reportID={this.getReportID()}
                    onNavigationMenuButtonClicked={this.props.navigation.openDrawer}
                />

                {this.shouldShowLoader() && <FullScreenLoadingIndicator />}

                <View style={[styles.dFlex, styles.flex1]}>
                    <ReportView reportID={this.getReportID()} />
                </View>
            </ScreenWrapper>
        );
    }
}

ReportScreen.propTypes = propTypes;
export default ReportScreen;
