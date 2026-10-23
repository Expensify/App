/**
 * The workspace members picked for a bulk role change, handed to the role screen that applies it.
 *
 * RAM-only, so the role screen has nothing to act on when it is reached by a reload or a deep link rather than from
 * the members table.
 */
type WorkspaceMembersSelectedForRoleChange = {
    /** The workspace the members were picked on, so a stash left behind cannot be applied to another one */
    policyID: string;

    /** Logins of the picked members. Empty once the change has been saved, which is what clears the rows behind it. */
    logins: string[];
};

export default WorkspaceMembersSelectedForRoleChange;
