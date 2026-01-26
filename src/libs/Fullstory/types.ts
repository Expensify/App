import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';
import type {OnyxInputOrEntry, Report, UserMetadata} from '@src/types/onyx';

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

type GetChatFSClass = (report: OnyxInputOrEntry<Report>) => FSClass;

type ShouldInitialize = (userMetadata: UserMetadata, envName: string) => boolean;

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
     * Whether Fullstory should be initialized.
     */
    shouldInitialize: ShouldInitialize;

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

    /**
     * Returns the current FullStory session ID.
     */
    getSessionId: () => Promise<string | undefined>;

    /**
     * Returns the current FullStory session URL.
     */
    getSessionURL: () => Promise<string | undefined>;
};

/**
 * Use this type when you want your component to be able to be supplied a `fsClass`-like prop that it's going
 * to be used in its inner components.
 *
 * TS allows the `fsClass` prop to be used in any components, but the prop is only effective when passed directly to
 * core React Native components like `View`, `Text`, `Pressable`, etc.
 *
 * To solve this we have an ESLint rule that forbids the use of `fsClass` prop in all components expect those listed here,
 * and instructs the developer to use this type instead.
 *
 * @example
 * ```tsx
 * type CustomComponentProps = ForwardedFSClassProps & {
 *     title: string;
 * };
 *
 * function CustomComponent({title, forwardedFSClass}: CustomComponentProps) {
 *     return (
 *         <View fsClass={forwardedFSClass}>
 *             <Text>{title}</Text>
 *         </View>
 *     );
 * }
 *
 * // ...
 *
 * function Page() {
 *     return (
 *         <CustomComponent
 *             title={title}
 *             forwardedFSClass={CONST.FULLSTORY.CLASS.MASK}
 *         />
 *     );
 * }
 * ```
 */
type ForwardedFSClassProps = {
    /**
     * Used to pass down `fsClass` prop to inner components that will need it for Fullstory masking.
     */
    forwardedFSClass?: FSClass;
};

/**
 * Use this type when you want your component to be able to be supplied multiple `fsClass`-like props that are going
 * to be used in its inner components.
 *
 * TS allows the `fsClass` prop to be used in any components, but the prop is only effective when passed directly to
 * core React Native components like `View`, `Text`, `Pressable`, etc.
 *
 * To solve this we have an ESLint rule that forbids the use of `fsClass` prop in all components expect those listed here,
 * and instructs the developer to use this type instead.
 *
 * @example
 * ```tsx
 * type CustomComponentProps = MultipleFSClassProps<'headerFSClass' | 'contentFSClass'> & {
 *     title: string;
 * };
 *
 * function CustomComponent({title, headerFSClass, contentFSClass}: CustomComponentProps) {
 *     return (
 *         <View>
 *             <View fsClass={headerFSClass}>
 *                 <Text>Header</Text>
 *             </View>
 *             <View fsClass={contentFSClass}>
 *                 <Text>{title}</Text>
 *             </View>
 *         </View>
 *     );
 * }
 *
 * // ...
 *
 * function Page() {
 *     return (
 *         <CustomComponent
 *             title={title}
 *             headerFSClass={shouldMaskHeader()}
 *             contentFSClass={CONST.FULLSTORY.CLASS.MASK}
 *         />
 *     );
 * }
 * ```
 */
type MultipleFSClassProps<T extends `${string}FSClass`> =
    /**
     * Used to pass down multiple `fsClass` props to inner components that will need them for Fullstory masking.
     */
    Partial<Record<T, FSClass>>;

export type {FSPageLike, FSPageLikeConstructor, Fullstory, GetChatFSClass, PropertiesWithoutPageName, ForwardedFSClassProps, MultipleFSClassProps, ShouldInitialize};
