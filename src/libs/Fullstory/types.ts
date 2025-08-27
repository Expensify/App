import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';
import type {OnyxInputOrEntry, PersonalDetailsList, Report, UserMetadata} from '@src/types/onyx';

type FSClass = ValueOf<typeof CONST.FULLSTORY.CLASS>;

type PropertiesWithoutPageName = Record<string, unknown> & {pageName?: never};

/**
 * Represents the common FSPage class signature that will be used in both platform implementations.
 */
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
interface FSPageLike {
    start(properties?: PropertiesWithoutPageName): void;
}

/**
 * Represents the common FSPage constructor signature that will be used in both platform implementations.
 */
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
interface FSPageLikeConstructor {
    // eslint-disable-next-line @typescript-eslint/prefer-function-type
    new (name: string, properties: PropertiesWithoutPageName): FSPageLike;
}

type GetChatFSClass = (context: OnyxEntry<PersonalDetailsList>, report: OnyxInputOrEntry<Report>) => FSClass;

type Fullstory = {
    /**
     * Fullstory class used for page tracking.
     */
    Page: FSPageLikeConstructor;

    /**
     * Returns the correct fsClass value to be used in the report actions list.
     */
    getChatFSClass: GetChatFSClass;

    /**
     * Initializes Fullstory.
     */
    init: (userMetadata: OnyxEntry<UserMetadata>) => void;

    /**
     * Executes a function when the Fullstory library is ready, either by initialization or by observing the start event.
     */
    onReady: () => Promise<unknown>;

    /**
     * Sets the identity consent status using the Fullstory library.
     */
    consent: (shouldConsent: boolean) => void;

    /**
     * Sets the Fullstory user identity based on the provided metadata information.
     */
    identify: (userMetadata: UserMetadata, envName?: string) => void;

    /**
     * Initializes the Fullstory metadata with the provided metadata information.
     */
    consentAndIdentify: (userMetadata: OnyxEntry<UserMetadata>) => void;

    /**
     * Sets the identity as anonymous using the Fullstory library.
     */
    anonymize: () => void;
};

type ForwardedFSClassProps = {
    /**
     * Used to pass down `fsClass` prop to inner components that might need it for Fulstory masking.
     */
    forwardedFSClass?: FSClass;
};

export type {FSPageLike, FSPageLikeConstructor, Fullstory, GetChatFSClass, PropertiesWithoutPageName, ForwardedFSClassProps, FSClass};
