import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';
import type {OnyxInputOrEntry, Report, UserMetadata} from '@src/types/onyx';

type FSClass = ValueOf<typeof CONST.FULLSTORY.CLASS>;

type PropertiesWithoutPageName = Record<string, unknown> & {pageName?: never};

/* eslint-disable @typescript-eslint/naming-convention -- FullStory schema uses external snake_case keys. */
type FullstoryUserVars = {
    user_type_path?: string;
    account_type?: 'personal' | 'business';
    user_status?: 'new' | 'returning';
    has_completed_onboarding?: boolean;
    onb_step?: 'registration' | 'accounting' | 'completed';
    user_role?: 'admin' | 'auditor' | 'member';
    workspace_state?: 'has_workspaces' | 'no_workspaces';
    workspace_count?: number;
    workspace_member_count?: number;
    free_trial_end_date?: string;
    days_till_trial_end?: number;
    free_trial_status?: 'active' | 'expiring_soon' | 'expired' | 'expired_last30days';
    plan_type?: 'collect' | 'control';
    paid_member?: boolean;
    auth_method?: 'email' | 'google' | 'apple';
    reg_method?: 'Google signup' | 'email/phone signup';
    login_status?: 'success' | 'failure';
};

type FullstoryEventPropertiesMap = {
    Page_viewed: {
        screen_name: string;
        entry_point?: string;
        onb_step?: FullstoryUserVars['onb_step'];
    };
    Component_viewed: {
        screen_name: string;
        location?: string;
        component_name?: string;
        onb_step?: FullstoryUserVars['onb_step'];
    };
    Component_closed: {
        screen_name: string;
        location?: string;
        component_name?: string;
        onb_step?: FullstoryUserVars['onb_step'];
    };
    clickable_action: {
        screen_name?: string;
        location?: string;
        component_name?: string;
        onb_step?: FullstoryUserVars['onb_step'];
        element_label?: string;
        checked_box?: boolean;
        // cspell:disable-next-line
        toggle_swith_on?: boolean;
        result_type?: string;
        action_status?: string;
        position?: number;
    };
    Input_field: {
        screen_name?: string;
        location?: string;
        component_name?: string;
        onb_step?: FullstoryUserVars['onb_step'];
        input_field_name?: string;
        input_field_type?: string;
        input_field_status?: string;
    };
    Error_message: {
        screen_name?: string;
        location?: string;
        component_name?: string;
        onb_step?: FullstoryUserVars['onb_step'];
        error_location?: string;
        error_code?: string;
        error_message?: string;
        error_type?: string;
    };
    Search_submitted: {
        screen_name?: string;
        result_type?: string;
        search_results_count?: number;
        search_type?: string;
    };
    Chat_opened: {
        screen_name?: string;
        chat_type?: 'Full-page chat' | 'side-panel chat';
    };
    Login_submitted: {
        action_status?: string;
    };
    sign_up: {
        entry_point?: string;
        action_status?: string;
    };
    File_upload_started: {
        upload_method?: string;
    };
    File_upload_completed: {
        upload_success?: boolean;
    };
    Concierge_message_sent: {
        has_attachment?: boolean;
        attachment_count?: number;
        attachment_types?: string;
        upload_method?: string;
    };
    Chatbot_response_received: {
        error_type?: string;
    };
    Expense_created: {
        expense_type?: string;
        expense_creation_method?: string;
        amount_range?: string;
    };
    Report_created: {
        expense_count?: number;
        report_type?: string;
    };
    Report_submitted: {
        expense_count?: number;
        report_type?: string;
        approver_count?: number;
    };
    Bank_account_added: {
        bank_account_type?: string;
        card_connection_method?: string;
        bank_region?: string;
    };
    Card_added: {
        card_connection_method?: string;
        card_type?: string;
        card_provider?: string;
        card_country?: string;
    };
};

type FullstoryEventName = keyof FullstoryEventPropertiesMap;
/* eslint-enable @typescript-eslint/naming-convention */

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

    /**
     * Sends a custom event to FullStory.
     */
    event: <TEventName extends FullstoryEventName>(eventName: TEventName, eventProperties?: FullstoryEventPropertiesMap[TEventName]) => void;

    /**
     * Sends a log message to FullStory with the specified log level.
     */
    log: (level: 'log' | 'info' | 'warn' | 'error', message: string) => void;

    /**
     * Updates user properties without re-identifying.
     */
    setUserVars: (userVars: FullstoryUserVars) => void;

    /**
     * Resets the idle timer to prevent session timeout.
     */
    resetIdleTimer: () => void;
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

export type {FSPageLike, Fullstory, FullstoryEventName, FullstoryEventPropertiesMap, FullstoryUserVars, GetChatFSClass, ForwardedFSClassProps, ShouldInitialize};
