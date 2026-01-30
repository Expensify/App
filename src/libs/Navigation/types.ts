/* eslint-disable @typescript-eslint/naming-convention  */
import type {
    CommonActions,
    NavigationContainerRefWithCurrent,
    NavigationHelpers,
    NavigationState,
    NavigatorScreenParams,
    ParamListBase,
    PartialRoute,
    PartialState,
    Route,
} from '@react-navigation/native';
import type {TupleToUnion, ValueOf} from 'type-fest';
import type {UpperCaseCharacters} from 'type-fest/source/internal';
import type {SearchQueryString} from '@components/Search/types';
import type {ReplacementReason} from '@libs/actions/Card';
import type {IOURequestType} from '@libs/actions/IOU';
import type {SaveSearchParams} from '@libs/API/parameters';
import type {ReimbursementAccountStepToOpen} from '@libs/ReimbursementAccountUtils';
import type {AvatarSource} from '@libs/UserAvatarUtils';
import type {AttachmentModalContainerModalProps} from '@pages/media/AttachmentModalScreen/types';
import type CONST from '@src/CONST';
import type {Country, IOUAction, IOUType} from '@src/CONST';
import type NAVIGATORS from '@src/NAVIGATORS';
import type {Route as ExpensifyRoute, Route as Routes} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {CompanyCardFeedWithDomainID} from '@src/types/onyx';
import type {ConnectionName, SageIntacctMappingName} from '@src/types/onyx/Policy';
import type {CustomFieldType} from '@src/types/onyx/PolicyEmployee';
import type {FileObject} from '@src/types/utils/Attachment';
import type {SIDEBAR_TO_SPLIT} from './linkingConfig/RELATIONS';

type NavigationRef = NavigationContainerRefWithCurrent<RootNavigatorParamList>;

type NavigationRoot = NavigationHelpers<RootNavigatorParamList>;

type GoBackAction = Extract<CommonActions.Action, {type: 'GO_BACK'}>;
type ResetAction = Extract<CommonActions.Action, {type: 'RESET'}>;
type SetParamsAction = Extract<CommonActions.Action, {type: 'SET_PARAMS'}>;
type NavigateDeprecatedAction = Extract<CommonActions.Action, {type: 'NAVIGATE_DEPRECATED'}>;

type ActionNavigate = {
    type: ValueOf<typeof CONST.NAVIGATION.ACTION_TYPE>;
    payload: {
        name?: string;
        key?: string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        params?: any;
        path?: string;
        merge?: boolean;
    };
    source?: string;
    target?: string;
};

type StackNavigationAction = GoBackAction | ResetAction | SetParamsAction | ActionNavigate | NavigateDeprecatedAction | undefined;

type NavigationStateRoute = NavigationState['routes'][number];
type NavigationPartialRoute<TRouteName extends string = string> = PartialRoute<Route<TRouteName>>;
type StateOrRoute = NavigationState | NavigationStateRoute | NavigationPartialRoute;
type State<TParamList extends ParamListBase = ParamListBase> = NavigationState<TParamList> | PartialState<NavigationState<TParamList>>;
type NavigationRoute = NavigationStateRoute | NavigationPartialRoute;

type SplitNavigatorSidebarScreen = keyof typeof SIDEBAR_TO_SPLIT;

type SplitNavigatorParamList = {
    [NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR]: SettingsSplitNavigatorParamList;
    [NAVIGATORS.REPORTS_SPLIT_NAVIGATOR]: ReportsSplitNavigatorParamList;
    [NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR]: WorkspaceSplitNavigatorParamList;
    [NAVIGATORS.DOMAIN_SPLIT_NAVIGATOR]: DomainSplitNavigatorParamList;
};

type SplitNavigatorBySidebar<T extends SplitNavigatorSidebarScreen> = (typeof SIDEBAR_TO_SPLIT)[T];

type BackToParams = {
    // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
    backTo?: Routes;
};

type ConsoleNavigatorParamList = {
    [SCREENS.PUBLIC_CONSOLE_DEBUG]: {
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo: Routes;
    };
};

type ReportVerifyAccountNavigatorParamList = {
    [SCREENS.REPORT_VERIFY_ACCOUNT]: {
        reportID: string;
    };
    [SCREENS.EXPENSE_REPORT_VERIFY_ACCOUNT]: {
        reportID: string;
    };
};

