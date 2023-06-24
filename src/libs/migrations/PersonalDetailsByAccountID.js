import _ from 'underscore';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';

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
 * Migrate Onyx data to hide emails where necessary.
 *
 * - personalDetails -> personalDetailsList
 *     - Key by accountID instead of email
 *     - Must check if users are "known" or not, and include their contact info if and only if they are "known"
 * - policyMemberList_ -> policyMember_
 *     - Key by accountID instead of email
 * - reportAction_
 *     - oldLogin -> oldAccountID
 *     - newLogin -> newAccountID
 *     - actorEmail -> actorAccountID
 *     - accountEmail -> accountID
 *     - childManagerEmail -> childManagerAccountID
 *     - originalMessage.participants -> originalMessage.participantAccountIDs
 *     - whisperedTo -> whisperedToAccountID
 *     - childOldestFourEmails -> childOldestFourAccountIDs
 * - report_
 *     - ownerEmail -> ownerAccountID
 *     - managerEmail -> managerID
 *     - lastActorEmail -> lastActorAccountID
 *     - participants -> participantAccountIDs
 *
 * @returns {Promise<void>}
 */
export default function () {
    return Promise.all([getReportActionsFromOnyx(), getDeprecatedPersonalDetailsFromOnyx()]).then(
        ([oldReportActions, oldPersonalDetails]) => {
            const onyxData = {};

            // We migrate reportActions to have the new accountID-based data if they don't already.
            // If we are not able to get the accountID for some reason, we will just clear the reportAction
            // and let it be fetched from the API next time they open the report and scroll to that action.
            _.each(oldReportActions, (reportActionsForReport, onyxKey) => {
                if (!reportActionsForReport) {
                    return;
                }

                const newReportActionsForReport = {};
                _.each(reportActionsForReport, (reportAction) => {
                    if (!reportAction) {
                        return;
                    }

                    const newReportAction = reportAction;

                    if (reportAction.oldLogin && !reportAction.oldAccountID) {
                        const oldAccountID = _.get(oldPersonalDetails, [reportAction.oldLogin, 'accountID']);
                        if (oldAccountID) {
                            newReportAction.oldAccountID = oldAccountID;
                        } else {
                            return;
                        }
                    }

                    if (reportAction.newLogin && !reportAction.newAccountID) {
                        const newAccountID = _.get(oldPersonalDetails, [reportAction.newLogin, 'accountID']);
                        if (newAccountID) {
                            newReportAction.newAccountID = newAccountID;
                        } else {
                            return;
                        }
                    }

                    if (reportAction.actorEmail && !reportAction.actorAccountID) {
                        const actorAccountID = _.get(oldPersonalDetails, [reportAction.actorEmail, 'accountID']);
                        if (actorAccountID) {
                            newReportAction.actorAccountID = actorAccountID;
                        } else {
                            return;
                        }
                    }

                    if (reportAction.accountEmail && !reportAction.accountID) {
                        const accountID = _.get(oldPersonalDetails, [reportAction.accountEmail, 'accountID']);
                        if (accountID) {
                            newReportAction.accountID = accountID;
                        } else {
                            return;
                        }
                    }

                    if (reportAction.childManagerEmail && !reportAction.childManagerAccountID) {
                        const childManagerAccountID = _.get(oldPersonalDetails, [reportAction.childManagerEmail, 'accountID']);
                        if (childManagerAccountID) {
                            newReportAction.childManagerAccountID = childManagerAccountID;
                        } else {
                            return;
                        }
                    }

                    const newOriginalMessage = _.omit(reportAction.originalMessage, ['participants']);
                    const oldParticipants = _.get(reportAction, ['originalMessage', 'participants'], []);
                    const newParticipants = [];
                    _.each(oldParticipants, (login) => {
                        const accountID = _.get(oldPersonalDetails, [login, 'accountID']);
                        newParticipants.push(accountID);
                    });
                    newOriginalMessage.participantAccountIDs = newParticipants;
                    newReportAction.originalMessage = newOriginalMessage;

                    if (reportAction.whisperedTo) {
                        const whisperedToAccountIDs = [];
                        _.each(reportAction.whisperedTo, (whisperedToLogin) => {
                            const whisperedToAccountID = _.get(oldPersonalDetails, [whisperedToLogin, 'accountID']);
                            if (whisperedToAccountID) {
                                whisperedToAccountIDs.push(whisperedToAccountID);
                            }
                        });
                        newReportAction.whisperedToAccountIDs = whisperedToAccountIDs;
                    }

                    if (reportAction.childOldestFourEmails) {
                        const childOldestFourEmails = reportAction.childOldestFourEmails.split(',');
                        const childOldestFourAccountIDs = [];
                        _.each(childOldestFourEmails, (login) => {
                            const accountID = _.get(oldPersonalDetails, [login, 'accountID']);
                            if (accountID) {
                                childOldestFourAccountIDs.push(accountID);
                            }
                        });
                        newReportAction.childOldestFourAccountIDs = childOldestFourAccountIDs.join(',');
                    }

                    newReportActionsForReport[newReportAction.reportActionID] = newReportAction;
                });

                onyxData[onyxKey] = newReportActionsForReport;
            });

            return Onyx.multiSet(onyxData);
        },
    );
}