import {CONST as COMMON_CONST} from 'expensify-common';
import startCase from 'lodash/startCase';
import type {OnboardingTask} from '@libs/actions/Welcome/OnboardingFlow';
import StringUtils from '@libs/StringUtils';
import dedent from '@libs/StringUtils/dedent';
import CONST from '@src/CONST';
import type {Country} from '@src/CONST';
import type OriginalMessage from '@src/types/onyx/OriginalMessage';
import type {
    ChangeFieldParams,
    ConnectionNameParams,
    CreatedReportForUnapprovedTransactionsParams,
    DelegateRoleParams,
    DeleteActionParams,
    DeleteConfirmationParams,
    EditActionParams,
    ExportAgainModalDescriptionParams,
    ExportIntegrationSelectedParams,
    IntacctMappingTitleParams,
    IntegrationExportParams,
    IntegrationSyncFailedParams,
    InvalidPropertyParams,
    InvalidValueParams,
    IssueVirtualCardParams,
    LastSyncAccountingParams,
    LastSyncDateParams,
    LearnMoreRouteParams,
    LeftWorkspaceParams,
    LocalTimeParams,
    LogSizeParams,
    ManagerApprovedAmountParams,
    ManagerApprovedParams,
    MarkedReimbursedParams,
    MarkReimbursedFromIntegrationParams,
    MergeAccountIntoParams,
    MergeFailureDescriptionGenericParams,
    MergeFailureUncreatedAccountDescriptionParams,
    MergeSuccessDescriptionParams,
    MissingPropertyParams,
    MovedActionParams,
    MovedFromPersonalSpaceParams,
    MovedFromReportParams,
    MovedTransactionParams,
    MultifactorAuthenticationTranslationParams,
    NeedCategoryForExportToIntegrationParams,
    NewWorkspaceNameParams,
    NextStepParams,
    NoLongerHaveAccessParams,
    NotAllowedExtensionParams,
    NotYouParams,
    OOOEventSummaryFullDayParams,
    OOOEventSummaryPartialDayParams,
    OptionalParam,
    OurEmailProviderParams,
    OwnerOwesAmountParams,
    PaidElsewhereParams,
    ParentNavigationSummaryParams,
    PayAndDowngradeDescriptionParams,
    PayerOwesParams,
    PayerPaidParams,
    PaySomeoneParams,
    PhoneErrorRouteParams,
    PolicyAddedReportFieldOptionParams,
    PolicyDisabledReportFieldAllOptionsParams,
    PolicyDisabledReportFieldOptionParams,
    PolicyExpenseChatNameParams,
    QBDSetupErrorBodyParams,
    RailTicketParams,
    ReceiptPartnersUberSubtitleParams,
    RemovedFromApprovalWorkflowParams,
    RemovedTheRequestParams,
    RemoveMemberPromptParams,
    RemoveMembersWarningPrompt,
    RenamedRoomActionParams,
    RenamedWorkspaceNameActionParams,
    ReportArchiveReasonsClosedParams,
    ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams,
    ReportArchiveReasonsMergedParams,
    ReportArchiveReasonsRemovedFromPolicyParams,
    ReportFieldParams,
    ReportPolicyNameParams,
    RequestAmountParams,
    RequiredFieldParams,
    ResolutionConstraintsParams,
    ReviewParams,
    RoleNamesParams,
    RoomNameReservedErrorParams,
    RoomRenamedToParams,
    RoutedDueToDEWParams,
    RulesEnableWorkflowsParams,
    SecondaryLoginParams,
    SetTheDistanceMerchantParams,
    SetTheRequestParams,
    SettledAfterAddedBankAccountParams,
    SettleExpensifyCardParams,
    SettlementAccountInfoParams,
    SettlementAccountReconciliationParams,
    SettlementDateParams,
    ShareParams,
    SignerInfoMessageParams,
    SignUpNewFaceCodeParams,
    SizeExceededParams,
    SplitAmountParams,
    SplitDateRangeParams,
    SplitExpenseEditTitleParams,
    SplitExpenseSubtitleParams,
    StatementTitleParams,
    StepCounterParams,
    StripePaidParams,
    SubmitsToParams,
    SubmittedToVacationDelegateParams,
    SubmittedWithMemoParams,
    SubscriptionCommitmentParams,
    SubscriptionSettingsLearnMoreParams,
    SubscriptionSettingsRenewsOnParams,
    SubscriptionSettingsSaveUpToParams,
    SubscriptionSettingsSummaryParams,
    SubscriptionSizeParams,
    SyncStageNameConnectionsParams,
    TaskCreatedActionParams,
    TaxAmountParams,
    TermsParams,
    ThreadRequestReportNameParams,
    ThreadSentMoneyReportNameParams,
    ToggleImportTitleParams,
    TotalAmountGreaterOrLessThanOriginalParams,
    ToValidateLoginParams,
    TransferParams,
    TravelTypeParams,
    TrialStartedTitleParams,
    UnapproveWithIntegrationWarningParams,
    UnshareParams,
    UntilTimeParams,
    UpdatedCustomFieldParams,
    UpdatedPolicyApprovalRuleParams,
    UpdatedPolicyAuditRateParams,
    UpdatedPolicyCategoryDescriptionHintTypeParams,
    UpdatedPolicyCategoryExpenseLimitTypeParams,
    UpdatedPolicyCategoryGLCodeParams,
    UpdatedPolicyCategoryMaxAmountNoReceiptParams,
    UpdatedPolicyCategoryMaxExpenseAmountParams,
    UpdatedPolicyCategoryNameParams,
    UpdatedPolicyCategoryParams,
    UpdatedPolicyCurrencyParams,
    UpdatedPolicyCustomUnitRateEnabledParams,
    UpdatedPolicyCustomUnitRateParams,
    UpdatedPolicyCustomUnitTaxClaimablePercentageParams,
    UpdatedPolicyCustomUnitTaxRateExternalIDParams,
    UpdatedPolicyDescriptionParams,
    UpdatedPolicyFieldWithNewAndOldValueParams,
    UpdatedPolicyFieldWithValueParam,
    UpdatedPolicyFrequencyParams,
    UpdatedPolicyManualApprovalThresholdParams,
    UpdatedPolicyPreventSelfApprovalParams,
    UpdatedPolicyReimbursementEnabledParams,
    UpdatedPolicyReimburserParams,
    UpdatedPolicyReportFieldDefaultValueParams,
    UpdatedPolicyTagFieldParams,
    UpdatedPolicyTagNameParams,
    UpdatedPolicyTagParams,
    UpdatedPolicyTaxParams,
    UpdatedTheDistanceMerchantParams,
    UpdatedTheRequestParams,
    UpdatePolicyCustomUnitParams,
    UpdatePolicyCustomUnitTaxEnabledParams,
    UpdateRoleParams,
    UpgradeSuccessMessageParams,
    UsePlusButtonParams,
    UserIsAlreadyMemberParams,
    UserSplitParams,
    VacationDelegateParams,
    ViolationsCashExpenseWithNoReceiptParams,
    ViolationsConversionSurchargeParams,
    ViolationsCustomRulesParams,
    ViolationsInvoiceMarkupParams,
    ViolationsMaxAgeParams,
    ViolationsMissingTagParams,
    ViolationsModifiedAmountParams,
    ViolationsOverCategoryLimitParams,
    ViolationsOverLimitParams,
    ViolationsPerDayLimitParams,
    ViolationsProhibitedExpenseParams,
    ViolationsReceiptRequiredParams,
    ViolationsRterParams,
    ViolationsTagOutOfPolicyParams,
    ViolationsTaxOutOfPolicyParams,
    WaitingOnBankAccountParams,
    WalletAgreementParams,
    WalletProgramParams,
    WelcomeEnterMagicCodeParams,
    WelcomeToRoomParams,
    WeSentYouMagicSignInLinkParams,
    WorkEmailMergingBlockedParams,
    WorkEmailResendCodeParams,
    WorkflowSettingsParam,
    WorkspaceLockedPlanTypeParams,
    WorkspaceMemberList,
    WorkspaceMembersCountParams,
    WorkspaceOwnerWillNeedToAddOrUpdatePaymentCardParams,
    WorkspaceRouteParams,
    WorkspaceShareNoteParams,
    WorkspacesListRouteParams,
    WorkspaceUpgradeNoteParams,
    WorkspaceYouMayJoin,
    YourPlanPriceParams,
    YourPlanPriceValueParams,
    ZipCodeExampleFormatParams,
} from './params';
import type {TranslationDeepObject} from './types';

type StateValue = {
    stateISO: string;
    stateName: string;
};

type States = Record<keyof typeof COMMON_CONST.STATES, StateValue>;

type AllCountries = Record<Country, string>;

/* eslint-disable max-len */
const translations = {
    common: {
        // @context Used as a noun meaning a numerical total or quantity, not the verb “to count.”
        count: 'Count',
        cancel: 'Cancel',
        // @context Refers to closing or hiding a notification or message, not rejecting or ignoring something.
        dismiss: 'Dismiss',
        // @context Used on a button to continue an action or workflow, not the formal or procedural sense of “to proceed.”
        proceed: 'Proceed',
        unshare: 'Unshare',
        yes: 'Yes',
        no: 'No',
        // @context Universal confirmation button. Keep the UI-standard term “OK” unless the locale strongly prefers an alternative.
        ok: 'OK',
        notNow: 'Not now',
        noThanks: 'No thanks',
        learnMore: 'Learn more',
        buttonConfirm: 'Got it',
        name: 'Name',
        attachment: 'Attachment',
        attachments: 'Attachments',
        center: 'Center',
        from: 'From',
        to: 'To',
        in: 'In',
        optional: 'Optional',
        new: 'New',
        newFeature: 'New feature',
        search: 'Search',
        reports: 'Reports',
        find: 'Find',
        searchWithThreeDots: 'Search...',
        next: 'Next',
        previous: 'Previous',
        // @context Navigation button that returns the user to the previous screen. Should be interpreted as a UI action label.
        goBack: 'Go back',
        create: 'Create',
        add: 'Add',
        resend: 'Resend',
        save: 'Save',
        select: 'Select',
        deselect: 'Deselect',
        // @context Menu or label title referring to the ability to select multiple items. Should be interpreted as a noun phrase, not a command.
        selectMultiple: 'Select multiple',
        saveChanges: 'Save changes',
        submit: 'Submit',
        // @context Status label meaning an item has already been sent or submitted (e.g., a form or report). Not the action “to submit.”
        submitted: 'Submitted',
        rotate: 'Rotate',
        zoom: 'Zoom',
        password: 'Password',
        magicCode: 'Magic code',
        digits: 'digits',
        twoFactorCode: 'Two-factor code',
        workspaces: 'Workspaces',
        inbox: 'Inbox',
        // @context Used in confirmation or result messages indicating that an action completed successfully, not the abstract noun “success.”
        success: 'Success',
        group: 'Group',
        profile: 'Profile',
        referral: 'Referral',
        payments: 'Payments',
        approvals: 'Approvals',
        wallet: 'Wallet',
        preferences: 'Preferences',
        view: 'View',
        review: (reviewParams?: ReviewParams) => `Review${reviewParams?.amount ? ` ${reviewParams?.amount}` : ''}`,
        not: 'Not',
        signIn: 'Sign in',
        signInWithGoogle: 'Sign in with Google',
        signInWithApple: 'Sign in with Apple',
        signInWith: 'Sign in with',
        continue: 'Continue',
        firstName: 'First name',
        lastName: 'Last name',
        scanning: 'Scanning',
        analyzing: 'Analyzing...',
        addCardTermsOfService: 'Expensify Terms of Service',
        perPerson: 'per person',
        phone: 'Phone',
        phoneNumber: 'Phone number',
        phoneNumberPlaceholder: '(xxx) xxx-xxxx',
        email: 'Email',
        and: 'and',
        or: 'or',
        details: 'Details',
        privacy: 'Privacy',
        privacyPolicy: 'Privacy Policy',
        hidden: 'Hidden',
        visible: 'Visible',
        delete: 'Delete',
        // @context UI label indicating that an item is archived. Maintain capitalization consistency across similar status labels.
        archived: 'archived',
        contacts: 'Contacts',
        recents: 'Recents',
        close: 'Close',
        comment: 'Comment',
        download: 'Download',
        downloading: 'Downloading',
        // @context Indicates that a file is currently being uploaded (sent to the server), not downloaded.
        uploading: 'Uploading',
        // @context as a verb, not a noun
        pin: 'Pin',
        unPin: 'Unpin',
        back: 'Back',
        saveAndContinue: 'Save & continue',
        settings: 'Settings',
        termsOfService: 'Terms of Service',
        members: 'Members',
        invite: 'Invite',
        here: 'here',
        date: 'Date',
        dob: 'Date of birth',
        currentYear: 'Current year',
        currentMonth: 'Current month',
        ssnLast4: 'Last 4 digits of SSN',
        ssnFull9: 'Full 9 digits of SSN',
        addressLine: (lineNumber: number) => `Address line ${lineNumber}`,
        personalAddress: 'Personal address',
        companyAddress: 'Company address',
        noPO: 'No PO boxes or mail-drop addresses, please.',
        city: 'City',
        state: 'State',
        streetAddress: 'Street address',
        stateOrProvince: 'State / Province',
        country: 'Country',
        zip: 'Zip code',
        zipPostCode: 'Zip / Postcode',
        whatThis: "What's this?",
        iAcceptThe: 'I accept the ',
        acceptTermsAndPrivacy: `I accept the <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Expensify Terms of Service</a> and <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Privacy Policy</a>`,
        acceptTermsAndConditions: `I accept the <a href="${CONST.OLD_DOT_PUBLIC_URLS.ACH_TERMS_URL}">terms and conditions</a>`,
        acceptTermsOfService: `I accept the <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Expensify Terms of Service</a>`,
        remove: 'Remove',
        admin: 'Admin',
        owner: 'Owner',
        dateFormat: 'YYYY-MM-DD',
        send: 'Send',
        na: 'N/A',
        noResultsFound: 'No results found',
        noResultsFoundMatching: (searchString: string) => `No results found matching "${searchString}"`,
        recentDestinations: 'Recent destinations',
        timePrefix: "It's",
        conjunctionFor: 'for',
        todayAt: 'Today at',
        tomorrowAt: 'Tomorrow at',
        yesterdayAt: 'Yesterday at',
        conjunctionAt: 'at',
        conjunctionTo: 'to',
        genericErrorMessage: 'Oops... something went wrong and your request could not be completed. Please try again later.',
        percentage: 'Percentage',
        converted: 'Converted',
        error: {
            invalidAmount: 'Invalid amount',
            acceptTerms: 'You must accept the Terms of Service to continue',
            phoneNumber: `Please enter a complete phone number\n(e.g. ${CONST.FORMATTED_EXAMPLE_PHONE_NUMBER})`,
            fieldRequired: 'This field is required',
            requestModified: 'This request is being modified by another member',
            characterLimitExceedCounter: (length: number, limit: number) => `Character limit exceeded (${length}/${limit})`,
            dateInvalid: 'Please select a valid date',
            invalidDateShouldBeFuture: 'Please choose today or a future date',
            invalidTimeShouldBeFuture: 'Please choose a time at least one minute ahead',
            invalidCharacter: 'Invalid character',
            enterMerchant: 'Enter a merchant name',
            enterAmount: 'Enter an amount',
            missingMerchantName: 'Missing merchant name',
            missingAmount: 'Missing amount',
            missingDate: 'Missing date',
            enterDate: 'Enter a date',
            invalidTimeRange: 'Please enter a time using the 12-hour clock format (e.g., 2:30 PM)',
            pleaseCompleteForm: 'Please complete the form above to continue',
            pleaseSelectOne: 'Please select an option above',
            invalidRateError: 'Please enter a valid rate',
            lowRateError: 'Rate must be greater than 0',
            email: 'Please enter a valid email address',
            login: 'An error occurred while logging in. Please try again.',
        },
        comma: 'comma',
        semicolon: 'semicolon',
        please: 'Please',
        // @context Call-to-action encouraging the user to reach out to support or the team. Should follow UI capitalization conventions.
        contactUs: 'contact us',
        pleaseEnterEmailOrPhoneNumber: 'Please enter an email or phone number',
        // @context Instruction prompting the user to correct multiple issues. Should use imperative form when translated.
        fixTheErrors: 'fix the errors',
        inTheFormBeforeContinuing: 'in the form before continuing',
        confirm: 'Confirm',
        reset: 'Reset',
        // @context Status or button indicating that an action or process has been completed. Should reflect completion.
        done: 'Done',
        more: 'More',
        debitCard: 'Debit card',
        bankAccount: 'Bank account',
        personalBankAccount: 'Personal bank account',
        businessBankAccount: 'Business bank account',
        join: 'Join',
        leave: 'Leave',
        decline: 'Decline',
        reject: 'Reject',
        transferBalance: 'Transfer balance',
        // @context Instruction telling the user to input data manually. Refers to entering text or values in a field.
        enterManually: 'Enter it manually',
        message: 'Message',
        leaveThread: 'Leave thread',
        you: 'You',
        // @context Refers to the current user in the UI. Should follow capitalization rules for labels/pronouns in the target language.
        me: 'me',
        youAfterPreposition: 'you',
        your: 'your',
        conciergeHelp: 'Please reach out to Concierge for help.',
        youAppearToBeOffline: 'You appear to be offline.',
        thisFeatureRequiresInternet: 'This feature requires an active internet connection.',
        attachmentWillBeAvailableOnceBackOnline: 'Attachment will become available once back online.',
        errorOccurredWhileTryingToPlayVideo: 'An error occurred while trying to play this video.',
        areYouSure: 'Are you sure?',
        verify: 'Verify',
        yesContinue: 'Yes, continue',
        // @context Provides an example format for a website URL.
        websiteExample: 'e.g. https://www.expensify.com',
        // @context Provides an example format for a ZIP/postal code.
        zipCodeExampleFormat: ({zipSampleFormat}: ZipCodeExampleFormatParams) => (zipSampleFormat ? `e.g. ${zipSampleFormat}` : ''),
        description: 'Description',
        title: 'Title',
        assignee: 'Assignee',
        createdBy: 'Created by',
        with: 'with',
        shareCode: 'Share code',
        share: 'Share',
        per: 'per',
        // @context Unit label for “mile.” Should be treated as a measurement unit and may require capitalization depending on locale conventions.
        mi: 'mile',
        km: 'kilometer',
        copied: 'Copied!',
        someone: 'Someone',
        total: 'Total',
        edit: 'Edit',
        letsDoThis: `Let's do this!`,
        letsStart: `Let's start`,
        showMore: 'Show more',
        showLess: 'Show less',
        merchant: 'Merchant',
        change: 'Change',
        category: 'Category',
        report: 'Report',
        billable: 'Billable',
        nonBillable: 'Non-billable',
        tag: 'Tag',
        receipt: 'Receipt',
        verified: 'Verified',
        replace: 'Replace',
        distance: 'Distance',
        mile: 'mile',
        // @context Plural measurement unit for “mile.” Maintain consistent capitalization with the singular form.
        miles: 'miles',
        kilometer: 'kilometer',
        kilometers: 'kilometers',
        recent: 'Recent',
        all: 'All',
        am: 'AM',
        pm: 'PM',
        // @context Acronym meaning “To Be Determined.” Should be translated or localized according to the target language's convention.
        tbd: 'TBD',
        selectCurrency: 'Select a currency',
        selectSymbolOrCurrency: 'Select a symbol or currency',
        card: 'Card',
        whyDoWeAskForThis: 'Why do we ask for this?',
        required: 'Required',
        showing: 'Showing',
        of: 'of',
        default: 'Default',
        update: 'Update',
        member: 'Member',
        auditor: 'Auditor',
        role: 'Role',
        currency: 'Currency',
        groupCurrency: 'Group currency',
        rate: 'Rate',
        emptyLHN: {
            title: 'Woohoo! All caught up.',
            subtitleText1: 'Find a chat using the',
            subtitleText2: 'button above, or create something using the',
            subtitleText3: 'button below.',
        },
        businessName: 'Business name',
        clear: 'Clear',
        type: 'Type',
        reportName: 'Report name',
        action: 'Action',
        expenses: 'Expenses',
        totalSpend: 'Total spend',
        tax: 'Tax',
        shared: 'Shared',
        drafts: 'Drafts',
        // @context as a noun, not a verb
        draft: 'Draft',
        finished: 'Finished',
        upgrade: 'Upgrade',
        downgradeWorkspace: 'Downgrade workspace',
        companyID: 'Company ID',
        userID: 'User ID',
        disable: 'Disable',
        export: 'Export',
        initialValue: 'Initial value',
        // @context UI field indicating the current system date (e.g., “today’s date”). Not a label for selecting a date.
        currentDate: 'Current date',
        value: 'Value',
        downloadFailedTitle: 'Download failed',
        downloadFailedDescription: "Your download couldn't be completed. Please try again later.",
        filterLogs: 'Filter Logs',
        network: 'Network',
        reportID: 'Report ID',
        longReportID: 'Long Report ID',
        withdrawalID: 'Withdrawal ID',
        bankAccounts: 'Bank accounts',
        chooseFile: 'Choose file',
        chooseFiles: 'Choose files',
        // @context Instruction for drag-and-drop upload area. Refers to dropping a file onto a designated zone, not “dropping” in a casual sense.
        dropTitle: 'Let it go',
        // @context Instruction for dropping one or more files into an upload area.
        dropMessage: 'Drop your file here',
        ignore: 'Ignore',
        enabled: 'Enabled',
        disabled: 'Disabled',
        // @context Action button for importing a file or data. Should use the verb form, not the noun form.
        import: 'Import',
        offlinePrompt: "You can't take this action right now.",
        // @context meaning "remaining to be paid, done, or dealt with", not "exceptionally good"
        outstanding: 'Outstanding',
        chats: 'Chats',
        tasks: 'Tasks',
        unread: 'Unread',
        sent: 'Sent',
        links: 'Links',
        // @context Used in date or calendar contexts to refer to a calendar day, not a duration (“daytime”).
        day: 'day',
        days: 'days',
        rename: 'Rename',
        address: 'Address',
        hourAbbreviation: 'h',
        minuteAbbreviation: 'm',
        skip: 'Skip',
        chatWithAccountManager: (accountManagerDisplayName: string) => `Need something specific? Chat with your account manager, ${accountManagerDisplayName}.`,
        chatNow: 'Chat now',
        workEmail: 'Work email',
        destination: 'Destination',
        // @context Refers to a secondary or subordinate rate (e.g., mileage reimbursement). Should be localized consistently across accounting contexts.
        subrate: 'Subrate',
        perDiem: 'Per diem',
        validate: 'Validate',
        downloadAsPDF: 'Download as PDF',
        downloadAsCSV: 'Download as CSV',
        help: 'Help',
        expenseReport: 'Expense Report',
        expenseReports: 'Expense Reports',
        // @context Rate as a noun, not a verb
        rateOutOfPolicy: 'Rate out of policy',
        leaveWorkspace: 'Leave workspace',
        leaveWorkspaceConfirmation: "If you leave this workspace, you won't be able to submit expenses to it.",
        leaveWorkspaceConfirmationAuditor: "If you leave this workspace, you won't be able to view its reports and settings.",
        leaveWorkspaceConfirmationAdmin: "If you leave this workspace, you won't be able to manage its settings.",
        leaveWorkspaceConfirmationApprover: ({workspaceOwner}: {workspaceOwner: string}) =>
            `If you leave this workspace, you'll be replaced in the approval workflow by ${workspaceOwner}, the workspace owner.`,
        leaveWorkspaceConfirmationExporter: ({workspaceOwner}: {workspaceOwner: string}) =>
            `If you leave this workspace, you'll be replaced as the preferred exporter with ${workspaceOwner}, the workspace owner.`,
        leaveWorkspaceConfirmationTechContact: ({workspaceOwner}: {workspaceOwner: string}) =>
            `If you leave this workspace, you'll be replaced as the technical contact with ${workspaceOwner}, the workspace owner.`,
        leaveWorkspaceReimburser: "You can't leave this workspace as the reimburser. Please set a new reimburser in Workspaces > Make or track payments, then try again.",
        reimbursable: 'Reimbursable',
        editYourProfile: 'Edit your profile',
        comments: 'Comments',
        sharedIn: 'Shared in',
        unreported: 'Unreported',
        explore: 'Explore',
        insights: 'Insights',
        todo: 'To-do',
        invoice: 'Invoice',
        expense: 'Expense',
        chat: 'Chat',
        task: 'Task',
        trip: 'Trip',
        apply: 'Apply',
        status: 'Status',
        on: 'On',
        before: 'Before',
        after: 'After',
        reschedule: 'Reschedule',
        general: 'General',
        workspacesTabTitle: 'Workspaces',
        headsUp: 'Heads up!',
        submitTo: 'Submit to',
        forwardTo: 'Forward to',
        merge: 'Merge',
        none: 'None',
        unstableInternetConnection: 'Unstable internet connection. Please check your network and try again.',
        enableGlobalReimbursements: 'Enable Global Reimbursements',
        purchaseAmount: 'Purchase amount',
        originalAmount: 'Original amount',
        frequency: 'Frequency',
        link: 'Link',
        pinned: 'Pinned',
        read: 'Read',
        copyToClipboard: 'Copy to clipboard',
        thisIsTakingLongerThanExpected: 'This is taking longer than expected...',
        domains: 'Domains',
        actionRequired: 'Action required',
        duplicate: 'Duplicate',
        duplicated: 'Duplicated',
        duplicateExpense: 'Duplicate expense',
        exchangeRate: 'Exchange rate',
        reimbursableTotal: 'Reimbursable total',
        nonReimbursableTotal: 'Non-reimbursable total',
    },
    supportalNoAccess: {
        title: 'Not so fast',
        descriptionWithCommand: ({command}: {command?: string} = {}) =>
            `You are not authorized to take this action when support logged in (command: ${command ?? ''}). If you think that Success should be able to take this action, please start a conversation in Slack.`,
    },
    lockedAccount: {
        title: 'Locked Account',
        description: "You're not allowed to complete this action as this account has been locked. Please reach out to concierge@expensify.com for next steps",
    },
    location: {
        useCurrent: 'Use current location',
        notFound: 'We were unable to find your location. Please try again or enter an address manually.',
        permissionDenied: "It looks like you've denied access to your location.",
        please: 'Please',
        allowPermission: 'allow location access in settings',
        tryAgain: 'and try again.',
    },
    contact: {
        importContacts: 'Import contacts',
        importContactsTitle: 'Import your contacts',
        importContactsText: 'Import contacts from your phone so your favorite people are always a tap away.',
        importContactsExplanation: 'so your favorite people are always a tap away.',
        importContactsNativeText: 'Just one more step! Give us the green light to import your contacts.',
    },
    anonymousReportFooter: {
        logoTagline: 'Join the discussion.',
    },
    attachmentPicker: {
        cameraPermissionRequired: 'Camera access',
        expensifyDoesNotHaveAccessToCamera: "Expensify can't take photos without access to your camera. Tap settings to update permissions.",
        attachmentError: 'Attachment error',
        errorWhileSelectingAttachment: 'An error occurred while selecting an attachment. Please try again.',
        errorWhileSelectingCorruptedAttachment: 'An error occurred while selecting a corrupted attachment. Please try another file.',
        takePhoto: 'Take photo',
        chooseFromGallery: 'Choose from gallery',
        chooseDocument: 'Choose file',
        attachmentTooLarge: 'Attachment is too large',
        sizeExceeded: 'Attachment size is larger than 24 MB limit',
        sizeExceededWithLimit: ({maxUploadSizeInMB}: SizeExceededParams) => `Attachment size is larger than ${maxUploadSizeInMB} MB limit`,
        attachmentTooSmall: 'Attachment is too small',
        sizeNotMet: 'Attachment size must be greater than 240 bytes',
        wrongFileType: 'Invalid file type',
        notAllowedExtension: 'This file type is not allowed. Please try a different file type.',
        folderNotAllowedMessage: 'Uploading a folder is not allowed. Please try a different file.',
        protectedPDFNotSupported: 'Password-protected PDF is not supported',
        attachmentImageResized: 'This image has been resized for previewing. Download for full resolution.',
        attachmentImageTooLarge: 'This image is too large to preview before uploading.',
        tooManyFiles: (fileLimit: number) => `You can only upload up to ${fileLimit} files at a time.`,
        sizeExceededWithValue: ({maxUploadSizeInMB}: SizeExceededParams) => `Files exceeds ${maxUploadSizeInMB} MB. Please try again.`,
        someFilesCantBeUploaded: "Some files can't be uploaded",
        sizeLimitExceeded: ({maxUploadSizeInMB}: SizeExceededParams) => `Files must be under ${maxUploadSizeInMB} MB. Any larger files won't be uploaded.`,
        maxFileLimitExceeded: "You can upload up to 30 receipts at a time. Any extras won't be uploaded.",
        unsupportedFileType: (fileType: string) => `${fileType} files aren't supported. Only supported file types will be uploaded.`,
        learnMoreAboutSupportedFiles: 'Learn more about supported formats.',
        passwordProtected: "Password-protected PDFs aren't supported. Only supported files will be uploaded.",
    },
    dropzone: {
        addAttachments: 'Add attachments',
        addReceipt: 'Add receipt',
        scanReceipts: 'Scan receipts',
        replaceReceipt: 'Replace receipt',
    },
    filePicker: {
        fileError: 'File error',
        errorWhileSelectingFile: 'An error occurred while selecting an file. Please try again.',
    },
    connectionComplete: {
        title: 'Connection complete',
        supportingText: 'You can close this window and head back to the Expensify app.',
    },
    avatarCropModal: {
        title: 'Edit photo',
        description: 'Drag, zoom, and rotate your image however you like.',
    },
    composer: {
        noExtensionFoundForMimeType: 'No extension found for mime type',
        problemGettingImageYouPasted: 'There was a problem getting the image you pasted',
        commentExceededMaxLength: (formattedMaxLength: string) => `The maximum comment length is ${formattedMaxLength} characters.`,
        taskTitleExceededMaxLength: (formattedMaxLength: string) => `The maximum task title length is ${formattedMaxLength} characters.`,
    },
    baseUpdateAppModal: {
        updateApp: 'Update app',
        updatePrompt: 'A new version of this app is available.\nUpdate now or restart the app later to download the latest changes.',
    },
    deeplinkWrapper: {
        launching: 'Launching Expensify',
        expired: 'Your session has expired.',
        signIn: 'Please sign in again.',
    },
    multifactorAuthentication: {
        biometricsTest: {
            biometricsTest: 'Biometrics test',
            authenticationSuccessful: 'Authentication successful',
            successfullyAuthenticatedUsing: ({authType}: MultifactorAuthenticationTranslationParams) => `You’ve successfully authenticated using ${authType}.`,
            troubleshootBiometricsStatus: ({registered}: MultifactorAuthenticationTranslationParams) => `Biometrics (${registered ? 'Registered' : 'Not registered'})`,
            yourAttemptWasUnsuccessful: 'Your authentication attempt was unsuccessful.',
            youCouldNotBeAuthenticated: 'You couldn’t be authenticated',
            areYouSureToReject: 'Are you sure? The authentication attempt will be rejected if you close this screen.',
            rejectAuthentication: 'Reject authentication',
            test: 'Test',
            biometricsAuthentication: 'Biometrics authentication',
        },
        pleaseEnableInSystemSettings: {
            start: 'Please enable face/fingerprint verification or set a device passcode in your ',
            link: 'system settings',
            end: '.',
        },
        oops: 'Oops, something went wrong',
        looksLikeYouRanOutOfTime: 'Looks like you ran out of time! Please try again at the merchant.',
        youRanOutOfTime: 'You ran out of time',
        letsVerifyItsYou: 'Let’s verify it’s you',
        verifyYourself: {
            biometrics: 'Verify yourself with your face or fingerprint',
        },
        enableQuickVerification: {
            biometrics: 'Enable quick, secure verification using your face or fingerprint. No passwords or codes required.',
        },
    },
    validateCodeModal: {
        successfulSignInTitle: dedent(`
            Abracadabra,
            you're signed in!
        `),
        successfulSignInDescription: 'Head back to your original tab to continue.',
        title: "Here's your magic code",
        description: dedent(`
            Please enter the code from the device
            where it was originally requested
        `),
        doNotShare: dedent(`
            Do not share your code with anyone.
            Expensify will never ask you for it!
        `),
        or: ', or',
        signInHere: 'just sign in here',
        expiredCodeTitle: 'Magic code expired',
        expiredCodeDescription: 'Go back to the original device and request a new code',
        successfulNewCodeRequest: 'Code requested. Please check your device.',
        tfaRequiredTitle: dedent(`
            Two-factor authentication
            required
        `),
        tfaRequiredDescription: dedent(`
            Please enter the two-factor authentication code
            where you're trying to sign in.
        `),
        requestOneHere: 'request one here.',
    },
    moneyRequestConfirmationList: {
        paidBy: 'Paid by',
        whatsItFor: "What's it for?",
    },
    selectionList: {
        nameEmailOrPhoneNumber: 'Name, email, or phone number',
        findMember: 'Find a member',
        searchForSomeone: 'Search for someone',
    },
    customApprovalWorkflow: {
        title: 'Custom approval workflow',
        description: 'Your company has a custom approval workflow on this workspace. Please take this action in Expensify Classic',
        goToExpensifyClassic: 'Switch to Expensify Classic',
    },
    emptyList: {
        [CONST.IOU.TYPE.CREATE]: {
            title: 'Submit an expense, refer your team',
            subtitleText: "Want your team to use Expensify, too? Just submit an expense to them and we'll take care of the rest.",
        },
    },
    videoChatButtonAndMenu: {
        tooltip: 'Book a call',
    },
    hello: 'Hello',
    phoneCountryCode: '1',
    welcomeText: {
        getStarted: 'Get started below.',
        anotherLoginPageIsOpen: 'Another login page is open.',
        anotherLoginPageIsOpenExplanation: "You've opened the login page in a separate tab. Please log in from that tab.",
        welcome: 'Welcome!',
        welcomeWithoutExclamation: 'Welcome',
        phrase2: "Money talks. And now that chat and payments are in one place, it's also easy.",
        phrase3: 'Your payments get to you as fast as you can get your point across.',
        enterPassword: 'Please enter your password',
        welcomeNewFace: ({login}: SignUpNewFaceCodeParams) => `${login}, it's always great to see a new face around here!`,
        welcomeEnterMagicCode: ({login}: WelcomeEnterMagicCodeParams) => `Please enter the magic code sent to ${login}. It should arrive within a minute or two.`,
    },
    login: {
        hero: {
            header: 'Travel and expense, at the speed of chat',
            body: 'Welcome to the next generation of Expensify, where your travel and expenses move faster with the help of contextual, realtime chat.',
        },
    },
    samlSignIn: {
        welcomeSAMLEnabled: 'Continue logging in with single sign-on:',
        orContinueWithMagicCode: 'You can also sign in with a magic code',
        useSingleSignOn: 'Use single sign-on',
        useMagicCode: 'Use magic code',
        launching: 'Launching...',
        oneMoment: "One moment while we redirect you to your company's single sign-on portal.",
    },
    reportActionCompose: {
        dropToUpload: 'Drop to upload',
        sendAttachment: 'Send attachment',
        addAttachment: 'Add attachment',
        writeSomething: 'Write something...',
        blockedFromConcierge: 'Communication is barred',
        fileUploadFailed: 'Upload failed. File is not supported.',
        localTime: ({user, time}: LocalTimeParams) => `It's ${time} for ${user}`,
        edited: '(edited)',
        emoji: 'Emoji',
        collapse: 'Collapse',
        expand: 'Expand',
    },
    reportActionContextMenu: {
        copyMessage: 'Copy message',
        copied: 'Copied!',
        copyLink: 'Copy link',
        copyURLToClipboard: 'Copy URL to clipboard',
        copyEmailToClipboard: 'Copy email to clipboard',
        markAsUnread: 'Mark as unread',
        markAsRead: 'Mark as read',
        editAction: ({action}: EditActionParams) => `Edit ${action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU ? 'expense' : 'comment'}`,
        deleteAction: ({action}: DeleteActionParams) => {
            let type = 'comment';
            if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU) {
                type = 'expense';
            } else if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW) {
                type = 'report';
            }
            return `Delete ${type}`;
        },
        deleteConfirmation: ({action}: DeleteConfirmationParams) => {
            let type = 'comment';
            if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU) {
                type = 'expense';
            } else if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW) {
                type = 'report';
            }
            return `Are you sure you want to delete this ${type}?`;
        },
        onlyVisible: 'Only visible to',
        replyInThread: 'Reply in thread',
        joinThread: 'Join thread',
        leaveThread: 'Leave thread',
        copyOnyxData: 'Copy Onyx data',
        flagAsOffensive: 'Flag as offensive',
        menu: 'Menu',
    },
    emojiReactions: {
        addReactionTooltip: 'Add reaction',
        reactedWith: 'reacted with',
    },
    reportActionsView: {
        beginningOfArchivedRoom: (reportName: string, reportDetailsLink: string) =>
            `You missed the party in <strong><a class="no-style-link" href="${reportDetailsLink}">${reportName}</a></strong>, there's nothing to see here.`,
        beginningOfChatHistoryDomainRoom: (domainRoom: string) =>
            `This chat is with all Expensify members on the <strong>${domainRoom}</strong> domain. Use it to chat with colleagues, share tips, and ask questions.`,
        beginningOfChatHistoryAdminRoom: (workspaceName: string) => `This chat is with <strong>${workspaceName}</strong> admin. Use it to chat about workspace setup and more.`,
        beginningOfChatHistoryAnnounceRoom: (workspaceName: string) => `This chat is with everyone in <strong>${workspaceName}</strong>. Use it for the most important announcements.`,
        beginningOfChatHistoryUserRoom: (reportName: string, reportDetailsLink: string) =>
            `This chat room is for anything <strong><a class="no-style-link" href="${reportDetailsLink}">${reportName}</a></strong> related.`,
        beginningOfChatHistoryInvoiceRoom: (invoicePayer: string, invoiceReceiver: string) =>
            `This chat is for invoices between <strong>${invoicePayer}</strong> and <strong>${invoiceReceiver}</strong>. Use the + button to send an invoice.`,
        beginningOfChatHistory: (users: string) => `This chat is with ${users}.`,
        beginningOfChatHistoryPolicyExpenseChat: (workspaceName: string, submitterDisplayName: string) =>
            `This is where <strong>${submitterDisplayName}</strong> will submit expenses to <strong>${workspaceName}</strong>. Just use the + button.`,
        beginningOfChatHistorySelfDM: 'This is your personal space. Use it for notes, tasks, drafts, and reminders.',
        beginningOfChatHistorySystemDM: "Welcome! Let's get you set up.",
        chatWithAccountManager: 'Chat with your account manager here',
        sayHello: 'Say hello!',
        yourSpace: 'Your space',
        welcomeToRoom: ({roomName}: WelcomeToRoomParams) => `Welcome to ${roomName}!`,
        usePlusButton: ({additionalText}: UsePlusButtonParams) => ` Use the + button to ${additionalText} an expense.`,
        askConcierge: ' Ask questions and get 24/7 realtime support.',
        conciergeSupport: '24/7 support',
        create: 'create',
        iouTypes: {
            pay: 'pay',
            split: 'split',
            submit: 'submit',
            track: 'track',
            invoice: 'invoice',
        },
    },
    adminOnlyCanPost: 'Only admins can send messages in this room.',
    reportAction: {
        asCopilot: 'as copilot for',
        harvestCreatedExpenseReport: (reportUrl: string, reportName: string) =>
            `created this report to hold all expenses from <a href="${reportUrl}">${reportName}</a> that couldn't be submitted on your chosen frequency`,
        createdReportForUnapprovedTransactions: ({reportUrl, reportName}: CreatedReportForUnapprovedTransactionsParams) =>
            `created this report for any held expenses from <a href="${reportUrl}">${reportName}</a>`,
    },
    mentionSuggestions: {
        hereAlternateText: 'Notify everyone in this conversation',
    },
    newMessages: 'New messages',
    latestMessages: 'Latest messages',
    youHaveBeenBanned: "Note: You've been banned from chatting in this channel.",
    reportTypingIndicator: {
        isTyping: 'is typing...',
        areTyping: 'are typing...',
        multipleMembers: 'Multiple members',
    },
    reportArchiveReasons: {
        [CONST.REPORT.ARCHIVE_REASON.DEFAULT]: 'This chat room has been archived.',
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_CLOSED]: ({displayName}: ReportArchiveReasonsClosedParams) => `This chat is no longer active because ${displayName} closed their account.`,
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_MERGED]: ({displayName, oldDisplayName}: ReportArchiveReasonsMergedParams) =>
            `This chat is no longer active because ${oldDisplayName} has merged their account with ${displayName}.`,
        [CONST.REPORT.ARCHIVE_REASON.REMOVED_FROM_POLICY]: ({displayName, policyName, shouldUseYou = false}: ReportArchiveReasonsRemovedFromPolicyParams) =>
            shouldUseYou
                ? `This chat is no longer active because <strong>you</strong> are no longer a member of the ${policyName} workspace.`
                : `This chat is no longer active because ${displayName} is no longer a member of the ${policyName} workspace.`,
        [CONST.REPORT.ARCHIVE_REASON.POLICY_DELETED]: ({policyName}: ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams) =>
            `This chat is no longer active because ${policyName} is no longer an active workspace.`,
        [CONST.REPORT.ARCHIVE_REASON.INVOICE_RECEIVER_POLICY_DELETED]: ({policyName}: ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams) =>
            `This chat is no longer active because ${policyName} is no longer an active workspace.`,
        [CONST.REPORT.ARCHIVE_REASON.BOOKING_END_DATE_HAS_PASSED]: 'This booking is archived.',
    },
    writeCapabilityPage: {
        label: 'Who can post',
        writeCapability: {
            all: 'All members',
            admins: 'Admins only',
        },
    },
    sidebarScreen: {
        buttonFind: 'Find something...',
        buttonMySettings: 'My settings',
        fabNewChat: 'Start chat',
        fabNewChatExplained: 'Open actions menu',
        fabScanReceiptExplained: 'Scan receipt',
        chatPinned: 'Chat pinned',
        draftedMessage: 'Drafted message',
        listOfChatMessages: 'List of chat messages',
        listOfChats: 'List of chats',
        saveTheWorld: 'Save the world',
        tooltip: 'Get started here!',
        redirectToExpensifyClassicModal: {
            title: 'Coming soon',
            description: "We're fine-tuning a few more bits and pieces of New Expensify to accommodate your specific setup. In the meantime, head over to Expensify Classic.",
        },
    },
    allSettingsScreen: {
        subscription: 'Subscription',
        domains: 'Domains',
    },
    tabSelector: {
        chat: 'Chat',
        room: 'Room',
        distance: 'Distance',
        manual: 'Manual',
        scan: 'Scan',
        map: 'Map',
        gps: 'GPS',
        odometer: 'Odometer',
    },
    spreadsheet: {
        upload: 'Upload a spreadsheet',
        import: 'Import spreadsheet',
        dragAndDrop: '<muted-link>Drag and drop your spreadsheet here, or choose a file below. Supported formats: .csv, .txt, .xls, and .xlsx.</muted-link>',
        dragAndDropMultiLevelTag: `<muted-link>Drag and drop your spreadsheet here, or choose a file below. <a href="${CONST.IMPORT_SPREADSHEET.MULTI_LEVEL_TAGS_ARTICLE_LINK}">Learn more</a> about supported file formats.</muted-link>`,
        chooseSpreadsheet: '<muted-link>Select a spreadsheet file to import. Supported formats: .csv, .txt, .xls, and .xlsx.</muted-link>',
        chooseSpreadsheetMultiLevelTag: `<muted-link>Select a spreadsheet file to import. <a href="${CONST.IMPORT_SPREADSHEET.MULTI_LEVEL_TAGS_ARTICLE_LINK}">Learn more</a> about supported file formats.</muted-link>`,
        fileContainsHeader: 'File contains column headers',
        column: (name: string) => `Column ${name}`,
        fieldNotMapped: (fieldName: string) => `Oops! A required field ("${fieldName}") hasn't been mapped. Please review and try again.`,
        singleFieldMultipleColumns: (fieldName: string) => `Oops! You've mapped a single field ("${fieldName}") to multiple columns. Please review and try again.`,
        emptyMappedField: (fieldName: string) => `Oops! The field ("${fieldName}") contains one or more empty values. Please review and try again.`,
        importSuccessfulTitle: 'Import successful',
        importCategoriesSuccessfulDescription: ({categories}: {categories: number}) => (categories > 1 ? `${categories} categories have been added.` : '1 category has been added.'),
        importMembersSuccessfulDescription: ({added, updated}: {added: number; updated: number}) => {
            if (!added && !updated) {
                return 'No members have been added or updated.';
            }

            if (added && updated) {
                return `${added} member${added > 1 ? 's' : ''} added, ${updated} member${updated > 1 ? 's' : ''} updated.`;
            }

            if (updated) {
                return updated > 1 ? `${updated} members have been updated.` : '1 member has been updated.';
            }

            return added > 1 ? `${added} members have been added.` : '1 member has been added.';
        },
        importTagsSuccessfulDescription: ({tags}: {tags: number}) => (tags > 1 ? `${tags} tags have been added.` : '1 tag has been added.'),
        importMultiLevelTagsSuccessfulDescription: 'Multi-level tags have been added.',
        importPerDiemRatesSuccessfulDescription: ({rates}: {rates: number}) => (rates > 1 ? `${rates} per diem rates have been added.` : '1 per diem rate has been added.'),
        importFailedTitle: 'Import failed',
        importFailedDescription: 'Please ensure all fields are filled out correctly and try again. If the problem persists, please reach out to Concierge.',
        importDescription: 'Choose which fields to map from your spreadsheet by clicking the dropdown next to each imported column below.',
        sizeNotMet: 'File size must be greater than 0 bytes',
        invalidFileMessage:
            'The file you uploaded is either empty or contains invalid data. Please ensure that the file is correctly formatted and contains the necessary information before uploading it again.',
        importSpreadsheetLibraryError: 'Failed to load spreadsheet module. Please check your internet connection and try again.',
        importSpreadsheet: 'Import spreadsheet',
        downloadCSV: 'Download CSV',
        importMemberConfirmation: () => ({
            one: `Please confirm the details below for a new workspace member that will be added as part of this upload. Existing members won’t receive any role updates or invite messages.`,
            other: (count: number) =>
                `Please confirm the details below for the ${count} new workspace members that will be added as part of this upload. Existing members won’t receive any role updates or invite messages.`,
        }),
    },
    receipt: {
        upload: 'Upload receipt',
        uploadMultiple: 'Upload receipts',
        desktopSubtitleSingle: `or drag and drop it here`,
        desktopSubtitleMultiple: `or drag and drop them here`,
        alternativeMethodsTitle: 'Other ways to add receipts:',
        alternativeMethodsDownloadApp: ({downloadUrl}: {downloadUrl: string}) => `<label-text><a href="${downloadUrl}">Download the app</a> to scan from your phone</label-text>`,
        alternativeMethodsForwardReceipts: ({email}: {email: string}) => `<label-text>Forward receipts to <a href="mailto:${email}">${email}</a></label-text>`,
        alternativeMethodsAddPhoneNumber: ({phoneNumber, contactMethodsUrl}: {phoneNumber: string; contactMethodsUrl: string}) =>
            `<label-text><a href="${contactMethodsUrl}">Add your number</a> to text receipts to ${phoneNumber}</label-text>`,
        alternativeMethodsTextReceipts: ({phoneNumber}: {phoneNumber: string}) => `<label-text>Text receipts to ${phoneNumber} (US numbers only)</label-text>`,
        takePhoto: 'Take a photo',
        cameraAccess: 'Camera access is required to take pictures of receipts.',
        deniedCameraAccess: `Camera access still hasn't been granted, please follow <a href="${CONST.DENIED_CAMERA_ACCESS_INSTRUCTIONS_URL}">these instructions</a>.`,
        cameraErrorTitle: 'Camera error',
        cameraErrorMessage: 'An error occurred while taking a photo. Please try again.',
        locationAccessTitle: 'Allow location access',
        locationAccessMessage: 'Location access helps us keep your timezone and currency accurate wherever you go.',
        locationErrorTitle: 'Allow location access',
        locationErrorMessage: 'Location access helps us keep your timezone and currency accurate wherever you go.',
        allowLocationFromSetting: `Location access helps us keep your timezone and currency accurate wherever you go. Please allow location access from your device's permission settings.`,
        dropTitle: 'Let it go',
        dropMessage: 'Drop your file here',
        flash: 'flash',
        multiScan: 'multi-scan',
        shutter: 'shutter',
        gallery: 'gallery',
        deleteReceipt: 'Delete receipt',
        deleteConfirmation: 'Are you sure you want to delete this receipt?',
        addReceipt: 'Add receipt',
        scanFailed: "The receipt couldn't be scanned, as it's missing a merchant, date, or amount.",
        addAReceipt: {
            phrase1: 'Add a receipt',
            phrase2: 'or drag and drop one here',
        },
    },
    quickAction: {
        scanReceipt: 'Scan receipt',
        recordDistance: 'Track distance',
        requestMoney: 'Create expense',
        perDiem: 'Create per diem',
        splitBill: 'Split expense',
        splitScan: 'Split receipt',
        splitDistance: 'Split distance',
        paySomeone: ({name}: PaySomeoneParams = {}) => `Pay ${name ?? 'someone'}`,
        assignTask: 'Assign task',
        header: 'Quick action',
        noLongerHaveReportAccess: 'You no longer have access to your previous quick action destination. Pick a new one below.',
        updateDestination: 'Update destination',
        createReport: 'Create report',
    },
    iou: {
        amount: 'Amount',
        percent: 'Percent',
        date: 'Date',
        taxAmount: 'Tax amount',
        taxRate: 'Tax rate',
        approve: ({formattedAmount}: {formattedAmount?: string} = {}) => (formattedAmount ? `Approve ${formattedAmount}` : 'Approve'),
        approved: 'Approved',
        cash: 'Cash',
        card: 'Card',
        original: 'Original',
        split: 'Split',
        splitExpense: 'Split expense',
        splitDates: 'Split dates',
        splitDateRange: ({startDate, endDate, count}: SplitDateRangeParams) => `${startDate} to ${endDate} (${count} days)`,
        splitExpenseSubtitle: ({amount, merchant}: SplitExpenseSubtitleParams) => `${amount} from ${merchant}`,
        splitByPercentage: 'Split by percentage',
        splitByDate: 'Split by date',
        addSplit: 'Add split',
        makeSplitsEven: 'Make splits even',
        editSplits: 'Edit splits',
        totalAmountGreaterThanOriginal: ({amount}: TotalAmountGreaterOrLessThanOriginalParams) => `Total amount is ${amount} greater than the original expense.`,
        totalAmountLessThanOriginal: ({amount}: TotalAmountGreaterOrLessThanOriginalParams) => `Total amount is ${amount} less than the original expense.`,
        splitExpenseZeroAmount: 'Please enter a valid amount before continuing.',
        splitExpenseOneMoreSplit: 'No splits added. Add at least one to save.',
        splitExpenseEditTitle: ({amount, merchant}: SplitExpenseEditTitleParams) => `Edit ${amount} for ${merchant}`,
        removeSplit: 'Remove split',
        splitExpenseCannotBeEditedModalTitle: "This expense can't be edited",
        splitExpenseCannotBeEditedModalDescription: 'Approved or paid expenses cannot be edited',
        paySomeone: ({name}: PaySomeoneParams = {}) => `Pay ${name ?? 'someone'}`,
        expense: 'Expense',
        categorize: 'Categorize',
        share: 'Share',
        participants: 'Participants',
        createExpense: 'Create expense',
        trackDistance: 'Track distance',
        createExpenses: (expensesNumber: number) => `Create ${expensesNumber} expenses`,
        removeExpense: 'Remove expense',
        removeThisExpense: 'Remove this expense',
        removeExpenseConfirmation: 'Are you sure you want to remove this receipt? This action cannot be undone.',
        addExpense: 'Add expense',
        chooseRecipient: 'Choose recipient',
        createExpenseWithAmount: ({amount}: {amount: string}) => `Create ${amount} expense`,
        confirmDetails: 'Confirm details',
        pay: 'Pay',
        cancelPayment: 'Cancel payment',
        cancelPaymentConfirmation: 'Are you sure that you want to cancel this payment?',
        viewDetails: 'View details',
        pending: 'Pending',
        canceled: 'Canceled',
        posted: 'Posted',
        deleteReceipt: 'Delete receipt',
        findExpense: 'Find expense',
        deletedTransaction: (amount: string, merchant: string) => `deleted an expense (${amount} for ${merchant})`,
        movedFromReport: ({reportName}: MovedFromReportParams) => `moved an expense${reportName ? ` from ${reportName}` : ''}`,
        movedTransactionTo: ({reportUrl, reportName}: MovedTransactionParams) => `moved this expense${reportName ? ` to <a href="${reportUrl}">${reportName}</a>` : ''}`,
        movedTransactionFrom: ({reportUrl, reportName}: MovedTransactionParams) => `moved this expense${reportName ? ` from <a href="${reportUrl}">${reportName}</a>` : ''}`,
        unreportedTransaction: ({reportUrl}: MovedTransactionParams) => `moved this expense to your <a href="${reportUrl}">personal space</a>`,
        movedAction: ({shouldHideMovedReportUrl, movedReportUrl, newParentReportUrl, toPolicyName}: MovedActionParams) => {
            if (shouldHideMovedReportUrl) {
                return `moved this report to the <a href="${newParentReportUrl}">${toPolicyName}</a> workspace`;
            }
            return `moved this <a href="${movedReportUrl}">report</a> to the <a href="${newParentReportUrl}">${toPolicyName}</a> workspace`;
        },
        pendingMatchWithCreditCard: 'Receipt pending match with card transaction',
        pendingMatch: 'Pending match',
        pendingMatchWithCreditCardDescription: 'Receipt pending match with card transaction. Mark as cash to cancel.',
        markAsCash: 'Mark as cash',
        routePending: 'Route pending...',
        receiptScanning: () => ({
            one: 'Receipt scanning...',
            other: 'Receipts scanning...',
        }),
        scanMultipleReceipts: 'Scan multiple receipts',
        scanMultipleReceiptsDescription: "Snap photos of all your receipts at once, then confirm details yourself or we'll do it for you.",
        receiptScanInProgress: 'Receipt scan in progress',
        receiptScanInProgressDescription: 'Receipt scan in progress. Check back later or enter the details now.',
        removeFromReport: 'Remove from report',
        moveToPersonalSpace: 'Move expenses to your personal space',
        duplicateTransaction: (isSubmitted: boolean) =>
            !isSubmitted
                ? 'Potential duplicate expenses identified. Review duplicates to enable submission.'
                : 'Potential duplicate expenses identified. Review duplicates to enable approval.',
        receiptIssuesFound: () => ({
            one: 'Issue found',
            other: 'Issues found',
        }),
        fieldPending: 'Pending...',
        defaultRate: 'Default rate',
        receiptMissingDetails: 'Receipt missing details',
        missingAmount: 'Missing amount',
        missingMerchant: 'Missing merchant',
        receiptStatusTitle: 'Scanning…',
        receiptStatusText: "Only you can see this receipt when it's scanning. Check back later or enter the details now.",
        receiptScanningFailed: 'Receipt scanning failed. Please enter the details manually.',
        transactionPendingDescription: 'Transaction pending. It may take a few days to post.',
        companyInfo: 'Company info',
        companyInfoDescription: 'We need a few more details before you can send your first invoice.',
        yourCompanyName: 'Your company name',
        yourCompanyWebsite: 'Your company website',
        yourCompanyWebsiteNote: "If you don't have a website, you can provide your company's LinkedIn or social media profile instead.",
        invalidDomainError: 'You have entered an invalid domain. To continue, please enter a valid domain.',
        publicDomainError: 'You have entered a public domain. To continue, please enter a private domain.',
        expenseCount: () => {
            return {
                one: '1 expense',
                other: (count: number) => `${count} expenses`,
            };
        },
        deleteExpense: () => ({
            one: 'Delete expense',
            other: 'Delete expenses',
        }),
        deleteConfirmation: () => ({
            one: 'Are you sure that you want to delete this expense?',
            other: 'Are you sure that you want to delete these expenses?',
        }),
        deleteReport: 'Delete report',
        deleteReportConfirmation: 'Are you sure that you want to delete this report?',
        settledExpensify: 'Paid',
        done: 'Done',
        settledElsewhere: 'Paid elsewhere',
        individual: 'Individual',
        business: 'Business',
        settleExpensify: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Pay ${formattedAmount} with Expensify` : `Pay with Expensify`),
        settlePersonal: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Pay ${formattedAmount} as an individual` : `Pay with personal account`),
        settleWallet: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Pay ${formattedAmount} with wallet` : `Pay with wallet`),
        settlePayment: ({formattedAmount}: SettleExpensifyCardParams) => `Pay ${formattedAmount}`,
        settleBusiness: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Pay ${formattedAmount} as a business` : `Pay with business account`),
        payElsewhere: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Mark ${formattedAmount} as paid` : `Mark as paid`),
        settleInvoicePersonal: (amount?: string, last4Digits?: string) => (amount ? `paid ${amount} with personal account ${last4Digits}` : `Paid with personal account`),
        settleInvoiceBusiness: (amount?: string, last4Digits?: string) => (amount ? `paid ${amount} with business account ${last4Digits}` : `Paid with business account`),
        payWithPolicy: ({formattedAmount, policyName}: SettleExpensifyCardParams & {policyName: string}) =>
            formattedAmount ? `Pay ${formattedAmount} via ${policyName}` : `Pay via ${policyName}`,
        businessBankAccount: (amount?: string, last4Digits?: string) => (amount ? `paid ${amount} with bank account ${last4Digits}` : `paid with bank account ${last4Digits}`),
        automaticallyPaidWithBusinessBankAccount: (amount?: string, last4Digits?: string) =>
            `paid ${amount ? `${amount} ` : ''}with bank account ${last4Digits} via <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">workspace rules</a>`,
        invoicePersonalBank: (lastFour: string) => `Personal account • ${lastFour}`,
        invoiceBusinessBank: (lastFour: string) => `Business Account • ${lastFour}`,
        nextStep: 'Next steps',
        finished: 'Finished',
        flip: 'Flip',
        sendInvoice: ({amount}: RequestAmountParams) => `Send ${amount} invoice`,
        expenseAmount: (formattedAmount: string, comment?: string) => `${formattedAmount}${comment ? ` for ${comment}` : ''}`,
        submitted: ({memo}: SubmittedWithMemoParams) => `submitted${memo ? `, saying ${memo}` : ''}`,
        automaticallySubmitted: `submitted via <a href="${CONST.SELECT_WORKFLOWS_HELP_URL}">delay submissions</a>`,
        queuedToSubmitViaDEW: 'queued to submit via custom approval workflow',
        trackedAmount: (formattedAmount: string, comment?: string) => `tracking ${formattedAmount}${comment ? ` for ${comment}` : ''}`,
        splitAmount: ({amount}: SplitAmountParams) => `split ${amount}`,
        didSplitAmount: (formattedAmount: string, comment: string) => `split ${formattedAmount}${comment ? ` for ${comment}` : ''}`,
        yourSplit: ({amount}: UserSplitParams) => `Your split ${amount}`,
        payerOwesAmount: (amount: number | string, payer: string, comment?: string) => `${payer} owes ${amount}${comment ? ` for ${comment}` : ''}`,
        payerOwes: ({payer}: PayerOwesParams) => `${payer} owes: `,
        payerPaidAmount: (amount: number | string, payer?: string) => `${payer ? `${payer} ` : ''}paid ${amount}`,
        payerPaid: ({payer}: PayerPaidParams) => `${payer} paid: `,
        payerSpentAmount: (amount: number | string, payer?: string) => `${payer} spent ${amount}`,
        payerSpent: ({payer}: PayerPaidParams) => `${payer} spent: `,
        managerApproved: ({manager}: ManagerApprovedParams) => `${manager} approved:`,
        managerApprovedAmount: ({manager, amount}: ManagerApprovedAmountParams) => `${manager} approved ${amount}`,
        payerSettled: (amount: number | string) => `paid ${amount}`,
        payerSettledWithMissingBankAccount: (amount: number | string) => `paid ${amount}. Add a bank account to receive your payment.`,
        automaticallyApproved: `approved via <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">workspace rules</a>`,
        approvedAmount: (amount: number | string) => `approved ${amount}`,
        approvedMessage: `approved`,
        unapproved: `unapproved`,
        automaticallyForwarded: `approved via <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">workspace rules</a>`,
        forwarded: `approved`,
        rejectedThisReport: 'rejected this report',
        waitingOnBankAccount: ({submitterDisplayName}: WaitingOnBankAccountParams) => `started payment, but is waiting for ${submitterDisplayName} to add a bank account.`,
        adminCanceledRequest: 'canceled the payment',
        canceledRequest: (amount: string, submitterDisplayName: string) =>
            `canceled the ${amount} payment, because ${submitterDisplayName} did not enable their Expensify Wallet within 30 days`,
        settledAfterAddedBankAccount: ({submitterDisplayName, amount}: SettledAfterAddedBankAccountParams) =>
            `${submitterDisplayName} added a bank account. The ${amount} payment has been made.`,
        paidElsewhere: ({payer, comment}: PaidElsewhereParams = {}) => `${payer ? `${payer} ` : ''}marked as paid${comment ? `, saying "${comment}"` : ''}`,
        paidWithExpensify: (payer?: string) => `${payer ? `${payer} ` : ''}paid with wallet`,
        automaticallyPaidWithExpensify: (payer?: string) =>
            `${payer ? `${payer} ` : ''}paid with Expensify via <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">workspace rules</a>`,
        noReimbursableExpenses: 'This report has an invalid amount',
        pendingConversionMessage: "Total will update when you're back online",
        changedTheExpense: 'changed the expense',
        setTheRequest: ({valueName, newValueToDisplay}: SetTheRequestParams) => `the ${valueName} to ${newValueToDisplay}`,
        setTheDistanceMerchant: ({translatedChangedField, newMerchant, newAmountToDisplay}: SetTheDistanceMerchantParams) =>
            `set the ${translatedChangedField} to ${newMerchant}, which set the amount to ${newAmountToDisplay}`,
        removedTheRequest: ({valueName, oldValueToDisplay}: RemovedTheRequestParams) => `the ${valueName} (previously ${oldValueToDisplay})`,
        updatedTheRequest: ({valueName, newValueToDisplay, oldValueToDisplay}: UpdatedTheRequestParams) => `the ${valueName} to ${newValueToDisplay} (previously ${oldValueToDisplay})`,
        updatedTheDistanceMerchant: ({translatedChangedField, newMerchant, oldMerchant, newAmountToDisplay, oldAmountToDisplay}: UpdatedTheDistanceMerchantParams) =>
            `changed the ${translatedChangedField} to ${newMerchant} (previously ${oldMerchant}), which updated the amount to ${newAmountToDisplay} (previously ${oldAmountToDisplay})`,
        basedOnAI: 'based on past activity',
        basedOnMCC: ({rulesLink}: {rulesLink: string}) => (rulesLink ? `based on <a href="${rulesLink}">workspace rules</a>` : 'based on workspace rule'),
        threadExpenseReportName: ({formattedAmount, comment}: ThreadRequestReportNameParams) => `${formattedAmount} ${comment ? `for ${comment}` : 'expense'}`,
        invoiceReportName: ({linkedReportID}: OriginalMessage<typeof CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW>) => `Invoice Report #${linkedReportID}`,
        threadPaySomeoneReportName: ({formattedAmount, comment}: ThreadSentMoneyReportNameParams) => `${formattedAmount} sent${comment ? ` for ${comment}` : ''}`,
        movedFromPersonalSpace: ({workspaceName, reportName}: MovedFromPersonalSpaceParams) => `moved expense from personal space to ${workspaceName ?? `chat with ${reportName}`}`,
        movedToPersonalSpace: 'moved expense to personal space',
        error: {
            invalidCategoryLength: 'The category name exceeds 255 characters. Please shorten it or choose a different category.',
            invalidTagLength: 'The tag name exceeds 255 characters. Please shorten it or choose a different tag.',
            invalidAmount: 'Please enter a valid amount before continuing',
            invalidDistance: 'Please enter a valid distance before continuing',
            invalidReadings: 'Please enter both start and end readings',
            negativeDistanceNotAllowed: 'End reading must be greater than start reading',
            invalidIntegerAmount: 'Please enter a whole dollar amount before continuing',
            invalidTaxAmount: ({amount}: RequestAmountParams) => `Maximum tax amount is ${amount}`,
            invalidSplit: 'The sum of splits must equal the total amount',
            invalidSplitParticipants: 'Please enter an amount greater than zero for at least two participants',
            invalidSplitYourself: 'Please enter a non-zero amount for your split',
            noParticipantSelected: 'Please select a participant',
            other: 'Unexpected error. Please try again later.',
            genericCreateFailureMessage: 'Unexpected error submitting this expense. Please try again later.',
            genericCreateInvoiceFailureMessage: 'Unexpected error sending this invoice. Please try again later.',
            genericHoldExpenseFailureMessage: 'Unexpected error holding this expense. Please try again later.',
            genericUnholdExpenseFailureMessage: 'Unexpected error taking this expense off hold. Please try again later.',
            receiptDeleteFailureError: 'Unexpected error deleting this receipt. Please try again later.',
            receiptFailureMessage: '<rbr>There was an error uploading your receipt. Please <a href="download">save the receipt</a> and <a href="retry">try again</a> later.</rbr>',
            receiptFailureMessageShort: 'There was an error uploading your receipt.',
            genericDeleteFailureMessage: 'Unexpected error deleting this expense. Please try again later.',
            genericEditFailureMessage: 'Unexpected error editing this expense. Please try again later.',
            genericSmartscanFailureMessage: 'Transaction is missing fields',
            duplicateWaypointsErrorMessage: 'Please remove duplicate waypoints',
            atLeastTwoDifferentWaypoints: 'Please enter at least two different addresses',
            splitExpenseMultipleParticipantsErrorMessage: 'An expense cannot be split between a workspace and other members. Please update your selection.',
            invalidMerchant: 'Please enter a valid merchant',
            atLeastOneAttendee: 'At least one attendee must be selected',
            invalidQuantity: 'Please enter a valid quantity',
            quantityGreaterThanZero: 'Quantity must be greater than zero',
            invalidSubrateLength: 'There must be at least one subrate',
            invalidRate: 'Rate not valid for this workspace. Please select an available rate from the workspace.',
            endDateBeforeStartDate: "The end date can't be before the start date",
            endDateSameAsStartDate: "The end date can't be the same as the start date",
            manySplitsProvided: `The maximum splits allowed is ${CONST.IOU.SPLITS_LIMIT}.`,
            dateRangeExceedsMaxDays: `The date range can't exceed ${CONST.IOU.SPLITS_LIMIT} days.`,
        },
        dismissReceiptError: 'Dismiss error',
        dismissReceiptErrorConfirmation: 'Heads up! Dismissing this error will remove your uploaded receipt entirely. Are you sure?',
        waitingOnEnabledWallet: ({submitterDisplayName}: WaitingOnBankAccountParams) => `started settling up. Payment is on hold until ${submitterDisplayName} enables their wallet.`,
        enableWallet: 'Enable wallet',
        hold: 'Hold',
        unhold: 'Remove hold',
        holdExpense: () => ({
            one: 'Hold expense',
            other: 'Hold expenses',
        }),
        unholdExpense: 'Unhold expense',
        heldExpense: 'held this expense',
        unheldExpense: 'unheld this expense',
        moveUnreportedExpense: 'Move unreported expense',
        addUnreportedExpense: 'Add unreported expense',
        selectUnreportedExpense: 'Select at least one expense to add to the report.',
        emptyStateUnreportedExpenseTitle: 'No unreported expenses',
        emptyStateUnreportedExpenseSubtitle: 'Looks like you don’t have any unreported expenses. Try creating one below.',
        addUnreportedExpenseConfirm: 'Add to report',
        newReport: 'New report',
        explainHold: () => ({
            one: "Explain why you're holding this expense.",
            other: "Explain why you're holding these expenses.",
        }),
        retracted: 'retracted',
        retract: 'Retract',
        reopened: 'reopened',
        reopenReport: 'Reopen report',
        reopenExportedReportConfirmation: ({connectionName}: {connectionName: string}) =>
            `This report has already been exported to ${connectionName}. Changing it may lead to data discrepancies. Are you sure you want to reopen this report?`,
        reason: 'Reason',
        holdReasonRequired: 'A reason is required when holding.',
        expenseWasPutOnHold: 'Expense was put on hold',
        expenseOnHold: 'This expense was put on hold. Please review the comments for next steps.',
        expensesOnHold: 'All expenses were put on hold. Please review the comments for next steps.',
        expenseDuplicate: 'This expense has similar details to another one. Please review the duplicates to continue.',
        someDuplicatesArePaid: 'Some of these duplicates have been approved or paid already.',
        reviewDuplicates: 'Review duplicates',
        keepAll: 'Keep all',
        confirmApprove: 'Confirm approval amount',
        confirmApprovalAmount: 'Approve only compliant expenses, or approve the entire report.',
        confirmApprovalAllHoldAmount: () => ({
            one: 'This expense is on hold. Do you want to approve anyway?',
            other: 'These expenses are on hold. Do you want to approve anyway?',
        }),
        confirmPay: 'Confirm payment amount',
        confirmPayAmount: "Pay what's not on hold, or pay the entire report.",
        confirmPayAllHoldAmount: () => ({
            one: 'This expense is on hold. Do you want to pay anyway?',
            other: 'These expenses are on hold. Do you want to pay anyway?',
        }),
        payOnly: 'Pay only',
        approveOnly: 'Approve only',
        holdEducationalTitle: 'Should you hold this expense?',
        whatIsHoldExplain: "Hold is like hitting “pause” on an expense until you're ready to submit it.",
        holdIsLeftBehind: 'Held expenses are left behind even if you submit an entire report.',
        unholdWhenReady: "Unhold expenses when you're ready to submit them.",
        changePolicyEducational: {
            title: 'You moved this report!',
            description: 'Double-check these items, which tend to change when moving reports to a new workspace.',
            reCategorize: '<strong>Re-categorize any expenses</strong> to comply with workspace rules.',
            workflows: 'This report may now be subject to a different <strong>approval workflow.</strong>',
        },
        changeWorkspace: 'Change workspace',
        set: 'set',
        changed: 'changed',
        removed: 'removed',
        transactionPending: 'Transaction pending.',
        chooseARate: 'Select a workspace reimbursement rate per mile or kilometer',
        unapprove: 'Unapprove',
        unapproveReport: 'Unapprove report',
        headsUp: 'Heads up!',
        unapproveWithIntegrationWarning: ({accountingIntegration}: UnapproveWithIntegrationWarningParams) =>
            `This report has already been exported to ${accountingIntegration}. Changing it may lead to data discrepancies. Are you sure you want to unapprove this report?`,
        reimbursable: 'reimbursable',
        nonReimbursable: 'non-reimbursable',
        bookingPending: 'This booking is pending',
        bookingPendingDescription: "This booking is pending because it hasn't been paid yet.",
        bookingArchived: 'This booking is archived',
        bookingArchivedDescription: 'This booking is archived because the trip date has passed. Add an expense for the final amount if needed.',
        attendees: 'Attendees',
        whoIsYourAccountant: 'Who is your accountant?',
        paymentComplete: 'Payment complete',
        time: 'Time',
        startDate: 'Start date',
        endDate: 'End date',
        startTime: 'Start time',
        endTime: 'End time',
        deleteSubrate: 'Delete subrate',
        deleteSubrateConfirmation: 'Are you sure you want to delete this subrate?',
        quantity: 'Quantity',
        subrateSelection: 'Select a subrate and enter a quantity.',
        qty: 'Qty',
        firstDayText: () => ({
            one: `First day: 1 hour`,
            other: (count: number) => `First day: ${count.toFixed(2)} hours`,
        }),
        lastDayText: () => ({
            one: `Last day: 1 hour`,
            other: (count: number) => `Last day: ${count.toFixed(2)} hours`,
        }),
        tripLengthText: () => ({
            one: `Trip: 1 full day`,
            other: (count: number) => `Trip: ${count} full days`,
        }),
        dates: 'Dates',
        rates: 'Rates',
        submitsTo: ({name}: SubmitsToParams) => `Submits to ${name}`,
        reject: {
            educationalTitle: 'Should you hold or reject?',
            educationalText: "If you're not ready to approve or pay an expense, you can hold or reject it.",
            holdExpenseTitle: 'Hold an expense to ask for more details before approval or payment.',
            approveExpenseTitle: 'Approve other expenses while held expenses stay assigned to you.',
            heldExpenseLeftBehindTitle: 'Held expenses are left behind when you approve an entire report.',
            rejectExpenseTitle: "Reject an expense that you don't intend to approve or pay.",
            reasonPageTitle: 'Reject expense',
            reasonPageDescription: "Explain why you're rejecting this expense.",
            rejectReason: 'Rejection reason',
            markAsResolved: 'Mark as resolved',
            rejectedStatus: 'This expense was rejected. Waiting on you to fix the issues and mark as resolved to enable submission.',
            reportActions: {
                rejectedExpense: 'rejected this expense',
                markedAsResolved: 'marked the rejection reason as resolved',
            },
        },
        moveExpenses: () => ({one: 'Move expense', other: 'Move expenses'}),
        moveExpensesError: "You can't move per diem expenses to reports on other workspaces, because the per diem rates may differ between workspaces.",
        changeApprover: {
            title: 'Change approver',
            header: ({workflowSettingLink}: WorkflowSettingsParam) =>
                `Choose an option to change the approver for this report. (Update your <a href="${workflowSettingLink}">workspace settings</a> to change this permanently for all reports.)`,
            changedApproverMessage: (managerID: number) => `changed the approver to <mention-user accountID="${managerID}"/>`,
            actions: {
                addApprover: 'Add approver',
                addApproverSubtitle: 'Add an additional approver to the existing workflow.',
                bypassApprovers: 'Bypass approvers',
                bypassApproversSubtitle: 'Assign yourself as final approver and skip any remaining approvers.',
            },
            addApprover: {
                subtitle: 'Choose an additional approver for this report before we route through the rest of the approval workflow.',
            },
        },
        chooseWorkspace: 'Choose a workspace',
        routedDueToDEW: ({to}: RoutedDueToDEWParams) => `report routed to ${to} due to custom approval workflow`,
        timeTracking: {
            hoursAt: (hours: number, rate: string) => `${hours} ${hours === 1 ? 'hour' : 'hours'} @ ${rate} / hour`,
            hrs: 'hrs',
            hours: 'Hours',
            ratePreview: (rate: string) => `${rate} / hour`,
            amountTooLargeError: 'The total amount is too large. Lower the hours or reduce the rate.',
        },
        correctDistanceRateError: 'Fix the distance rate error and try again.',
    },
    transactionMerge: {
        listPage: {
            header: 'Merge expenses',
            noEligibleExpenseFound: 'No eligible expenses found',
            noEligibleExpenseFoundSubtitle: `<muted-text><centered-text>You don't have any expenses that can be merged with this one. <a href="${CONST.HELP_DOC_LINKS.MERGE_EXPENSES}">Learn more</a> about eligible expenses.</centered-text></muted-text>`,
            selectTransactionToMerge: ({reportName}: {reportName: string}) =>
                `Select an <a href="${CONST.HELP_DOC_LINKS.MERGE_EXPENSES}">eligible expense</a> to merge with <strong>${reportName}</strong>.`,
        },
        receiptPage: {
            header: 'Select receipt',
            pageTitle: 'Select the receipt you want to keep:',
        },
        detailsPage: {
            header: 'Select details',
            pageTitle: 'Select the details you want to keep:',
            noDifferences: 'No differences found between the transactions',
            pleaseSelectError: ({field}: {field: string}) => {
                const article = StringUtils.startsWithVowel(field) ? 'an' : 'a';
                return `Please select ${article} ${field}`;
            },
            pleaseSelectAttendees: 'Please select attendees',
            selectAllDetailsError: 'Select all details before continuing.',
        },
        confirmationPage: {
            header: 'Confirm details',
            pageTitle: "Confirm the details you're keeping. The details you don't keep will be deleted.",
            confirmButton: 'Merge expenses',
        },
    },
    share: {
        shareToExpensify: 'Share to Expensify',
        messageInputLabel: 'Message',
    },
    notificationPreferencesPage: {
        header: 'Notification preferences',
        label: 'Notify me about new messages',
        notificationPreferences: {
            always: 'Immediately',
            daily: 'Daily',
            mute: 'Mute',
            // @context UI label indicating that something is concealed or not visible to the user.
            hidden: 'Hidden',
        },
    },
    loginField: {
        numberHasNotBeenValidated: "The number hasn't been validated. Click the button to resend the validation link via text.",
        emailHasNotBeenValidated: "The email hasn't been validated. Click the button to resend the validation link via text.",
    },
    avatarWithImagePicker: {
        uploadPhoto: 'Upload photo',
        removePhoto: 'Remove photo',
        editImage: 'Edit photo',
        viewPhoto: 'View photo',
        imageUploadFailed: 'Image upload failed',
        deleteWorkspaceError: 'Sorry, there was an unexpected problem deleting your workspace avatar',
        sizeExceeded: ({maxUploadSizeInMB}: SizeExceededParams) => `The selected image exceeds the maximum upload size of ${maxUploadSizeInMB} MB.`,
        resolutionConstraints: ({minHeightInPx, minWidthInPx, maxHeightInPx, maxWidthInPx}: ResolutionConstraintsParams) =>
            `Please upload an image larger than ${minHeightInPx}x${minWidthInPx} pixels and smaller than ${maxHeightInPx}x${maxWidthInPx} pixels.`,
        notAllowedExtension: ({allowedExtensions}: NotAllowedExtensionParams) => `Profile picture must be one of the following types: ${allowedExtensions.join(', ')}.`,
    },
    avatarPage: {
        title: 'Edit profile picture',
        upload: 'Upload',
        uploadPhoto: 'Upload photo',
        selectAvatar: 'Select avatar',
        choosePresetAvatar: 'Or choose a custom avatar',
    },
    modal: {
        backdropLabel: 'Modal Backdrop',
    },
    nextStep: {
        message: {
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_ADD_TRANSACTIONS]: ({actor, actorType}: NextStepParams) => {
                // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Waiting for <strong>you</strong> to add expenses.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Waiting for <strong>${actor}</strong> to add expenses.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Waiting for an admin to add expenses.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_SUBMIT]: ({actor, actorType}: NextStepParams) => {
                // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Waiting for <strong>you</strong> to submit expenses.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Waiting for <strong>${actor}</strong> to submit expenses.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Waiting for an admin to submit expenses.`;
                }
            },
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            [CONST.NEXT_STEP.MESSAGE_KEY.NO_FURTHER_ACTION]: (_: NextStepParams) => `No further action required!`,
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_SUBMITTER_ACCOUNT]: ({actor, actorType}: NextStepParams) => {
                // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Waiting for <strong>you</strong> to add a bank account.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Waiting for <strong>${actor}</strong> to add a bank account.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Waiting for an admin to add a bank account.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_AUTOMATIC_SUBMIT]: ({actor, actorType, eta, etaType}: NextStepParams) => {
                let formattedETA = '';
                if (eta) {
                    formattedETA = etaType === CONST.NEXT_STEP.ETA_TYPE.DATE_TIME ? ` on ${eta}` : ` ${eta}`;
                }

                // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Waiting for <strong>your</strong> expenses to automatically submit${formattedETA}.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Waiting for <strong>${actor}'s</strong> expenses to automatically submit${formattedETA}.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Waiting for an admin's expenses to automatically submit${formattedETA}.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_FIX_ISSUES]: ({actor, actorType}: NextStepParams) => {
                // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Waiting for <strong>you</strong> to fix the issues.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Waiting for <strong>${actor}</strong> to fix the issues.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Waiting for an admin to fix the issues.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_APPROVE]: ({actor, actorType}: NextStepParams) => {
                // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Waiting for <strong>you</strong> to approve expenses.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Waiting for <strong>${actor}</strong> to approve expenses.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Waiting for an admin to approve expenses.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_EXPORT]: ({actor, actorType}: NextStepParams) => {
                // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Waiting for <strong>you</strong> to export this report.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Waiting for <strong>${actor}</strong> to export this report.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Waiting for an admin to export this report.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_PAY]: ({actor, actorType}: NextStepParams) => {
                // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Waiting for <strong>you</strong> to pay expenses.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Waiting for <strong>${actor}</strong> to pay expenses.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Waiting for an admin to pay expenses.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_POLICY_BANK_ACCOUNT]: ({actor, actorType}: NextStepParams) => {
                // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Waiting for <strong>you</strong> to finish setting up a business bank account.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Waiting for <strong>${actor}</strong> to finish setting up a business bank account.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Waiting for an admin to finish setting up a business bank account.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_PAYMENT]: ({eta, etaType}: NextStepParams) => {
                let formattedETA = '';
                if (eta) {
                    formattedETA = etaType === CONST.NEXT_STEP.ETA_TYPE.DATE_TIME ? ` by ${eta}` : ` ${eta}`;
                }

                return `Waiting for payment to complete${formattedETA}.`;
            },
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            [CONST.NEXT_STEP.MESSAGE_KEY.SUBMITTING_TO_SELF]: (_: NextStepParams) =>
                `Oops! Looks like you're submitting to <strong>yourself</strong>. Approving your own reports is <strong>forbidden</strong> by your workspace. Please submit this report to someone else or contact your admin to change the person you submit to.`,
        },
        eta: {
            [CONST.NEXT_STEP.ETA_KEY.SHORTLY]: 'shortly',
            [CONST.NEXT_STEP.ETA_KEY.TODAY]: 'later today',
            [CONST.NEXT_STEP.ETA_KEY.END_OF_WEEK]: 'on Sunday',
            [CONST.NEXT_STEP.ETA_KEY.SEMI_MONTHLY]: 'on the 1st and 16th of each month',
            [CONST.NEXT_STEP.ETA_KEY.LAST_BUSINESS_DAY_OF_MONTH]: 'on the last business day of the month',
            [CONST.NEXT_STEP.ETA_KEY.LAST_DAY_OF_MONTH]: 'on the last day of the month',
            [CONST.NEXT_STEP.ETA_KEY.END_OF_TRIP]: 'at the end of your trip',
        },
    },
    profilePage: {
        profile: 'Profile',
        preferredPronouns: 'Preferred pronouns',
        selectYourPronouns: 'Select your pronouns',
        selfSelectYourPronoun: 'Self-select your pronoun',
        emailAddress: 'Email address',
        setMyTimezoneAutomatically: 'Set my timezone automatically',
        timezone: 'Timezone',
        invalidFileMessage: 'Invalid file. Please try a different image.',
        avatarUploadFailureMessage: 'An error occurred uploading the avatar. Please try again.',
        online: 'Online',
        offline: 'Offline',
        syncing: 'Syncing',
        profileAvatar: 'Profile avatar',
        publicSection: {
            title: 'Public',
            subtitle: 'These details are displayed on your public profile. Anyone can see them.',
        },
        privateSection: {
            title: 'Private',
            subtitle: "These details are used for travel and payments. They're never shown on your public profile.",
        },
    },
    securityPage: {
        title: 'Security options',
        subtitle: 'Enable two-factor authentication to keep your account safe.',
        goToSecurity: 'Go back to security page',
    },
    shareCodePage: {
        title: 'Your code',
        subtitle: 'Invite members to Expensify by sharing your personal QR code or referral link.',
    },
    pronounsPage: {
        pronouns: 'Pronouns',
        isShownOnProfile: 'Your pronouns are shown on your profile.',
        placeholderText: 'Search to see options',
    },
    contacts: {
        contactMethods: 'Contact methods',
        featureRequiresValidate: 'This feature requires you to validate your account.',
        validateAccount: 'Validate your account',
        helpText: ({email}: {email: string}) =>
            `Add more ways to log in and send receipts to Expensify.<br/><br/>Add an email address to forward receipts to <a href="mailto:${email}">${email}</a> or add a phone number to text receipts to 47777 (US numbers only).`,
        pleaseVerify: 'Please verify this contact method.',
        getInTouch: "We'll use this method to contact you.",
        enterMagicCode: (contactMethod: string) => `Please enter the magic code sent to ${contactMethod}. It should arrive within a minute or two.`,
        setAsDefault: 'Set as default',
        yourDefaultContactMethod: "This is your current default contact method. Before you can delete it, you'll need to choose another contact method and click “Set as default”.",
        removeContactMethod: 'Remove contact method',
        removeAreYouSure: "Are you sure you want to remove this contact method? This action can't be undone.",
        failedNewContact: 'Failed to add this contact method.',
        genericFailureMessages: {
            requestContactMethodValidateCode: 'Failed to send a new magic code. Please wait a bit and try again.',
            validateSecondaryLogin: 'Incorrect or invalid magic code. Please try again or request a new code.',
            deleteContactMethod: 'Failed to delete contact method. Please reach out to Concierge for help.',
            setDefaultContactMethod: 'Failed to set a new default contact method. Please reach out to Concierge for help.',
            addContactMethod: 'Failed to add this contact method. Please reach out to Concierge for help.',
            enteredMethodIsAlreadySubmitted: 'This contact method already exists',
            passwordRequired: 'password required.',
            contactMethodRequired: 'Contact method is required',
            invalidContactMethod: 'Invalid contact method',
        },
        newContactMethod: 'New contact method',
        goBackContactMethods: 'Go back to contact methods',
    },
    // cspell:disable
    pronouns: {
        coCos: 'Co / Cos',
        eEyEmEir: 'E / Ey / Em / Eir',
        faeFaer: 'Fae / Faer',
        heHimHis: 'He / Him / His',
        heHimHisTheyThemTheirs: 'He / Him / His / They / Them / Theirs',
        sheHerHers: 'She / Her / Hers',
        sheHerHersTheyThemTheirs: 'She / Her / Hers / They / Them / Theirs',
        merMers: 'Mer / Mers',
        neNirNirs: 'Ne / Nir / Nirs',
        neeNerNers: 'Nee / Ner / Ners',
        perPers: 'Per / Pers',
        theyThemTheirs: 'They / Them / Theirs',
        thonThons: 'Thon / Thons',
        veVerVis: 'Ve / Ver / Vis',
        viVir: 'Vi / Vir',
        xeXemXyr: 'Xe / Xem / Xyr',
        zeZieZirHir: 'Ze / Zie / Zir / Hir',
        zeHirHirs: 'Ze / Hir',
        callMeByMyName: 'Call me by my name',
    },
    // cspell:enable
    displayNamePage: {
        headerTitle: 'Display name',
        isShownOnProfile: 'Your display name is shown on your profile.',
    },
    timezonePage: {
        timezone: 'Timezone',
        isShownOnProfile: 'Your timezone is shown on your profile.',
        getLocationAutomatically: 'Automatically determine your location',
    },
    updateRequiredView: {
        updateRequired: 'Update required',
        pleaseInstall: 'Please update to the latest version of New Expensify',
        pleaseInstallExpensifyClassic: 'Please install the latest version of Expensify',
        toGetLatestChanges: 'For mobile, download and install the latest version. For web, refresh your browser.',
        newAppNotAvailable: 'The New Expensify app is no longer available.',
    },
    initialSettingsPage: {
        about: 'About',
        aboutPage: {
            description: 'The New Expensify App is built by a community of open-source developers from around the world. Help us build the future of Expensify.',
            appDownloadLinks: 'App download links',
            viewKeyboardShortcuts: 'View keyboard shortcuts',
            viewTheCode: 'View the code',
            viewOpenJobs: 'View open jobs',
            reportABug: 'Report a bug',
            troubleshoot: 'Troubleshoot',
        },
        appDownloadLinks: {
            android: {
                label: 'Android',
            },
            ios: {
                label: 'iOS',
            },
        },
        troubleshoot: {
            clearCacheAndRestart: 'Clear cache and restart',
            viewConsole: 'View debug console',
            debugConsole: 'Debug console',
            description:
                '<muted-text>Use the tools below to help troubleshoot the Expensify experience. If you encounter any issues, please <concierge-link>submit a bug</concierge-link>.</muted-text>',
            confirmResetDescription: 'All unsent draft messages will be lost, but the rest of your data is safe.',
            resetAndRefresh: 'Reset and refresh',
            clientSideLogging: 'Client side logging',
            noLogsToShare: 'No logs to share',
            useProfiling: 'Use profiling',
            profileTrace: 'Profile trace',
            results: 'Results',
            releaseOptions: 'Release options',
            testingPreferences: 'Testing preferences',
            useStagingServer: 'Use Staging Server',
            forceOffline: 'Force offline',
            simulatePoorConnection: 'Simulate poor internet connection',
            simulateFailingNetworkRequests: 'Simulate failing network requests',
            authenticationStatus: 'Authentication status',
            deviceCredentials: 'Device credentials',
            invalidate: 'Invalidate',
            destroy: 'Destroy',
            maskExportOnyxStateData: 'Mask fragile member data while exporting Onyx state',
            exportOnyxState: 'Export Onyx state',
            importOnyxState: 'Import Onyx state',
            testCrash: 'Test crash',
            resetToOriginalState: 'Reset to original state',
            usingImportedState: 'You are using imported state. Press here to clear it.',
            debugMode: 'Debug mode',
            invalidFile: 'Invalid file',
            invalidFileDescription: 'The file you are trying to import is not valid. Please try again.',
            invalidateWithDelay: 'Invalidate with delay',
            leftHandNavCache: 'Left Hand Nav cache',
            clearleftHandNavCache: 'Clear',
            recordTroubleshootData: 'Record Troubleshoot Data',
            softKillTheApp: 'Soft kill the app',
            kill: 'Kill',
            sentryDebug: 'Sentry debug',
            sentryDebugDescription: 'Log Sentry requests to console',
            sentryHighlightedSpanOps: 'Highlighted span names',
            sentryHighlightedSpanOpsPlaceholder: 'ui.interaction.click, navigation, ui.load',
        },
        debugConsole: {
            saveLog: 'Save log',
            shareLog: 'Share log',
            enterCommand: 'Enter command',
            execute: 'Execute',
            noLogsAvailable: 'No logs available',
            logSizeTooLarge: ({size}: LogSizeParams) => `Log size exceeds the limit of ${size} MB. Please use "Save log" to download the log file instead.`,
            logs: 'Logs',
            viewConsole: 'View console',
        },
        security: 'Security',
        signOut: 'Sign out',
        restoreStashed: 'Restore stashed login',
        signOutConfirmationText: "You'll lose any offline changes if you sign out.",
        versionLetter: 'v',
        readTheTermsAndPrivacy: `<muted-text-micro>Read the <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Terms of Service</a> and <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Privacy</a>.</muted-text-micro>`,
        help: 'Help',
        whatIsNew: "What's new",
        accountSettings: 'Account settings',
        account: 'Account',
        general: 'General',
    },
    closeAccountPage: {
        // @context close as a verb, not an adjective
        closeAccount: 'Close account',
        reasonForLeavingPrompt: 'We’d hate to see you go! Would you kindly tell us why, so we can improve?',
        enterMessageHere: 'Enter message here',
        closeAccountWarning: 'Closing your account cannot be undone.',
        closeAccountPermanentlyDeleteData: 'Are you sure you want to delete your account? This will permanently delete any outstanding expenses.',
        enterDefaultContactToConfirm: 'Please enter your default contact method to confirm you wish to close your account. Your default contact method is:',
        enterDefaultContact: 'Enter your default contact method',
        defaultContact: 'Default contact method:',
        enterYourDefaultContactMethod: 'Please enter your default contact method to close your account.',
    },
    mergeAccountsPage: {
        mergeAccount: 'Merge accounts',
        accountDetails: {
            accountToMergeInto: ({login}: MergeAccountIntoParams) => `Enter the account you want to merge into <strong>${login}</strong>.`,
            notReversibleConsent: 'I understand this is not reversible',
        },
        accountValidate: {
            confirmMerge: 'Are you sure you want to merge accounts?',
            lossOfUnsubmittedData: ({login}: MergeAccountIntoParams) =>
                `Merging your accounts is irreversible and will result in the loss of any unsubmitted expenses for <strong>${login}</strong>.`,
            enterMagicCode: ({login}: MergeAccountIntoParams) => `To continue, please enter the magic code sent to <strong>${login}</strong>.`,
            errors: {
                incorrectMagicCode: 'Incorrect or invalid magic code. Please try again or request a new code.',
                fallback: 'Something went wrong. Please try again later.',
            },
        },
        mergeSuccess: {
            accountsMerged: 'Accounts merged!',
            description: ({from, to}: MergeSuccessDescriptionParams) =>
                `<muted-text><centered-text>You've successfully merged all data from <strong>${from}</strong> into <strong>${to}</strong>. Moving forward, you can use either login for this account.</centered-text></muted-text>`,
        },
        mergePendingSAML: {
            weAreWorkingOnIt: 'We’re working on it',
            limitedSupport: 'We don’t yet support merging accounts on New Expensify. Please take this action on Expensify Classic instead.',
            reachOutForHelp: '<muted-text><centered-text>Feel free to <concierge-link>reach out to Concierge</concierge-link> if you have any questions!</centered-text></muted-text>',
            goToExpensifyClassic: 'Go to Expensify Classic',
        },
        mergeFailureSAMLDomainControlDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>You can’t merge <strong>${email}</strong> because it’s controlled by <strong>${email.split('@').at(1) ?? ''}</strong>. Please <concierge-link>reach out to Concierge</concierge-link> for assistance.</centered-text></muted-text>`,
        mergeFailureSAMLAccountDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>You can’t merge <strong>${email}</strong> into other accounts because your domain admin has set it as your primary login. Please merge other accounts into it instead.</centered-text></muted-text>`,
        mergeFailure2FA: {
            description: ({email}: MergeFailureDescriptionGenericParams) =>
                `<muted-text><centered-text>You can’t merge accounts because <strong>${email}</strong> has two-factor authentication (2FA) enabled. Please disable 2FA for <strong>${email}</strong> and try again.</centered-text></muted-text>`,
            learnMore: 'Learn more about merging accounts.',
        },
        mergeFailureAccountLockedDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>You can’t merge <strong>${email}</strong> because it’s locked. Please <concierge-link>reach out to Concierge</concierge-link> for assistance.</centered-text></muted-text>`,
        mergeFailureUncreatedAccountDescription: ({email, contactMethodLink}: MergeFailureUncreatedAccountDescriptionParams) =>
            `<muted-text><centered-text>You can’t merge accounts because <strong>${email}</strong> doesn’t have an Expensify account. Please <a href="${contactMethodLink}">add it as a contact method</a> instead.</centered-text></muted-text>`,
        mergeFailureSmartScannerAccountDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>You can’t merge <strong>${email}</strong> into other accounts. Please merge other accounts into it instead.</centered-text></muted-text>`,
        mergeFailureInvoicedAccountDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>You can’t merge accounts into <strong>${email}</strong> because this account owns an invoiced billing relationship.</centered-text></muted-text>`,
        mergeFailureTooManyAttempts: {
            heading: 'Try again later',
            description: 'There were too many attempts to merge accounts. Please try again later.',
        },
        mergeFailureUnvalidatedAccount: {
            description: "You can't merge into other accounts because it's not validated. Please validate the account and try again.",
        },
        mergeFailureSelfMerge: {
            description: 'You cannot merge an account into itself.',
        },
        mergeFailureGenericHeading: 'Can’t merge accounts',
    },
    lockAccountPage: {
        reportSuspiciousActivity: 'Report suspicious activity',
        lockAccount: 'Lock account',
        unlockAccount: 'Unlock account',
        compromisedDescription:
            'Notice something off with your account? Reporting it will immediately lock your account, block new Expensify Card transactions, and prevent any account changes.',
        domainAdminsDescription: 'For domain admins: This also pauses all Expensify Card activity and admin actions across your domain(s).',
        areYouSure: 'Are you sure you want to lock your Expensify account?',
        onceLocked: 'Once locked, your account will be restricted pending an unlock request and a security review',
    },
    failedToLockAccountPage: {
        failedToLockAccount: 'Failed to lock account',
        failedToLockAccountDescription: `We couldn't lock your account. Please chat with Concierge to resolve this problem.`,
        chatWithConcierge: 'Chat with Concierge',
    },
    unlockAccountPage: {
        accountLocked: 'Account locked',
        yourAccountIsLocked: 'Your account is locked',
        chatToConciergeToUnlock: 'Chat with Concierge to resolve security concerns and unlock your account.',
        chatWithConcierge: 'Chat with Concierge',
    },
    twoFactorAuth: {
        headerTitle: 'Two-factor authentication',
        twoFactorAuthEnabled: 'Two-factor authentication enabled',
        whatIsTwoFactorAuth: 'Two-factor authentication (2FA) helps keep your account safe. When logging in, you’ll need to enter a code generated by your preferred authenticator app.',
        disableTwoFactorAuth: 'Disable two-factor authentication',
        explainProcessToRemove: 'In order to disable two-factor authentication (2FA), please enter a valid code from your authentication app.',
        explainProcessToRemoveWithRecovery: 'In order to disable two-factor authentication (2FA), please enter a valid recovery code.',
        disabled: 'Two-factor authentication is now disabled',
        noAuthenticatorApp: 'You’ll no longer require an authenticator app to log into Expensify.',
        stepCodes: 'Recovery codes',
        keepCodesSafe: 'Keep these recovery codes safe!',
        codesLoseAccess: dedent(`
            If you lose access to your authenticator app and don't have these codes, you'll lose access to your account.

            Note: Setting up two-factor authentication will log you out of all other active sessions.
        `),
        errorStepCodes: 'Please copy or download codes before continuing',
        stepVerify: 'Verify',
        scanCode: 'Scan the QR code using your',
        authenticatorApp: 'authenticator app',
        addKey: 'Or add this secret key to your authenticator app:',
        enterCode: 'Then enter the six-digit code generated from your authenticator app.',
        stepSuccess: 'Finished',
        enabled: 'Two-factor authentication enabled',
        congrats: 'Congrats! Now you’ve got that extra security.',
        copy: 'Copy',
        disable: 'Disable',
        enableTwoFactorAuth: 'Enable two-factor authentication',
        pleaseEnableTwoFactorAuth: 'Please enable two-factor authentication.',
        twoFactorAuthIsRequiredDescription: 'For security purposes, Xero requires two-factor authentication to connect the integration.',
        twoFactorAuthIsRequiredForAdminsHeader: 'Two-factor authentication required',
        twoFactorAuthIsRequiredForAdminsTitle: 'Please enable two-factor authentication',
        twoFactorAuthIsRequiredXero: 'Your Xero accounting connection requires two-factor authentication.',
        twoFactorAuthIsRequiredCompany: 'Your company requires two-factor authentication.',
        twoFactorAuthCannotDisable: 'Cannot disable 2FA',
        twoFactorAuthRequired: 'Two-factor authentication (2FA) is required for your Xero connection and cannot be disabled.',
    },
    recoveryCodeForm: {
        error: {
            pleaseFillRecoveryCode: 'Please enter your recovery code',
            incorrectRecoveryCode: 'Incorrect recovery code. Please try again.',
        },
        useRecoveryCode: 'Use recovery code',
        recoveryCode: 'Recovery code',
        use2fa: 'Use two-factor authentication code',
    },
    twoFactorAuthForm: {
        error: {
            pleaseFillTwoFactorAuth: 'Please enter your two-factor authentication code',
            incorrect2fa: 'Incorrect two-factor authentication code. Please try again.',
        },
    },
    passwordConfirmationScreen: {
        passwordUpdated: 'Password updated!',
        allSet: 'You’re all set. Keep your new password safe.',
    },
    privateNotes: {
        title: 'Private notes',
        personalNoteMessage: "Keep notes about this chat here. You're the only person who can add, edit, or view these notes.",
        sharedNoteMessage: 'Keep notes about this chat here. Expensify employees and other members on the team.expensify.com domain can view these notes.',
        composerLabel: 'Notes',
        myNote: 'My note',
        error: {
            genericFailureMessage: "Private notes couldn't be saved",
        },
    },
    billingCurrency: {
        error: {
            securityCode: 'Please enter a valid security code',
        },
        securityCode: 'Security code',
        changeBillingCurrency: 'Change billing currency',
        changePaymentCurrency: 'Change payment currency',
        paymentCurrency: 'Payment currency',
        paymentCurrencyDescription: 'Select a standardized currency that all personal expenses should be converted to',
        note: `Note: Changing your payment currency can impact how much you’ll pay for Expensify. Refer to our <a href="${CONST.PRICING}">pricing page</a> for full details.`,
    },
    addDebitCardPage: {
        addADebitCard: 'Add a debit card',
        nameOnCard: 'Name on card',
        debitCardNumber: 'Debit card number',
        expiration: 'Expiration date',
        expirationDate: 'MMYY',
        cvv: 'CVV',
        billingAddress: 'Billing address',
        growlMessageOnSave: 'Your debit card was successfully added',
        expensifyPassword: 'Expensify password',
        error: {
            invalidName: 'Name can only include letters',
            addressZipCode: 'Please enter a valid zip code',
            debitCardNumber: 'Please enter a valid debit card number',
            expirationDate: 'Please select a valid expiration date',
            securityCode: 'Please enter a valid security code',
            addressStreet: "Please enter a valid billing address that's not a PO box",
            addressState: 'Please select a state',
            addressCity: 'Please enter a city',
            genericFailureMessage: 'An error occurred while adding your card. Please try again.',
            password: 'Please enter your Expensify password',
        },
    },
    addPaymentCardPage: {
        addAPaymentCard: 'Add payment card',
        nameOnCard: 'Name on card',
        paymentCardNumber: 'Card number',
        expiration: 'Expiration date',
        expirationDate: 'MM/YY',
        cvv: 'CVV',
        billingAddress: 'Billing address',
        growlMessageOnSave: 'Your payment card was successfully added',
        expensifyPassword: 'Expensify password',
        error: {
            invalidName: 'Name can only include letters',
            addressZipCode: 'Please enter a valid zip code',
            paymentCardNumber: 'Please enter a valid card number',
            expirationDate: 'Please select a valid expiration date',
            securityCode: 'Please enter a valid security code',
            addressStreet: "Please enter a valid billing address that's not a PO box",
            addressState: 'Please select a state',
            addressCity: 'Please enter a city',
            genericFailureMessage: 'An error occurred while adding your card. Please try again.',
            password: 'Please enter your Expensify password',
        },
    },
    walletPage: {
        balance: 'Balance',
        paymentMethodsTitle: 'Payment methods',
        setDefaultConfirmation: 'Make default payment method',
        setDefaultSuccess: 'Default payment method set!',
        deleteAccount: 'Delete account',
        deleteConfirmation: 'Are you sure you want to delete this account?',
        error: {
            notOwnerOfBankAccount: 'An error occurred while setting this bank account as your default payment method',
            invalidBankAccount: 'This bank account is temporarily suspended',
            notOwnerOfFund: 'An error occurred while setting this card as your default payment method',
            setDefaultFailure: 'Something went wrong. Please chat with Concierge for further assistance.',
        },
        addBankAccountFailure: 'An unexpected error occurred while trying to add your bank account. Please try again.',
        getPaidFaster: 'Get paid faster',
        addPaymentMethod: 'Add a payment method to send and receive payments directly in the app.',
        getPaidBackFaster: 'Get paid back faster',
        secureAccessToYourMoney: 'Secure access to your money',
        receiveMoney: 'Receive money in your local currency',
        expensifyWallet: 'Expensify Wallet (Beta)',
        sendAndReceiveMoney: 'Send and receive money with friends. US bank accounts only.',
        enableWallet: 'Enable wallet',
        addBankAccountToSendAndReceive: 'Add a bank account to make or receive payments.',
        addDebitOrCreditCard: 'Add debit or credit card',
        assignedCards: 'Assigned cards',
        assignedCardsDescription: 'These are cards assigned by a workspace admin to manage company spend.',
        expensifyCard: 'Expensify Card',
        walletActivationPending: "We're reviewing your information. Please check back in a few minutes!",
        walletActivationFailed: "Unfortunately, your wallet can't be enabled at this time. Please chat with Concierge for further assistance.",
        addYourBankAccount: 'Add your bank account',
        addBankAccountBody: "Let's connect your bank account to Expensify so it’s easier than ever to send and receive payments directly in the app.",
        chooseYourBankAccount: 'Choose your bank account',
        chooseAccountBody: 'Make sure that you select the right one.',
        confirmYourBankAccount: 'Confirm your bank account',
        personalBankAccounts: 'Personal bank accounts',
        businessBankAccounts: 'Business bank accounts',
        shareBankAccount: 'Share bank account',
        bankAccountShared: 'Bank account shared',
        shareBankAccountTitle: 'Select the admins to share this bank account with:',
        shareBankAccountSuccess: 'Bank account shared!',
        shareBankAccountSuccessDescription: 'The selected admins will receive a confirmation message from Concierge.',
        shareBankAccountFailure: 'An unexpected error occurred while trying to share bank account. Please try again.',
        shareBankAccountEmptyTitle: 'No admins available',
        shareBankAccountEmptyDescription: 'There are no workspace admins you can share this bank account with.',
        shareBankAccountNoAdminsSelected: 'Please select an admin before continuing',
        unshareBankAccount: 'Unshare bank account',
        unshareBankAccountDescription: 'Everyone below has access to this bank account. You can remove access at any point. We’ll still complete any payments in process.',
        unshareBankAccountWarning: ({admin}: {admin?: string | null}) => `${admin} will lose access to this business bank account. We’ll still complete any payments in process.`,
        reachOutForHelp: 'It’s being used with the Expensify Card. <concierge-link>Reach out to Concierge</concierge-link> if you need to unshare it.',
        unshareErrorModalTitle: 'Can’t unshare bank account',
    },
    cardPage: {
        expensifyCard: 'Expensify Card',
        expensifyTravelCard: 'Expensify Travel Card',
        availableSpend: 'Remaining limit',
        smartLimit: {
            name: 'Smart limit',
            title: ({formattedLimit}: ViolationsOverLimitParams) => `You can spend up to ${formattedLimit} on this card, and the limit will reset as your submitted expenses are approved.`,
        },
        fixedLimit: {
            name: 'Fixed limit',
            title: ({formattedLimit}: ViolationsOverLimitParams) => `You can spend up to ${formattedLimit} on this card, and then it will deactivate.`,
        },
        monthlyLimit: {
            name: 'Monthly limit',
            title: ({formattedLimit}: ViolationsOverLimitParams) =>
                `You can spend up to ${formattedLimit} on this card per month. The limit will reset on the 1st day of each calendar month.`,
        },
        virtualCardNumber: 'Virtual card number',
        travelCardCvv: 'Travel card CVV',
        physicalCardNumber: 'Physical card number',
        physicalCardPin: 'PIN',
        getPhysicalCard: 'Get physical card',
        reportFraud: 'Report virtual card fraud',
        reportTravelFraud: 'Report travel card fraud',
        reviewTransaction: 'Review transaction',
        suspiciousBannerTitle: 'Suspicious transaction',
        suspiciousBannerDescription: 'We noticed suspicious transactions on your card. Tap below to review.',
        cardLocked: "Your card is temporarily locked while our team reviews your company's account.",
        cardDetails: {
            cardNumber: 'Virtual card number',
            expiration: 'Expiration',
            cvv: 'CVV',
            address: 'Address',
            revealDetails: 'Reveal details',
            revealCvv: 'Reveal CVV',
            copyCardNumber: 'Copy card number',
            updateAddress: 'Update address',
        },
        cardAddedToWallet: ({platform}: {platform: 'Google' | 'Apple'}) => `Added to ${platform} Wallet`,
        cardDetailsLoadingFailure: 'An error occurred while loading the card details. Please check your internet connection and try again.',
        validateCardTitle: "Let's make sure it's you",
        enterMagicCode: (contactMethod: string) => `Please enter the magic code sent to ${contactMethod} to view your card details. It should arrive within a minute or two.`,
        missingPrivateDetails: ({missingDetailsLink}: {missingDetailsLink: string}) => `Please <a href="${missingDetailsLink}">add your personal details</a>, then try again.`,
        unexpectedError: 'There was an error trying to get your Expensify card details. Please try again.',
        cardFraudAlert: {
            confirmButtonText: 'Yes, I do',
            reportFraudButtonText: "No, it wasn't me",
            clearedMessage: ({cardLastFour}: {cardLastFour: string}) => `cleared the suspicious activity and reactivated card x${cardLastFour}. All set to keep expensing!`,
            deactivatedMessage: ({cardLastFour}: {cardLastFour: string}) => `deactivated the card ending in ${cardLastFour}`,
            alertMessage: ({cardLastFour, amount, merchant, date}: {cardLastFour: string; amount: string; merchant: string; date: string}) =>
                `identified suspicious activity on card ending in ${cardLastFour}. Do you recognize this charge?\n\n${amount} for ${merchant} - ${date}`,
        },
    },
    workflowsPage: {
        workflowTitle: 'Spend',
        workflowDescription: 'Configure a workflow from the moment spend occurs, including approval and payment.',
        submissionFrequency: 'Submissions',
        submissionFrequencyDescription: 'Choose a custom schedule for submitting expenses.',
        submissionFrequencyDateOfMonth: 'Date of month',
        disableApprovalPromptDescription: 'Disabling approvals will erase all existing approval workflows.',
        addApprovalsTitle: 'Approvals',
        addApprovalButton: 'Add approval workflow',
        addApprovalTip: 'This default workflow applies to all members, unless a more specific workflow exists.',
        approver: 'Approver',
        addApprovalsDescription: 'Require additional approval before authorizing a payment.',
        makeOrTrackPaymentsTitle: 'Payments',
        makeOrTrackPaymentsDescription: 'Add an authorized payer for payments made in Expensify or track payments made elsewhere.',
        customApprovalWorkflowEnabled:
            '<muted-text-label>A custom approval workflow is enabled on this workspace. To review or change this workflow, please reach out to your <account-manager-link>Account Manager</account-manager-link> or <concierge-link>Concierge</concierge-link>.</muted-text-label>',
        customApprovalWorkflowEnabledConciergeOnly:
            '<muted-text-label>A custom approval workflow is enabled on this workspace. To review or change this workflow, please reach out to <concierge-link>Concierge</concierge-link>.</muted-text-label>',
        editor: {
            submissionFrequency: 'Choose how long Expensify should wait before sharing error-free spend.',
        },
        frequencyDescription: 'Choose how often you’d like expenses to submit automatically, or make it manual',
        frequencies: {
            instant: 'Instantly',
            weekly: 'Weekly',
            monthly: 'Monthly',
            twiceAMonth: 'Twice a month',
            byTrip: 'By trip',
            manually: 'Manually',
            daily: 'Daily',
            lastDayOfMonth: 'Last day of the month',
            lastBusinessDayOfMonth: 'Last business day of the month',
            ordinals: {
                one: 'st',
                two: 'nd',
                few: 'rd',
                other: 'th',
                /* eslint-disable @typescript-eslint/naming-convention */
                '1': 'First',
                '2': 'Second',
                '3': 'Third',
                '4': 'Fourth',
                '5': 'Fifth',
                '6': 'Sixth',
                '7': 'Seventh',
                '8': 'Eighth',
                '9': 'Ninth',
                '10': 'Tenth',
                /* eslint-enable @typescript-eslint/naming-convention */
            },
        },
        approverInMultipleWorkflows: 'This member already belongs to another approval workflow. Any updates here will reflect there too.',
        approverCircularReference: (name1: string, name2: string) =>
            `<strong>${name1}</strong> already approves reports to <strong>${name2}</strong>. Please choose a different approver to avoid a circular workflow.`,
        emptyContent: {
            title: 'No members to display',
            expensesFromSubtitle: 'All workspace members already belong to an existing approval workflow.',
            approverSubtitle: 'All approvers belong to an existing workflow.',
        },
    },
    workflowsDelayedSubmissionPage: {
        autoReportingFrequencyErrorMessage: "Submission frequency couldn't be changed. Please try again or contact support.",
        monthlyOffsetErrorMessage: "Monthly frequency couldn't be changed. Please try again or contact support.",
    },
    workflowsCreateApprovalsPage: {
        title: 'Confirm',
        header: 'Add more approvers and confirm.',
        additionalApprover: 'Additional approver',
        submitButton: 'Add workflow',
    },
    workflowsEditApprovalsPage: {
        title: 'Edit approval workflow',
        deleteTitle: 'Delete approval workflow',
        deletePrompt: 'Are you sure you want to delete this approval workflow? All members will subsequently follow the default workflow.',
    },
    workflowsExpensesFromPage: {
        title: 'Expenses from',
        header: 'When the following members submit expenses:',
    },
    workflowsApproverPage: {
        genericErrorMessage: "The approver couldn't be changed. Please try again or contact support.",
        title: 'Set approver',
        description: 'This person will approve the expenses.',
    },
    workflowsApprovalLimitPage: {
        title: 'Approver',
        header: '(Optional) Want to add an approval limit?',
        description: ({approverName}: {approverName: string}) =>
            approverName
                ? `Add another approver when <strong>${approverName}</strong> is approver and report exceeds the amount below:`
                : 'Add another approver when a report exceeds the amount below:',
        reportAmountLabel: 'Report amount',
        additionalApproverLabel: 'Additional approver',
        skip: 'Skip',
        next: 'Next',
        removeLimit: 'Remove limit',
        enterAmountError: 'Please enter a valid amount',
        enterApproverError: 'Approver is required when you set a report limit',
        enterBothError: 'Enter a report amount and additional approver',
        forwardLimitDescription: ({approvalLimit, approverName}: {approvalLimit: string; approverName: string}) => `Reports above ${approvalLimit} forward to ${approverName}`,
    },
    workflowsPayerPage: {
        title: 'Authorized payer',
        genericErrorMessage: 'The authorized payer could not be changed. Please try again.',
        admins: 'Admins',
        payer: 'Payer',
        paymentAccount: 'Payment account',
    },
    reportFraudPage: {
        title: 'Report virtual card fraud',
        description: 'If your virtual card details have been stolen or compromised, we’ll permanently deactivate your existing card and provide you with a new virtual card and number.',
        deactivateCard: 'Deactivate card',
        reportVirtualCardFraud: 'Report virtual card fraud',
    },
    reportFraudConfirmationPage: {
        title: 'Card fraud reported',
        description: 'We’ve permanently deactivated your existing card. When you go back to view your card details, you’ll have a new virtual card available.',
        buttonText: 'Got it, thanks!',
    },
    activateCardPage: {
        activateCard: 'Activate card',
        pleaseEnterLastFour: 'Please enter the last four digits of your card.',
        activatePhysicalCard: 'Activate physical card',
        error: {
            thatDidNotMatch: "That didn't match the last 4 digits on your card. Please try again.",
            throttled:
                "You've incorrectly entered the last 4 digits of your Expensify Card too many times. If you're sure the numbers are correct, please reach out to Concierge to resolve. Otherwise, try again later.",
        },
    },
    getPhysicalCard: {
        header: 'Get physical card',
        nameMessage: 'Enter your first and last name, as this will be shown on your card.',
        legalName: 'Legal name',
        legalFirstName: 'Legal first name',
        legalLastName: 'Legal last name',
        phoneMessage: 'Enter your phone number.',
        phoneNumber: 'Phone number',
        address: 'Address',
        addressMessage: 'Enter your shipping address.',
        streetAddress: 'Street Address',
        city: 'City',
        state: 'State',
        zipPostcode: 'Zip/Postcode',
        country: 'Country',
        confirmMessage: 'Please confirm your details below.',
        estimatedDeliveryMessage: 'Your physical card will arrive in 2-3 business days.',
        next: 'Next',
        getPhysicalCard: 'Get physical card',
        shipCard: 'Ship card',
    },
    transferAmountPage: {
        transfer: ({amount}: TransferParams) => `Transfer${amount ? ` ${amount}` : ''}`,
        instant: 'Instant (Debit card)',
        instantSummary: (rate: string, minAmount: string) => `${rate}% fee (${minAmount} minimum)`,
        ach: '1-3 Business days (Bank account)',
        achSummary: 'No fee',
        whichAccount: 'Which account?',
        fee: 'Fee',
        transferSuccess: 'Transfer successful!',
        transferDetailBankAccount: 'Your money should arrive in the next 1-3 business days.',
        transferDetailDebitCard: 'Your money should arrive immediately.',
        failedTransfer: 'Your balance isn’t fully settled. Please transfer to a bank account.',
        notHereSubTitle: 'Please transfer your balance from the wallet page',
        goToWallet: 'Go to Wallet',
    },
    chooseTransferAccountPage: {
        chooseAccount: 'Choose account',
    },
    paymentMethodList: {
        addPaymentMethod: 'Add payment method',
        addNewDebitCard: 'Add new debit card',
        addNewBankAccount: 'Add new bank account',
        accountLastFour: 'Ending in',
        cardLastFour: 'Card ending in',
        addFirstPaymentMethod: 'Add a payment method to send and receive payments directly in the app.',
        defaultPaymentMethod: 'Default',
        bankAccountLastFour: (lastFour: string) => `Bank Account • ${lastFour}`,
    },
    expenseRulesPage: {
        title: 'Expense rules',
        subtitle: 'These rules will apply to your expenses. If you submit to a workspace, then the workspace rules may override them.',
        emptyRules: {
            title: "You haven't created any rules",
            subtitle: 'Add a rule to automate expense reporting.',
        },
        changes: {
            billable: (value: boolean) => `Update expense ${value ? 'billable' : 'non-billable'}`,
            category: (value: string) => `Update category to "${value}"`,
            comment: (value: string) => `Change description to "${value}"`,
            merchant: (value: string) => `Update merchant to "${value}"`,
            reimbursable: (value: boolean) => `Update expense ${value ? 'reimbursable' : 'non-reimbursable'}`,
            report: (value: string) => `Add to a report named "${value}"`,
            tag: (value: string) => `Update tag to "${value}"`,
            tax: (value: string) => `Update tax rate to "${value}"`,
        },
        newRule: 'New rule',
        addRule: {
            title: 'Add rule',
            expenseContains: 'If expense contains:',
            applyUpdates: 'Then apply these updates:',
            merchantHint: 'Type * to create a rule that applies to all merchants',
            addToReport: 'Add to a report named',
            createReport: 'Create report if necessary',
            applyToExistingExpenses: 'Apply to existing matching expenses',
            confirmError: 'Enter merchant and apply at least one update',
            confirmErrorMerchant: 'Please enter merchant',
            confirmErrorUpdate: 'Please apply at least one update',
            saveRule: 'Save rule',
        },
        editRule: {
            title: 'Edit rule',
        },
        deleteRule: {
            deleteSingle: 'Delete rule',
            deleteMultiple: 'Delete rules',
            deleteSinglePrompt: 'Are you sure you want to delete this rule?',
            deleteMultiplePrompt: 'Are you sure you want to delete these rules?',
        },
    },
    preferencesPage: {
        appSection: {
            title: 'App preferences',
        },
        testSection: {
            title: 'Test preferences',
            subtitle: 'Settings to help debug and test the app on staging.',
        },
        receiveRelevantFeatureUpdatesAndExpensifyNews: 'Receive relevant feature updates and Expensify news',
        muteAllSounds: 'Mute all sounds from Expensify',
    },
    priorityModePage: {
        priorityMode: 'Priority mode',
        explainerText: 'Choose whether to #focus on unread and pinned chats only, or show everything with the most recent and pinned chats at the top.',
        priorityModes: {
            default: {
                label: 'Most recent',
                description: 'Show all chats sorted by most recent',
            },
            gsd: {
                label: '#focus',
                description: 'Only show unread sorted alphabetically',
            },
        },
    },
    reportDetailsPage: {
        inWorkspace: ({policyName}: ReportPolicyNameParams) => `in ${policyName}`,
        generatingPDF: 'Generate PDF',
        waitForPDF: 'Please wait while we generate the PDF.',
        errorPDF: 'There was an error when trying to generate your PDF',
        successPDF: "Your PDF has been generated! If it didn't automatically download, use the button below.",
    },
    reportDescriptionPage: {
        roomDescription: 'Room description',
        roomDescriptionOptional: 'Room description (optional)',
        explainerText: 'Set a custom description for the room.',
    },
    groupChat: {
        lastMemberTitle: 'Heads up!',
        lastMemberWarning: "Since you're the last person here, leaving will make this chat inaccessible to all members. Are you sure you want to leave?",
        defaultReportName: ({displayName}: ReportArchiveReasonsClosedParams) => `${displayName}'s group chat`,
    },
    languagePage: {
        language: 'Language',
        aiGenerated: 'The translations for this language are generated automatically and may contain errors.',
    },
    themePage: {
        theme: 'Theme',
        themes: {
            dark: {
                label: 'Dark',
            },
            light: {
                label: 'Light',
            },
            system: {
                label: 'Use device settings',
            },
        },
        chooseThemeBelowOrSync: 'Choose a theme below, or sync with your device settings.',
    },
    termsOfUse: {
        terms: `<muted-text-xs>By logging in, you agree to the <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Terms of Service</a> and <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Privacy</a>.</muted-text-xs>`,
        license: `<muted-text-xs>Money transmission is provided by ${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS} (NMLS ID:2017010) pursuant to its <a href="${CONST.OLD_DOT_PUBLIC_URLS.LICENSES_URL}">licenses</a>.</muted-text-xs>`,
    },
    validateCodeForm: {
        magicCodeNotReceived: "Didn't receive a magic code?",
        enterAuthenticatorCode: 'Please enter your authenticator code',
        enterRecoveryCode: 'Please enter your recovery code',
        requiredWhen2FAEnabled: 'Required when 2FA is enabled',
        requestNewCode: ({timeRemaining}: {timeRemaining: string}) => `Request a new code in <a>${timeRemaining}</a>`,
        requestNewCodeAfterErrorOccurred: 'Request a new code',
        error: {
            pleaseFillMagicCode: 'Please enter your magic code',
            incorrectMagicCode: 'Incorrect or invalid magic code. Please try again or request a new code.',
            pleaseFillTwoFactorAuth: 'Please enter your two-factor authentication code',
        },
    },
    passwordForm: {
        pleaseFillOutAllFields: 'Please fill out all fields',
        pleaseFillPassword: 'Please enter your password',
        pleaseFillTwoFactorAuth: 'Please enter your two-factor code',
        enterYourTwoFactorAuthenticationCodeToContinue: 'Enter your two-factor authentication code to continue',
        forgot: 'Forgot?',
        requiredWhen2FAEnabled: 'Required when 2FA is enabled',
        error: {
            incorrectPassword: 'Incorrect password. Please try again.',
            incorrectLoginOrPassword: 'Incorrect login or password. Please try again.',
            incorrect2fa: 'Incorrect two-factor authentication code. Please try again.',
            twoFactorAuthenticationEnabled: 'You have 2FA enabled on this account. Please sign in using your email or phone number.',
            invalidLoginOrPassword: 'Invalid login or password. Please try again or reset your password.',
            unableToResetPassword:
                'We were unable to change your password. This is likely due to an expired password reset link in an old password reset email. We have emailed you a new link so you can try again. Check your Inbox and your Spam folder; it should arrive in just a few minutes.',
            noAccess: 'You do not have access to this application. Please add your GitHub username for access.',
            accountLocked: 'Your account has been locked after too many unsuccessful attempts. Please try again after 1 hour.',
            fallback: 'Something went wrong. Please try again later.',
        },
    },
    loginForm: {
        phoneOrEmail: 'Phone or email',
        error: {
            invalidFormatEmailLogin: 'The email entered is invalid. Please fix the format and try again.',
        },
        cannotGetAccountDetails: "Couldn't retrieve account details. Please try to sign in again.",
        loginForm: 'Login form',
        notYou: ({user}: NotYouParams) => `Not ${user}?`,
    },
    onboarding: {
        welcome: 'Welcome!',
        welcomeSignOffTitleManageTeam: 'Once you finish the tasks above, we can explore more functionality like approval workflows and rules!',
        welcomeSignOffTitle: "It's great to meet you!",
        explanationModal: {
            title: 'Welcome to Expensify',
            description: 'One app to handle your business and personal spend at the speed of chat. Try it out and let us know what you think. Much more to come!',
            secondaryDescription: 'To switch back to Expensify Classic, just tap your profile picture > Go to Expensify Classic.',
        },
        getStarted: 'Get started',
        whatsYourName: "What's your name?",
        peopleYouMayKnow: 'People you may know are already here! Verify your email to join them.',
        workspaceYouMayJoin: ({domain, email}: WorkspaceYouMayJoin) => `Someone from ${domain} has already created a workspace. Please enter the magic code sent to ${email}.`,
        joinAWorkspace: 'Join a workspace',
        listOfWorkspaces: "Here's the list of workspaces you can join. Don't worry, you can always join them later if you prefer.",
        workspaceMemberList: ({employeeCount, policyOwner}: WorkspaceMemberList) => `${employeeCount} member${employeeCount > 1 ? 's' : ''} • ${policyOwner}`,
        whereYouWork: 'Where do you work?',
        errorSelection: 'Select an option to move forward',
        purpose: {
            title: 'What do you want to do today?',
            errorContinue: 'Please press continue to get set up',
            errorBackButton: 'Please finish the setup questions to start using the app',
            [CONST.ONBOARDING_CHOICES.EMPLOYER]: 'Get paid back by my employer',
            [CONST.ONBOARDING_CHOICES.MANAGE_TEAM]: "Manage my team's expenses",
            [CONST.ONBOARDING_CHOICES.PERSONAL_SPEND]: 'Track and budget expenses',
            [CONST.ONBOARDING_CHOICES.CHAT_SPLIT]: 'Chat and split expenses with friends',
            [CONST.ONBOARDING_CHOICES.LOOKING_AROUND]: 'Something else',
        },
        employees: {
            title: 'How many employees do you have?',
            [CONST.ONBOARDING_COMPANY_SIZE.MICRO]: '1-10 employees',
            [CONST.ONBOARDING_COMPANY_SIZE.SMALL]: '11-50 employees',
            [CONST.ONBOARDING_COMPANY_SIZE.MEDIUM_SMALL]: '51-100 employees',
            [CONST.ONBOARDING_COMPANY_SIZE.MEDIUM]: '101-1,000 employees',
            [CONST.ONBOARDING_COMPANY_SIZE.LARGE]: 'More than 1,000 employees',
        },
        accounting: {
            title: 'Do you use any accounting software?',
            none: 'None',
        },
        interestedFeatures: {
            title: 'What features are you interested in?',
            featuresAlreadyEnabled: 'Here are our most popular features:',
            featureYouMayBeInterestedIn: 'Enable additional features:',
        },
        error: {
            requiredFirstName: 'Please input your first name to continue',
        },
        workEmail: {
            title: 'What’s your work email?',
            subtitle: 'Expensify works best when you connect your work email.',
            explanationModal: {
                descriptionOne: 'Forward to receipts@expensify.com for scanning',
                descriptionTwo: 'Join your colleagues already using Expensify',
                descriptionThree: 'Enjoy a more customized experience',
            },
            addWorkEmail: 'Add work email',
        },
        workEmailValidation: {
            title: 'Verify your work email',
            magicCodeSent: ({workEmail}: WorkEmailResendCodeParams) => `Please enter the magic code sent to ${workEmail}. It should arrive in a minute or two.`,
        },
        workEmailValidationError: {
            publicEmail: 'Please enter a valid work email from a private domain e.g. mitch@company.com',
            offline: 'We couldn’t add your work email as you appear to be offline',
        },
        mergeBlockScreen: {
            title: 'Couldn’t add work email',
            subtitle: ({workEmail}: WorkEmailMergingBlockedParams) => `We couldn’t add ${workEmail}. Please try again later in Settings or chat with Concierge for guidance.`,
        },
        tasks: {
            testDriveAdminTask: {
                title: ({testDriveURL}) => `Take a [test drive](${testDriveURL})`,
                description: ({testDriveURL}) => `[Take a quick product tour](${testDriveURL}) to see why Expensify is the fastest way to do your expenses.`,
            },
            testDriveEmployeeTask: {
                title: ({testDriveURL}) => `Take a [test drive](${testDriveURL})`,
                description: ({testDriveURL}) => `Take us for a [test drive](${testDriveURL}) and get your team *3 free months of Expensify!*`,
            },
            addExpenseApprovalsTask: {
                title: 'Add expense approvals',
                description: ({workspaceMoreFeaturesLink}) =>
                    dedent(`
                        *Add expense approvals* to review your team's spend and keep it under control.

                        Here's how:

                        1. Go to *Workspaces*.
                        2. Select your workspace.
                        3. Click *More features*.
                        4. Enable *Workflows*.
                        5. Navigate to *Workflows* in the workspace editor.
                        6. Enable *Add approvals*.
                        7. You'll be set as the expense approver. You can change this to any admin once you invite your team.

                        [Take me to more features](${workspaceMoreFeaturesLink}).
                    `),
            },
            createTestDriveAdminWorkspaceTask: {
                title: ({workspaceConfirmationLink}) => `[Create](${workspaceConfirmationLink}) a workspace`,
                description: 'Create a workspace and configure the settings with the help of your setup specialist!',
            },
            createWorkspaceTask: {
                title: ({workspaceSettingsLink}) => `Create a [workspace](${workspaceSettingsLink})`,
                description: ({workspaceSettingsLink}) =>
                    dedent(`
                        *Create a workspace* to track expenses, scan receipts, chat, and more.

                        1. Click *Workspaces* > *New workspace*.

                        *Your new workspace is ready!* [Check it out](${workspaceSettingsLink}).
                    `),
            },
            setupCategoriesTask: {
                title: ({workspaceCategoriesLink}) => `Set up [categories](${workspaceCategoriesLink})`,
                description: ({workspaceCategoriesLink}) =>
                    dedent(`
                        *Set up categories* so your team can code expenses for easy reporting.

                        1. Click *Workspaces*.
                        2. Select your workspace.
                        3. Click *Categories*.
                        4. Disable any categories you don't need.
                        5. Add your own categories in the top right.

                        [Take me to workspace category settings](${workspaceCategoriesLink}).

                        ![Set up categories](${CONST.CLOUDFRONT_URL}/videos/walkthrough-categories-v2.mp4)
                    `),
            },
            combinedTrackSubmitExpenseTask: {
                title: 'Submit an expense',
                description: dedent(`
                    *Submit an expense* by entering an amount or scanning a receipt.

                    1. Click the ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE} button.
                    2. Choose *Create expense*.
                    3. Enter an amount or scan a receipt.
                    4. Add your boss's email or phone number.
                    5. Click *Create*.

                    And you're done!
                `),
            },
            adminSubmitExpenseTask: {
                title: 'Submit an expense',
                description: dedent(`
                    *Submit an expense* by entering an amount or scanning a receipt.

                    1. Click the ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE} button.
                    2. Choose *Create expense*.
                    3. Enter an amount or scan a receipt.
                    4. Confirm details.
                    5. Click *Create*.

                    And you're done!
                `),
            },
            trackExpenseTask: {
                title: 'Track an expense',
                description: dedent(`
                    *Track an expense* in any currency, whether you have a receipt or not.

                    1. Click the ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE} button.
                    2. Choose *Create expense*.
                    3. Enter an amount or scan a receipt.
                    4. Choose your *personal* space.
                    5. Click *Create*.

                    And you're done! Yep, it's that easy.
                `),
            },
            addAccountingIntegrationTask: {
                title: ({integrationName, workspaceAccountingLink}) =>
                    `Connect${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? '' : ' to'} [${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? 'your' : ''} ${integrationName}](${workspaceAccountingLink})`,
                description: ({integrationName, workspaceAccountingLink}) =>
                    dedent(`
                        Connect ${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? 'your' : 'to'} ${integrationName} for automatic expense coding and syncing that makes month-end close a breeze.

                        1. Click *Workspaces*.
                        2. Select your workspace.
                        3. Click *Accounting*.
                        4. Find ${integrationName}.
                        5. Click *Connect*.

                        ${
                            integrationName && CONST.connectionsVideoPaths[integrationName]
                                ? `[Take me to accounting](${workspaceAccountingLink}).

                        ![Connect to ${integrationName}](${CONST.CLOUDFRONT_URL}/${CONST.connectionsVideoPaths[integrationName]})`
                                : `[Take me to accounting](${workspaceAccountingLink}).`
                        }`),
            },
            connectCorporateCardTask: {
                title: ({corporateCardLink}) => `Connect [your corporate cards](${corporateCardLink})`,
                description: ({corporateCardLink}) =>
                    dedent(`
                        Connect the cards you already have for automatic transaction import, receipt matching, and reconciliation.

                        1. Click *Workspaces*.
                        2. Select your workspace.
                        3. Click *Company cards*.
                        4. Follow the prompts to connect your cards.

                        [Take me to company cards](${corporateCardLink}).
                    `),
            },

            inviteTeamTask: {
                title: ({workspaceMembersLink}) => `Invite [your team](${workspaceMembersLink})`,
                description: ({workspaceMembersLink}) =>
                    dedent(`
                        *Invite your team* to Expensify so they can start tracking expenses today.

                        1. Click *Workspaces*.
                        2. Select your workspace.
                        3. Click *Members* > *Invite member*.
                        4. Enter emails or phone numbers.
                        5. Add a custom invite message if you'd like!

                        [Take me to workspace members](${workspaceMembersLink}).

                        ![Invite your team](${CONST.CLOUDFRONT_URL}/videos/walkthrough-invite_members-v2.mp4)
                    `),
            },

            setupCategoriesAndTags: {
                title: ({workspaceCategoriesLink, workspaceTagsLink}) => `Set up [categories](${workspaceCategoriesLink}) and [tags](${workspaceTagsLink})`,
                description: ({workspaceCategoriesLink, workspaceAccountingLink}) =>
                    dedent(`
                        *Set up categories and tags* so your team can code expenses for easy reporting.

                        Import them automatically by [connecting your accounting software](${workspaceAccountingLink}), or set them up manually in your [workspace settings](${workspaceCategoriesLink}).
                    `),
            },
            setupTagsTask: {
                title: ({workspaceTagsLink}) => `Set up [tags](${workspaceTagsLink})`,
                description: ({workspaceMoreFeaturesLink}) =>
                    dedent(`
                        Use tags to add extra expense details like projects, clients, locations, and departments. If you need multiple levels of tags, you can upgrade to the Control plan.

                        1. Click *Workspaces*.
                        2. Select your workspace.
                        3. Click *More features*.
                        4. Enable *Tags*.
                        5. Navigate to *Tags* in the workspace editor.
                        6. Click *+ Add tag* to make your own.

                        [Take me to more features](${workspaceMoreFeaturesLink}).

                        ![Set up tags](${CONST.CLOUDFRONT_URL}/videos/walkthrough-tags-v2.mp4)
                    `),
            },

            inviteAccountantTask: {
                title: ({workspaceMembersLink}) => `Invite your [accountant](${workspaceMembersLink})`,
                description: ({workspaceMembersLink}) =>
                    dedent(`
                        *Invite your accountant* to collaborate on your workspace and manage your business expenses.

                        1. Click *Workspaces*.
                        2. Select your workspace.
                        3. Click *Members*.
                        4. Click *Invite member*.
                        5. Enter your accountant's email address.

                        [Invite your accountant now](${workspaceMembersLink}).
                    `),
            },

            startChatTask: {
                title: 'Start a chat',
                description: dedent(`
                    *Start a chat* with anyone using their email or phone number.

                    1. Click the ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE} button.
                    2. Choose *Start chat*.
                    3. Enter an email or phone number.

                    If they're not using Expensify already, they'll be invited automatically.

                    Every chat will also turn into an email or text that they can respond to directly.
                `),
            },

            splitExpenseTask: {
                title: 'Split an expense',
                description: dedent(`
                    *Split expenses* with one or more people.

                    1. Click the ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE} button.
                    2. Choose *Start chat*.
                    3. Enter emails or phone numbers.
                    4. Click the grey *+* button in the chat > *Split expense*.
                    5. Create the expense by selecting *Manual*, *Scan*, or *Distance*.

                    Feel free to add more details if you want, or just send it off. Let's get you paid back!
                `),
            },

            reviewWorkspaceSettingsTask: {
                title: ({workspaceSettingsLink}) => `Review your [workspace settings](${workspaceSettingsLink})`,
                description: ({workspaceSettingsLink}) =>
                    dedent(`
                        Here's how to review and update your workspace settings:
                        1. Click Workspaces.
                        2. Select your workspace.
                        3. Review and update your settings.
                        [Go to your workspace.](${workspaceSettingsLink})
                    `),
            },
            createReportTask: {
                title: 'Create your first report',
                description: dedent(`
                    Here's how to create a report:

                    1. Click the ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE} button.
                    2. Choose *Create report*.
                    3. Click *Add expense*.
                    4. Add your first expense.

                    And you're done!
                `),
            },
        } satisfies Record<string, Pick<OnboardingTask, 'title' | 'description'>>,
        testDrive: {
            name: ({testDriveURL}: {testDriveURL?: string}) => (testDriveURL ? `Take a [test drive](${testDriveURL})` : 'Take a test drive'),
            embeddedDemoIframeTitle: 'Test Drive',
            employeeFakeReceipt: {
                description: 'My test drive receipt!',
            },
        },
        messages: {
            onboardingEmployerOrSubmitMessage: 'Getting paid back is as easy as sending a message. Let’s go over the basics.',
            onboardingPersonalSpendMessage: 'Here’s how to track your spend in a few clicks.',
            onboardingManageTeamMessage: ({isOnboardingFlow = false}: {isOnboardingFlow?: boolean}) =>
                isOnboardingFlow
                    ? dedent(`
                        # Your free trial has started! Let's get you set up.
                        👋 Hey there, I'm your Expensify setup specialist. I've already created a workspace to help manage your team's receipts and expenses. To make the most of your 30-day free trial, just follow the remaining setup steps below!
                    `)
                    : dedent(`
                        # Your free trial has started! Let's get you set up.
                        👋 Hey there, I'm your Expensify setup specialist. Now that you've created a workspace, make the most of your 30-day free trial by following the steps below!
                    `),
            onboardingTrackWorkspaceMessage:
                "# Let’s get you set up\n👋 Hey there, I'm your Expensify setup specialist. I've already created a workspace to help manage your receipts and expenses. To make the most of your 30-day free trial, just follow the remaining setup steps below!",
            onboardingChatSplitMessage: 'Splitting bills with friends is as easy as sending a message. Here’s how.',
            onboardingAdminMessage: "Learn how to manage your team's workspace as an admin and submit your own expenses.",
            onboardingLookingAroundMessage:
                "Expensify is best known for expenses, travel, and corporate card management, but we do a lot more than that. Let me know what you're interested in and I'll help get you started.",
            onboardingTestDriveReceiverMessage: "*You've got 3 months free! Get started below.*",
        },
        workspace: {
            title: 'Stay organized with a workspace',
            subtitle: 'Unlock powerful tools to simplify your expense management, all in one place. With a workspace, you can:',
            explanationModal: {
                descriptionOne: 'Track and organize receipts',
                descriptionTwo: 'Categorize and tag expenses',
                descriptionThree: 'Create and share reports',
            },
            price: 'Try it free for 30 days, then upgrade for just <strong>$5/user/month</strong>.',
            createWorkspace: 'Create workspace',
        },
        confirmWorkspace: {
            title: 'Confirm workspace',
            subtitle: 'Create a workspace to track receipts, reimburse expenses, manage travel, create reports, and more — all at the speed of chat.',
        },
        inviteMembers: {
            title: 'Invite members',
            subtitle: 'Add your team or invite your accountant. The more, the merrier!',
        },
    },
    featureTraining: {
        doNotShowAgain: "Don't show me this again",
    },
    personalDetails: {
        error: {
            cannotContainSpecialCharacters: 'Name cannot contain special characters',
            containsReservedWord: 'Name cannot contain the words Expensify or Concierge',
            hasInvalidCharacter: 'Name cannot contain a comma or semicolon',
            requiredFirstName: 'First name cannot be empty',
        },
    },
    privatePersonalDetails: {
        enterLegalName: "What's your legal name?",
        enterDateOfBirth: "What's your date of birth?",
        enterAddress: "What's your address?",
        enterPhoneNumber: "What's your phone number?",
        personalDetails: 'Personal details',
        privateDataMessage: 'These details are used for travel and payments. They are never shown on your public profile.',
        legalName: 'Legal name',
        legalFirstName: 'Legal first name',
        legalLastName: 'Legal last name',
        address: 'Address',
        error: {
            dateShouldBeBefore: (dateString: string) => `Date should be before ${dateString}`,
            dateShouldBeAfter: (dateString: string) => `Date should be after ${dateString}`,
            hasInvalidCharacter: 'Name can only include Latin characters',
            incorrectZipFormat: (zipFormat?: string) => `Incorrect zip code format${zipFormat ? ` Acceptable format: ${zipFormat}` : ''}`,
            invalidPhoneNumber: `Please ensure the phone number is valid (e.g. ${CONST.EXAMPLE_PHONE_NUMBER})`,
        },
    },
    resendValidationForm: {
        linkHasBeenResent: 'Link has been re-sent',
        weSentYouMagicSignInLink: ({login, loginType}: WeSentYouMagicSignInLinkParams) => `I've sent a magic sign-in link to ${login}. Please check your ${loginType} to sign in.`,
        resendLink: 'Resend link',
    },
    unlinkLoginForm: {
        toValidateLogin: ({primaryLogin, secondaryLogin}: ToValidateLoginParams) =>
            `To validate ${secondaryLogin}, please resend the magic code from the Account Settings of ${primaryLogin}.`,
        noLongerHaveAccess: ({primaryLogin}: NoLongerHaveAccessParams) => `If you no longer have access to ${primaryLogin}, please unlink your accounts.`,
        unlink: 'Unlink',
        linkSent: 'Link sent!',
        successfullyUnlinkedLogin: 'Secondary login successfully unlinked!',
    },
    emailDeliveryFailurePage: {
        ourEmailProvider: ({login}: OurEmailProviderParams) =>
            `Our email provider has temporarily suspended emails to ${login} due to delivery issues. To unblock your login, please follow these steps:`,
        confirmThat: (login: string) =>
            `<strong>Confirm that ${login} is spelled correctly and is a real, deliverable email address.</strong> Email aliases such as "expenses@domain.com" must have access to their own email inbox for it to be a valid Expensify login.`,
        ensureYourEmailClient: `<strong>Ensure your email client allows expensify.com emails.</strong> You can find directions on how to complete this step <a href="${CONST.SET_NOTIFICATION_LINK}">here</a> but you may need your IT department to help configure your email settings.`,
        onceTheAbove: `Once the above steps are completed, please reach out to <a href="mailto:${CONST.EMAIL.CONCIERGE}">${CONST.EMAIL.CONCIERGE}</a> to unblock your login.`,
    },
    openAppFailureModal: {
        title: 'Something went wrong...',
        subtitle: `We have not been able to load all of your data. We have been notified and are looking into the problem. If this persists, please reach out to`,
        refreshAndTryAgain: 'Refresh and try again',
    },
    smsDeliveryFailurePage: {
        smsDeliveryFailureMessage: ({login}: OurEmailProviderParams) =>
            `We've been unable to deliver SMS messages to ${login}, so we've suspended it temporarily. Please try validating your number:`,
        validationSuccess: 'Your number has been validated! Click below to send a new magic sign-in code.',
        validationFailed: ({timeData}: {timeData?: {days?: number; hours?: number; minutes?: number} | null}) => {
            if (!timeData) {
                return 'Please wait a moment before trying again.';
            }

            const timeParts = [];
            if (timeData.days) {
                timeParts.push(`${timeData.days} ${timeData.days === 1 ? 'day' : 'days'}`);
            }

            if (timeData.hours) {
                timeParts.push(`${timeData.hours} ${timeData.hours === 1 ? 'hour' : 'hours'}`);
            }

            if (timeData.minutes) {
                timeParts.push(`${timeData.minutes} ${timeData.minutes === 1 ? 'minute' : 'minutes'}`);
            }

            let timeText = '';
            if (timeParts.length === 1) {
                timeText = timeParts.at(0) ?? '';
            } else if (timeParts.length === 2) {
                timeText = `${timeParts.at(0)} and ${timeParts.at(1)}`;
            } else if (timeParts.length === 3) {
                timeText = `${timeParts.at(0)}, ${timeParts.at(1)}, and ${timeParts.at(2)}`;
            }

            return `Hold tight! You need to wait ${timeText} before trying to validate your number again.`;
        },
    },
    welcomeSignUpForm: {
        join: 'Join',
    },
    detailsPage: {
        localTime: 'Local time',
    },
    newChatPage: {
        startGroup: 'Start group',
        addToGroup: 'Add to group',
    },
    yearPickerPage: {
        year: 'Year',
        selectYear: 'Please select a year',
    },
    focusModeUpdateModal: {
        title: 'Welcome to #focus mode!',
        prompt: (priorityModePageUrl: string) =>
            `Stay on top of things by only seeing unread chats or chats that need your attention. Don’t worry, you can change this at any point in <a href="${priorityModePageUrl}">settings</a>.`,
    },
    notFound: {
        chatYouLookingForCannotBeFound: 'The chat you are looking for cannot be found.',
        getMeOutOfHere: 'Get me out of here',
        iouReportNotFound: 'The payment details you are looking for cannot be found.',
        notHere: "Hmm... it's not here",
        pageNotFound: 'Oops, this page cannot be found',
        noAccess: 'This chat or expense may have been deleted or you do not have access to it.\n\nFor any questions please contact concierge@expensify.com',
        goBackHome: 'Go back to home page',
        commentYouLookingForCannotBeFound: 'The comment you are looking for cannot be found.',
        goToChatInstead: 'Go to the chat instead.',
        contactConcierge: 'For any questions please contact concierge@expensify.com',
    },
    errorPage: {
        title: ({isBreakLine}: {isBreakLine: boolean}) => `Oops... ${isBreakLine ? '\n' : ''}Something went wrong`,
        subtitle: 'Your request could not be completed. Please try again later.',
        wrongTypeSubtitle: "That search isn't valid. Try adjusting your search criteria.",
    },
    statusPage: {
        status: 'Status',
        statusExplanation: "Add an emoji to give your colleagues and friends an easy way to know what's going on. You can optionally add a message too!",
        today: 'Today',
        clearStatus: 'Clear status',
        save: 'Save',
        message: 'Message',
        timePeriods: {
            never: 'Never',
            thirtyMinutes: '30 minutes',
            oneHour: '1 hour',
            afterToday: 'Today',
            afterWeek: 'A week',
            custom: 'Custom',
        },
        untilTomorrow: 'Until tomorrow',
        untilTime: ({time}: UntilTimeParams) => `Until ${time}`,
        date: 'Date',
        time: 'Time',
        clearAfter: 'Clear after',
        whenClearStatus: 'When should we clear your status?',
        vacationDelegate: 'Vacation delegate',
        setVacationDelegate: `Set a vacation delegate to approve reports on your behalf while you're out of office.`,
        vacationDelegateError: 'There was an error updating your vacation delegate.',
        asVacationDelegate: ({nameOrEmail}: VacationDelegateParams) => `as ${nameOrEmail}'s vacation delegate`,
        toAsVacationDelegate: ({submittedToName, vacationDelegateName}: SubmittedToVacationDelegateParams) => `to ${submittedToName} as vacation delegate for ${vacationDelegateName}`,
        vacationDelegateWarning: ({nameOrEmail}: VacationDelegateParams) =>
            `You're assigning ${nameOrEmail} as your vacation delegate. They're not on all your workspaces yet. If you choose to continue, an email will be sent to all your workspace admins to add them.`,
    },
    stepCounter: ({step, total, text}: StepCounterParams) => {
        let result = `Step ${step}`;

        if (total) {
            result = `${result} of ${total}`;
        }

        if (text) {
            result = `${result}: ${text}`;
        }
        return result;
    },
    bankAccount: {
        bankInfo: 'Bank info',
        confirmBankInfo: 'Confirm bank info',
        manuallyAdd: 'Manually add your bank account',
        letsDoubleCheck: "Let's double check that everything looks right.",
        accountEnding: 'Account ending in',
        thisBankAccount: 'This bank account will be used for business payments on your workspace',
        accountNumber: 'Account number',
        routingNumber: 'Routing number',
        chooseAnAccountBelow: 'Choose an account below',
        addBankAccount: 'Add bank account',
        chooseAnAccount: 'Choose an account',
        connectOnlineWithPlaid: 'Log into your bank',
        connectManually: 'Connect manually',
        desktopConnection: 'Note: To connect with Chase, Wells Fargo, Capital One or Bank of America, please click here to complete this process in a browser.',
        yourDataIsSecure: 'Your data is secure',
        toGetStarted: 'Add a bank account to reimburse expenses, issue Expensify Cards, collect invoice payments, and pay bills all from one place.',
        plaidBodyCopy: 'Give your employees an easier way to pay - and get paid back - for company expenses.',
        checkHelpLine: 'Your routing number and account number can be found on a check for the account.',
        hasPhoneLoginError: (contactMethodRoute: string) =>
            `To connect a bank account, please <a href="${contactMethodRoute}">add an email as your primary login</a> and try again. You can add your phone number as a secondary login.`,
        hasBeenThrottledError: 'An error occurred while adding your bank account. Please wait a few minutes and try again.',
        hasCurrencyError: ({workspaceRoute}: WorkspaceRouteParams) =>
            `Oops! It appears that your workspace currency is set to a different currency than USD. To proceed, please go to <a href="${workspaceRoute}">your workspace settings</a> to set it to USD and try again.`,
        bbaAdded: 'Business bank account added!',
        bbaAddedDescription: "It's ready to be used for payments.",
        error: {
            youNeedToSelectAnOption: 'Please select an option to proceed',
            noBankAccountAvailable: "Sorry, there's no bank account available",
            noBankAccountSelected: 'Please choose an account',
            taxID: 'Please enter a valid tax ID number',
            website: 'Please enter a valid website',
            zipCode: `Please enter a valid ZIP code using the format: ${CONST.COUNTRY_ZIP_REGEX_DATA.US.samples}`,
            phoneNumber: 'Please enter a valid phone number',
            email: 'Please enter a valid email address',
            companyName: 'Please enter a valid business name',
            addressCity: 'Please enter a valid city',
            addressStreet: 'Please enter a valid street address',
            addressState: 'Please select a valid state',
            incorporationDateFuture: "Incorporation date can't be in the future",
            incorporationState: 'Please select a valid state',
            industryCode: 'Please enter a valid industry classification code with six digits',
            restrictedBusiness: "Please confirm the business isn't on the list of restricted businesses",
            routingNumber: 'Please enter a valid routing number',
            accountNumber: 'Please enter a valid account number',
            routingAndAccountNumberCannotBeSame: "Routing and account numbers can't match",
            companyType: 'Please select a valid company type',
            tooManyAttempts: 'Due to a high number of login attempts, this option has been disabled for 24 hours. Please try again later or enter details manually instead.',
            address: 'Please enter a valid address',
            dob: 'Please select a valid date of birth',
            age: 'Must be over 18 years old',
            ssnLast4: 'Please enter valid last 4 digits of SSN',
            firstName: 'Please enter a valid first name',
            lastName: 'Please enter a valid last name',
            noDefaultDepositAccountOrDebitCardAvailable: 'Please add a default deposit account or debit card',
            validationAmounts: 'The validation amounts you entered are incorrect. Please double check your bank statement and try again.',
            fullName: 'Please enter a valid full name',
            ownershipPercentage: 'Please enter a valid percentage number',
            deletePaymentBankAccount:
                "This bank account can't be deleted because it is used for Expensify Card payments. If you would still like to delete this account, please reach out to Concierge.",
            sameDepositAndWithdrawalAccount: 'The deposit and withdrawal accounts are the same.',
        },
    },
    addPersonalBankAccount: {
        countrySelectionStepHeader: "Where's your bank account located?",
        accountDetailsStepHeader: 'What are your account details?',
        accountTypeStepHeader: 'What type of account is this?',
        bankInformationStepHeader: 'What are your bank details?',
        accountHolderInformationStepHeader: 'What are the account holder details?',
        howDoWeProtectYourData: 'How do we protect your data?',
        currencyHeader: "What's your bank account's currency?",
        confirmationStepHeader: 'Check your info.',
        confirmationStepSubHeader: 'Double check the details below, and check the terms box to confirm.',
        toGetStarted: 'Add a personal bank account to receive reimbursements, pay invoices, or enable the Expensify Wallet.',
    },
    addPersonalBankAccountPage: {
        enterPassword: 'Enter Expensify password',
        alreadyAdded: 'This account has already been added.',
        chooseAccountLabel: 'Account',
        successTitle: 'Personal bank account added!',
        successMessage: 'Congrats, your bank account is set up and ready to receive reimbursements.',
    },
    attachmentView: {
        unknownFilename: 'Unknown filename',
        passwordRequired: 'Please enter a password',
        passwordIncorrect: 'Incorrect password. Please try again.',
        failedToLoadPDF: 'Failed to load PDF file',
        pdfPasswordForm: {
            title: 'Password protected PDF',
            infoText: 'This PDF is password protected.',
            beforeLinkText: 'Please',
            linkText: 'enter the password',
            afterLinkText: 'to view it.',
            formLabel: 'View PDF',
        },
        attachmentNotFound: 'Attachment not found',
        retry: 'Retry',
    },
    messages: {
        errorMessageInvalidPhone: `Please enter a valid phone number without brackets or dashes. If you're outside the US, please include your country code (e.g. ${CONST.EXAMPLE_PHONE_NUMBER}).`,
        errorMessageInvalidEmail: 'Invalid email',
        userIsAlreadyMember: ({login, name}: UserIsAlreadyMemberParams) => `${login} is already a member of ${name}`,
        userIsAlreadyAnAdmin: ({login, name}: UserIsAlreadyMemberParams) => `${login} is already an admin of ${name}`,
    },
    onfidoStep: {
        acceptTerms: 'By continuing with the request to activate your Expensify Wallet, you confirm that you have read, understand, and accept',
        facialScan: 'Onfido’s Facial Scan Policy and Release',
        onfidoLinks: (onfidoTitle: string) =>
            `<muted-text-micro>${onfidoTitle} <a href='${CONST.ONFIDO_FACIAL_SCAN_POLICY_URL}'>Onfido’s Facial Scan Policy and Release</a>, <a href='${CONST.ONFIDO_PRIVACY_POLICY_URL}'>Privacy</a> and <a href='${CONST.ONFIDO_TERMS_OF_SERVICE_URL}'>Terms of Service</a>.</muted-text-micro>`,
        tryAgain: 'Try again',
        verifyIdentity: 'Verify identity',
        letsVerifyIdentity: "Let's verify your identity",
        butFirst: `But first, the boring stuff. Read up on the legalese in the next step and click "Accept" when you're ready.`,
        genericError: 'An error occurred while processing this step. Please try again.',
        cameraPermissionsNotGranted: 'Enable camera access',
        cameraRequestMessage: 'We need access to your camera to complete bank account verification. Please enable via Settings > New Expensify.',
        microphonePermissionsNotGranted: 'Enable microphone access',
        microphoneRequestMessage: 'We need access to your microphone to complete bank account verification. Please enable via Settings > New Expensify.',
        originalDocumentNeeded: 'Please upload an original image of your ID rather than a screenshot or scanned image.',
        documentNeedsBetterQuality: 'Your ID appears to be damaged or has missing security features. Please upload an original image of an undamaged ID that is entirely visible.',
        imageNeedsBetterQuality: "There's an issue with the image quality of your ID. Please upload a new image where your entire ID can be seen clearly.",
        selfieIssue: "There's an issue with your selfie/video. Please upload a live selfie/video.",
        selfieNotMatching: "Your selfie/video doesn't match your ID. Please upload a new selfie/video where your face can be clearly seen.",
        selfieNotLive: "Your selfie/video doesn't appear to be a live photo/video. Please upload a live selfie/video.",
    },
    additionalDetailsStep: {
        headerTitle: 'Additional details',
        helpText: 'We need to confirm the following information before you can send and receive money from your wallet.',
        helpTextIdologyQuestions: 'We need to ask you just a few more questions to finish validating your identity.',
        helpLink: 'Learn more about why we need this.',
        legalFirstNameLabel: 'Legal first name',
        legalMiddleNameLabel: 'Legal middle name',
        legalLastNameLabel: 'Legal last name',
        selectAnswer: 'Please select a response to proceed',
        ssnFull9Error: 'Please enter a valid nine-digit SSN',
        needSSNFull9: "We're having trouble verifying your SSN. Please enter the full nine digits of your SSN.",
        weCouldNotVerify: "We couldn't verify",
        pleaseFixIt: 'Please fix this information before continuing',
        failedKYCMessage: ({conciergeEmail}: {conciergeEmail: string}) =>
            `We weren't able to verify your identity. Please try again later or reach out to <a href="mailto:${conciergeEmail}">${conciergeEmail}</a> if you have any questions.`,
    },
    termsStep: {
        headerTitle: 'Terms and fees',
        headerTitleRefactor: 'Fees and terms',
        haveReadAndAgreePlain: 'I have read and agree to receive electronic disclosures.',
        haveReadAndAgree: `I have read and agree to receive <a href="${CONST.ELECTRONIC_DISCLOSURES_URL}">electronic disclosures</a>.`,
        agreeToThePlain: 'I agree to the Privacy and Wallet agreement.',
        agreeToThe: ({walletAgreementUrl}: WalletAgreementParams) =>
            `I agree to the <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Privacy</a> and <a href="${walletAgreementUrl}">Wallet agreement</a>.`,
        enablePayments: 'Enable payments',
        monthlyFee: 'Monthly fee',
        inactivity: 'Inactivity',
        noOverdraftOrCredit: 'No overdraft/credit feature.',
        electronicFundsWithdrawal: 'Electronic funds withdrawal',
        standard: 'Standard',
        reviewTheFees: 'Take a look at some fees.',
        checkTheBoxes: 'Please check the boxes below.',
        agreeToTerms: 'Agree to the terms and you’ll be good to go!',
        shortTermsForm: {
            expensifyPaymentsAccount: ({walletProgram}: WalletProgramParams) => `The Expensify Wallet is issued by ${walletProgram}.`,
            perPurchase: 'Per purchase',
            atmWithdrawal: 'ATM withdrawal',
            cashReload: 'Cash reload',
            inNetwork: 'in-network',
            outOfNetwork: 'out-of-network',
            atmBalanceInquiry: 'ATM balance inquiry (in-network or out-of-network)',
            customerService: 'Customer service (automated or live agent)',
            inactivityAfterTwelveMonths: 'Inactivity (after 12 months with no transactions)',
            weChargeOneFee: 'We charge 1 other type of fee. It is:',
            fdicInsurance: 'Your funds are eligible for FDIC insurance.',
            generalInfo: `For general information about prepaid accounts, visit <a href="${CONST.CFPB_PREPAID_URL}">${CONST.TERMS.CFPB_PREPAID}</a>.`,
            conditionsDetails: `For details and conditions for all fees and services, visit <a href="${CONST.FEES_URL}">${CONST.FEES_URL}</a> or calling +1 833-400-0904.`,
            electronicFundsWithdrawalInstant: 'Electronic funds withdrawal (instant)',
            electronicFundsInstantFeeMin: ({amount}: TermsParams) => `(min ${amount})`,
        },
        longTermsForm: {
            listOfAllFees: 'A list of all Expensify Wallet fees',
            typeOfFeeHeader: 'All fees',
            feeAmountHeader: 'Amount',
            moreDetailsHeader: 'Details',
            openingAccountTitle: 'Opening an account',
            openingAccountDetails: "There's no fee to open an account.",
            monthlyFeeDetails: "There's no monthly fee.",
            customerServiceTitle: 'Customer service',
            customerServiceDetails: 'There are no customer service fees.',
            inactivityDetails: "There's no inactivity fee.",
            sendingFundsTitle: 'Sending funds to another account holder',
            sendingFundsDetails: "There's no fee to send funds to another account holder using your balance, bank account, or debit card.",
            electronicFundsStandardDetails:
                "There's no fee to transfer funds from your Expensify Wallet to your bank account using the standard option. This transfer usually completes within 1-3 business days.",
            electronicFundsInstantDetails: (percentage: string, amount: string) =>
                "There's a fee to transfer funds from your Expensify Wallet to your linked debit card using the instant transfer option. This transfer usually completes within several minutes." +
                ` The fee is ${percentage}% of the transfer amount (with a minimum fee of ${amount}).`,
            fdicInsuranceBancorp: ({amount}: TermsParams) =>
                `Your funds are eligible for FDIC insurance. Your funds will be held at or transferred to ${CONST.WALLET.PROGRAM_ISSUERS.BANCORP_BANK}, an FDIC-insured institution.` +
                ` Once there, your funds are insured up to ${amount} by the FDIC in the event ${CONST.WALLET.PROGRAM_ISSUERS.BANCORP_BANK} fails, if specific deposit insurance requirements are met and your card is registered. See ${CONST.TERMS.FDIC_PREPAID} for details.`,
            contactExpensifyPayments: `Contact ${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS} by calling +1 833-400-0904, by email at ${CONST.EMAIL.CONCIERGE} or sign in at ${CONST.NEW_EXPENSIFY_URL}.`,
            generalInformation: `For general information about prepaid accounts, visit ${CONST.TERMS.CFPB_PREPAID}. If you have a complaint about a prepaid account, call the Consumer Financial Protection Bureau at 1-855-411-2372 or visit ${CONST.TERMS.CFPB_COMPLAINT}.`,
            printerFriendlyView: 'View printer-friendly version',
            automated: 'Automated',
            liveAgent: 'Live agent',
            instant: 'Instant',
            electronicFundsInstantFeeMin: ({amount}: TermsParams) => `Min ${amount}`,
        },
    },
    activateStep: {
        headerTitle: 'Enable payments',
        activatedTitle: 'Wallet activated!',
        activatedMessage: 'Congrats, your wallet is set up and ready to make payments.',
        checkBackLaterTitle: 'Just a minute...',
        checkBackLaterMessage: "We're still reviewing your information. Please check back later.",
        continueToPayment: 'Continue to payment',
        continueToTransfer: 'Continue to transfer',
    },
    companyStep: {
        headerTitle: 'Company information',
        subtitle: 'Almost done! For security purposes, we need to confirm some information:',
        legalBusinessName: 'Legal business name',
        companyWebsite: 'Company website',
        taxIDNumber: 'Tax ID number',
        taxIDNumberPlaceholder: '9 digits',
        companyType: 'Company type',
        incorporationDate: 'Incorporation date',
        incorporationState: 'Incorporation state',
        industryClassificationCode: 'Industry classification code',
        confirmCompanyIsNot: 'I confirm that this company is not on the',
        listOfRestrictedBusinesses: 'list of restricted businesses',
        incorporationDatePlaceholder: 'Start date (yyyy-mm-dd)',
        incorporationTypes: {
            LLC: 'LLC',
            CORPORATION: 'Corp',
            PARTNERSHIP: 'Partnership',
            COOPERATIVE: 'Cooperative',
            SOLE_PROPRIETORSHIP: 'Sole proprietorship',
            OTHER: 'Other',
        },
        industryClassification: 'Which industry is the business classified under?',
        industryClassificationCodePlaceholder: 'Search for industry classification code',
    },
    requestorStep: {
        headerTitle: 'Personal information',
        learnMore: 'Learn more',
        isMyDataSafe: 'Is my data safe?',
    },
    personalInfoStep: {
        personalInfo: 'Personal info',
        enterYourLegalFirstAndLast: "What's your legal name?",
        legalFirstName: 'Legal first name',
        legalLastName: 'Legal last name',
        legalName: 'Legal name',
        enterYourDateOfBirth: "What's your date of birth?",
        enterTheLast4: 'What are the last four digits of your Social Security Number?',
        dontWorry: "Don't worry, we don't do any personal credit checks!",
        last4SSN: 'Last 4 of SSN',
        enterYourAddress: "What's your address?",
        address: 'Address',
        letsDoubleCheck: "Let's double check that everything looks right.",
        byAddingThisBankAccount: "By adding this bank account, you confirm that you've read, understand, and accept",
        whatsYourLegalName: 'What’s your legal name?',
        whatsYourDOB: 'What’s your date of birth?',
        whatsYourAddress: 'What’s your address?',
        whatsYourSSN: 'What are the last four digits of your Social Security Number?',
        noPersonalChecks: 'Don’t worry, no personal credit checks here!',
        whatsYourPhoneNumber: 'What’s your phone number?',
        weNeedThisToVerify: 'We need this to verify your wallet.',
    },
    businessInfoStep: {
        businessInfo: 'Company info',
        enterTheNameOfYourBusiness: "What's the name of your company?",
        businessName: 'Legal company name',
        enterYourCompanyTaxIdNumber: "What's your company’s Tax ID number?",
        taxIDNumber: 'Tax ID number',
        taxIDNumberPlaceholder: '9 digits',
        enterYourCompanyWebsite: "What's your company’s website?",
        companyWebsite: 'Company website',
        enterYourCompanyPhoneNumber: "What's your company’s phone number?",
        enterYourCompanyAddress: "What's your company’s address?",
        selectYourCompanyType: 'What type of company is it?',
        companyType: 'Company type',
        incorporationType: {
            LLC: 'LLC',
            CORPORATION: 'Corp',
            PARTNERSHIP: 'Partnership',
            COOPERATIVE: 'Cooperative',
            SOLE_PROPRIETORSHIP: 'Sole proprietorship',
            OTHER: 'Other',
        },
        selectYourCompanyIncorporationDate: "What's your company’s incorporation date?",
        incorporationDate: 'Incorporation date',
        incorporationDatePlaceholder: 'Start date (yyyy-mm-dd)',
        incorporationState: 'Incorporation state',
        pleaseSelectTheStateYourCompanyWasIncorporatedIn: 'Which state was your company incorporated in?',
        letsDoubleCheck: "Let's double check that everything looks right.",
        companyAddress: 'Company address',
        listOfRestrictedBusinesses: 'list of restricted businesses',
        confirmCompanyIsNot: 'I confirm that this company is not on the',
        businessInfoTitle: 'Business info',
        legalBusinessName: 'Legal business name',
        whatsTheBusinessName: "What's the business name?",
        whatsTheBusinessAddress: "What's the business address?",
        whatsTheBusinessContactInformation: "What's the business contact information?",
        whatsTheBusinessRegistrationNumber: (country: string) => {
            switch (country) {
                case CONST.COUNTRY.GB:
                    return "What's the Company Registration Number (CRN)?";
                default:
                    return "What's the business registration number?";
            }
        },
        whatsTheBusinessTaxIDEIN: (country: string) => {
            switch (country) {
                case CONST.COUNTRY.US:
                    return 'What’s the Employer Identification Number (EIN)?';
                case CONST.COUNTRY.CA:
                    return 'What’s the Business Number (BN)?';
                case CONST.COUNTRY.GB:
                    return 'What’s the VAT Registration Number (VRN)?';
                case CONST.COUNTRY.AU:
                    return 'What’s the Australian Business Number (ABN)?';
                default:
                    return 'What’s the EU VAT number?';
            }
        },
        whatsThisNumber: "What's this number?",
        whereWasTheBusinessIncorporated: 'Where was the business incorporated?',
        whatTypeOfBusinessIsIt: 'What type of business is it?',
        whatsTheBusinessAnnualPayment: "What's the business's annual payment volume?",
        whatsYourExpectedAverageReimbursements: "What's your expected average reimbursement amount?",
        registrationNumber: 'Registration number',
        taxIDEIN: (country: string) => {
            switch (country) {
                case CONST.COUNTRY.US:
                    return 'EIN';
                case CONST.COUNTRY.CA:
                    return 'BN';
                case CONST.COUNTRY.GB:
                    return 'VRN';
                case CONST.COUNTRY.AU:
                    return 'ABN';
                default:
                    return 'EU VAT';
            }
        },
        businessAddress: 'Business address',
        businessType: 'Business type',
        incorporation: 'Incorporation',
        incorporationCountry: 'Incorporation country',
        incorporationTypeName: 'Incorporation type',
        businessCategory: 'Business category',
        annualPaymentVolume: 'Annual payment volume',
        annualPaymentVolumeInCurrency: (currencyCode: string) => `Annual payment volume in ${currencyCode}`,
        averageReimbursementAmount: 'Average reimbursement amount',
        averageReimbursementAmountInCurrency: (currencyCode: string) => `Average reimbursement amount in ${currencyCode}`,
        selectIncorporationType: 'Select incorporation type',
        selectBusinessCategory: 'Select business category',
        selectAnnualPaymentVolume: 'Select annual payment volume',
        selectIncorporationCountry: 'Select incorporation country',
        selectIncorporationState: 'Select incorporation state',
        selectAverageReimbursement: 'Select average reimbursement amount',
        selectBusinessType: 'Select business type',
        findIncorporationType: 'Find incorporation type',
        findBusinessCategory: 'Find business category',
        findAnnualPaymentVolume: 'Find annual payment volume',
        findIncorporationState: 'Find incorporation state',
        findAverageReimbursement: 'Find average reimbursement amount',
        findBusinessType: 'Find business type',
        error: {
            registrationNumber: 'Please provide a valid registration number',
            taxIDEIN: (country: string) => {
                switch (country) {
                    case CONST.COUNTRY.US:
                        return 'Please provide a valid Employer Identification Number (EIN)';
                    case CONST.COUNTRY.CA:
                        return 'Please provide a valid Business Number (BN)';
                    case CONST.COUNTRY.GB:
                        return 'Please provide a valid VAT Registration Number (VRN)';
                    case CONST.COUNTRY.AU:
                        return 'Please provide a valid Australian Business Number (ABN)';
                    default:
                        return 'Please provide a valid EU VAT number';
                }
            },
        },
    },
    beneficialOwnerInfoStep: {
        doYouOwn25percent: (companyName: string) => `Do you own 25% or more of ${companyName}?`,
        doAnyIndividualOwn25percent: (companyName: string) => `Do any individuals own 25% or more of ${companyName}?`,
        areThereMoreIndividualsWhoOwn25percent: (companyName: string) => `Are there more individuals who own 25% or more of ${companyName}?`,
        regulationRequiresUsToVerifyTheIdentity: 'Regulation requires us to verify the identity of any individual who owns more than 25% of the business.',
        companyOwner: 'Business owner',
        enterLegalFirstAndLastName: "What's the owner's legal name?",
        legalFirstName: 'Legal first name',
        legalLastName: 'Legal last name',
        enterTheDateOfBirthOfTheOwner: "What's the owner's date of birth?",
        enterTheLast4: 'What are the last 4 digits of the owner’s Social Security Number?',
        last4SSN: 'Last 4 of SSN',
        dontWorry: "Don't worry, we don't do any personal credit checks!",
        enterTheOwnersAddress: "What's the owner's address?",
        letsDoubleCheck: 'Let’s double check that everything looks right.',
        legalName: 'Legal name',
        address: 'Address',
        byAddingThisBankAccount: "By adding this bank account, you confirm that you've read, understand, and accept",
        owners: 'Owners',
    },
    ownershipInfoStep: {
        ownerInfo: 'Owner info',
        businessOwner: 'Business owner',
        signerInfo: 'Signer info',
        doYouOwn: (companyName: string) => `Do you own 25% or more of ${companyName}?`,
        doesAnyoneOwn: (companyName: string) => `Do any individuals own 25% or more of ${companyName}?`,
        regulationsRequire: 'Regulations require us to verify the identity of any individual who owns more than 25% of the business.',
        legalFirstName: 'Legal first name',
        legalLastName: 'Legal last name',
        whatsTheOwnersName: "What's the owner's legal name?",
        whatsYourName: "What's your legal name?",
        whatPercentage: 'What percentage of the business belongs to the owner?',
        whatsYoursPercentage: 'What percentage of the business do you own?',
        ownership: 'Ownership',
        whatsTheOwnersDOB: "What's the owner's date of birth?",
        whatsYourDOB: "What's your date of birth?",
        whatsTheOwnersAddress: "What's the owner's address?",
        whatsYourAddress: "What's your address?",
        whatAreTheLast: "What are the last 4 digits of the owner's Social Security Number?",
        whatsYourLast: 'What are the last 4 digits of your Social Security Number?',
        whatsYourNationality: 'What is your country of citizenship?',
        whatsTheOwnersNationality: "What's the owner's country of citizenship?",
        countryOfCitizenship: 'Country of citizenship',
        dontWorry: "Don't worry, we don't do any personal credit checks!",
        last4: 'Last 4 of SSN',
        whyDoWeAsk: 'Why do we ask for this?',
        letsDoubleCheck: 'Let’s double check that everything looks right.',
        legalName: 'Legal name',
        ownershipPercentage: 'Ownership percentage',
        areThereOther: (companyName: string) => `Are there other individuals who own 25% or more of ${companyName}?`,
        owners: 'Owners',
        addCertified: 'Add a certified org chart that shows the beneficial owners',
        regulationRequiresChart: 'Regulation requires us to collect a certified copy of the ownership chart that shows every individual or entity who owns 25% or more of the business.',
        uploadEntity: 'Upload entity ownership chart',
        noteEntity: 'Note: Entity ownership chart must be signed by your accountant, legal counsel, or notarized.',
        certified: 'Certified entity ownership chart',
        selectCountry: 'Select country',
        findCountry: 'Find country',
        address: 'Address',
        chooseFile: 'Choose file',
        uploadDocuments: 'Upload additional documentation',
        pleaseUpload: 'Please upload additional documentation below to help us verify your identity as a direct or indirect owner of 25% or more of the business entity.',
        acceptedFiles: 'Accepted file formats: PDF, PNG, JPEG. Total file size for each section cannot exceed 5 MB.',
        proofOfBeneficialOwner: 'Proof of beneficial owner',
        proofOfBeneficialOwnerDescription:
            "Please provide a signed attestation and org chart from a public accountant, notary, or lawyer verifying ownership of 25% or more of the business. It must be dated within the last three months and include the signer's license number.",
        copyOfID: 'Copy of ID for beneficial owner',
        copyOfIDDescription: "Examples: Passport, driver's license, etc.",
        proofOfAddress: 'Address proof for beneficial owner',
        proofOfAddressDescription: 'Examples: Utility bill, rental agreement, etc.',
        codiceFiscale: 'Codice fiscale/Tax ID',
        codiceFiscaleDescription:
            'Please upload a video of a site visit or a recorded call with the signing officer. The officer must provide: full name, date of birth, company name, registered number, fiscal code number, registered address, nature of business and purpose of account.',
    },
    completeVerificationStep: {
        completeVerification: 'Complete verification',
        confirmAgreements: 'Please confirm the agreements below.',
        certifyTrueAndAccurate: 'I certify that the information provided is true and accurate',
        certifyTrueAndAccurateError: 'Please certify that the information is true and accurate',
        isAuthorizedToUseBankAccount: 'I am authorized to use this business bank account for business spend',
        isAuthorizedToUseBankAccountError: 'You must be a controlling officer with authorization to operate the business bank account',
        termsAndConditions: 'terms and conditions',
    },
    connectBankAccountStep: {
        validateYourBankAccount: 'Validate your bank account',
        validateButtonText: 'Validate',
        validationInputLabel: 'Transaction',
        maxAttemptsReached: 'Validation for this bank account has been disabled due to too many incorrect attempts.',
        description: `Within 1-2 business days, we'll send three (3) small transactions to your bank account from a name like "Expensify, Inc. Validation".`,
        descriptionCTA: 'Please enter each transaction amount in the fields below. Example: 1.51.',
        letsChatText: 'Almost there! We need your help verifying a few last bits of information over chat. Ready?',
        enable2FATitle: 'Prevent fraud, enable two-factor authentication (2FA)',
        enable2FAText: 'We take your security seriously. Please set up 2FA now to add an extra layer of protection to your account.',
        secureYourAccount: 'Secure your account',
    },
    countryStep: {
        confirmBusinessBank: 'Confirm business bank account currency and country',
        confirmCurrency: 'Confirm currency and country',
        yourBusiness: 'Your business bank account currency must match your workspace currency.',
        youCanChange: 'You can change your workspace currency in your',
        findCountry: 'Find country',
        selectCountry: 'Select country',
    },
    bankInfoStep: {
        whatAreYour: 'What are your business bank account details?',
        letsDoubleCheck: 'Let’s double check that everything looks fine.',
        thisBankAccount: 'This bank account will be used for business payments on your workspace',
        accountNumber: 'Account number',
        accountHolderNameDescription: "Authorized signer's full name",
    },
    signerInfoStep: {
        signerInfo: 'Signer info',
        areYouDirector: (companyName: string) => `Are you a director at ${companyName}?`,
        regulationRequiresUs: 'Regulation requires us to verify if the signer has the authority to take this action on behalf of the business.',
        whatsYourName: "What's your legal name",
        fullName: 'Legal full name',
        whatsYourJobTitle: "What's your job title?",
        jobTitle: 'Job title',
        whatsYourDOB: "What's your date of birth?",
        uploadID: 'Upload ID and proof of address',
        personalAddress: 'Proof of personal address (e.g. utility bill)',
        letsDoubleCheck: 'Let’s double check that everything looks right.',
        legalName: 'Legal name',
        proofOf: 'Proof of personal address',
        enterOneEmail: (companyName: string) => `Enter the email of a director at ${companyName}`,
        regulationRequiresOneMoreDirector: 'Regulation requires at least one more director as a signer.',
        hangTight: 'Hang tight...',
        enterTwoEmails: (companyName: string) => `Enter the emails of two directors at ${companyName}`,
        sendReminder: 'Send a reminder',
        chooseFile: 'Choose file',
        weAreWaiting: "We're waiting for others to verify their identities as directors of the business.",
        id: 'Copy of ID',
        proofOfDirectors: 'Proof of director(s)',
        proofOfDirectorsDescription: 'Examples: Oncorp Corporate Profile or Business Registration.',
        codiceFiscale: 'Codice Fiscale',
        codiceFiscaleDescription: 'Codice Fiscale for Signatories, Authorized Users and Beneficial Owners.',
        PDSandFSG: 'PDS + FSG disclosure paperwork',
        PDSandFSGDescription: dedent(`
            Our partnership with Corpay utilizes an API connection to take advantage of their vast network of international banking partners to power Global Reimbursements in Expensify. As per Australian regulation we are providing you with Corpay's Financial Services Guide (FSG) and Product Disclosure Statement (PDS).

            Please read the FSG and PDS documents carefully as they contain full details and important information on the products and services Corpay offers. Retain these documents for future reference.
        `),
        pleaseUpload: 'Please upload additional documentation below to help us verify your identity as a director of the business.',
        enterSignerInfo: 'Enter signer info',
        thisStep: 'This step has been completed',
        isConnecting: ({bankAccountLastFour, currency}: SignerInfoMessageParams) =>
            `is connecting a ${currency} business bank account ending in ${bankAccountLastFour} to Expensify to pay employees in ${currency}. The next step requires signer info from a director.`,
        error: {
            emailsMustBeDifferent: 'Emails must be different',
        },
    },
    agreementsStep: {
        agreements: 'Agreements',
        pleaseConfirm: 'Please confirm the agreements below',
        regulationRequiresUs: 'Regulation requires us to verify the identity of any individual who owns more than 25% of the business.',
        iAmAuthorized: 'I am authorized to use the business bank account for business spend.',
        iCertify: 'I certify that the information provided is true and accurate.',
        iAcceptTheTermsAndConditions: `I accept the <a href="https://cross-border.corpay.com/tc/">terms and conditions</a>.`,
        iAcceptTheTermsAndConditionsAccessibility: 'I accept the terms and conditions.',
        accept: 'Accept and add bank account',
        iConsentToThePrivacyNotice: 'I consent to the <a href="https://payments.corpay.com/compliance">privacy notice</a>.',
        iConsentToThePrivacyNoticeAccessibility: 'I consent to the privacy notice.',
        error: {
            authorized: 'You must be a controlling officer with authorization to operate the business bank account',
            certify: 'Please certify that the information is true and accurate',
            consent: 'Please consent to the privacy notice',
        },
    },
    docusignStep: {
        subheader: 'Docusign Form',
        pleaseComplete:
            'Please complete the ACH authorization form with the Docusign link below and then upload that signed copy here so we can withdraw funds directly from your bank account',
        pleaseCompleteTheBusinessAccount: 'Please complete the Business Account Application Direct Debit Arrangement',
        pleaseCompleteTheDirect:
            'Please complete the Direct Debit Arrangement using the Docusign link below and then upload that signed copy here so we can withdraw funds directly from your bank account.',
        takeMeTo: 'Take me to Docusign',
        uploadAdditional: 'Upload additional documentation',
        pleaseUpload: 'Please upload the DEFT form and Docusign signature page',
        pleaseUploadTheDirect: 'Please upload the Direct Debit Arrangements and Docusign signature page',
    },
    finishStep: {
        letsFinish: "Let's finish in chat!",
        thanksFor:
            "Thanks for those details. A dedicated support agent will now review your information. We'll circle back if we need anything else from you, but in the meantime, feel free to reach out to us with any questions.",
        iHaveA: 'I have a question',
        enable2FA: 'Enable two-factor authentication (2FA) to prevent fraud',
        weTake: 'We take your security seriously. Please set up 2FA now to add an extra layer of protection to your account.',
        secure: 'Secure your account',
    },
    reimbursementAccountLoadingAnimation: {
        oneMoment: 'One moment',
        explanationLine: "We’re taking a look at your information. You'll be able to continue with next steps shortly.",
    },
    session: {
        offlineMessageRetry: "Looks like you're offline. Please check your connection and try again.",
    },
    travel: {
        header: 'Book travel',
        title: 'Travel smart',
        subtitle: 'Use Expensify Travel to get the best travel offers and manage all your business expenses in one place.',
        features: {
            saveMoney: 'Save money on your bookings',
            alerts: 'Get realtime alerts if your travel plans change',
        },
        bookTravel: 'Book travel',
        bookDemo: 'Book demo',
        bookADemo: 'Book a demo',
        toLearnMore: ' to learn more.',
        termsAndConditions: {
            header: 'Before we continue...',
            title: 'Terms & conditions',
            label: 'I agree to the terms & conditions',
            subtitle: `Please agree to the Expensify Travel <a href="${CONST.TRAVEL_TERMS_URL}">terms & conditions</a>.`,
            error: 'You must agree to the Expensify Travel terms & conditions to continue',
            defaultWorkspaceError:
                'You need to set a default workspace to enable Expensify Travel. Go to Settings > Workspaces > click the three vertical dots next to a workspace > Set as default workspace, then try again!',
        },
        flight: 'Flight',
        flightDetails: {
            passenger: 'Passenger',
            layover: (layover: string) => `<muted-text-label>You have a <strong>${layover} layover</strong> before this flight</muted-text-label>`,
            takeOff: 'Take-off',
            landing: 'Landing',
            seat: 'Seat',
            class: 'Cabin Class',
            recordLocator: 'Record locator',
            cabinClasses: {
                unknown: 'Unknown',
                economy: 'Economy',
                premiumEconomy: 'Premium Economy',
                business: 'Business',
                first: 'First',
            },
        },
        hotel: 'Hotel',
        hotelDetails: {
            guest: 'Guest',
            checkIn: 'Check-in',
            checkOut: 'Check-out',
            roomType: 'Room type',
            cancellation: 'Cancellation policy',
            cancellationUntil: 'Free cancellation until',
            confirmation: 'Confirmation number',
            cancellationPolicies: {
                unknown: 'Unknown',
                nonRefundable: 'Non-refundable',
                freeCancellationUntil: 'Free cancellation until',
                partiallyRefundable: 'Partially refundable',
            },
        },
        car: 'Car',
        carDetails: {
            rentalCar: 'Car rental',
            pickUp: 'Pick-up',
            dropOff: 'Drop-off',
            driver: 'Driver',
            carType: 'Car type',
            cancellation: 'Cancellation policy',
            cancellationUntil: 'Free cancellation until',
            freeCancellation: 'Free cancellation',
            confirmation: 'Confirmation number',
        },
        train: 'Rail',
        trainDetails: {
            passenger: 'Passenger',
            departs: 'Departs',
            arrives: 'Arrives',
            coachNumber: 'Coach number',
            seat: 'Seat',
            fareDetails: 'Fare details',
            confirmation: 'Confirmation number',
        },
        viewTrip: 'View trip',
        modifyTrip: 'Modify trip',
        tripSupport: 'Trip support',
        tripDetails: 'Trip details',
        viewTripDetails: 'View trip details',
        trip: 'Trip',
        trips: 'Trips',
        tripSummary: 'Trip summary',
        departs: 'Departs',
        errorMessage: 'Something went wrong. Please try again later.',
        phoneError: ({phoneErrorMethodsRoute}: PhoneErrorRouteParams) => `<rbr>Please <a href="${phoneErrorMethodsRoute}">add a work email as your primary login</a> to book travel.</rbr>`,
        domainSelector: {
            title: 'Domain',
            subtitle: 'Choose a domain for Expensify Travel setup.',
            recommended: 'Recommended',
        },
        domainPermissionInfo: {
            title: 'Domain',
            restriction: (domain: string) =>
                `You don't have permission to enable Expensify Travel for the domain <strong>${domain}</strong>. You'll need to ask someone from that domain to enable travel instead.`,
            accountantInvitation: `If you're an accountant, consider joining the <a href="${CONST.OLD_DOT_PUBLIC_URLS.EXPENSIFY_APPROVED_PROGRAM_URL}">ExpensifyApproved! accountants program</a> to enable travel for this domain.`,
        },
        publicDomainError: {
            title: 'Get started with Expensify Travel',
            message: `You'll need to use your work email (e.g., name@company.com) with Expensify Travel, not your personal email (e.g., name@gmail.com).`,
        },
        blockedFeatureModal: {
            title: 'Expensify Travel has been disabled',
            message: `Your admin has turned off Expensify Travel. Please follow your company's booking policy for travel arrangements.`,
        },
        verifyCompany: {
            title: "We're reviewing your request...",
            message: `We're running a few checks on our end to verify your account is ready for Expensify Travel. We'll be in touch shortly!`,
            confirmText: 'Got it',
            conciergeMessage: ({domain}: {domain: string}) => `Travel enablement failed for domain: ${domain}. Please review and enable travel for this domain.`,
        },
        updates: {
            bookingTicketed: (airlineCode: string, origin: string, destination: string, startDate: string, confirmationID = '') =>
                `Your flight ${airlineCode} (${origin} → ${destination}) on ${startDate} has been booked. Confirmation code: ${confirmationID}`,
            ticketVoided: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `Your ticket for flight ${airlineCode} (${origin} → ${destination}) on ${startDate} has been voided.`,
            ticketRefunded: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `Your ticket for flight ${airlineCode} (${origin} → ${destination}) on ${startDate} has been refunded or exchanged.`,
            flightCancelled: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `Your flight ${airlineCode} (${origin} → ${destination}) on ${startDate}} has been canceled by the airline.`,
            flightScheduleChangePending: (airlineCode: string) => `The airline has proposed a schedule change for flight ${airlineCode}; we are awaiting confirmation.`,
            flightScheduleChangeClosed: (airlineCode: string, startDate?: string) => `Schedule change confirmed: flight ${airlineCode} now departs at ${startDate}.`,
            flightUpdated: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `Your flight ${airlineCode} (${origin} → ${destination}) on ${startDate} has been updated.`,
            flightCabinChanged: (airlineCode: string, cabinClass?: string) => `Your cabin class has been updated to ${cabinClass} on flight ${airlineCode}.`,
            flightSeatConfirmed: (airlineCode: string) => `Your seat assignment on flight ${airlineCode} has been confirmed.`,
            flightSeatChanged: (airlineCode: string) => `Your seat assignment on flight ${airlineCode} has been changed.`,
            flightSeatCancelled: (airlineCode: string) => `Your seat assignment on flight ${airlineCode} was removed.`,
            paymentDeclined: 'Payment for your air booking failed. Please try again.',
            bookingCancelledByTraveler: ({type, id = ''}: TravelTypeParams) => `You cancelled your ${type} reservation ${id}.`,
            bookingCancelledByVendor: ({type, id = ''}: TravelTypeParams) => `The vendor cancelled your ${type} reservation ${id}.`,
            bookingRebooked: ({type, id = ''}: TravelTypeParams) => `Your ${type} reservation was re-booked. New confirmation #:${id}.`,
            bookingUpdated: ({type}: TravelTypeParams) => `Your ${type} booking was updated. Review the new details in the itinerary.`,
            railTicketRefund: ({origin, destination, startDate}: RailTicketParams) =>
                `Your rail ticket for ${origin} → ${destination} on ${startDate} has been refunded. A credit will be processed.`,
            railTicketExchange: ({origin, destination, startDate}: RailTicketParams) => `Your rail ticket for ${origin} → ${destination} on ${startDate} has been exchanged.`,
            railTicketUpdate: ({origin, destination, startDate}: RailTicketParams) => `Your rail ticket for ${origin} → ${destination} on ${startDate} has been updated.`,
            defaultUpdate: ({type}: TravelTypeParams) => `Your ${type} reservation was updated.`,
        },
        flightTo: 'Flight to',
        trainTo: 'Train to',
        carRental: ' car rental',
        nightIn: 'night in',
        nightsIn: 'nights in',
    },
    workspace: {
        common: {
            card: 'Cards',
            expensifyCard: 'Expensify Card',
            companyCards: 'Company cards',
            workflows: 'Workflows',
            workspace: 'Workspace',
            findWorkspace: 'Find workspace',
            edit: 'Edit workspace',
            enabled: 'Enabled',
            disabled: 'Disabled',
            everyone: 'Everyone',
            delete: 'Delete workspace',
            settings: 'Settings',
            reimburse: 'Reimbursements',
            categories: 'Categories',
            tags: 'Tags',
            customField1: 'Custom field 1',
            customField2: 'Custom field 2',
            customFieldHint: 'Add custom coding that applies to all spend from this member.',
            reports: 'Reports',
            reportFields: 'Report fields',
            reportTitle: 'Report title',
            reportField: 'Report field',
            taxes: 'Taxes',
            bills: 'Bills',
            invoices: 'Invoices',
            perDiem: 'Per diem',
            travel: 'Travel',
            members: 'Members',
            accounting: 'Accounting',
            receiptPartners: 'Receipt partners',
            rules: 'Rules',
            displayedAs: 'Displayed as',
            plan: 'Plan',
            profile: 'Overview',
            bankAccount: 'Bank account',
            testTransactions: 'Test transactions',
            issueAndManageCards: 'Issue and manage cards',
            reconcileCards: 'Reconcile cards',
            selectAll: 'Select all',
            selected: () => ({
                one: '1 selected',
                other: (count: number) => `${count} selected`,
            }),
            settlementFrequency: 'Settlement frequency',
            setAsDefault: 'Set as default workspace',
            defaultNote: `Receipts sent to ${CONST.EMAIL.RECEIPTS} will appear in this workspace.`,
            deleteConfirmation: 'Are you sure you want to delete this workspace?',
            deleteWithCardsConfirmation: 'Are you sure you want to delete this workspace? This will remove all card feeds and assigned cards.',
            unavailable: 'Unavailable workspace',
            memberNotFound: 'Member not found. To invite a new member to the workspace, please use the invite button above.',
            notAuthorized: `You don't have access to this page. If you're trying to join this workspace, just ask the workspace owner to add you as a member. Something else? Reach out to ${CONST.EMAIL.CONCIERGE}.`,
            goToWorkspace: 'Go to workspace',
            duplicateWorkspace: 'Duplicate Workspace',
            duplicateWorkspacePrefix: 'Duplicate',
            goToWorkspaces: 'Go to workspaces',
            clearFilter: 'Clear filter',
            workspaceName: 'Workspace name',
            workspaceOwner: 'Owner',
            workspaceType: 'Workspace type',
            workspaceAvatar: 'Workspace avatar',
            mustBeOnlineToViewMembers: 'You need to be online in order to view members of this workspace.',
            moreFeatures: 'More features',
            requested: 'Requested',
            distanceRates: 'Distance rates',
            defaultDescription: 'One place for all your receipts and expenses.',
            descriptionHint: 'Share information about this workspace with all members.',
            welcomeNote: 'Please use Expensify to submit your receipts for reimbursement, thanks!',
            subscription: 'Subscription',
            markAsEntered: 'Mark as manually entered',
            markAsExported: 'Mark as exported',
            exportIntegrationSelected: ({connectionName}: ExportIntegrationSelectedParams) => `Export to ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
            letsDoubleCheck: "Let's double check that everything looks right.",
            lineItemLevel: 'Line-item level',
            reportLevel: 'Report level',
            topLevel: 'Top level',
            appliedOnExport: 'Not imported into Expensify, applied on export',
            shareNote: {
                header: 'Share your workspace with other members',
                content: ({adminsRoomLink}: WorkspaceShareNoteParams) =>
                    `Share this QR code or copy the link below to make it easy for members to request access to your workspace. All requests to join the workspace will show up in the <a href="${adminsRoomLink}">${CONST.REPORT.WORKSPACE_CHAT_ROOMS.ADMINS}</a> room for your review.`,
            },
            connectTo: ({connectionName}: ConnectionNameParams) => `Connect to ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
            createNewConnection: 'Create new connection',
            reuseExistingConnection: 'Reuse existing connection',
            existingConnections: 'Existing connections',
            existingConnectionsDescription: ({connectionName}: ConnectionNameParams) =>
                `Since you've connected to ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]} before, you can choose to reuse an existing connection or create a new one.`,
            lastSyncDate: ({connectionName, formattedDate}: LastSyncDateParams) => `${connectionName} - Last synced ${formattedDate}`,
            authenticationError: (connectionName: string) => `Can’t connect to ${connectionName} due to an authentication error.`,
            learnMore: 'Learn more',
            memberAlternateText: 'Submit and approve reports.',
            adminAlternateText: 'Manage reports and workspace settings.',
            auditorAlternateText: 'View and comment on reports.',
            roleName: ({role}: OptionalParam<RoleNamesParams> = {}) => {
                switch (role) {
                    case CONST.POLICY.ROLE.ADMIN:
                        return 'Admin';
                    case CONST.POLICY.ROLE.AUDITOR:
                        return 'Auditor';
                    case CONST.POLICY.ROLE.USER:
                        return 'Member';
                    default:
                        return 'Member';
                }
            },
            frequency: {
                manual: 'Manually',
                instant: 'Instant',
                immediate: 'Daily',
                trip: 'By trip',
                weekly: 'Weekly',
                semimonthly: 'Twice a month',
                monthly: 'Monthly',
            },
            planType: 'Plan type',
            youCantDowngradeInvoicing:
                "You can't downgrade your plan on an invoiced subscription. To discuss or make changes to your subscription, reach out to your account manager or Concierge for help.",
            defaultCategory: 'Default category',
            viewTransactions: 'View transactions',
            policyExpenseChatName: ({displayName}: PolicyExpenseChatNameParams) => `${displayName}'s expenses`,
            deepDiveExpensifyCard: `<muted-text-label>Expensify Card transactions will automatically export to an "Expensify Card Liability Account" created with <a href="${CONST.DEEP_DIVE_EXPENSIFY_CARD}">our integration</a>.</muted-text-label>`,
        },
        receiptPartners: {
            uber: {
                subtitle: ({organizationName}: ReceiptPartnersUberSubtitleParams) =>
                    organizationName ? `Connected to ${organizationName}` : 'Automate travel and meal delivery expenses across your organization.',
                sendInvites: 'Send invites',
                sendInvitesDescription: "These workspace members don't have an Uber for Business account yet. Unselect any members you do not wish to invite at this time.",
                confirmInvite: 'Confirm invite',
                manageInvites: 'Manage invites',
                confirm: 'Confirm',
                allSet: 'All set',
                readyToRoll: "You're ready to roll",
                takeBusinessRideMessage: 'Take a business ride and your Uber receipts will import into Expensify. Scoot!',
                all: 'All',
                linked: 'Linked',
                outstanding: 'Outstanding',
                status: {
                    resend: 'Resend',
                    invite: 'Invite',
                    [CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.LINKED]: 'Linked',
                    [CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.LINKED_PENDING_APPROVAL]: 'Pending',
                    [CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.SUSPENDED]: 'Suspended',
                },
                centralBillingAccount: 'Central billing account',
                centralBillingDescription: 'Choose where to import all Uber receipts.',
                invitationFailure: 'Failed to invite member to Uber for Business',
                autoInvite: 'Invite new workspace members to Uber for Business',
                autoRemove: 'Deactivate removed workspace members from Uber for Business',
                emptyContent: {
                    title: 'No outstanding invites',
                    subtitle: 'Huzzah! We looked high and low and couldn’t find any outstanding invites.',
                },
            },
        },
        perDiem: {
            subtitle: `<muted-text>Set per diem rates to control daily employee spend. <a href="${CONST.DEEP_DIVE_PER_DIEM}">Learn more</a>.</muted-text>`,
            amount: 'Amount',
            deleteRates: () => ({
                one: 'Delete rate',
                other: 'Delete rates',
            }),
            deletePerDiemRate: 'Delete per diem rate',
            findPerDiemRate: 'Find per diem rate',
            areYouSureDelete: () => ({
                one: 'Are you sure you want to delete this rate?',
                other: 'Are you sure you want to delete these rates?',
            }),
            emptyList: {
                title: 'Per diem',
                subtitle: 'Set per diem rates to control daily employee spend. Import rates from a spreadsheet to get started.',
            },
            importPerDiemRates: 'Import per diem rates',
            editPerDiemRate: 'Edit per diem rate',
            editPerDiemRates: 'Edit per diem rates',
            editDestinationSubtitle: (destination: string) => `Updating this destination will change it for all ${destination} per diem subrates.`,
            editCurrencySubtitle: (destination: string) => `Updating this currency will change it for all ${destination} per diem subrates.`,
        },
        qbd: {
            exportOutOfPocketExpensesDescription: 'Set how out-of-pocket expenses export to QuickBooks Desktop.',
            exportOutOfPocketExpensesCheckToggle: 'Mark checks as “print later”',
            exportDescription: 'Configure how Expensify data exports to QuickBooks Desktop.',
            date: 'Export date',
            exportInvoices: 'Export invoices to',
            exportExpensifyCard: 'Export Expensify Card transactions as',
            account: 'Account',
            accountDescription: 'Choose where to post journal entries.',
            accountsPayable: 'Accounts payable',
            accountsPayableDescription: 'Choose where to create vendor bills.',
            bankAccount: 'Bank account',
            notConfigured: 'Not configured',
            bankAccountDescription: 'Choose where to send checks from.',
            creditCardAccount: 'Credit card account',
            exportDate: {
                label: 'Export date',
                description: 'Use this date when exporting reports to QuickBooks Desktop.',
                values: {
                    [CONST.QUICKBOOKS_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Date of last expense',
                        description: 'Date of the most recent expense on the report.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: 'Export date',
                        description: 'Date the report was exported to QuickBooks Desktop.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: 'Submitted date',
                        description: 'Date the report was submitted for approval.',
                    },
                },
            },
            exportCheckDescription: "We'll create an itemized check for each Expensify report and send it from the bank account below.",
            exportJournalEntryDescription: "We'll create an itemized journal entry for each Expensify report and post it to the account below.",
            exportVendorBillDescription:
                "We'll create an itemized vendor bill for each Expensify report and add it to the account below. If this period is closed, we'll post to the 1st of the next open period.",
            outOfPocketTaxEnabledDescription:
                "QuickBooks Desktop doesn't support taxes on journal entry exports. As you have taxes enabled on your workspace, this export option is unavailable.",
            outOfPocketTaxEnabledError: 'Journal entries are unavailable when taxes are enabled. Please choose a different export option.',
            accounts: {
                [CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: 'Credit card',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Vendor bill',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Journal entry',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Check',

                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CHECK}Description`]:
                    "We'll create an itemized check for each Expensify report and send it from the bank account below.",
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Description`]:
                    "We'll automatically match the merchant name on the credit card transaction to any corresponding vendors in QuickBooks. If no vendors exist, we'll create a 'Credit Card Misc.' vendor for association.",
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Description`]:
                    "We'll create an itemized vendor bill for each Expensify report with the date of the last expense, and add it to the account below. If this period is closed, we'll post to the 1st of the next open period.",

                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}AccountDescription`]: 'Choose where to export credit card transactions.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}AccountDescription`]: 'Choose a vendor to apply to all credit card transactions.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}AccountDescription`]: 'Choose where to send checks from.',

                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Error`]:
                    'Vendor bills are unavailable when locations are enabled. Please choose a different export option.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Error`]: 'Checks are unavailable when locations are enabled. Please choose a different export option.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Error`]:
                    'Journal entries are unavailable when taxes are enabled. Please choose a different export option.',
            },
            noAccountsFound: 'No accounts found',
            noAccountsFoundDescription: 'Add the account in QuickBooks Desktop and sync the connection again',
            qbdSetup: 'QuickBooks Desktop setup',
            requiredSetupDevice: {
                title: "Can't connect from this device",
                body1: "You'll need to setup this connection from the computer that hosts your QuickBooks Desktop company file.",
                body2: "Once you're connected, you'll be able to sync and export from anywhere.",
            },
            setupPage: {
                title: 'Open this link to connect',
                body: 'To complete setup, open the following link on the computer where QuickBooks Desktop is running.',
                setupErrorTitle: 'Something went wrong',
                setupErrorBody: ({conciergeLink}: QBDSetupErrorBodyParams) =>
                    `<muted-text><centered-text>The QuickBooks Desktop connection isn't working at the moment. Please try again later or <a href="${conciergeLink}">reach out to Concierge</a> if the problem persists.</centered-text></muted-text>`,
            },
            importDescription: 'Choose which coding configurations to import from QuickBooks Desktop to Expensify.',
            classes: 'Classes',
            items: 'Items',
            customers: 'Customers/projects',
            exportCompanyCardsDescription: 'Set how company card purchases export to QuickBooks Desktop.',
            defaultVendorDescription: 'Set a default vendor that will apply to all credit card transactions upon export.',
            accountsDescription: 'Your QuickBooks Desktop chart of accounts will import into Expensify as categories.',
            accountsSwitchTitle: 'Choose to import new accounts as enabled or disabled categories.',
            accountsSwitchDescription: 'Enabled categories will be available for members to select when creating their expenses.',
            classesDescription: 'Choose how to handle QuickBooks Desktop classes in Expensify.',
            tagsDisplayedAsDescription: 'Line item level',
            reportFieldsDisplayedAsDescription: 'Report level',
            customersDescription: 'Choose how to handle QuickBooks Desktop customers/projects in Expensify.',
            advancedConfig: {
                autoSyncDescription: 'Expensify will automatically sync with QuickBooks Desktop every day.',
                createEntities: 'Auto-create entities',
                createEntitiesDescription: "Expensify will automatically create vendors in QuickBooks Desktop if they don't exist already.",
            },
            itemsDescription: 'Choose how to handle QuickBooks Desktop items in Expensify.',
            accountingMethods: {
                label: 'When to Export',
                description: 'Choose when to export the expenses:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Accrual',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Cash',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Out-of-pocket expenses will export when final approved',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Out-of-pocket expenses will export when paid',
                },
            },
        },
        qbo: {
            connectedTo: 'Connected to',
            importDescription: 'Choose which coding configurations to import from QuickBooks Online to Expensify.',
            classes: 'Classes',
            locations: 'Locations',
            customers: 'Customers/projects',
            accountsDescription: 'Your QuickBooks Online chart of accounts will import into Expensify as categories.',
            accountsSwitchTitle: 'Choose to import new accounts as enabled or disabled categories.',
            accountsSwitchDescription: 'Enabled categories will be available for members to select when creating their expenses.',
            classesDescription: 'Choose how to handle QuickBooks Online classes in Expensify.',
            customersDescription: 'Choose how to handle QuickBooks Online customers/projects in Expensify.',
            locationsDescription: 'Choose how to handle QuickBooks Online locations in Expensify.',
            taxesDescription: 'Choose how to handle QuickBooks Online taxes in Expensify.',
            locationsLineItemsRestrictionDescription:
                "QuickBooks Online does not support Locations at the line-level for Checks or Vendor Bills. If you'd like to have locations at the line-level, make sure you are using Journal Entries and Credit/Debit Card expenses.",
            taxesJournalEntrySwitchNote: "QuickBooks Online doesn't support taxes on journal entries. Please change your export option to vendor bill or check.",
            exportDescription: 'Configure how Expensify data exports to QuickBooks Online.',
            date: 'Export date',
            exportInvoices: 'Export invoices to',
            exportExpensifyCard: 'Export Expensify Card transactions as',
            exportDate: {
                label: 'Export date',
                description: 'Use this date when exporting reports to QuickBooks Online.',
                values: {
                    [CONST.QUICKBOOKS_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Date of last expense',
                        description: 'Date of the most recent expense on the report.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: 'Export date',
                        description: 'Date the report was exported to QuickBooks Online.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: 'Submitted date',
                        description: 'Date the report was submitted for approval.',
                    },
                },
            },
            receivable: 'Accounts receivable', // This is an account name that will come directly from QBO, so I don't know why we need a translation for it. It should take whatever the name of the account is in QBO. Leaving this note for CS.
            archive: 'Accounts receivable archive', // This is an account name that will come directly from QBO, so I don't know why we need a translation for it. It should take whatever the name of the account is in QBO. Leaving this note for CS.
            exportInvoicesDescription: 'Use this account when exporting invoices to QuickBooks Online.',
            exportCompanyCardsDescription: 'Set how company card purchases export to QuickBooks Online.',
            vendor: 'Vendor',
            defaultVendorDescription: 'Set a default vendor that will apply to all credit card transactions upon export.',
            exportOutOfPocketExpensesDescription: 'Set how out-of-pocket expenses export to QuickBooks Online.',
            exportCheckDescription: "We'll create an itemized check for each Expensify report and send it from the bank account below.",
            exportJournalEntryDescription: "We'll create an itemized journal entry for each Expensify report and post it to the account below.",
            exportVendorBillDescription:
                "We'll create an itemized vendor bill for each Expensify report and add it to the account below. If this period is closed, we'll post to the 1st of the next open period.",
            account: 'Account',
            accountDescription: 'Choose where to post journal entries.',
            accountsPayable: 'Accounts payable',
            accountsPayableDescription: 'Choose where to create vendor bills.',
            bankAccount: 'Bank account',
            notConfigured: 'Not configured',
            bankAccountDescription: 'Choose where to send checks from.',
            creditCardAccount: 'Credit card account',
            companyCardsLocationEnabledDescription:
                "QuickBooks Online doesn't support locations on vendor bill exports. As you have locations enabled on your workspace, this export option is unavailable.",
            outOfPocketTaxEnabledDescription:
                "QuickBooks Online doesn't support taxes on journal entry exports. As you have taxes enabled on your workspace, this export option is unavailable.",
            outOfPocketTaxEnabledError: 'Journal entries are unavailable when taxes are enabled. Please choose a different export option.',
            advancedConfig: {
                autoSyncDescription: 'Expensify will automatically sync with QuickBooks Online every day.',
                inviteEmployees: 'Invite employees',
                inviteEmployeesDescription: 'Import QuickBooks Online employee records and invite employees to this workspace.',
                createEntities: 'Auto-create entities',
                createEntitiesDescription: "Expensify will automatically create vendors in QuickBooks Online if they don't exist already, and auto-create customers when exporting invoices.",
                reimbursedReportsDescription: 'Any time a report is paid using Expensify ACH, the corresponding bill payment will be created in the QuickBooks Online account below.',
                qboBillPaymentAccount: 'QuickBooks bill payment account',
                qboInvoiceCollectionAccount: 'QuickBooks invoice collections account',
                accountSelectDescription: "Choose where to pay bills from and we'll create the payment in QuickBooks Online.",
                invoiceAccountSelectorDescription: "Choose where to receive invoice payments and we'll create the payment in QuickBooks Online.",
            },
            accounts: {
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD]: 'Debit card',
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: 'Credit card',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Vendor bill',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Journal entry',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Check',

                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}Description`]:
                    "We'll automatically match the merchant name on the debit card transaction to any corresponding vendors in QuickBooks. If no vendors exist, we'll create a 'Debit Card Misc.' vendor for association.",
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Description`]:
                    "We'll automatically match the merchant name on the credit card transaction to any corresponding vendors in QuickBooks. If no vendors exist, we'll create a 'Credit Card Misc.' vendor for association.",
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Description`]:
                    "We'll create an itemized vendor bill for each Expensify report with the date of the last expense, and add it to the account below. If this period is closed, we'll post to the 1st of the next open period.",

                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}AccountDescription`]: 'Choose where to export debit card transactions.',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}AccountDescription`]: 'Choose where to export credit card transactions.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}AccountDescription`]: 'Choose a vendor to apply to all credit card transactions.',

                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Error`]: 'Vendor bills are unavailable when locations are enabled. Please choose a different export option.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Error`]: 'Checks are unavailable when locations are enabled. Please choose a different export option.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Error`]: 'Journal entries are unavailable when taxes are enabled. Please choose a different export option.',
            },
            exportDestinationAccountsMisconfigurationError: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Choose a valid account for vendor bill export',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Choose a valid account for journal entry export',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Choose a valid account for check export',
            },
            exportDestinationSetupAccountsInfo: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'To use vendor bill export, set up an accounts payable account in QuickBooks Online',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'To use journal entry export, set up a journal account in QuickBooks Online',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'To use check export, set up a bank account in QuickBooks Online',
            },
            noAccountsFound: 'No accounts found',
            noAccountsFoundDescription: 'Add the account in QuickBooks Online and sync the connection again.',
            accountingMethods: {
                label: 'When to Export',
                description: 'Choose when to export the expenses:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Accrual',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Cash',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Out-of-pocket expenses will export when final approved',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Out-of-pocket expenses will export when paid',
                },
            },
        },
        workspaceList: {
            joinNow: 'Join now',
            askToJoin: 'Ask to join',
        },
        xero: {
            organization: 'Xero organization',
            organizationDescription: "Choose the Xero organization that you'd like to import data from.",
            importDescription: 'Choose which coding configurations to import from Xero to Expensify.',
            accountsDescription: 'Your Xero chart of accounts will import into Expensify as categories.',
            accountsSwitchTitle: 'Choose to import new accounts as enabled or disabled categories.',
            accountsSwitchDescription: 'Enabled categories will be available for members to select when creating their expenses.',
            trackingCategories: 'Tracking categories',
            trackingCategoriesDescription: 'Choose how to handle Xero tracking categories in Expensify.',
            mapTrackingCategoryTo: (categoryName: string) => `Map Xero ${categoryName} to`,
            mapTrackingCategoryToDescription: (categoryName: string) => `Choose where to map ${categoryName} when exporting to Xero.`,
            customers: 'Re-bill customers',
            customersDescription: 'Choose whether to re-bill customers in Expensify. Your Xero customer contacts can be tagged to expenses, and will export to Xero as a sales invoice.',
            taxesDescription: 'Choose how to handle Xero taxes in Expensify.',
            notImported: 'Not imported',
            notConfigured: 'Not configured',
            trackingCategoriesOptions: {
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.DEFAULT]: 'Xero contact default',
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.TAG]: 'Tags',
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.REPORT_FIELD]: 'Report fields',
            },
            exportDescription: 'Configure how Expensify data exports to Xero.',
            purchaseBill: 'Purchase bill',
            exportDeepDiveCompanyCard: 'Exported expenses will post as bank transactions to the Xero bank account below, and transaction dates will match the dates on your bank statement.',
            bankTransactions: 'Bank transactions',
            xeroBankAccount: 'Xero bank account',
            xeroBankAccountDescription: 'Choose where expenses will post as bank transactions.',
            exportExpensesDescription: 'Reports will export as a purchase bill with the date and status selected below.',
            purchaseBillDate: 'Purchase bill date',
            exportInvoices: 'Export invoices as',
            salesInvoice: 'Sales invoice',
            exportInvoicesDescription: 'Sales invoices always display the date on which the invoice was sent.',
            advancedConfig: {
                autoSyncDescription: 'Expensify will automatically sync with Xero every day.',
                purchaseBillStatusTitle: 'Purchase bill status',
                reimbursedReportsDescription: 'Any time a report is paid using Expensify ACH, the corresponding bill payment will be created in the Xero account below.',
                xeroBillPaymentAccount: 'Xero bill payment account',
                xeroInvoiceCollectionAccount: 'Xero invoice collections account',
                xeroBillPaymentAccountDescription: "Choose where to pay bills from and we'll create the payment in Xero.",
                invoiceAccountSelectorDescription: "Choose where to receive invoice payments and we'll create the payment in Xero.",
            },
            exportDate: {
                label: 'Purchase bill date',
                description: 'Use this date when exporting reports to Xero.',
                values: {
                    [CONST.XERO_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Date of last expense',
                        description: 'Date of the most recent expense on the report.',
                    },
                    [CONST.XERO_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: 'Export date',
                        description: 'Date the report was exported to Xero.',
                    },
                    [CONST.XERO_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: 'Submitted date',
                        description: 'Date the report was submitted for approval.',
                    },
                },
            },
            invoiceStatus: {
                label: 'Purchase bill status',
                description: 'Use this status when exporting purchase bills to Xero.',
                values: {
                    [CONST.XERO_CONFIG.INVOICE_STATUS.DRAFT]: 'Draft',
                    [CONST.XERO_CONFIG.INVOICE_STATUS.AWAITING_APPROVAL]: 'Awaiting approval',
                    [CONST.XERO_CONFIG.INVOICE_STATUS.AWAITING_PAYMENT]: 'Awaiting payment',
                },
            },
            noAccountsFound: 'No accounts found',
            noAccountsFoundDescription: 'Please add the account in Xero and sync the connection again',
            accountingMethods: {
                label: 'When to Export',
                description: 'Choose when to export the expenses:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Accrual',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Cash',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Out-of-pocket expenses will export when final approved',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Out-of-pocket expenses will export when paid',
                },
            },
        },
        sageIntacct: {
            preferredExporter: 'Preferred exporter',
            taxSolution: 'Tax solution',
            notConfigured: 'Not configured',
            exportDate: {
                label: 'Export date',
                description: 'Use this date when exporting reports to Sage Intacct.',
                values: {
                    [CONST.SAGE_INTACCT_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Date of last expense',
                        description: 'Date of the most recent expense on the report.',
                    },
                    [CONST.SAGE_INTACCT_EXPORT_DATE.EXPORTED]: {
                        label: 'Export date',
                        description: 'Date the report was exported to Sage Intacct.',
                    },
                    [CONST.SAGE_INTACCT_EXPORT_DATE.SUBMITTED]: {
                        label: 'Submitted date',
                        description: 'Date the report was submitted for approval.',
                    },
                },
            },
            reimbursableExpenses: {
                description: 'Set how out-of-pocket expenses export to Sage Intacct.',
                values: {
                    [CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.EXPENSE_REPORT]: 'Expense reports',
                    [CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL]: 'Vendor bills',
                },
            },
            nonReimbursableExpenses: {
                description: 'Set how company card purchases export to Sage Intacct.',
                values: {
                    [CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.CREDIT_CARD_CHARGE]: 'Credit cards',
                    [CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL]: 'Vendor bills',
                },
            },
            creditCardAccount: 'Credit card account',
            defaultVendor: 'Default vendor',
            defaultVendorDescription: (isReimbursable: boolean) =>
                `Set a default vendor that will apply to ${isReimbursable ? '' : 'non-'}reimbursable expenses that don't have a matching vendor in Sage Intacct.`,
            exportDescription: 'Configure how Expensify data exports to Sage Intacct.',
            exportPreferredExporterNote:
                'The preferred exporter can be any workspace admin, but must also be a Domain Admin if you set different export accounts for individual company cards in Domain Settings.',
            exportPreferredExporterSubNote: 'Once set, the preferred exporter will see reports for export in their account.',
            noAccountsFound: 'No accounts found',
            noAccountsFoundDescription: `Please add the account in Sage Intacct and sync the connection again`,
            autoSync: 'Auto-sync',
            autoSyncDescription: 'Expensify will automatically sync with Sage Intacct every day.',
            inviteEmployees: 'Invite employees',
            inviteEmployeesDescription:
                'Import Sage Intacct employee records and invite employees to this workspace. Your approval workflow will default to manager approval and can be furthered configured on the Members page.',
            syncReimbursedReports: 'Sync reimbursed reports',
            syncReimbursedReportsDescription: 'Any time a report is paid using Expensify ACH, the corresponding bill payment will be created in the Sage Intacct account below.',
            paymentAccount: 'Sage Intacct payment account',
            accountingMethods: {
                label: 'When to Export',
                description: 'Choose when to export the expenses:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Accrual',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Cash',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Out-of-pocket expenses will export when final approved',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Out-of-pocket expenses will export when paid',
                },
            },
        },
        netsuite: {
            subsidiary: 'Subsidiary',
            subsidiarySelectDescription: "Choose the subsidiary in NetSuite that you'd like to import data from.",
            exportDescription: 'Configure how Expensify data exports to NetSuite.',
            exportInvoices: 'Export invoices to',
            journalEntriesTaxPostingAccount: 'Journal entries tax posting account',
            journalEntriesProvTaxPostingAccount: 'Journal entries provincial tax posting account',
            foreignCurrencyAmount: 'Export foreign currency amount',
            exportToNextOpenPeriod: 'Export to next open period',
            nonReimbursableJournalPostingAccount: 'Non-reimbursable journal posting account',
            reimbursableJournalPostingAccount: 'Reimbursable journal posting account',
            journalPostingPreference: {
                label: 'Journal entries posting preference',
                values: {
                    [CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_INDIVIDUAL_LINE]: 'Single, itemized entry for each report',
                    [CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_TOTAL_LINE]: 'Single entry for each expense',
                },
            },
            invoiceItem: {
                label: 'Invoice item',
                values: {
                    [CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.CREATE]: {
                        label: 'Create one for me',
                        description: 'We\'ll create an "Expensify invoice line item" for you upon export (if one doesn’t exist already).',
                    },
                    [CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.SELECT]: {
                        label: 'Select existing',
                        description: "We'll tie invoices from Expensify to the item selected below.",
                    },
                },
            },
            exportDate: {
                label: 'Export date',
                description: 'Use this date when exporting reports to NetSuite.',
                values: {
                    [CONST.NETSUITE_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Date of last expense',
                        description: 'Date of the most recent expense on the report.',
                    },
                    [CONST.NETSUITE_EXPORT_DATE.EXPORTED]: {
                        label: 'Export date',
                        description: 'Date the report was exported to NetSuite.',
                    },
                    [CONST.NETSUITE_EXPORT_DATE.SUBMITTED]: {
                        label: 'Submitted date',
                        description: 'Date the report was submitted for approval.',
                    },
                },
            },
            exportDestination: {
                values: {
                    [CONST.NETSUITE_EXPORT_DESTINATION.EXPENSE_REPORT]: {
                        label: 'Expense reports',
                        reimbursableDescription: 'Out-of-pocket expenses will export as expense reports to NetSuite.',
                        nonReimbursableDescription: 'Company card expenses will export as expense reports to NetSuite.',
                    },
                    [CONST.NETSUITE_EXPORT_DESTINATION.VENDOR_BILL]: {
                        label: 'Vendor bills',
                        reimbursableDescription: dedent(`
                            Out-of-pocket expenses will export as bills payable to the NetSuite vendor specified below.

                            If you'd like to set a specific vendor for each card, go to *Settings > Domains > Company Cards*.
                        `),
                        nonReimbursableDescription: dedent(`
                            Company card expenses will export as bills payable to the NetSuite vendor specified below.

                            If you'd like to set a specific vendor for each card, go to *Settings > Domains > Company Cards*.
                        `),
                    },
                    [CONST.NETSUITE_EXPORT_DESTINATION.JOURNAL_ENTRY]: {
                        label: 'Journal entries',
                        reimbursableDescription: dedent(`
                            Out-of-pocket expenses will export as journal entries to the NetSuite account specified below.

                            If you'd like to set a specific vendor for each card, go to *Settings > Domains > Company Cards*.
                        `),
                        nonReimbursableDescription: dedent(`
                            Company card expenses will export as journal entries to the NetSuite account specified below.

                            If you'd like to set a specific vendor for each card, go to *Settings > Domains > Company Cards*.
                        `),
                    },
                },
                expenseReportDestinationConfirmDescription:
                    "If you switch the company card export setting to expense reports, NetSuite vendors and posting accounts for individual cards will be disabled.\n\nDon't worry, we’ll still save your previous selections in case you want to switch back later.",
            },
            advancedConfig: {
                autoSyncDescription: 'Expensify will automatically sync with NetSuite every day.',
                reimbursedReportsDescription: 'Any time a report is paid using Expensify ACH, the corresponding bill payment will be created in the NetSuite account below.',
                reimbursementsAccount: 'Reimbursements account',
                reimbursementsAccountDescription: "Choose the bank account you'll use for reimbursements, and we'll create the associated payment in NetSuite.",
                collectionsAccount: 'Collections account',
                collectionsAccountDescription: 'Once an invoice is marked as paid in Expensify and exported to NetSuite, it’ll appear against the account below.',
                approvalAccount: 'A/P approval account',
                approvalAccountDescription:
                    'Choose the account that transactions will be approved against in NetSuite. If you’re syncing reimbursed reports, this is also the account that bill payments will be created against.',
                defaultApprovalAccount: 'NetSuite default',
                inviteEmployees: 'Invite employees and set approvals',
                inviteEmployeesDescription:
                    'Import NetSuite employee records and invite employees to this workspace. Your approval workflow will default to manager approval and can be further configured on the *Members* page.',
                autoCreateEntities: 'Auto-create employees/vendors',
                enableCategories: 'Enable newly imported categories',
                customFormID: 'Custom form ID',
                customFormIDDescription:
                    'By default, Expensify will create entries using the preferred transaction form set in NetSuite. Alternatively, you can designate a specific transaction form to be used.',
                customFormIDReimbursable: 'Out-of-pocket expense',
                customFormIDNonReimbursable: 'Company card expense',
                exportReportsTo: {
                    label: 'Expense report approval level',
                    description: 'Once an expense report is approved in Expensify and exported to NetSuite, you can set an additional level of approval in NetSuite prior to posting.',
                    values: {
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_NONE]: 'NetSuite default preference',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_SUPERVISOR_APPROVED]: 'Only supervisor approved',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_ACCOUNTING_APPROVED]: 'Only accounting approved',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_BOTH]: 'Supervisor and accounting approved',
                    },
                },
                accountingMethods: {
                    label: 'When to Export',
                    description: 'Choose when to export the expenses:',
                    values: {
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Accrual',
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Cash',
                    },
                    alternateText: {
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Out-of-pocket expenses will export when final approved',
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Out-of-pocket expenses will export when paid',
                    },
                },
                exportVendorBillsTo: {
                    label: 'Vendor bill approval level',
                    description: 'Once a vendor bill is approved in Expensify and exported to NetSuite, you can set an additional level of approval in NetSuite prior to posting.',
                    values: {
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED_NONE]: 'NetSuite default preference',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVAL_PENDING]: 'Pending approval',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED]: 'Approved for posting',
                    },
                },
                exportJournalsTo: {
                    label: 'Journal entry approval level',
                    description: 'Once a journal entry is approved in Expensify and exported to NetSuite, you can set an additional level of approval in NetSuite prior to posting.',
                    values: {
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED_NONE]: 'NetSuite default preference',
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVAL_PENDING]: 'Pending approval',
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED]: 'Approved for posting',
                    },
                },
                error: {
                    customFormID: 'Please enter a valid numeric custom form ID',
                },
            },
            noAccountsFound: 'No accounts found',
            noAccountsFoundDescription: 'Please add the account in NetSuite and sync the connection again',
            noVendorsFound: 'No vendors found',
            noVendorsFoundDescription: 'Please add vendors in NetSuite and sync the connection again',
            noItemsFound: 'No invoice items found',
            noItemsFoundDescription: 'Please add invoice items in NetSuite and sync the connection again',
            noSubsidiariesFound: 'No subsidiaries found',
            noSubsidiariesFoundDescription: 'Please add a subsidiary in NetSuite and sync the connection again',
            tokenInput: {
                title: 'NetSuite setup',
                formSteps: {
                    installBundle: {
                        title: 'Install the Expensify bundle',
                        description: 'In NetSuite, go to *Customization > SuiteBundler > Search & Install Bundles* > search for "Expensify" > install the bundle.',
                    },
                    enableTokenAuthentication: {
                        title: 'Enable token-based authentication',
                        description: 'In NetSuite, go to *Setup > Company > Enable Features > SuiteCloud* > enable *token-based authentication*.',
                    },
                    enableSoapServices: {
                        title: 'Enable SOAP web services',
                        description: 'In NetSuite, go to *Setup > Company > Enable Features > SuiteCloud* > enable *SOAP Web Services*.',
                    },
                    createAccessToken: {
                        title: 'Create an access token',
                        description:
                            'In NetSuite, go to *Setup > Users/Roles > Access Tokens* > create an access token for the "Expensify" app and either the "Expensify Integration" or "Administrator" role.\n\n*Important:* Make sure you save the *Token ID* and *Token Secret* from this step. You\'ll need it for the next step.',
                    },
                    enterCredentials: {
                        title: 'Enter your NetSuite credentials',
                        formInputs: {
                            netSuiteAccountID: 'NetSuite Account ID',
                            netSuiteTokenID: 'Token ID',
                            netSuiteTokenSecret: 'Token Secret',
                        },
                        netSuiteAccountIDDescription: 'In NetSuite, go to *Setup > Integration > SOAP Web Services Preferences*.',
                    },
                },
            },
            import: {
                expenseCategories: 'Expense categories',
                expenseCategoriesDescription: 'Your NetSuite expense categories will import into Expensify as categories.',
                crossSubsidiaryCustomers: 'Cross-subsidiary customers/projects',
                importFields: {
                    departments: {
                        title: 'Departments',
                        subtitle: 'Choose how to handle the NetSuite *departments* in Expensify.',
                    },
                    classes: {
                        title: 'Classes',
                        subtitle: 'Choose how to handle *classes* in Expensify.',
                    },
                    locations: {
                        title: 'Locations',
                        subtitle: 'Choose how to handle *locations* in Expensify.',
                    },
                },
                customersOrJobs: {
                    title: 'Customers/projects',
                    subtitle: 'Choose how to handle NetSuite *customers* and *projects* in Expensify.',
                    importCustomers: 'Import customers',
                    importJobs: 'Import projects',
                    customers: 'customers',
                    jobs: 'projects',
                    label: (importFields: string[], importType: string) => `${importFields.join(' and ')}, ${importType}`,
                },
                importTaxDescription: 'Import tax groups from NetSuite.',
                importCustomFields: {
                    chooseOptionBelow: 'Choose an option below:',
                    label: (importedTypes: string[]) => `Imported as ${importedTypes.join(' and ')}`,
                    requiredFieldError: ({fieldName}: RequiredFieldParams) => `Please enter the ${fieldName}`,
                    customSegments: {
                        title: 'Custom segments/records',
                        addText: 'Add custom segment/record',
                        recordTitle: 'Custom segment/record',
                        helpLink: CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS,
                        helpLinkText: 'View detailed instructions',
                        helpText: ' on configuring custom segments/records.',
                        emptyTitle: 'Add a custom segment or custom record',
                        fields: {
                            segmentName: 'Name',
                            internalID: 'Internal ID',
                            scriptID: 'Script ID',
                            customRecordScriptID: 'Transaction column ID',
                            mapping: 'Displayed as',
                        },
                        removeTitle: 'Remove custom segment/record',
                        removePrompt: 'Are you sure you want to remove this custom segment/record?',
                        addForm: {
                            customSegmentName: 'custom segment name',
                            customRecordName: 'custom record name',
                            segmentTitle: 'Custom segment',
                            customSegmentAddTitle: 'Add custom segment',
                            customRecordAddTitle: 'Add custom record',
                            recordTitle: 'Custom record',
                            segmentRecordType: 'Do you want to add a custom segment or a custom record?',
                            customSegmentNameTitle: "What's the custom segment name?",
                            customRecordNameTitle: "What's the custom record name?",
                            customSegmentNameFooter: `You can find custom segment names in NetSuite under *Customizations > Links, Records & Fields > Custom Segments* page.\n\n_For more detailed instructions, [visit our help site](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customRecordNameFooter: `You can find custom record names in NetSuite by entering the "Transaction Column Field" in global search.\n\n_For more detailed instructions, [visit our help site](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentInternalIDTitle: "What's the internal ID?",
                            customSegmentInternalIDFooter: `First, make sure you've enabled internal IDs in NetSuite under *Home > Set Preferences > Show Internal ID.*\n\nYou can find custom segment internal IDs in NetSuite under:\n\n1. *Customization > Lists, Records, & Fields > Custom Segments*.\n2. Click into a custom segment.\n3. Click the hyperlink next to *Custom Record Type*.\n4. Find the internal ID in the table at the bottom.\n\n_For more detailed instructions, [visit our help site](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            customRecordInternalIDFooter: `You can find custom record internal IDs in NetSuite by following these steps:\n\n1. Enter "Transaction Line Fields" in global search.\n2. Click into a custom record.\n3. Find the internal ID on the left-hand side.\n\n_For more detailed instructions, [visit our help site](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentScriptIDTitle: "What's the script ID?",
                            customSegmentScriptIDFooter: `You can find custom segment script IDs in NetSuite under: \n\n1. *Customization > Lists, Records, & Fields > Custom Segments*.\n2. Click into a custom segment.\n3. Click the *Application and Sourcing* tab near the bottom, then:\n    a. If you want to display the custom segment as a *tag* (at the line-item level) in Expensify, click the *Transaction Columns* sub-tab and use the *Field ID*.\n    b. If you want to display the custom segment as a *report field* (at the report level) in Expensify, click the *Transactions* sub-tab and use the *Field ID*.\n\n_For more detailed instructions, [visit our help site](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            customRecordScriptIDTitle: "What's the transaction column ID?",
                            customRecordScriptIDFooter: `You can find custom record script IDs in NetSuite under:\n\n1. Enter "Transaction Line Fields" in global search.\n2. Click into a custom record.\n3. Find the script ID on the left-hand side.\n\n_For more detailed instructions, [visit our help site](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentMappingTitle: 'How should this custom segment be displayed in Expensify?',
                            customRecordMappingTitle: 'How should this custom record be displayed in Expensify?',
                        },
                        errors: {
                            uniqueFieldError: ({fieldName}: RequiredFieldParams) => `A custom segment/record with this ${fieldName?.toLowerCase()} already exists`,
                        },
                    },
                    customLists: {
                        title: 'Custom lists',
                        addText: 'Add custom list',
                        recordTitle: 'Custom list',
                        helpLink: CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS,
                        helpLinkText: 'View detailed instructions',
                        helpText: ' on configuring custom lists.',
                        emptyTitle: 'Add a custom list',
                        fields: {
                            listName: 'Name',
                            internalID: 'Internal ID',
                            transactionFieldID: 'Transaction field ID',
                            mapping: 'Displayed as',
                        },
                        removeTitle: 'Remove custom list',
                        removePrompt: 'Are you sure you want to remove this custom list?',
                        addForm: {
                            listNameTitle: 'Choose a custom list',
                            transactionFieldIDTitle: "What's the transaction field ID?",
                            transactionFieldIDFooter: `You can find transaction field IDs in NetSuite by following these steps:\n\n1. Enter "Transaction Line Fields" in global search.\n2. Click into a custom list.\n3. Find the transaction field ID on the left-hand side.\n\n_For more detailed instructions, [visit our help site](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            mappingTitle: 'How should this custom list be displayed in Expensify?',
                        },
                        errors: {
                            uniqueTransactionFieldIDError: `A custom list with this transaction field ID already exists`,
                        },
                    },
                },
                importTypes: {
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT]: {
                        label: 'NetSuite employee default',
                        description: 'Not imported into Expensify, applied on export',
                        footerContent: (importField: string) =>
                            `If you use ${importField} in NetSuite, we'll apply the default set on the employee record upon export to Expense Report or Journal Entry.`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG]: {
                        label: 'Tags',
                        description: 'Line-item level',
                        footerContent: (importField: string) => `${startCase(importField)} will be selectable for each individual expense on an employee's report.`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD]: {
                        label: 'Report fields',
                        description: 'Report level',
                        footerContent: (importField: string) => `${startCase(importField)} selection will apply to all expense on an employee's report.`,
                    },
                },
            },
        },
        intacct: {
            sageIntacctSetup: 'Sage Intacct setup',
            prerequisitesTitle: 'Before you connect...',
            downloadExpensifyPackage: 'Download the Expensify package for Sage Intacct',
            followSteps: 'Follow the steps in our How-to: Connect to Sage Intacct instructions',
            enterCredentials: 'Enter your Sage Intacct credentials',
            entity: 'Entity',
            employeeDefault: 'Sage Intacct employee default',
            employeeDefaultDescription: "The employee's default department will be applied to their expenses in Sage Intacct if one exists.",
            displayedAsTagDescription: "Department will be selectable for each individual expense on an employee's report.",
            displayedAsReportFieldDescription: "Department selection will apply to all expenses on an employee's report.",
            toggleImportTitle: ({mappingTitle}: ToggleImportTitleParams) => `Choose how to handle Sage Intacct <strong>${mappingTitle}</strong> in Expensify.`,
            expenseTypes: 'Expense types',
            expenseTypesDescription: 'Your Sage Intacct expense types will import into Expensify as categories.',
            accountTypesDescription: 'Your Sage Intacct chart of accounts will import into Expensify as categories.',
            importTaxDescription: 'Import purchase tax rate from Sage Intacct.',
            userDefinedDimensions: 'User-defined dimensions',
            addUserDefinedDimension: 'Add user-defined dimension',
            integrationName: 'Integration name',
            dimensionExists: 'A dimension with this name already exists.',
            removeDimension: 'Remove user-defined dimension',
            removeDimensionPrompt: 'Are you sure you want to remove this user-defined dimension?',
            userDefinedDimension: 'User-defined dimension',
            addAUserDefinedDimension: 'Add a user-defined dimension',
            detailedInstructionsLink: 'View detailed instructions',
            detailedInstructionsRestOfSentence: ' on adding user-defined dimensions.',
            userDimensionsAdded: () => ({
                one: '1 UDD added',
                other: (count: number) => `${count} UDDs added`,
            }),
            mappingTitle: ({mappingName}: IntacctMappingTitleParams) => {
                switch (mappingName) {
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.DEPARTMENTS:
                        return 'departments';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.CLASSES:
                        return 'classes';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.LOCATIONS:
                        return 'locations';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.CUSTOMERS:
                        return 'customers';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.PROJECTS:
                        return 'projects (jobs)';
                    default:
                        return 'mappings';
                }
            },
        },
        type: {
            free: 'Free',
            control: 'Control',
            collect: 'Collect',
        },
        companyCards: {
            addCards: 'Add cards',
            selectCards: 'Select cards',
            addNewCard: {
                other: 'Other',
                cardProviders: {
                    gl1025: 'American Express Corporate Cards',
                    cdf: 'Mastercard Commercial Cards',
                    vcf: 'Visa Commercial Cards',
                    stripe: 'Stripe Cards',
                },
                yourCardProvider: `Who's your card provider?`,
                whoIsYourBankAccount: 'Who’s your bank?',
                whereIsYourBankLocated: 'Where’s your bank located?',
                howDoYouWantToConnect: 'How do you want to connect to your bank?',
                learnMoreAboutOptions: `<muted-text>Learn more about these <a href="${CONST.COMPANY_CARDS_CONNECT_CREDIT_CARDS_HELP_URL}">options</a>.</muted-text>`,
                commercialFeedDetails: 'Requires setup with your bank. This is typically used by larger companies and is often the best option if you qualify.',
                commercialFeedPlaidDetails: `Requires setup with your bank, but we'll guide you. This is typically limited to larger companies.`,
                directFeedDetails: 'The simplest approach. Connect right away using your master credentials. This method is most common.',
                enableFeed: {
                    title: (provider: string) => `Enable your ${provider} feed`,
                    heading: 'We have a direct integration with your card issuer and can import your transaction data into Expensify quickly and accurately.\n\nTo get started, simply:',
                    visa: 'We have global integrations with Visa, though eligibility varies by bank and card program.\n\nTo get started, simply:',
                    mastercard: 'We have global integrations with Mastercard, though eligibility varies by bank and card program.\n\nTo get started, simply:',
                    vcf: `1. Visit [this help article](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP}) for detailed instructions on how to set up your Visa Commercial Cards.\n\n2. [Contact your bank](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP}) to verify they support a commercial feed for your program, and ask them to enable it.\n\n3. *Once the feed is enabled and you have its details, continue to the next screen.*`,
                    gl1025: `1. Visit [this help article](${CONST.COMPANY_CARDS_AMEX_COMMERCIAL_CARD_HELP}) to find out if American Express can enable a commercial feed for your program.\n\n2. Once the feed is enabled, Amex will send you a production letter.\n\n3. *Once you have the feed information, continue to the next screen.*`,
                    cdf: `1. Visit [this help article](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS}) for detailed instructions on how to set up your Mastercard Commercial Cards.\n\n 2. [Contact your bank](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS}) to verify they support a commercial feed for your program, and ask them to enable it.\n\n3. *Once the feed is enabled and you have its details, continue to the next screen.*`,
                    stripe: `1. Visit Stripe’s Dashboard, and go to [Settings](${CONST.COMPANY_CARDS_STRIPE_HELP}).\n\n2. Under Product Integrations, click Enable next to Expensify.\n\n3. Once the feed is enabled, click Submit below and we’ll work on adding it.`,
                },
                whatBankIssuesCard: 'What bank issues these cards?',
                enterNameOfBank: 'Enter name of bank',
                feedDetails: {
                    vcf: {
                        title: 'What are the Visa feed details?',
                        processorLabel: 'Processor ID',
                        bankLabel: 'Financial institution (bank) ID',
                        companyLabel: 'Company ID',
                        helpLabel: 'Where do I find these IDs?',
                    },
                    gl1025: {
                        title: `What's the Amex delivery file name?`,
                        fileNameLabel: 'Delivery file name',
                        helpLabel: 'Where do I find the delivery file name?',
                    },
                    cdf: {
                        title: `What's the Mastercard distribution ID?`,
                        distributionLabel: 'Distribution ID',
                        helpLabel: 'Where do I find the distribution ID?',
                    },
                },
                amexCorporate: 'Select this if the front of your cards say “Corporate”',
                amexBusiness: 'Select this if the front of your cards say “Business”',
                amexPersonal: 'Select this if your cards are personal',
                error: {
                    pleaseSelectProvider: 'Please select a card provider before continuing',
                    pleaseSelectBankAccount: 'Please select a bank account before continuing',
                    pleaseSelectBank: 'Please select a bank before continuing',
                    pleaseSelectCountry: 'Please select a country before continuing',
                    pleaseSelectFeedType: 'Please select a feed type before continuing',
                },
                exitModal: {
                    title: 'Something not working?',
                    prompt: "We noticed you didn't finish adding your cards. If you found an issue, let us know so we can help get things back on track.",
                    confirmText: 'Report issue',
                    cancelText: 'Skip',
                },
            },
            statementCloseDate: {
                [CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.LAST_DAY_OF_MONTH]: 'Last day of the month',
                [CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.LAST_BUSINESS_DAY_OF_MONTH]: 'Last business day of the month',
                [CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.CUSTOM_DAY_OF_MONTH]: 'Custom day of month',
            },
            assign: 'Assign',
            assignCard: 'Assign card',
            findCard: 'Find card',
            cardNumber: 'Card number',
            commercialFeed: 'Commercial feed',
            feedName: (feedName: string) => `${feedName} cards`,
            directFeed: 'Direct feed',
            whoNeedsCardAssigned: 'Who needs a card assigned?',
            chooseTheCardholder: 'Choose the cardholder',
            chooseCard: 'Choose a card',
            chooseCardFor: (assignee: string) => `Choose a card for <strong>${assignee}</strong>. Can't find the card you're looking for? <concierge-link>Let us know.</concierge-link>`,
            noActiveCards: 'No active cards on this feed',
            somethingMightBeBroken:
                '<muted-text><centered-text>Or something might be broken. Either way, if you have any questions, just <concierge-link>contact Concierge</concierge-link>.</centered-text></muted-text>',
            chooseTransactionStartDate: 'Choose a transaction start date',
            startDateDescription: "Choose your import start date. We'll sync all transactions from this date onwards.",
            fromTheBeginning: 'From the beginning',
            customStartDate: 'Custom start date',
            customCloseDate: 'Custom close date',
            letsDoubleCheck: "Let's double check that everything looks right.",
            confirmationDescription: "We'll begin importing transactions immediately.",
            card: 'Card',
            cardName: 'Card name',
            brokenConnectionError: '<rbr>Card feed connection is broken. Please <a href="#">log into your bank</a> so we can establish the connection again.</rbr>',
            assignedCard: (assignee: string, link: string) => `assigned ${assignee} a ${link}! Imported transactions will appear in this chat.`,
            companyCard: 'company card',
            chooseCardFeed: 'Choose card feed',
            ukRegulation:
                'Expensify Limited is an agent of Plaid Financial Ltd., an authorised payment institution regulated by the Financial Conduct Authority under the Payment Services Regulations 2017 (Firm Reference Number: 804718). Plaid provides you with regulated account information services through Expensify Limited as its agent.',
            assignCardFailedError: 'Card assignment failed.',
            unassignCardFailedError: 'Card unassignment failed.',
            cardAlreadyAssignedError: 'This card is already assigned to a user in another workspace.',
        },
        expensifyCard: {
            issueAndManageCards: 'Issue and manage your Expensify Cards',
            getStartedIssuing: 'Get started by issuing your first virtual or physical card.',
            verificationInProgress: 'Verification in progress...',
            verifyingTheDetails: "We're verifying a few details. Concierge will let you know when Expensify Cards are ready to issue.",
            disclaimer:
                'The Expensify Visa® Commercial Card is issued by The Bancorp Bank, N.A., Member FDIC, pursuant to a license from Visa U.S.A. Inc. and may not be used at all merchants that accept Visa cards. Apple® and the Apple logo® are trademarks of Apple Inc., registered in the U.S. and other countries. App Store is a service mark of Apple Inc. Google Play and the Google Play logo are trademarks of Google LLC.',
            euUkDisclaimer:
                'Cards provided to EEA residents are issued by Transact Payments Malta Limited and cards provided to UK residents are issued by Transact Payments Limited pursuant to license by Visa Europe Limited. Transact Payments Malta Limited is duly authorized and regulated by the Malta Financial Services Authority as a Financial Institution under the Financial Institution Act 1994. Registration number C 91879. Transact Payments Limited is authorized and regulated by the Gibraltar Financial Service Commission.',
            issueCard: 'Issue card',
            findCard: 'Find card',
            newCard: 'New card',
            name: 'Name',
            lastFour: 'Last 4',
            limit: 'Limit',
            currentBalance: 'Current balance',
            currentBalanceDescription: 'Current balance is the sum of all posted Expensify Card transactions that have occurred since the last settlement date.',
            balanceWillBeSettledOn: ({settlementDate}: SettlementDateParams) => `Balance will be settled on ${settlementDate}`,
            settleBalance: 'Settle balance',
            cardLimit: 'Card limit',
            remainingLimit: 'Remaining limit',
            requestLimitIncrease: 'Request limit increase',
            remainingLimitDescription:
                'We consider a number of factors when calculating your remaining limit: your tenure as a customer, the business-related information you provided during signup, and the available cash in your business bank account. Your remaining limit can fluctuate on a daily basis.',
            earnedCashback: 'Cash back',
            earnedCashbackDescription: 'Cash back balance is based on settled monthly Expensify Card spend across your workspace.',
            issueNewCard: 'Issue new card',
            finishSetup: 'Finish setup',
            chooseBankAccount: 'Choose bank account',
            chooseExistingBank: 'Choose an existing business bank account to pay your Expensify Card balance, or add a new bank account',
            accountEndingIn: 'Account ending in',
            addNewBankAccount: 'Add a new bank account',
            settlementAccount: 'Settlement account',
            settlementAccountDescription: 'Choose an account to pay your Expensify Card balance.',
            settlementAccountInfo: ({reconciliationAccountSettingsLink, accountNumber}: SettlementAccountInfoParams) =>
                `Make sure this account matches your <a href="${reconciliationAccountSettingsLink}">Reconciliation account</a> (${accountNumber}) so Continuous Reconciliation works properly.`,
            settlementFrequency: 'Settlement frequency',
            settlementFrequencyDescription: 'Choose how often you’ll pay your Expensify Card balance.',
            settlementFrequencyInfo: 'If you’d like to switch to monthly settlement, you’ll need to connect your bank account via Plaid and have a positive 90-day balance history.',
            frequency: {
                daily: 'Daily',
                monthly: 'Monthly',
            },
            cardDetails: 'Card details',
            cardPending: ({name}: {name: string}) => `Card is currently pending and will be issued once ${name}'s account is validated.`,
            virtual: 'Virtual',
            physical: 'Physical',
            deactivate: 'Deactivate card',
            changeCardLimit: 'Change card limit',
            changeLimit: 'Change limit',
            smartLimitWarning: (limit: number | string) => `If you change this card’s limit to ${limit}, new transactions will be declined until you approve more expenses on the card.`,
            monthlyLimitWarning: (limit: number | string) => `If you change this card’s limit to ${limit}, new transactions will be declined until next month.`,
            fixedLimitWarning: (limit: number | string) => `If you change this card’s limit to ${limit}, new transactions will be declined.`,
            changeCardLimitType: 'Change card limit type',
            changeLimitType: 'Change limit type',
            changeCardSmartLimitTypeWarning: (limit: number | string) =>
                `If you change this card's limit type to Smart Limit, new transactions will be declined because the ${limit} unapproved limit has already been reached.`,
            changeCardMonthlyLimitTypeWarning: (limit: number | string) =>
                `If you change this card's limit type to Monthly, new transactions will be declined because the ${limit} monthly limit has already been reached.`,
            addShippingDetails: 'Add shipping details',
            issuedCard: (assignee: string) => `issued ${assignee} an Expensify Card! The card will arrive in 2-3 business days.`,
            issuedCardNoShippingDetails: (assignee: string) => `issued ${assignee} an Expensify Card! The card will be shipped once shipping details are confirmed.`,
            issuedCardVirtual: ({assignee, link}: IssueVirtualCardParams) => `issued ${assignee} a virtual Expensify Card! The ${link} can be used right away.`,
            addedShippingDetails: (assignee: string) => `${assignee} added shipping details. Expensify Card will arrive in 2-3 business days.`,
            replacedCard: (assignee: string) => `${assignee} replaced their Expensify Card. The new card will arrive in 2-3 business days.`,
            replacedVirtualCard: ({assignee, link}: IssueVirtualCardParams) => `${assignee} replaced their virtual Expensify Card! The ${link} can be used right away.`,
            card: 'card',
            replacementCard: 'replacement card',
            verifyingHeader: 'Verifying',
            bankAccountVerifiedHeader: 'Bank account verified',
            verifyingBankAccount: 'Verifying bank account...',
            verifyingBankAccountDescription: 'Please wait while we confirm that this account can be used to issue Expensify Cards.',
            bankAccountVerified: 'Bank account verified!',
            bankAccountVerifiedDescription: 'You can now issue Expensify Cards to your workspace members.',
            oneMoreStep: 'One more step...',
            oneMoreStepDescription: 'Looks like we need to manually verify your bank account. Please head on over to Concierge where your instructions are waiting for you.',
            gotIt: 'Got it',
            goToConcierge: 'Go to Concierge',
        },
        categories: {
            deleteCategories: 'Delete categories',
            deleteCategoriesPrompt: 'Are you sure you want to delete these categories?',
            deleteCategory: 'Delete category',
            deleteCategoryPrompt: 'Are you sure you want to delete this category?',
            disableCategories: 'Disable categories',
            disableCategory: 'Disable category',
            enableCategories: 'Enable categories',
            enableCategory: 'Enable category',
            defaultSpendCategories: 'Default spend categories',
            spendCategoriesDescription: 'Customize how merchant spend is categorized for credit card transactions and scanned receipts.',
            deleteFailureMessage: 'An error occurred while deleting the category, please try again',
            categoryName: 'Category name',
            requiresCategory: 'Members must categorize all expenses',
            needCategoryForExportToIntegration: ({connectionName}: NeedCategoryForExportToIntegrationParams) => `All expenses must be categorized in order to export to ${connectionName}.`,
            subtitle: 'Get a better overview of where money is being spent. Use our default categories or add your own.',
            emptyCategories: {
                title: "You haven't created any categories",
                subtitle: 'Add a category to organize your spend.',
                subtitleWithAccounting: (accountingPageURL: string) =>
                    `<muted-text><centered-text>Your categories are currently importing from an accounting connection. Head over to <a href="${accountingPageURL}">accounting</a> to make any changes.</centered-text></muted-text>`,
            },
            updateFailureMessage: 'An error occurred while updating the category, please try again',
            createFailureMessage: 'An error occurred while creating the category, please try again',
            addCategory: 'Add category',
            editCategory: 'Edit category',
            editCategories: 'Edit categories',
            findCategory: 'Find category',
            categoryRequiredError: 'Category name is required',
            existingCategoryError: 'A category with this name already exists',
            invalidCategoryName: 'Invalid category name',
            importedFromAccountingSoftware: 'The categories below are imported from your',
            payrollCode: 'Payroll code',
            updatePayrollCodeFailureMessage: 'An error occurred while updating the payroll code, please try again',
            glCode: 'GL code',
            updateGLCodeFailureMessage: 'An error occurred while updating the GL code, please try again',
            importCategories: 'Import categories',
            cannotDeleteOrDisableAllCategories: {
                title: 'Cannot delete or disable all categories',
                description: `At least one category must remain enabled because your workspace requires categories.`,
            },
        },
        moreFeatures: {
            subtitle: 'Use the toggles below to enable more features as you grow. Each feature will appear in the navigation menu for further customization.',
            spendSection: {
                title: 'Spend',
                subtitle: 'Enable functionality that helps you scale your team.',
            },
            manageSection: {
                title: 'Manage',
                subtitle: 'Add controls that help keep spend within budget.',
            },
            earnSection: {
                title: 'Earn',
                subtitle: 'Streamline your revenue and get paid faster.',
            },
            organizeSection: {
                title: 'Organize',
                subtitle: 'Group and analyze spend, record every tax paid.',
            },
            integrateSection: {
                title: 'Integrate',
                subtitle: 'Connect Expensify to popular financial products.',
            },
            distanceRates: {
                title: 'Distance rates',
                subtitle: 'Add, update, and enforce rates.',
            },
            perDiem: {
                title: 'Per diem',
                subtitle: 'Set per diem rates to control daily employee spend.',
            },
            travel: {
                title: 'Travel',
                subtitle: 'Book, manage, and reconcile all your business travel.',
                getStarted: {
                    title: 'Get started with Expensify Travel',
                    subtitle: "We just need a few more pieces of info about your business, then you'll be ready for takeoff.",
                    ctaText: "Let's go",
                },
                reviewingRequest: {
                    title: "Pack your bags, we've got your request...",
                    subtitle: "We're currently reviewing your request to enable Expensify Travel. Don't worry, we'll let you know when it's ready.",
                    ctaText: 'Request sent',
                },
                bookOrManageYourTrip: {
                    title: 'Book or manage your trip',
                    subtitle: 'Use Expensify Travel to get the best travel offers and manage all your business expenses in a single place.',
                    ctaText: 'Book or manage',
                },
                travelInvoicing: {
                    travelBookingSection: {
                        title: 'Travel booking',
                        subtitle: "Congrats! You're all set to book and manage travel on this workspace.",
                        manageTravelLabel: 'Manage travel',
                    },
                    centralInvoicingSection: {
                        title: 'Central invoicing',
                        subtitle: 'Centralize all travel spend in a monthly invoice instead of paying at time of purchase.',
                        learnHow: 'Learn how.',
                        subsections: {
                            currentTravelSpendLabel: 'Current travel spend',
                            currentTravelSpendCta: 'Pay balance',
                            currentTravelLimitLabel: 'Current travel limit',
                            settlementAccountLabel: 'Settlement account',
                            settlementFrequencyLabel: 'Settlement frequency',
                        },
                    },
                },
            },
            expensifyCard: {
                title: 'Expensify Card',
                subtitle: 'Gain insights and control over spend.',
                disableCardTitle: 'Disable Expensify Card',
                disableCardPrompt: 'You can’t disable the Expensify Card because it’s already in use. Reach out to Concierge for next steps.',
                disableCardButton: 'Chat with Concierge',
                feed: {
                    title: 'Get the Expensify Card',
                    subTitle: 'Streamline your business expenses and save up to 50% on your Expensify bill, plus:',
                    features: {
                        cashBack: 'Cash back on every US purchase',
                        unlimited: 'Unlimited virtual cards',
                        spend: 'Spend controls and custom limits',
                    },
                    ctaTitle: 'Issue new card',
                },
            },
            companyCards: {
                title: 'Company cards',
                subtitle: 'Connect the cards you already have.',
                feed: {
                    title: 'Bring your own cards (BYOC)',
                    subtitle: 'Link the cards you already have for automatic transaction import, receipt matching, and reconciliation.',
                    features: {
                        support: 'Connect cards from 10,000+ banks',
                        assignCards: 'Link your team’s existing cards',
                        automaticImport: 'We’ll pull in transactions automatically',
                    },
                },
                bankConnectionError: 'Bank connection issue',
                connectWithPlaid: 'connect via Plaid',
                connectWithExpensifyCard: 'try the Expensify Card.',
                bankConnectionDescription: `Please try adding your cards again. Otherwise, you can`,
                disableCardTitle: 'Disable company cards',
                disableCardPrompt: 'You can’t disable company cards because this feature is in use. Reach out to the Concierge for next steps.',
                disableCardButton: 'Chat with Concierge',
                cardDetails: 'Card details',
                cardNumber: 'Card number',
                cardholder: 'Cardholder',
                cardName: 'Card name',
                allCards: 'All cards',
                assignedCards: 'Assigned',
                unassignedCards: 'Unassigned',
                integrationExport: ({integration, type}: IntegrationExportParams) => (integration && type ? `${integration} ${type.toLowerCase()} export` : `${integration} export`),
                integrationExportTitleXero: ({integration}: IntegrationExportParams) => `Choose the ${integration} account where transactions should be exported.`,
                integrationExportTitle: ({integration, exportPageLink}: IntegrationExportParams) =>
                    `Choose the ${integration} account where transactions should be exported. Select a different <a href="${exportPageLink}">export option</a> to change the available accounts.`,
                lastUpdated: 'Last updated',
                transactionStartDate: 'Transaction start date',
                updateCard: 'Update card',
                unassignCard: 'Unassign card',
                unassign: 'Unassign',
                unassignCardDescription: 'Unassign this card will remove all transactions on draft reports from the cardholder’s account.',
                assignCard: 'Assign card',
                cardFeedName: 'Card feed name',
                cardFeedNameDescription: 'Give the card feed a unique name so you can tell it apart from the others.',
                cardFeedTransaction: 'Delete transactions',
                cardFeedTransactionDescription: 'Choose whether cardholders can delete card transactions. New transactions will follow these rules.',
                cardFeedRestrictDeletingTransaction: 'Restrict deleting transactions',
                cardFeedAllowDeletingTransaction: 'Allow deleting transactions',
                removeCardFeed: 'Remove card feed',
                removeCardFeedTitle: (feedName: string) => `Remove ${feedName} feed`,
                removeCardFeedDescription: 'Are you sure you want to remove this card feed? This will unassign all cards.',
                error: {
                    feedNameRequired: 'Card feed name is required',
                    statementCloseDateRequired: 'Please select a statement close date.',
                },
                corporate: 'Restrict deleting transactions',
                personal: 'Allow deleting transactions',
                setFeedNameDescription: 'Give the card feed a unique name so you can tell it apart from the others',
                setTransactionLiabilityDescription: 'When enabled, cardholders can delete card transactions. New transactions will follow this rule.',
                emptyAddedFeedTitle: 'No cards in this feed',
                emptyAddedFeedDescription: "Make sure there are cards in your bank's card feed.",
                pendingFeedTitle: `We're reviewing your request...`,
                pendingFeedDescription: `We're currently reviewing your feed details. Once that's done, we'll reach out to you via`,
                pendingBankTitle: 'Check your browser window',
                pendingBankDescription: (bankName: string) => `Please connect to ${bankName} via your browser window that just opened. If one didn’t open, `,
                pendingBankLink: 'please click here',
                giveItNameInstruction: 'Give the card a name that sets it apart from others.',
                updating: 'Updating...',
                neverUpdated: 'Never',
                noAccountsFound: 'No accounts found',
                defaultCard: 'Default card',
                downgradeTitle: `Can't downgrade workspace`,
                downgradeSubTitle: `This workspace can't be downgraded because multiple card feeds are connected (excluding Expensify Cards). Please <a href="#">keep only one card feed</a> to proceed.`,
                noAccountsFoundDescription: (connection: string) => `Please add the account in ${connection} and sync the connection again`,
                expensifyCardBannerTitle: 'Get the Expensify Card',
                expensifyCardBannerSubtitle: 'Enjoy cash back on every US purchase, up to 50% off your Expensify bill, unlimited virtual cards, and so much more.',
                expensifyCardBannerLearnMoreButton: 'Learn more',
                statementCloseDateTitle: 'Statement close date',
                statementCloseDateDescription: 'Let us know when your card statement closes, and we’ll create a matching statement in Expensify.',
            },
            workflows: {
                title: 'Workflows',
                subtitle: 'Configure how spend is approved and paid.',
                disableApprovalPrompt:
                    'Expensify Cards from this workspace currently rely on approval to define their Smart Limits. Please amend the limit types of any Expensify Cards with Smart Limits before disabling approvals.',
            },
            invoices: {
                title: 'Invoices',
                subtitle: 'Send and receive invoices.',
            },
            categories: {
                title: 'Categories',
                subtitle: 'Track and organize spend.',
            },
            tags: {
                title: 'Tags',
                subtitle: 'Classify costs and track billable expenses.',
            },
            taxes: {
                title: 'Taxes',
                subtitle: 'Document and reclaim eligible taxes.',
            },
            reportFields: {
                title: 'Report fields',
                subtitle: 'Set up custom fields for spend.',
            },
            connections: {
                title: 'Accounting',
                subtitle: 'Sync your chart of accounts and more.',
            },
            receiptPartners: {
                title: 'Receipt partners',
                subtitle: 'Automatically import receipts.',
            },
            connectionsWarningModal: {
                featureEnabledTitle: 'Not so fast...',
                featureEnabledText: "To enable or disable this feature, you'll need to change your accounting import settings.",
                disconnectText: "To disable accounting, you'll need to disconnect your accounting connection from your workspace.",
                manageSettings: 'Manage settings',
            },
            receiptPartnersWarningModal: {
                featureEnabledTitle: 'Disconnect Uber',
                disconnectText: 'To disable this feature, please disconnect the Uber for Business integration first.',
                description: 'Are you sure you want to disconnect this integration?',
                confirmText: 'Got it',
            },
            workflowWarningModal: {
                featureEnabledTitle: 'Not so fast...',
                featureEnabledText:
                    'Expensify Cards in this workspace rely on approval workflows to define their Smart Limits.\n\nPlease change the limit types of any cards with Smart Limits before disabling workflows.',
                confirmText: 'Go to Expensify Cards',
            },
            rules: {
                title: 'Rules',
                subtitle: 'Require receipts, flag high spend, and more.',
            },
            timeTracking: {
                title: 'Time',
                subtitle: 'Set an hourly billable rate for employees to get paid for their time.',
            },
        },
        reports: {
            reportsCustomTitleExamples: 'Examples:',
            customReportNamesSubtitle: `<muted-text>Customize report titles using our <a href="${CONST.CUSTOM_REPORT_NAME_HELP_URL}">extensive formulas</a>.</muted-text>`,
            customNameTitle: 'Default report title',
            customNameDescription: `Choose a custom name for expense reports using our <a href="${CONST.CUSTOM_REPORT_NAME_HELP_URL}">extensive formulas</a>.`,
            customNameInputLabel: 'Name',
            customNameEmailPhoneExample: 'Member’s email or phone: {report:submit:from}',
            customNameStartDateExample: 'Report start date: {report:startdate}',
            customNameWorkspaceNameExample: 'Workspace name: {report:workspacename}',
            customNameReportIDExample: 'Report ID: {report:id}',
            customNameTotalExample: 'Total: {report:total}.',
            preventMembersFromChangingCustomNamesTitle: 'Prevent members from changing custom report titles',
        },
        reportFields: {
            addField: 'Add field',
            delete: 'Delete field',
            deleteFields: 'Delete fields',
            findReportField: 'Find report field',
            deleteConfirmation: 'Are you sure you want to delete this report field?',
            deleteFieldsConfirmation: 'Are you sure you want to delete these report fields?',
            emptyReportFields: {
                title: "You haven't created any report fields",
                subtitle: 'Add a custom field (text, date, or dropdown) that appears on reports.',
            },
            subtitle: "Report fields apply to all spend and can be helpful when you'd like to prompt for extra information.",
            disableReportFields: 'Disable report fields',
            disableReportFieldsConfirmation: 'Are you sure? Text and date fields will be deleted, and lists will be disabled.',
            importedFromAccountingSoftware: 'The report fields below are imported from your',
            textType: 'Text',
            dateType: 'Date',
            dropdownType: 'List',
            formulaType: 'Formula',
            textAlternateText: 'Add a field for free text input.',
            dateAlternateText: 'Add a calendar for date selection.',
            dropdownAlternateText: 'Add a list of options to choose from.',
            formulaAlternateText: 'Add a formula field.',
            nameInputSubtitle: 'Choose a name for the report field.',
            typeInputSubtitle: 'Choose what type of report field to use.',
            initialValueInputSubtitle: 'Enter a starting value to show in the report field.',
            listValuesInputSubtitle: 'These values will appear in your report field dropdown. Enabled values can be selected by members.',
            listInputSubtitle: 'These values will appear in your report field list. Enabled values can be selected by members.',
            deleteValue: 'Delete value',
            deleteValues: 'Delete values',
            disableValue: 'Disable value',
            disableValues: 'Disable values',
            enableValue: 'Enable value',
            enableValues: 'Enable values',
            emptyReportFieldsValues: {
                title: "You haven't created any list values",
                subtitle: 'Add custom values to appear on reports.',
            },
            deleteValuePrompt: 'Are you sure you want to delete this list value?',
            deleteValuesPrompt: 'Are you sure you want to delete these list values?',
            listValueRequiredError: 'Please enter a list value name',
            existingListValueError: 'A list value with this name already exists',
            editValue: 'Edit value',
            listValues: 'List values',
            addValue: 'Add value',
            existingReportFieldNameError: 'A report field with this name already exists',
            reportFieldNameRequiredError: 'Please enter a report field name',
            reportFieldTypeRequiredError: 'Please choose a report field type',
            circularReferenceError: "This field can't refer to itself. Please update.",
            reportFieldInitialValueRequiredError: 'Please choose a report field initial value',
            genericFailureMessage: 'An error occurred while updating the report field. Please try again.',
        },
        tags: {
            tagName: 'Tag name',
            requiresTag: 'Members must tag all expenses',
            trackBillable: 'Track billable expenses',
            customTagName: 'Custom tag name',
            enableTag: 'Enable tag',
            enableTags: 'Enable tags',
            requireTag: 'Require tag',
            requireTags: 'Require tags',
            notRequireTags: 'Don’t require',
            disableTag: 'Disable tag',
            disableTags: 'Disable tags',
            addTag: 'Add tag',
            editTag: 'Edit tag',
            editTags: 'Edit tags',
            findTag: 'Find tag',
            subtitle: 'Tags add more detailed ways to classify costs.',
            // TODO: Add a actual link to the help article https://github.com/Expensify/App/issues/63612
            dependentMultiLevelTagsSubtitle: (importSpreadsheetLink: string) =>
                `<muted-text>You are using <a href="${CONST.IMPORT_TAGS_EXPENSIFY_URL_DEPENDENT_TAGS}">dependent tags</a>. You can <a href="${importSpreadsheetLink}">reimport a spreadsheet</a> to update your tags.</muted-text>`,
            emptyTags: {
                title: "You haven't created any tags",
                //  We need to remove the subtitle and use the below one when we remove the canUseMultiLevelTags beta
                subtitle: 'Add a tag to track projects, locations, departments, and more.',
                subtitleHTML: `<muted-text><centered-text>Add tags to track projects, locations, departments, and more. <a href="${CONST.IMPORT_TAGS_EXPENSIFY_URL}">Learn more</a> about formatting tag files for import.</centered-text></muted-text>`,
                subtitleWithAccounting: (accountingPageURL: string) =>
                    `<muted-text><centered-text>Your tags are currently importing from an accounting connection. Head over to <a href="${accountingPageURL}">accounting</a> to make any changes.</centered-text></muted-text>`,
            },
            deleteTag: 'Delete tag',
            deleteTags: 'Delete tags',
            deleteTagConfirmation: 'Are you sure that you want to delete this tag?',
            deleteTagsConfirmation: 'Are you sure that you want to delete these tags?',
            deleteFailureMessage: 'An error occurred while deleting the tag, please try again',
            tagRequiredError: 'Tag name is required',
            existingTagError: 'A tag with this name already exists',
            invalidTagNameError: 'Tag name cannot be 0. Please choose a different value.',
            genericFailureMessage: 'An error occurred while updating the tag, please try again',
            importedFromAccountingSoftware: 'The tags below are imported from your',
            glCode: 'GL code',
            updateGLCodeFailureMessage: 'An error occurred while updating the GL code, please try again',
            tagRules: 'Tag rules',
            approverDescription: 'Approver',
            importTags: 'Import tags',
            importTagsSupportingText: 'Code your expenses with one type of tag or many.',
            configureMultiLevelTags: 'Configure your list of tags for multi-level tagging.',
            importMultiLevelTagsSupportingText: `Here's a preview of your tags. If everything looks good, click below to import them.`,
            importMultiLevelTags: {
                firstRowTitle: 'The first row is the title for each tag list',
                independentTags: 'These are independent tags',
                glAdjacentColumn: 'There is a GL code in the adjacent column',
            },
            tagLevel: {
                singleLevel: 'Single level of tags',
                multiLevel: 'Multi-level tags',
            },
            switchSingleToMultiLevelTagWarning: {
                title: 'Switch Tag Levels',
                prompt1: 'Switching tag levels will erase all current tags.',
                prompt2: ' We suggest you first',
                prompt3: ' download a backup',
                prompt4: ' by exporting your tags.',
                prompt5: ' Learn more',
                prompt6: ' about tag levels.',
            },
            overrideMultiTagWarning: {
                title: 'Import tags',
                prompt1: 'Are you sure?',
                prompt2: ' The existing tags will be overridden, but you can',
                prompt3: ' download a backup',
                prompt4: ' first.',
            },
            importedTagsMessage: (columnCounts: number) =>
                `We found *${columnCounts} columns* in your spreadsheet. Select *Name* next to the column that contains tags names. You can also select *Enabled* next to the column that sets tags status.`,
            cannotDeleteOrDisableAllTags: {
                title: 'Cannot delete or disable all tags',
                description: `At least one tag must remain enabled because your workspace requires tags.`,
            },
            cannotMakeAllTagsOptional: {
                title: 'Cannot make all tags optional',
                description: `At least one tag must remain required because your workspace settings require tags.`,
            },
            cannotMakeTagListRequired: {
                title: 'Cannot make tag list required',
                description: 'You can only make a tag list required if your policy has multiple tag levels configured.',
            },
            tagCount: () => ({
                one: '1 Tag',
                other: (count: number) => `${count} Tags`,
            }),
        },
        taxes: {
            subtitle: 'Add tax names, rates, and set defaults.',
            addRate: 'Add rate',
            workspaceDefault: 'Workspace currency default',
            foreignDefault: 'Foreign currency default',
            customTaxName: 'Custom tax name',
            value: 'Value',
            taxReclaimableOn: 'Tax reclaimable on',
            taxRate: 'Tax rate',
            findTaxRate: 'Find tax rate',
            error: {
                taxRateAlreadyExists: 'This tax name is already in use',
                taxCodeAlreadyExists: 'This tax code is already in use',
                valuePercentageRange: 'Please enter a valid percentage between 0 and 100',
                customNameRequired: 'Custom tax name is required',
                deleteFailureMessage: 'An error occurred while deleting the tax rate. Please try again or ask Concierge for help.',
                updateFailureMessage: 'An error occurred while updating the tax rate. Please try again or ask Concierge for help.',
                createFailureMessage: 'An error occurred while creating the tax rate. Please try again or ask Concierge for help.',
                updateTaxClaimableFailureMessage: 'The reclaimable portion must be less than the distance rate amount',
            },
            deleteTaxConfirmation: 'Are you sure you want to delete this tax?',
            deleteMultipleTaxConfirmation: ({taxAmount}: TaxAmountParams) => `Are you sure you want to delete ${taxAmount} taxes?`,
            actions: {
                delete: 'Delete rate',
                deleteMultiple: 'Delete rates',
                enable: 'Enable rate',
                disable: 'Disable rate',
                enableTaxRates: () => ({
                    one: 'Enable rate',
                    other: 'Enable rates',
                }),
                disableTaxRates: () => ({
                    one: 'Disable rate',
                    other: 'Disable rates',
                }),
            },
            importedFromAccountingSoftware: 'The taxes below are imported from your',
            taxCode: 'Tax code',
            updateTaxCodeFailureMessage: 'An error occurred while updating the tax code, please try again',
        },
        duplicateWorkspace: {
            title: 'Name your new workspace',
            selectFeatures: 'Select features to copy',
            whichFeatures: 'Which features do you want to copy over to your new workspace?',
            confirmDuplicate: '\n\nDo you want to continue?',
            categories: 'categories and your auto-categorization rules',
            reimbursementAccount: 'reimbursement account',
            welcomeNote: 'Please start using my new workspace',
            delayedSubmission: 'delayed submission',
            confirmTitle: ({newWorkspaceName, totalMembers}: {newWorkspaceName?: string; totalMembers?: number}) =>
                `You’re about to create and share ${newWorkspaceName ?? ''} with ${totalMembers ?? 0} members from the original workspace.`,
            error: 'An error occurred while duplicating your new workspace. Please try again.',
        },
        emptyWorkspace: {
            title: 'You have no workspaces',
            subtitle: 'Track receipts, reimburse expenses, manage travel, send invoices, and more.',
            createAWorkspaceCTA: 'Get Started',
            features: {
                trackAndCollect: 'Track and collect receipts',
                reimbursements: 'Reimburse employees',
                companyCards: 'Manage company cards',
            },
            notFound: 'No workspace found',
            description: 'Rooms are a great place to discuss and work with multiple people. To begin collaborating, create or join a workspace',
        },
        new: {
            newWorkspace: 'New workspace',
            getTheExpensifyCardAndMore: 'Get the Expensify Card and more',
            confirmWorkspace: 'Confirm Workspace',
            myGroupWorkspace: ({workspaceNumber}: {workspaceNumber?: number}) => `My Group Workspace${workspaceNumber ? ` ${workspaceNumber}` : ''}`,
            workspaceName: ({userName, workspaceNumber}: NewWorkspaceNameParams) => `${userName}'s Workspace${workspaceNumber ? ` ${workspaceNumber}` : ''}`,
        },
        people: {
            genericFailureMessage: 'An error occurred removing a member from the workspace, please try again',
            removeMembersPrompt: ({memberName}: {memberName: string}) => ({
                one: `Are you sure you want to remove ${memberName}?`,
                other: 'Are you sure you want to remove these members?',
            }),
            removeMembersWarningPrompt: ({memberName, ownerName}: RemoveMembersWarningPrompt) =>
                `${memberName} is an approver in this workspace. When you unshare this workspace with them, we’ll replace them in the approval workflow with the workspace owner, ${ownerName}`,
            removeMembersTitle: () => ({
                one: 'Remove member',
                other: 'Remove members',
            }),
            findMember: 'Find member',
            removeWorkspaceMemberButtonTitle: 'Remove from workspace',
            removeGroupMemberButtonTitle: 'Remove from group',
            removeRoomMemberButtonTitle: 'Remove from chat',
            removeMemberPrompt: ({memberName}: RemoveMemberPromptParams) => `Are you sure you want to remove ${memberName}?`,
            removeMemberTitle: 'Remove member',
            transferOwner: 'Transfer owner',
            makeMember: () => ({
                one: 'Make member',
                other: 'Make members',
            }),
            makeAdmin: () => ({
                one: 'Make admin',
                other: 'Make admins',
            }),
            makeAuditor: () => ({
                one: 'Make auditor',
                other: 'Make auditors',
            }),
            selectAll: 'Select all',
            error: {
                genericAdd: 'There was a problem adding this workspace member',
                cannotRemove: "You can't remove yourself or the workspace owner",
                genericRemove: 'There was a problem removing that workspace member',
            },
            addedWithPrimary: 'Some members were added with their primary logins.',
            invitedBySecondaryLogin: ({secondaryLogin}: SecondaryLoginParams) => `Added by secondary login ${secondaryLogin}.`,
            workspaceMembersCount: ({count}: WorkspaceMembersCountParams) => `Total workspace members: ${count}`,
            importMembers: 'Import members',
            removeMemberPromptApprover: ({approver, workspaceOwner}: {approver: string; workspaceOwner: string}) =>
                `If you remove ${approver} from this workspace, we'll replace them in the approval workflow with ${workspaceOwner}, the workspace owner.`,
            removeMemberPromptPendingApproval: ({memberName}: {memberName: string}) =>
                `${memberName} has outstanding expense reports to approve. Please ask them to approve, or take control of their reports before removing them from the workspace.`,
            removeMemberPromptReimburser: ({memberName}: {memberName: string}) =>
                `You can't remove ${memberName} from this workspace. Please set a new reimburser in Workflows > Make or track payments, then try again.`,
            removeMemberPromptExporter: ({memberName, workspaceOwner}: {memberName: string; workspaceOwner: string}) =>
                `If you remove ${memberName} from this workspace, we'll replace them as the preferred exporter with ${workspaceOwner}, the workspace owner.`,
            removeMemberPromptTechContact: ({memberName, workspaceOwner}: {memberName: string; workspaceOwner: string}) =>
                `If you remove ${memberName} from this workspace, we'll replace them as the technical contact with ${workspaceOwner}, the workspace owner.`,
            cannotRemoveUserDueToReport: ({memberName}: {memberName: string}) =>
                `${memberName} has an outstanding processing report to take action on. Please ask them to complete the required action before removing them from the workspace.`,
        },
        card: {
            getStartedIssuing: 'Get started by issuing your first virtual or physical card.',
            issueCard: 'Issue card',
            issueNewCard: {
                whoNeedsCard: 'Who needs a card?',
                inviteNewMember: 'Invite new member',
                findMember: 'Find member',
                chooseCardType: 'Choose a card type',
                physicalCard: 'Physical card',
                physicalCardDescription: 'Great for the frequent spender',
                virtualCard: 'Virtual card',
                virtualCardDescription: 'Instant and flexible',
                chooseLimitType: 'Choose a limit type',
                smartLimit: 'Smart Limit',
                smartLimitDescription: 'Spend up to a certain amount before requiring approval',
                monthly: 'Monthly',
                monthlyDescription: 'Spend up to a certain amount per month',
                fixedAmount: 'Fixed amount',
                fixedAmountDescription: 'Spend up to a certain amount once',
                setLimit: 'Set a limit',
                cardLimitError: 'Please enter an amount less than $21,474,836',
                giveItName: 'Give it a name',
                giveItNameInstruction: 'Make it unique enough to tell apart from other cards. Specific use cases are even better!',
                cardName: 'Card name',
                letsDoubleCheck: 'Let’s double check that everything looks right.',
                willBeReadyToUse: 'This card will be ready to use immediately.',
                willBeReadyToShip: 'This card will be ready to ship immediately.',
                cardholder: 'Cardholder',
                cardType: 'Card type',
                limit: 'Limit',
                limitType: 'Limit type',
                disabledApprovalForSmartLimitError: 'Please enable approvals in <strong>Workflows > Add approvals</strong> before setting up smart limits',
            },
            deactivateCardModal: {
                deactivate: 'Deactivate',
                deactivateCard: 'Deactivate card',
                deactivateConfirmation: 'Deactivating this card will decline all future transactions and can’t be undone.',
            },
        },
        accounting: {
            settings: 'settings',
            title: 'Connections',
            subtitle: 'Connect to your accounting system to code transactions with your chart of accounts, auto-match payments, and keep your finances in sync.',
            qbo: 'QuickBooks Online',
            qbd: 'QuickBooks Desktop',
            xero: 'Xero',
            netsuite: 'NetSuite',
            intacct: 'Sage Intacct',
            sap: 'SAP',
            oracle: 'Oracle',
            microsoftDynamics: 'Microsoft Dynamics',
            talkYourOnboardingSpecialist: 'Chat with your setup specialist.',
            talkYourAccountManager: 'Chat with your account manager.',
            talkToConcierge: 'Chat with Concierge.',
            needAnotherAccounting: 'Need another accounting software? ',
            connectionName: ({connectionName}: ConnectionNameParams) => {
                switch (connectionName) {
                    case CONST.POLICY.CONNECTIONS.NAME.QBO:
                        return 'QuickBooks Online';
                    case CONST.POLICY.CONNECTIONS.NAME.XERO:
                        return 'Xero';
                    case CONST.POLICY.CONNECTIONS.NAME.NETSUITE:
                        return 'NetSuite';
                    case CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT:
                        return 'Sage Intacct';
                    default: {
                        return '';
                    }
                }
            },
            errorODIntegration: (oldDotPolicyConnectionsURL: string) =>
                `There's an error with a connection that's been set up in Expensify Classic. [Go to Expensify Classic to fix this issue.](${oldDotPolicyConnectionsURL})`,
            goToODToSettings: 'Go to Expensify Classic to manage your settings.',
            setup: 'Connect',
            lastSync: ({relativeDate}: LastSyncAccountingParams) => `Last synced ${relativeDate}`,
            notSync: 'Not synced',
            import: 'Import',
            export: 'Export',
            advanced: 'Advanced',
            other: 'Other',
            syncNow: 'Sync now',
            disconnect: 'Disconnect',
            reinstall: 'Reinstall connector',
            disconnectTitle: ({connectionName}: OptionalParam<ConnectionNameParams> = {}) => {
                const integrationName =
                    connectionName && CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] : 'integration';
                return `Disconnect ${integrationName}`;
            },
            connectTitle: ({connectionName}: ConnectionNameParams) => `Connect ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ?? 'accounting integration'}`,

            syncError: ({connectionName}: ConnectionNameParams) => {
                switch (connectionName) {
                    case CONST.POLICY.CONNECTIONS.NAME.QBO:
                        return "Can't connect to QuickBooks Online";
                    case CONST.POLICY.CONNECTIONS.NAME.XERO:
                        return "Can't connect to Xero";
                    case CONST.POLICY.CONNECTIONS.NAME.NETSUITE:
                        return "Can't connect to NetSuite";
                    case CONST.POLICY.CONNECTIONS.NAME.QBD:
                        return "Can't connect to QuickBooks Desktop";
                    default: {
                        return "Can't connect to integration";
                    }
                }
            },
            accounts: 'Chart of accounts',
            taxes: 'Taxes',
            imported: 'Imported',
            notImported: 'Not imported',
            importAsCategory: 'Imported as categories',
            importTypes: {
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.IMPORTED]: 'Imported',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG]: 'Imported as tags',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.DEFAULT]: 'Imported',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NOT_IMPORTED]: 'Not imported',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE]: 'Not imported',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD]: 'Imported as report fields',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT]: 'NetSuite employee default',
            },
            disconnectPrompt: ({connectionName}: OptionalParam<ConnectionNameParams> = {}) => {
                const integrationName =
                    connectionName && CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] : 'this integration';
                return `Are you sure you want to disconnect ${integrationName}?`;
            },
            connectPrompt: ({connectionName}: ConnectionNameParams) =>
                `Are you sure you want to connect ${
                    CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ?? 'this accounting integration'
                }? This will remove any existing accounting connections.`,
            enterCredentials: 'Enter your credentials',
            claimOffer: {
                badgeText: 'Offer available!',
                xero: {
                    headline: 'Get Xero free for 6 months!',
                    description: '<muted-text><centered-text>New to Xero? Expensify customers get 6 months free. Claim your offer below.</centered-text></muted-text>',
                    connectButton: 'Connect to Xero',
                },
                uber: {
                    headerTitle: 'Uber for Business',
                    headline: 'Get 5% off Uber rides',
                    description: `<muted-text><centered-text>Activate Uber for Business through Expensify and save 5% on all business rides through June. <a href="${CONST.UBER_TERMS_LINK}">Terms apply.</a></centered-text></muted-text>`,
                    connectButton: 'Connect to Uber for Business',
                },
            },
            connections: {
                syncStageName: ({stage}: SyncStageNameConnectionsParams) => {
                    switch (stage) {
                        case 'quickbooksOnlineImportCustomers':
                        case 'quickbooksDesktopImportCustomers':
                            return 'Importing customers';
                        case 'quickbooksOnlineImportEmployees':
                        case 'netSuiteSyncImportEmployees':
                        case 'intacctImportEmployees':
                        case 'quickbooksDesktopImportEmployees':
                            return 'Importing employees';
                        case 'quickbooksOnlineImportAccounts':
                        case 'quickbooksDesktopImportAccounts':
                            return 'Importing accounts';
                        case 'quickbooksOnlineImportClasses':
                        case 'quickbooksDesktopImportClasses':
                            return 'Importing classes';
                        case 'quickbooksOnlineImportLocations':
                            return 'Importing locations';
                        case 'quickbooksOnlineImportProcessing':
                            return 'Processing imported data';
                        case 'quickbooksOnlineSyncBillPayments':
                        case 'intacctImportSyncBillPayments':
                            return 'Syncing reimbursed reports and bill payments';
                        case 'quickbooksOnlineSyncTaxCodes':
                            return 'Importing tax codes';
                        case 'quickbooksOnlineCheckConnection':
                            return 'Checking QuickBooks Online connection';
                        case 'quickbooksOnlineImportMain':
                            return 'Importing QuickBooks Online data';
                        case 'startingImportXero':
                            return 'Importing Xero data';
                        case 'startingImportQBO':
                            return 'Importing QuickBooks Online data';
                        case 'startingImportQBD':
                        case 'quickbooksDesktopImportMore':
                            return 'Importing QuickBooks Desktop data';
                        case 'quickbooksDesktopImportTitle':
                            return 'Importing title';
                        case 'quickbooksDesktopImportApproveCertificate':
                            return 'Importing approve certificate';
                        case 'quickbooksDesktopImportDimensions':
                            return 'Importing dimensions';
                        case 'quickbooksDesktopImportSavePolicy':
                            return 'Importing save policy';
                        case 'quickbooksDesktopWebConnectorReminder':
                            return 'Still syncing data with QuickBooks... Please make sure the Web Connector is running';
                        case 'quickbooksOnlineSyncTitle':
                            return 'Syncing QuickBooks Online data';
                        case 'quickbooksOnlineSyncLoadData':
                        case 'xeroSyncStep':
                        case 'intacctImportData':
                            return 'Loading data';
                        case 'quickbooksOnlineSyncApplyCategories':
                            return 'Updating categories';
                        case 'quickbooksOnlineSyncApplyCustomers':
                            return 'Updating customers/projects';
                        case 'quickbooksOnlineSyncApplyEmployees':
                            return 'Updating people list';
                        case 'quickbooksOnlineSyncApplyClassesLocations':
                            return 'Updating report fields';
                        case 'jobDone':
                            return 'Waiting for imported data to load';
                        case 'xeroSyncImportChartOfAccounts':
                            return 'Syncing chart of accounts';
                        case 'xeroSyncImportCategories':
                            return 'Syncing categories';
                        case 'xeroSyncImportCustomers':
                            return 'Syncing customers';
                        case 'xeroSyncXeroReimbursedReports':
                            return 'Marking Expensify reports as reimbursed';
                        case 'xeroSyncExpensifyReimbursedReports':
                            return 'Marking Xero bills and invoices as paid';
                        case 'xeroSyncImportTrackingCategories':
                            return 'Syncing tracking categories';
                        case 'xeroSyncImportBankAccounts':
                            return 'Syncing bank accounts';
                        case 'xeroSyncImportTaxRates':
                            return 'Syncing tax rates';
                        case 'xeroCheckConnection':
                            return 'Checking Xero connection';
                        case 'xeroSyncTitle':
                            return 'Syncing Xero data';
                        case 'netSuiteSyncConnection':
                            return 'Initializing connection to NetSuite';
                        case 'netSuiteSyncCustomers':
                            return 'Importing customers';
                        case 'netSuiteSyncInitData':
                            return 'Retrieving data from NetSuite';
                        case 'netSuiteSyncImportTaxes':
                            return 'Importing taxes';
                        case 'netSuiteSyncImportItems':
                            return 'Importing items';
                        case 'netSuiteSyncData':
                            return 'Importing data into Expensify';
                        case 'netSuiteSyncAccounts':
                            return 'Syncing accounts';
                        case 'netSuiteSyncCurrencies':
                            return 'Syncing currencies';
                        case 'netSuiteSyncCategories':
                            return 'Syncing categories';
                        case 'netSuiteSyncReportFields':
                            return 'Importing data as Expensify report fields';
                        case 'netSuiteSyncTags':
                            return 'Importing data as Expensify tags';
                        case 'netSuiteSyncUpdateConnectionData':
                            return 'Updating connection info';
                        case 'netSuiteSyncNetSuiteReimbursedReports':
                            return 'Marking Expensify reports as reimbursed';
                        case 'netSuiteSyncExpensifyReimbursedReports':
                            return 'Marking NetSuite bills and invoices as paid';
                        case 'netSuiteImportVendorsTitle':
                            return 'Importing vendors';
                        case 'netSuiteImportCustomListsTitle':
                            return 'Importing custom lists';
                        case 'netSuiteSyncImportCustomLists':
                            return 'Importing custom lists';
                        case 'netSuiteSyncImportSubsidiaries':
                            return 'Importing subsidiaries';
                        case 'netSuiteSyncImportVendors':
                        case 'quickbooksDesktopImportVendors':
                            return 'Importing vendors';
                        case 'intacctCheckConnection':
                            return 'Checking Sage Intacct connection';
                        case 'intacctImportDimensions':
                            return 'Importing Sage Intacct dimensions';
                        case 'intacctImportTitle':
                            return 'Importing Sage Intacct data';
                        default: {
                            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                            return `Translation missing for stage: ${stage}`;
                        }
                    }
                },
            },
            preferredExporter: 'Preferred exporter',
            exportPreferredExporterNote:
                'The preferred exporter can be any workspace admin, but must also be a Domain Admin if you set different export accounts for individual company cards in Domain Settings.',
            exportPreferredExporterSubNote: 'Once set, the preferred exporter will see reports for export in their account.',
            exportAs: 'Export as',
            exportOutOfPocket: 'Export out-of-pocket expenses as',
            exportCompanyCard: 'Export company card expenses as',
            exportDate: 'Export date',
            defaultVendor: 'Default vendor',
            autoSync: 'Auto-sync',
            autoSyncDescription: 'Sync NetSuite and Expensify automatically, every day. Export finalized report in realtime',
            reimbursedReports: 'Sync reimbursed reports',
            cardReconciliation: 'Card reconciliation',
            reconciliationAccount: 'Reconciliation account',
            continuousReconciliation: 'Continuous Reconciliation',
            saveHoursOnReconciliation:
                'Save hours on reconciliation each accounting period by having Expensify continuously reconcile Expensify Card statements and settlements on your behalf.',
            enableContinuousReconciliation: (accountingAdvancedSettingsLink: string, connectionName: string) =>
                `<muted-text-label>In order to enable Continuous Reconciliation, please enable <a href="${accountingAdvancedSettingsLink}">auto-sync</a> for ${connectionName}.</muted-text-label>`,
            chooseReconciliationAccount: {
                chooseBankAccount: 'Choose the bank account that your Expensify Card payments will be reconciled against.',
                settlementAccountReconciliation: ({settlementAccountUrl, lastFourPAN}: SettlementAccountReconciliationParams) =>
                    `Make sure this account matches your <a href="${settlementAccountUrl}">Expensify Card settlement account</a> (ending in ${lastFourPAN}) so Continuous Reconciliation works properly.`,
            },
        },
        export: {
            notReadyHeading: 'Not ready to export',
            notReadyDescription: 'Draft or pending expense reports cannot be exported to the accounting system. Please approve or pay these expenses before exporting them.',
        },
        invoices: {
            sendInvoice: 'Send invoice',
            sendFrom: 'Send from',
            invoicingDetails: 'Invoicing details',
            invoicingDetailsDescription: 'This info will appear on your invoices.',
            companyName: 'Company name',
            companyWebsite: 'Company website',
            paymentMethods: {
                personal: 'Personal',
                business: 'Business',
                chooseInvoiceMethod: 'Choose a payment method below:',
                payingAsIndividual: 'Paying as an individual',
                payingAsBusiness: 'Paying as a business',
            },
            invoiceBalance: 'Invoice balance',
            invoiceBalanceSubtitle: "This is your current balance from collecting invoice payments. It'll transfer to your bank account automatically if you've added one.",
            bankAccountsSubtitle: 'Add a bank account to make and receive invoice payments.',
        },
        invite: {
            member: 'Invite member',
            members: 'Invite members',
            invitePeople: 'Invite new members',
            genericFailureMessage: 'An error occurred while inviting the member to the workspace. Please try again.',
            pleaseEnterValidLogin: `Please ensure the email or phone number is valid (e.g. ${CONST.EXAMPLE_PHONE_NUMBER}).`,
            user: 'user',
            users: 'users',
            invited: 'invited',
            removed: 'removed',
            to: 'to',
            from: 'from',
        },
        inviteMessage: {
            confirmDetails: 'Confirm details',
            inviteMessagePrompt: 'Make your invitation extra special by adding a message below!',
            personalMessagePrompt: 'Message',
            genericFailureMessage: 'An error occurred while inviting the member to the workspace. Please try again.',
            inviteNoMembersError: 'Please select at least one member to invite',
            joinRequest: ({user, workspaceName}: {user: string; workspaceName: string}) => `${user} requested to join ${workspaceName}`,
        },
        distanceRates: {
            oopsNotSoFast: 'Oops! Not so fast...',
            workspaceNeeds: 'A workspace needs at least one enabled distance rate.',
            distance: 'Distance',
            centrallyManage: 'Centrally manage rates, track in miles or kilometers, and set a default category.',
            rate: 'Rate',
            addRate: 'Add rate',
            findRate: 'Find rate',
            trackTax: 'Track tax',
            deleteRates: () => ({
                one: 'Delete rate',
                other: 'Delete rates',
            }),
            enableRates: () => ({
                one: 'Enable rate',
                other: 'Enable rates',
            }),
            disableRates: () => ({
                one: 'Disable rate',
                other: 'Disable rates',
            }),
            enableRate: 'Enable rate',
            status: 'Status',
            unit: 'Unit',
            taxFeatureNotEnabledMessage:
                '<muted-text>Taxes must be enabled on the workspace to use this feature. Head over to <a href="#">More features</a> to make that change.</muted-text>',
            deleteDistanceRate: 'Delete distance rate',
            areYouSureDelete: () => ({
                one: 'Are you sure you want to delete this rate?',
                other: 'Are you sure you want to delete these rates?',
            }),
            errors: {
                rateNameRequired: 'Rate name is required',
                existingRateName: 'A distance rate with this name already exists',
            },
        },
        editor: {
            descriptionInputLabel: 'Description',
            nameInputLabel: 'Name',
            typeInputLabel: 'Type',
            initialValueInputLabel: 'Initial value',
            nameInputHelpText: "This is the name you'll see on your workspace.",
            nameIsRequiredError: "You'll need to give your workspace a name",
            currencyInputLabel: 'Default currency',
            currencyInputHelpText: 'All expenses on this workspace will be converted to this currency.',
            currencyInputDisabledText: (currency: string) => `The default currency can't be changed because this workspace is linked to a ${currency} bank account.`,
            save: 'Save',
            genericFailureMessage: 'An error occurred while updating the workspace. Please try again.',
            avatarUploadFailureMessage: 'An error occurred uploading the avatar. Please try again.',
            addressContext: 'A Workspace Address is required to enable Expensify Travel. Please enter an address associated with your business.',
            policy: 'Expense policy',
        },
        bankAccount: {
            continueWithSetup: 'Continue setup',
            youAreAlmostDone: "You're almost done setting up your bank account, which will let you issue corporate cards, reimburse expenses, collect invoices, and pay bills.",
            streamlinePayments: 'Streamline payments',
            connectBankAccountNote: "Note: Personal bank accounts can't be used for payments on workspaces.",
            oneMoreThing: 'One more thing!',
            allSet: "You're all set!",
            accountDescriptionWithCards: 'This bank account will be used to issue corporate cards, reimburse expenses, collect invoices, and pay bills.',
            letsFinishInChat: "Let's finish in chat!",
            finishInChat: 'Finish in chat',
            almostDone: 'Almost done!',
            disconnectBankAccount: 'Disconnect bank account',
            startOver: 'Start over',
            updateDetails: 'Update details',
            yesDisconnectMyBankAccount: 'Yes, disconnect my bank account',
            yesStartOver: 'Yes, start over',
            disconnectYourBankAccount: (bankName: string) => `Disconnect your <strong>${bankName}</strong> bank account. Any outstanding transactions for this account will still complete.`,
            clearProgress: "Starting over will clear the progress you've made so far.",
            areYouSure: 'Are you sure?',
            workspaceCurrency: 'Workspace currency',
            updateCurrencyPrompt: 'It looks like your workspace is currently set to a different currency than USD. Please click the button below to update your currency to USD now.',
            updateToUSD: 'Update to USD',
            updateWorkspaceCurrency: 'Update workspace currency',
            workspaceCurrencyNotSupported: 'Workspace currency not supported',
            yourWorkspace: `Your workspace is set to an unsupported currency. View the <a href="${CONST.CONNECT_A_BUSINESS_BANK_ACCOUNT_HELP_URL}">list of supported currencies</a>.`,
            chooseAnExisting: 'Choose an existing bank account to pay expenses or add a new one.',
        },
        changeOwner: {
            changeOwnerPageTitle: 'Transfer owner',
            addPaymentCardTitle: 'Enter your payment card to transfer ownership',
            addPaymentCardButtonText: 'Accept terms & add payment card',
            addPaymentCardReadAndAcceptText: `<muted-text-micro>Read and accept <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">terms</a> & <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">privacy</a> policy to add your card.</muted-text-micro>`,
            addPaymentCardPciCompliant: 'PCI-DSS compliant',
            addPaymentCardBankLevelEncrypt: 'Bank level encryption',
            addPaymentCardRedundant: 'Redundant infrastructure',
            addPaymentCardLearnMore: `<muted-text>Learn more about our <a href="${CONST.PERSONAL_DATA_PROTECTION_INFO_URL}">security</a>.</muted-text>`,
            amountOwedTitle: 'Outstanding balance',
            amountOwedButtonText: 'OK',
            amountOwedText: 'This account has an outstanding balance from a previous month.\n\nDo you want to clear the balance and take over billing of this workspace?',
            ownerOwesAmountTitle: 'Outstanding balance',
            ownerOwesAmountButtonText: 'Transfer balance',
            ownerOwesAmountText: ({email, amount}: OwnerOwesAmountParams) =>
                `The account owning this workspace (${email}) has an outstanding balance from a previous month.\n\nDo you want to transfer this amount (${amount}) in order to take over billing for this workspace? Your payment card will be charged immediately.`,
            subscriptionTitle: 'Take over annual subscription',
            subscriptionButtonText: 'Transfer subscription',
            subscriptionText: (usersCount: number, finalCount: number) =>
                `Taking over this workspace will merge its annual subscription with your current subscription. This will increase your subscription size by ${usersCount} members making your new subscription size ${finalCount}. Would you like to continue?`,
            duplicateSubscriptionTitle: 'Duplicate subscription alert',
            duplicateSubscriptionButtonText: 'Continue',
            duplicateSubscriptionText: (email: string, workspaceName: string) =>
                `It looks like you may be trying to take over billing for ${email}'s workspaces, but to do that, you need to be an admin on all their workspaces first.\n\nClick "Continue" if you only want to take over billing for the workspace ${workspaceName}.\n\nIf you want to take over billing for their entire subscription, please have them add you as an admin to all their workspaces first before taking over billing.`,
            hasFailedSettlementsTitle: 'Cannot transfer ownership',
            hasFailedSettlementsButtonText: 'Got it',
            hasFailedSettlementsText: (email: string) =>
                `You can't take over billing because ${email} has an overdue expensify Expensify Card settlement. Please ask them to reach out to concierge@expensify.com to resolve the issue. Then, you can take over billing for this workspace.`,
            failedToClearBalanceTitle: 'Failed to clear balance',
            failedToClearBalanceButtonText: 'OK',
            failedToClearBalanceText: 'We were unable to clear the balance. Please try again later.',
            successTitle: 'Woohoo! All set.',
            successDescription: "You're now the owner of this workspace.",
            errorTitle: 'Oops! Not so fast...',
            errorDescription: `<muted-text><centered-text>There was a problem transferring ownership of this workspace. Try again, or <concierge-link>reach out to Concierge</concierge-link> for help.</centered-text></muted-text>`,
        },
        exportAgainModal: {
            title: 'Careful!',
            description: ({reportName, connectionName}: ExportAgainModalDescriptionParams) =>
                `The following reports have already been exported to ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}:\n\n${reportName}\n\nAre you sure you want to export them again?`,
            confirmText: 'Yes, export again',
            cancelText: 'Cancel',
        },
        upgrade: {
            reportFields: {
                title: 'Report fields',
                description: `Report fields let you specify header-level details, distinct from tags that pertain to expenses on individual line items. These details can encompass specific project names, business trip information, locations, and more.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Report fields are only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per member per month.` : `per active member per month.`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.NETSUITE]: {
                title: 'NetSuite',
                description: `Enjoy automated syncing and reduce manual entries with the Expensify + NetSuite integration. Gain in-depth, realtime financial insights with native and custom segment support, including project and customer mapping.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Our NetSuite integration is only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per member per month.` : `per active member per month.`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT]: {
                title: 'Sage Intacct',
                description: `Enjoy automated syncing and reduce manual entries with the Expensify + Sage Intacct integration. Gain in-depth, real-time financial insights with user-defined dimensions, as well as expense coding by department, class, location, customer, and project (job).`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Our Sage Intacct integration is only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per member per month.` : `per active member per month.`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.QBD]: {
                title: 'QuickBooks Desktop',
                description: `Enjoy automated syncing and reduce manual entries with the Expensify + QuickBooks Desktop integration. Gain ultimate efficiency with a realtime, two-way connection and expense coding by class, item, customer, and project.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Our QuickBooks Desktop integration is only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per member per month.` : `per active member per month.`}</muted-text>`,
            },
            [CONST.UPGRADE_FEATURE_INTRO_MAPPING.approvals.id]: {
                title: 'Advanced Approvals',
                description: `If you want to add more layers of approval to the mix – or just make sure the largest expenses get another set of eyes – we’ve got you covered. Advanced approvals help you put the right checks in place at every level so you keep your team’s spend under control.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Advanced approvals are only available on the Control plan, which starts at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per member per month.` : `per active member per month.`}</muted-text>`,
            },
            categories: {
                title: 'Categories',
                description: 'Categories allow you to track and organize spend. Use our default categories or add your own.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Categories are available on the Collect plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per member per month.` : `per active member per month.`}</muted-text>`,
            },
            glCodes: {
                title: 'GL codes',
                description: `Add GL codes to your categories and tags for easy export of expenses to your accounting and payroll systems.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>GL codes are only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per member per month.` : `per active member per month.`}</muted-text>`,
            },
            glAndPayrollCodes: {
                title: 'GL & Payroll codes',
                description: `Add GL & Payroll codes to your categories for easy export of expenses to your accounting and payroll systems.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>GL & Payroll codes are only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per member per month.` : `per active member per month.`}</muted-text>`,
            },
            taxCodes: {
                title: 'Tax codes',
                description: `Add tax codes to your taxes for easy export of expenses to your accounting and payroll systems.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Tax codes are only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per member per month.` : `per active member per month.`}</muted-text>`,
            },
            companyCards: {
                title: 'Unlimited Company cards',
                description: `Need to add more card feeds? Unlock unlimited company cards to sync transactions from all major card issuers.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>This is only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per member per month.` : `per active member per month.`}</muted-text>`,
            },
            rules: {
                title: 'Rules',
                description: `Rules run in the background and keep your spend under control so you don't have to sweat the small stuff.\n\nRequire expense details like receipts and descriptions, set limits and defaults, and automate approvals and payments – all in one place.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Rules are only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per member per month.` : `per active member per month.`}</muted-text>`,
            },
            perDiem: {
                title: 'Per diem',
                description:
                    'Per diem is a great way to keep your daily costs compliant and predictable whenever your employees travel. Enjoy features like custom rates, default categories, and more granular details like destinations and subrates.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Per diem are only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per member per month.` : `per active member per month.`}</muted-text>`,
            },
            travel: {
                title: 'Travel',
                description: 'Expensify Travel is a new corporate travel booking and management platform that allows members to book accommodations, flights, transportation, and more.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Travel is available on the Collect plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per member per month.` : `per active member per month.`}</muted-text>`,
            },
            reports: {
                title: 'Reports',
                description: 'Reports allow you to group expenses for easier tracking and organization.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Reports are available on the Collect plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per member per month.` : `per active member per month.`}</muted-text>`,
            },
            multiLevelTags: {
                title: 'Multi-level tags',
                description:
                    'Multi-Level Tags help you track expenses with greater precision. Assign multiple tags to each line item—such as department, client, or cost center—to capture the full context of every expense. This enables more detailed reporting, approval workflows, and accounting exports.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Multi-level tags are only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per member per month.` : `per active member per month.`}</muted-text>`,
            },
            distanceRates: {
                title: 'Distance rates',
                description: 'Create and manage your own rates, track in miles or kilometers, and set default categories for distance expenses.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Distance rates are available on the Collect plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per member per month.` : `per active member per month.`}</muted-text>`,
            },
            auditor: {
                title: 'Auditor',
                description: 'Auditors get read-only access to all reports for full visibility and compliance monitoring.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Auditors are only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per member per month.` : `per active member per month.`}</muted-text>`,
            },
            [CONST.UPGRADE_FEATURE_INTRO_MAPPING.multiApprovalLevels.id]: {
                title: 'Multiple approval levels',
                description: 'Multiple approval levels is a workflow tool for companies that require more than one person to approve a report before it can be reimbursed.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Multiple approval levels are only available on the Control plan, starting at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per member per month.` : `per active member per month.`}</muted-text>`,
            },
            pricing: {
                perActiveMember: 'per active member per month.',
                perMember: 'per member per month.',
            },
            note: ({subscriptionLink}: WorkspaceUpgradeNoteParams) =>
                `<muted-text>Upgrade to access this feature, or <a href="${subscriptionLink}">learn more</a> about our plans and pricing.</muted-text>`,
            upgradeToUnlock: 'Unlock this feature',
            completed: {
                headline: `You've upgraded your workspace!`,
                successMessage: ({policyName, subscriptionLink}: UpgradeSuccessMessageParams) =>
                    `<centered-text>You've successfully upgraded ${policyName} to the Control plan! <a href="${subscriptionLink}">View your subscription</a> for more details.</centered-text>`,
                categorizeMessage: `You've successfully upgraded to the Collect plan. Now you can categorize your expenses!`,
                travelMessage: `You've successfully upgraded to the Collect plan. Now you can start booking and managing travel!`,
                distanceRateMessage: `You've successfully upgraded to the Collect plan. Now you can change the distance rate!`,
                gotIt: 'Got it, thanks',
                createdWorkspace: `You've created a workspace!`,
            },
            commonFeatures: {
                title: 'Upgrade to the Control plan',
                note: 'Unlock our most powerful features, including:',
                benefits: {
                    startsAtFull: ({learnMoreMethodsRoute, formattedPrice, hasTeam2025Pricing}: LearnMoreRouteParams) =>
                        `<muted-text>The Control plan starts at <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per member per month.` : `per active member per month.`} <a href="${learnMoreMethodsRoute}">Learn more</a> about our plans and pricing.</muted-text>`,
                    benefit1: 'Advanced accounting connections (NetSuite, Sage Intacct, and more)',
                    benefit2: 'Smart expense rules',
                    benefit3: 'Multi-level approval workflows',
                    benefit4: 'Enhanced security controls',
                    toUpgrade: 'To upgrade, click',
                    selectWorkspace: 'select a workspace, and change the plan type to',
                },
                upgradeWorkspaceWarning: `Can't upgrade workspace`,
                upgradeWorkspaceWarningForRestrictedPolicyCreationPrompt: 'Your company has restricted workspace creation. Please reach out to an admin for help.',
            },
        },
        downgrade: {
            commonFeatures: {
                title: 'Downgrade to the Collect plan',
                note: 'If you downgrade, you’ll lose access to these features and more:',
                benefits: {
                    note: 'For a full comparison of our plans, check out our',
                    pricingPage: 'pricing page',
                    confirm: 'Are you sure you want to downgrade and remove your configurations?',
                    warning: 'This cannot be undone.',
                    benefit1: 'Accounting connections (except QuickBooks Online and Xero)',
                    benefit2: 'Smart expense rules',
                    benefit3: 'Multi-level approval workflows',
                    benefit4: 'Enhanced security controls',
                    headsUp: 'Heads up!',
                    multiWorkspaceNote: 'You’ll need to downgrade all your workspaces before your first monthly payment to begin a subscription at the Collect rate. Click',
                    selectStep: '> select each workspace > change the plan type to',
                },
            },
            completed: {
                headline: 'Your workspace has been downgraded',
                description: 'You have other workspaces on the Control plan. To be billed at the Collect rate, you must downgrade all workspaces.',
                gotIt: 'Got it, thanks',
            },
        },
        payAndDowngrade: {
            title: 'Pay & downgrade',
            headline: 'Your final payment',
            description1: ({formattedAmount}: PayAndDowngradeDescriptionParams) => `Your final bill for this subscription will be <strong>${formattedAmount}</strong>`,
            description2: (date: string) => `See your breakdown below for ${date}:`,
            subscription:
                'Heads up! This action will end your Expensify subscription, delete this workspace, and remove all workspace members. If you want to keep this workspace and only remove yourself, have another admin take over billing first.',
            genericFailureMessage: 'An error occurred while paying your bill. Please try again.',
        },
        restrictedAction: {
            restricted: 'Restricted',
            actionsAreCurrentlyRestricted: (workspaceName: string) => `Actions on the ${workspaceName} workspace are currently restricted`,
            workspaceOwnerWillNeedToAddOrUpdatePaymentCard: ({workspaceOwnerName}: WorkspaceOwnerWillNeedToAddOrUpdatePaymentCardParams) =>
                `Workspace owner, ${workspaceOwnerName} will need to add or update the payment card on file to unlock new workspace activity.`,
            youWillNeedToAddOrUpdatePaymentCard: "You'll need to add or update the payment card on file to unlock new workspace activity.",
            addPaymentCardToUnlock: 'Add a payment card to unlock!',
            addPaymentCardToContinueUsingWorkspace: 'Add a payment card to continue using this workspace',
            pleaseReachOutToYourWorkspaceAdmin: 'Please reach out to your workspace admin for any questions.',
            chatWithYourAdmin: 'Chat with your admin',
            chatInAdmins: 'Chat in #admins',
            addPaymentCard: 'Add payment card',
            goToSubscription: 'Go to Subscription',
        },
        rules: {
            individualExpenseRules: {
                title: 'Expenses',
                subtitle: (categoriesPageLink: string, tagsPageLink: string) =>
                    `<muted-text>Set spend controls and defaults for individual expenses. You can also create rules for <a href="${categoriesPageLink}">categories</a> and <a href="${tagsPageLink}">tags</a>.</muted-text>`,
                receiptRequiredAmount: 'Receipt required amount',
                receiptRequiredAmountDescription: 'Require receipts when spend exceeds this amount, unless overridden by a category rule.',
                receiptRequiredAmountError: ({amount}: {amount: string}) => `Amount can't be greater than the itemized receipt required amount (${amount})`,
                itemizedReceiptRequiredAmount: 'Itemized receipt required amount',
                itemizedReceiptRequiredAmountDescription: 'Require itemized receipts when spend exceeds this amount, unless overridden by a category rule.',
                itemizedReceiptRequiredAmountError: ({amount}: {amount: string}) => `Amount can't be lower than the amount required for regular receipts (${amount})`,
                maxExpenseAmount: 'Max expense amount',
                maxExpenseAmountDescription: 'Flag spend that exceeds this amount, unless overridden by a category rule.',
                maxAge: 'Max age',
                maxExpenseAge: 'Max expense age',
                maxExpenseAgeDescription: 'Flag spend older than a specific number of days.',
                maxExpenseAgeDays: () => ({
                    one: '1 day',
                    other: (count: number) => `${count} days`,
                }),
                cashExpenseDefault: 'Cash expense default',
                cashExpenseDefaultDescription:
                    'Choose how cash expenses should be created. An expense is considered a cash expense if it is not an imported company card transaction. This includes manually created expenses, receipts, per diem, distance, and time expenses.',
                reimbursableDefault: 'Reimbursable',
                reimbursableDefaultDescription: 'Expenses are most often paid back to employees',
                nonReimbursableDefault: 'Non-reimbursable',
                nonReimbursableDefaultDescription: 'Expenses are occasionally paid back to employees',
                alwaysReimbursable: 'Always reimbursable',
                alwaysReimbursableDescription: 'Expenses are always paid back to employees',
                alwaysNonReimbursable: 'Always non-reimbursable',
                alwaysNonReimbursableDescription: 'Expenses are never paid back to employees',
                billableDefault: 'Billable default',
                billableDefaultDescription: (tagsPageLink: string) =>
                    `<muted-text>Choose whether cash and credit card expenses should be billable by default. Billable expenses are enabled or disabled in <a href="${tagsPageLink}">tags</a>.</muted-text>`,
                billable: 'Billable',
                billableDescription: 'Expenses are most often re-billed to clients',
                nonBillable: 'Non-billable',
                nonBillableDescription: 'Expenses are occasionally re-billed to clients',
                eReceipts: 'eReceipts',
                eReceiptsHint: `eReceipts are auto-created [for most USD credit transactions](${CONST.DEEP_DIVE_ERECEIPTS}).`,
                attendeeTracking: 'Attendee tracking',
                attendeeTrackingHint: 'Track the per-person cost for every expense.',
                prohibitedDefaultDescription:
                    'Flag any receipts where alcohol, gambling, or other restricted items appear. Expenses with receipts where these line items appear will require manual review.',
                prohibitedExpenses: 'Prohibited expenses',
                alcohol: 'Alcohol',
                hotelIncidentals: 'Hotel incidentals',
                gambling: 'Gambling',
                tobacco: 'Tobacco',
                adultEntertainment: 'Adult entertainment',
                requireCompanyCard: 'Require company cards for all purchases',
                requireCompanyCardDescription: 'Flag all cash spend, including mileage and per-diem expenses.',
            },
            expenseReportRules: {
                title: 'Advanced',
                subtitle: 'Automate expense report compliance, approvals, and payment.',
                preventSelfApprovalsTitle: 'Prevent self-approvals',
                preventSelfApprovalsSubtitle: 'Prevent workspace members from approving their own expense reports.',
                autoApproveCompliantReportsTitle: 'Auto-approve compliant reports',
                autoApproveCompliantReportsSubtitle: 'Configure which expense reports are eligible for auto-approval.',
                autoApproveReportsUnderTitle: 'Auto-approve reports under',
                autoApproveReportsUnderDescription: 'Fully compliant expense reports under this amount will be automatically approved.',
                randomReportAuditTitle: 'Random report audit',
                randomReportAuditDescription: 'Require that some reports be manually approved, even if eligible for auto-approval.',
                autoPayApprovedReportsTitle: 'Auto-pay approved reports',
                autoPayApprovedReportsSubtitle: 'Configure which expense reports are eligible for auto-pay.',
                autoPayApprovedReportsLimitError: (currency?: string) => `Please enter an amount less than ${currency ?? ''}20,000`,
                autoPayApprovedReportsLockedSubtitle: 'Go to more features and enable workflows, then add payments to unlock this feature.',
                autoPayReportsUnderTitle: 'Auto-pay reports under',
                autoPayReportsUnderDescription: 'Fully compliant expense reports under this amount will be automatically paid.',
                unlockFeatureEnableWorkflowsSubtitle: (featureName: string) => `Add ${featureName} to unlock this feature.`,
                enableFeatureSubtitle: (featureName: string, moreFeaturesLink?: string) => `Go to [more features](${moreFeaturesLink}) and enable ${featureName} to unlock this feature.`,
            },
            merchantRules: {
                title: 'Merchant',
                subtitle: 'Set the merchant rules so expenses arrive correctly coded and require less cleanup.',
                addRule: 'Add merchant rule',
                ruleSummaryTitle: (merchantName: string) => `If merchant contains "${merchantName}"`,
                ruleSummarySubtitleMerchant: (merchantName: string) => `Rename merchant to "${merchantName}"`,
                ruleSummarySubtitleUpdateField: (fieldName: string, fieldValue: string) => `Update ${fieldName} to "${fieldValue}"`,
                ruleSummarySubtitleReimbursable: (reimbursable: boolean) => `Mark as  "${reimbursable ? 'reimbursable' : 'non-reimbursable'}"`,
                ruleSummarySubtitleBillable: (billable: boolean) => `Mark as "${billable ? 'billable' : 'non-billable'}"`,
            },
            categoryRules: {
                title: 'Category rules',
                approver: 'Approver',
                requireDescription: 'Require description',
                requireFields: 'Require fields',
                requiredFieldsTitle: 'Required fields',
                requiredFieldsDescription: (categoryName: string) => `This will apply to all expenses categorized as <strong>${categoryName}</strong>.`,
                requireAttendees: 'Require attendees',
                descriptionHint: 'Description hint',
                descriptionHintDescription: (categoryName: string) =>
                    `Remind employees to provide additional information for “${categoryName}” spend. This hint appears in the description field on expenses.`,
                descriptionHintLabel: 'Hint',
                descriptionHintSubtitle: 'Pro-tip: The shorter the better!',
                maxAmount: 'Max amount',
                flagAmountsOver: 'Flag amounts over',
                flagAmountsOverDescription: (categoryName: string) => `Applies to the category “${categoryName}”.`,
                flagAmountsOverSubtitle: 'This overrides the max amount for all expenses.',
                expenseLimitTypes: {
                    expense: 'Individual expense',
                    expenseSubtitle: 'Flag expense amounts by category. This rule overrides the general workspace rule for max expense amount.',
                    daily: 'Category total',
                    dailySubtitle: 'Flag total daily category spend per expense report.',
                },
                requireReceiptsOver: 'Require receipts over',
                requireReceiptsOverList: {
                    default: (defaultAmount: string) => `${defaultAmount} ${CONST.DOT_SEPARATOR} Default`,
                    never: 'Never require receipts',
                    always: 'Always require receipts',
                },
                requireItemizedReceiptsOver: 'Require itemized receipts over',
                requireItemizedReceiptsOverList: {
                    default: (defaultAmount: string) => `${defaultAmount} ${CONST.DOT_SEPARATOR} Default`,
                    never: 'Never require itemized receipts',
                    always: 'Always require itemized receipts',
                },
                defaultTaxRate: 'Default tax rate',
                enableWorkflows: ({moreFeaturesLink}: RulesEnableWorkflowsParams) =>
                    `Go to [More features](${moreFeaturesLink}) and enable workflows, then add approvals to unlock this feature.`,
            },
            customRules: {
                title: 'Expense policy',
                cardSubtitle: "Here's where your team's expense policy lives, so everyone's on the same page about what's covered.",
            },
        },
        planTypePage: {
            planTypes: {
                team: {
                    label: 'Collect',
                    description: 'For teams looking to automate their processes.',
                },
                corporate: {
                    label: 'Control',
                    description: 'For organizations with advanced requirements.',
                },
            },
            description: "Choose a plan that's right for you. For a detailed list of features and pricing, check out our",
            subscriptionLink: 'plan types and pricing help page',
            lockedPlanDescription: ({count, annualSubscriptionEndDate}: WorkspaceLockedPlanTypeParams) => ({
                one: `You've committed to 1 active member on the Control plan until your annual subscription ends on ${annualSubscriptionEndDate}. You can switch to pay-per-use subscription and downgrade to the Collect plan starting ${annualSubscriptionEndDate} by disabling auto-renew in`,
                other: `You've committed to ${count} active members on the Control plan until your annual subscription ends on ${annualSubscriptionEndDate}. You can switch to pay-per-use subscription and downgrade to the Collect plan starting ${annualSubscriptionEndDate} by disabling auto-renew in`,
            }),
            subscriptions: 'Subscriptions',
        },
    },
    getAssistancePage: {
        title: 'Get assistance',
        subtitle: "We're here to clear your path to greatness!",
        description: 'Choose from the support options below:',
        chatWithConcierge: 'Chat with Concierge',
        scheduleSetupCall: 'Schedule a setup call',
        scheduleACall: 'Schedule call',
        questionMarkButtonTooltip: 'Get assistance from our team',
        exploreHelpDocs: 'Explore help docs',
        registerForWebinar: 'Register for webinar',
        onboardingHelp: 'Onboarding help',
    },
    emojiPicker: {
        skinTonePickerLabel: 'Change default skin tone',
        headers: {
            frequentlyUsed: 'Frequently Used',
            smileysAndEmotion: 'Smileys & Emotion',
            peopleAndBody: 'People & Body',
            animalsAndNature: 'Animals & Nature',
            foodAndDrink: 'Food & Drinks',
            travelAndPlaces: 'Travel & Places',
            activities: 'Activities',
            objects: 'Objects',
            symbols: 'Symbols',
            flags: 'Flags',
        },
    },
    newRoomPage: {
        newRoom: 'New room',
        groupName: 'Group name',
        roomName: 'Room name',
        visibility: 'Visibility',
        restrictedDescription: 'People in your workspace can find this room',
        privateDescription: 'People invited to this room can find it',
        publicDescription: 'Anyone can find this room',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        public_announceDescription: 'Anyone can find this room',
        createRoom: 'Create room',
        roomAlreadyExistsError: 'A room with this name already exists',
        roomNameReservedError: ({reservedName}: RoomNameReservedErrorParams) => `${reservedName} is a default room on all workspaces. Please choose another name.`,
        roomNameInvalidError: 'Room names can only include lowercase letters, numbers, and hyphens',
        pleaseEnterRoomName: 'Please enter a room name',
        pleaseSelectWorkspace: 'Please select a workspace',
        renamedRoomAction: ({oldName, newName, actorName, isExpenseReport}: RenamedRoomActionParams) => {
            const actor = actorName ? `${actorName} ` : '';
            return isExpenseReport ? `${actor}renamed to "${newName}" (previously "${oldName}")` : `${actor}renamed this room to "${newName}" (previously "${oldName}")`;
        },
        roomRenamedTo: ({newName}: RoomRenamedToParams) => `Room renamed to ${newName}`,
        social: 'social',
        selectAWorkspace: 'Select a workspace',
        growlMessageOnRenameError: 'Unable to rename workspace room. Please check your connection and try again.',
        visibilityOptions: {
            restricted: 'Workspace', // the translation for "restricted" visibility is actually workspace. This is so we can display restricted visibility rooms as "workspace" without having to change what's stored.
            private: 'Private',
            public: 'Public',
            // eslint-disable-next-line @typescript-eslint/naming-convention
            public_announce: 'Public Announce',
        },
    },
    workspaceApprovalModes: {
        submitAndClose: 'Submit and Close',
        submitAndApprove: 'Submit and Approve',
        advanced: 'ADVANCED',
        dynamicExternal: 'DYNAMIC_EXTERNAL',
        smartReport: 'SMARTREPORT',
        billcom: 'BILLCOM',
    },
    workspaceActions: {
        setDefaultBankAccount: ({bankAccountName, maskedBankAccountNumber}: {bankAccountName: string; maskedBankAccountNumber: string}) =>
            `set the default business bank account to "${bankAccountName ? `${bankAccountName}: ` : ''}${maskedBankAccountNumber}"`,
        removedDefaultBankAccount: ({bankAccountName, maskedBankAccountNumber}: {bankAccountName: string; maskedBankAccountNumber: string}) =>
            `removed the default business bank account "${bankAccountName ? `${bankAccountName}: ` : ''}${maskedBankAccountNumber}"`,
        changedDefaultBankAccount: ({
            bankAccountName,
            maskedBankAccountNumber,
            oldBankAccountName,
            oldMaskedBankAccountNumber,
        }: {
            bankAccountName: string;
            maskedBankAccountNumber: string;
            oldBankAccountName: string;
            oldMaskedBankAccountNumber: string;
        }) =>
            `changed the default business bank account to "${bankAccountName ? `${bankAccountName}: ` : ''}${maskedBankAccountNumber}" (previously "${oldBankAccountName ? `${oldBankAccountName}: ` : ''}${oldMaskedBankAccountNumber}")`,
        changedCompanyAddress: ({newAddress, previousAddress}: {newAddress: string; previousAddress?: string}) =>
            previousAddress ? `changed the company address to "${newAddress}" (previously "${previousAddress}")` : `set the company address to "${newAddress}"`,
        addApprovalRule: (approverEmail: string, approverName: string, field: string, name: string) => `added ${approverName} (${approverEmail}) as an approver for the ${field} "${name}"`,
        deleteApprovalRule: (approverEmail: string, approverName: string, field: string, name: string) =>
            `removed ${approverName} (${approverEmail}) as an approver for the ${field} "${name}"`,
        updateApprovalRule: ({field, name, newApproverEmail, newApproverName, oldApproverEmail, oldApproverName}: UpdatedPolicyApprovalRuleParams) => {
            const formatApprover = (displayName?: string, email?: string) => (displayName ? `${displayName} (${email})` : email);

            return `changed the approver for the ${field} "${name}" to ${formatApprover(newApproverName, newApproverEmail)} (previously ${formatApprover(
                oldApproverName,
                oldApproverEmail,
            )})`;
        },
        addCategory: ({categoryName}: UpdatedPolicyCategoryParams) => `added the category "${categoryName}"`,
        deleteCategory: ({categoryName}: UpdatedPolicyCategoryParams) => `removed the category "${categoryName}"`,
        updateCategory: ({oldValue, categoryName}: UpdatedPolicyCategoryParams) => `${oldValue ? 'disabled' : 'enabled'} the category "${categoryName}"`,
        updateCategoryPayrollCode: ({oldValue, categoryName, newValue}: UpdatedPolicyCategoryGLCodeParams) => {
            if (!oldValue) {
                return `added the payroll code "${newValue}" to the category "${categoryName}"`;
            }
            if (!newValue && oldValue) {
                return `removed the payroll code "${oldValue}" from the category "${categoryName}"`;
            }
            return `changed the "${categoryName}" category payroll code to “${newValue}” (previously “${oldValue}”)`;
        },
        updateCategoryGLCode: ({oldValue, categoryName, newValue}: UpdatedPolicyCategoryGLCodeParams) => {
            if (!oldValue) {
                return `added the GL code "${newValue}” to the category "${categoryName}"`;
            }
            if (!newValue && oldValue) {
                return `removed the GL code "${oldValue}" from the category "${categoryName}"`;
            }
            return `changed the “${categoryName}” category GL code to “${newValue}” (previously “${oldValue}“)`;
        },
        updateAreCommentsRequired: ({oldValue, categoryName}: UpdatedPolicyCategoryParams) => {
            return `changed the "${categoryName}" category description to ${!oldValue ? 'required' : 'not required'} (previously ${!oldValue ? 'not required' : 'required'})`;
        },
        updateCategoryMaxExpenseAmount: ({categoryName, oldAmount, newAmount}: UpdatedPolicyCategoryMaxExpenseAmountParams) => {
            if (newAmount && !oldAmount) {
                return `added a ${newAmount} max amount to the category "${categoryName}"`;
            }
            if (oldAmount && !newAmount) {
                return `removed the ${oldAmount} max amount from the category "${categoryName}"`;
            }
            return `changed the "${categoryName}" category max amount to ${newAmount} (previously ${oldAmount})`;
        },
        updateCategoryExpenseLimitType: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryExpenseLimitTypeParams) => {
            if (!oldValue) {
                return `added a limit type of ${newValue} to the category "${categoryName}"`;
            }
            return `changed the "${categoryName}" category limit type to ${newValue} (previously ${oldValue})`;
        },
        updateCategoryMaxAmountNoReceipt: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryMaxAmountNoReceiptParams) => {
            if (!oldValue) {
                return `updated the category "${categoryName}" by changing Receipts to ${newValue}`;
            }
            return `changed the "${categoryName}" category to ${newValue} (previously ${oldValue})`;
        },
        updateCategoryMaxAmountNoItemizedReceipt: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryMaxAmountNoReceiptParams) => {
            if (!oldValue) {
                return `updated the category "${categoryName}" by changing Itemized receipts to ${newValue}`;
            }
            return `changed the "${categoryName}" category Itemized receipts to ${newValue} (previously ${oldValue})`;
        },
        setCategoryName: ({oldName, newName}: UpdatedPolicyCategoryNameParams) => `renamed the category "${oldName}" to "${newName}"`,
        updatedDescriptionHint: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryDescriptionHintTypeParams) => {
            if (!newValue) {
                return `removed the description hint "${oldValue}" from the category "${categoryName}"`;
            }

            return !oldValue
                ? `added the description hint "${newValue}" to the category "${categoryName}"`
                : `changed the "${categoryName}" category description hint to “${newValue}” (previously “${oldValue}”)`;
        },
        updateTagListName: ({oldName, newName}: UpdatedPolicyCategoryNameParams) => `changed the tag list name to "${newName}" (previously "${oldName}")`,
        addTag: ({tagListName, tagName}: UpdatedPolicyTagParams) => `added the tag "${tagName}" to the list "${tagListName}"`,
        updateTagName: ({tagListName, newName, oldName}: UpdatedPolicyTagNameParams) => `updated the tag list "${tagListName}" by changing the tag "${oldName}" to "${newName}`,
        updateTagEnabled: ({tagListName, tagName, enabled}: UpdatedPolicyTagParams) => `${enabled ? 'enabled' : 'disabled'} the tag "${tagName}" on the list "${tagListName}"`,
        deleteTag: ({tagListName, tagName}: UpdatedPolicyTagParams) => `removed the tag "${tagName}" from the list "${tagListName}"`,
        deleteMultipleTags: ({count, tagListName}: UpdatedPolicyTagParams) => `removed "${count}" tags from the list "${tagListName}"`,
        updateTag: ({tagListName, newValue, tagName, updatedField, oldValue}: UpdatedPolicyTagFieldParams) => {
            if (oldValue) {
                return `updated the tag "${tagName}" on the list "${tagListName}" by changing the ${updatedField} to "${newValue}" (previously "${oldValue}")`;
            }
            return `updated the tag "${tagName}" on the list "${tagListName}" by adding a ${updatedField} of "${newValue}"`;
        },
        updateCustomUnit: ({customUnitName, newValue, oldValue, updatedField}: UpdatePolicyCustomUnitParams) =>
            `changed the ${customUnitName} ${updatedField} to "${newValue}" (previously "${oldValue}")`,
        updateCustomUnitTaxEnabled: ({newValue}: UpdatePolicyCustomUnitTaxEnabledParams) => `${newValue ? 'enabled' : 'disabled'} tax tracking on distance rates`,
        addCustomUnitRate: (customUnitName: string, rateName: string) => `added a new "${customUnitName}" rate "${rateName}"`,
        updatedCustomUnitRate: ({customUnitName, customUnitRateName, newValue, oldValue, updatedField}: UpdatedPolicyCustomUnitRateParams) =>
            `changed the rate of the ${customUnitName} ${updatedField} "${customUnitRateName}" to "${newValue}" (previously "${oldValue}")`,
        updatedCustomUnitTaxRateExternalID: ({customUnitRateName, newValue, newTaxPercentage, oldTaxPercentage, oldValue}: UpdatedPolicyCustomUnitTaxRateExternalIDParams) => {
            if (oldTaxPercentage && oldValue) {
                return `changed the tax rate on the distance rate "${customUnitRateName}" to "${newValue} (${newTaxPercentage})" (previously "${oldValue} (${oldTaxPercentage})")`;
            }
            return `added the tax rate "${newValue} (${newTaxPercentage})" to the distance rate "${customUnitRateName}"`;
        },
        updatedCustomUnitTaxClaimablePercentage: ({customUnitRateName, newValue, oldValue}: UpdatedPolicyCustomUnitTaxClaimablePercentageParams) => {
            if (oldValue) {
                return `changed the tax reclaimable portion on the distance rate "${customUnitRateName}" to "${newValue}" (previously "${oldValue}")`;
            }
            return `added a tax reclaimable portion of "${newValue}" to the distance rate "${customUnitRateName}`;
        },
        updatedCustomUnitRateEnabled: ({customUnitName, customUnitRateName, newValue}: UpdatedPolicyCustomUnitRateEnabledParams) => {
            return `${newValue ? 'enabled' : 'disabled'} the ${customUnitName} rate "${customUnitRateName}"`;
        },
        deleteCustomUnitRate: (customUnitName: string, rateName: string) => `removed the "${customUnitName}" rate "${rateName}"`,
        addedReportField: (fieldType: string, fieldName?: string) => `added ${fieldType} Report Field "${fieldName}"`,
        updateReportFieldDefaultValue: ({defaultValue, fieldName}: UpdatedPolicyReportFieldDefaultValueParams) => `set the default value of report field "${fieldName}" to "${defaultValue}"`,
        addedReportFieldOption: ({fieldName, optionName}: PolicyAddedReportFieldOptionParams) => `added the option "${optionName}" to the report field "${fieldName}"`,
        removedReportFieldOption: ({fieldName, optionName}: PolicyAddedReportFieldOptionParams) => `removed the option "${optionName}" from the report field "${fieldName}"`,
        updateReportFieldOptionDisabled: ({fieldName, optionName, optionEnabled}: PolicyDisabledReportFieldOptionParams) =>
            `${optionEnabled ? 'enabled' : 'disabled'} the option "${optionName}" for the report field "${fieldName}"`,
        updateReportFieldAllOptionsDisabled: ({fieldName, optionName, allEnabled, toggledOptionsCount}: PolicyDisabledReportFieldAllOptionsParams) => {
            if (toggledOptionsCount && toggledOptionsCount > 1) {
                return `${allEnabled ? 'enabled' : 'disabled'} all options for the report field "${fieldName}" `;
            }
            return `${allEnabled ? 'enabled' : 'disabled'} the option "${optionName}" for the report field "${fieldName}", making all options ${allEnabled ? 'enabled' : 'disabled'}`;
        },
        deleteReportField: (fieldType: string, fieldName?: string) => `removed ${fieldType} Report Field "${fieldName}"`,
        preventSelfApproval: ({oldValue, newValue}: UpdatedPolicyPreventSelfApprovalParams) =>
            `updated "Prevent self-approval" to "${newValue === 'true' ? 'Enabled' : 'Disabled'}" (previously "${oldValue === 'true' ? 'Enabled' : 'Disabled'}")`,
        updateMonthlyOffset: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => {
            if (!oldValue) {
                return `set the monthly report submission date to "${newValue}"`;
            }
            return `updated the monthly report submission date to "${newValue}" (previously "${oldValue}")`;
        },
        updateDefaultBillable: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `updated "Re-bill expenses to clients" to "${newValue}" (previously "${oldValue}")`,
        updateDefaultReimbursable: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `updated "Cash expense default" to "${newValue}" (previously "${oldValue}")`,
        updateDefaultTitleEnforced: ({value}: UpdatedPolicyFieldWithValueParam) => `turned "Enforce default report titles" ${value ? 'on' : 'off'}`,
        changedCustomReportNameFormula: ({newValue, oldValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `changed the custom report name formula to "${newValue}" (previously "${oldValue}")`,
        renamedWorkspaceNameAction: ({oldName, newName}: RenamedWorkspaceNameActionParams) => `updated the name of this workspace to "${newName}" (previously "${oldName}")`,
        updateWorkspaceDescription: ({newDescription, oldDescription}: UpdatedPolicyDescriptionParams) =>
            !oldDescription
                ? `set the description of this workspace to "${newDescription}"`
                : `updated the description of this workspace to "${newDescription}" (previously "${oldDescription}")`,
        removedFromApprovalWorkflow: ({submittersNames}: RemovedFromApprovalWorkflowParams) => {
            let joinedNames = '';
            if (submittersNames.length === 1) {
                joinedNames = submittersNames.at(0) ?? '';
            } else if (submittersNames.length === 2) {
                joinedNames = submittersNames.join(' and ');
            } else if (submittersNames.length > 2) {
                joinedNames = `${submittersNames.slice(0, submittersNames.length - 1).join(', ')} and ${submittersNames.at(-1)}`;
            }
            return {
                one: `removed you from ${joinedNames}'s approval workflow and expense chat. Previously submitted reports will remain available for approval in your Inbox.`,
                other: `removed you from ${joinedNames}'s approval workflows and expense chats. Previously submitted reports will remain available for approval in your Inbox.`,
            };
        },
        demotedFromWorkspace: (policyName: string, oldRole: string) =>
            `updated your role in ${policyName} from ${oldRole} to user. You have been removed from all submitter expense chats except for you own.`,
        updatedWorkspaceCurrencyAction: ({oldCurrency, newCurrency}: UpdatedPolicyCurrencyParams) => `updated the default currency to ${newCurrency} (previously ${oldCurrency})`,
        updatedWorkspaceFrequencyAction: ({oldFrequency, newFrequency}: UpdatedPolicyFrequencyParams) =>
            `updated the auto-reporting frequency to "${newFrequency}" (previously "${oldFrequency}")`,
        updateApprovalMode: ({newValue, oldValue}: ChangeFieldParams) => `updated the approval mode to "${newValue}" (previously "${oldValue}")`,
        upgradedWorkspace: 'upgraded this workspace to the Control plan',
        forcedCorporateUpgrade: `This workspace has been upgraded to the Control plan. Click <a href="${CONST.COLLECT_UPGRADE_HELP_URL}">here</a> for more information.`,
        downgradedWorkspace: 'downgraded this workspace to the Collect plan',
        updatedAuditRate: ({oldAuditRate, newAuditRate}: UpdatedPolicyAuditRateParams) =>
            `changed the rate of reports randomly routed for manual approval to ${Math.round(newAuditRate * 100)}% (previously ${Math.round(oldAuditRate * 100)}%)`,
        updatedManualApprovalThreshold: ({oldLimit, newLimit}: UpdatedPolicyManualApprovalThresholdParams) =>
            `changed the manual approval limit for all expenses to ${newLimit} (previously ${oldLimit})`,
        updatedFeatureEnabled: ({enabled, featureName}: {enabled: boolean; featureName: string}) => {
            switch (featureName) {
                case 'categories':
                    return `${enabled ? 'enabled' : 'disabled'} categories`;
                case 'tags':
                    return `${enabled ? 'enabled' : 'disabled'} tags`;
                case 'workflows':
                    return `${enabled ? 'enabled' : 'disabled'} workflows`;
                case 'distance rates':
                    return `${enabled ? 'enabled' : 'disabled'} distance rates`;
                case 'accounting':
                    return `${enabled ? 'enabled' : 'disabled'} accounting`;
                case 'Expensify Cards':
                    return `${enabled ? 'enabled' : 'disabled'} Expensify Cards`;
                case 'company cards':
                    return `${enabled ? 'enabled' : 'disabled'} company cards`;
                case 'invoicing':
                    return `${enabled ? 'enabled' : 'disabled'} invoicing`;
                case 'per diem':
                    return `${enabled ? 'enabled' : 'disabled'} per diem`;
                case 'receipt partners':
                    return `${enabled ? 'enabled' : 'disabled'} receipt partners`;
                case 'rules':
                    return `${enabled ? 'enabled' : 'disabled'} rules`;
                case 'tax tracking':
                    return `${enabled ? 'enabled' : 'disabled'} tax tracking`;
                default:
                    return `${enabled ? 'enabled' : 'disabled'} ${featureName}`;
            }
        },
        updatedAttendeeTracking: ({enabled}: {enabled: boolean}) => `${enabled ? 'enabled' : 'disabled'} attendee tracking`,
        changedDefaultApprover: ({newApprover, previousApprover}: {newApprover: string; previousApprover?: string}) =>
            previousApprover ? `changed the default approver to ${newApprover} (previously ${previousApprover})` : `changed the default approver to ${newApprover}`,
        changedSubmitsToApprover: ({
            members,
            approver,
            previousApprover,
            wasDefaultApprover,
        }: {
            members: string;
            approver: string;
            previousApprover?: string;
            wasDefaultApprover?: boolean;
        }) => {
            let text = `changed the approval workflow for ${members} to submit reports to ${approver}`;
            if (wasDefaultApprover && previousApprover) {
                text += ` (previously default approver ${previousApprover})`;
            } else if (wasDefaultApprover) {
                text += ' (previously default approver)';
            } else if (previousApprover) {
                text += ` (previously ${previousApprover})`;
            }
            return text;
        },
        changedSubmitsToDefault: ({
            members,
            approver,
            previousApprover,
            wasDefaultApprover,
        }: {
            members: string;
            approver?: string;
            previousApprover?: string;
            wasDefaultApprover?: boolean;
        }) => {
            let text = approver
                ? `changed the approval workflow for ${members} to submit reports to the default approver ${approver}`
                : `changed the approval workflow for ${members} to submit reports to the default approver`;
            if (wasDefaultApprover && previousApprover) {
                text += ` (previously default approver ${previousApprover})`;
            } else if (wasDefaultApprover) {
                text += ' (previously default approver)';
            } else if (previousApprover) {
                text += ` (previously ${previousApprover})`;
            }
            return text;
        },
        changedForwardsTo: ({approver, forwardsTo, previousForwardsTo}: {approver: string; forwardsTo: string; previousForwardsTo?: string}) =>
            previousForwardsTo
                ? `changed the approval workflow for ${approver} to forward approved reports to ${forwardsTo} (previously forwarded to ${previousForwardsTo})`
                : `changed the approval workflow for ${approver} to forward approved reports to ${forwardsTo} (previously final approved reports)`,
        removedForwardsTo: ({approver, previousForwardsTo}: {approver: string; previousForwardsTo?: string}) =>
            previousForwardsTo
                ? `changed the approval workflow for ${approver} to stop forwarding approved reports (previously forwarded to ${previousForwardsTo})`
                : `changed the approval workflow for ${approver} to stop forwarding approved reports`,
        changedInvoiceCompanyName: ({newValue, oldValue}: {newValue: string; oldValue?: string}) =>
            oldValue ? `changed the invoice company name to "${newValue}" (previously "${oldValue}")` : `set the invoice company name to "${newValue}"`,
        changedInvoiceCompanyWebsite: ({newValue, oldValue}: {newValue: string; oldValue?: string}) =>
            oldValue ? `changed the invoice company website to "${newValue}" (previously "${oldValue}")` : `set the invoice company website to "${newValue}"`,
        changedReimburser: ({newReimburser, previousReimburser}: UpdatedPolicyReimburserParams) =>
            previousReimburser ? `changed the authorized payer to "${newReimburser}" (previously "${previousReimburser}")` : `changed the authorized payer to "${newReimburser}"`,
        updateReimbursementEnabled: ({enabled}: UpdatedPolicyReimbursementEnabledParams) => `${enabled ? 'enabled' : 'disabled'} reimbursements`,
        addTax: ({taxName}: UpdatedPolicyTaxParams) => `added the tax "${taxName}"`,
        deleteTax: ({taxName}: UpdatedPolicyTaxParams) => `removed the tax "${taxName}"`,
        updateTax: ({oldValue, taxName, updatedField, newValue}: UpdatedPolicyTaxParams) => {
            if (!updatedField) {
                return '';
            }
            switch (updatedField) {
                case 'name': {
                    return `renamed the tax "${oldValue}" to "${newValue}"`;
                }
                case 'code': {
                    return `changed the tax code for "${taxName}" from "${oldValue}" to "${newValue}"`;
                }
                case 'rate': {
                    return `changed the tax rate for "${taxName}" from "${oldValue}" to "${newValue}"`;
                }
                case 'enabled': {
                    return `${oldValue ? 'disabled' : 'enabled'} the tax "${taxName}"`;
                }
                default: {
                    return '';
                }
            }
        },
        setReceiptRequiredAmount: ({newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `set receipt required amount to "${newValue}"`,
        changedReceiptRequiredAmount: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `changed receipt required amount to "${newValue}" (previously "${oldValue}")`,
        removedReceiptRequiredAmount: ({oldValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `removed receipt required amount (previously "${oldValue}")`,
        setMaxExpenseAmount: ({newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `set max expense amount to "${newValue}"`,
        changedMaxExpenseAmount: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `changed max expense amount to "${newValue}" (previously "${oldValue}")`,
        removedMaxExpenseAmount: ({oldValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `removed max expense amount (previously "${oldValue}")`,
        setMaxExpenseAge: ({newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `set max expense age to "${newValue}" days`,
        changedMaxExpenseAge: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `changed max expense age to "${newValue}" days (previously "${oldValue}")`,
        removedMaxExpenseAge: ({oldValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `removed max expense age (previously "${oldValue}" days)`,
    },
    roomMembersPage: {
        memberNotFound: 'Member not found.',
        useInviteButton: 'To invite a new member to the chat, please use the invite button above.',
        notAuthorized: `You don't have access to this page. If you're trying to join this room, just ask a room member to add you. Something else? Reach out to ${CONST.EMAIL.CONCIERGE}`,
        roomArchived: `It looks like this room was archived. For questions, reach out to ${CONST.EMAIL.CONCIERGE}.`,
        removeMembersPrompt: ({memberName}: {memberName: string}) => ({
            one: `Are you sure you want to remove ${memberName} from the room?`,
            other: 'Are you sure you want to remove the selected members from the room?',
        }),
        error: {
            genericAdd: 'There was a problem adding this room member',
        },
    },
    newTaskPage: {
        assignTask: 'Assign task',
        assignMe: 'Assign to me',
        confirmTask: 'Confirm task',
        confirmError: 'Please enter a title and select a share destination',
        descriptionOptional: 'Description (optional)',
        pleaseEnterTaskName: 'Please enter a title',
        pleaseEnterTaskDestination: 'Please select where you want to share this task',
    },
    task: {
        task: 'Task',
        title: 'Title',
        description: 'Description',
        assignee: 'Assignee',
        completed: 'Completed',
        action: 'Complete',
        messages: {
            created: ({title}: TaskCreatedActionParams) => `task for ${title}`,
            completed: 'marked as complete',
            canceled: 'deleted task',
            reopened: 'marked as incomplete',
            error: "You don't have permission to take the requested action",
        },
        markAsComplete: 'Mark as complete',
        markAsIncomplete: 'Mark as incomplete',
        assigneeError: 'An error occurred while assigning this task. Please try another assignee.',
        genericCreateTaskFailureMessage: 'There was an error creating this task. Please try again later.',
        deleteTask: 'Delete task',
        deleteConfirmation: 'Are you sure you want to delete this task?',
    },
    statementPage: {
        title: ({year, monthName}: StatementTitleParams) => `${monthName} ${year} statement`,
    },
    keyboardShortcutsPage: {
        title: 'Keyboard shortcuts',
        subtitle: 'Save time with these handy keyboard shortcuts:',
        shortcuts: {
            openShortcutDialog: 'Opens the keyboard shortcuts dialog',
            markAllMessagesAsRead: 'Mark all messages as read',
            escape: 'Escape dialogs',
            search: 'Open search dialog',
            newChat: 'New chat screen',
            copy: 'Copy comment',
            openDebug: 'Open testing preferences dialog',
        },
    },
    guides: {
        screenShare: 'Screen share',
        screenShareRequest: 'Expensify is inviting you to a screen share',
    },
    search: {
        resultsAreLimited: 'Search results are limited.',
        viewResults: 'View results',
        resetFilters: 'Reset filters',
        searchResults: {
            emptyResults: {
                title: 'Nothing to show',
                subtitle: `Try adjusting your search criteria or creating something with the + button.`,
            },
            emptyExpenseResults: {
                title: "You haven't created any expenses yet",
                subtitle: 'Create an expense or take a test drive of Expensify to learn more.',
                subtitleWithOnlyCreateButton: 'Use the green button below to create an expense.',
            },
            emptyReportResults: {
                title: "You haven't created any reports yet",
                subtitle: 'Create a report or take a test drive of Expensify to learn more.',
                subtitleWithOnlyCreateButton: 'Use the green button below to create a report.',
            },
            emptyInvoiceResults: {
                title: dedent(`
                    You haven't created any
                    invoices yet
                `),
                subtitle: 'Send an invoice or take a test drive of Expensify to learn more.',
                subtitleWithOnlyCreateButton: 'Use the green button below to send an invoice.',
            },
            emptyTripResults: {
                title: 'No trips to display',
                subtitle: 'Get started by booking your first trip below.',
                buttonText: 'Book a trip',
            },
            emptySubmitResults: {
                title: 'No expenses to submit',
                subtitle: "You're all clear. Take a victory lap!",
                buttonText: 'Create report',
            },
            emptyApproveResults: {
                title: 'No expenses to approve',
                subtitle: 'Zero expenses. Maximum chill. Well done!',
            },
            emptyPayResults: {
                title: 'No expenses to pay',
                subtitle: 'Congrats! You crossed the finish line.',
            },
            emptyExportResults: {
                title: 'No expenses to export',
                subtitle: 'Time to take it easy, nice work.',
            },
            emptyStatementsResults: {
                title: 'No expenses to display',
                subtitle: 'No results. Please try adjusting your filters.',
            },
            emptyUnapprovedResults: {
                title: 'No expenses to approve',
                subtitle: 'Zero expenses. Maximum chill. Well done!',
            },
        },
        columns: 'Columns',
        resetColumns: 'Reset columns',
        groupColumns: 'Group columns',
        expenseColumns: 'Expense Columns',
        statements: 'Statements',
        unapprovedCash: 'Unapproved cash',
        unapprovedCard: 'Unapproved card',
        reconciliation: 'Reconciliation',
        topSpenders: 'Top spenders',
        saveSearch: 'Save search',
        deleteSavedSearch: 'Delete saved search',
        deleteSavedSearchConfirm: 'Are you sure you want to delete this search?',
        searchName: 'Search name',
        savedSearchesMenuItemTitle: 'Saved',
        topCategories: 'Top categories',
        groupedExpenses: 'grouped expenses',
        bulkActions: {
            approve: 'Approve',
            pay: 'Pay',
            delete: 'Delete',
            hold: 'Hold',
            unhold: 'Remove hold',
            reject: 'Reject',
            noOptionsAvailable: 'No options available for the selected group of expenses.',
        },
        filtersHeader: 'Filters',
        filters: {
            date: {
                before: (date?: string) => `Before ${date ?? ''}`,
                after: (date?: string) => `After ${date ?? ''}`,
                on: (date?: string) => `On ${date ?? ''}`,
                presets: {
                    [CONST.SEARCH.DATE_PRESETS.NEVER]: 'Never',
                    [CONST.SEARCH.DATE_PRESETS.LAST_MONTH]: 'Last month',
                    [CONST.SEARCH.DATE_PRESETS.THIS_MONTH]: 'This month',
                    [CONST.SEARCH.DATE_PRESETS.LAST_STATEMENT]: 'Last statement',
                },
            },
            status: 'Status',
            keyword: 'Keyword',
            keywords: 'Keywords',
            limit: 'Limit',
            currency: 'Currency',
            completed: 'Completed',
            amount: {
                lessThan: ({amount}: OptionalParam<RequestAmountParams> = {}) => `Less than ${amount ?? ''}`,
                greaterThan: ({amount}: OptionalParam<RequestAmountParams> = {}) => `Greater than ${amount ?? ''}`,
                between: (greaterThan: string, lessThan: string) => `Between ${greaterThan} and ${lessThan}`,
                equalTo: ({amount}: OptionalParam<RequestAmountParams> = {}) => `Equal to ${amount ?? ''}`,
            },
            card: {
                expensify: 'Expensify',
                individualCards: 'Individual cards',
                closedCards: 'Closed cards',
                cardFeeds: 'Card feeds',
                cardFeedName: ({cardFeedBankName, cardFeedLabel}: {cardFeedBankName: string; cardFeedLabel?: string}) =>
                    `All ${cardFeedBankName}${cardFeedLabel ? ` - ${cardFeedLabel}` : ''}`,
                cardFeedNameCSV: ({cardFeedLabel}: {cardFeedLabel?: string}) => `All CSV Imported Cards${cardFeedLabel ? ` - ${cardFeedLabel}` : ''}`,
            },
            reportField: ({name, value}: OptionalParam<ReportFieldParams>) => `${name} is ${value}`,
            current: 'Current',
            past: 'Past',
            submitted: 'Submitted',
            approved: 'Approved',
            paid: 'Paid',
            exported: 'Exported',
            posted: 'Posted',
            withdrawn: 'Withdrawn',
            billable: 'Billable',
            reimbursable: 'Reimbursable',
            purchaseCurrency: 'Purchase currency',
            groupBy: {
                [CONST.SEARCH.GROUP_BY.FROM]: 'From',
                [CONST.SEARCH.GROUP_BY.CARD]: 'Card',
                [CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID]: 'Withdrawal ID',
                [CONST.SEARCH.GROUP_BY.CATEGORY]: 'Category',
            },
            feed: 'Feed',
            withdrawalType: {
                [CONST.SEARCH.WITHDRAWAL_TYPE.EXPENSIFY_CARD]: 'Expensify Card',
                [CONST.SEARCH.WITHDRAWAL_TYPE.REIMBURSEMENT]: 'Reimbursement',
            },
            is: 'Is',
            action: {
                [CONST.SEARCH.ACTION_FILTERS.SUBMIT]: 'Submit',
                [CONST.SEARCH.ACTION_FILTERS.APPROVE]: 'Approve',
                [CONST.SEARCH.ACTION_FILTERS.PAY]: 'Pay',
                [CONST.SEARCH.ACTION_FILTERS.EXPORT]: 'Export',
            },
        },
        has: 'Has',
        groupBy: 'Group by',
        moneyRequestReport: {
            emptyStateTitle: 'This report has no expenses.',
            accessPlaceHolder: 'Open for details',
        },
        noCategory: 'No category',
        noTag: 'No tag',
        expenseType: 'Expense type',
        withdrawalType: 'Withdrawal type',
        recentSearches: 'Recent searches',
        recentChats: 'Recent chats',
        searchIn: 'Search in',
        searchPlaceholder: 'Search for something',
        suggestions: 'Suggestions',
        exportSearchResults: {
            title: 'Create export',
            description: "Whoa, that's a lot of items! We'll bundle them up, and Concierge will send you a file shortly.",
        },
        exportedTo: 'Exported to',
        exportAll: {
            selectAllMatchingItems: 'Select all matching items',
            allMatchingItemsSelected: 'All matching items selected',
        },
    },
    genericErrorPage: {
        title: 'Uh-oh, something went wrong!',
        body: {
            helpTextMobile: 'Please close and reopen the app, or switch to',
            helpTextWeb: 'web.',
            helpTextConcierge: 'If the problem persists, reach out to',
        },
        refresh: 'Refresh',
    },
    fileDownload: {
        success: {
            title: 'Downloaded!',
            message: 'Attachment successfully downloaded!',
            qrMessage: 'Check your photos or downloads folder for a copy of your QR code. Protip: Add it to a presentation for your audience to scan and connect with you directly.',
        },
        generalError: {
            title: 'Attachment error',
            message: "Attachment can't be downloaded",
        },
        permissionError: {
            title: 'Storage access',
            message: "Expensify can't save attachments without storage access. Tap settings to update permissions.",
        },
    },
    settlement: {
        status: {
            pending: 'Pending',
            cleared: 'Cleared',
            failed: 'Failed',
        },
        failedError: ({link}: {link: string}) => `We'll retry this settlement when you <a href="${link}">unlock your account</a>.`,
        withdrawalInfo: ({date, withdrawalID}: {date: string; withdrawalID: number}) => `${date} • Withdrawal ID: ${withdrawalID}`,
    },
    reportLayout: {
        reportLayout: 'Report layout',
        groupByLabel: 'Group by:',
        selectGroupByOption: 'Select how to group report expenses',
        uncategorized: 'Uncategorized',
        noTag: 'No tag',
        selectGroup: ({groupName}: {groupName: string}) => `Select all expenses in ${groupName}`,
        groupBy: {
            category: 'Category',
            tag: 'Tag',
        },
    },
    report: {
        newReport: {
            createExpense: 'Create expense',
            createReport: 'Create report',
            chooseWorkspace: 'Choose a workspace for this report.',
            emptyReportConfirmationTitle: 'You already have an empty report',
            emptyReportConfirmationPrompt: ({workspaceName}: {workspaceName: string}) =>
                `Are you sure you want to create another report in ${workspaceName}? You can access your empty reports in`,
            emptyReportConfirmationPromptLink: 'Reports',
            emptyReportConfirmationDontShowAgain: "Don't show me this again",
            genericWorkspaceName: 'this workspace',
        },
        genericCreateReportFailureMessage: 'Unexpected error creating this chat. Please try again later.',
        genericAddCommentFailureMessage: 'Unexpected error posting the comment. Please try again later.',
        genericUpdateReportFieldFailureMessage: 'Unexpected error updating the field. Please try again later.',
        genericUpdateReportNameEditFailureMessage: 'Unexpected error renaming the report. Please try again later.',
        noActivityYet: 'No activity yet',
        connectionSettings: 'Connection Settings',
        actions: {
            type: {
                changeField: ({oldValue, newValue, fieldName}: ChangeFieldParams) => `changed ${fieldName} to "${newValue}" (previously "${oldValue}")`,
                changeFieldEmpty: ({newValue, fieldName}: ChangeFieldParams) => `set ${fieldName} to "${newValue}"`,
                changeReportPolicy: (toPolicyName: string, fromPolicyName?: string) => {
                    if (!toPolicyName) {
                        return `changed the workspace${fromPolicyName ? ` (previously ${fromPolicyName})` : ''}`;
                    }
                    return `changed the workspace to ${toPolicyName}${fromPolicyName ? ` (previously ${fromPolicyName})` : ''}`;
                },
                changeType: (oldType: string, newType: string) => `changed type from ${oldType} to ${newType}`,
                exportedToCSV: `exported to CSV`,
                exportedToIntegration: {
                    automatic: (label: string) => {
                        const labelTranslations: Record<string, string> = {
                            [CONST.REPORT.EXPORT_OPTION_LABELS.EXPENSE_LEVEL_EXPORT]: translations.export.expenseLevelExport,
                            [CONST.REPORT.EXPORT_OPTION_LABELS.REPORT_LEVEL_EXPORT]: translations.export.reportLevelExport,
                        };
                        const translatedLabel = labelTranslations[label] || label;
                        return `exported to ${translatedLabel}`;
                    },
                    automaticActionOne: (label: string) => `exported to ${label} via`,
                    automaticActionTwo: 'accounting settings',
                    manual: (label: string) => `marked this report as manually exported to ${label}.`,
                    automaticActionThree: 'and successfully created a record for',
                    reimburseableLink: 'out-of-pocket expenses',
                    nonReimbursableLink: 'company card expenses',
                    pending: (label: string) => `started exporting this report to ${label}...`,
                },
                integrationsMessage: ({errorMessage, label, linkText, linkURL}: IntegrationSyncFailedParams) =>
                    `failed to export this report to ${label} ("${errorMessage}${linkText ? ` <a href="${linkURL}">${linkText}</a>` : ''}")`,
                managerAttachReceipt: `added a receipt`,
                managerDetachReceipt: `removed a receipt`,
                markedReimbursed: ({amount, currency}: MarkedReimbursedParams) => `paid ${currency}${amount} elsewhere`,
                markedReimbursedFromIntegration: ({amount, currency}: MarkReimbursedFromIntegrationParams) => `paid ${currency}${amount} via integration`,
                outdatedBankAccount: `couldn’t process the payment due to a problem with the payer’s bank account`,
                reimbursementACHBounce: `couldn't process the payment due to a bank account issue`,
                reimbursementACHCancelled: `canceled the payment`,
                reimbursementAccountChanged: `couldn’t process the payment, as the payer changed bank accounts`,
                reimbursementDelayed: `processed the payment but it’s delayed by 1-2 more business days`,
                selectedForRandomAudit: `randomly selected for review`,
                selectedForRandomAuditMarkdown: `[randomly selected](https://help.expensify.com/articles/expensify-classic/reports/Set-a-random-report-audit-schedule) for review`,
                share: ({to}: ShareParams) => `invited member ${to}`,
                unshare: ({to}: UnshareParams) => `removed member ${to}`,
                stripePaid: ({amount, currency}: StripePaidParams) => `paid ${currency}${amount}`,
                takeControl: `took control`,
                integrationSyncFailed: ({label, errorMessage, workspaceAccountingLink}: IntegrationSyncFailedParams) =>
                    `there was a problem syncing with ${label}${errorMessage ? ` ("${errorMessage}")` : ''}. Please fix the issue in <a href="${workspaceAccountingLink}">workspace settings</a>.`,
                companyCardConnectionBroken: ({feedName, workspaceCompanyCardRoute}: {feedName: string; workspaceCompanyCardRoute: string}) =>
                    `The ${feedName} connection is broken. To restore card imports, <a href='${workspaceCompanyCardRoute}'>log into your bank</a>`,
                addEmployee: (email: string, role: string) => `added ${email} as ${role === 'member' ? 'a' : 'an'} ${role}`,
                updateRole: ({email, currentRole, newRole}: UpdateRoleParams) => `updated the role of ${email} to ${newRole} (previously ${currentRole})`,
                updatedCustomField1: ({email, previousValue, newValue}: UpdatedCustomFieldParams) => {
                    if (!newValue) {
                        return `removed ${email}'s custom field 1 (previously "${previousValue}")`;
                    }

                    return !previousValue ? `added "${newValue}" to ${email}’s custom field 1` : `changed ${email}’s custom field 1 to "${newValue}" (previously "${previousValue}")`;
                },
                updatedCustomField2: ({email, previousValue, newValue}: UpdatedCustomFieldParams) => {
                    if (!newValue) {
                        return `removed ${email}'s custom field 2 (previously "${previousValue}")`;
                    }

                    return !previousValue ? `added "${newValue}" to ${email}’s custom field 2` : `changed ${email}’s custom field 2 to "${newValue}" (previously "${previousValue}")`;
                },
                leftWorkspace: ({nameOrEmail}: LeftWorkspaceParams) => `${nameOrEmail} left the workspace`,
                removeMember: (email: string, role: string) => `removed ${role} ${email}`,
                removedConnection: ({connectionName}: ConnectionNameParams) => `removed connection to ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
                addedConnection: ({connectionName}: ConnectionNameParams) => `connected to ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
                leftTheChat: 'left the chat',
            },
            error: {
                invalidCredentials: 'Invalid credentials, please check the configuration of your connection.',
            },
        },
    },
    chronos: {
        oooEventSummaryFullDay: ({summary, dayCount, date}: OOOEventSummaryFullDayParams) => `${summary} for ${dayCount} ${dayCount === 1 ? 'day' : 'days'} until ${date}`,
        oooEventSummaryPartialDay: ({summary, timePeriod, date}: OOOEventSummaryPartialDayParams) => `${summary} from ${timePeriod} on ${date}`,
    },
    footer: {
        features: 'Features',
        expenseManagement: 'Expense Management',
        spendManagement: 'Spend Management',
        expenseReports: 'Expense Reports',
        companyCreditCard: 'Company Credit Card',
        receiptScanningApp: 'Receipt Scanning App',
        billPay: 'Bill Pay',
        invoicing: 'Invoicing',
        CPACard: 'CPA Card',
        payroll: 'Payroll',
        travel: 'Travel',
        resources: 'Resources',
        expensifyApproved: 'ExpensifyApproved!',
        pressKit: 'Press Kit',
        support: 'Support',
        expensifyHelp: 'ExpensifyHelp',
        terms: 'Terms of Service',
        privacy: 'Privacy',
        learnMore: 'Learn More',
        aboutExpensify: 'About Expensify',
        blog: 'Blog',
        jobs: 'Jobs',
        expensifyOrg: 'Expensify.org',
        investorRelations: 'Investor Relations',
        getStarted: 'Get Started',
        createAccount: 'Create A New Account',
        logIn: 'Log In',
    },
    allStates: COMMON_CONST.STATES as States,
    allCountries: CONST.ALL_COUNTRIES as AllCountries,
    accessibilityHints: {
        navigateToChatsList: 'Navigate back to chats list',
        chatWelcomeMessage: 'Chat welcome message',
        navigatesToChat: 'Navigates to a chat',
        newMessageLineIndicator: 'New message line indicator',
        chatMessage: 'Chat message',
        lastChatMessagePreview: 'Last chat message preview',
        workspaceName: 'Workspace name',
        chatUserDisplayNames: 'Chat member display names',
        scrollToNewestMessages: 'Scroll to newest messages',
        preStyledText: 'Pre-styled text',
        viewAttachment: 'View attachment',
    },
    parentReportAction: {
        deletedReport: 'Deleted report',
        deletedMessage: 'Deleted message',
        deletedExpense: 'Deleted expense',
        reversedTransaction: 'Reversed transaction',
        deletedTask: 'Deleted task',
        hiddenMessage: 'Hidden message',
    },
    threads: {
        thread: 'Thread',
        replies: 'Replies',
        reply: 'Reply',
        from: 'From',
        in: 'in',
        parentNavigationSummary: ({reportName, workspaceName}: ParentNavigationSummaryParams) => `From ${reportName}${workspaceName ? ` in ${workspaceName}` : ''}`,
    },
    qrCodes: {
        copy: 'Copy URL',
        copied: 'Copied!',
    },
    moderation: {
        flagDescription: 'All flagged messages will be sent to a moderator for review.',
        chooseAReason: 'Choose a reason for flagging below:',
        spam: 'Spam',
        spamDescription: 'Unsolicited off-topic promotion',
        inconsiderate: 'Inconsiderate',
        inconsiderateDescription: 'Insulting or disrespectful phrasing, with questionable intentions',
        intimidation: 'Intimidation',
        intimidationDescription: 'Aggressively pursuing an agenda over valid objections',
        bullying: 'Bullying',
        bullyingDescription: 'Targeting an individual to obtain obedience',
        harassment: 'Harassment',
        harassmentDescription: 'Racist, misogynistic, or other broadly discriminatory behavior',
        assault: 'Assault',
        assaultDescription: 'Specifically targeted emotional attack with the intention of harm',
        flaggedContent: 'This message has been flagged as violating our community rules and the content has been hidden.',
        hideMessage: 'Hide message',
        revealMessage: 'Reveal message',
        levelOneResult: 'Sends anonymous warning and message is reported for review.',
        levelTwoResult: 'Message hidden from channel, plus anonymous warning and message is reported for review.',
        levelThreeResult: 'Message removed from channel plus anonymous warning and message is reported for review.',
    },
    actionableMentionWhisperOptions: {
        inviteToSubmitExpense: 'Invite to submit expenses',
        inviteToChat: 'Invite to chat only',
        nothing: 'Do nothing',
    },
    actionableMentionJoinWorkspaceOptions: {
        accept: 'Accept',
        decline: 'Decline',
    },
    actionableMentionTrackExpense: {
        submit: 'Submit it to someone',
        categorize: 'Categorize it',
        share: 'Share it with my accountant',
        nothing: 'Nothing for now',
    },
    teachersUnitePage: {
        teachersUnite: 'Teachers Unite',
        joinExpensifyOrg:
            'Join Expensify.org in eliminating injustice around the world. The current "Teachers Unite" campaign supports educators everywhere by splitting the costs of essential school supplies.',
        iKnowATeacher: 'I know a teacher',
        iAmATeacher: 'I am a teacher',
        getInTouch: 'Excellent! Please share their information so we can get in touch with them.',
        introSchoolPrincipal: 'Intro to your school principal',
        schoolPrincipalVerifyExpense:
            'Expensify.org splits the cost of essential school supplies so that students from low-income households can have a better learning experience. Your principal will be asked to verify your expenses.',
        principalFirstName: 'Principal first name',
        principalLastName: 'Principal last name',
        principalWorkEmail: 'Principal work email',
        updateYourEmail: 'Update your email address',
        updateEmail: 'Update email address',
        schoolMailAsDefault: (contactMethodsRoute: string) =>
            `Before you move forward, please make sure to set your school email as your default contact method. You can do so in Settings > Profile > <a href="${contactMethodsRoute}">Contact methods</a>.`,
        error: {
            enterPhoneEmail: 'Enter a valid email or phone number',
            enterEmail: 'Enter an email',
            enterValidEmail: 'Enter a valid email',
            tryDifferentEmail: 'Please try a different email',
        },
    },
    cardTransactions: {
        notActivated: 'Not activated',
        outOfPocket: 'Out-of-pocket spend',
        companySpend: 'Company spend',
    },
    distance: {
        addStop: 'Add stop',
        deleteWaypoint: 'Delete waypoint',
        deleteWaypointConfirmation: 'Are you sure you want to delete this waypoint?',
        address: 'Address',
        waypointDescription: {
            start: 'Start',
            stop: 'Stop',
        },
        mapPending: {
            title: 'Map pending',
            subtitle: 'The map will be generated when you go back online',
            onlineSubtitle: 'One moment while we set up the map',
            errorTitle: 'Map error',
            errorSubtitle: 'There was an error loading the map. Please try again.',
        },
        error: {
            selectSuggestedAddress: 'Please select a suggested address or use current location',
        },
        odometer: {
            startReading: 'Start reading',
            endReading: 'End reading',
            saveForLater: 'Save for later',
            totalDistance: 'Total distance',
        },
    },
    gps: {
        disclaimer: 'Use GPS to create an expense from your journey. Tap Start below to begin tracking.',
        error: {
            failedToStart: 'Failed to start location tracking.',
            failedToGetPermissions: 'Failed to get required location permissions.',
        },
        trackingDistance: 'Tracking distance...',
        stopped: 'Stopped',
        start: 'Start',
        stop: 'Stop',
        discard: 'Discard',
        stopGpsTrackingModal: {
            title: 'Stop GPS tracking',
            prompt: 'Are you sure? This will end your current journey.',
            cancel: 'Resume tracking',
            confirm: 'Stop GPS tracking',
        },
        discardDistanceTrackingModal: {
            title: 'Discard distance tracking',
            prompt: "Are you sure? This will discard your current journey and can't be undone.",
            confirm: 'Discard distance tracking',
        },
        zeroDistanceTripModal: {
            title: "Can't create expense",
            prompt: "You can't create an expense with the same start and stop location.",
        },
        locationRequiredModal: {
            title: 'Location access required',
            prompt: 'Please allow location access in your device settings to start GPS distance tracking.',
            allow: 'Allow',
        },
        androidBackgroundLocationRequiredModal: {
            title: 'Background location access required',
            prompt: 'Please allow background location access in your device settings ("Allow all the time" option) to start GPS distance tracking.',
        },
        preciseLocationRequiredModal: {
            title: 'Precise location required',
            prompt: 'Please enable "precise location" in your device settings to start GPS distance tracking.',
        },
        desktop: {
            title: 'Track distance on your phone',
            subtitle: 'Log miles or kilometers automatically with GPS and turn trips into expenses instantly.',
            button: 'Download the app',
        },
        notification: {
            title: 'GPS tracking in progress',
            body: 'Go to the app to finish',
        },
        signOutWarningTripInProgress: {
            title: 'GPS tracking in progress',
            prompt: 'Are you sure you want to discard the trip and sign out?',
            confirm: 'Discard and sign out',
        },
        locationServicesRequiredModal: {
            title: 'Location access required',
            confirm: 'Open settings',
            prompt: 'Please allow location access in your device settings to start GPS distance tracking.',
        },
        fabGpsTripExplained: 'Go to GPS screen (Floating action)',
    },
    reportCardLostOrDamaged: {
        screenTitle: 'Report card lost or damaged',
        nextButtonLabel: 'Next',
        reasonTitle: 'Why do you need a new card?',
        cardDamaged: 'My card was damaged',
        cardLostOrStolen: 'My card was lost or stolen',
        confirmAddressTitle: 'Please confirm the mailing address for your new card.',
        cardDamagedInfo: 'Your new card will arrive in 2-3 business days. Your current card will continue to work until you activate your new one.',
        cardLostOrStolenInfo: 'Your current card will be permanently deactivated as soon as your order is placed. Most cards arrive in a few business days.',
        address: 'Address',
        deactivateCardButton: 'Deactivate card',
        shipNewCardButton: 'Ship new card',
        addressError: 'Address is required',
        reasonError: 'Reason is required',
        successTitle: 'Your new card is on the way!',
        successDescription: "You'll need to activate it once it arrives in a few business days. In the meantime, you can use a virtual card.",
    },
    eReceipt: {
        guaranteed: 'Guaranteed eReceipt',
        transactionDate: 'Transaction date',
    },
    referralProgram: {
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.START_CHAT]: {
            buttonText: 'Start a chat, <success><strong>refer a friend</strong></success>.',
            header: 'Start a chat, refer a friend',
            body: "Want your friends to use Expensify, too? Just start a chat with them and we'll take care of the rest.",
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SUBMIT_EXPENSE]: {
            buttonText: 'Submit an expense, <success><strong>refer your team</strong></success>.',
            header: 'Submit an expense, refer your team',
            body: "Want your team to use Expensify, too? Just submit an expense to them and we'll take care of the rest.",
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.REFER_FRIEND]: {
            header: 'Refer a friend',
            body: "Want your friends to use Expensify, too? Just chat, pay, or split an expense with them and we'll take care of the rest. Or just share your invite link!",
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SHARE_CODE]: {
            buttonText: 'Refer a friend',
            header: 'Refer a friend',
            body: "Want your friends to use Expensify, too? Just chat, pay, or split an expense with them and we'll take care of the rest. Or just share your invite link!",
        },
        copyReferralLink: 'Copy invite link',
    },
    systemChatFooterMessage: {
        [CONST.INTRO_CHOICES.MANAGE_TEAM]: ({adminReportName, href}: {adminReportName: string; href: string}) =>
            `Chat with your setup specialist in <a href="${href}">${adminReportName}</a> for help`,
        default: `Message <concierge-link>${CONST.CONCIERGE_CHAT_NAME}</concierge-link> for help with setup`,
    },
    violations: {
        allTagLevelsRequired: 'All tags required',
        autoReportedRejectedExpense: 'This expense was rejected.',
        billableExpense: 'Billable no longer valid',
        cashExpenseWithNoReceipt: ({formattedLimit}: ViolationsCashExpenseWithNoReceiptParams = {}) => `Receipt required${formattedLimit ? ` over ${formattedLimit}` : ''}`,
        categoryOutOfPolicy: 'Category no longer valid',
        conversionSurcharge: ({surcharge}: ViolationsConversionSurchargeParams) => `Applied ${surcharge}% conversion surcharge`,
        customUnitOutOfPolicy: 'Rate not valid for this workspace',
        duplicatedTransaction: 'Potential duplicate',
        fieldRequired: 'Report fields are required',
        futureDate: 'Future date not allowed',
        invoiceMarkup: ({invoiceMarkup}: ViolationsInvoiceMarkupParams) => `Marked up by ${invoiceMarkup}%`,
        maxAge: ({maxAge}: ViolationsMaxAgeParams) => `Date older than ${maxAge} days`,
        missingCategory: 'Missing category',
        missingComment: 'Description required for selected category',
        missingAttendees: 'Multiple attendees required for this category',
        missingTag: ({tagName}: ViolationsMissingTagParams = {}) => `Missing ${tagName ?? 'tag'}`,
        modifiedAmount: ({type, displayPercentVariance}: ViolationsModifiedAmountParams) => {
            switch (type) {
                case 'distance':
                    return 'Amount differs from calculated distance';
                case 'card':
                    return 'Amount greater than card transaction';
                default:
                    if (displayPercentVariance) {
                        return `Amount ${displayPercentVariance}% greater than scanned receipt`;
                    }
                    return 'Amount greater than scanned receipt';
            }
        },
        modifiedDate: 'Date differs from scanned receipt',
        nonExpensiworksExpense: 'Non-Expensiworks expense',
        overAutoApprovalLimit: ({formattedLimit}: ViolationsOverLimitParams) => `Expense exceeds auto-approval limit of ${formattedLimit}`,
        overCategoryLimit: ({formattedLimit}: ViolationsOverCategoryLimitParams) => `Amount over ${formattedLimit}/person category limit`,
        overLimit: ({formattedLimit}: ViolationsOverLimitParams) => `Amount over ${formattedLimit}/person limit`,
        overTripLimit: ({formattedLimit}: ViolationsOverLimitParams) => `Amount over ${formattedLimit}/trip limit`,
        overLimitAttendee: ({formattedLimit}: ViolationsOverLimitParams) => `Amount over ${formattedLimit}/person limit`,
        perDayLimit: ({formattedLimit}: ViolationsPerDayLimitParams) => `Amount over daily ${formattedLimit}/person category limit`,
        receiptNotSmartScanned: 'Receipt and expense details added manually.',
        receiptRequired: ({formattedLimit, category}: ViolationsReceiptRequiredParams) => {
            if (formattedLimit && category) {
                return `Receipt required over ${formattedLimit} category limit`;
            }

            if (formattedLimit) {
                return `Receipt required over ${formattedLimit}`;
            }

            if (category) {
                return `Receipt required over category limit`;
            }

            return 'Receipt required';
        },
        itemizedReceiptRequired: ({formattedLimit}: {formattedLimit?: string}) => `Itemized receipt required${formattedLimit ? ` over ${formattedLimit}` : ''}`,
        prohibitedExpense: ({prohibitedExpenseTypes}: ViolationsProhibitedExpenseParams) => {
            const preMessage = 'Prohibited expense:';
            const getProhibitedExpenseTypeText = (prohibitedExpenseType: string) => {
                switch (prohibitedExpenseType) {
                    case 'alcohol':
                        return `alcohol`;
                    case 'gambling':
                        return `gambling`;
                    case 'tobacco':
                        return `tobacco`;
                    case 'adultEntertainment':
                        return `adult entertainment`;
                    case 'hotelIncidentals':
                        return `hotel incidentals`;
                    default:
                        return `${prohibitedExpenseType}`;
                }
            };
            let types: string[] = [];
            if (Array.isArray(prohibitedExpenseTypes)) {
                types = prohibitedExpenseTypes;
            } else if (prohibitedExpenseTypes) {
                types = [prohibitedExpenseTypes];
            }
            if (types.length === 0) {
                return preMessage;
            }
            return `${preMessage} ${types.map(getProhibitedExpenseTypeText).join(', ')}`;
        },
        customRules: ({message}: ViolationsCustomRulesParams) => message,
        reviewRequired: 'Review required',
        rter: ({brokenBankConnection, isAdmin, isTransactionOlderThan7Days, member, rterType, companyCardPageURL}: ViolationsRterParams) => {
            if (rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION_530) {
                return "Can't auto-match receipt due to broken bank connection";
            }
            if (brokenBankConnection || rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION) {
                return isAdmin
                    ? `Bank connection broken. <a href="${companyCardPageURL}">Reconnect to match receipt</a>`
                    : 'Bank connection broken. Ask an admin to reconnect to match receipt.';
            }
            if (!isTransactionOlderThan7Days) {
                return isAdmin ? `Ask ${member} to mark as a cash or wait 7 days and try again` : 'Awaiting merge with card transaction.';
            }

            return '';
        },
        brokenConnection530Error: 'Receipt pending due to broken bank connection',
        adminBrokenConnectionError: ({workspaceCompanyCardRoute}: {workspaceCompanyCardRoute: string}) =>
            `<muted-text-label>Receipt pending due to broken bank connection. Please resolve in <a href="${workspaceCompanyCardRoute}">Company cards</a>.</muted-text-label>`,
        memberBrokenConnectionError: 'Receipt pending due to broken bank connection. Please ask a workspace admin to resolve.',
        markAsCashToIgnore: 'Mark as cash to ignore and request payment.',
        smartscanFailed: ({canEdit = true}) => `Receipt scanning failed.${canEdit ? ' Enter details manually.' : ''}`,
        receiptGeneratedWithAI: 'Potential AI-generated receipt',
        someTagLevelsRequired: ({tagName}: ViolationsTagOutOfPolicyParams = {}) => `Missing ${tagName ?? 'Tag'}`,
        tagOutOfPolicy: ({tagName}: ViolationsTagOutOfPolicyParams = {}) => `${tagName ?? 'Tag'} no longer valid`,
        taxAmountChanged: 'Tax amount was modified',
        taxOutOfPolicy: ({taxName}: ViolationsTaxOutOfPolicyParams = {}) => `${taxName ?? 'Tax'} no longer valid`,
        taxRateChanged: 'Tax rate was modified',
        taxRequired: 'Missing tax rate',
        none: 'None',
        taxCodeToKeep: 'Choose which tax code to keep',
        tagToKeep: 'Choose which tag to keep',
        isTransactionReimbursable: 'Choose if transaction is reimbursable',
        merchantToKeep: 'Choose which merchant to keep',
        descriptionToKeep: 'Choose which description to keep',
        categoryToKeep: 'Choose which category to keep',
        isTransactionBillable: 'Choose if transaction is billable',
        keepThisOne: 'Keep this one',
        confirmDetails: `Confirm the details you're keeping`,
        confirmDuplicatesInfo: `The duplicates you don't keep will be held for the submitter to delete.`,
        hold: 'This expense was put on hold',
        resolvedDuplicates: 'resolved the duplicate',
        companyCardRequired: 'Company card purchases required',
        noRoute: 'Please select a valid address',
    },
    reportViolations: {
        [CONST.REPORT_VIOLATIONS.FIELD_REQUIRED]: ({fieldName}: RequiredFieldParams) => `${fieldName} is required`,
        reportContainsExpensesWithViolations: 'Report contains expenses with violations.',
    },
    violationDismissal: {
        rter: {
            manual: 'marked this receipt as cash',
        },
        duplicatedTransaction: {
            manual: 'resolved the duplicate',
        },
    },
    videoPlayer: {
        play: 'Play',
        pause: 'Pause',
        fullscreen: 'Fullscreen',
        playbackSpeed: 'Playback speed',
        expand: 'Expand',
        mute: 'Mute',
        unmute: 'Unmute',
        normal: 'Normal',
    },
    exitSurvey: {
        header: 'Before you go',
        reasonPage: {
            title: "Please tell us why you're leaving",
            subtitle: 'Before you go, please tell us why you’d like to switch to Expensify Classic.',
        },
        reasons: {
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]: "I need a feature that's only available in Expensify Classic.",
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]: "I don't understand how to use New Expensify.",
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]: 'I understand how to use New Expensify, but I prefer Expensify Classic.',
        },
        prompts: {
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]: "What feature do you need that isn't available in New Expensify?",
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]: 'What are you trying to do?',
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]: 'Why do you prefer Expensify Classic?',
        },
        responsePlaceholder: 'Your response',
        thankYou: 'Thanks for the feedback!',
        thankYouSubtitle: 'Your responses will help us build a better product to get stuff done. Thank you so much!',
        goToExpensifyClassic: 'Switch to Expensify Classic',
        offlineTitle: "Looks like you're stuck here...",
        offline:
            "You appear to be offline. Unfortunately, Expensify Classic doesn't work offline, but New Expensify does. If you prefer to use Expensify Classic, try again when you have an internet connection.",
        quickTip: 'Quick tip...',
        quickTipSubTitle: 'You can go straight to Expensify Classic by visiting expensify.com. Bookmark it for an easy shortcut!',
        bookACall: 'Book a call',
        bookACallTitle: 'Would you like to speak to a product manager?',
        benefits: {
            [CONST.EXIT_SURVEY.BENEFIT.CHATTING_DIRECTLY]: 'Chatting directly on expenses and reports',
            [CONST.EXIT_SURVEY.BENEFIT.EVERYTHING_MOBILE]: 'Ability to do everything on mobile',
            [CONST.EXIT_SURVEY.BENEFIT.TRAVEL_EXPENSE]: 'Travel and expense at the speed of chat',
        },
        bookACallTextTop: 'By switching to Expensify Classic, you will miss out on:',
        bookACallTextBottom: 'We’d be excited to get on a call with you to understand why. You can book a call with one of our senior product managers to discuss your needs.',
        takeMeToExpensifyClassic: 'Take me to Expensify Classic',
    },
    listBoundary: {
        errorMessage: 'An error occurred while loading more messages',
        tryAgain: 'Try again',
    },
    systemMessage: {
        mergedWithCashTransaction: 'matched a receipt to this transaction',
    },
    subscription: {
        authenticatePaymentCard: 'Authenticate payment card',
        mobileReducedFunctionalityMessage: 'You can’t make changes to your subscription in the mobile app.',
        badge: {
            freeTrial: (numOfDays: number) => `Free trial: ${numOfDays} ${numOfDays === 1 ? 'day' : 'days'} left`,
        },
        billingBanner: {
            policyOwnerAmountOwed: {
                title: 'Your payment info is outdated',
                subtitle: (date: string) => `Update your payment card by ${date} to continue using all of your favorite features.`,
            },
            policyOwnerAmountOwedOverdue: {
                title: 'Your payment could not be processed',
                subtitle: (date?: string, purchaseAmountOwed?: string) =>
                    date && purchaseAmountOwed
                        ? `Your ${date} charge of ${purchaseAmountOwed} could not be processed. Please add a payment card to clear the amount owed.`
                        : 'Please add a payment card to clear the amount owed.',
            },
            policyOwnerUnderInvoicing: {
                title: 'Your payment info is outdated',
                subtitle: (date: string) => `Your payment is past due. Please pay your invoice by ${date} to avoid service interruption.`,
            },
            policyOwnerUnderInvoicingOverdue: {
                title: 'Your payment info is outdated',
                subtitle: 'Your payment is past due. Please pay your invoice.',
            },
            billingDisputePending: {
                title: 'Your card couldn’t be charged',
                subtitle: (amountOwed: number, cardEnding: string) =>
                    `You disputed the ${amountOwed} charge on the card ending in ${cardEnding}. Your account will be locked until the dispute is resolved with your bank.`,
            },
            cardAuthenticationRequired: {
                title: 'Your payment card hasn’t been fully authenticated.',
                subtitle: (cardEnding: string) => `Please complete the authentication process to activate your payment card ending in ${cardEnding}.`,
            },
            insufficientFunds: {
                title: 'Your card couldn’t be charged',
                subtitle: (amountOwed: number) =>
                    `Your payment card was declined due to insufficient funds. Please retry or add a new payment card to clear your ${amountOwed} outstanding balance.`,
            },
            cardExpired: {
                title: 'Your card couldn’t be charged',
                subtitle: (amountOwed: number) => `Your payment card expired. Please add a new payment card to clear your ${amountOwed} outstanding balance.`,
            },
            cardExpireSoon: {
                title: 'Your card is expiring soon',
                subtitle: 'Your payment card will expire at the end of this month. Click the three-dot menu below to update it and continue using all your favorite features.',
            },
            retryBillingSuccess: {
                title: 'Success!',
                subtitle: 'Your card has been billed successfully.',
            },
            retryBillingError: {
                title: 'Your card couldn’t be charged',
                subtitle: 'Before retrying, please call your bank directly to authorize Expensify charges and remove any holds. Otherwise, try adding a different payment card.',
            },
            cardOnDispute: (amountOwed: string, cardEnding: string) =>
                `You disputed the ${amountOwed} charge on the card ending in ${cardEnding}. Your account will be locked until the dispute is resolved with your bank.`,
            preTrial: {
                title: 'Start a free trial',
                subtitle: 'As a next step, <a href="#">complete your setup checklist</a> so your team can start expensing.',
            },
            trialStarted: {
                title: ({numOfDays}: TrialStartedTitleParams) => `Trial: ${numOfDays} ${numOfDays === 1 ? 'day' : 'days'} left!`,
                subtitle: 'Add a payment card to continue using all of your favorite features.',
            },
            trialEnded: {
                title: 'Your free trial has ended',
                subtitle: 'Add a payment card to continue using all of your favorite features.',
            },
            earlyDiscount: {
                claimOffer: 'Claim offer',
                subscriptionPageTitle: (discountType: number) => `<strong>${discountType}% off your first year!</strong> Just add a payment card and start an annual subscription.`,
                onboardingChatTitle: (discountType: number) => `Limited-time offer: ${discountType}% off your first year!`,
                subtitle: (days: number, hours: number, minutes: number, seconds: number) => `Claim within ${days > 0 ? `${days}d : ` : ''}${hours}h : ${minutes}m : ${seconds}s`,
            },
        },
        cardSection: {
            title: 'Payment',
            subtitle: 'Add a card to pay for your Expensify subscription.',
            addCardButton: 'Add payment card',
            cardInfo: (name: string, expiration: string, currency: string) => `Name: ${name}, Expiration: ${expiration}, Currency: ${currency}`,
            cardNextPayment: (nextPaymentDate: string) => `Your next payment date is ${nextPaymentDate}.`,
            cardEnding: (cardNumber: string) => `Card ending in ${cardNumber}`,
            changeCard: 'Change payment card',
            changeCurrency: 'Change payment currency',
            cardNotFound: 'No payment card added',
            retryPaymentButton: 'Retry payment',
            authenticatePayment: 'Authenticate payment',
            requestRefund: 'Request refund',
            requestRefundModal: {
                full: 'Getting a refund is easy, just downgrade your account before your next billing date and you’ll receive a refund. <br /> <br /> Heads up: Downgrading your account means your workspace(s) will be deleted. This action can’t be undone, but you can always create a new workspace if you change your mind.',
                confirm: 'Delete workspace(s) and downgrade',
            },
            viewPaymentHistory: 'View payment history',
        },
        yourPlan: {
            title: 'Your plan',
            exploreAllPlans: 'Explore all plans',
            customPricing: 'Custom pricing',
            asLowAs: ({price}: YourPlanPriceValueParams) => `as low as ${price} per active member/month`,
            pricePerMemberMonth: ({price}: YourPlanPriceValueParams) => `${price} per member/month`,
            pricePerMemberPerMonth: ({price}: YourPlanPriceValueParams) => `${price} per member per month`,
            perMemberMonth: 'per member/month',
            collect: {
                title: 'Collect',
                description: 'The small business plan that gives you expense, travel, and chat.',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) => `From ${lower}/active member with the Expensify Card, ${upper}/active member without the Expensify Card.`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) => `From ${lower}/active member with the Expensify Card, ${upper}/active member without the Expensify Card.`,
                benefit1: 'Receipt scanning',
                benefit2: 'Reimbursements',
                benefit3: 'Corporate card management',
                benefit4: 'Expense and travel approvals',
                benefit5: 'Travel booking and rules',
                benefit6: 'QuickBooks/Xero integrations',
                benefit7: 'Chat on expenses, reports, and rooms',
                benefit8: 'AI and human support',
            },
            control: {
                title: 'Control',
                description: 'Expense, travel, and chat for larger businesses.',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) => `From ${lower}/active member with the Expensify Card, ${upper}/active member without the Expensify Card.`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) => `From ${lower}/active member with the Expensify Card, ${upper}/active member without the Expensify Card.`,
                benefit1: 'Everything in the Collect plan',
                benefit2: 'Multi-level approval workflows',
                benefit3: 'Custom expense rules',
                benefit4: 'ERP integrations (NetSuite, Sage Intacct, Oracle)',
                benefit5: 'HR integrations (Workday, Certinia)',
                benefit6: 'SAML/SSO',
                benefit7: 'Custom insights and reporting',
                benefit8: 'Budgeting',
            },
            thisIsYourCurrentPlan: 'This is your current plan',
            downgrade: 'Downgrade to Collect',
            upgrade: 'Upgrade to Control',
            addMembers: 'Add members',
            saveWithExpensifyTitle: 'Save with the Expensify Card',
            saveWithExpensifyDescription: 'Use our savings calculator to see how cash back from the Expensify Card can reduce your Expensify bill.',
            saveWithExpensifyButton: 'Learn more',
        },
        compareModal: {
            comparePlans: 'Compare Plans',
            subtitle: `<muted-text>Unlock the features you need with the plan that’s right for you. <a href="${CONST.PRICING}">View our pricing page</a> or a complete feature breakdown of each of our plans.</muted-text>`,
        },
        details: {
            title: 'Subscription details',
            annual: 'Annual subscription',
            taxExempt: 'Request tax exempt status',
            taxExemptEnabled: 'Tax exempt',
            taxExemptStatus: 'Tax exempt status',
            payPerUse: 'Pay-per-use',
            subscriptionSize: 'Subscription size',
            headsUp:
                "Heads up: If you don’t set your subscription size now, we’ll set it automatically to your first month's active member count. You’ll then be committed to paying for at least this number of members for the next 12 months. You can increase your subscription size at any time, but you can’t decrease it until your subscription is over.",
            zeroCommitment: 'Zero commitment at the discounted annual subscription rate',
        },
        subscriptionSize: {
            title: 'Subscription size',
            yourSize: 'Your subscription size is the number of open seats that can be filled by any active member in a given month.',
            eachMonth:
                'Each month, your subscription covers up to the number of active members set above. Any time you increase your subscription size, you’ll start a new 12-month subscription at that new size.',
            note: 'Note: An active member is anyone who has created, edited, submitted, approved, reimbursed, or exported expense data tied to your company workspace.',
            confirmDetails: 'Confirm your new annual subscription details:',
            subscriptionSize: 'Subscription size',
            activeMembers: ({size}: SubscriptionSizeParams) => `${size} active members/month`,
            subscriptionRenews: 'Subscription renews',
            youCantDowngrade: 'You can’t downgrade during your annual subscription.',
            youAlreadyCommitted: ({size, date}: SubscriptionCommitmentParams) =>
                `You already committed to an annual subscription size of ${size} active members per month until ${date}. You can switch to a pay-per-use subscription on ${date} by disabling auto-renew.`,
            error: {
                size: 'Please enter a valid subscription size',
                sameSize: 'Please enter a number different than your current subscription size',
            },
        },
        paymentCard: {
            addPaymentCard: 'Add payment card',
            enterPaymentCardDetails: 'Enter your payment card details',
            security: 'Expensify is PCI-DSS compliant, uses bank-level encryption, and utilizes redundant infrastructure to protect your data.',
            learnMoreAboutSecurity: 'Learn more about our security.',
        },
        subscriptionSettings: {
            title: 'Subscription settings',
            summary: ({subscriptionType, subscriptionSize, autoRenew, autoIncrease}: SubscriptionSettingsSummaryParams) =>
                `Subscription type: ${subscriptionType}, Subscription size: ${subscriptionSize}, Auto renew: ${autoRenew}, Auto increase annual seats: ${autoIncrease}`,
            none: 'none',
            on: 'on',
            off: 'off',
            annual: 'Annual',
            autoRenew: 'Auto-renew',
            autoIncrease: 'Auto-increase annual seats',
            saveUpTo: ({amountWithCurrency}: SubscriptionSettingsSaveUpToParams) => `Save up to ${amountWithCurrency}/month per active member`,
            automaticallyIncrease:
                'Automatically increase your annual seats to accommodate for active members that exceed your subscription size. Note: This will extend your annual subscription end date.',
            disableAutoRenew: 'Disable auto-renew',
            helpUsImprove: 'Help us improve Expensify',
            whatsMainReason: "What's the main reason you're disabling auto-renew?",
            renewsOn: ({date}: SubscriptionSettingsRenewsOnParams) => `Renews on ${date}.`,
            pricingConfiguration: 'Pricing depends on configuration. For the lowest price, choose an annual subscription and get the Expensify Card.',
            learnMore: ({hasAdminsRoom}: SubscriptionSettingsLearnMoreParams) =>
                `<muted-text>Learn more on our <a href="${CONST.PRICING}">pricing page</a> or chat with our team in your ${hasAdminsRoom ? `<a href="adminsRoom">#admins room.</a>` : '#admins room.'}</muted-text>`,
            estimatedPrice: 'Estimated price',
            changesBasedOn: 'This changes based on your Expensify Card usage and the subscription options below.',
        },
        requestEarlyCancellation: {
            title: 'Request early cancellation',
            subtitle: 'What’s the main reason you’re requesting early cancellation?',
            subscriptionCanceled: {
                title: 'Subscription canceled',
                subtitle: 'Your annual subscription has been canceled.',
                info: 'If you want to keep using your workspace(s) on a pay-per-use basis, you’re all set.',
                preventFutureActivity: ({workspacesListRoute}: WorkspacesListRouteParams) =>
                    `If you'd like to prevent future activity and charges, you must <a href="${workspacesListRoute}">delete your workspace(s)</a>. Note that when you delete your workspace(s), you'll be charged for any outstanding activity that was incurred during the current calendar month.`,
            },
            requestSubmitted: {
                title: 'Request submitted',
                subtitle:
                    'Thanks for letting us know you’re interested in canceling your subscription. We’re reviewing your request and will be in touch soon via your chat with <concierge-link>Concierge</concierge-link>.',
            },
            acknowledgement: `By requesting early cancellation, I acknowledge and agree that Expensify has no obligation to grant such request under the Expensify <a href=${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}>Terms of Service</a>  or other applicable services agreement between me and Expensify and that Expensify retains sole discretion with regard to granting any such request.`,
        },
    },
    feedbackSurvey: {
        tooLimited: 'Functionality needs improvement',
        tooExpensive: 'Too expensive',
        inadequateSupport: 'Inadequate customer support',
        businessClosing: 'Company closing, downsizing, or acquired',
        additionalInfoTitle: 'What software are you moving to and why?',
        additionalInfoInputLabel: 'Your response',
    },
    roomChangeLog: {
        updateRoomDescription: 'set the room description to:',
        clearRoomDescription: 'cleared the room description',
        changedRoomAvatar: 'changed the room avatar',
        removedRoomAvatar: 'removed the room avatar',
    },
    delegate: {
        switchAccount: 'Switch accounts:',
        copilotDelegatedAccess: 'Copilot: Delegated access',
        copilotDelegatedAccessDescription: 'Allow other members to access your account.',
        addCopilot: 'Add copilot',
        membersCanAccessYourAccount: 'These members can access your account:',
        youCanAccessTheseAccounts: 'You can access these accounts via the account switcher:',
        role: ({role}: OptionalParam<DelegateRoleParams> = {}) => {
            switch (role) {
                case CONST.DELEGATE_ROLE.ALL:
                    return 'Full';
                case CONST.DELEGATE_ROLE.SUBMITTER:
                    return 'Limited';
                default:
                    return '';
            }
        },
        genericError: 'Oops, something went wrong. Please try again.',
        onBehalfOfMessage: (delegator: string) => `on behalf of ${delegator}`,
        accessLevel: 'Access level',
        confirmCopilot: 'Confirm your copilot below.',
        accessLevelDescription: 'Choose an access level below. Both Full and Limited access allow copilots to view all conversations and expenses.',
        roleDescription: ({role}: OptionalParam<DelegateRoleParams> = {}) => {
            switch (role) {
                case CONST.DELEGATE_ROLE.ALL:
                    return 'Allow another member to take all actions in your account, on your behalf. Includes chat, submissions, approvals, payments, settings updates, and more.';
                case CONST.DELEGATE_ROLE.SUBMITTER:
                    return 'Allow another member to take most actions in your account, on your behalf. Excludes approvals, payments, rejections, and holds.';
                default:
                    return '';
            }
        },
        removeCopilot: 'Remove copilot',
        removeCopilotConfirmation: 'Are you sure you want to remove this copilot?',
        changeAccessLevel: 'Change access level',
        makeSureItIsYou: "Let's make sure it's you",
        enterMagicCode: (contactMethod: string) => `Please enter the magic code sent to ${contactMethod} to add a copilot. It should arrive within a minute or two.`,
        enterMagicCodeUpdate: (contactMethod: string) => `Please enter the magic code sent to ${contactMethod} to update your copilot.`,
        notAllowed: 'Not so fast...',
        noAccessMessage: dedent(`
            As a copilot, you don't have access to
            this page. Sorry!
        `),
        notAllowedMessage: (accountOwnerEmail: string) =>
            `As a <a href="${CONST.DELEGATE_ROLE_HELP_DOT_ARTICLE_LINK}">copilot</a> for ${accountOwnerEmail}, you don't have permission to take this action. Sorry!`,
        copilotAccess: 'Copilot access',
    },
    debug: {
        debug: 'Debug',
        details: 'Details',
        JSON: 'JSON',
        reportActions: 'Actions',
        reportActionPreview: 'Preview',
        nothingToPreview: 'Nothing to preview',
        editJson: 'Edit JSON:',
        preview: 'Preview:',
        missingProperty: ({propertyName}: MissingPropertyParams) => `Missing ${propertyName}`,
        invalidProperty: ({propertyName, expectedType}: InvalidPropertyParams) => `Invalid property: ${propertyName} - Expected: ${expectedType}`,
        invalidValue: ({expectedValues}: InvalidValueParams) => `Invalid value - Expected: ${expectedValues}`,
        missingValue: 'Missing value',
        createReportAction: 'Create Report Action',
        reportAction: 'Report Action',
        report: 'Report',
        transaction: 'Transaction',
        violations: 'Violations',
        transactionViolation: 'Transaction Violation',
        hint: "Data changes won't be sent to the backend",
        textFields: 'Text fields',
        numberFields: 'Number fields',
        booleanFields: 'Boolean fields',
        constantFields: 'Constant fields',
        dateTimeFields: 'DateTime fields',
        date: 'Date',
        time: 'Time',
        none: 'None',
        visibleInLHN: 'Visible in LHN',
        GBR: 'GBR',
        RBR: 'RBR',
        true: 'true',
        false: 'false',
        viewReport: 'View Report',
        viewTransaction: 'View transaction',
        createTransactionViolation: 'Create transaction violation',
        reasonVisibleInLHN: {
            hasDraftComment: 'Has draft comment',
            hasGBR: 'Has GBR',
            hasRBR: 'Has RBR',
            pinnedByUser: 'Pinned by member',
            hasIOUViolations: 'Has IOU violations',
            hasAddWorkspaceRoomErrors: 'Has add workspace room errors',
            isUnread: 'Is unread (focus mode)',
            isArchived: 'Is archived (most recent mode)',
            isSelfDM: 'Is self DM',
            isFocused: 'Is temporarily focused',
        },
        reasonGBR: {
            hasJoinRequest: 'Has join request (admin room)',
            isUnreadWithMention: 'Is unread with mention',
            isWaitingForAssigneeToCompleteAction: 'Is waiting for assignee to complete action',
            hasChildReportAwaitingAction: 'Has child report awaiting action',
            hasMissingInvoiceBankAccount: 'Has missing invoice bank account',
            hasUnresolvedCardFraudAlert: 'Has unresolved card fraud alert',
        },
        reasonRBR: {
            hasErrors: 'Has errors in report or report actions data',
            hasViolations: 'Has violations',
            hasTransactionThreadViolations: 'Has transaction thread violations',
        },
        indicatorStatus: {
            theresAReportAwaitingAction: "There's a report awaiting action",
            theresAReportWithErrors: "There's a report with errors",
            theresAWorkspaceWithCustomUnitsErrors: "There's a workspace with custom units errors",
            theresAProblemWithAWorkspaceMember: "There's a problem with a workspace member",
            theresAProblemWithAWorkspaceQBOExport: 'There was a problem with a workspace connection export setting.',
            theresAProblemWithAContactMethod: "There's a problem with a contact method",
            aContactMethodRequiresVerification: 'A contact method requires verification',
            theresAProblemWithAPaymentMethod: "There's a problem with a payment method",
            theresAProblemWithAWorkspace: "There's a problem with a workspace",
            theresAProblemWithYourReimbursementAccount: "There's a problem with your reimbursement account",
            theresABillingProblemWithYourSubscription: "There's a billing problem with your subscription",
            yourSubscriptionHasBeenSuccessfullyRenewed: 'Your subscription has been successfully renewed',
            theresWasAProblemDuringAWorkspaceConnectionSync: 'There was a problem during a workspace connection sync',
            theresAProblemWithYourWallet: "There's a problem with your wallet",
            theresAProblemWithYourWalletTerms: "There's a problem with your wallet terms",
        },
    },
    emptySearchView: {
        takeATestDrive: 'Take a test drive',
    },
    migratedUserWelcomeModal: {
        title: 'Welcome to New Expensify!',
        subtitle: "It's got everything you love from our classic experience with a whole bunch of upgrades to make your life even easier:",
        confirmText: "Let's go!",
        helpText: 'Try 2-min demo',
        features: {
            search: 'More powerful search on mobile, web, and desktop',
            concierge: 'Built-in Concierge AI to help automate your expenses',
            chat: 'Chat on any expense to resolve questions quickly',
        },
    },
    productTrainingTooltip: {
        // TODO: CONCIERGE_LHN_GBR tooltip will be replaced by a tooltip in the #admins room
        // https://github.com/Expensify/App/issues/57045#issuecomment-2701455668
        conciergeLHNGBR: '<tooltip>Get started <strong>here!</strong></tooltip>',
        saveSearchTooltip: '<tooltip><strong>Rename your saved searches</strong> here!</tooltip>',
        accountSwitcher: '<tooltip>Access your <strong>Copilot accounts</strong> here</tooltip>',
        scanTestTooltip: {
            main: '<tooltip><strong>Scan our test receipt</strong> to see how it works!</tooltip>',
            manager: '<tooltip>Choose our <strong>test manager</strong> to try it out!</tooltip>',
            confirmation: '<tooltip>Now, <strong>submit your expense</strong> and watch the\nmagic happen!</tooltip>',
            tryItOut: 'Try it out',
        },
        outstandingFilter: '<tooltip>Filter for expenses\nthat <strong>need approval</strong></tooltip>',
        scanTestDriveTooltip: '<tooltip>Send this receipt to\n<strong>complete the test drive!</strong></tooltip>',
        gpsTooltip: "<tooltip>GPS tracking in progress! When you're done, stop tracking below.</tooltip>",
    },
    discardChangesConfirmation: {
        title: 'Discard changes?',
        body: 'Are you sure you want to discard the changes you made?',
        confirmText: 'Discard changes',
    },
    scheduledCall: {
        book: {
            title: 'Schedule call',
            description: 'Find a time that works for you.',
            slots: ({date}: {date: string}) => `<muted-text>Available times for <strong>${date}</strong></muted-text>`,
        },
        confirmation: {
            title: 'Confirm call',
            description: "Make sure the details below look good to you. Once you confirm the call, we'll send an invite with more info.",
            setupSpecialist: 'Your setup specialist',
            meetingLength: 'Meeting length',
            dateTime: 'Date & time',
            minutes: '30 minutes',
        },
        callScheduled: 'Call scheduled',
    },
    autoSubmitModal: {
        title: 'All clear and submitted!',
        description: 'All warnings and violations has been cleared so:',
        submittedExpensesTitle: 'These expenses have been submitted',
        submittedExpensesDescription: 'These expenses have been sent to your approver but can still be edited until they are approved.',
        pendingExpensesTitle: 'Pending expenses have been moved',
        pendingExpensesDescription: 'Any pending card expenses have been moved to a separate report until they post.',
    },
    testDrive: {
        quickAction: {
            takeATwoMinuteTestDrive: 'Take a 2-minute test drive',
        },
        modal: {
            title: 'Take us for a test drive',
            description: 'Take a quick product tour to get up to speed fast.',
            confirmText: 'Start test drive',
            helpText: 'Skip',
            employee: {
                description: '<muted-text>Get your team <strong>3 free months of Expensify!</strong> Just enter your boss’s email below and send them a test expense.</muted-text>',
                email: "Enter your boss's email",
                error: 'That member owns a workspace, please input a new member to test.',
            },
        },
        banner: {
            currentlyTestDrivingExpensify: "You're currently test driving Expensify",
            readyForTheRealThing: 'Ready for the real thing?',
            getStarted: 'Get started',
        },
        employeeInviteMessage: (name: string) =>
            `# ${name} invited you to test drive Expensify\nHey! I just got us *3 months free* to test drive Expensify, the fastest way to do expenses.\n\nHere’s a *test receipt* to show you how it works:`,
    },
    export: {
        basicExport: 'Basic export',
        reportLevelExport: 'All Data - report level',
        expenseLevelExport: 'All Data - expense level',
        exportInProgress: 'Export in progress',
        conciergeWillSend: 'Concierge will send you the file shortly.',
    },
    domain: {
        notVerified: 'Not verified',
        retry: 'Retry',
        verifyDomain: {
            title: 'Verify domain',
            beforeProceeding: ({domainName}: {domainName: string}) => `Before proceeding, verify that you own <strong>${domainName}</strong> by updating its DNS settings.`,
            accessYourDNS: ({domainName}: {domainName: string}) => `Access your DNS provider and open DNS settings for <strong>${domainName}</strong>.`,
            addTXTRecord: 'Add the following TXT record:',
            saveChanges: 'Save changes and return here to verify your domain.',
            youMayNeedToConsult: `You may need to consult your organization's IT department to complete verification. <a href="${CONST.DOMAIN_VERIFICATION_HELP_URL}">Learn more</a>.`,
            warning: 'After verification, all Expensify members on your domain will receive an email that their account will be managed under your domain.',
            codeFetchError: 'Couldn’t fetch verification code',
            genericError: "We couldn't verify your domain. Please try again and reach out to Concierge if the problem persists.",
        },
        domainVerified: {
            title: 'Domain verified',
            header: 'Wooo! Your domain has been verified',
            description: ({domainName}: {domainName: string}) =>
                `<muted-text><centered-text>The domain <strong>${domainName}</strong> has been successfully verified and you can now set up SAML and other security features.</centered-text></muted-text>`,
        },
        saml: 'SAML',
        samlFeatureList: {
            title: 'SAML Single Sign-On (SSO)',
            subtitle: ({domainName}: {domainName: string}) =>
                `<muted-text><a href="${CONST.SAML_HELP_URL}">SAML SSO</a> is a security feature that gives you more control over how members with <strong>${domainName}</strong> emails log into Expensify. To enable it, you'll need to verify yourself as an authorized company admin.</muted-text>`,
            fasterAndEasierLogin: 'Faster and easier login',
            moreSecurityAndControl: 'More security and control',
            onePasswordForAnything: 'One password for everything',
        },
        goToDomain: 'Go to domain',
        samlLogin: {
            title: 'SAML login',
            subtitle: `<muted-text>Configure member sign-in with <a href="${CONST.SAML_HELP_URL}">SAML Single Sign-On (SSO).</a></muted-text>`,
            enableSamlLogin: 'Enable SAML login',
            allowMembers: 'Allow members to log in with SAML.',
            requireSamlLogin: 'Require SAML login',
            anyMemberWillBeRequired: 'Any member signed in with a different method will be required to re-authenticate using SAML.',
            enableError: "Couldn't update SAML enablement setting",
            requireError: "Couldn't update SAML requirement setting",
            disableSamlRequired: 'Disable SAML required',
            oktaWarningPrompt: 'Are you sure? This will also disable Okta SCIM.',
            requireWithEmptyMetadataError: 'Please add Identity Provider metadata below to enable',
        },
        samlConfigurationDetails: {
            title: 'SAML configuration details',
            subtitle: 'Use these details to get SAML set up.',
            identityProviderMetadata: 'Identity Provider Metadata',
            entityID: 'Entity ID',
            nameIDFormat: 'Name ID Format',
            loginUrl: 'Login URL',
            acsUrl: 'ACS (Assertion Consumer Service) URL',
            logoutUrl: 'Logout URL',
            sloUrl: 'SLO (Single Logout) URL',
            serviceProviderMetaData: 'Service Provider MetaData',
            oktaScimToken: 'Okta SCIM Token',
            revealToken: 'Reveal token',
            fetchError: "Couldn't fetch SAML configuration details",
            setMetadataGenericError: "Couldn't set SAML MetaData",
        },
        accessRestricted: {
            title: 'Access restricted',
            subtitle: (domainName: string) => `Please verify yourself as an authorized company administrator for <strong>${domainName}</strong> if you need control over:`,
            companyCardManagement: 'Company card management',
            accountCreationAndDeletion: 'Account creation and deletion',
            workspaceCreation: 'Workspace creation',
            samlSSO: 'SAML SSO',
        },
        addDomain: {
            title: 'Add domain',
            subtitle: 'Enter the name of the private domain you want to access (e.g. expensify.com).',
            domainName: 'Domain name',
            newDomain: 'New domain',
        },
        domainAdded: {
            title: 'Domain added',
            description: "Next, you'll need to verify ownership of the domain and adjust your security settings.",
            configure: 'Configure',
        },
        enhancedSecurity: {
            title: 'Enhanced security',
            subtitle: 'Require members on your domain to log in via single sign-on, restrict workspace creation, and more.',
            enable: 'Enable',
        },
        domainAdmins: 'Domain admins',
        admins: {
            title: 'Admins',
            findAdmin: 'Find admin',
            primaryContact: 'Primary contact',
            addPrimaryContact: 'Add primary contact',
            setPrimaryContactError: 'Unable to set primary contact. Please try again later.',
            settings: 'Settings',
            consolidatedDomainBilling: 'Consolidated domain billing',
            consolidatedDomainBillingDescription: (domainName: string) =>
                `<comment><muted-text-label>When enabled, the primary contact will pay for all workspaces owned by <strong>${domainName}</strong> members and receive all billing receipts.</muted-text-label></comment>`,
            consolidatedDomainBillingError: "Consolidated domain billing couldn't be changed. Please try again later.",
            addAdmin: 'Add admin',
            addAdminError: 'Unable to add this member as an admin. Please try again.',
            revokeAdminAccess: 'Revoke admin access',
            cantRevokeAdminAccess: "Can't revoke admin access from the technical contact",
            error: {
                removeAdmin: 'Unable to remove this user as an Admin. Please try again.',
                removeDomain: 'Unable to remove this domain. Please try again.',
                removeDomainNameInvalid: 'Please enter your domain name to reset it.',
            },
            resetDomain: 'Reset domain',
            resetDomainExplanation: ({domainName}: {domainName?: string}) => `Please type <strong>${domainName}</strong> to confirm the domain reset.`,
            enterDomainName: 'Enter your domain name here',
            resetDomainInfo: `This action is <strong>permanent</strong> and the following data will be deleted: <br/> <ul><li>Company card connections and any unreported expenses from those cards</li> <li>SAML and group settings</li> </ul> All accounts, workspaces, reports, expenses, and other data will remain. <br/><br/>Note: You can clear this domain from your domains list by removing the associated email from your <a href="#">contact methods</a>.`,
        },
        members: {
            title: 'Members',
            findMember: 'Find member',
            addMember: 'Add member',
            email: 'Email address',
            errors: {
                addMember: 'Unable to add this member. Please try again.',
            },
        },
    },
};

// IMPORTANT: This line is manually replaced in generate translation files by scripts/generateTranslations.ts,
// so if you change it here, please update it there as well.
export default translations satisfies TranslationDeepObject<typeof translations>;
