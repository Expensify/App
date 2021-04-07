import React from 'react';
import PropTypes from 'prop-types';
import {LayoutAnimation, View} from 'react-native';
import styles from '../../styles/styles';
import ReportView from './report/ReportView';
import ScreenWrapper from '../../components/ScreenWrapper';
import HeaderView from './HeaderView';
import {fetchActions} from '../../libs/actions/Report';

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
        this.fetchReport();
    }

    componentDidUpdate(prevProps) {
        // Reports changed, reset and load new data
        if (this.props.route.params.reportID !== prevProps.route.params.reportID) {
            this.fetchReport();
        }
    }

    get canRenderMainContent() {
        return Boolean(this.reportID) && !this.state.isLoading;
    }

    get reportID() {
        const params = this.props.route.params;
        return parseInt(params.reportID, 10) || 0;
    }

    fetchReport() {
        if (!this.reportID) { return; }

        // This adds a small fade in transition when the loader appears
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

        this.setState({isLoading: true});

        fetchActions(this.reportID)
            .catch(console.error)
            .finally(() => {
                // This adds a small fadeout transition when the loader disappears
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                this.setState({isLoading: false});
            });
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
                    reportID={this.reportID}
                    onNavigationMenuButtonClicked={this.props.navigation.openDrawer}
                />

                <View style={[styles.dFlex, styles.flex1]}>
                    <ReportView
                        loaded={this.canRenderMainContent}
                        reportID={this.reportID}
                    />
                </View>
            </ScreenWrapper>
        );
    }
}

ReportScreen.propTypes = propTypes;
export default ReportScreen;
