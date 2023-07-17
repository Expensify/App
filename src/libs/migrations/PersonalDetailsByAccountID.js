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
 * @returns {Promise<Object>}
 */
function getDeprecatedPolicyMemberListFromOnyx() {
    return new Promise((resolve) => {
        const connectionID = Onyx.connect({
            key: ONYXKEYS.COLLECTION.DEPRECATED_POLICY_MEMBER_LIST,
            waitForCollectionCallback: true,
            callback: (allPolicyMembers) => {
                Onyx.disconnect(connectionID);
                return resolve(allPolicyMembers);
            },
        });
    });
}

/**
 * Migrate Onyx data for the email to accountID migration.
 *
 * - personalDetails -> personalDetailsList
 * - policyMemberList_ -> policyMembers_
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
    return Promise.all([getReportActionsFromOnyx(), getDeprecatedPersonalDetailsFromOnyx(), getDeprecatedPolicyMemberListFromOnyx()]).then(
        ([oldReportActions, oldPersonalDetails, oldPolicyMemberList]) => {
            const onyxData = {};

            // The personalDetails object has been replaced by personalDetailsList
            // So if we find an instance of personalDetails we will clear it out
            if (oldPersonalDetails) {
                Log.info('[Migrate Onyx] PersonalDetailsByAccountID migration: removing personalDetails');
                onyxData[DEPRECATED_ONYX_KEYS.PERSONAL_DETAILS] = null;
            }

            // The policyMemberList_ collection has been replaced by policyMembers_
            // So if we find any instances of policyMemberList_ we will clear them out
            _.each(oldPolicyMemberList, (_policyMembersForPolicy, policyKey) => {
                Log.info(`[Migrate Onyx] PersonalDetailsByAccountID migration: removing policyMemberList ${policyKey}`);
                onyxData[policyKey] = null;
            });

            // We migrate reportActions to remove old email-based data.
            // If we do not find the equivalent accountID-based data in the reportAction, we will just clear the reportAction
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

                    if (lodashHas(reportAction, ['originalMessage', 'oldLogin'])) {
                        reportActionsWereModified = true;

                        if (lodashHas(reportAction, ['originalMessage', 'oldAccountID'])) {
                            delete newReportAction.originalMessage.oldLogin;
                        } else {
                            Log.info(`[Migrate Onyx] PersonalDetailsByAccountID migration: removing reportAction ${reportActionID} because originalMessage.oldAccountID not found`);
                            return;
                        }
                    }

                    if (lodashHas(reportAction, ['originalMessage', 'newLogin'])) {
                        reportActionsWereModified = true;

                        if (lodashHas(reportAction, ['originalMessage', 'newAccountID'])) {
                            delete newReportAction.originalMessage.newLogin;
                        } else {
                            Log.info(`[Migrate Onyx] PersonalDetailsByAccountID migration: removing reportAction ${reportActionID} because originalMessage.newAccountID not found`);
                            return;
                        }
                    }

                    if (lodashHas(reportAction, ['accountEmail'])) {
                        reportActionsWereModified = true;

                        if (lodashHas(reportAction, ['accountID'])) {
                            delete newReportAction.accountEmail;
                        } else {
                            Log.info(`[Migrate Onyx] PersonalDetailsByAccountID migration: removing reportAction ${reportActionID} because accountID not found`);
                            return;
                        }
                    }

                    if (lodashHas(reportAction, ['actorEmail'])) {
                        reportActionsWereModified = true;

                        if (lodashHas(reportAction, ['actorAccountID'])) {
                            delete newReportAction.actorEmail;
                        } else {
                            Log.info(`[Migrate Onyx] PersonalDetailsByAccountID migration: removing reportAction ${reportActionID} because actorAccountID not found`);
                            return;
                        }
                    }

                    if (lodashHas(reportAction, ['childManagerEmail'])) {
                        reportActionsWereModified = true;

                        if (lodashHas(reportAction, ['childManagerAccountID'])) {
                            delete newReportAction.childManagerEmail;
                        } else {
                            Log.info(`[Migrate Onyx] PersonalDetailsByAccountID migration: removing reportAction ${reportActionID} because childManagerAccountID not found`);
                            return;
                        }
                    }

                    if (lodashHas(reportAction, ['whisperedTo'])) {
                        reportActionsWereModified = true;

                        if (lodashHas(reportAction, ['whisperedToAccountIDs'])) {
                            delete newReportAction.whisperedTo;
                        } else {
                            Log.info(`[Migrate Onyx] PersonalDetailsByAccountID migration: removing reportAction ${reportActionID} because whisperedToAccountIDs not found`);
                            return;
                        }
                    }

                    if (lodashHas(reportAction, ['childOldestFourEmails'])) {
                        reportActionsWereModified = true;

                        if (lodashHas(reportAction, ['childOldestFourAccountIDs'])) {
                            delete newReportAction.childOldestFourEmails;
                        } else {
                            Log.info(`[Migrate Onyx] PersonalDetailsByAccountID migration: removing reportAction ${reportActionID} because childOldestFourAccountIDs not found`);
                            return;
                        }
                    }

                    if (lodashHas(reportAction, ['originalMessage', 'participants'])) {
                        reportActionsWereModified = true;

                        if (lodashHas(reportAction, ['originalMessage', 'participantAccountIDs'])) {
                            delete newReportAction.originalMessage.participants;
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
        },
    );
}
