import {getParticipantsOption} from '@libs/OptionsListUtils';
import type {OptionData} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import type {InvitedEmailsToAccountIDs, PersonalDetailsList} from '@src/types/onyx';

function buildInitialWorkspaceInviteOptions(invitedEmailsToAccountIDsDraft?: InvitedEmailsToAccountIDs, personalDetails?: PersonalDetailsList): OptionData[] {
    if (!invitedEmailsToAccountIDsDraft || !personalDetails) {
        return [];
    }

    return Object.entries(invitedEmailsToAccountIDsDraft).map(([login, accountID]) => {
        const normalizedLogin = login.toLowerCase();
        const matchedPersonalDetail =
            !accountID || accountID === CONST.DEFAULT_NUMBER_ID ? Object.values(personalDetails).find((detail) => detail?.login?.toLowerCase() === normalizedLogin) : undefined;
        const participant = {
            login,
            accountID: matchedPersonalDetail?.accountID ?? accountID,
            selected: true,
        };

        return getParticipantsOption(participant, personalDetails) as OptionData;
    });
}

export default buildInitialWorkspaceInviteOptions;
