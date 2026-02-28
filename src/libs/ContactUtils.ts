import type {OnyxEntry} from 'react-native-onyx';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import CONST from '@src/CONST';
import type {Login, PersonalDetails, PersonalDetailsList} from '@src/types/onyx';
import type {DeviceContact, StringHolder} from './ContactImport/types';
import {getUserToInviteContactOption} from './OptionsListUtils';
import type {SearchOption} from './OptionsListUtils';
import RandomAvatarUtils from './RandomAvatarUtils';

function sortEmailObjects(emails: StringHolder[], localeCompare: LocaleContextProps['localeCompare']): string[] {
    if (!emails?.length) {
        return [];
    }

    const expensifyDomain = CONST.EMAIL.EXPENSIFY_EMAIL_DOMAIN.toLowerCase();
    const filteredEmails: string[] = [];
    for (const email of emails) {
        if (email?.value) {
            filteredEmails.push(email.value);
        }
    }

    return filteredEmails.sort((a, b) => {
        const isExpensifyA = a.toLowerCase().includes(expensifyDomain);
        const isExpensifyB = b.toLowerCase().includes(expensifyDomain);

        // Prioritize Expensify emails, then sort alphabetically
        return isExpensifyA !== isExpensifyB ? Number(isExpensifyB) - Number(isExpensifyA) : localeCompare(a, b);
    });
}

const getContacts = (
    deviceContacts: DeviceContact[] | [],
    localeCompare: LocaleContextProps['localeCompare'],
    countryCode: number,
    loginList: OnyxEntry<Login>,
    currentUserEmail: string,
    currentUserAccountID: number,
    personalDetails: OnyxEntry<PersonalDetailsList>,
): Array<SearchOption<PersonalDetails>> => {
    return deviceContacts
        .map((contact) => {
            const email = sortEmailObjects(contact?.emailAddresses ?? [], localeCompare)?.at(0) ?? '';
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            const avatarSource = (contact?.imageData || RandomAvatarUtils.getAvatarForContact(`${contact?.firstName}${email}${contact?.lastName}`)) ?? '';
            const phoneNumber = contact.phoneNumbers?.[0]?.value ?? '';
            const firstName = contact?.firstName ?? '';
            const lastName = contact?.lastName ?? '';

            return getUserToInviteContactOption({
                selectedOptions: [],
                optionsToExclude: [],
                searchValue: email || phoneNumber || firstName || '',
                firstName,
                lastName,
                email,
                phone: phoneNumber,
                avatar: avatarSource,
                countryCode,
                loginList,
                currentUserEmail,
                currentUserAccountID,
                personalDetails,
            });
        })
        .filter((contact): contact is SearchOption<PersonalDetails> => contact !== null);
};

export default getContacts;
export {sortEmailObjects};
