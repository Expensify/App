import type {HybridObject} from 'react-native-nitro-modules';

type StringHolder = {
    value: string;
};

export const CONTACT_FIELDS = {
  FIRST_NAME: 'FIRST_NAME',
  LAST_NAME: 'LAST_NAME',
  PHONE_NUMBERS: 'PHONE_NUMBERS',
  EMAIL_ADDRESSES: 'EMAIL_ADDRESSES',
  IMAGE_DATA: 'IMAGE_DATA',
} as const;

export type Contact = {
    firstName?: string;
    lastName?: string;
    middleName?: string;
    phoneNumbers?: StringHolder[];
    emailAddresses?: StringHolder[];
    imageData?: string;
    thumbnailImageData?: string;
};
export type ContactFields = 'FIRST_NAME' | 'LAST_NAME' | 'MIDDLE_NAME' | 'PHONE_NUMBERS' | 'EMAIL_ADDRESSES' | 'IMAGE_DATA' | 'THUMBNAIL_IMAGE_DATA' | 'GIVEN_NAME_KEY';

export interface ContactsModule extends HybridObject<{ios: 'swift'; android: 'kotlin'}> {
    getAll(keys: ContactFields[]): Promise<Contact[]>;
}
