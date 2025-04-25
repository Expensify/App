import type {HybridObject} from 'react-native-nitro-modules';

type StringHolder = {
    value: string;
};

const CONTACT_FIELDS = {
    FIRST_NAME: 'FIRST_NAME',
    LAST_NAME: 'LAST_NAME',
    PHONE_NUMBERS: 'PHONE_NUMBERS',
    EMAIL_ADDRESSES: 'EMAIL_ADDRESSES',
    IMAGE_DATA: 'IMAGE_DATA',
} as const;

type Contact = {
    firstName?: string;
    lastName?: string;
    middleName?: string;
    phoneNumbers?: StringHolder[];
    emailAddresses?: StringHolder[];
    imageData?: string;
    thumbnailImageData?: string;
};

type ContactFields = keyof typeof CONTACT_FIELDS;

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
interface ContactsModule extends HybridObject<{ios: 'swift'; android: 'kotlin'}> {
    getAll(keys: ContactFields[]): Promise<Contact[]>;
}

export {CONTACT_FIELDS};
export type {Contact, ContactFields, ContactsModule};
