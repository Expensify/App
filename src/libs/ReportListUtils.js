/* eslint-disable no-continue */
import React, {Component, createContext} from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash.get';
import lodashOrderBy from 'lodash.orderby';
import Str from 'expensify-common/lib/str';
import {getDefaultAvatar} from './actions/PersonalDetails';
import ONYXKEYS from '../ONYXKEYS';

export const ReportListContext = createContext({});

const propTypes = {
    /* Onyx Props */

    // List of reports
    reports: PropTypes.objectOf(PropTypes.shape({
        reportID: PropTypes.number,
        reportName: PropTypes.string,
        unreadActionCount: PropTypes.number,
    })),

    // List of draft comments. We don't know the shape, since the keys include the report numbers
    draftComments: PropTypes.objectOf(PropTypes.string),

    // List of users' personal details
    personalDetails: PropTypes.objectOf(PropTypes.shape({
        login: PropTypes.string.isRequired,
        avatarURL: PropTypes.string.isRequired,
        displayName: PropTypes.string.isRequired,
    })),

    activeReportID: PropTypes.string,
};

const defaultProps = {
    reports: {},
    personalDetails: {},
    draftComments: {},
    activeReportID: '',
};

/**
 * ReportListUtils is used to build a list options passed to a ReportList component. Several different UI views can
 * be configured to display different results based on the options passed to the private getOptions() method. Public
 * methods should be named for the views they build options for and then exported for use the consumer component.
 *
 * This component is a provider that is created once and will recalculate options when Onyx props update. All consumers
 * will then also update and filter the new options accordingly.
 */
class ReportListUtilsProvider extends Component {
    constructor(props) {
        super(props);
        this.buildOptions();
    }

    shouldComponentUpdate(nextProps) {
        if (this.props.activeReportID !== nextProps.activeReportID) {
            return true;
        }

        if (!_.isEqual(this.props.reports, nextProps.reports)) {
            return true;
        }

        if (!_.isEqual(this.props.personalDetails, nextProps.personalDetails)) {
            return true;
        }

        if (!_.isEqual(this.props.draftComments, nextProps.draftComments)) {
            return true;
        }

        return false;
    }

    /**
     * Get participants for the report. Returns array of logins.
     *
     * @param {Object} report
     * @returns {Array}
     */
    getParticipantLogins(report) {
        return lodashGet(report, ['participants'], []);
    }

    /**
     * Returns the personal details for an array of logins
     *
     * @param {Array} logins
     * @returns {Array}
     */
    getPersonalDetailsForLogins(logins) {
        return _.map(logins, (login) => {
            let personalDetail = this.props.personalDetails[login];

            if (!personalDetail) {
                personalDetail = {
                    login,
                    displayName: login,
                    avatarURL: getDefaultAvatar(login),
                };
            }

            return personalDetail;
        });
    }

    /**
     * Returns a string with all relevant search terms
     *
     * @param {Object} report
     * @param {Array} personalDetailList
     * @return {String}
     */
    getSearchText(report, personalDetailList) {
        const searchTerms = [];

        _.each(personalDetailList, (personalDetail) => {
            searchTerms.push(personalDetail.displayName);
            searchTerms.push(personalDetail.login);
        });

        if (report) {
            searchTerms.push(...report.reportName.split(',').map(name => name.trim()));
            searchTerms.push(...report.participants);
        }

        return _.unique(searchTerms).join(' ');
    }

