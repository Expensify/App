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
 * We use the old personalDetails object becuase it is more efficient for this migration since it is keyed by email address.
 * Also, if the old personalDetails object is not available, that likely means the migration has already run successfully before on this account.
 *
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
 * - reportAction_
 *     - originalMessage.oldLogin -> originalMessage.oldAccountID
 *     - originalMessage.newLogin -> originalMessage.newAccountID
 *     - accountEmail -> accountID
 *     - actorEmail -> actorAccountID
 *     - childManagerEmail -> childManagerAccountID
 *     - whisperedTo -> whisperedToAccountIDs
 *     - childOldestFourEmails -> childOldestFourAccountIDs
 *     - originalMessage.participants -> originalMessage.participantAccountIDs
 *
 * @returns {Promise<void>}
 */
export default function () {
    return Promise.all([getReportActionsFromOnyx(), getDeprecatedPersonalDetailsFromOnyx()]).then(([oldReportActions, oldPersonalDetails]) => {
        const onyxData = {};

        if (!oldReportActions) {
            Log.info('[Migrate Onyx] Skipped migration PersonalDetailsByAccountID because there were no reportActions');
            return;
        }

        // We migrate reportActions to have the new accountID-based data if they don't already.
        // If we are not able to get the accountID from personalDetails for some reason, we will just clear the reportAction
        // and let it be fetched from the API next time they open the report and scroll to that action.
        // We do this because we know the reportAction from the API will include the needed accountID data.
        _.each(oldReportActions, (reportActionsForReport, onyxKey) => {
            if (_.isEmpty(reportActionsForReport)) {
                Log.info(`[Migrate Onyx] Skipped migration PersonalDetailsByAccountID for ${onyxKey} because there were no reportActions`);
                return;
            }

            const newReportActionsForReport = {};
            let reportActionsWereModified = false;
            _.each(reportActionsForReport, (reportAction, reportActionID) => {
                if (_.isEmpty(reportAction)) {
                    reportActionsWereModified = true;
                    Log.info(`[Migrate Onyx] PersonalDetailsByAccountID migration: removing reportAction ${reportActionID} because the reportAction was empty`);
                    return;
                }

                const newReportAction = reportAction;

                if (lodashHas(reportAction, ['originalMessage', 'oldLogin']) && !lodashHas(reportAction, ['originalMessage', 'oldAccountID'])) {
                    reportActionsWereModified = true;
                    const oldAccountID = _.get(oldPersonalDetails, [reportAction.originalMessage.oldLogin, 'accountID']);
                    if (oldAccountID) {
                        newReportAction.originalMessage.oldAccountID = oldAccountID;
                    } else {
                        Log.info(`[Migrate Onyx] PersonalDetailsByAccountID migration: removing reportAction ${reportActionID} because originalMessage.oldAccountID not found`);
                        return;
                    }
                }

                if (lodashHas(reportAction, ['originalMessage', 'newLogin']) && !lodashHas(reportAction, ['originalMessage', 'newAccountID'])) {
                    reportActionsWereModified = true;
                    const newAccountID = _.get(oldPersonalDetails, [reportAction.originalMessage.newLogin, 'accountID']);
                    if (newAccountID) {
                        newReportAction.originalMessage.newAccountID = newAccountID;
                    } else {
                        Log.info(`[Migrate Onyx] PersonalDetailsByAccountID migration: removing reportAction ${reportActionID} because originalMessage.newAccountID not found`);
                        return;
                    }
                }

                if (lodashHas(reportAction, ['accountEmail']) && !lodashHas(reportAction, ['accountID'])) {
                    reportActionsWereModified = true;
                    const accountID = _.get(oldPersonalDetails, [reportAction.accountEmail, 'accountID']);
                    if (accountID) {
                        newReportAction.accountID = accountID;
                    } else {
                        Log.info(`[Migrate Onyx] PersonalDetailsByAccountID migration: removing reportAction ${reportActionID} because accountID not found`);
                        return;
                    }
                }

                if (lodashHas(reportAction, ['actorEmail']) && !lodashHas(reportAction, ['actorAccountID'])) {
                    reportActionsWereModified = true;
                    const actorAccountID = _.get(oldPersonalDetails, [reportAction.actorEmail, 'accountID']);
                    if (actorAccountID) {
                        newReportAction.actorAccountID = actorAccountID;
                    } else {
                        Log.info(`[Migrate Onyx] PersonalDetailsByAccountID migration: removing reportAction ${reportActionID} because actorAccountID not found`);
                        return;
                    }
                }

                if (lodashHas(reportAction, ['childManagerEmail']) && !lodashHas(reportAction, ['childManagerAccountID'])) {
                    reportActionsWereModified = true;
                    const childManagerAccountID = _.get(oldPersonalDetails, [reportAction.childManagerEmail, 'accountID']);
                    if (childManagerAccountID) {
                        newReportAction.childManagerAccountID = childManagerAccountID;
                    } else {
                        Log.info(`[Migrate Onyx] PersonalDetailsByAccountID migration: removing reportAction ${reportActionID} because childManagerAccountID not found`);
                        return;
                    }
                }

                if (lodashHas(reportAction, ['whisperedTo']) && !lodashHas(reportAction, ['whisperedToAccountIDs'])) {
                    reportActionsWereModified = true;
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
                    reportActionsWereModified = true;
                    const childOldestFourEmails = reportAction.childOldestFourEmails.split(',');
                    const childOldestFourAccountIDs = [];
                    _.each(childOldestFourEmails, (login) => {
                        const accountID = _.get(oldPersonalDetails, [login.trim(), 'accountID']);
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

                if (lodashHas(reportAction, ['originalMessage', 'participants']) && !lodashHas(reportAction, ['originalMessage', 'participantAccountIDs'])) {
                    reportActionsWereModified = true;
                    const participantAccountIDs = [];
                    _.each(reportAction.originalMessage.participants, (participant) => {
                        const participantAccountID = _.get(oldPersonalDetails, [participant, 'accountID']);
                        if (participantAccountID) {
                            participantAccountIDs.push(participantAccountID);
                        }
                    });

                    if (participantAccountIDs.length === reportAction.originalMessage.participants.length) {
                        newReportAction.originalMessage.participantAccountIDs = participantAccountIDs;
                    } else {
                        Log.info(`[Migrate Onyx] PersonalDetailsByAccountID migration: removing reportAction ${reportActionID} because originalMessage.participantAccountIDs not found`);
                        return;
                    }
                }

                newReportActionsForReport[reportActionID] = newReportAction;
            });

            // Only include the reportActions from this report if at least one reportAction in this report
            // was modified in any way.
            if (reportActionsWereModified) {
                onyxData[onyxKey] = newReportActionsForReport;
            }
        });

        return Onyx.multiSet(onyxData);
    });
}
