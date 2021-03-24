import React from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import {View} from 'react-native';
import styles from '../../styles/styles';
import ReportView from './report/ReportView';
import ScreenWrapper from '../../components/ScreenWrapper';
import HeaderView from './HeaderView';
import Navigation from '../../libs/Navigation/Navigation';
import ROUTES from '../../ROUTES';
import ONYXKEYS from '../../ONYXKEYS';
import VideoChatMenu from '../../components/VideoChatMenu';

const propTypes = {
    // id of the most recently viewed report
    currentlyViewedReportID: PropTypes.string,
};

const defaultProps = {
    currentlyViewedReportID: 0,
};

class ReportScreen extends React.Component {
    constructor(props) {
        super(props);
        this.toggleVideoChatMenu = this.toggleVideoChatMenu.bind(this);

        this.state = {
            isVideoChatMenuActive: false,
        };
    }

    toggleVideoChatMenu() {
        this.setState(state => ({
            isVideoChatMenuActive: !state.isVideoChatMenuActive,
        }));
    }

    render() {
        const activeReportID = parseInt(this.props.currentlyViewedReportID, 10);
        if (!activeReportID) {
            return null;
        }
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
                    onVideoChatMenuButtonClicked={this.toggleVideoChatMenu}
                    isVideoChatMenuActive={this.state.isVideoChatMenuActive}
                />
                <VideoChatMenu
                    onClose={this.toggleVideoChatMenu}
                    isVisible={this.state.isVideoChatMenuActive}
                />
                <View style={[styles.dFlex, styles.flex1]}>
                    <ReportView
                        reportID={activeReportID}
                    />
                </View>
            </ScreenWrapper>
        );
    }
}

ReportScreen.propTypes = propTypes;
ReportScreen.defaultProps = defaultProps;
export default withOnyx({
    currentlyViewedReportID: {
        key: ONYXKEYS.CURRENTLY_VIEWED_REPORTID,
    },
})(ReportScreen);
