import type {InvitedEmailsToAccountIDs} from '@src/types/onyx';

type InviteOption = {
    accountID?: number;
    login?: string;
};

function getInvitedEmailsToAccountIDs(selectedOptions: InviteOption[]): InvitedEmailsToAccountIDs {
    const invitedEmailsToAccountIDs: InvitedEmailsToAccountIDs = {};

    for (const option of selectedOptions) {
        const login = option.login ?? '';
        const accountID = option.accountID;
        if (!login.trim() || accountID === undefined) {
            continue;
        }
        invitedEmailsToAccountIDs[login] = accountID;
    }

    return invitedEmailsToAccountIDs;
}

export default getInvitedEmailsToAccountIDs;