type SettingsNavigatorParamList = {
    [SCREENS.SETTINGS.SHARE_CODE]: undefined;
    [SCREENS.SETTINGS.PROFILE.PRONOUNS]: undefined;
    [SCREENS.SETTINGS.PROFILE.DISPLAY_NAME]: undefined;
    [SCREENS.SETTINGS.PROFILE.TIMEZONE]: undefined;
    [SCREENS.SETTINGS.PROFILE.TIMEZONE_SELECT]: undefined;
    [SCREENS.SETTINGS.PROFILE.LEGAL_NAME]: undefined;
    [SCREENS.SETTINGS.PROFILE.DATE_OF_BIRTH]: undefined;
    [SCREENS.SETTINGS.PROFILE.ADDRESS]: {
        country?: Country | '';
    };
    [SCREENS.SETTINGS.PROFILE.ADDRESS_COUNTRY]: {
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
        country: string;
    };
    [SCREENS.SETTINGS.PROFILE.CONTACT_METHODS]: {
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo: Routes;
    };
    [SCREENS.SETTINGS.PROFILE.CONTACT_METHOD_DETAILS]: {
        contactMethod: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
        shouldSkipInitialValidation?: string;
    };
    [SCREENS.SETTINGS.PROFILE.NEW_CONTACT_METHOD]: {
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.SETTINGS.PROFILE.NEW_CONTACT_METHOD_CONFIRM_MAGIC_CODE]: {
        newContactMethod: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.SETTINGS.PROFILE.CONTACT_METHOD_VERIFY_ACCOUNT]: {
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
        forwardTo?: Routes;
    };
    [SCREENS.SETTINGS.PREFERENCES.PRIORITY_MODE]: undefined;
    [SCREENS.SETTINGS.PREFERENCES.PAYMENT_CURRENCY]: undefined;
    [SCREENS.SETTINGS.PREFERENCES.LANGUAGE]: undefined;
    [SCREENS.SETTINGS.PREFERENCES.THEME]: undefined;
    [SCREENS.SETTINGS.CLOSE]: undefined;
    [SCREENS.SETTINGS.MERGE_ACCOUNTS.ACCOUNT_DETAILS]: {
        email?: string;
    };
    [SCREENS.SETTINGS.MERGE_ACCOUNTS.ACCOUNT_VALIDATE]: {
        login: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
        forwardTo?: Routes;
    };
    [SCREENS.SETTINGS.MERGE_ACCOUNTS.MERGE_RESULT]: {
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
        result: ValueOf<typeof CONST.MERGE_ACCOUNT_RESULTS>;
        login: string;
    };
    [SCREENS.SETTINGS.LOCK.LOCK_ACCOUNT]: undefined;
    [SCREENS.SETTINGS.LOCK.UNLOCK_ACCOUNT]: undefined;
    [SCREENS.SETTINGS.LOCK.FAILED_TO_LOCK_ACCOUNT]: undefined;
    [SCREENS.SETTINGS.CONSOLE]: {
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo: Routes;
    };
    [SCREENS.SETTINGS.SHARE_LOG]: {
        /** URL of the generated file to share logs in a report */
        source: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo: Routes;
    };
    [SCREENS.SETTINGS.WALLET.CARDS_DIGITAL_DETAILS_UPDATE_ADDRESS]: undefined;
    [SCREENS.SETTINGS.WALLET.DOMAIN_CARD]: {
        /** cardID of selected card */
        cardID: string;
    };
    [SCREENS.SETTINGS.WALLET.PERSONAL_CARD_DETAILS]: {
        /** cardID of selected card */
        cardID: string;
    };
    [SCREENS.SETTINGS.WALLET.PERSONAL_CARD_EDIT_NAME]: {
        /** cardID of selected card */
        cardID: string;
    };
    [SCREENS.SETTINGS.WALLET.PERSONAL_CARD_EDIT_TRANSACTION_START_DATE]: {
        /** cardID of selected card */
        cardID: string;
    };
    [SCREENS.SETTINGS.WALLET.DOMAIN_CARD_CONFIRM_MAGIC_CODE]: {
        /** cardID of selected card */
        cardID: string;
    };
    [SCREENS.SETTINGS.WALLET.CARD_MISSING_DETAILS]: {
        /** cardID of selected card */
        cardID: string;
    };
    [SCREENS.SETTINGS.WALLET.CARD_MISSING_DETAILS_CONFIRM_MAGIC_CODE]: {
        /** cardID of selected card */
        cardID: string;
    };
    [SCREENS.SETTINGS.WALLET.REPORT_VIRTUAL_CARD_FRAUD]: {
        /** cardID of selected card */
        cardID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.SETTINGS.WALLET.REPORT_VIRTUAL_CARD_FRAUD_CONFIRMATION]: {
        /** cardID of selected card */
        cardID: string;
    };
    [SCREENS.SETTINGS.WALLET.CARD_ACTIVATE]: {
        /** cardID of selected card */
        cardID: string;
    };
    [SCREENS.WORKSPACE.WORKFLOWS_PAYER]: {
        policyID: string;
    };
    [SCREENS.SETTINGS.WALLET.VERIFY_ACCOUNT]: undefined;
    [SCREENS.SETTINGS.WALLET.TRANSFER_BALANCE]: undefined;
    [SCREENS.SETTINGS.WALLET.CHOOSE_TRANSFER_ACCOUNT]: undefined;
    [SCREENS.SETTINGS.WALLET.ENABLE_PAYMENTS]: undefined;
    [SCREENS.SETTINGS.WALLET.UNSHARE_BANK_ACCOUNT]: {
        bankAccountID: string;
    };
    [SCREENS.SETTINGS.WALLET.ENABLE_GLOBAL_REIMBURSEMENTS]: {
        bankAccountID: string;
    };
    [SCREENS.SETTINGS.WALLET.SHARE_BANK_ACCOUNT]: {
        bankAccountID: string;
    };
    [SCREENS.SETTINGS.ADD_DEBIT_CARD]: undefined;
    [SCREENS.SETTINGS.ADD_BANK_ACCOUNT]: undefined;
    [SCREENS.SETTINGS.ADD_BANK_ACCOUNT_VERIFY_ACCOUNT]: {
        // TODO will be removed once dynamic routes are implemented https://github.com/Expensify/App/issues/73825
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.SETTINGS.ADD_US_BANK_ACCOUNT]: undefined;
    [SCREENS.SETTINGS.ADD_US_BANK_ACCOUNT_ENTRY_POINT]: undefined;
    [SCREENS.SETTINGS.ADD_BANK_ACCOUNT_SELECT_COUNTRY_VERIFY_ACCOUNT]: undefined;
    [SCREENS.SETTINGS.RULES.ADD]: undefined;
    [SCREENS.SETTINGS.RULES.ADD_MERCHANT]: undefined;
    [SCREENS.SETTINGS.RULES.ADD_RENAME_MERCHANT]: undefined;
    [SCREENS.SETTINGS.RULES.ADD_CATEGORY]: undefined;
    [SCREENS.SETTINGS.RULES.ADD_TAG]: undefined;
    [SCREENS.SETTINGS.RULES.ADD_TAX]: undefined;
    [SCREENS.SETTINGS.RULES.ADD_DESCRIPTION]: undefined;
    [SCREENS.SETTINGS.RULES.ADD_REIMBURSABLE]: undefined;
    [SCREENS.SETTINGS.RULES.ADD_BILLABLE]: undefined;
    [SCREENS.SETTINGS.RULES.ADD_REPORT]: undefined;
    [SCREENS.SETTINGS.RULES.EDIT]: {
        hash: string;
        field?: ValueOf<typeof CONST.EXPENSE_RULES.FIELDS>;
    };
    [SCREENS.SETTINGS.RULES.EDIT_MERCHANT]: {
        hash: string;
    };
    [SCREENS.SETTINGS.RULES.EDIT_RENAME_MERCHANT]: {
        hash: string;
    };
    [SCREENS.SETTINGS.RULES.EDIT_CATEGORY]: {
        hash: string;
    };
    [SCREENS.SETTINGS.RULES.EDIT_TAG]: {
        hash: string;
    };
    [SCREENS.SETTINGS.RULES.EDIT_TAX]: {
        hash: string;
    };
    [SCREENS.SETTINGS.RULES.EDIT_DESCRIPTION]: {
        hash: string;
    };
    [SCREENS.SETTINGS.RULES.EDIT_REIMBURSABLE]: {
        hash: string;
    };
    [SCREENS.SETTINGS.RULES.EDIT_BILLABLE]: {
        hash: string;
    };
    [SCREENS.SETTINGS.RULES.EDIT_REPORT]: {
        hash: string;
    };
    [SCREENS.SETTINGS.PROFILE.STATUS]: undefined;
    [SCREENS.SETTINGS.PROFILE.STATUS_CLEAR_AFTER]: undefined;
    [SCREENS.SETTINGS.PROFILE.STATUS_CLEAR_AFTER_DATE]: undefined;
    [SCREENS.SETTINGS.PROFILE.STATUS_CLEAR_AFTER_TIME]: undefined;
    [SCREENS.SETTINGS.PROFILE.VACATION_DELEGATE]: undefined;
    [SCREENS.WORKSPACE.CURRENCY]: {
        isForcedToChangeCurrency?: boolean;
    };
    [SCREENS.WORKSPACE.ADDRESS]: {
        policyID: string;
        country?: Country | '';
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.NAME]: undefined;
    [SCREENS.WORKSPACE.DESCRIPTION]: undefined;
    [SCREENS.WORKSPACE.SHARE]: undefined;
    [SCREENS.WORKSPACE.INVITE]: {
        policyID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.MEMBERS_IMPORT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.MEMBERS_IMPORTED]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.MEMBERS_IMPORTED_CONFIRMATION]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.INVITE_MESSAGE]: {
        policyID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.INVITE_MESSAGE_ROLE]: {
        policyID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.CATEGORY_CREATE]: {
        policyID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.SETTINGS_CATEGORIES.SETTINGS_CATEGORY_CREATE]: {
        policyID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.CATEGORY_EDIT]: {
        policyID: string;
        categoryName: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.SETTINGS_CATEGORIES.SETTINGS_CATEGORY_EDIT]: {
        policyID: string;
        categoryName: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.CATEGORY_PAYROLL_CODE]: {
        policyID: string;
        categoryName: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.SETTINGS_CATEGORIES.SETTINGS_CATEGORY_PAYROLL_CODE]: {
        policyID: string;
        categoryName: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.CATEGORY_GL_CODE]: {
        policyID: string;
        categoryName: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.SETTINGS_CATEGORIES.SETTINGS_CATEGORY_GL_CODE]: {
        policyID: string;
        categoryName: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.CATEGORY_DEFAULT_TAX_RATE]: {
        policyID: string;
        categoryName: string;
    };
    [SCREENS.WORKSPACE.CATEGORY_FLAG_AMOUNTS_OVER]: {
        policyID: string;
        categoryName: string;
    };
    [SCREENS.WORKSPACE.CATEGORY_DESCRIPTION_HINT]: {
        policyID: string;
        categoryName: string;
    };
    [SCREENS.WORKSPACE.CATEGORY_APPROVER]: {
        policyID: string;
        categoryName: string;
    };
    [SCREENS.WORKSPACE.CATEGORY_REQUIRE_RECEIPTS_OVER]: {
        policyID: string;
        categoryName: string;
    };
    [SCREENS.WORKSPACE.CATEGORY_REQUIRE_ITEMIZED_RECEIPTS_OVER]: {
        policyID: string;
        categoryName: string;
    };
    [SCREENS.WORKSPACE.CATEGORY_SETTINGS]: {
        policyID: string;
        categoryName: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.SETTINGS_CATEGORIES.SETTINGS_CATEGORY_SETTINGS]: {
        policyID: string;
        categoryName: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.CATEGORY_REQUIRED_FIELDS]: {
        policyID: string;
        categoryName: string;
    };
    [SCREENS.WORKSPACE.UPGRADE]: {
        policyID?: string;
        featureName?: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
        categoryId?: string;
    };
    [SCREENS.WORKSPACE.DOWNGRADE]: {
        policyID?: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.PAY_AND_DOWNGRADE]: {
        policyID?: string;
    };
    [SCREENS.WORKSPACE.CATEGORIES_SETTINGS]: {
        policyID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.SETTINGS_CATEGORIES.SETTINGS_CATEGORIES_SETTINGS]: {
        policyID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.CATEGORIES_IMPORT]: {
        policyID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.SETTINGS_CATEGORIES.SETTINGS_CATEGORIES_IMPORT]: {
        policyID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.CATEGORIES_IMPORTED]: {
        policyID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.SETTINGS_CATEGORIES.SETTINGS_CATEGORIES_IMPORTED]: {
        policyID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.TAG_CREATE]: {
        policyID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.SETTINGS_TAGS.SETTINGS_TAG_CREATE]: {
        policyID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.DISTANCE_RATE_DETAILS]: {
        policyID: string;
        rateID: string;
    };
    [SCREENS.WORKSPACE.DISTANCE_RATE_EDIT]: {
        policyID: string;
        rateID: string;
    };
    [SCREENS.WORKSPACE.DISTANCE_RATE_NAME_EDIT]: {
        policyID: string;
        rateID: string;
    };
    [SCREENS.WORKSPACE.DISTANCE_RATE_TAX_RECLAIMABLE_ON_EDIT]: {
        policyID: string;
        rateID: string;
    };
    [SCREENS.WORKSPACE.DISTANCE_RATE_TAX_RATE_EDIT]: {
        policyID: string;
        rateID: string;
    };
    [SCREENS.WORKSPACE.TAGS_SETTINGS]: {
        policyID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.SETTINGS_TAGS.SETTINGS_TAGS_SETTINGS]: {
        policyID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.TAGS_IMPORT]: {
        policyID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.SETTINGS_TAGS.SETTINGS_TAGS_IMPORT]: {
        policyID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.TAGS_IMPORT_OPTIONS]: {
        policyID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.TAGS_IMPORT_MULTI_LEVEL_SETTINGS]: {
        policyID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.TAGS_IMPORTED]: {
        policyID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.SETTINGS_TAGS.SETTINGS_TAGS_IMPORTED]: {
        policyID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.TAGS_IMPORTED_MULTI_LEVEL]: {
        policyID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.TAG_SETTINGS]: {
        policyID: string;
        orderWeight: number;
        tagName: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
        parentTagsFilter?: string;
    };
    [SCREENS.SETTINGS_TAGS.SETTINGS_TAG_SETTINGS]: {
        policyID: string;
        orderWeight: number;
        tagName: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
        parentTagsFilter?: string;
    };
    [SCREENS.WORKSPACE.TAG_LIST_VIEW]: {
        policyID: string;
        orderWeight: number;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.SETTINGS_TAGS.SETTINGS_TAG_LIST_VIEW]: {
        policyID: string;
        orderWeight: number;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.TAGS_EDIT]: {
        policyID: string;
        orderWeight: number;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.SETTINGS_TAGS.SETTINGS_TAGS_EDIT]: {
        policyID: string;
        orderWeight: number;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.TAG_EDIT]: {
        policyID: string;
        orderWeight: number;
        tagName: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.SETTINGS_TAGS.SETTINGS_TAG_EDIT]: {
        policyID: string;
        orderWeight: number;
        tagName: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.TAG_APPROVER]: {
        policyID: string;
        orderWeight: number;
        tagName: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.SETTINGS_TAGS.SETTINGS_TAG_APPROVER]: {
        policyID: string;
        orderWeight: number;
        tagName: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.TAG_GL_CODE]: {
        policyID: string;
        orderWeight: number;
        tagName: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.SETTINGS_TAGS.SETTINGS_TAG_GL_CODE]: {
        policyID: string;
        orderWeight: number;
        tagName: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.SETTINGS.SUBSCRIPTION.SIZE]: {
        canChangeSize: 0 | 1;
    };
    [SCREENS.SETTINGS.SUBSCRIPTION.SETTINGS_DETAILS]: undefined;
    [SCREENS.SETTINGS.SUBSCRIPTION.ADD_PAYMENT_CARD]: undefined;
    [SCREENS.SETTINGS.SUBSCRIPTION.CHANGE_BILLING_CURRENCY]: undefined;
    [SCREENS.SETTINGS.SUBSCRIPTION.CHANGE_PAYMENT_CURRENCY]: undefined;
    [SCREENS.WORKSPACE.TAXES_SETTINGS]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.TAXES_SETTINGS_CUSTOM_TAX_NAME]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.TAXES_SETTINGS_FOREIGN_CURRENCY_DEFAULT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.TAXES_SETTINGS_WORKSPACE_CURRENCY_DEFAULT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.REPORT_FIELDS_CREATE]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.REPORT_FIELDS_LIST_VALUES]: {
        policyID: string;
        reportFieldID?: string;
    };
    [SCREENS.WORKSPACE.REPORT_FIELDS_ADD_VALUE]: {
        policyID: string;
        reportFieldID?: string;
    };
    [SCREENS.WORKSPACE.REPORT_FIELDS_VALUE_SETTINGS]: {
        policyID: string;
        valueIndex: number;
        reportFieldID?: string;
    };
    [SCREENS.WORKSPACE.REPORT_FIELDS_EDIT_VALUE]: {
        policyID: string;
        valueIndex: number;
    };
    [SCREENS.WORKSPACE.REPORT_FIELDS_SETTINGS]: {
        policyID: string;
        reportFieldID: string;
    };
    [SCREENS.WORKSPACE.REPORT_FIELDS_EDIT_INITIAL_VALUE]: {
        policyID: string;
        reportFieldID: string;
    };
    [SCREENS.WORKSPACE.MEMBER_DETAILS]: {
        policyID: string;
        accountID: string;
    };
    [SCREENS.WORKSPACE.MEMBER_DETAILS_ROLE]: {
        policyID: string;
        accountID: string;
    };
    [SCREENS.WORKSPACE.MEMBER_CUSTOM_FIELD]: {
        policyID: string;
        accountID: string;
        customFieldType: CustomFieldType;
    };
    [SCREENS.WORKSPACE.OWNER_CHANGE_SUCCESS]: {
        policyID: string;
        accountID: number;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.OWNER_CHANGE_ERROR]: {
        policyID: string;
        accountID: number;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.OWNER_CHANGE_CHECK]: {
        policyID: string;
        accountID: number;
        error: ValueOf<typeof CONST.POLICY.OWNERSHIP_ERRORS>;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.CREATE_DISTANCE_RATE]: {
        policyID: string;
        transactionID?: string;
        reportID?: string;
    };
    [SCREENS.WORKSPACE.DISTANCE_RATES_SETTINGS]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_IMPORT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_CHART_OF_ACCOUNTS]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_LOCATIONS]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_CLASSES]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_CUSTOMERS]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_TAXES]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_EXPORT]: {
        policyID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_EXPORT_DATE_SELECT]: {
        policyID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_EXPORT_INVOICE_ACCOUNT_SELECT]: {
        policyID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_EXPORT_OUT_OF_POCKET_EXPENSES_ACCOUNT_SELECT]: {
        policyID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_EXPORT_OUT_OF_POCKET_EXPENSES]: {
        policyID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_EXPORT_OUT_OF_POCKET_EXPENSES_SELECT]: {
        policyID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_NON_REIMBURSABLE_DEFAULT_VENDOR_SELECT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_COMPANY_CARD_EXPENSE_ACCOUNT_SELECT]: {
        policyID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_COMPANY_CARD_EXPENSE_ACCOUNT]: {
        policyID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_COMPANY_CARD_EXPENSE_ACCOUNT_COMPANY_CARD_SELECT]: {
        policyID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_EXPORT_PREFERRED_EXPORTER]: {
        policyID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_COMPANY_CARD_EXPENSE_ACCOUNT_SELECT]: {
        policyID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_COMPANY_CARD_EXPENSE_ACCOUNT_COMPANY_CARD_SELECT]: {
        policyID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_DEFAULT_VENDOR_SELECT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_COMPANY_CARD_EXPENSE_ACCOUNT]: {
        policyID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_ADVANCED]: {
        policyID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_EXPORT_DATE_SELECT]: {
        policyID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_EXPORT_PREFERRED_EXPORTER]: {
        policyID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_EXPORT_OUT_OF_POCKET_EXPENSES_ACCOUNT_SELECT]: {
        policyID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_EXPORT_OUT_OF_POCKET_EXPENSES]: {
        policyID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_EXPORT_OUT_OF_POCKET_EXPENSES_SELECT]: {
        policyID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_EXPORT]: {
        policyID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_SETUP_MODAL]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_SETUP_REQUIRED_DEVICE_MODAL]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_IMPORT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_CHART_OF_ACCOUNTS]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_CLASSES]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_CLASSES_DISPLAYED_AS]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_CUSTOMERS]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_CUSTOMERS_DISPLAYED_AS]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_DESKTOP_ITEMS]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.XERO_IMPORT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.XERO_CHART_OF_ACCOUNTS]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.XERO_CUSTOMER]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.XERO_ORGANIZATION]: {
        policyID: string;
        organizationID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.XERO_TAXES]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.XERO_TRACKING_CATEGORIES]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.XERO_MAP_TRACKING_CATEGORY]: {
        policyID: string;
        categoryId: string;
        categoryName: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.XERO_EXPORT]: {
        policyID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.XERO_EXPORT_PURCHASE_BILL_DATE_SELECT]: {
        policyID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.XERO_ADVANCED]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.CLAIM_OFFER]: {
        policyID: string;
        integration: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.XERO_BILL_STATUS_SELECTOR]: {
        policyID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.XERO_EXPORT_BANK_ACCOUNT_SELECT]: {
        policyID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.XERO_INVOICE_ACCOUNT_SELECTOR]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.XERO_EXPORT_PREFERRED_EXPORTER_SELECT]: {
        policyID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.XERO_BILL_PAYMENT_ACCOUNT_SELECTOR]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_PREREQUISITES]: {
        policyID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.ENTER_SAGE_INTACCT_CREDENTIALS]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.EXISTING_SAGE_INTACCT_CONNECTIONS]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_ENTITY]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_SUBSIDIARY_SELECTOR]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_REUSE_EXISTING_CONNECTIONS]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_TOKEN_INPUT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_IMPORT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_IMPORT_CUSTOMERS_OR_PROJECTS]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_IMPORT_CUSTOMERS_OR_PROJECTS_SELECT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_IMPORT_MAPPING]: {
        policyID: string;
        importField: TupleToUnion<typeof CONST.NETSUITE_CONFIG.IMPORT_FIELDS>;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_IMPORT_CUSTOM_FIELD]: {
        policyID: string;
        importCustomField: TupleToUnion<typeof CONST.NETSUITE_CONFIG.IMPORT_CUSTOM_FIELDS>;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_IMPORT_CUSTOM_FIELD_VIEW]: {
        policyID: string;
        importCustomField: TupleToUnion<typeof CONST.NETSUITE_CONFIG.IMPORT_CUSTOM_FIELDS>;
        internalID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_IMPORT_CUSTOM_FIELD_EDIT]: {
        policyID: string;
        importCustomField: TupleToUnion<typeof CONST.NETSUITE_CONFIG.IMPORT_CUSTOM_FIELDS>;
        internalID: string;
        fieldName: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_IMPORT_CUSTOM_LIST_ADD]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_IMPORT_CUSTOM_SEGMENT_ADD]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_EXPORT]: {
        policyID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_PREFERRED_EXPORTER_SELECT]: {
        policyID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_DATE_SELECT]: {
        policyID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_EXPORT_EXPENSES]: {
        policyID: string;
        expenseType: ValueOf<typeof CONST.NETSUITE_EXPENSE_TYPE>;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_EXPORT_EXPENSES_DESTINATION_SELECT]: {
        policyID: string;
        expenseType: ValueOf<typeof CONST.NETSUITE_EXPENSE_TYPE>;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_EXPORT_EXPENSES_VENDOR_SELECT]: {
        policyID: string;
        expenseType: ValueOf<typeof CONST.NETSUITE_EXPENSE_TYPE>;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_EXPORT_EXPENSES_PAYABLE_ACCOUNT_SELECT]: {
        policyID: string;
        expenseType: ValueOf<typeof CONST.NETSUITE_EXPENSE_TYPE>;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_EXPORT_EXPENSES_JOURNAL_POSTING_PREFERENCE_SELECT]: {
        policyID: string;
        expenseType: ValueOf<typeof CONST.NETSUITE_EXPENSE_TYPE>;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_RECEIVABLE_ACCOUNT_SELECT]: {
        policyID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_INVOICE_ITEM_PREFERENCE_SELECT]: {
        policyID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_INVOICE_ITEM_SELECT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_TAX_POSTING_ACCOUNT_SELECT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_PROVINCIAL_TAX_POSTING_ACCOUNT_SELECT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_ADVANCED]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_REIMBURSEMENT_ACCOUNT_SELECT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_COLLECTION_ACCOUNT_SELECT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_EXPENSE_REPORT_APPROVAL_LEVEL_SELECT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_VENDOR_BILL_APPROVAL_LEVEL_SELECT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_JOURNAL_ENTRY_APPROVAL_LEVEL_SELECT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_APPROVAL_ACCOUNT_SELECT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_CUSTOM_FORM_ID]: {
        policyID: string;
        expenseType: ValueOf<typeof CONST.NETSUITE_EXPENSE_TYPE>;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_IMPORT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_TOGGLE_MAPPING]: {
        policyID: string;
        mapping: SageIntacctMappingName;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_MAPPING_TYPE]: {
        policyID: string;
        mapping: SageIntacctMappingName;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_IMPORT_TAX]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_ADD_USER_DIMENSION]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_USER_DIMENSIONS]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_EDIT_USER_DIMENSION]: {
        policyID: string;
        dimensionName: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_EXPORT]: {
        policyID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_PREFERRED_EXPORTER]: {
        policyID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_EXPORT_DATE]: {
        policyID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_REIMBURSABLE_EXPENSES]: {
        policyID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSES]: {
        policyID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_REIMBURSABLE_DESTINATION]: {
        policyID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_NON_REIMBURSABLE_DESTINATION]: {
        policyID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_DEFAULT_VENDOR]: {
        policyID: string;
        reimbursable: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_NON_REIMBURSABLE_CREDIT_CARD_ACCOUNT]: {
        policyID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_ADVANCED]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_PAYMENT_ACCOUNT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.CARD_RECONCILIATION]: {
        policyID: string;
        connection: ValueOf<typeof CONST.POLICY.CONNECTIONS.ROUTE>;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.RECONCILIATION_ACCOUNT_SETTINGS]: {
        policyID: string;
        connection: ValueOf<typeof CONST.POLICY.CONNECTIONS.ROUTE>;
    };
    [SCREENS.TWO_FACTOR_AUTH.DISABLED]: undefined;
    [SCREENS.TWO_FACTOR_AUTH.DISABLE]: undefined;
    [SCREENS.SETTINGS.DELEGATE.VERIFY_ACCOUNT]: undefined;
    [SCREENS.SETTINGS.DELEGATE.ADD_DELEGATE]: undefined;
    [SCREENS.SETTINGS.DELEGATE.DELEGATE_ROLE]: {
        login: string;
        role?: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.SETTINGS.DELEGATE.UPDATE_DELEGATE_ROLE]: {
        login: string;
        currentRole: string;
    };
    [SCREENS.SETTINGS.DELEGATE.UPDATE_DELEGATE_ROLE_CONFIRM_MAGIC_CODE]: {
        login: string;
        currentRole: string;
        newRole: string;
    };
    [SCREENS.SETTINGS.DELEGATE.DELEGATE_CONFIRM]: {
        login: string;
        role: string;
    };
    [SCREENS.SETTINGS.DELEGATE.DELEGATE_CONFIRM_MAGIC_CODE]: {
        login: string;
        role: string;
    };
    [SCREENS.SETTINGS.REPORT_CARD_LOST_OR_DAMAGED]: {
        /** cardID of selected card */
        cardID: string;
    };
    [SCREENS.SETTINGS.REPORT_CARD_LOST_OR_DAMAGED_CONFIRM_MAGIC_CODE]: {
        /** cardID of selected card */
        cardID: string;

        /** Reason for replacing the card */
        reason: ReplacementReason;
    };
    [SCREENS.KEYBOARD_SHORTCUTS]: {
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo: Routes;
    };
    [SCREENS.SETTINGS.EXIT_SURVEY.REASON]: {
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo: Routes;
    };
    [SCREENS.SETTINGS.EXIT_SURVEY.CONFIRM]: {
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo: Routes;
    };
    [SCREENS.WORKSPACE.TAX_CREATE]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.TAX_EDIT]: {
        policyID: string;
        taxID: string;
    };
    [SCREENS.WORKSPACE.TAX_NAME]: {
        policyID: string;
        taxID: string;
    };
    [SCREENS.WORKSPACE.TAX_VALUE]: {
        policyID: string;
        taxID: string;
    };
    [SCREENS.WORKSPACE.TAX_CODE]: {
        policyID: string;
        taxID: string;
    };
    [SCREENS.WORKSPACE.INVOICES_VERIFY_ACCOUNT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.INVOICES_COMPANY_NAME]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.INVOICES_COMPANY_WEBSITE]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.COMPANY_CARDS_SELECT_FEED]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.COMPANY_CARDS_BANK_CONNECTION]: {
        policyID: string;
        feed: CompanyCardFeedWithDomainID;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo: Routes;
    };
    [SCREENS.WORKSPACE.COMPANY_CARD_DETAILS]: {
        policyID: string;
        feed: CompanyCardFeedWithDomainID;
        cardID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.COMPANY_CARD_EDIT_CARD_NAME]: {
        policyID: string;
        feed: CompanyCardFeedWithDomainID;
        cardID: string;
    };
    [SCREENS.WORKSPACE.COMPANY_CARD_EDIT_TRANSACTION_START_DATE]: {
        policyID: string;
        feed: string;
        cardID: string;
    };
    [SCREENS.WORKSPACE.COMPANY_CARD_EXPORT]: {
        policyID: string;
        cardID: string;
        feed: CompanyCardFeedWithDomainID;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.EXPENSIFY_CARD_ISSUE_NEW]: {
        policyID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.EXPENSIFY_CARD_ISSUE_NEW_CONFIRM_MAGIC_CODE]: {
        policyID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.EXPENSIFY_CARD_BANK_ACCOUNT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.EXPENSIFY_CARD_SETTINGS]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.EXPENSIFY_CARD_SETTINGS_ACCOUNT]: {
        policyID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.EXPENSIFY_CARD_SETTINGS_FREQUENCY]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.TRAVEL_SETTINGS_ACCOUNT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.COMPANY_CARDS_SETTINGS]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.COMPANY_CARDS_BROKEN_CARD_FEED_CONNECTION]: {
        policyID: string;
        feed: CompanyCardFeedWithDomainID;

        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.COMPANY_CARDS_ASSIGN_CARD_ASSIGNEE]: {
        policyID: string;
        feed: CompanyCardFeedWithDomainID;
        cardID: string;

        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.COMPANY_CARDS_ASSIGN_CARD_CARD_SELECTION]: {
        policyID: string;
        feed: CompanyCardFeedWithDomainID;
        cardID: string;
    };
    [SCREENS.WORKSPACE.COMPANY_CARDS_ASSIGN_CARD_TRANSACTION_START_DATE]: {
        policyID: string;
        feed: CompanyCardFeedWithDomainID;
        cardID: string;
    };
    [SCREENS.WORKSPACE.COMPANY_CARDS_ASSIGN_CARD_CARD_NAME]: {
        policyID: string;
        feed: CompanyCardFeedWithDomainID;
        cardID: string;
    };
    [SCREENS.WORKSPACE.COMPANY_CARDS_ASSIGN_CARD_CONFIRMATION]: {
        policyID: string;
        feed: CompanyCardFeedWithDomainID;
        cardID: string;

        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.COMPANY_CARDS_ASSIGN_CARD_INVITE_NEW_MEMBER]: {
        policyID: string;
        feed: CompanyCardFeedWithDomainID;
        cardID: string;
    };
    [SCREENS.WORKSPACE.COMPANY_CARDS_SETTINGS_FEED_NAME]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.COMPANY_CARDS_SETTINGS_STATEMENT_CLOSE_DATE]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.EXPENSIFY_CARD_DETAILS]: {
        policyID: string;
        cardID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.EXPENSIFY_CARD_NAME]: {
        policyID: string;
        cardID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.EXPENSIFY_CARD_LIMIT]: {
        policyID: string;
        cardID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.EXPENSIFY_CARD_LIMIT_TYPE]: {
        policyID: string;
        cardID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.EXPENSIFY_CARD.EXPENSIFY_CARD_DETAILS]: {
        policyID: string;
        cardID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.EXPENSIFY_CARD.EXPENSIFY_CARD_NAME]: {
        policyID: string;
        cardID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.EXPENSIFY_CARD.EXPENSIFY_CARD_LIMIT]: {
        policyID: string;
        cardID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.EXPENSIFY_CARD.EXPENSIFY_CARD_LIMIT_TYPE]: {
        policyID: string;
        cardID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.REPORTS_DEFAULT_TITLE]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.RULES_AUTO_APPROVE_REPORTS_UNDER]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.RULES_RANDOM_REPORT_AUDIT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.RULES_AUTO_PAY_REPORTS_UNDER]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.RULES_RECEIPT_REQUIRED_AMOUNT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.RULES_ITEMIZED_RECEIPT_REQUIRED_AMOUNT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.RULES_MAX_EXPENSE_AMOUNT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.RULES_MAX_EXPENSE_AGE]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.RULES_BILLABLE_DEFAULT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.RULES_REIMBURSABLE_DEFAULT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.RULES_PROHIBITED_DEFAULT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.RULES_CUSTOM]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.RULES_MERCHANT_NEW]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.RULES_MERCHANT_MERCHANT_TO_MATCH]: {
        policyID: string;
        ruleID: string;
    };
    [SCREENS.WORKSPACE.RULES_MERCHANT_MATCH_TYPE]: {
        policyID: string;
        ruleID: string;
    };
    [SCREENS.WORKSPACE.RULES_MERCHANT_MERCHANT]: {
        policyID: string;
        ruleID: string;
    };
    [SCREENS.WORKSPACE.RULES_MERCHANT_CATEGORY]: {
        policyID: string;
        ruleID: string;
    };
    [SCREENS.WORKSPACE.RULES_MERCHANT_TAG]: {
        policyID: string;
        ruleID: string;
    };
    [SCREENS.WORKSPACE.RULES_MERCHANT_TAX]: {
        policyID: string;
        ruleID: string;
    };
    [SCREENS.WORKSPACE.RULES_MERCHANT_DESCRIPTION]: {
        policyID: string;
        ruleID: string;
    };
    [SCREENS.WORKSPACE.RULES_MERCHANT_REIMBURSABLE]: {
        policyID: string;
        ruleID: string;
    };
    [SCREENS.WORKSPACE.RULES_MERCHANT_BILLABLE]: {
        policyID: string;
        ruleID: string;
    };
    [SCREENS.WORKSPACE.RULES_MERCHANT_EDIT]: {
        policyID: string;
        ruleID: string;
    };
    [SCREENS.WORKSPACE.RULES_MERCHANT_PREVIEW_MATCHES]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.PER_DIEM_IMPORT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.PER_DIEM_IMPORTED]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.PER_DIEM_SETTINGS]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.PER_DIEM_DETAILS]: {
        policyID: string;
        rateID: string;
        subRateID: string;
    };
    [SCREENS.WORKSPACE.PER_DIEM_EDIT_DESTINATION]: {
        policyID: string;
        rateID: string;
        subRateID: string;
    };
    [SCREENS.WORKSPACE.PER_DIEM_EDIT_SUBRATE]: {
        policyID: string;
        rateID: string;
        subRateID: string;
    };
    [SCREENS.WORKSPACE.PER_DIEM_EDIT_AMOUNT]: {
        policyID: string;
        rateID: string;
        subRateID: string;
    };
    [SCREENS.WORKSPACE.PER_DIEM_EDIT_CURRENCY]: {
        policyID: string;
        rateID: string;
        subRateID: string;
    };
    [SCREENS.WORKSPACE.TIME_TRACKING_DEFAULT_RATE]: {
        policyID: string;
    };
    [SCREENS.DOMAIN.VERIFY]: {
        domainAccountID: number;
    };
    [SCREENS.DOMAIN.VERIFIED]: {
        domainAccountID: number;
    };
    [SCREENS.DOMAIN.ADMIN_DETAILS]: {
        domainAccountID: number;
        accountID: number;
    };
    [SCREENS.DOMAIN.ADMINS_SETTINGS]: {
        domainAccountID: number;
    };
    [SCREENS.DOMAIN.ADD_PRIMARY_CONTACT]: {
        domainAccountID: number;
    };
    [SCREENS.DOMAIN.ADD_ADMIN]: {
        domainAccountID: number;
    };
    [SCREENS.DOMAIN.MEMBER_DETAILS]: {
        domainAccountID: number;
        accountID: number;
    };
    [SCREENS.DOMAIN.ADD_MEMBER]: {
        domainAccountID: number;
    };
} & ReimbursementAccountNavigatorParamList;

