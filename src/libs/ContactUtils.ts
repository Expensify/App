import CONST from '@src/CONST';
import type {PersonalDetails} from '@src/types/onyx';
import type {DeviceContact, StringHolder} from './ContactImport/types';
import {getUserToInviteContactOption} from './OptionsListUtils';
import type {SearchOption} from './OptionsListUtils';
import RandomAvatarUtils from './RandomAvatarUtils';

function sortEmailObjects(emails?: StringHolder[]): string[] {
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
        return isExpensifyA !== isExpensifyB ? Number(isExpensifyB) - Number(isExpensifyA) : a.localeCompare(b);
    });
}

const getContacts = (deviceContacts: DeviceContact[] | []): Array<SearchOption<PersonalDetails>> => {
    return deviceContacts
        .map((contact) => {
            const email = sortEmailObjects(contact?.emailAddresses ?? [])?.at(0) ?? '';
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
            });
        })
        .filter((contact): contact is SearchOption<PersonalDetails> => contact !== null);
};

export default getContacts;
