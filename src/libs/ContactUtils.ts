import CONST from '@src/CONST';
import type {PersonalDetails} from '@src/types/onyx';
import type {DeviceContact, StringHolder} from './ContactImport/types';
import * as OptionsListUtils from './OptionsListUtils';
import {getAvatarForContact} from './RandomAvatarUtils';

function sortEmailObjects(emails?: StringHolder[]): string[] {
    if (!emails?.length) {
        return [];
    }

    const expensifyDomain = CONST.EMAIL.EXPENSIFY_EMAIL_DOMAIN.toLowerCase();

    return emails
        .filter((email) => email?.value)
        .map((email) => email.value)
        .sort((a, b) => {
            const isExpensifyA = a.toLowerCase().includes(expensifyDomain);
            const isExpensifyB = b.toLowerCase().includes(expensifyDomain);

            // Prioritize Expensify emails, then sort alphabetically
            return isExpensifyA !== isExpensifyB ? Number(isExpensifyB) - Number(isExpensifyA) : a.localeCompare(b);
        });
}

const getContacts = (deviceContacts: DeviceContact[] | []): Array<OptionsListUtils.SearchOption<PersonalDetails>> => {
    return deviceContacts
        .map((contact) => {
            const email = sortEmailObjects(contact?.emailAddresses ?? [])?.at(0) ?? '';
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            const avatarSource = (contact?.imageData || getAvatarForContact(`${contact?.firstName}${email}${contact?.lastName}`)) ?? '';
            const phoneNumber = contact.phoneNumbers?.[0]?.value ?? '';
            const firstName = contact?.firstName ?? '';
            const lastName = contact?.lastName ?? '';

            return OptionsListUtils.getUserToInviteContactOption({
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
        .filter((contact): contact is OptionsListUtils.SearchOption<PersonalDetails> => contact !== null);
};

export default getContacts;