type DomainCardNavigatorParamList = {
    [SCREENS.DOMAIN_CARD.DOMAIN_CARD_DETAIL]: {
        cardID: string;
    };
    [SCREENS.DOMAIN_CARD.DOMAIN_CARD_REPORT_FRAUD]: {
        cardID: string;
    };
    [SCREENS.DOMAIN_CARD.DOMAIN_CARD_CONFIRM_MAGIC_CODE]: {
        cardID: string;
    };
};

type TwoFactorAuthNavigatorParamList = {
    [SCREENS.TWO_FACTOR_AUTH.ROOT]: {
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
        forwardTo?: string;
    };
    [SCREENS.TWO_FACTOR_AUTH.VERIFY_ACCOUNT]: {
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
        forwardTo?: Routes;
    };
    [SCREENS.TWO_FACTOR_AUTH.VERIFY]: {
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
        forwardTo?: string;
    };
    [SCREENS.TWO_FACTOR_AUTH.SUCCESS]: {
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
        forwardTo?: string;
    };
    [SCREENS.TWO_FACTOR_AUTH.DISABLE]: undefined;
    [SCREENS.TWO_FACTOR_AUTH.DISABLED]: undefined;
};

type NewChatNavigatorParamList = {
    [SCREENS.NEW_CHAT.ROOT]: undefined;
    [SCREENS.NEW_CHAT.NEW_CHAT_CONFIRM]: undefined;
    [SCREENS.NEW_CHAT.NEW_CHAT_EDIT_NAME]: undefined;
};