    /**
     * Build the options
     *
     * @param {Object} reportActions
     * @param {Object} options
     * @returns {Object}
     * @private
     */
    getOptions({
        selectedOptions = [],
        maxRecentReportsToShow = 0,
        includeMultipleParticipantReports = false,
        includePersonalDetails = false,
        includeRecentReports = false,
        prioritizePinnedReports = false,
        searchValue = '',
    }) {
        let recentReportOptions = [];
        const pinnedReportOptions = [];
        const personalDetailsOptions = [];

        // Always exclude already selected options and the currently logged in user
        const currentUserLogin = lodashGet(this.props, ['session', 'email']);
        const loginOptionsToExclude = [...selectedOptions, {login: currentUserLogin}];

        if (includeRecentReports) {
            for (let i = 0; i < this.allReportOptions.length; i++) {
                // Stop adding options to the recentReports array when we reach the maxRecentReportsToShow value
                if (recentReportOptions.length > 0 && recentReportOptions.length === maxRecentReportsToShow) {
                    break;
                }

                const reportOption = this.allReportOptions[i];

                // Skip if we aren't including multiple participant reports and this report has multiple participants
                if (!includeMultipleParticipantReports && !reportOption.login) {
                    continue;
                }

                // Check the report to see if it has a single participant and if the participant is already selected
                if (reportOption.login
                        && _.some(loginOptionsToExclude, option => option.login === reportOption.login)
                ) {
                    continue;
                }

                // Finally check to see if this options is a match for the provided search string if we have one
                if (searchValue && !this.isSearchStringMatch(searchValue, reportOption.searchText)) {
                    continue;
                }

                // If the report is pinned and we are using the option to display pinned reports on top then we need to
                // collect the pinned reports so we can sort them alphabetically once they are collected
                if (prioritizePinnedReports && reportOption.isPinned) {
                    pinnedReportOptions.push(reportOption);
                } else {
                    recentReportOptions.push(reportOption);
                }

                // Add this login to the exclude list so it won't appear when we process the personal details
                if (reportOption.login) {
                    loginOptionsToExclude.push({login: reportOption.login});
                }
            }
        }

        // If we are prioritizing our pinned reports then shift them to the front and sort them by report name
        if (prioritizePinnedReports) {
            const sortedPinnedReports = lodashOrderBy(pinnedReportOptions, ['text'], ['asc']);
            recentReportOptions = sortedPinnedReports.concat(recentReportOptions);
        }

        if (includePersonalDetails) {
            // Next loop over all personal details removing any that are selectedUsers or recentChats
            _.each(this.allPersonalDetailsOptions, (personalDetailOption) => {
                if (_.some(loginOptionsToExclude, loginOptionToExclude => (
                    loginOptionToExclude.login === personalDetailOption.login
                ))) {
                    return;
                }

                if (searchValue && !this.isSearchStringMatch(searchValue, personalDetailOption.searchText)) {
                    return;
                }

                personalDetailsOptions.push(personalDetailOption);
            });
        }

        return {
            personalDetails: personalDetailsOptions,
            recentReports: recentReportOptions,
        };
    }

    /**
     * Build the options for the Search view
     *
     * @param {String} searchValue
     * @returns {Object}
     */
    getSearchOptions(searchValue = '') {
        return this.getOptions({
            searchValue,
            includeRecentReports: true,
            includeMultipleParticipantReports: true,
            maxRecentReportsToShow: 0, // Unlimited
            prioritizePinnedReports: true,
        });
    }

    /**
     * Build the options for the New Chat view
     *
     * @param {String} searchValue
     * @returns {Object}
     */
    getNewChatOptions(searchValue = '') {
        return this.getOptions({
            searchValue,
            includePersonalDetails: true,
        });
    }

    /**
     * Build the options for the New Group view
     *
     * @param {String} searchValue
     * @param {Array} selectedOptions
     * @returns {Object}
     */
    getNewGroupOptions(searchValue = '', selectedOptions = []) {
        return this.getOptions({
            searchValue,
            selectedOptions,
            includeRecentReports: true,
            includePersonalDetails: true,
            includeMultipleParticipantReports: false,
            maxRecentReportsToShow: 5,
        });
    }

    /**
     * Build the options for the Sidebar a.k.a. LHN
     *
     * @returns {Object}
     */
    getSidebarOptions() {
        return this.getOptions({
            includeRecentReports: true,
            includeMultipleParticipantReports: true,
            maxRecentReportsToShow: 0, // Unlimited
            prioritizePinnedReports: true,
        });
    }

