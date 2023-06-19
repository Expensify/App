/**
 * Migrate Onyx data to hide emails where necessary.
 *
 * - personalDetails -> personalDetailsList
 *     - Key by accountID instead of email
 *     - Must check if users are "known" or not, and include their contact info iff they are "known"
 * - policyMemberList_ -> policyMember_
 *     - Key by accountID instead of email
 * - reportAction_
 *     - originalMessage.oldLogin -> originalMessage.oldAccountID
 *     - originalMessage.newLogin -> originalMessage.newAccountID
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
 *     - participants -> participantAccountID
 *
 * - User A "knows" user B if any of the following are true:
 *     - They share at least one non-public workspace room or domain room
 *     - User B has ever sent user A a message in a DM or group DM.
 *
 * @returns {Promise<void>}
 */
export default function () {
    return Promise.resolve();
}
