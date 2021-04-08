import React from 'react';
import lodashGet from 'lodash/get';
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

const propTypes = {
    // id of the most recently viewed report
    currentlyViewedReportID: PropTypes.string,
};

const defaultProps = {
    currentlyViewedReportID: '0',
};

const ReportScreen = (props) => {
    const activeReportID = parseInt(props.currentlyViewedReportID, 10);
    const routeReportID = parseInt(lodashGet(props, ['route', 'params', 'reportID'], '0'), 10);

    if (!activeReportID) {
        return null;
    }

    // Since multiple ReportScreen can be stacked on top of eachother we don't want to render all of them.
    // @TODO figure out a better way to manage this since we should only be showing the top screen in this stack, but
    // can't use isFocused since a modal might also have the focus. This hack also isn't ideal since there could be
    // multiple screens in the stack. Maybe a custom stack navigator that only renders the top screen in the stack?
    if (routeReportID && (routeReportID !== activeReportID)) {
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
            />
            <View style={[styles.dFlex, styles.flex1]}>
                <ReportView reportID={activeReportID} />
            </View>
        </ScreenWrapper>
    );
};

ReportScreen.displayName = 'ReportScreen';
ReportScreen.propTypes = propTypes;
ReportScreen.defaultProps = defaultProps;
export default withOnyx({
    currentlyViewedReportID: {
        key: ONYXKEYS.CURRENTLY_VIEWED_REPORTID,
    },
})(ReportScreen);
