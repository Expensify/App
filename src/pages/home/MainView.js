import React, {Component} from 'react';
import lodashGet from 'lodash.get';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import {withOnyx} from 'react-native-onyx';
import ReportView from './report/ReportView';
import ONYXKEYS from '../../ONYXKEYS';
import styles from '../../styles/styles';
import compose from '../../libs/compose';
import withWindowDimensions from '../../components/withWindowDimensions';
import HeaderView from './HeaderView';
import Navigator from '../../Navigator';
import ROUTES from '../../ROUTES';
import SafeAreaViewWrapper from '../../components/SafeAreaViewWrapper';

const propTypes = {
    /* Onyx Props */
    // List of reports to display
    reports: PropTypes.objectOf(PropTypes.shape({
        reportID: PropTypes.number,
    })),
};

const defaultProps = {
    reports: {},
};

class MainView extends Component {
    render() {
        let activeReportID = parseInt(lodashGet(this.props, 'route.params.reportID', 0), 10);

        // The styles for each of our reports. Basically, they are all hidden except for the one matching the
        // reportID in the URL
        const reportStyles = _.reduce(this.props.reports, (memo, report) => {
            if (!report) {
                return memo;
            }

            const isActiveReport = activeReportID === report.reportID;
            const finalData = {...memo};
            let reportStyle;

            if (isActiveReport) {
                activeReportID = report.reportID;
                reportStyle = [styles.dFlex, styles.flex1];
            } else {
                reportStyle = [styles.dNone];
            }

            finalData[report.reportID] = [reportStyle];
            return finalData;
        }, {});

        const reportsToDisplay = _.filter(this.props.reports, report => (
            report && (report.isPinned
                || report.unreadActionCount > 0
                || report.reportID === activeReportID)
        ));
        return (
            <SafeAreaViewWrapper style={[styles.flexColumn]}>
                {() => (
                    <>
                        <HeaderView
                            shouldShowNavigationMenuButton={this.props.isSmallScreenWidth}
                            onNavigationMenuButtonClicked={() => {
                                Navigator.openDrawer();
                            }}
                            reportID={String(activeReportID)}
                        />
                        {_.map(reportsToDisplay, report => (
                            <View
                                key={report.reportID}
                                style={reportStyles[report.reportID]}
                            >
                                <ReportView
                                    reportID={report.reportID}
                                    isActiveReport={report.reportID === activeReportID}
                                />
                            </View>
                        ))}
                    </>
                )}
            </SafeAreaViewWrapper>
        );
    }
}

MainView.propTypes = propTypes;
MainView.defaultProps = defaultProps;

export default compose(
    withWindowDimensions,
    withOnyx({
        reports: {
            key: ONYXKEYS.COLLECTION.REPORT,
        },
    }),
)(MainView);
