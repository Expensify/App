import React from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import {View} from 'react-native';
import styles from '../../styles/styles';
import ReportView from './report/ReportView';
import ScreenWrapper from '../../components/ScreenWrapper';
import FullScreenLoadingIndicator from '../../components/Loading/FullscreenLoading';
import HeaderView from './HeaderView';
import Navigation from '../../libs/Navigation/Navigation';
import {fetchActions} from '../../libs/actions/Report';
import ROUTES from '../../ROUTES';
import ONYXKEYS from '../../ONYXKEYS';

const propTypes = {
    /* The ID of the report this screen should display */
    reportID: PropTypes.string.isRequired,

    /* Todo: extract to `withDrawer` HOC */
    navigation: PropTypes.shape({
        addListener: PropTypes.func.isRequired,
    }).isRequired,

};

class ReportScreen extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isLoading: true,
            error: null,
            drawerOpen: true,
        };
    }

    componentDidMount() {
        if (this.reportID) {
            this.fetchReport();
        }

        // Todo: extract to `withDrawer` HOC
        this.openListener = this.props.navigation.addListener('drawerOpen', () => {
            this.setState({drawerOpen: true});
        });

        // Todo: extract to `withDrawer` HOC
        this.closeListener = this.props.navigation.addListener('drawerClose', () => {
            this.setState({drawerOpen: false});
        });
    }

    componentDidUpdate(prevProps) {
        // Reports changed, reset and load new data
        if (this.props.reportID !== prevProps.reportID) {
            if (this.reportID) {
                this.fetchReport();
            }
        }
    }

    componentWillUnmount() {
        this.openListener();
        this.closeListener();
    }

    // Todo: ask why getters aren't on top?
    get canRenderMainContent() {
        return !this.state.isLoading && !this.state.error && !this.state.drawerOpen;
    }

    get reportID() {
        return parseInt(this.props.reportID, 10);
    }

    fetchReport() {
        console.debug('[ReportScreen] Fetch started: ');
        this.setState({
            isLoading: true,
            error: null,
        });

        /* Todo: it might be good if this method resolves with needed data here
        *   when online resolve with data from the server
        *   when offline resolve with local data
        * E.cash strategy is optimistic response though. Maybe fetchAction can internally
        * resolve instantly when it can (some onyx data available) and then
        * push an update to onyx data after actual data is fetched
        * Another issue for optimistic loading - when data is available
        * the Chat will try to render immediately which is what's causing the
        * transition issues in the first place */
        fetchActions(this.reportID)
            .catch((error) => {
                // Todo: what should we do if fetching fails for some reason
                // Todo: see what we currently do and do the same here
                this.setState({error});
                console.error(error);
            })
            .finally(() => {
                console.debug('[ReportScreen] Fetch complete: ');
                this.setState({isLoading: false});
            });
    }

    render() {
        const activeReportID = parseInt(this.props.reportID, 10);

        return (
            <ScreenWrapper
                style={[
                    styles.appContent,
                    styles.flex1,
                    styles.flexColumn,
                ]}
            >
                <HeaderView
                    reportID={activeReportID}
                    onNavigationMenuButtonClicked={() => Navigation.navigate(ROUTES.HOME)}
                />

                <View style={[styles.dFlex, styles.flex1]}>
                    {
                        this.canRenderMainContent
                            ? <ReportView reportID={activeReportID} />
                            : <FullScreenLoadingIndicator />
                    }
                </View>
            </ScreenWrapper>
        );
    }
}

ReportScreen.displayName = 'ReportScreen';
ReportScreen.propTypes = propTypes;
export default withOnyx({
    reportID: {
        key: ONYXKEYS.CURRENTLY_VIEWED_REPORTID,
    },
})(ReportScreen);
