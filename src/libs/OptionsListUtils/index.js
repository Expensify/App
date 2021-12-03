import CONST from '../../CONST';
import getOptions from './getOptions';
import isCurrentUser from './isCurrentUser';

export {
    getIOUConfirmationOptionsFromMyPersonalDetail,
    getIOUConfirmationOptionsFromParticipants,
    getHeaderMessage,
    getCurrencyListForSections,
} from './utils';

/**
 * OptionsListUtils is used to build a list options passed to the OptionsList component. Several different UI views can
 * be configured to display different results based on the options passed to the private getOptions() method. Public
 * methods should be named for the views they build options for and then exported for use in a component.
 */

/**
 * Build the options for the Search view
 *
 * @param {Object} reports
 * @param {Object} personalDetails
 * @param {String} searchValue
 * @param {Array<String>} betas
 * @returns {Object}
 */
function getSearchOptions(
    reports,
    personalDetails,
    searchValue = '',
    betas,
) {
    return getOptions(reports, personalDetails, 0, {
        betas,
        searchValue,
        includeRecentReports: true,
        includeMultipleParticipantReports: true,
        maxRecentReportsToShow: 0, // Unlimited
        prioritizePinnedReports: false,
        prioritizeDefaultRoomsInSearch: false,
        sortByReportTypeInSearch: true,
        showChatPreviewLine: true,
        showReportsWithNoComments: true,
        includePersonalDetails: true,
        sortByLastMessageTimestamp: false,
        forcePolicyNamePreview: true,
        prioritizeIOUDebts: false,
    });
}

/**
 * Build the options for various views that initiate a new chat or request
 *
 * @param {Object} reports
 * @param {Object} personalDetails
 * @param {Array<String>} betas
 * @param {String} searchValue
 * @param {Array} selectedOptions
 * @param {Array} excludeLogins
 * @returns {Object}
 */
function getNewChatOptions(
    reports,
    personalDetails,
    betas = [],
    searchValue = '',
    selectedOptions = [],
    excludeLogins = [],
) {
    return getOptions(reports, personalDetails, 0, {
        betas,
        searchValue,
        selectedOptions,
        excludeDefaultRooms: true,
        includeRecentReports: true,
        includePersonalDetails: true,
        maxRecentReportsToShow: 5,
        excludeLogins,
    });
}

/**
 * Build the options for the Sidebar a.k.a. LHN
 *
 * @param {Object} reports
 * @param {Object} personalDetails
 * @param {Number} activeReportID
 * @param {String} priorityMode
 * @param {Array<String>} betas
 * @returns {Object}
 */
function getSidebarOptions(
    reports,
    personalDetails,
    activeReportID,
    priorityMode,
    betas,
) {
    let sideBarOptions = {
        prioritizePinnedReports: true,
        prioritizeIOUDebts: true,
        prioritizeReportsWithDraftComments: true,
    };
    if (priorityMode === CONST.PRIORITY_MODE.GSD) {
        sideBarOptions = {
            hideReadReports: true,
            sortByAlphaAsc: true,
            showReportsWithDrafts: true,
        };
    }

    return getOptions(reports, personalDetails, activeReportID, {
        betas,
        includeRecentReports: true,
        includeMultipleParticipantReports: true,
        maxRecentReportsToShow: 0, // Unlimited
        sortByLastMessageTimestamp: true,
        showChatPreviewLine: true,
        ...sideBarOptions,
    });
}

export {
    isCurrentUser,
    getSearchOptions,
    getNewChatOptions,
    getSidebarOptions,
};