type DetailsNavigatorParamList = {
    [SCREENS.DETAILS_ROOT]: {
        login: string;
        reportID: string;
    };
};

type ProfileNavigatorParamList = {
    [SCREENS.PROFILE_ROOT]: {
        accountID: string;
        reportID: string;
        login?: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo: Routes;
    };
};

type NewReportWorkspaceSelectionNavigatorParamList = {
    [SCREENS.NEW_REPORT_WORKSPACE_SELECTION.ROOT]: {
        isMovingExpenses?: boolean;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
};

type ReportDetailsNavigatorParamList = {
    [SCREENS.REPORT_DETAILS.ROOT]: {
        reportID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.REPORT_DETAILS.SHARE_CODE]: {
        reportID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.REPORT_DETAILS.EXPORT]: {
        reportID: string;
        policyID: string;
        connectionName: ConnectionName;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
};

type ReportCardActivateNavigatorParamList = {
    [SCREENS.REPORT_CARD_ACTIVATE]: {
        reportID: string;
        cardID: string;
        reportActionID?: string;
    };
};

type ReportChangeWorkspaceNavigatorParamList = {
    [SCREENS.REPORT_CHANGE_WORKSPACE.ROOT]: {
        reportID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
};

type ReportSettingsNavigatorParamList = {
    [SCREENS.REPORT_SETTINGS.ROOT]: {
        reportID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.REPORT_SETTINGS.NAME]: {
        reportID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.REPORT_SETTINGS.NOTIFICATION_PREFERENCES]: {
        reportID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.REPORT_SETTINGS.WRITE_CAPABILITY]: {
        reportID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.REPORT_SETTINGS.VISIBILITY]: {
        reportID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.REPORT_SETTINGS.REPORT_LAYOUT]: {
        reportID: string;
    };
};

type ReportDescriptionNavigatorParamList = {
    [SCREENS.REPORT_DESCRIPTION_ROOT]: {
        reportID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
};

type ParticipantsNavigatorParamList = {
    [SCREENS.REPORT_PARTICIPANTS.ROOT]: {
        reportID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.REPORT_PARTICIPANTS.INVITE]: {
        reportID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.REPORT_PARTICIPANTS.DETAILS]: {
        reportID: string;
        accountID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.REPORT_PARTICIPANTS.ROLE]: {
        reportID: string;
        accountID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
};

type RoomMembersNavigatorParamList = {
    [SCREENS.ROOM_MEMBERS.ROOT]: {
        reportID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.ROOM_MEMBERS.INVITE]: {
        reportID: string;
        role?: 'accountant';
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.ROOM_MEMBERS.DETAILS]: {
        reportID: string;
        accountID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
};

type MoneyRequestNavigatorParamList = {
    [SCREENS.MONEY_REQUEST.STEP_SEND_FROM]: {
        iouType: IOUType;
        transactionID: string;
        reportID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo: Routes;
    };
    [SCREENS.MONEY_REQUEST.EDIT_REPORT]: {
        action: IOUAction;
        iouType: IOUType;
        reportID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo: Routes;
        shouldTurnOffSelectionMode?: boolean;
    };
    [SCREENS.MONEY_REQUEST.STEP_REPORT]: {
        action: IOUAction;
        iouType: IOUType;
        transactionID: string;
        reportID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo: Routes;
        reportActionID?: string;
    };
    [SCREENS.MONEY_REQUEST.STEP_COMPANY_INFO]: {
        iouType: IOUType;
        transactionID: string;
        reportID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo: Routes;
    };
    [SCREENS.MONEY_REQUEST.STEP_PARTICIPANTS]: {
        action: IOUAction;
        iouType: Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND>;
        transactionID: string;
        reportID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo: Routes;
    };
    [SCREENS.MONEY_REQUEST.STEP_DATE]: {
        action: IOUAction;
        iouType: Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND>;
        transactionID: string;
        reportID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo: Routes;
        reportActionID?: string;
    };
    [SCREENS.MONEY_REQUEST.STEP_DESCRIPTION]: {
        action: IOUAction;
        iouType: Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND>;
        transactionID: string;
        reportID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo: Routes;
        reportActionID: string;
    };
    [SCREENS.MONEY_REQUEST.STEP_CATEGORY]: {
        action: IOUAction;
        iouType: Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND>;
        transactionID: string;
        reportActionID: string;
        reportID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo: Routes;
    };
    [SCREENS.MONEY_REQUEST.STEP_TAX_AMOUNT]: {
        action: IOUAction;
        iouType: Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND>;
        transactionID: string;
        reportID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo: Routes;
    };
    [SCREENS.MONEY_REQUEST.STEP_TAG]: {
        action: IOUAction;
        iouType: Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND>;
        transactionID: string;
        reportID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo: Routes;
        reportActionID: string;
        orderWeight: string;
    };
    [SCREENS.MONEY_REQUEST.STEP_TAX_RATE]: {
        action: IOUAction;
        iouType: Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND>;
        transactionID: string;
        reportID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo: Routes;
    };
    [SCREENS.MONEY_REQUEST.STEP_WAYPOINT]: {
        iouType: IOUType;
        reportID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo: Routes | undefined;
        action: IOUAction;
        pageIndex: string;
        transactionID: string;
    };
    [SCREENS.MONEY_REQUEST.STEP_MERCHANT]: {
        action: IOUAction;
        iouType: Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND>;
        transactionID: string;
        reportID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo: Routes;
        reportActionID?: string;
    };
    [SCREENS.IOU_SEND.ENABLE_PAYMENTS]: undefined;
    [SCREENS.IOU_SEND.ADD_BANK_ACCOUNT]: undefined;
    [SCREENS.IOU_SEND.ADD_DEBIT_CARD]: undefined;
    [SCREENS.MONEY_REQUEST.STEP_DISTANCE]: {
        action: IOUAction;
        iouType: IOUType;
        transactionID: string;
        reportID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo: Routes;
        backToReport?: string;
        reportActionID?: string;
    };
    [SCREENS.MONEY_REQUEST.STEP_DISTANCE_MAP]: {
        action: IOUAction;
        iouType: IOUType;
        transactionID: string;
        reportID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo: Routes;
        backToReport?: string;
        reportActionID?: string;
    };
    [SCREENS.MONEY_REQUEST.STEP_DISTANCE_MANUAL]: {
        action: IOUAction;
        iouType: IOUType;
        transactionID: string;
        reportID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo: Routes;
        backToReport?: string;
        reportActionID?: string;
    };
    [SCREENS.MONEY_REQUEST.STEP_DISTANCE_GPS]: {
        action: IOUAction;
        iouType: IOUType;
        transactionID: string;
        reportID: string;
        backToReport?: string;
        reportActionID?: string;
    };
    [SCREENS.MONEY_REQUEST.STEP_DISTANCE_ODOMETER]: {
        action: IOUAction;
        iouType: IOUType;
        transactionID: string;
        reportID: string;
        backToReport?: string;
        reportActionID?: string;
    };
    [SCREENS.MONEY_REQUEST.CREATE]: {
        iouType: IOUType;
        reportID: string;
        transactionID: string;

        // These are not used in the screen, but are needed for the navigation
        // for IOURequestStepDistance and IOURequestStepAmount components
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo: never;
        action: never;
        pageIndex?: string;
        backToReport?: string;
        reportActionID?: string;
    };
    [SCREENS.MONEY_REQUEST.START]: {
        iouType: IOUType;
        reportID: string;
        transactionID: string;
        iouRequestType: IOURequestType;
    };
    [SCREENS.MONEY_REQUEST.STEP_AMOUNT]: {
        iouType: IOUType;
        reportID: string;
        transactionID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo: Routes;
        action: IOUAction;
        pageIndex?: string;
        backToReport?: string;
        reportActionID?: string;
    };
    [SCREENS.MONEY_REQUEST.STEP_DISTANCE_RATE]: {
        action: IOUAction;
        iouType: ValueOf<typeof CONST.IOU.TYPE>;
        transactionID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo: Routes;
        reportID: string;
        reportActionID?: string;
    };
    [SCREENS.MONEY_REQUEST.STEP_CONFIRMATION]: {
        action: IOUAction;
        iouType: Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND>;
        transactionID: string;
        reportID: string;
        pageIndex?: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
        participantsAutoAssigned?: string;
        backToReport?: string;
    };
    [SCREENS.MONEY_REQUEST.STEP_CONFIRMATION_VERIFY_ACCOUNT]: {
        action: IOUAction;
        iouType: IOUType;
        transactionID: string;
        reportID: string;
    };
    [SCREENS.MONEY_REQUEST.STEP_SCAN]: {
        action: IOUAction;
        iouType: IOUType;
        transactionID: string;
        reportID: string;
        pageIndex: number;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo: Routes;
        backToReport?: string;
    };
    [SCREENS.MONEY_REQUEST.RECEIPT_VIEW]: {
        transactionID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo: Routes;
    };
    [SCREENS.MONEY_REQUEST.HOLD]: {
        /** ID of the transaction the page was opened for */
        transactionID: string;

        /** ID of the report that user is providing hold reason to */
        reportID: string;

        /** Link to previous page */
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo: ExpensifyRoute;

        /** Hash that includes info about what is searched for */
        searchHash?: number;
    };
    [SCREENS.MONEY_REQUEST.REJECT]: {
        /** ID of the transaction the page was opened for */
        transactionID: string;

        /** ID of the report that user is providing hold reason to */
        reportID: string;

        /** Link to previous page */
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo: ExpensifyRoute;
    };
    [SCREENS.MONEY_REQUEST.STEP_ATTENDEES]: {
        action: IOUAction;
        iouType: Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND>;
        transactionID: string;
        reportID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo: Routes;
    };
    [SCREENS.MONEY_REQUEST.STEP_ACCOUNTANT]: {
        action: IOUAction;
        iouType: Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND>;
        transactionID: string;
        reportID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo: Routes;
    };
    [SCREENS.MONEY_REQUEST.STEP_UPGRADE]: {
        action: IOUAction;
        iouType: Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND>;
        transactionID: string;
        reportID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo: Routes;
        upgradePath?: ValueOf<typeof CONST.UPGRADE_PATHS>;
        shouldSubmitExpense?: boolean;
    };
    [SCREENS.MONEY_REQUEST.STEP_DESTINATION]: {
        action: IOUAction;
        iouType: Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND>;
        transactionID: string;
        reportID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo: Routes | undefined;
    };
    [SCREENS.MONEY_REQUEST.STEP_TIME]: {
        action: IOUAction;
        iouType: Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND>;
        transactionID: string;
        reportID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo: Routes | undefined;
    };
    [SCREENS.MONEY_REQUEST.STEP_SUBRATE]: {
        iouType: Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND>;
        reportID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo: Routes | undefined;
        action: IOUAction;
        pageIndex: string;
        transactionID: string;
    };
    [SCREENS.MONEY_REQUEST.STEP_DESTINATION_EDIT]: {
        action: IOUAction;
        iouType: Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND>;
        transactionID: string;
        reportID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo: Routes | undefined;
    };
    [SCREENS.MONEY_REQUEST.STEP_TIME_EDIT]: {
        action: IOUAction;
        iouType: Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND>;
        transactionID: string;
        reportID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo: Routes | undefined;
    };
    [SCREENS.MONEY_REQUEST.STEP_SUBRATE_EDIT]: {
        iouType: Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND>;
        reportID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo: Routes | undefined;
        action: IOUAction;
        pageIndex: string;
        transactionID: string;
    };
    [SCREENS.MONEY_REQUEST.DISTANCE_CREATE]: {
        iouType: IOUType;
        reportID: string;
        transactionID: string;

        // These are not used in the screen, but are needed for the navigation
        // for IOURequestStepDistanceMap component
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo: never;
        action: never;
        pageIndex?: string;
        backToReport?: string;
        reportActionID?: string;
    };
    [SCREENS.SET_DEFAULT_WORKSPACE]: {
        navigateTo?: Routes;
    };
    [SCREENS.MONEY_REQUEST.STEP_TIME_RATE]: {
        action: IOUAction;
        iouType: Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND>;
        transactionID: string;
        reportID: string;
        reportActionID: string;
    };
    [SCREENS.MONEY_REQUEST.STEP_HOURS]: {
        action: IOUAction;
        iouType: Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND>;
        transactionID: string;
        reportID: string;
        reportActionID: string;
    };
    [SCREENS.MONEY_REQUEST.STEP_HOURS_EDIT]: {
        action: IOUAction;
        iouType: Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND>;
        transactionID: string;
        reportID: string;
        reportActionID: string;
    };
};

type WorkspaceConfirmationNavigatorParamList = {
    [SCREENS.WORKSPACE_CONFIRMATION.ROOT]: {
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.CURRENCY.SELECTION]: {
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
};

type WorkspaceDuplicateNavigatorParamList = {
    [SCREENS.WORKSPACE_DUPLICATE.ROOT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE_DUPLICATE.SELECT_FEATURES]: {
        policyID: string;
    };
};

type NewTaskNavigatorParamList = {
    [SCREENS.NEW_TASK.ROOT]: {
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.NEW_TASK.TASK_ASSIGNEE_SELECTOR]: {
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.NEW_TASK.TASK_SHARE_DESTINATION_SELECTOR]: undefined;
    [SCREENS.NEW_TASK.DETAILS]: {
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.NEW_TASK.TITLE]: {
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.NEW_TASK.DESCRIPTION]: {
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
};

type TeachersUniteNavigatorParamList = {
    [SCREENS.SAVE_THE_WORLD.ROOT]: undefined;
    [SCREENS.I_KNOW_A_TEACHER]: undefined;
    [SCREENS.INTRO_SCHOOL_PRINCIPAL]: undefined;
    [SCREENS.I_AM_A_TEACHER]: undefined;
};

type TaskDetailsNavigatorParamList = {
    [SCREENS.TASK.TITLE]: {
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.TASK.ASSIGNEE]: {
        reportID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
};

type EnablePaymentsNavigatorParamList = {
    [SCREENS.ENABLE_PAYMENTS_ROOT]: undefined;
};

type SplitDetailsNavigatorParamList = {
    [SCREENS.SPLIT_DETAILS.ROOT]: {
        reportID: string;
        reportActionID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.SPLIT_DETAILS.EDIT_REQUEST]: {
        field: string;
        reportID: string;
        reportActionID: string;
        currency: string;
        tagIndex: string;
    };
};

type AddPersonalBankAccountNavigatorParamList = {
    [SCREENS.ADD_PERSONAL_BANK_ACCOUNT_ROOT]: undefined;
};

type ReimbursementAccountNavigatorParamList = {
    [SCREENS.REIMBURSEMENT_ACCOUNT_ROOT]: {
        stepToOpen?: ReimbursementAccountStepToOpen;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
        policyID?: string;
        subStep?: typeof CONST.BANK_ACCOUNT.STEP.COUNTRY;
    };
    [SCREENS.REIMBURSEMENT_ACCOUNT_VERIFY_ACCOUNT]: {
        // TODO this backTo comes from drilling it through bank account form screens
        // should be removed once https://github.com/Expensify/App/pull/72219 is resolved
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
        policyID?: string;
    };
};

type ReimbursementAccountEnterSignerInfoNavigatorParamList = {
    [SCREENS.REIMBURSEMENT_ACCOUNT_ENTER_SIGNER_INFO]: {
        policyID: string;
        bankAccountID: string;
        isCompleted: string;
    };
};

type ConnectExistingBankAccountNavigatorParamList = {
    [SCREENS.CONNECT_EXISTING_BUSINESS_BANK_ACCOUNT_ROOT]: {
        policyID: string;
    };
};

type WalletStatementNavigatorParamList = {
    [SCREENS.WALLET_STATEMENT_ROOT]: {
        /** The statement year and month as one string, i.e. 202110 */
        yearMonth: string;
    };
};

type FlagCommentNavigatorParamList = {
    [SCREENS.FLAG_COMMENT_ROOT]: {
        reportID: string;
        reportActionID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
};

type EditRequestNavigatorParamList = {
    [SCREENS.EDIT_REQUEST.REPORT_FIELD]: {
        fieldID: string;
        reportID: string;
        policyID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
};

type SignInNavigatorParamList = {
    [SCREENS.SIGN_IN_ROOT]: undefined;
};

type FeatureTrainingNavigatorParamList = {
    [SCREENS.FEATURE_TRAINING_ROOT]: undefined;
    [SCREENS.AUTO_SUBMIT_ROOT]: undefined;
    [SCREENS.CHANGE_POLICY_EDUCATIONAL_ROOT]: undefined;
};

type ReferralDetailsNavigatorParamList = {
    [SCREENS.REFERRAL_DETAILS]: {
        contentType: ValueOf<typeof CONST.REFERRAL_PROGRAM.CONTENT_TYPES>;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo: string;
    };
};

type PrivateNotesNavigatorParamList = {
    [SCREENS.PRIVATE_NOTES.LIST]: {
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.PRIVATE_NOTES.EDIT]: {
        reportID: string;
        accountID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
};

type TransactionDuplicateNavigatorParamList = {
    [SCREENS.TRANSACTION_DUPLICATE.REVIEW]: {
        threadReportID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.TRANSACTION_DUPLICATE.MERCHANT]: {
        threadReportID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.TRANSACTION_DUPLICATE.CATEGORY]: {
        threadReportID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.TRANSACTION_DUPLICATE.TAG]: {
        threadReportID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.TRANSACTION_DUPLICATE.DESCRIPTION]: {
        threadReportID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.TRANSACTION_DUPLICATE.TAX_CODE]: {
        threadReportID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.TRANSACTION_DUPLICATE.BILLABLE]: {
        threadReportID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.TRANSACTION_DUPLICATE.REIMBURSABLE]: {
        threadReportID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
};

type MergeTransactionNavigatorParamList = {
    [SCREENS.MERGE_TRANSACTION.LIST_PAGE]: {
        transactionID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
        isOnSearch?: boolean;
    };
    [SCREENS.MERGE_TRANSACTION.RECEIPT_PAGE]: {
        transactionID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
        isOnSearch?: boolean;
    };
    [SCREENS.MERGE_TRANSACTION.DETAILS_PAGE]: {
        transactionID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
        isOnSearch?: boolean;
    };
    [SCREENS.MERGE_TRANSACTION.CONFIRMATION_PAGE]: {
        transactionID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
        isOnSearch?: boolean;
    };
};

type WorkspacesDomainModalNavigatorParamList = {
    [SCREENS.WORKSPACES_VERIFY_DOMAIN]: {
        domainAccountID: number;
    };
    [SCREENS.WORKSPACES_DOMAIN_VERIFIED]: {
        domainAccountID: number;
    };
    [SCREENS.WORKSPACES_ADD_DOMAIN]: undefined;
    [SCREENS.WORKSPACES_ADD_DOMAIN_VERIFY_ACCOUNT]: undefined;
    [SCREENS.WORKSPACES_DOMAIN_ADDED]: {
        domainAccountID: number;
    };
    [SCREENS.WORKSPACES_DOMAIN_ACCESS_RESTRICTED]: {
        domainAccountID: number;
    };
};

type RightModalNavigatorParamList = {
    [SCREENS.RIGHT_MODAL.SETTINGS]: NavigatorScreenParams<SettingsNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.TWO_FACTOR_AUTH]: NavigatorScreenParams<TwoFactorAuthNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.SEARCH_ROUTER]: undefined;
    [SCREENS.RIGHT_MODAL.NEW_CHAT]: NavigatorScreenParams<NewChatNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.DETAILS]: NavigatorScreenParams<DetailsNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.PROFILE]: NavigatorScreenParams<ProfileNavigatorParamList>;
    [SCREENS.SETTINGS.SHARE_CODE]: undefined;
    [SCREENS.RIGHT_MODAL.REPORT_VERIFY_ACCOUNT]: NavigatorScreenParams<ReportVerifyAccountNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.NEW_REPORT_WORKSPACE_SELECTION]: NavigatorScreenParams<NewReportWorkspaceSelectionNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.REPORT_DETAILS]: NavigatorScreenParams<ReportDetailsNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.REPORT_CARD_ACTIVATE]: NavigatorScreenParams<ReportCardActivateNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.REPORT_CHANGE_WORKSPACE]: NavigatorScreenParams<ReportChangeWorkspaceNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.REPORT_SETTINGS]: NavigatorScreenParams<ReportSettingsNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.SETTINGS_CATEGORIES]: NavigatorScreenParams<SettingsNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.SETTINGS_TAGS]: NavigatorScreenParams<SettingsNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.EXPENSIFY_CARD]: NavigatorScreenParams<SettingsNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.DOMAIN_CARD]: NavigatorScreenParams<SettingsNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.REPORT_DESCRIPTION]: NavigatorScreenParams<ReportDescriptionNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.PARTICIPANTS]: NavigatorScreenParams<ParticipantsNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.ROOM_MEMBERS]: NavigatorScreenParams<RoomMembersNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.MONEY_REQUEST]: NavigatorScreenParams<MoneyRequestNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.WORKSPACE_CONFIRMATION]: NavigatorScreenParams<WorkspaceConfirmationNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.WORKSPACE_DUPLICATE]: NavigatorScreenParams<WorkspaceDuplicateNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.NEW_TASK]: NavigatorScreenParams<NewTaskNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.TEACHERS_UNITE]: NavigatorScreenParams<TeachersUniteNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.TASK_DETAILS]: NavigatorScreenParams<TaskDetailsNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.ENABLE_PAYMENTS]: NavigatorScreenParams<EnablePaymentsNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.SPLIT_DETAILS]: NavigatorScreenParams<SplitDetailsNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.ADD_PERSONAL_BANK_ACCOUNT]: NavigatorScreenParams<AddPersonalBankAccountNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.WALLET_STATEMENT]: NavigatorScreenParams<WalletStatementNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.FLAG_COMMENT]: NavigatorScreenParams<FlagCommentNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.EDIT_REQUEST]: NavigatorScreenParams<EditRequestNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.SIGN_IN]: NavigatorScreenParams<SignInNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.REFERRAL]: NavigatorScreenParams<ReferralDetailsNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.PRIVATE_NOTES]: NavigatorScreenParams<PrivateNotesNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.TRANSACTION_DUPLICATE]: NavigatorScreenParams<TransactionDuplicateNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.TRAVEL]: NavigatorScreenParams<TravelNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.SEARCH_REPORT_ACTIONS]: NavigatorScreenParams<SearchReportActionsParamList>;
    [SCREENS.RIGHT_MODAL.RESTRICTED_ACTION]: NavigatorScreenParams<RestrictedActionParamList>;
    [SCREENS.RIGHT_MODAL.SEARCH_ADVANCED_FILTERS]: NavigatorScreenParams<SearchAdvancedFiltersParamList>;
    [SCREENS.RIGHT_MODAL.SEARCH_SAVED_SEARCH]: NavigatorScreenParams<SearchSavedSearchParamList>;
    [SCREENS.RIGHT_MODAL.MISSING_PERSONAL_DETAILS]: NavigatorScreenParams<MissingPersonalDetailsParamList>;
    [SCREENS.RIGHT_MODAL.DEBUG]: NavigatorScreenParams<DebugParamList>;
    [SCREENS.MONEY_REQUEST.SPLIT_EXPENSE]: NavigatorScreenParams<SplitExpenseParamList>;
    [SCREENS.MONEY_REQUEST.SPLIT_EXPENSE_EDIT]: NavigatorScreenParams<SplitExpenseParamList>;
    [SCREENS.RIGHT_MODAL.ADD_UNREPORTED_EXPENSE]: NavigatorScreenParams<{reportId: string | undefined}>;
    [SCREENS.RIGHT_MODAL.SCHEDULE_CALL]: NavigatorScreenParams<ScheduleCallParamList>;
    [SCREENS.RIGHT_MODAL.REPORT_CHANGE_APPROVER]: NavigatorScreenParams<ReportChangeApproverParamList>;
    [SCREENS.RIGHT_MODAL.MERGE_TRANSACTION]: NavigatorScreenParams<MergeTransactionNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.EXPENSE_REPORT]: {
        reportID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.RIGHT_MODAL.SEARCH_MONEY_REQUEST_REPORT]: {
        reportID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.RIGHT_MODAL.SEARCH_REPORT]: {
        reportID: string;
        reportActionID?: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.RIGHT_MODAL.DOMAIN]: NavigatorScreenParams<WorkspacesDomainModalNavigatorParamList>;
    [SCREENS.RIGHT_MODAL.SEARCH_COLUMNS]: NavigatorScreenParams<SearchColumnsParamList>;
    [SCREENS.RIGHT_MODAL.MULTIFACTOR_AUTHENTICATION]: NavigatorScreenParams<MultifactorAuthenticationParamList>;
};

