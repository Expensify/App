import type {HybridObject} from 'react-native-nitro-modules';

type StringHolder = {
    value: string;
};

//  Inline union types (keyof typeof CONTACT_FIELDS) are not supported by Nitrogen, so we extract the union to a separate type
//  and define the union type first as the single source of truth
type ContactFields = 'FIRST_NAME' | 'LAST_NAME' | 'PHONE_NUMBERS' | 'EMAIL_ADDRESSES' | 'IMAGE_DATA';

const CONTACT_FIELDS: Record<ContactFields, ContactFields> = {
    FIRST_NAME: 'FIRST_NAME',
    LAST_NAME: 'LAST_NAME',
    PHONE_NUMBERS: 'PHONE_NUMBERS',
    EMAIL_ADDRESSES: 'EMAIL_ADDRESSES',
    IMAGE_DATA: 'IMAGE_DATA',
};

type Contact = {
    firstName?: string;
    lastName?: string;
    phoneNumbers?: StringHolder[];
    emailAddresses?: StringHolder[];
    imageData?: string;
};

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
interface ContactsModule extends HybridObject<{ios: 'swift'; android: 'kotlin'}> {
    getAll(keys: ContactFields[]): Promise<Contact[]>;
}

export {CONTACT_FIELDS};
export type {Contact, ContactFields, ContactsModule};
