import React from 'react';
import {View, TouchableOpacity} from 'react-native';
import _ from 'underscore';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import styles from '../../../styles/styles';
import * as StyleUtils from '../../../styles/StyleUtils';
import ONYXKEYS from '../../../ONYXKEYS';
import safeAreaInsetPropTypes from '../../safeAreaInsetPropTypes';
import compose from '../../../libs/compose';
import Navigation from '../../../libs/Navigation/Navigation';
import ROUTES from '../../../ROUTES';
import Icon from '../../../components/Icon';
import Header from '../../../components/Header';
import OptionsList from '../../../components/OptionsList';
import * as Expensicons from '../../../components/Icon/Expensicons';
import AvatarWithIndicator from '../../../components/AvatarWithIndicator';
import * as OptionsListUtils from '../../../libs/OptionsListUtils';
import Tooltip from '../../../components/Tooltip';
import CONST from '../../../CONST';
import participantPropTypes from '../../../components/participantPropTypes';
import themeColors from '../../../styles/themes/default';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import * as App from '../../../libs/actions/App';
import * as ReportUtils from '../../../libs/ReportUtils';
import withCurrentUserPersonalDetails from '../../../components/withCurrentUserPersonalDetails';
import Timing from '../../../libs/actions/Timing';

const propTypes = {
    /** Toggles the navigation menu open and closed */
    onLinkClick: PropTypes.func.isRequired,

    /** Navigates to settings and hides sidebar */
    onAvatarClick: PropTypes.func.isRequired,

    /** Safe area insets required for mobile devices margins */
    insets: safeAreaInsetPropTypes.isRequired,

    /* Onyx Props */
    /** List of reports */
    reports: PropTypes.objectOf(PropTypes.shape({
        /** ID of the report */
        reportID: PropTypes.number,

        /** Name of the report */
        reportName: PropTypes.string,

        /** Number of unread actions on the report */
        unreadActionCount: PropTypes.number,
    })),

    /** List of users' personal details */
    personalDetails: PropTypes.objectOf(participantPropTypes),

    /** The personal details of the person who is logged in */
    currentUserPersonalDetails: PropTypes.shape({
        /** Display name of the current user from their personal details */
        displayName: PropTypes.string,

        /** Avatar URL of the current user from their personal details */
        avatar: PropTypes.string,
    }),

    /** Currently viewed reportID */
    currentlyViewedReportID: PropTypes.string,

    /** Whether we are viewing below the responsive breakpoint */
    isSmallScreenWidth: PropTypes.bool.isRequired,

    /** The chat priority mode */
    priorityMode: PropTypes.string,

    ...withLocalizePropTypes,
};

const defaultProps = {
    reports: {},
    personalDetails: {},
    currentUserPersonalDetails: {
        avatar: ReportUtils.getDefaultAvatar(),
    },
    currentlyViewedReportID: '',
    priorityMode: CONST.PRIORITY_MODE.DEFAULT,
};

class SidebarLinks extends React.Component {
    constructor(props) {
        super(props);

        this.getFilteredAndOrderedReports = this.getFilteredAndOrderedReports.bind(this);

        this.activeReport = {
            reportID: props.currentlyViewedReportID,
        };

        this.orderedReports = [];
        this.priorityMode = props.priorityMode;
        this.unreadReports = this.getUnreadReports(props.reports);
    }