type TravelNavigatorParamList = {
    [SCREENS.TRAVEL.MY_TRIPS]: {
        policyID: string;
    };
    [SCREENS.TRAVEL.TRAVEL_DOT_LINK_WEB_VIEW]: {
        token: string;
        isTestAccount?: string;
        redirectUrl?: string;
    };
    [SCREENS.TRAVEL.TRIP_SUMMARY]: {
        reportID: string;
        transactionID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: string;
    };
    [SCREENS.TRAVEL.TRIP_DETAILS]: {
        reportID: string;
        transactionID: string;
        sequenceIndex: number;
        pnr: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: string;
    };
    [SCREENS.TRAVEL.TCS]: {
        domain?: string;
        policyID?: string;
    };
    [SCREENS.TRAVEL.DOMAIN_PERMISSION_INFO]: {
        domain: string;
    };
    [SCREENS.TRAVEL.WORKSPACE_CONFIRMATION]: {
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.TRAVEL.WORKSPACE_ADDRESS]: {
        domain: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
        policyID?: string;
    };
    [SCREENS.TRAVEL.PUBLIC_DOMAIN_ERROR]: {
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.TRAVEL.UPGRADE]: {
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.TRAVEL.DOMAIN_SELECTOR]: {
        policyID?: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.TRAVEL.VERIFY_ACCOUNT]: {
        domain?: string;
        policyID?: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
};

type ReportsSplitNavigatorParamList = {
    [SCREENS.INBOX]: undefined;
    [SCREENS.REPORT]: {
        reportID: string;
        reportActionID?: string;
        openOnAdminRoom?: boolean;
        referrer?: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.REPORT_ATTACHMENTS]: AttachmentModalScreensParamList[typeof SCREENS.REPORT_ATTACHMENTS];
};

type SettingsSplitNavigatorParamList = {
    [SCREENS.SETTINGS.ROOT]: undefined;
    [SCREENS.SETTINGS.PREFERENCES.ROOT]: undefined;
    [SCREENS.SETTINGS.SECURITY]: undefined;
    [SCREENS.SETTINGS.PROFILE.ROOT]?: {
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.SETTINGS.WALLET.ROOT]: undefined;
    [SCREENS.SETTINGS.RULES.ROOT]: undefined;
    [SCREENS.SETTINGS.ABOUT]: undefined;
    [SCREENS.SETTINGS.TROUBLESHOOT]: undefined;
    [SCREENS.SETTINGS.SAVE_THE_WORLD]: undefined;
    [SCREENS.SETTINGS.SUBSCRIPTION.ROOT]?: {
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
};

type WorkspaceSplitNavigatorParamList = {
    [SCREENS.WORKSPACE.INITIAL]: {
        policyID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.PROFILE]: {
        policyID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.EXPENSIFY_CARD]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.COMPANY_CARDS]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.RECEIPT_PARTNERS]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.RECEIPT_PARTNERS_INVITE]: {
        policyID: string;
        integration: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.RECEIPT_PARTNERS_CHANGE_BILLING_ACCOUNT]: {
        policyID: string;
        integration: string;
    };

    [SCREENS.WORKSPACE.RECEIPT_PARTNERS_INVITE_EDIT]: {
        policyID: string;
        integration: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.COMPANY_CARDS_ADD_NEW]: {
        policyID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.PER_DIEM]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.WORKFLOWS]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.WORKFLOWS_APPROVALS_NEW]: {
        policyID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.WORKFLOWS_APPROVALS_EDIT]: {
        policyID: string;
        firstApproverEmail: string;
    };
    [SCREENS.WORKSPACE.WORKFLOWS_APPROVALS_EXPENSES_FROM]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.WORKFLOWS_APPROVALS_APPROVER]: {
        policyID: string;
        approverIndex: number;
    };
    [SCREENS.WORKSPACE.WORKFLOWS_APPROVALS_APPROVER_CHANGE]: {
        policyID: string;
        approverIndex: number;
    };
    [SCREENS.WORKSPACE.WORKFLOWS_APPROVALS_APPROVAL_LIMIT]: {
        policyID: string;
        approverIndex: number;
    };
    [SCREENS.WORKSPACE.WORKFLOWS_APPROVALS_OVER_LIMIT_APPROVER]: {
        policyID: string;
        approverIndex: number;
    };
    [SCREENS.WORKSPACE.WORKFLOWS_AUTO_REPORTING_FREQUENCY]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.WORKFLOWS_AUTO_REPORTING_MONTHLY_OFFSET]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.INVOICES]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.INVOICES_VERIFY_ACCOUNT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.MEMBERS]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.CATEGORIES]: {
        policyID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.SETTINGS_CATEGORIES.SETTINGS_CATEGORIES_ROOT]: {
        policyID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.MORE_FEATURES]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.TAGS]: {
        policyID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.SETTINGS_TAGS.SETTINGS_TAGS_ROOT]: {
        policyID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE.TAXES]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.REPORTS]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.DISTANCE_RATES]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.TRAVEL]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.ROOT]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_ADVANCED]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_ACCOUNT_SELECTOR]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_INVOICE_ACCOUNT_SELECTOR]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_CLASSES_DISPLAYED_AS]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_CUSTOMERS_DISPLAYED_AS]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.ACCOUNTING.QUICKBOOKS_ONLINE_LOCATIONS_DISPLAYED_AS]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.EXPENSIFY_CARD]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.RULES]: {
        policyID: string;
    };
    [SCREENS.WORKSPACE.TIME_TRACKING]: {
        policyID: string;
    };
};

