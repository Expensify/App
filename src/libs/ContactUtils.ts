import type {DeviceContact, StringHolder} from '@pages/iou/request/ContactImport/types';
import CONST from '@src/CONST';
import type {PersonalDetails} from '@src/types/onyx';
import * as OptionsListUtils from './OptionsListUtils';
import {getAvatarForContact} from './RandomAvatarUtils';
import type * as UserUtils from './UserUtils';

type ContactEntry = {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    avatar?: UserUtils.AvatarSource;
};

type ProcessContactsConfig = Pick<OptionsListUtils.GetUserToInviteConfig, 'selectedOptions' | 'optionsToExclude'>;

function sortEmailObjects(emails?: StringHolder[]): string[] {
    const length = emails?.length ?? 0;
    if (!emails || length === 0) {
        return [''];
    }
    // Single email case - return value directly
    if (emails && length === 1) {
        return [emails.at(0)?.value ?? ''];
    }

    // Two emails case - most common
    if (length === 2) {
        const [firstEmail, secondEmail] = emails ?? [];

        // Since we know length is 2, we can safely assert these exist
        if (!firstEmail || !secondEmail) {
            return emails.map((e) => e.value);
        }

        const isFirstExpensify = firstEmail.value.toLowerCase().includes(CONST.EMAIL.EXPENSIFY_EMAIL_DOMAIN);
        const isSecondExpensify = secondEmail.value.toLowerCase().includes(CONST.EMAIL.EXPENSIFY_EMAIL_DOMAIN);

        if (!isFirstExpensify && isSecondExpensify) {
            return [secondEmail.value, firstEmail.value];
        }
        return [firstEmail.value, secondEmail.value];
    }

    // For larger arrays - preallocate arrays with capacity
    const result: Array<string | undefined> = new Array<string>(length);
    let expensifyIndex = 0;
    let otherIndex = length - 1;

    // Single pass to sort directly into result array
    for (let i = 0; i < length; i++) {
        const email = emails.at(i);
        if (!email) {
            // eslint-disable-next-line no-continue
            continue;
        }

        if (email.value.toLowerCase().includes(CONST.EMAIL.EXPENSIFY_EMAIL_DOMAIN)) {
            result[expensifyIndex] = email.value;
            expensifyIndex += 1;
        } else {
            result[otherIndex] = email.value;
            otherIndex -= 1;
        }
    }

    // If we have both types of emails, we need to fix the order of non-expensify emails
    if (expensifyIndex > 0 && expensifyIndex < length) {
        for (let i = expensifyIndex, j = length - 1; i < j; i++, j--) {
            const temp = result.at(i);
            const tempJ = result.at(j);

            if (temp === undefined || tempJ === undefined) {
                // eslint-disable-next-line no-continue
                continue;
            }

            result[i] = tempJ;
            result[j] = temp;
        }
    }

    // Filter out any undefined values and assert the type
    return result.filter((email): email is string => email !== undefined);
}

const processContact = (contact: ContactEntry, config: ProcessContactsConfig): OptionsListUtils.SearchOption<PersonalDetails> | null => {
    return OptionsListUtils.getUserToInviteContactOption({
        ...config,
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        searchValue: contact.email || contact.phone || contact.firstName || '',
        firstName: contact.firstName,
        lastName: contact.lastName,
        email: contact.email,
        phone: contact.phone,
        avatar: contact.avatar,
    });
};

const getContacts = (deviceContacts: DeviceContact[] | []): Array<OptionsListUtils.SearchOption<PersonalDetails>> => {
    return deviceContacts
        .map((contact) => {
            const email = sortEmailObjects(contact?.emailAddresses ?? [])?.at(0) ?? '';
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            const avatarSource = (contact?.imageData || getAvatarForContact(`${contact?.firstName}${email}${contact?.lastName}`)) ?? '';
            const phoneNumber = contact.phoneNumbers?.[0]?.value ?? '';
            const firstName = contact?.firstName ?? '';
            const lastName = contact?.lastName ?? '';

            return processContact(
                {
                    firstName,
                    lastName,
                    email,
                    phone: phoneNumber,
                    avatar: avatarSource,
                },
                {
                    selectedOptions: [],
                    optionsToExclude: [],
                },
            );
        })
        .filter((contact): contact is OptionsListUtils.SearchOption<PersonalDetails> => contact !== null);
};

export default getContacts;
