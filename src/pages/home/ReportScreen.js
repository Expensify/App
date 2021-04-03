import React from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import {View} from 'react-native';
import styles from '../../styles/styles';
import ReportView from './report/ReportView';
import ScreenWrapper from '../../components/ScreenWrapper';
import HeaderView from './HeaderView';
import Navigation from '../../libs/Navigation/Navigation';
import {fetchActions} from '../../libs/actions/Report';
import ROUTES from '../../ROUTES';
import ONYXKEYS from '../../ONYXKEYS';

const propTypes = {
    /* The ID of the report this screen should display */
    reportID: PropTypes.string,
};

const defaultProps = {
    reportID: '0',
};

class ReportScreen extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isLoading: true,
            error: null,
        };
    }

    componentDidMount() {
        this.fetchReport();
    }

    componentDidUpdate(prevProps) {
        // Reports changed, reset and load new data
        if (this.props.reportID !== prevProps.reportID) {
            this.fetchReport();
        }
    }

    // Todo: ask why getters aren't on top?
    get canRenderMainContent() {
        return this.reportID && !this.state.isLoading && !this.state.error;
    }

    get reportID() {
        return parseInt(this.props.reportID, 10);
    }

    fetchReport() {
        if (!this.reportID) { return; }

        console.debug('[ReportScreen] Fetch started: ');
        this.setState({
            isLoading: true,
            error: null,
        });

        fetchActions(this.reportID)
            .catch((error) => {
                // Todo: what should we do if fetching fails for some reason
                // Todo: see what we currently do and do the same here
                this.setState({error});
                console.error(error);
            })
            .finally(() => {
                console.debug('[ReportScreen] Stop loading: ');
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
                    onNavigationMenuButtonClicked={() => Navigation.navigate(ROUTES.HOME)}
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

ReportScreen.displayName = 'ReportScreen';
ReportScreen.propTypes = propTypes;
ReportScreen.defaultProps = defaultProps;

export default withOnyx({
    reportID: {
        key: ONYXKEYS.CURRENTLY_VIEWED_REPORTID,
    },
})(ReportScreen);