type DomainSplitNavigatorParamList = {
    [SCREENS.DOMAIN.INITIAL]: {
        domainAccountID: number;
    };
    [SCREENS.DOMAIN.SAML]: {
        domainAccountID: number;
    };
    [SCREENS.DOMAIN.ADMINS]: {
        domainAccountID: number;
    };
    [SCREENS.DOMAIN.MEMBERS]: {
        domainAccountID: number;
    };
    [SCREENS.DOMAIN.RESET_DOMAIN]: {
        domainAccountID: number;
        accountID: number;
    };
};

type OnboardingModalNavigatorParamList = {
    [SCREENS.ONBOARDING.PERSONAL_DETAILS]: {
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: string;
    };
    [SCREENS.ONBOARDING.PRIVATE_DOMAIN]: {
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: string;
    };
    [SCREENS.ONBOARDING.WORKSPACES]: {
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: string;
    };
    [SCREENS.ONBOARDING.PURPOSE]: {
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: string;
    };
    [SCREENS.ONBOARDING.EMPLOYEES]: {
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: string;
    };
    [SCREENS.ONBOARDING.ACCOUNTING]: {
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: string;
    };
    [SCREENS.ONBOARDING.INTERESTED_FEATURES]: {
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: string;
    };
    [SCREENS.ONBOARDING.WORK_EMAIL]: {
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: string;
    };
    [SCREENS.ONBOARDING.WORK_EMAIL_VALIDATION]: {
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: string;
    };
    [SCREENS.ONBOARDING.WORKSPACE_OPTIONAL]: {
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: string;
    };
    [SCREENS.ONBOARDING.WORKSPACE_CONFIRMATION]: {
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: string;
    };
    [SCREENS.ONBOARDING.WORKSPACE_CURRENCY]: {
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: string;
    };
    [SCREENS.ONBOARDING.WORKSPACE_INVITE]: {
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: string;
    };
};