    getFilteredAndOrderedReports(unfilteredReports) {
        const isActiveReportSame = this.activeReport.reportID === this.props.currentlyViewedReportID;
        const lastMessageTimestamp = lodashGet(unfilteredReports, `${ONYXKEYS.COLLECTION.REPORT}${this.props.currentlyViewedReportID}.lastMessageTimestamp`, 0);

        // Determines if the active report has a history of draft comments while active.
        let hasDraftHistory;

        // If the active report has not changed and the message has been sent, set the draft history flag to false so LHN can reorder.
        // Otherwise, if the active report has not changed and the flag was previously true, preserve the state so LHN cannot reorder.
        // Otherwise, update the flag from the prop value.
        if (isActiveReportSame && this.activeReport.lastMessageTimestamp !== lastMessageTimestamp) {
            hasDraftHistory = false;
        } else if (isActiveReportSame && this.activeReport.hasDraftHistory) {
            hasDraftHistory = true;
        } else {
            hasDraftHistory = lodashGet(this.props.reports, `${ONYXKEYS.COLLECTION.REPORT}${this.props.currentlyViewedReportID}.hasDraft`, false);
        }

        const switchingPriorityModes = this.props.priorityMode !== this.priorityMode;

        // Build the report options we want to show
        const recentReports = this.getRecentReportsOptionListItems();

        // If the order of the reports is different from the last render (or if priority mode is changing)
        // then orderedReports is the same as the freshly calculated recentReports.
        // If the order of the reports is the same as the last render
        // then the data for each report is updated from the data in the new props (not sure why this is necessary)
        const orderedReports = this.isReportOrderDifferentThanLastRender(hasDraftHistory) || switchingPriorityModes
            ? recentReports
            : _.chain(this.orderedReports)

                // To preserve the order of the conversations, we map over the previous ordered reports.
                // Then match and replace older reports with the newer report conversations from recentReports
                .map(orderedReport => _.find(recentReports, recentReport => orderedReport.reportID === recentReport.reportID))

                // Because we are using map, we have to filter out any undefined reports. This happens if recentReports
                // does not have all the conversations in the previous set of orderedReports
                .filter(orderedReport => orderedReport !== undefined)
                .value();

        // Store these pieces of data on the class so that the next time this method is called
        // the previous values can be compared against to tell if something changed which would
        // cause the reports to be reordered
        this.orderedReports = orderedReports;
        this.priorityMode = this.props.priorityMode;
        this.activeReport = {
            reportID: this.props.currentlyViewedReportID,
            hasDraftHistory,
            lastMessageTimestamp,
        };
        this.unreadReports = this.getUnreadReports(unfilteredReports);

        return this.orderedReports;
    }

    /**
     * Create a map of unread reports that looks like this:
     *  {
     *      1: true,
     *      2: true,
     * }
     * This is so that when the new props are compared to the old props, it's
     * fast to look up if there are any new unread reports.
     *
     * @param {Object[]} reports
     * @returns {Object}
     */
    getUnreadReports(reports) {
        return _.reduce(reports, (finalUnreadReportMap, report) => {
            if (report.unreadActionCount > 0) {
                return {
                    [report.reportID]: true,
                    ...finalUnreadReportMap,
                };
            }
            return finalUnreadReportMap;
        }, {});
    }

    getRecentReportsOptionListItems() {
        const activeReportID = parseInt(this.props.currentlyViewedReportID, 10);
        const sidebarOptions = OptionsListUtils.getSidebarOptions(
            this.props.reports,
            this.props.personalDetails,
            activeReportID,
            this.props.priorityMode,
            this.props.betas,
            this.props.reportActions,
        );
        return sidebarOptions.recentReports;
    }

    isReportOrderDifferentThanLastRender(hasDraftHistory) {
        // If the number of reports changed, then the report order is different
        if (this.orderedReports.length !== this.props.reports.length) {
            return true;
        }

        // If the active report changed, then the report order is different
        if (this.activeReport.reportID !== this.props.currentlyViewedReportID) {
            return true;
        }

        // If the active report has a draft, the order of the reports doesn't change
        // because it would cause the reports to reorder when a user starts typing a comment
        // and that is an annoying UX (too much stuff jumping around)
        if (this.props.currentlyViewedReportID && hasDraftHistory) {
            return false;
        }

        // If the unread reports have changed, then the report order changes
        // because the unread reports need to be placed at the top of the list
        // @TODO: This can probably be optimized
        const hasNewUnreadReports = _.some(this.props.reports, report => report.unreadActionCount > 0 && !this.unreadReports[report.reportID]);
        if (hasNewUnreadReports) {
            return true;
        }

        // By default, assume that the order of the reports doesn't change
        // in order to optimize the rendering
        return false;
    }

