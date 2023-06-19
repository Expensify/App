import _ from 'underscore';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';
import * as ReportUtils from '../ReportUtils';

const DEPRECATED_ONYX_KEYS = {
    // Deprecated personal details object which was keyed by login instead of accountID.
    PERSONAL_DETAILS: 'personalDetails',

    COLLECTION: {
        POLICY_MEMBER_LIST: 'policyMemberList_',
    },
};

/**
 * @returns {Promise<Object>}
 */
function getReportsFromOnyx() {
    return new Promise((resolve) => {
        const connectionID = Onyx.connect({
            key: ONYXKEYS.COLLECTION.REPORT,
            waitForCollectionCallback: true,
            callback: (allReports) => {
                Onyx.disconnect(connectionID);
                return resolve(allReports);
            },
        });
    });
}

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
 * @returns {Promise<Object>}
 */
function getDeprecatedPolicyMemberListFromOnyx() {
    return new Promise((resolve) => {
        const connectionID = Onyx.connect({
            key: DEPRECATED_ONYX_KEYS.COLLECTION.POLICY_MEMBER_LIST,
            waitForCollectionCallback: true,
            callback: (allPolicyMembers) => {
                Onyx.disconnect(connectionID);
                return resolve(allPolicyMembers);
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
 *     - originalMessage.participants -> originalMessage.participantAccountIDs
 *     - actorEmail -> actorAccountID
 *     - childManagerEmail -> childManagerAccountID
 *     - whisperedTo -> whisperedToAccountID
 *     - childOldestFourEmails -> childOldestFourAccountIDs
 *     - accountEmail -> accountID
 * - report_
 *     - ownerEmail -> ownerAccountID
 *     - managerEmail -> managerID
 *     - lastActorEmail -> lastActorAccountID
 *     - participants -> participantAccountIDs
 *
 * @returns {Promise<void>}
 */
export default function () {
    return Promise.all([getReportsFromOnyx(), getReportActionsFromOnyx(), getDeprecatedPersonalDetailsFromOnyx(), getDeprecatedPolicyMemberListFromOnyx()]).then(
        ([oldReports, oldReportActions, oldPersonalDetails, oldPolicyMemberLists]) => {
            const onyxData = {};

            const knownUsers = new Set();
            _.each(oldReports, (report) => {
                if (!report) {
                    return;
                }

                if (ReportUtils.isPublicRoom(report)) {
                    return;
                }

                if (ReportUtils.isChatRoom(report)) {
                    const participants = report.participants;
                    _.each(participants, (login) => knownUsers.add(login));
                    return;
                }

                const reportActionsForReport = oldReportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`];
                _.each(reportActionsForReport, (reportAction) => {
                    if (!reportAction) {
                        return;
                    }

                    const actorEmail = reportAction.actorEmail;
                    if (!actorEmail) {
                        return;
                    }

                    knownUsers.add(actorEmail);
                });
            });

            _.each(oldPolicyMemberLists, (memberList) => {
                _.each(memberList, (login) => {
                    knownUsers.add(login);
                });
            });

            // Migrate personalDetails => personalDetailsList
            const newPersonalDetailsList = {};
            _.each(oldPersonalDetails, (value, login) => {
                if (!value) {
                    return;
                }

                let newPersonalDetailsForUser;
                if (!knownUsers.has(login)) {
                    newPersonalDetailsForUser = _.omit(value, ['login', 'phoneNumber']);
                    newPersonalDetailsForUser.displayName = '';
                } else {
                    newPersonalDetailsForUser = value;
                }

                newPersonalDetailsList[value.accountID] = newPersonalDetailsForUser;
            });
            onyxData[DEPRECATED_ONYX_KEYS.PERSONAL_DETAILS] = null;
            onyxData[ONYXKEYS.PERSONAL_DETAILS_LIST] = newPersonalDetailsList;

            // Migrate policyMemberList_ to policyMember_
            _.each(oldPolicyMemberLists, (value, policyKey) => {
                const policyID = policyKey.substr(DEPRECATED_ONYX_KEYS.COLLECTION.POLICY_MEMBER_LIST.length);
                const newMemberList = {};
                _.each(value, (member, login) => {
                    const accountID = _.get(oldPersonalDetails, [login, 'accountID']);
                    if (!accountID) {
                        return;
                    }
                    newMemberList[accountID] = member;
                });
                onyxData[policyKey] = null;
                onyxData[`${ONYXKEYS.COLLECTION.POLICY_MEMBERS}${policyID}`] = newMemberList;
            });

            // Migrate reportActions
            _.each(oldReportActions, (reportActionsForReport, onyxKey) => {
                if (!reportActionsForReport) {
                    return;
                }

                const newReportActionsForReport = {};
                _.each(reportActionsForReport, (reportAction) => {
                    if (!reportAction) {
                        return;
                    }

                    const newReportAction = _.omit(reportAction, [
                        'oldLogin',
                        'newLogin',
                        'actorEmail',
                        'accountEmail',
                        'childManagerEmail',
                        'originalMessage',
                        'whisperedTo',
                        'childOldestFourEmails',
                    ]);

                    if (reportAction.oldLogin) {
                        const oldAccountID = _.get(oldPersonalDetails, [reportAction.oldLogin, 'accountID']);
                        if (oldAccountID) {
                            newReportAction.oldAccountID = oldAccountID;
                        }
                    }

                    if (reportAction.newLogin) {
                        const newAccountID = _.get(oldPersonalDetails, [reportAction.newLogin, 'accountID']);
                        if (newAccountID) {
                            newReportAction.newAccountID = newAccountID;
                        }
                    }

                    if (reportAction.actorEmail) {
                        const newAccountID = _.get(oldPersonalDetails, [reportAction.actorEmail, 'accountID']);
                        if (newAccountID) {
                            newReportAction.actorAccountID = newAccountID;
                        }
                    }

                    if (reportAction.accountEmail) {
                        const accountID = _.get(oldPersonalDetails, [reportAction.accountEmail, 'accountID']);
                        if (accountID) {
                            newReportAction.accountID = accountID;
                        }
                    }

                    if (reportAction.childManagerEmail) {
                        const childManagerAccountID = _.get(oldPersonalDetails, [reportAction.childManagerEmail, 'accountID']);
                        if (childManagerAccountID) {
                            newReportAction.childManagerAccountID = childManagerAccountID;
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

            // Migrate reports
            _.each(oldReports, (report, onyxKey) => {
                const newReport = _.omit(report, ['ownerEmail', 'managerEmail', 'lastActorEmail', 'participants']);

                if (report.ownerEmail) {
                    const ownerAccountID = _.get(oldPersonalDetails, [report.ownerEmail, 'accountID']);
                    if (ownerAccountID) {
                        newReport.ownerAccountId = ownerAccountID;
                    }
                }

                if (report.managerEmail) {
                    const managerAccountID = _.get(oldPersonalDetails, [report.managerEmail, 'accountID']);
                    if (managerAccountID) {
                        newReport.managerAccountID = managerAccountID;
                    }
                }

                if (report.lastActorEmail) {
                    const lastActorAccountID = _.get(oldPersonalDetails, [report.lastActorEmail, 'accountID']);
                    if (lastActorAccountID) {
                        newReport.lastActorAccountID = lastActorAccountID;
                    }
                }

                if (report.participants) {
                    const participantAccountIDs = [];
                    _.each(report.participants, (login) => {
                        const accountID = _.get(oldPersonalDetails, [login, 'accountID']);
                        participantAccountIDs.push(accountID);
                    });
                    newReport.participantAccountIDs = participantAccountIDs;
                }

                onyxData[onyxKey] = newReport;
            });

            return Onyx.multiSet(onyxData);
        },
    );
}
