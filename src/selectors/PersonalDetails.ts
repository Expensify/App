import type {OnyxInputOrEntry, PersonalDetails} from '@src/types/onyx';

/**
 * Selector for personal details that returns only essential fields for display
 */
const personalDetailsDisplaySelector = (personalDetail: OnyxInputOrEntry<PersonalDetails>): OnyxInputOrEntry<PersonalDetails> =>
    personalDetail && {
        accountID: personalDetail.accountID,
        login: personalDetail.login,
        avatar: personalDetail.avatar,
        pronouns: personalDetail.pronouns,
    };

// eslint-disable-next-line import/prefer-default-export
export {personalDetailsDisplaySelector};