    showSearchPage() {
        Navigation.navigate(ROUTES.SEARCH);
    }

    render() {
        // Wait until the personalDetails are actually loaded before displaying the LHN
        if (_.isEmpty(this.props.personalDetails)) {
            return null;
        }

        const activeReportID = parseInt(this.props.currentlyViewedReportID, 10);
        Timing.start(CONST.TIMING.SIDEBAR_LINKS_FILTER_REPORTS);
        const sections = [{
            title: '',
            indexOffset: 0,
            data: this.getFilteredAndOrderedReports(this.props.reports),
            shouldShow: true,
        }];
        Timing.end(CONST.TIMING.SIDEBAR_LINKS_FILTER_REPORTS);

        return (
            <View style={[styles.flex1, styles.h100]}>
                <View
                    style={[
                        styles.flexRow,
                        styles.ph5,
                        styles.pv3,
                        styles.justifyContentBetween,
                        styles.alignItemsCenter,
                    ]}
                    nativeID="drag-area"
                >
                    <Header
                        textSize="large"
                        title={this.props.translate('sidebarScreen.headerChat')}
                        accessibilityLabel={this.props.translate('sidebarScreen.headerChat')}
                        accessibilityRole="text"
                        shouldShowEnvironmentBadge
                    />
                    <Tooltip text={this.props.translate('common.search')}>
                        <TouchableOpacity
                            accessibilityLabel={this.props.translate('sidebarScreen.buttonSearch')}
                            accessibilityRole="button"
                            style={[styles.flexRow, styles.ph5]}
                            onPress={this.showSearchPage}
                        >
                            <Icon src={Expensicons.MagnifyingGlass} />
                        </TouchableOpacity>
                    </Tooltip>
                    <TouchableOpacity
                        accessibilityLabel={this.props.translate('sidebarScreen.buttonMySettings')}
                        accessibilityRole="button"
                        onPress={this.props.onAvatarClick}
                    >
                        <AvatarWithIndicator
                            source={this.props.currentUserPersonalDetails.avatar}
                            tooltipText={this.props.translate('common.settings')}
                        />
                    </TouchableOpacity>
                </View>
                <OptionsList
                    contentContainerStyles={[
                        styles.sidebarListContainer,
                        {paddingBottom: StyleUtils.getSafeAreaMargins(this.props.insets).marginBottom},
                    ]}
                    sections={sections}
                    focusedIndex={_.findIndex(this.orderedReports, (
                        option => option.reportID === activeReportID
                    ))}
                    onSelectRow={(option) => {
                        Navigation.navigate(ROUTES.getReportRoute(option.reportID));
                        this.props.onLinkClick();
                    }}
                    optionBackgroundColor={themeColors.sidebar}
                    hideSectionHeaders
                    showTitleTooltip
                    disableFocusOptions={this.props.isSmallScreenWidth}
                    optionMode={this.props.priorityMode === CONST.PRIORITY_MODE.GSD ? 'compact' : 'default'}
                    onLayout={App.setSidebarLoaded}
                />
            </View>
        );
    }
}

SidebarLinks.propTypes = propTypes;
SidebarLinks.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withCurrentUserPersonalDetails,
    withOnyx({
        reports: {
            key: ONYXKEYS.COLLECTION.REPORT,
        },
        personalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS,
        },
        currentlyViewedReportID: {
            key: ONYXKEYS.CURRENTLY_VIEWED_REPORTID,
        },
        priorityMode: {
            key: ONYXKEYS.NVP_PRIORITY_MODE,
        },
        betas: {
            key: ONYXKEYS.BETAS,
        },
        reportActions: {
            key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
        },
    }),
)(SidebarLinks);
