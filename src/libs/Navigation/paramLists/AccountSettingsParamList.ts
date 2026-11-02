import type {ReplacementReason} from '@libs/actions/Card';

import type {Country, EnablePaymentsPageType, EnablePaymentsSubPageType} from '@src/CONST';
import type CONST from '@src/CONST';
import type {Route as Routes} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {ExpenseRuleFormFieldID} from '@src/types/form/ExpenseRuleForm';

import type {ValueOf} from 'type-fest';

type AccountSettingsParamList = {
    [SCREENS.SETTINGS.SHARE_CODE]: undefined;
    [SCREENS.SETTINGS.PROFILE.PRONOUNS]: undefined;
    [SCREENS.SETTINGS.PROFILE.DISPLAY_NAME]: undefined;
    [SCREENS.SETTINGS.PROFILE.TIMEZONE]: undefined;
    [SCREENS.SETTINGS.PROFILE.TIMEZONE_SELECT]: undefined;
    [SCREENS.SETTINGS.PROFILE.PRIVATE_PERSONAL_DETAILS]: {
        fieldToFocus?: string;
    };
    [SCREENS.SETTINGS.PROFILE.PRIVATE_PERSONAL_DETAILS_CONFIRM_VALIDATE_CODE]: undefined;
    [SCREENS.SETTINGS.PROFILE.ADDRESS]: {
        country?: Country | '';
    };
    [SCREENS.SETTINGS.PROFILE.DYNAMIC_ADDRESS_COUNTRY]: {
        country?: string;
    };
    [SCREENS.SETTINGS.PROFILE.DYNAMIC_ADDRESS_STATE]: {
        state?: string;
        label?: string;
    };
    [SCREENS.SETTINGS.PROFILE.DYNAMIC_CONTACT_METHODS]: undefined;
    [SCREENS.SETTINGS.PROFILE.DYNAMIC_CONTACT_METHOD_DETAILS]: {
        contactMethod: string;
        shouldSkipInitialValidation?: string;
    };
    [SCREENS.SETTINGS.PROFILE.DYNAMIC_NEW_CONTACT_METHOD]: undefined;
    [SCREENS.SETTINGS.PROFILE.DYNAMIC_NEW_CONTACT_METHOD_CONFIRM_VALIDATE_CODE]: undefined;
    [SCREENS.SETTINGS.PROFILE.CONTACT_METHOD_SET_DEFAULT_CONFIRM]: {
        contactMethod: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.SETTINGS.PREFERENCES.PRIORITY_MODE]: undefined;
    [SCREENS.SETTINGS.PREFERENCES.PAYMENT_CURRENCY]: undefined;
    [SCREENS.SETTINGS.PREFERENCES.LANGUAGE]: undefined;
    [SCREENS.SETTINGS.PREFERENCES.THEME]: undefined;
    [SCREENS.SETTINGS.TROUBLESHOOT_SERVER]: undefined;
    [SCREENS.SETTINGS.CLOSE]: undefined;
    [SCREENS.SETTINGS.CLOSE_ACCOUNT_CONFIRM_VALIDATE_CODE]: undefined;
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
    [SCREENS.SETTINGS.DYNAMIC_VERIFY_ACCOUNT]: {
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
        /** Whether the validation was opened from the join-workspace Concierge task. */
        isJoinWorkspaceTask?: 'true';
    };
    [SCREENS.SETTINGS.DYNAMIC_ADD_BANK_ACCOUNT_VERIFY_ACCOUNT]:
        | {
              /** Whether the bank account purpose screen should be skipped after the account is validated. */
              shouldSkipPurposeSelection?: 'true';
              /** Whether the US bank account flow should open after the account is validated. */
              shouldSetUpUSBankAccount?: 'true';
          }
        | undefined;
    [SCREENS.SETTINGS.DYNAMIC_EXIT_SURVEY_REASON]: undefined;
    [SCREENS.SETTINGS.DYNAMIC_EXIT_SURVEY_CONFIRM]: undefined;
    [SCREENS.SETTINGS.WALLET.DYNAMIC_CARDS_DIGITAL_DETAILS_UPDATE_ADDRESS]: undefined;
    [SCREENS.SETTINGS.WALLET.DYNAMIC_DOMAIN_CARD]: {
        cardID: string;
    };
    [SCREENS.SETTINGS.WALLET.DYNAMIC_PERSONAL_CARD_DETAILS]: {
        cardID: string;
    };
    [SCREENS.SETTINGS.WALLET.DYNAMIC_PERSONAL_CARD_EDIT_NAME]: {
        cardID: string;
    };
    [SCREENS.SETTINGS.WALLET.DYNAMIC_PERSONAL_CARD_EDIT_TRANSACTION_START_DATE]: {
        cardID: string;
    };
    [SCREENS.SETTINGS.WALLET.DYNAMIC_DOMAIN_CARD_CONFIRM_VALIDATE_CODE]: {
        cardID: string;
    };
    [SCREENS.SETTINGS.WALLET.DYNAMIC_REPORT_VIRTUAL_CARD_FRAUD]: {
        cardID: string;
    };
    [SCREENS.SETTINGS.WALLET.DYNAMIC_REPORT_VIRTUAL_CARD_FRAUD_CONFIRM_VALIDATE_CODE]: {
        cardID: string;
    };
    [SCREENS.SETTINGS.WALLET.DYNAMIC_REPORT_VIRTUAL_CARD_FRAUD_CONFIRMATION]: {
        cardID: string;
    };
    [SCREENS.SETTINGS.WALLET.CARD_ADD_TO_DIGITAL_WALLET]: {
        /** cardID of the card waiting to be added to a digital wallet */
        cardID: string;
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
    };
    [SCREENS.SETTINGS.WALLET.DYNAMIC_CARD_ACTIVATE]: {
        cardID: string;
    };
    [SCREENS.SETTINGS.WALLET.CARD_ADDED_TO_WALLET]: {
        /** cardID of selected card */
        cardID: string;
    };
    [SCREENS.SETTINGS.WALLET.DYNAMIC_CARD_CHANGE_PIN]: {
        cardID: string;
    };
    [SCREENS.SETTINGS.WALLET.DYNAMIC_CARD_CHANGE_PIN_ATM]: undefined;
    [SCREENS.SETTINGS.WALLET.EXPENSIFY_CARD_SPEND_RULES]: {
        policyID: string;
        ruleID: string;
    };
    [SCREENS.SETTINGS.WALLET.TRANSFER_BALANCE]: undefined;
    [SCREENS.SETTINGS.WALLET.CHOOSE_TRANSFER_ACCOUNT]: undefined;
    [SCREENS.SETTINGS.WALLET.IMPORT_TRANSACTIONS]: undefined;
    [SCREENS.SETTINGS.WALLET.IMPORT_TRANSACTIONS_CARD_NAME]: undefined;
    [SCREENS.SETTINGS.WALLET.IMPORT_TRANSACTIONS_CURRENCY]: undefined;
    [SCREENS.SETTINGS.WALLET.IMPORT_TRANSACTIONS_SPREADSHEET]: {cardID?: string};
    [SCREENS.SETTINGS.WALLET.TRANSACTIONS_IMPORTED]: {cardID?: string};
    [SCREENS.SETTINGS.WALLET.ENABLE_PAYMENTS]: {
        page?: EnablePaymentsPageType;
        subPage?: EnablePaymentsSubPageType;
        action?: 'edit';
    };
    [SCREENS.SETTINGS.WALLET.ENABLE_PAYMENTS_CONFIRM_VALIDATE_CODE]: undefined;
    [SCREENS.SETTINGS.WALLET.DYNAMIC_ENABLE_PAYMENTS_CONFIRM_VALIDATE_CODE]: undefined;
    [SCREENS.SETTINGS.WALLET.UNSHARE_BANK_ACCOUNT]: {
        bankAccountID: string;
    };
    [SCREENS.SETTINGS.WALLET.ENABLE_GLOBAL_REIMBURSEMENTS_BUSINESS]: {
        bankAccountID: string;
        subPage: string;
        action?: 'edit';
        bankCountry?: string;
        bankCurrency?: string;
    };
    [SCREENS.SETTINGS.WALLET.ENABLE_GLOBAL_REIMBURSEMENTS_AGREEMENTS]: {
        bankAccountID: string;
        bankCountry?: string;
        bankCurrency?: string;
    };
    [SCREENS.SETTINGS.WALLET.ENABLE_GLOBAL_REIMBURSEMENTS_SIGN]: {
        bankAccountID: string;
        bankCountry?: string;
        bankCurrency?: string;
    };
    [SCREENS.SETTINGS.WALLET.DYNAMIC_ENABLE_GLOBAL_REIMBURSEMENTS_BUSINESS]: {
        bankAccountID: string;
        subPage: string;
        action?: 'edit';
        bankCountry?: string;
        bankCurrency?: string;
    };
    [SCREENS.SETTINGS.WALLET.DYNAMIC_ENABLE_GLOBAL_REIMBURSEMENTS_AGREEMENTS]: {
        bankAccountID: string;
        bankCountry?: string;
        bankCurrency?: string;
    };
    [SCREENS.SETTINGS.WALLET.DYNAMIC_ENABLE_GLOBAL_REIMBURSEMENTS_SIGN]: {
        bankAccountID: string;
        bankCountry?: string;
        bankCurrency?: string;
    };
    [SCREENS.SETTINGS.WALLET.SHARE_BANK_ACCOUNT]: {
        bankAccountID: string;
    };
    [SCREENS.SETTINGS.WALLET.DYNAMIC_WISE_GLOBAL_REIMBURSEMENTS_INTRO]: {
        bankAccountID: string;
    };
    [SCREENS.SETTINGS.WALLET.DYNAMIC_WISE_BUSINESS_ONBOARDING]: {
        bankAccountID: string;
        subPage?: string;
        action?: 'edit';
    };
    [SCREENS.SETTINGS.WALLET.DYNAMIC_WISE_ACCEPT_TERMS]: {
        bankAccountID: string;
    };
    [SCREENS.SETTINGS.WALLET.DYNAMIC_WISE_KYC_REVIEW]: {
        bankAccountID: string;
    };
    [SCREENS.SETTINGS.WALLET.EDIT_BANK_ACCOUNT_NICKNAME]: {
        bankAccountID: string;
    };
    [SCREENS.SETTINGS.WALLET.TRAVEL_CVV]: undefined;
    [SCREENS.SETTINGS.WALLET.TRAVEL_CVV_VERIFY_ACCOUNT]: undefined;
    [SCREENS.SETTINGS.WALLET.PERSONAL_CARD_ADD_NEW]: undefined;
    [SCREENS.SETTINGS.WALLET.DYNAMIC_PERSONAL_CARD_FIX_CONNECTION]: {
        cardID: string;
    };
    [SCREENS.SETTINGS.WALLET.PERSONAL_CARD_WARNING]: undefined;
    [SCREENS.SETTINGS.WALLET.PERSONAL_CARD_UPGRADE]: undefined;
    [SCREENS.SETTINGS.ADD_DEBIT_CARD]: undefined;
    [SCREENS.SETTINGS.ADD_BANK_ACCOUNT]: {
        // eslint-disable-next-line no-restricted-syntax -- `backTo` usages in this file are legacy. Do not add new `backTo` params to screens. See contributingGuides/NAVIGATION.md
        backTo?: Routes;
        subPage?: string;
        action?: 'edit';
    };
    [SCREENS.SETTINGS.DYNAMIC_COLLECT_DEPOSIT_ACCOUNT]: {
        subPage?: string;
        action?: 'edit';
    };
    [SCREENS.SETTINGS.DYNAMIC_ADD_US_BANK_ACCOUNT]: {
        subPage?: string;
        /** Whether the user is editing one of the sub pages */
        action?: 'edit';
    };
    [SCREENS.SETTINGS.DYNAMIC_ADD_US_BANK_ACCOUNT_ENTRY_POINT]: undefined;
    [SCREENS.SETTINGS.UPDATE_PERSONAL_BANK_ACCOUNT]: {
        subPage?: string;
    };
    [SCREENS.SETTINGS.BANK_ACCOUNT_PURPOSE]: undefined;
    [SCREENS.SETTINGS.AGENTS.DYNAMIC_NEW]: {
        policyID?: string;
    };
    [SCREENS.SETTINGS.AGENTS.DYNAMIC_ADD]: {
        policyID?: string;
    };
    [SCREENS.SETTINGS.AGENTS.DYNAMIC_ADD_AVATAR]: undefined;
    [SCREENS.SETTINGS.AGENTS.DYNAMIC_EDIT]: {
        accountID: number;
    };
    [SCREENS.SETTINGS.AGENTS.DYNAMIC_EDIT_NAME]: {
        accountID: number;
    };
    [SCREENS.SETTINGS.AGENTS.DYNAMIC_EDIT_PROMPT]: {
        accountID: number;
    };
    [SCREENS.SETTINGS.AGENTS.DYNAMIC_EDIT_AVATAR]: {
        accountID: number;
    };
    [SCREENS.SETTINGS.RULES.ADD]: undefined;
    [SCREENS.SETTINGS.RULES.ADD_MERCHANT]: undefined;
    [SCREENS.SETTINGS.RULES.ADD_RENAME_MERCHANT]: undefined;
    [SCREENS.SETTINGS.RULES.ADD_CATEGORY]: undefined;
    [SCREENS.SETTINGS.RULES.ADD_TAG]: {
        index: number;
    };
    [SCREENS.SETTINGS.RULES.ADD_TAX]: undefined;
    [SCREENS.SETTINGS.RULES.ADD_DESCRIPTION]: undefined;
    [SCREENS.SETTINGS.RULES.ADD_REIMBURSABLE]: undefined;
    [SCREENS.SETTINGS.RULES.ADD_BILLABLE]: undefined;
    [SCREENS.SETTINGS.RULES.ADD_REPORT]: undefined;
    [SCREENS.SETTINGS.RULES.EDIT]: {
        hash: string;
        field?: ExpenseRuleFormFieldID;
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
        index: number;
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
    [SCREENS.SETTINGS.PROFILE.VACATION_DELEGATE_SELECT]: undefined;
    [SCREENS.SETTINGS.PROFILE.VACATION_DELEGATE_MISSING_WORKSPACES]: undefined;
    [SCREENS.SETTINGS.SUBSCRIPTION.SIZE]: {
        canChangeSize: 0 | 1;
        subPage: string;
    };
    [SCREENS.SETTINGS.SUBSCRIPTION.EXPENSIFY_CODE]: undefined;
    [SCREENS.SETTINGS.SUBSCRIPTION.PAYMENT_HISTORY]: undefined;
    [SCREENS.SETTINGS.SUBSCRIPTION.PAYMENT_DETAILS]: {
        purchaseID: string;
    };
    [SCREENS.SETTINGS.SUBSCRIPTION.SETTINGS_DETAILS]: undefined;
    [SCREENS.SETTINGS.SUBSCRIPTION.DYNAMIC_ADD_PAYMENT_CARD]: undefined;
    [SCREENS.SETTINGS.SUBSCRIPTION.EARLY_RENEWAL]: undefined;
    [SCREENS.SETTINGS.EMAIL_ISSUE]: undefined;
    [SCREENS.SETTINGS.SUBSCRIPTION.CHANGE_BILLING_CURRENCY]: undefined;
    [SCREENS.SETTINGS.SUBSCRIPTION.DYNAMIC_PAYMENT_CARD_CURRENCY_SELECTOR]: undefined;
    [SCREENS.SETTINGS.SUBSCRIPTION.DYNAMIC_SUBSCRIPTION_DOWNGRADE_BLOCKED]: undefined;
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
    [SCREENS.SETTINGS.DELEGATE.UPDATE_DELEGATE_ROLE_CONFIRM_VALIDATE_CODE]: {
        login: string;
        currentRole: string;
        newRole: string;
    };
    [SCREENS.SETTINGS.DELEGATE.DELEGATE_CONFIRM]: {
        login: string;
        role: string;
    };
    [SCREENS.SETTINGS.DELEGATE.DELEGATE_CONFIRM_VALIDATE_CODE]: {
        login: string;
        role: string;
    };
    [SCREENS.SETTINGS.DYNAMIC_REPORT_CARD_LOST_OR_DAMAGED]: {
        cardID: string;
    };
    [SCREENS.SETTINGS.DYNAMIC_REPORT_CARD_LOST_OR_DAMAGED_CONFIRM_VALIDATE_CODE]: {
        cardID: string;
        /** Reason for replacing the card */
        reason: ReplacementReason;
    };
    [SCREENS.SETTINGS.DYNAMIC_KEYBOARD_SHORTCUTS]: undefined;
    [SCREENS.SETTINGS.DYNAMIC_APP_DOWNLOAD_LINKS]: undefined;
    [SCREENS.SETTINGS.DYNAMIC_BETA_OVERRIDES]: undefined;
};

export default AccountSettingsParamList;
