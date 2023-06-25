import _ from 'underscore';
import lodashHas from 'lodash/has';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';
import Log from '../Log';

const DEPRECATED_ONYX_KEYS = {
    // Deprecated personal details object which was keyed by login instead of accountID.
    PERSONAL_DETAILS: 'personalDetails',
};

/**
 * @returns {Promise<Object>}
 */
function getReportActionsFromOnyx() {
    return new Promise((resolve) => {
        const connectionID = Onyx.connect({
            key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
            waitForCollectionCallback: true,
            callback: (allReportActions) => {
                Onyx.disconnect(connectionID);
                return resolve(allReportActions);
            },
        });
    });
}

/**
 * @returns {Promise<Object>}
 */
function getDeprecatedPersonalDetailsFromOnyx() {
    return new Promise((resolve) => {
        const connectionID = Onyx.connect({
            key: DEPRECATED_ONYX_KEYS.PERSONAL_DETAILS,
            callback: (allPersonalDetails) => {
                Onyx.disconnect(connectionID);
                return resolve(allPersonalDetails);
            },
        });
    });
}

/**
 * Migrate Onyx data for the email to accountID migration.
 *
 * @returns {Promise<void>}
 */
export default function () {
    return Promise.all([getReportActionsFromOnyx(), getDeprecatedPersonalDetailsFromOnyx()]).then(([oldReportActions, oldPersonalDetails]) => {
        const onyxData = {};
        // originalMessage.oldLogin -> originalMessage.oldAccountID x
        // originalMessage.newLogin -> originalMessage.newAccountID x
        // actorEmail -> actorAccountID x
        // childManagerEmail -> childManagerAccountID x
        // whisperedTo -> whisperedToAccountIDs x
        // childOldestFourEmails -> childOldestFourAccountIDs x
        // participants -> participantAccountIDs ?
        // accountEmail -> accountID ?

        // We migrate reportActions to have the new accountID-based data if they don't already.
        // If we are not able to get the accountID for some reason, we will just clear the reportAction
        // and let it be fetched from the API next time they open the report and scroll to that action.
        _.each(oldReportActions, (reportActionsForReport, onyxKey) => {
            if (_.isEmpty(reportActionsForReport)) {
                Log.info(`[Migrate Onyx] Skipped migration PersonalDetailsByAccountID for ${onyxKey} because there were no reportActions`);
                return;
            }

            const newReportActionsForReport = {};
            _.each(reportActionsForReport, (reportAction, reportActionID) => {
                if (_.isEmpty(reportAction)) {
                    Log.info(`[Migrate Onyx] Skipped migration PersonalDetailsByAccountID for reportAction ${reportActionID} because the reportAction was empty`);
                    return;
                }

                const newReportAction = reportAction;

                if (lodashHas(reportAction, ['originalMessage', 'oldLogin']) && !lodashHas(reportAction, ['originalMessage', 'oldAccountID'])) {
                    const oldAccountID = _.get(oldPersonalDetails, [reportAction.originalMessage.oldLogin, 'accountID']);
                    if (oldAccountID) {
                        newReportAction.originalMessage.oldAccountID = oldAccountID;
                    } else {
                        Log.info(`[Migrate Onyx] PersonalDetailsByAccountID migration: removing reportAction ${reportActionID} because originalMessage.oldAccountID not found`);
                        return;
                    }
                }

                if (lodashHas(reportAction, ['originalMessage', 'newLogin']) && !lodashHas(reportAction, ['originalMessage', 'newAccountID'])) {
                    const newAccountID = _.get(oldPersonalDetails, [reportAction.originalMessage.newLogin, 'accountID']);
                    if (newAccountID) {
                        newReportAction.originalMessage.newAccountID = newAccountID;
                    } else {
                        Log.info(`[Migrate Onyx] PersonalDetailsByAccountID migration: removing reportAction ${reportActionID} because originalMessage.newAccountID not found`);
                        return;
                    }
                }

                if (lodashHas(reportAction, ['actorEmail']) && !lodashHas(reportAction, ['actorAccountID'])) {
                    const actorAccountID = _.get(oldPersonalDetails, [reportAction.actorEmail, 'accountID']);
                    if (actorAccountID) {
                        newReportAction.actorAccountID = actorAccountID;
                    } else {
                        Log.info(`[Migrate Onyx] PersonalDetailsByAccountID migration: removing reportAction ${reportActionID} because actorAccountID not found`);
                        return;
                    }
                }

                if (lodashHas(reportAction, ['childManagerEmail']) && !lodashHas(reportAction, ['childManagerAccountID'])) {
                    const childManagerAccountID = _.get(oldPersonalDetails, [reportAction.childManagerEmail, 'accountID']);
                    if (childManagerAccountID) {
                        newReportAction.childManagerAccountID = childManagerAccountID;
                    } else {
                        Log.info(`[Migrate Onyx] PersonalDetailsByAccountID migration: removing reportAction ${reportActionID} because childManagerAccountID not found`);
                        return;
                    }
                }

                if (lodashHas(reportAction, ['whisperedTo']) && !lodashHas(reportAction, ['whisperedToAccountIDs'])) {
                    const whisperedToAccountIDs = [];
                    _.each(reportAction.whisperedTo, (whisperedToLogin) => {
                        const whisperedToAccountID = _.get(oldPersonalDetails, [whisperedToLogin, 'accountID']);
                        if (whisperedToAccountID) {
                            whisperedToAccountIDs.push(whisperedToAccountID);
                        }
                    });

                    if (whisperedToAccountIDs.length === reportAction.whisperedTo.length) {
                        newReportAction.whisperedToAccountIDs = whisperedToAccountIDs;
                    } else {
                        Log.info(`[Migrate Onyx] PersonalDetailsByAccountID migration: removing reportAction ${reportActionID} because whisperedToAccountIDs not found`);
                        return;
                    }
                }

                if (lodashHas(reportAction, ['childOldestFourEmails']) && !lodashHas(reportAction, ['childOldestFourAccountIDs'])) {
                    const childOldestFourEmails = reportAction.childOldestFourEmails.split(',');
                    const childOldestFourAccountIDs = [];
                    _.each(childOldestFourEmails, (login) => {
                        const accountID = _.get(oldPersonalDetails, [login, 'accountID']);
                        if (accountID) {
                            childOldestFourAccountIDs.push(accountID);
                        }
                    });

                    if (childOldestFourAccountIDs.length === childOldestFourEmails.length) {
                        newReportAction.childOldestFourAccountIDs = childOldestFourAccountIDs.join(',');
                    } else {
                        Log.info(`[Migrate Onyx] PersonalDetailsByAccountID migration: removing reportAction ${reportActionID} because childOldestFourAccountIDs not found`);
                        return;
                    }
                }

                // if (reportAction.accountEmail && !reportAction.accountID) {
                //     const accountID = _.get(oldPersonalDetails, [reportAction.accountEmail, 'accountID']);
                //     if (accountID) {
                //         newReportAction.accountID = accountID;
                //     } else {
                //         return;
                //     }
                // }

                // const newOriginalMessage = _.omit(reportAction.originalMessage, ['participants']);
                // const oldParticipants = _.get(reportAction, ['originalMessage', 'participants'], []);
                // const newParticipants = [];
                // _.each(oldParticipants, (login) => {
                //     const accountID = _.get(oldPersonalDetails, [login, 'accountID']);
                //     newParticipants.push(accountID);
                // });
                // newOriginalMessage.participantAccountIDs = newParticipants;
                // newReportAction.originalMessage = newOriginalMessage;

                newReportActionsForReport[reportActionID] = newReportAction;
            });

            onyxData[onyxKey] = newReportActionsForReport;
        });

        return Onyx.multiSet(onyxData);
    });
}
