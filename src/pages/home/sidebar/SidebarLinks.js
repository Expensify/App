import React from 'react';
import {View, TouchableOpacity} from 'react-native';
import _ from 'underscore';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import memoizeOne from 'memoize-one';
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

        /** Whether the report has a draft comment */
        hasDraft: PropTypes.bool,
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

/**
 * @param {Object} nextUnreadReports
 * @param {Object} unreadReports
 * @returns {Boolean}
 */
function checkForNewUnreadReports(nextUnreadReports, unreadReports) {
    return nextUnreadReports.length > 0
            && _.some(nextUnreadReports,
                nextUnreadReport => !_.some(unreadReports, unreadReport => unreadReport.reportID === nextUnreadReport.reportID));
}
const memoizeCheckForNewUnreadReports = memoizeOne(checkForNewUnreadReports);

/**
 * @param {Object} reportsObject
 * @returns {Array}
 */
function getUnreadReports(reportsObject) {
    const reports = _.values(reportsObject);
    if (reports.length === 0) {
        return [];
    }
    const unreadReports = _.filter(reports, report => report && ReportUtils.isUnread(report));
    return unreadReports;
}
const memoizeGetUnreadReports = memoizeOne(getUnreadReports);

class SidebarLinks extends React.Component {
    static getRecentReports(props) {
        const activeReportID = parseInt(props.currentlyViewedReportID, 10);
        const sidebarOptions = OptionsListUtils.getSidebarOptions(
            props.reports,
            props.personalDetails,
            activeReportID,
            props.priorityMode,
            props.betas,
            props.reportActions,
        );
        return sidebarOptions.recentReports;
    }

    /**
     * Returns true if the sidebar list should be re-ordered
     *
     * @param {Object} nextProps
     * @param {Boolean} hasActiveDraftHistory
     * @param {Array} orderedReports
     * @param {String} currentlyViewedReportID
     * @param {Array} unreadReports
     * @returns {Boolean}
     */
    static shouldReorder(nextProps, hasActiveDraftHistory, orderedReports, currentlyViewedReportID, unreadReports) {
        // We do not want to re-order reports in the LHN if the only change is the draft comment in the
        // current report.

        // We don't need to limit draft comment flashing for small screen widths as LHN is not visible.
        if (nextProps.isSmallScreenWidth) {
            return true;
        }

        // Always update if LHN is empty.
        if (orderedReports.length === 0) {
            return true;
        }

        const didActiveReportChange = currentlyViewedReportID !== nextProps.currentlyViewedReportID;

        // Always re-order the list whenever the active report is changed
        if (didActiveReportChange) {
            return true;
        }

        // If any reports have new unread messages, re-order the list
        const nextUnreadReports = memoizeGetUnreadReports(nextProps.reports || {});
        if (memoizeCheckForNewUnreadReports(nextUnreadReports, unreadReports)) {
            return true;
        }

        // If there is an active report that either had or has a draft, we do not want to re-order the list
        if (nextProps.currentlyViewedReportID && hasActiveDraftHistory) {
            return false;
        }

        return true;
    }

    constructor(props) {
        super(props);

        this.state = {
            activeReport: {
                reportID: props.currentlyViewedReportID,
                hasDraftHistory: lodashGet(props.reports, `${ONYXKEYS.COLLECTION.REPORT}${props.currentlyViewedReportID}.hasDraft`, false),
                lastMessageTimestamp: lodashGet(props.reports, `${ONYXKEYS.COLLECTION.REPORT}${props.currentlyViewedReportID}.lastMessageTimestamp`, 0),
            },
            orderedReports: [],
            priorityMode: props.priorityMode,
            unreadReports: memoizeGetUnreadReports(props.reports || {}),
        };
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        const isActiveReportSame = prevState.activeReport.reportID === nextProps.currentlyViewedReportID;
        const lastMessageTimestamp = lodashGet(nextProps.reports, `${ONYXKEYS.COLLECTION.REPORT}${nextProps.currentlyViewedReportID}.lastMessageTimestamp`, 0);

        // Determines if the active report has a history of draft comments while active.
        let hasDraftHistory;

        // If the active report has not changed and the message has been sent, set the draft history flag to false so LHN can reorder.
        // Otherwise, if the active report has not changed and the flag was previously true, preserve the state so LHN cannot reorder.
        // Otherwise, update the flag from the prop value.
        if (isActiveReportSame && prevState.activeReport.lastMessageTimestamp !== lastMessageTimestamp) {
            hasDraftHistory = false;
        } else if (isActiveReportSame && prevState.activeReport.hasDraftHistory) {
            hasDraftHistory = true;
        } else {
            hasDraftHistory = lodashGet(nextProps.reports, `${ONYXKEYS.COLLECTION.REPORT}${nextProps.currentlyViewedReportID}.hasDraft`, false);
        }

        const shouldReorder = SidebarLinks.shouldReorder(nextProps, hasDraftHistory, prevState.orderedReports, prevState.activeReport.reportID, prevState.unreadReports);
        const switchingPriorityModes = nextProps.priorityMode !== prevState.priorityMode;

        // Build the report options we want to show
        const recentReports = SidebarLinks.getRecentReports(nextProps);

        // Determine whether we need to keep the previous LHN order
        const orderedReports = shouldReorder || switchingPriorityModes
            ? recentReports
            : _.chain(prevState.orderedReports)

            // To preserve the order of the conversations, we map over the previous state's order of reports.
            // Then match and replace older reports with the newer report conversations from recentReports
                .map(orderedReport => _.find(recentReports, recentReport => orderedReport.reportID === recentReport.reportID))

            // Because we are using map, we have to filter out any undefined reports. This happens if recentReports
            // does not have all the conversations in prevState.orderedReports
                .compact()
                .value();

        return {
            orderedReports,
            priorityMode: nextProps.priorityMode,
            activeReport: {
                reportID: nextProps.currentlyViewedReportID,
                hasDraftHistory,
                lastMessageTimestamp,
            },
            unreadReports: memoizeGetUnreadReports(nextProps.reports || {}),
        };
    }

    showSearchPage() {
        Navigation.navigate(ROUTES.SEARCH);
    }

    render() {
        // Wait until the reports and personalDetails are actually loaded before displaying the LHN
        if (_.isEmpty(this.props.personalDetails)) {
            return null;
        }

        const activeReportID = parseInt(this.props.currentlyViewedReportID, 10);
        const sections = [{
            title: '',
            indexOffset: 0,
            data: this.state.orderedReports || [],
            shouldShow: true,
        }];

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
                    focusedIndex={_.findIndex(this.state.orderedReports, (
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