    /**
     * Creates a report list option
     *
     * @param {Array<Object>} personalDetailList
     * @param {Object} [report]
     * @returns {Object}
     */
    createOption(personalDetailList, report) {
        const hasMultipleParticipants = personalDetailList.length > 1;
        const personalDetail = personalDetailList[0];
        return {
            text: report ? report.reportName : personalDetail.displayName,
            alternateText: (report && hasMultipleParticipants) ? report.reportName : personalDetail.login,
            icons: report ? report.icons : [personalDetail.avatarURL],

            // It doesn't make sense to provide a login in the case of a report with multiple participants since
            // there isn't any one single login to refer to for a report.
            login: !hasMultipleParticipants ? personalDetail.login : null,
            reportID: report ? report.reportID : null,
            isUnread: report ? report.unreadActionCount > 0 : null,
            hasDraftComment: report && String(report.reportID) !== this.props.activeReportID
                && this.hasComment(report.reportID),
            keyForList: report ? String(report.reportID) : personalDetail.login,
            searchText: this.getSearchText(report, personalDetailList),
            isPinned: lodashGet(report, 'isPinned', false),
        };
    }

    /**
     * Check if the report has a draft comment
     *
     * @param {Number} reportID
     * @returns {Boolean}
     */
    hasComment(reportID) {
        const allComments = lodashGet(
            this.props.draftComments,
            `${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${reportID}`,
            '',
        );
        return allComments.length > 0;
    }

    /**
     * Builds the options
     */
    buildOptions() {
        const reportMapForLogins = {};
        const orderedReports = lodashOrderBy(this.props.reports, ['lastVisitedTimestamp'], ['desc']);
        const allReportOptions = _.map(orderedReports, (report) => {
            const logins = this.getParticipantLogins(report);
            const reportPersonalDetails = this.getPersonalDetailsForLogins(logins);

            // Save the report in the map if this is a single participant so we
            // can associate the reportID with the personal detail option later.
            if (logins.length <= 1) {
                reportMapForLogins[logins[0]] = report;
            }
            return this.createOption(reportPersonalDetails, report);
        });

        const allPersonalDetailsOptions = _.map(this.props.personalDetails, personalDetail => (
            this.createOption([personalDetail], reportMapForLogins[personalDetail.login])
        ));

        this.allReportOptions = allReportOptions;
        this.allPersonalDetailsOptions = allPersonalDetailsOptions;
    }

    /**
     * Searches for a match when provided with a value
     *
     * @param {String} searchValue
     * @param {String} searchText
     * @returns {Boolean}
     */
    isSearchStringMatch(searchValue, searchText) {
        const matchRegexes = [
            new RegExp(`^${Str.escapeForRegExp(searchValue)}$`, 'i'),
            new RegExp(`^${Str.escapeForRegExp(searchValue)}`, 'i'),
            new RegExp(Str.escapeForRegExp(searchValue), 'i'),
        ];

        return _.some(matchRegexes, (regex) => {
            const valueToSearch = searchText && searchText.replace(new RegExp(/&nbsp;/g), '');
            return regex.test(valueToSearch);
        });
    }

    render() {
        this.buildOptions();
        return (
            <ReportListContext.Provider
                value={{
                    // Export the public methods to any consumers
                    getSidebarOptions: () => this.getSidebarOptions(),
                }}
            >
                {this.props.children}
            </ReportListContext.Provider>
        );
    }
}

ReportListUtilsProvider.propTypes = propTypes;
ReportListUtilsProvider.defaultProps = defaultProps;

export default withOnyx({
    session: {
        key: ONYXKEYS.SESSION,
    },
    reports: {
        key: ONYXKEYS.COLLECTION.REPORT,
    },
    draftComments: {
        key: ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT,
    },
    personalDetails: {
        key: ONYXKEYS.PERSONAL_DETAILS,
    },
    activeReportID: {
        key: ONYXKEYS.CURRENTLY_VIEWED_REPORTID,
    },
})(ReportListUtilsProvider);
