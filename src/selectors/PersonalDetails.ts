import type {OnyxEntry} from 'react-native-onyx';
import type {OnyxInputOrEntry, PersonalDetails, PersonalDetailsList} from '@src/types/onyx';

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

/**
 * Selector factory for getting current user's personal details by accountID
 */
const createUserAccountSelector =
    (userAccountID: number) =>
    (allPersonalDetails: OnyxEntry<PersonalDetailsList>): PersonalDetails => {
        const personalDetailsForUser = allPersonalDetails?.[userAccountID] ?? ({} as PersonalDetails);
        personalDetailsForUser.accountID = userAccountID;
        return personalDetailsForUser;
    };

export {personalDetailsDisplaySelector, createUserAccountSelector};