type ExplanationModalNavigatorParamList = {
    [SCREENS.EXPLANATION_MODAL.ROOT]: undefined;
};

type MigratedUserModalNavigatorParamList = {
    [SCREENS.MIGRATED_USER_WELCOME_MODAL.ROOT]: {
        shouldOpenSearch?: string;
    };
};

type TestDriveModalNavigatorParamList = {
    [SCREENS.TEST_DRIVE_MODAL.ROOT]: {
        bossEmail?: string;
    };
};

type TestDriveDemoNavigatorParamList = {
    [SCREENS.TEST_DRIVE_DEMO.ROOT]: undefined;
};

type SharedScreensParamList = {
    [NAVIGATORS.REPORTS_SPLIT_NAVIGATOR]: NavigatorScreenParams<ReportsSplitNavigatorParamList>;
    [SCREENS.TRANSITION_BETWEEN_APPS]: {
        email?: string;
        accountID?: number;
        error?: string;
        shortLivedAuthToken?: string;
        shortLivedToken?: string;
        authTokenType?: ValueOf<typeof CONST.AUTH_TOKEN_TYPES>;
        // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
        exitTo?: Routes;
        shouldForceLogin: string;
        domain?: Routes;
        delegatorEmail?: string;
    };
    [SCREENS.VALIDATE_LOGIN]: {
        accountID: string;
        validateCode: string;
        // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
        exitTo?: Routes;
    };
};

type ShareNavigatorParamList = {
    [SCREENS.SHARE.ROOT]: undefined;
    [SCREENS.SHARE.SHARE_DETAILS]: {reportOrAccountID: string};
    [SCREENS.SHARE.SHARE_DETAILS_ATTACHMENT]: {reportOrAccountID: string};
    [SCREENS.SHARE.SUBMIT_DETAILS]: {reportOrAccountID: string};
};

type PublicScreensParamList = SharedScreensParamList & {
    [SCREENS.UNLINK_LOGIN]: {
        accountID?: string;
        validateCode?: string;
    };
    [SCREENS.SAML_SIGN_IN]: undefined;
    [SCREENS.CONNECTION_COMPLETE]: undefined;
    [SCREENS.BANK_CONNECTION_COMPLETE]: undefined;
    [NAVIGATORS.PUBLIC_RIGHT_MODAL_NAVIGATOR]: NavigatorScreenParams<ConsoleNavigatorParamList>;
    [NAVIGATORS.TEST_TOOLS_MODAL_NAVIGATOR]: NavigatorScreenParams<TestToolsModalModalNavigatorParamList>;
};

type AttachmentModalScreensParamList = {
    [SCREENS.REPORT_ATTACHMENTS]: AttachmentModalContainerModalProps & {
        source?: AvatarSource;
        reportID?: string;
        accountID?: number;
        attachmentID?: string;
        type?: ValueOf<typeof CONST.ATTACHMENT_TYPE>;
        fallbackSource?: AvatarSource;
        isAuthTokenRequired?: boolean;
        originalFileName?: string;
        attachmentLink?: string;
        headerTitle?: string;
        hashKey?: number;
        maybeIcon?: boolean;
        file?: FileObject;
        shouldDisableSendButton?: boolean;
    };
    [SCREENS.REPORT_ADD_ATTACHMENT]: AttachmentModalContainerModalProps & {
        reportID?: string;
        accountID?: number;
        attachmentID?: string;
        source?: AvatarSource;
        file?: FileObject | FileObject[];
        dataTransferItems?: DataTransferItem[];
        type?: ValueOf<typeof CONST.ATTACHMENT_TYPE>;
        isAuthTokenRequired?: boolean;
        originalFileName?: string;
        attachmentLink?: string;
        hashKey?: number;
        headerTitle?: string;
        shouldDisableSendButton?: boolean;
        onConfirm?: (file: FileObject | FileObject[]) => void;
    };
    [SCREENS.PROFILE_AVATAR]: AttachmentModalContainerModalProps & {
        accountID: number;
        source?: AvatarSource;
        originalFileName?: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.WORKSPACE_AVATAR]: AttachmentModalContainerModalProps & {
        policyID: string;
        letter?: UpperCaseCharacters;
    };
    [SCREENS.REPORT_AVATAR]: AttachmentModalContainerModalProps & {
        reportID: string;
        policyID?: string;
    };
    [SCREENS.TRANSACTION_RECEIPT]: AttachmentModalContainerModalProps & {
        reportID: string;
        transactionID: string;
        readonly?: string;
        isFromReviewDuplicates?: string;
        action?: IOUAction;
        iouType?: IOUType;
        mergeTransactionID?: string;
    };
    [SCREENS.MONEY_REQUEST.RECEIPT_PREVIEW]: AttachmentModalContainerModalProps & {
        reportID: string;
        transactionID: string;
        action: IOUAction;
        iouType: IOUType;
        readonly: string;
    };
    [SCREENS.SHARE.SHARE_DETAILS_ATTACHMENT]: AttachmentModalContainerModalProps & {
        source?: AvatarSource;
        fallbackSource?: AvatarSource;
        originalFileName?: string;
        headerTitle?: string;
    };
};

