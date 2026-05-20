import type {OnyxEntry} from 'react-native-onyx';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import CONST from '@src/CONST';
import type {LoginList, PersonalDetails} from '@src/types/onyx';
import type {DeviceContact, StringHolder} from './ContactImport/types';
import type {SearchOption} from './OptionsListUtils';
import {getContactOption} from './PersonalDetailOptionsListUtils';
import type {OptionData} from './PersonalDetailOptionsListUtils';
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

function getContacts(
    deviceContacts: DeviceContact[] | [],
    localeCompare: LocaleContextProps['localeCompare'],
    formatPhoneNumber: LocaleContextProps['formatPhoneNumber'],
    countryCode: number,
    loginList: OnyxEntry<LoginList>,
): OptionData[] {
    return deviceContacts
        .map((contact) => {
            const email = sortEmailObjects(contact?.emailAddresses ?? [], localeCompare)?.at(0) ?? '';
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            const avatarSource = (contact?.imageData || RandomAvatarUtils.getAvatarForContact(`${contact?.firstName}${email}${contact?.lastName}`)) ?? '';
            const phoneNumber = contact.phoneNumbers?.[0]?.value ?? '';
            const firstName = contact?.firstName ?? '';
            const lastName = contact?.lastName ?? '';

            return getContactOption({
                searchValue: email || phoneNumber || firstName || '',
                firstName,
                lastName,
                email,
                phone: phoneNumber,
                avatar: avatarSource,
                countryCode,
                formatPhoneNumber,
                loginList,
            });
        })
        .filter((contact): contact is OptionData => contact !== null);
}

function extendPersonalDetailOption(option: OptionData): SearchOption<PersonalDetails> {
    const userDetails = {
        accountID: option.accountID,
        avatar: option.icons?.[0].source,
        displayName: option.text,
        login: option.login,
        pronouns: '',
        phoneNumber: option.phoneNumber,
        validated: true,
    };

    return {
        ...option,
        // eslint-disable-next-line rulesdir/no-default-id-values
        reportID: option.reportID ?? '',
        item: userDetails,
        participantsList: [userDetails],
        isDefaultRoom: false,
        isPinned: false,
        isChatRoom: false,
        shouldShowSubscript: false,
        isPolicyExpenseChat: false,
        lastMessageText: '',
        isBold: true,
    };
}

function getContactsExtended(
    deviceContacts: DeviceContact[] | [],
    localeCompare: LocaleContextProps['localeCompare'],
    formatPhoneNumber: LocaleContextProps['formatPhoneNumber'],
    countryCode: number,
    loginList: OnyxEntry<LoginList>,
): Array<SearchOption<PersonalDetails>> {
    const contactOptions = getContacts(deviceContacts, localeCompare, formatPhoneNumber, countryCode, loginList);
    return contactOptions.map(extendPersonalDetailOption);
}

export {getContacts, getContactsExtended, sortEmailObjects};
