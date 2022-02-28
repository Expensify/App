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
import KeyboardSpacer from '../../../components/KeyboardSpacer';
import Tooltip from '../../../components/Tooltip';
import CONST from '../../../CONST';
import {participantPropTypes} from './optionPropTypes';
import themeColors from '../../../styles/themes/default';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import * as App from '../../../libs/actions/App';

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
        reportID: PropTypes.number,
        reportName: PropTypes.string,
        unreadActionCount: PropTypes.number,
    })),

    /** List of users' personal details */
    personalDetails: PropTypes.objectOf(participantPropTypes),

    /** The personal details of the person who is logged in */
    myPersonalDetails: PropTypes.shape({
        /** Display name of the current user from their personal details */
        displayName: PropTypes.string,

        /** Avatar URL of the current user from their personal details */
        avatar: PropTypes.string,
    }),

    /** Information about the network */
    network: PropTypes.shape({
        /** Is the network currently offline or not */
        isOffline: PropTypes.bool,
    }),

    /** Currently viewed reportID */
    currentlyViewedReportID: PropTypes.string,

    /** Whether we are viewing below the responsive breakpoint */
    isSmallScreenWidth: PropTypes.bool.isRequired,

    /** The chat priority mode */
    priorityMode: PropTypes.string,

    /** Whether we have the necessary report data to load the sidebar */
    initialReportDataLoaded: PropTypes.bool,

    // Whether we are syncing app data
    isSyncingData: PropTypes.bool,

    ...withLocalizePropTypes,
};

const defaultProps = {
    reports: {},
    personalDetails: {},
    myPersonalDetails: {
        avatar: OptionsListUtils.getDefaultAvatar(),
    },
    network: null,
    currentlyViewedReportID: '',
    priorityMode: CONST.PRIORITY_MODE.DEFAULT,
    initialReportDataLoaded: false,
    isSyncingData: false,
};

class SidebarLinks extends React.Component {
    static getRecentReports(props) {
        const activeReportID = parseInt(props.currentlyViewedReportID, 10);
        const sidebarOptions = OptionsListUtils.getSidebarOptions(
            props.reports,
            props.personalDetails,
            activeReportID,
            props.priorityMode,
            props.betas,
        );
        return sidebarOptions.recentReports;
    }

    static getUnreadReports(reportsObject) {
        const reports = _.values(reportsObject);
        if (reports.length === 0) {
            return [];
        }
        const unreadReports = _.filter(reports, report => report && report.unreadActionCount > 0);
        return unreadReports;
    }

    static shouldReorder(nextProps, orderedReports, currentlyViewedReportID, unreadReports) {
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
        const nextUnreadReports = SidebarLinks.getUnreadReports(nextProps.reports || {});
        const hasNewUnreadReports = nextUnreadReports.length > 0
            && _.some(nextUnreadReports,
                nextUnreadReport => !_.some(unreadReports, unreadReport => unreadReport.reportID === nextUnreadReport.reportID));
        if (hasNewUnreadReports) {
            return true;
        }

        // Do not re-order if the active report has a draft
        if (nextProps.currentlyViewedReportID) {
            const hasActiveReportDraft = lodashGet(nextProps.reportsWithDraft, `${ONYXKEYS.COLLECTION.REPORTS_WITH_DRAFT}${nextProps.currentlyViewedReportID}`, false);
            return !hasActiveReportDraft;
        }

        return true;
    }

    constructor(props) {
        super(props);
        this.state = {
            currentlyViewedReportID: props.currentlyViewedReportID,
            orderedReports: [],
            priorityMode: props.priorityMode,
            unreadReports: SidebarLinks.getUnreadReports(props.reports || {}),
        };
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        const shouldReorder = SidebarLinks.shouldReorder(nextProps, prevState.orderedReports, prevState.currentlyViewedReportID, prevState.unreadReports);
        const switchingPriorityModes = nextProps.priorityMode !== prevState.priorityMode;

        // Pull the reports we want to show on the left hand nav
        const recentReports = SidebarLinks.getRecentReports(nextProps);

        // Determine whether we want to re-order/sort the reports on the left hand nav
        const orderedReports = shouldReorder || switchingPriorityModes
            ? recentReports
            : _.chain(prevState.orderedReports)

            // To preserve the order of the conversations, we map over the previous state's order of reports.
            // Then match and replace older reports with the newer report conversations from recentReports
                .map(orderedReport => _.find(recentReports, recentReport => orderedReport.reportID === recentReport.reportID))

            // Because we are using map, we have to filter out any undefined reports that may happen when switching priority modes
                .filter(orderedReport => orderedReport !== undefined)
                .value();

        return {
            orderedReports,
            priorityMode: nextProps.priorityMode,
            currentlyViewedReportID: nextProps.currentlyViewedReportID,
            unreadReports: SidebarLinks.getUnreadReports(nextProps.reports || {}),
        };
    }

    showSearchPage() {
        Navigation.navigate(ROUTES.SEARCH);
    }

    render() {
        // Wait until the reports and personalDetails are actually loaded before displaying the LHN
        if (!this.props.initialReportDataLoaded || _.isEmpty(this.props.personalDetails)) {
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
                            source={this.props.myPersonalDetails.avatar}
                            isActive={this.props.network && !this.props.network.isOffline}
                            isSyncing={this.props.network && !this.props.network.isOffline && this.props.isSyncingData}
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
                <KeyboardSpacer />
            </View>
        );
    }
}

SidebarLinks.propTypes = propTypes;
SidebarLinks.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
        reports: {
            key: ONYXKEYS.COLLECTION.REPORT,
        },
        personalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS,
        },
        myPersonalDetails: {
            key: ONYXKEYS.MY_PERSONAL_DETAILS,
        },
        network: {
            key: ONYXKEYS.NETWORK,
        },
        currentlyViewedReportID: {
            key: ONYXKEYS.CURRENTLY_VIEWED_REPORTID,
        },
        priorityMode: {
            key: ONYXKEYS.NVP_PRIORITY_MODE,
        },
        initialReportDataLoaded: {
            key: ONYXKEYS.INITIAL_REPORT_DATA_LOADED,
        },
        isSyncingData: {
            key: ONYXKEYS.IS_LOADING_AFTER_RECONNECT,
        },
        betas: {
            key: ONYXKEYS.BETAS,
        },
        reportsWithDraft: {
            key: ONYXKEYS.COLLECTION.REPORTS_WITH_DRAFT,
        },
    }),
)(SidebarLinks);