type AuthScreensParamList = SharedScreensParamList &
    AttachmentModalScreensParamList & {
        [SCREENS.CONCIERGE]: undefined;
        [SCREENS.TRACK_EXPENSE]: undefined;
        [SCREENS.SUBMIT_EXPENSE]: undefined;
        [SCREENS.HOME]: undefined;
        [SCREENS.WORKSPACES_LIST]: {
            // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
            backTo?: Routes;
        };
        [SCREENS.WORKSPACE_JOIN_USER]: {
            policyID: string;
            email: string;
        };
        [SCREENS.NOT_FOUND]: undefined;
        [SCREENS.REQUIRE_TWO_FACTOR_AUTH]: undefined;
        [NAVIGATORS.REPORTS_SPLIT_NAVIGATOR]: NavigatorScreenParams<ReportsSplitNavigatorParamList>;
        [NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR]: NavigatorScreenParams<SettingsSplitNavigatorParamList>;
        [NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR]: NavigatorScreenParams<WorkspaceSplitNavigatorParamList>;
        [NAVIGATORS.DOMAIN_SPLIT_NAVIGATOR]: NavigatorScreenParams<DomainSplitNavigatorParamList>;
        [NAVIGATORS.RIGHT_MODAL_NAVIGATOR]: NavigatorScreenParams<RightModalNavigatorParamList>;
        [NAVIGATORS.ONBOARDING_MODAL_NAVIGATOR]: NavigatorScreenParams<OnboardingModalNavigatorParamList>;
        [NAVIGATORS.FEATURE_TRAINING_MODAL_NAVIGATOR]: NavigatorScreenParams<FeatureTrainingNavigatorParamList>;
        [NAVIGATORS.EXPLANATION_MODAL_NAVIGATOR]: NavigatorScreenParams<ExplanationModalNavigatorParamList>;
        [NAVIGATORS.MIGRATED_USER_MODAL_NAVIGATOR]: NavigatorScreenParams<MigratedUserModalNavigatorParamList>;
        [NAVIGATORS.TEST_DRIVE_MODAL_NAVIGATOR]: NavigatorScreenParams<TestDriveModalNavigatorParamList>;
        [NAVIGATORS.TEST_DRIVE_DEMO_NAVIGATOR]: NavigatorScreenParams<TestDriveDemoNavigatorParamList>;
        [NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR]: NavigatorScreenParams<SearchFullscreenNavigatorParamList>;
        [SCREENS.CONNECTION_COMPLETE]: undefined;
        [NAVIGATORS.SHARE_MODAL_NAVIGATOR]: NavigatorScreenParams<ShareNavigatorParamList>;
        [SCREENS.BANK_CONNECTION_COMPLETE]: undefined;
        [NAVIGATORS.TEST_TOOLS_MODAL_NAVIGATOR]: NavigatorScreenParams<TestToolsModalModalNavigatorParamList>;
    };

type SearchReportActionsParamList = {
    [SCREENS.SEARCH.REPORT_VERIFY_ACCOUNT]: {
        reportID: string;
    };
    [SCREENS.SEARCH.MONEY_REQUEST_REPORT_VERIFY_ACCOUNT]: {
        reportID: string;
    };
    [SCREENS.SEARCH.TRANSACTION_HOLD_REASON_RHP]: {
        /** ID of the transaction the page was opened for */
        transactionID: string;

        /** ID of the report that user is providing hold reason to */
        reportID: string;

        /** Link to previous page */
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo: ExpensifyRoute;

        /** Hash that includes info about what is searched for */
        searchHash?: number;
    };
    [SCREENS.SEARCH.MONEY_REQUEST_REPORT_HOLD_TRANSACTIONS]: {
        /** Link to previous page */
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo: Routes;
        /** Selected transactions' report ID  */
        reportID: string;
    };
    [SCREENS.SEARCH.SEARCH_REJECT_REASON_RHP]: Record<string, never>;
    [SCREENS.SEARCH.MONEY_REQUEST_REPORT_REJECT_TRANSACTIONS]: {
        /** Selected transactions' report ID  */
        reportID: string;
    };
};

type SearchFullscreenNavigatorParamList = {
    [SCREENS.SEARCH.ROOT]: {
        q: SearchQueryString;
        rawQuery?: SearchQueryString;
        name?: string;
        groupBy?: string;
    };
};

type SearchAdvancedFiltersParamList = {
    [SCREENS.SEARCH.ADVANCED_FILTERS_RHP]: Record<string, never>;
};

type SearchSavedSearchParamList = {
    [SCREENS.SEARCH.SAVED_SEARCH_RENAME_RHP]: SaveSearchParams;
};

type SearchColumnsParamList = {
    [SCREENS.SEARCH.COLUMNS_RHP]: Record<string, never>;
};

type RestrictedActionParamList = {
    [SCREENS.RESTRICTED_ACTION_ROOT]: {
        policyID: string;
    };
};

type MissingPersonalDetailsParamList = {
    [SCREENS.MISSING_PERSONAL_DETAILS]: {
        subPage?: string;
        action?: 'edit';
    };
    [SCREENS.MISSING_PERSONAL_DETAILS_CONFIRM_MAGIC_CODE]: undefined;
};

type SplitExpenseParamList = {
    [SCREENS.MONEY_REQUEST.SPLIT_EXPENSE]: {
        reportID: string;
        transactionID: string;
        splitExpenseTransactionID?: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.MONEY_REQUEST.SPLIT_EXPENSE_CREATE_DATE_RANGE]: {
        reportID: string;
        transactionID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.MONEY_REQUEST.SPLIT_EXPENSE_EDIT]: {
        reportID: string;
        transactionID: string;
        splitExpenseTransactionID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
};

type AddUnreportedExpensesParamList = {
    [SCREENS.ADD_UNREPORTED_EXPENSES_ROOT]: {
        reportID: string;
        backToReport?: string;
    };
};

type DebugParamList = {
    [SCREENS.DEBUG.REPORT]: {
        reportID: string;
    };
    [SCREENS.DEBUG.REPORT_ACTION]: {
        reportID: string;
        reportActionID: string;
    };
    [SCREENS.DEBUG.REPORT_ACTION_CREATE]: {
        reportID: string;
    };
    [SCREENS.DEBUG.DETAILS_CONSTANT_PICKER_PAGE]: {
        formType: string;
        fieldName: string;
        fieldValue?: string;
        policyID?: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: string;
    };
    [SCREENS.DEBUG.DETAILS_DATE_TIME_PICKER_PAGE]: {
        fieldName: string;
        fieldValue?: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: string;
    };
    [SCREENS.DEBUG.TRANSACTION]: {
        transactionID: string;
    };
    [SCREENS.DEBUG.TRANSACTION_VIOLATION_CREATE]: {
        transactionID: string;
    };
    [SCREENS.DEBUG.TRANSACTION_VIOLATION]: {
        transactionID: string;
        index: string;
    };
};

type ScheduleCallParamList = {
    [SCREENS.SCHEDULE_CALL.BOOK]: {
        reportID: string;
    };
    [SCREENS.SCHEDULE_CALL.CONFIRMATION]: {
        reportID: string;
    };
};

type ReportChangeApproverParamList = {
    [SCREENS.REPORT_CHANGE_APPROVER.ROOT]: {
        reportID: string;
    };
    [SCREENS.REPORT_CHANGE_APPROVER.ADD_APPROVER]: {
        reportID: string;
    };
};

type TestToolsModalModalNavigatorParamList = {
    [SCREENS.TEST_TOOLS_MODAL.ROOT]: {
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
};

type MultifactorAuthenticationParamList = {
    [SCREENS.MULTIFACTOR_AUTHENTICATION.MAGIC_CODE]: undefined;
    [SCREENS.MULTIFACTOR_AUTHENTICATION.BIOMETRICS_TEST]: undefined;
    [SCREENS.MULTIFACTOR_AUTHENTICATION.OUTCOME]: {
        outcomeType: ValueOf<typeof CONST.MULTIFACTOR_AUTHENTICATION_OUTCOME_TYPE>;
    };
    [SCREENS.MULTIFACTOR_AUTHENTICATION.PROMPT]: {
        promptType: string;
    };
};

type RootNavigatorParamList = PublicScreensParamList & AuthScreensParamList & SearchFullscreenNavigatorParamList;

type OnboardingFlowName = keyof OnboardingModalNavigatorParamList;

type SplitNavigatorName = keyof SplitNavigatorParamList;

type SearchFullscreenNavigatorName = typeof NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR;

type FullScreenName = SplitNavigatorName | SearchFullscreenNavigatorName | typeof SCREENS.WORKSPACES_LIST | typeof SCREENS.HOME;

// There are three screens/navigators which can be displayed when the Workspaces tab is selected
type WorkspacesTabNavigatorName = typeof SCREENS.WORKSPACES_LIST | typeof NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR | typeof NAVIGATORS.DOMAIN_SPLIT_NAVIGATOR;

type WorkspaceScreenName = keyof WorkspaceSplitNavigatorParamList;

type DomainScreenName = keyof DomainSplitNavigatorParamList;

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace ReactNavigation {
        // eslint-disable-next-line @typescript-eslint/consistent-type-definitions, @typescript-eslint/no-empty-object-type
        interface RootParamList extends RootNavigatorParamList {}
    }
}

export type {
    AddPersonalBankAccountNavigatorParamList,
    AddUnreportedExpensesParamList,
    AuthScreensParamList,
    BackToParams,
    DebugParamList,
    DetailsNavigatorParamList,
    DomainCardNavigatorParamList,
    EditRequestNavigatorParamList,
    EnablePaymentsNavigatorParamList,
    ExplanationModalNavigatorParamList,
    FeatureTrainingNavigatorParamList,
    FlagCommentNavigatorParamList,
    FullScreenName,
    MissingPersonalDetailsParamList,
    MoneyRequestNavigatorParamList,
    NavigationPartialRoute,
    NavigationRef,
    NavigationRoot,
    NavigationStateRoute,
    NavigationRoute,
    NewChatNavigatorParamList,
    NewTaskNavigatorParamList,
    OnboardingFlowName,
    OnboardingModalNavigatorParamList,
    ParticipantsNavigatorParamList,
    PrivateNotesNavigatorParamList,
    ProfileNavigatorParamList,
    PublicScreensParamList,
    ReferralDetailsNavigatorParamList,
    ReportVerifyAccountNavigatorParamList,
    ReimbursementAccountNavigatorParamList,
    ReimbursementAccountEnterSignerInfoNavigatorParamList,
    ConnectExistingBankAccountNavigatorParamList,
    NewReportWorkspaceSelectionNavigatorParamList,
    ReportDescriptionNavigatorParamList,
    ReportDetailsNavigatorParamList,
    ReportChangeWorkspaceNavigatorParamList,
    ReportSettingsNavigatorParamList,
    ReportsSplitNavigatorParamList,
    RestrictedActionParamList,
    ShareNavigatorParamList,
    RightModalNavigatorParamList,
    RoomMembersNavigatorParamList,
    RootNavigatorParamList,
    SearchAdvancedFiltersParamList,
    SearchReportActionsParamList,
    SearchSavedSearchParamList,
    SearchFullscreenNavigatorParamList,
    SettingsNavigatorParamList,
    SettingsSplitNavigatorParamList,
    SignInNavigatorParamList,
    SplitDetailsNavigatorParamList,
    SplitNavigatorBySidebar,
    SplitNavigatorName,
    SplitNavigatorParamList,
    SplitNavigatorSidebarScreen,
    StackNavigationAction,
    State,
    StateOrRoute,
    TaskDetailsNavigatorParamList,
    TeachersUniteNavigatorParamList,
    TransactionDuplicateNavigatorParamList,
    TravelNavigatorParamList,
    WalletStatementNavigatorParamList,
    WorkspaceSplitNavigatorParamList,
    MigratedUserModalNavigatorParamList,
    WorkspaceConfirmationNavigatorParamList,
    WorkspaceDuplicateNavigatorParamList,
    TwoFactorAuthNavigatorParamList,
    ConsoleNavigatorParamList,
    ScheduleCallParamList,
    TestDriveModalNavigatorParamList,
    WorkspaceScreenName,
    TestDriveDemoNavigatorParamList,
    SplitExpenseParamList,
    SetParamsAction,
    WorkspacesTabNavigatorName,
    ReportChangeApproverParamList,
    TestToolsModalModalNavigatorParamList,
    MergeTransactionNavigatorParamList,
    AttachmentModalScreensParamList,
    ReportCardActivateNavigatorParamList,
    WorkspacesDomainModalNavigatorParamList,
    DomainSplitNavigatorParamList,
    DomainScreenName,
    SearchColumnsParamList,
    MultifactorAuthenticationParamList,
};
