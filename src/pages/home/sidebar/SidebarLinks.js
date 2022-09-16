import React from 'react';
import {View, TouchableOpacity} from 'react-native';
import _ from 'underscore';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
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
import withDrawerState from '../../../components/withDrawerState';
import withWindowDimensions from '../../../components/withWindowDimensions';
import Timing from '../../../libs/actions/Timing';
import reportActionPropTypes from '../report/reportActionPropTypes';

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

    /** All report actions for all reports */
    reportActions: PropTypes.objectOf(PropTypes.shape(reportActionPropTypes)),

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
    reportActions: {},
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
        this.getRecentReportsOptionListItems = memoizeOne(this.getRecentReportsOptionListItems.bind(this));
    }

    /**
     * @param {String} activeReportID
     * @param {String} priorityMode
     * @param {Object[]} unorderedReports
     * @param {Object} personalDetails
     * @param {String[]} betas
     * @param {Object} reportActions
     * @returns {Object[]}
     */
    getRecentReportsOptionListItems(activeReportID, priorityMode, unorderedReports, personalDetails, betas, reportActions) {
        const sidebarOptions = OptionsListUtils.getSidebarOptions(
            unorderedReports,
            personalDetails,
            activeReportID,
            priorityMode,
            betas,
            reportActions,
        );
        return sidebarOptions.recentReports;
    }

    showSearchPage() {
        Navigation.navigate(ROUTES.SEARCH);
    }

    render() {
        // Wait until the personalDetails are actually loaded before displaying the LHN
        if (_.isEmpty(this.props.personalDetails)) {
            return null;
        }

        Timing.start(CONST.TIMING.SIDEBAR_LINKS_FILTER_REPORTS);
        const optionListItems = this.getRecentReportsOptionListItems(
            this.props.currentlyViewedReportID,
            this.props.priorityMode,
            this.props.reports,
            this.props.personalDetails,
            this.props.betas,
            this.props.reportActions,
        );
        const sections = [{
            title: '',
            indexOffset: 0,
            data: optionListItems,
            shouldShow: true,
        }];
        Timing.end(CONST.TIMING.SIDEBAR_LINKS_FILTER_REPORTS);

        return (
            <View
                accessibilityElementsHidden={this.props.isSmallScreenWidth && !this.props.isDrawerOpen}
                accessibilityLabel="List of chats"
                style={[styles.flex1, styles.h100]}
            >
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
                    optionRowAlternateTextAccessibilityLabel="Last chat message preview"
                    optionRowAccessibilityHint="Navigates to a chat"
                    contentContainerStyles={[
                        styles.sidebarListContainer,
                        {paddingBottom: StyleUtils.getSafeAreaMargins(this.props.insets).marginBottom},
                    ]}
                    sections={sections}
                    focusedIndex={_.findIndex(optionListItems, (
                        option => option.reportID.toString() === this.props.currentlyViewedReportID
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
    withDrawerState,
    withWindowDimensions,
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
